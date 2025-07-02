# 세온연구소 홈페이지

형사사건 전문 심리분석 기관 세온연구소의 공식 홈페이지입니다.

## 🚀 주요 기능

### 1. 로그인/회원가입 시스템
- 사용자 인증 및 권한 관리
- 개인정보 보호 및 보안
- JWT 토큰 기반 인증

### 2. 게시판 기능
- 공지사항 글쓰기
- Case Cipher 글쓰기
- 댓글 및 관리 기능
- 게시글 검색 및 필터링

### 3. 관리자 페이지
- 회원 관리
- 통계 대시보드
- 게시글 관리

### 4. 심리검사 시스템 (준비 중)
- 온라인 심리검사
- 검사 결과 통계 및 분석

## 🛠️ 기술 스택

### 백엔드
- **Node.js** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **MongoDB** - 데이터베이스
- **Mongoose** - ODM
- **JWT** - 인증
- **bcryptjs** - 비밀번호 암호화

### 프론트엔드
- **HTML5** - 마크업
- **CSS3** - 스타일링
- **JavaScript (ES6+)** - 클라이언트 로직

## 📦 설치 및 실행

### 1. 필수 요구사항
- Node.js (v14 이상)
- MongoDB (로컬 또는 MongoDB Atlas)

### 2. 프로젝트 클론
```bash
git clone <repository-url>
cd seon-research-website
```

### 3. 의존성 설치
```bash
npm install
```

### 4. 환경 변수 설정
`config.env` 파일을 생성하고 다음 내용을 설정하세요:

```env
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스 설정 (MongoDB)
MONGODB_URI=mongodb://localhost:27017/seon_research

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 보안 설정
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### 5. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

서버가 실행되면 `http://localhost:3000`에서 접속할 수 있습니다.

## 📁 프로젝트 구조

```
seon-research-website/
├── models/              # 데이터베이스 모델
│   ├── User.js         # 사용자 모델
│   ├── Post.js         # 게시글 모델
│   └── Test.js         # 검사 모델
├── routes/              # API 라우트
│   ├── auth.js         # 인증 관련
│   ├── users.js        # 사용자 관리
│   ├── board.js        # 게시판
│   ├── tests.js        # 검사
│   ├── admin.js        # 관리자
│   └── stats.js        # 통계
├── middleware/          # 미들웨어
│   └── auth.js         # 인증 미들웨어
├── index.html          # 메인 페이지
├── admin.html          # 관리자 페이지
├── style.css           # 스타일시트
├── script.js           # 클라이언트 스크립트
├── server.js           # 서버 메인 파일
├── package.json        # 프로젝트 설정
└── config.env          # 환경 변수
```

## 🔧 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 게시판
- `GET /api/board` - 게시글 목록
- `GET /api/board/:id` - 게시글 상세
- `POST /api/board` - 게시글 작성
- `PUT /api/board/:id` - 게시글 수정
- `DELETE /api/board/:id` - 게시글 삭제
- `POST /api/board/:id/comments` - 댓글 작성
- `POST /api/board/:id/like` - 좋아요

### 사용자 관리
- `GET /api/users/profile` - 프로필 조회
- `PUT /api/users/profile` - 프로필 수정
- `PUT /api/users/change-password` - 비밀번호 변경

### 관리자
- `GET /api/admin/dashboard` - 대시보드
- `GET /api/admin/users` - 사용자 목록
- `GET /api/admin/posts` - 게시글 관리
- `GET /api/stats/overview` - 통계

## 🔒 보안 기능

- **JWT 토큰 인증** - 안전한 사용자 인증
- **비밀번호 암호화** - bcrypt를 사용한 해싱
- **Rate Limiting** - API 요청 제한
- **입력 검증** - express-validator를 사용한 데이터 검증
- **CORS 설정** - 도메인 간 요청 제한
- **Helmet** - 보안 헤더 설정

## 📊 데이터베이스 스키마

### User (사용자)
- 사용자명, 이메일, 비밀번호
- 역할 (user, admin, moderator)
- 프로필 정보
- 계정 상태 관리

### Post (게시글)
- 제목, 내용, 카테고리
- 작성자, 조회수, 좋아요
- 댓글 시스템
- 첨부파일 지원

### Test (검사)
- 검사 제목, 설명, 질문
- 결과 해석 기준
- 통계 정보

## 🚀 배포

### 로컬 배포
1. MongoDB 설치 및 실행
2. 환경 변수 설정
3. `npm start` 실행

### 클라우드 배포
1. **MongoDB Atlas** 설정
2. **Vercel/Netlify** 또는 **AWS/Google Cloud** 배포
3. 환경 변수 설정
4. 도메인 연결

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

- **이메일**: seonresearch@gmail.com
- **전화**: 010-XXXX-XXXX
- **카카오톡**: @seon.forensic

---

© 2025 세온연구소. All rights reserved. 