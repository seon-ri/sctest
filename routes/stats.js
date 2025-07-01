const express = require('express');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const { Test, TestResult } = require('../models/Test');

const router = express.Router();

// 전체 통계 조회
router.get('/overview', adminAuth, async (req, res) => {
    try {
        // 사용자 통계
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
        
        // 역할별 사용자 수
        const userRoles = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 게시글 통계
        const totalPosts = await Post.countDocuments({ isDeleted: false });
        const publishedPosts = await Post.countDocuments({ 
            isDeleted: false, 
            status: 'published' 
        });
        
        // 카테고리별 게시글 수
        const postCategories = await Post.aggregate([
            {
                $match: { isDeleted: false }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 검사 통계
        const totalTests = await Test.countDocuments({ isActive: true });
        const totalTestResults = await TestResult.countDocuments({ isCompleted: true });
        
        // 카테고리별 검사 수
        const testCategories = await Test.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    verified: verifiedUsers,
                    roles: userRoles
                },
                posts: {
                    total: totalPosts,
                    published: publishedPosts,
                    categories: postCategories
                },
                tests: {
                    total: totalTests,
                    totalResults: totalTestResults,
                    categories: testCategories
                }
            }
        });

    } catch (error) {
        console.error('전체 통계 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 사용자 통계
router.get('/users', adminAuth, async (req, res) => {
    try {
        const period = req.query.period || '30';
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 가입자 추이
        const signupTrend = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // 역할별 분포
        const roleDistribution = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 이메일 인증 상태
        const emailVerificationStatus = await User.aggregate([
            {
                $group: {
                    _id: '$isEmailVerified',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 최근 로그인 사용자
        const recentLogins = await User.countDocuments({
            lastLogin: { $gte: startDate }
        });

        res.json({
            success: true,
            data: {
                period: `${days}일`,
                signupTrend,
                roleDistribution,
                emailVerificationStatus,
                recentLogins
            }
        });

    } catch (error) {
        console.error('사용자 통계 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 게시글 통계
router.get('/posts', adminAuth, async (req, res) => {
    try {
        const period = req.query.period || '30';
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 게시글 작성 추이
        const postTrend = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // 카테고리별 통계
        const categoryStats = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalViews: { $sum: '$viewCount' },
                    totalLikes: { $sum: '$likeCount' },
                    totalComments: { $sum: '$commentCount' }
                }
            }
        ]);

        // 인기 게시글 (조회수 기준)
        const popularPosts = await Post.find({
            isDeleted: false,
            status: 'published'
        })
        .populate('author', 'username name')
        .sort({ viewCount: -1 })
        .limit(10)
        .select('title viewCount likeCount commentCount createdAt');

        // 총 조회수
        const totalViews = await Post.aggregate([
            {
                $match: { isDeleted: false }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$viewCount' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                period: `${days}일`,
                postTrend,
                categoryStats,
                popularPosts,
                totalViews: totalViews[0]?.totalViews || 0
            }
        });

    } catch (error) {
        console.error('게시글 통계 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 검사 통계
router.get('/tests', adminAuth, async (req, res) => {
    try {
        const period = req.query.period || '30';
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 검사 응시 추이
        const testTrend = await TestResult.aggregate([
            {
                $match: {
                    completedAt: { $gte: startDate },
                    isCompleted: true
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$completedAt' },
                        month: { $month: '$completedAt' },
                        day: { $dayOfMonth: '$completedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // 검사별 통계
        const testStats = await TestResult.aggregate([
            {
                $match: {
                    completedAt: { $gte: startDate },
                    isCompleted: true
                }
            },
            {
                $lookup: {
                    from: 'tests',
                    localField: 'testId',
                    foreignField: '_id',
                    as: 'test'
                }
            },
            {
                $unwind: '$test'
            },
            {
                $group: {
                    _id: '$testId',
                    testTitle: { $first: '$test.title' },
                    testCategory: { $first: '$test.category' },
                    count: { $sum: 1 },
                    avgTime: { $avg: '$timeSpent' },
                    completionRate: { $sum: 1 }
                }
            }
        ]);

        // 카테고리별 검사 통계
        const categoryStats = await TestResult.aggregate([
            {
                $match: {
                    completedAt: { $gte: startDate },
                    isCompleted: true
                }
            },
            {
                $lookup: {
                    from: 'tests',
                    localField: 'testId',
                    foreignField: '_id',
                    as: 'test'
                }
            },
            {
                $unwind: '$test'
            },
            {
                $group: {
                    _id: '$test.category',
                    count: { $sum: 1 },
                    avgTime: { $avg: '$timeSpent' }
                }
            }
        ]);

        // 평균 완료 시간
        const avgCompletionTime = await TestResult.aggregate([
            {
                $match: {
                    completedAt: { $gte: startDate },
                    isCompleted: true
                }
            },
            {
                $group: {
                    _id: null,
                    avgTime: { $avg: '$timeSpent' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                period: `${days}일`,
                testTrend,
                testStats,
                categoryStats,
                avgCompletionTime: Math.round((avgCompletionTime[0]?.avgTime || 0) / 60) // 분 단위
            }
        });

    } catch (error) {
        console.error('검사 통계 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 실시간 통계
router.get('/realtime', adminAuth, async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // 오늘의 통계
        const todayStats = {
            newUsers: await User.countDocuments({ createdAt: { $gte: today } }),
            newPosts: await Post.countDocuments({ 
                createdAt: { $gte: today }, 
                isDeleted: false 
            }),
            testResults: await TestResult.countDocuments({ 
                completedAt: { $gte: today }, 
                isCompleted: true 
            })
        };

        // 어제의 통계
        const yesterdayStats = {
            newUsers: await User.countDocuments({ 
                createdAt: { $gte: yesterday, $lt: today } 
            }),
            newPosts: await Post.countDocuments({ 
                createdAt: { $gte: yesterday, $lt: today }, 
                isDeleted: false 
            }),
            testResults: await TestResult.countDocuments({ 
                completedAt: { $gte: yesterday, $lt: today }, 
                isCompleted: true 
            })
        };

        // 변화율 계산
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const changes = {
            users: calculateChange(todayStats.newUsers, yesterdayStats.newUsers),
            posts: calculateChange(todayStats.newPosts, yesterdayStats.newPosts),
            tests: calculateChange(todayStats.testResults, yesterdayStats.testResults)
        };

        res.json({
            success: true,
            data: {
                today: todayStats,
                yesterday: yesterdayStats,
                changes
            }
        });

    } catch (error) {
        console.error('실시간 통계 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

module.exports = router; 