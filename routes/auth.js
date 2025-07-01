const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
// const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { auth } = require('../middleware/auth');

const router = express.Router();

// JWT 토큰 생성 함수
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// 회원가입
router.post('/register', [
    body('username')
        .isLength({ min: 2, max: 20 })
        .withMessage('사용자명은 2-20자 사이여야 합니다.')
        .matches(/^[a-zA-Z0-9가-힣_]+$/)
        .withMessage('사용자명은 영문, 숫자, 한글, 언더스코어만 사용 가능합니다.'),
    body('email')
        .isEmail()
        .withMessage('유효한 이메일 주소를 입력해주세요.')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
        .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .withMessage('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'),
    body('name')
        .isLength({ min: 1, max: 50 })
        .withMessage('이름은 1-50자 사이여야 합니다.')
        .trim(),
    body('phone')
        .optional()
        .matches(/^[0-9-+()\s]+$/)
        .withMessage('유효한 전화번호를 입력해주세요.')
], async (req, res) => {
    try {
        // 유효성 검사
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 정보를 확인해주세요.',
                errors: errors.array()
            });
        }

        const { username, email, password, name, phone } = req.body;

        // 중복 확인
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email 
                    ? '이미 사용 중인 이메일입니다.' 
                    : '이미 사용 중인 사용자명입니다.'
            });
        }

        // 사용자 생성
        const user = new User({
            username,
            email,
            password,
            name,
            phone
        });

        // 이메일 인증 토큰 생성
        const verificationToken = user.createEmailVerificationToken();
        await user.save();

        // 이메일 인증 메일 발송
        /*
        try {
            await sendVerificationEmail(user.email, verificationToken, user.name);
        } catch (emailError) {
            console.error('이메일 발송 실패:', emailError);
            // 이메일 발송 실패해도 회원가입은 성공으로 처리
        }
        */

        // JWT 토큰 생성
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다. 이메일 인증을 완료해주세요.',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    isEmailVerified: user.isEmailVerified
                },
                token
            }
        });

    } catch (error) {
        console.error('회원가입 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 로그인
router.post('/login', [
    body('identifier')
        .notEmpty()
        .withMessage('이메일 또는 사용자명을 입력해주세요.'),
    body('password')
        .notEmpty()
        .withMessage('비밀번호를 입력해주세요.')
], async (req, res) => {
    try {
        // 유효성 검사
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 정보를 확인해주세요.',
                errors: errors.array()
            });
        }

        const { identifier, password } = req.body;

        // 사용자 찾기 (이메일 또는 사용자명으로)
        const user = await User.findOne({
            $or: [
                { email: identifier.toLowerCase() },
                { username: identifier }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 계정 잠금 확인
        if (user.isLocked) {
            return res.status(423).json({
                success: false,
                message: '계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.'
            });
        }

        // 비밀번호 확인
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await user.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 계정 활성화 확인
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: '비활성화된 계정입니다. 관리자에게 문의하세요.'
            });
        }

        // 로그인 성공 시 시도 횟수 초기화
        await user.resetLoginAttempts();
        
        // 마지막 로그인 시간 업데이트
        user.lastLogin = new Date();
        await user.save();

        // JWT 토큰 생성
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: '로그인되었습니다.',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                token
            }
        });

    } catch (error) {
        console.error('로그인 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 이메일 인증
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않거나 만료된 인증 토큰입니다.'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: '이메일 인증이 완료되었습니다.'
        });

    } catch (error) {
        console.error('이메일 인증 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 비밀번호 재설정 요청
/*
router.post('/forgot-password', [
    body('email').isEmail().withMessage('유효한 이메일을 입력해주세요.')
], async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: '등록되지 않은 이메일입니다.' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // 비밀번호 재설정 이메일 발송
        
        try {
            await sendPasswordResetEmail(user.email, resetToken, user.name);
            res.json({ success: true, message: '비밀번호 재설정 링크를 이메일로 발송했습니다.' });
        } catch (emailError) {
            console.error('비밀번호 재설정 이메일 발송 실패:', emailError);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({ success: false, message: '이메일 발송에 실패했습니다. 나중에 다시 시도해주세요.' });
        }
        
       res.status(500).json({ success: false, message: '현재 비밀번호 재설정은 지원되지 않습니다.' });

    } catch (error) {
        console.error('비밀번호 찾기 에러:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});
*/

// 비밀번호 재설정
/*
router.post('/reset-password/:token', [
    body('password')
        .isLength({ min: 8 })
        .withMessage('비밀번호는 최소 8자 이상이어야 합니다.')
        .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
        .withMessage('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.')
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

        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않거나 만료된 토큰입니다.'
            });
        }

        // 새 비밀번호 설정
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: '비밀번호가 성공적으로 변경되었습니다.'
        });

    } catch (error) {
        console.error('비밀번호 재설정 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});
*/

// 현재 사용자 정보 조회
router.get('/me', auth, async (req, res) => {
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
        console.error('사용자 정보 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', auth, (req, res) => {
    res.json({
        success: true,
        message: '로그아웃되었습니다.'
    });
});

// 토큰 갱신
router.post('/refresh', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 사용자입니다.'
            });
        }

        const newToken = generateToken(user._id);

        res.json({
            success: true,
            data: { token: newToken }
        });

    } catch (error) {
        console.error('토큰 갱신 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

module.exports = router; 