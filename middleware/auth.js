const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // 헤더에서 토큰 추출
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다.'
            });
        }

        const token = authHeader.substring(7); // 'Bearer ' 제거

        // 토큰 검증
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 사용자 확인
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }

        // 계정 활성화 확인
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: '비활성화된 계정입니다.'
            });
        }

        // 요청 객체에 사용자 정보 추가
        req.user = decoded;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '토큰이 만료되었습니다.'
            });
        }

        console.error('인증 미들웨어 에러:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
};

// 관리자 권한 확인 미들웨어
const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, async () => {
            const user = await User.findById(req.user.userId);
            
            if (!user || user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: '관리자 권한이 필요합니다.'
                });
            }
            
            next();
        });
    } catch (error) {
        next(error);
    }
};

// 모더레이터 권한 확인 미들웨어
const moderatorAuth = async (req, res, next) => {
    try {
        await auth(req, res, async () => {
            const user = await User.findById(req.user.userId);
            
            if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
                return res.status(403).json({
                    success: false,
                    message: '관리자 또는 모더레이터 권한이 필요합니다.'
                });
            }
            
            next();
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    auth,
    adminAuth,
    moderatorAuth
}; 