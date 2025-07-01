const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Test, TestResult } = require('../models/Test');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 검사 목록 조회
router.get('/', [
    query('category').optional().isString().withMessage('카테고리는 문자열이어야 합니다.'),
    query('page').optional().isInt({ min: 1 }).withMessage('페이지는 1 이상이어야 합니다.'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('한 페이지당 검사 수는 1-20개여야 합니다.')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '잘못된 요청입니다.',
                errors: errors.array()
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const skip = (page - 1) * limit;

        // 검색 조건 구성
        const searchCondition = {
            isActive: true,
            isPublic: true
        };

        if (category) {
            searchCondition.category = category;
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
        console.error('검사 목록 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 검사 상세 정보 조회
router.get('/:testId', async (req, res) => {
    try {
        const { testId } = req.params;

        const test = await Test.findOne({
            _id: testId,
            isActive: true,
            isPublic: true
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: '검사를 찾을 수 없습니다.'
            });
        }

        // 결과 해석 정보는 제외
        const testData = test.toObject();
        delete testData.resultInterpretation;

        res.json({
            success: true,
            data: { test: testData }
        });

    } catch (error) {
        console.error('검사 상세 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 검사 시작
router.post('/:testId/start', async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.user?.userId;
        const sessionId = req.body.sessionId || require('crypto').randomBytes(32).toString('hex');

        const test = await Test.findOne({
            _id: testId,
            isActive: true,
            isPublic: true
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: '검사를 찾을 수 없습니다.'
            });
        }

        // 로그인 필요 검사인 경우
        if (test.requiresLogin && !userId) {
            return res.status(401).json({
                success: false,
                message: '이 검사는 로그인이 필요합니다.'
            });
        }

        // 기존 진행 중인 검사 확인
        const existingResult = await TestResult.findOne({
            testId,
            userId: userId || null,
            sessionId: userId ? null : sessionId,
            isCompleted: false
        });

        if (existingResult) {
            return res.json({
                success: true,
                message: '진행 중인 검사가 있습니다.',
                data: {
                    resultId: existingResult._id,
                    sessionId: existingResult.sessionId,
                    startTime: existingResult.createdAt
                }
            });
        }

        // 새 검사 결과 생성
        const testResult = new TestResult({
            testId,
            userId,
            sessionId,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        await testResult.save();

        res.status(201).json({
            success: true,
            message: '검사가 시작되었습니다.',
            data: {
                resultId: testResult._id,
                sessionId: testResult.sessionId,
                startTime: testResult.createdAt,
                test: {
                    id: test._id,
                    title: test.title,
                    description: test.description,
                    instructions: test.instructions,
                    estimatedTime: test.estimatedTime,
                    questions: test.questions
                }
            }
        });

    } catch (error) {
        console.error('검사 시작 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 검사 답변 제출
router.post('/:testId/submit', [
    body('resultId').notEmpty().withMessage('결과 ID가 필요합니다.'),
    body('sessionId').notEmpty().withMessage('세션 ID가 필요합니다.'),
    body('answers').isArray().withMessage('답변은 배열 형태여야 합니다.')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 정보를 확인해주세요.',
                errors: errors.array()
            });
        }

        const { testId } = req.params;
        const { resultId, sessionId, answers } = req.body;
        const userId = req.user?.userId;

        // 검사 결과 조회
        const testResult = await TestResult.findOne({
            _id: resultId,
            testId,
            userId: userId || null,
            sessionId: userId ? null : sessionId,
            isCompleted: false
        });

        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: '진행 중인 검사를 찾을 수 없습니다.'
            });
        }

        // 검사 정보 조회
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({
                success: false,
                message: '검사를 찾을 수 없습니다.'
            });
        }

        // 답변 저장
        testResult.answers = answers;
        testResult.isCompleted = true;
        testResult.completedAt = new Date();
        testResult.timeSpent = Math.floor((Date.now() - testResult.createdAt.getTime()) / 1000);

        // 점수 계산
        const { scores, result } = test.calculateScores(answers);
        testResult.scores = scores;
        testResult.result = result;

        await testResult.save();

        // 검사 통계 업데이트
        await test.updateStatistics(testResult);

        res.json({
            success: true,
            message: '검사가 완료되었습니다.',
            data: {
                resultId: testResult._id,
                scores,
                result,
                timeSpent: testResult.timeSpent,
                completedAt: testResult.completedAt
            }
        });

    } catch (error) {
        console.error('검사 제출 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 검사 결과 조회
router.get('/:testId/results/:resultId', async (req, res) => {
    try {
        const { testId, resultId } = req.params;
        const userId = req.user?.userId;

        const testResult = await TestResult.findOne({
            _id: resultId,
            testId,
            userId: userId || null
        });

        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: '검사 결과를 찾을 수 없습니다.'
            });
        }

        // 검사 정보 조회
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({
                success: false,
                message: '검사를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: {
                result: testResult,
                test: {
                    id: test._id,
                    title: test.title,
                    description: test.description
                }
            }
        });

    } catch (error) {
        console.error('검사 결과 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 사용자 검사 결과 목록 조회
router.get('/results', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const results = await TestResult.find({
            userId: req.user.userId,
            isCompleted: true
        })
        .populate('testId', 'title description category')
        .sort({ completedAt: -1 })
        .skip(skip)
        .limit(limit);

        const totalResults = await TestResult.countDocuments({
            userId: req.user.userId,
            isCompleted: true
        });
        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            success: true,
            data: {
                results,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalResults,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('사용자 검사 결과 목록 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 검사 통계 조회 (관리자용)
router.get('/:testId/stats', auth, async (req, res) => {
    try {
        const { testId } = req.params;

        // 관리자 권한 확인
        const user = await require('../models/User').findById(req.user.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: '관리자 권한이 필요합니다.'
            });
        }

        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({
                success: false,
                message: '검사를 찾을 수 없습니다.'
            });
        }

        // 최근 30일간의 결과 통계
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentResults = await TestResult.find({
            testId,
            isCompleted: true,
            completedAt: { $gte: thirtyDaysAgo }
        });

        // 일별 통계
        const dailyStats = {};
        recentResults.forEach(result => {
            const date = result.completedAt.toISOString().split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { count: 0, avgTime: 0, totalTime: 0 };
            }
            dailyStats[date].count++;
            dailyStats[date].totalTime += result.timeSpent;
            dailyStats[date].avgTime = dailyStats[date].totalTime / dailyStats[date].count;
        });

        res.json({
            success: true,
            data: {
                test: {
                    id: test._id,
                    title: test.title,
                    statistics: test.statistics
                },
                recentStats: {
                    totalAttempts: recentResults.length,
                    dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
                        date,
                        count: stats.count,
                        avgTime: Math.round(stats.avgTime / 60) // 분 단위로 변환
                    }))
                }
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

module.exports = router; 