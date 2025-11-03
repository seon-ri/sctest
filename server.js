require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); 
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';");
    next();
});

const PORT = process.env.PORT || 3000;

// 보안 미들웨어
app.use(helmet({
    contentSecurityPolicy: false,
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://www.seon-r.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15') * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    message: {
        error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
});

// Body parsing 미들웨어
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/', limiter);

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, './'), {
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

app.use('/sctest', express.static(path.join(__dirname, 'sctest')));

// 여기에 추가 ↓
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));


// MongoDB 연결 이벤트 리스너 먼저 설정
mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB 연결됨');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB 연결 에러:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB 연결 해제');
});

// MongoDB 연결
mongoose.connect('mongodb+srv://seonweb:web1234@cluster0.0lhgygt.mongodb.net/seon_research?retryWrites=true&w=majority', {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000, 
})
.then(() => console.log('✅ MongoDB 연결 성공'))
.catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 모델 로드 추가
require('./models/User');
require('./models/Post');

// 빈 라우터들 (일단 동작하게 하기 위해)
const express_router = require('express').Router();

// API 라우트
app.use('/api/auth', express_router);
app.use('/api/users', express_router);
app.use('/api/board', require('./routes/board'));
app.use('/api/admin', express_router);
app.use('/api/stats', express_router);
app.use('/api/test', require('./routes/tests'));

// 메인 페이지 라우트
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 이메일 발송 라우트
app.post('/api/send-email', async (req, res) => {
    try {
        const { email, reportContent, userInfo, resultLevel } = req.body;
        
        console.log('이메일 발송 요청:', email);
        console.log('EMAIL_USER:', process.env.EMAIL_USER);
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '설정됨' : '없음');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `[세온연구소] 나의 성, 문제 없을까? 상세 결과 리포트 - ${resultLevel}`,
            html: reportContent  
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('이메일 발송 성공:', info.messageId);
        
        res.json({
            success: true,
            message: '이메일이 성공적으로 발송되었습니다.',
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error('이메일 발송 오류:', error);
        res.status(500).json({
            success: false,
            error: '이메일 발송에 실패했습니다.',
            detail: error.message
        });
    }
});

// 404 에러 핸들러
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: '요청한 리소스를 찾을 수 없습니다.'
    });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
    console.error('서버 에러:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? '서버 내부 오류가 발생했습니다.' 
            : err.message
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📱 환경: ${process.env.NODE_ENV}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
});

module.exports = app;
