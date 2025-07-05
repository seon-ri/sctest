require('dotenv').config(); // config.env 삭제하고 기본 .env 사용

const express = require('express');
const nodemailer = require('nodemailer');

const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); 

const app = express();

app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';");
    next();
});

const PORT = process.env.PORT || 3000;


console.log('🧭 server.js 시작됨');
require('dotenv').config();
console.log('✅ dotenv 로드됨');


// 보안 미들웨어
app.use(helmet({
    contentSecurityPolicy: false,
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000, // 15분
    max: parseInt(process.env.RATE_LIMIT_MAX), // 최대 100 요청
    message: {
        error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
});


// CSP 해결을 위한 미들웨어 추가

// Body parsing 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter);


// 정적 파일 서빙
app.use(express.static(path.join(__dirname, './'), {
    setHeaders: (res, path) => {
        // 모든 파일에 캐시 방지 헤더 설정
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// 명시적 검사 연결 방식 (선택사항)
app.use('/sctest', express.static(path.join(__dirname, 'sctest')));

// 홈페이지 폴더 접근 차단
//app.use('/홈페이지', (req, res) => {
//    res.status(404).send('Not Found');
//});

// 데이터베이스 연결
// mongoose.connect(process.env.MONGODB_URI, {
//    useNewUrlParser: true,
//    useUnifiedTopology: true,
//    serverSelectionTimeoutMS: 30000, // 30초로 증가
//    socketTimeoutMS: 45000, // 45초로 증가
//    bufferMaxEntries: 0, // 버퍼링 비활성화
//    maxPoolSize: 10 // 연결 풀 크기
//})

// 임시 직접 연결
mongoose.connect('mongodb+srv://seonweb:web1234@cluster0.0lhgygt.mongodb.net/seon_research?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0
})
.then(() => console.log('✅ MongoDB 연결 성공'))
.catch(err => console.error('❌ MongoDB 연결 실패:', err));

// 라우트 임포트
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const boardRoutes = require('./routes/board');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');
const testRouter = require('./routes/tests');

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/test', testRouter);

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

        
        // Gmail transporter 설정
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        // 이메일 옵션
        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `[세온연구소] 나의 성, 문제 없을까? 상세 결과 리포트 - ${resultLevel}`,
            text: reportContent,
            html: `
                <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 700px; margin: 0 auto; padding: 12px 16px; line-height: 1.5;">
                  <div style="text-align: center; margin-bottom: 20px; padding: 12px; background: linear-gradient(135deg, #1a3e72 0%, #4a7ab5 100%); color: white; border-radius: 8px;">
                        <h1 style="margin: 0; font-size: 24px;">나의 성, 문제 없을까?</h1>
<div></div>
      		   <p style="margin: 6px 0 0 0; font-size: 18px;">상세 결과 리포트</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <pre style="white-space: pre-wrap; font-family: 'Noto Sans KR', sans-serif; font-size: 13px; line-height: 1.5; margin: 0;">${reportContent}</pre>
                    </div>
                    
                    <div style="text-align: center; padding: 10px; background: #fff5f5; border: 1px solid #e53e3e; border-radius: 8px; margin-top: 14px;">
                        <h3 style="color: #e53e3e; margin-bottom: 10px; font-size: 16px;">⚠️ 중요 안내</h3>
                        <p style="margin: 4px 0; color: #333; font-size: 13px;">이 결과는 자기이해를 위한 참고자료이며, 의학적 진단을 위한 도구가 아닙니다.</p>
                        <p style="margin: 4px 0; color: #333; font-size: 13px;">검사 결과에 대한 문의 또는 상담이 필요하신 경우, <br>세온연구소의 전문 상담 및 교육 프로그램을 통해 도움을 받으실 수 있습니다.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6c757d; font-size: 11px;">
                        <p>세온연구소 | 검사 리포트</p>
                        <p>본 리포트는 개인 참고용으로만 사용하시기 바랍니다.</p>
                        <p>발송일: ${new Date().toLocaleDateString('ko-KR')}</p>
                    </div>
                </div>
            `
        };
        
        // 이메일 발송
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