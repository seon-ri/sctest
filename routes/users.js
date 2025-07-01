const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// 사용자 프로필 조회
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('프로필 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 사용자 프로필 수정
router.put('/profile', auth, [
    body('name')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('이름은 1-50자 사이여야 합니다.')
        .trim(),
    body('phone')
        .optional()
        .matches(/^[0-9-+()\s]+$/)
        .withMessage('유효한 전화번호를 입력해주세요.'),
    body('profile.bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('자기소개는 최대 500자까지 가능합니다.'),
    body('profile.birthDate')
        .optional()
        .isISO8601()
        .withMessage('유효한 날짜를 입력해주세요.'),
    body('profile.gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('유효하지 않은 성별입니다.'),
    body('preferences.emailNotifications')
        .optional()
        .isBoolean()
        .withMessage('이메일 알림 설정은 boolean 값이어야 합니다.'),
    body('preferences.pushNotifications')
        .optional()
        .isBoolean()
        .withMessage('푸시 알림 설정은 boolean 값이어야 합니다.')
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

        const updateData = req.body;
        
        // 비밀번호 변경은 별도 엔드포인트에서 처리
        delete updateData.password;
        delete updateData.email;
        delete updateData.username;
        delete updateData.role;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: '프로필이 수정되었습니다.',
            data: { user }
        });

    } catch (error) {
        console.error('프로필 수정 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 비밀번호 변경
router.put('/change-password', auth, [
    body('currentPassword')
        .notEmpty()
        .withMessage('현재 비밀번호를 입력해주세요.'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('새 비밀번호는 최소 8자 이상이어야 합니다.')
        .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .withMessage('새 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '비밀번호 형식을 확인해주세요.',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        // 현재 비밀번호 확인
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: '현재 비밀번호가 올바르지 않습니다.'
            });
        }

        // 새 비밀번호 설정
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: '비밀번호가 변경되었습니다.'
        });

    } catch (error) {
        console.error('비밀번호 변경 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 계정 탈퇴
router.delete('/account', auth, [
    body('password')
        .notEmpty()
        .withMessage('비밀번호를 입력해주세요.')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '비밀번호를 입력해주세요.'
            });
        }

        const { password } = req.body;

        const user = await User.findById(req.user.userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        // 비밀번호 확인
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: '비밀번호가 올바르지 않습니다.'
            });
        }

        // 계정 비활성화 (소프트 삭제)
        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: '계정이 탈퇴되었습니다.'
        });

    } catch (error) {
        console.error('계정 탈퇴 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 관리자: 사용자 목록 조회
router.get('/admin', adminAuth, async (req, res) => {
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
        console.error('사용자 목록 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 관리자: 사용자 상세 조회
router.get('/admin/:userId', adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('사용자 상세 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 관리자: 사용자 정보 수정
router.put('/admin/:userId', adminAuth, [
    body('role')
        .optional()
        .isIn(['user', 'admin', 'moderator'])
        .withMessage('유효하지 않은 역할입니다.'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('활성화 상태는 boolean 값이어야 합니다.')
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

        const { userId } = req.params;
        const updateData = req.body;

        // 비밀번호 변경은 별도 처리
        delete updateData.password;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '사용자 정보가 수정되었습니다.',
            data: { user }
        });

    } catch (error) {
        console.error('사용자 정보 수정 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 관리자: 사용자 계정 활성화/비활성화
router.patch('/admin/:userId/toggle-status', adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `사용자가 ${user.isActive ? '활성화' : '비활성화'}되었습니다.`,
            data: { isActive: user.isActive }
        });

    } catch (error) {
        console.error('사용자 상태 변경 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

module.exports = router; 