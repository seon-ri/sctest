const express = require('express');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const { Test, TestResult } = require('../models/Test');

const router = express.Router();

// 대시보드 통계 조회
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // 사용자 통계
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const newUsersToday = await User.countDocuments({
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
        });

        // 게시글 통계
        const totalPosts = await Post.countDocuments({ isDeleted: false });
        const postsToday = await Post.countDocuments({
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
            isDeleted: false
        });

        // 검사 통계
        const totalTests = await Test.countDocuments({ isActive: true });
        const totalTestResults = await TestResult.countDocuments({ isCompleted: true });
        const testResultsToday = await TestResult.countDocuments({
            completedAt: { $gte: new Date().setHours(0, 0, 0, 0) },
            isCompleted: true
        });

        // 최근 활동
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('username name email createdAt');

        const recentPosts = await Post.find({ isDeleted: false })
            .populate('author', 'username name')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title category createdAt');

        const recentTestResults = await TestResult.find({ isCompleted: true })
            .populate('testId', 'title')
            .sort({ completedAt: -1 })
            .limit(5)
            .select('completedAt timeSpent');

        res.json({
            success: true,
            data: {
                statistics: {
                    users: {
                        total: totalUsers,
                        active: activeUsers,
                        newToday: newUsersToday
                    },
                    posts: {
                        total: totalPosts,
                        newToday: postsToday
                    },
                    tests: {
                        total: totalTests,
                        totalResults: totalTestResults,
                        resultsToday: testResultsToday
                    }
                },
                recentActivity: {
                    users: recentUsers,
                    posts: recentPosts,
                    testResults: recentTestResults
                }
            }
        });

    } catch (error) {
        console.error('대시보드 통계 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 사용자 관리
router.get('/users', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const role = req.query.role;
        const isActive = req.query.isActive;
        const skip = (page - 1) * limit;

        // 검색 조건 구성
        const searchCondition = {};
        
        if (search) {
            searchCondition.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            searchCondition.role = role;
        }

        if (isActive !== undefined) {
            searchCondition.isActive = isActive === 'true';
        }

        const users = await User.find(searchCondition)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments(searchCondition);
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('사용자 관리 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 게시글 관리
router.get('/posts', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category;
        const status = req.query.status;
        const search = req.query.search;
        const skip = (page - 1) * limit;

        // 검색 조건 구성
        const searchCondition = {};
        
        if (category) {
            searchCondition.category = category;
        }

        if (status) {
            searchCondition.status = status;
        }

        if (search) {
            searchCondition.$text = { $search: search };
        }

        const posts = await Post.find(searchCondition)
            .populate('author', 'username name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments(searchCondition);
        const totalPages = Math.ceil(totalPosts / limit);

        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalPosts,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('게시글 관리 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 검사 관리
router.get('/tests', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category;
        const isActive = req.query.isActive;
        const skip = (page - 1) * limit;

        // 검색 조건 구성
        const searchCondition = {};
        
        if (category) {
            searchCondition.category = category;
        }

        if (isActive !== undefined) {
            searchCondition.isActive = isActive === 'true';
        }

        const tests = await Test.find(searchCondition)
            .select('-questions -resultInterpretation')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalTests = await Test.countDocuments(searchCondition);
        const totalPages = Math.ceil(totalTests / limit);

        res.json({
            success: true,
            data: {
                tests,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalTests,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('검사 관리 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 게시글 상태 변경
router.patch('/posts/:postId/status', adminAuth, async (req, res) => {
    try {
        const { postId } = req.params;
        const { status } = req.body;

        if (!['draft', 'published', 'archived'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 상태입니다.'
            });
        }

        const post = await Post.findByIdAndUpdate(
            postId,
            { status },
            { new: true }
        ).populate('author', 'username name');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '게시글 상태가 변경되었습니다.',
            data: { post }
        });

    } catch (error) {
        console.error('게시글 상태 변경 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 게시글 고정/해제
router.patch('/posts/:postId/pin', adminAuth, async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: '게시글을 찾을 수 없습니다.'
            });
        }

        post.isPinned = !post.isPinned;
        await post.save();

        res.json({
            success: true,
            message: `게시글이 ${post.isPinned ? '고정' : '해제'}되었습니다.`,
            data: { isPinned: post.isPinned }
        });

    } catch (error) {
        console.error('게시글 고정/해제 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 검사 활성화/비활성화
router.patch('/tests/:testId/toggle', adminAuth, async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({
                success: false,
                message: '검사를 찾을 수 없습니다.'
            });
        }

        test.isActive = !test.isActive;
        await test.save();

        res.json({
            success: true,
            message: `검사가 ${test.isActive ? '활성화' : '비활성화'}되었습니다.`,
            data: { isActive: test.isActive }
        });

    } catch (error) {
        console.error('검사 활성화/비활성화 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 시스템 통계
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const period = req.query.period || '30'; // 기본 30일
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 사용자 통계
        const newUsers = await User.countDocuments({
            createdAt: { $gte: startDate }
        });

        const activeUsers = await User.countDocuments({
            lastLogin: { $gte: startDate }
        });

        // 게시글 통계
        const newPosts = await Post.countDocuments({
            createdAt: { $gte: startDate },
            isDeleted: false
        });

        const totalViews = await Post.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$viewCount' }
                }
            }
        ]);

        // 검사 통계
        const testResults = await TestResult.countDocuments({
            completedAt: { $gte: startDate },
            isCompleted: true
        });

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

        // 일별 통계
        const dailyStats = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));

            const dayUsers = await User.countDocuments({
                createdAt: { $gte: dayStart, $lte: dayEnd }
            });

            const dayPosts = await Post.countDocuments({
                createdAt: { $gte: dayStart, $lte: dayEnd },
                isDeleted: false
            });

            const dayTests = await TestResult.countDocuments({
                completedAt: { $gte: dayStart, $lte: dayEnd },
                isCompleted: true
            });

            dailyStats.unshift({
                date: dayStart.toISOString().split('T')[0],
                users: dayUsers,
                posts: dayPosts,
                tests: dayTests
            });
        }

        res.json({
            success: true,
            data: {
                period: `${days}일`,
                summary: {
                    newUsers,
                    activeUsers,
                    newPosts,
                    totalViews: totalViews[0]?.totalViews || 0,
                    testResults,
                    avgCompletionTime: Math.round((avgCompletionTime[0]?.avgTime || 0) / 60) // 분 단위
                },
                dailyStats
            }
        });

    } catch (error) {
        console.error('시스템 통계 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

module.exports = router; 