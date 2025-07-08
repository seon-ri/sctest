const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    // 기본 정보
   
    gender: {
        type: String,
        enum: ['남성', '여성', '기타'],
        required: true
    },
    age: {
        type: String,
        enum: ['19-29세', '30-39세', '40-49세', '50-59세', '60세 이상'],
        required: true
    },
    mari: { // 결혼상태
        type: String,
        enum: ['미혼', '기혼', '이혼·별거', '사별', '동거 중'],
        required: true
    },
    rel: { // 연애관계
        type: String,
        enum: ['현재 연애 중', '현재 연애하고 있지 않음'],
        required: true
    },
    edu: { // 최종학력
        type: String,
        enum: ['고졸 이하', '대학 재학', '대학 졸업', '대학원 이상'],
        required: true
    },
    occu: { // 직업상태
        type: String,
        enum: ['학생', '직장인', '프리랜서·자영업자', '무직', '기타'],
        required: true
    },
    sexori: { // 성적 지향성 (선택)
        type: String,
        enum: ['이성애자', '동성애자', '양성애자', '무성애자', '기타', ''],
        default: ''
    },
    sexcon: { // 성 관련 전문 상담 경험 (선택)
        type: String,
        enum: ['없음', '있음', '밝히고 싶지 않음', ''],
        default: ''
    },
    email: { // 이메일 (선택)
        type: String,
        trim: true,
        default: ''
    },
    
    // 검사 응답 (44개 문항, 1-5점)
    answers: {
        type: [Number],
        validate: {
            validator: function(v) {
                return v.length === 44 && v.every(answer => answer >= 1 && answer <= 5);
            },
            message: '44개 문항에 1-5점으로 모두 응답해야 합니다.'
        },
        required: true
    },
    
    // 척도별 점수 (7개 척도, 각 6문항)
    scaleScores: {
        distort: { // 성인식 왜곡 (2,10,17,24,31,39)
            total: { type: Number, required: true },
            average: { type: Number, required: true },
            answers: { type: [Number], required: true }
        },
        atypical: { // 성적 관심의 특이성 (3,9,18,25,32,40)
            total: { type: Number, required: true },
            average: { type: Number, required: true },
            answers: { type: [Number], required: true }
        },
        immersion: { // 성적 상상의 몰입도 (1,8,16,23,30,38)
            total: { type: Number, required: true },
            average: { type: Number, required: true },
            answers: { type: [Number], required: true }
        },
        impulse: { // 성충동 조절 어려움 (5,11,19,26,33,41)
            total: { type: Number, required: true },
            average: { type: Number, required: true },
            answers: { type: [Number], required: true }
        },
        fantasy: { // 환상-현실 경계 모호성 (6,13,21,28,36,43)
            total: { type: Number, required: true },
            average: { type: Number, required: true },
            answers: { type: [Number], required: true }
        },
        irresponsibility: { // 성적 책임감 부족 (7,14,22,29,37,44)
            total: { type: Number, required: true },
            average: { type: Number, required: true },
            answers: { type: [Number], required: true }
        },
        desirability: { // 사회적 바람직성 (4,12,20,27,34,42) - 내부용
            total: { type: Number, required: true },
            average: { type: Number, required: true },
            answers: { type: [Number], required: true }
        }
    },
    
    // 가장 점수가 높은 척도
    highestScale: {
        type: String,
        enum: ['distort', 'atypical', 'immersion', 'impulse', 'fantasy', 'irresponsibility'],
        required: true
    },
    
    // 전체 위험도 판단
    riskLevel: {
        type: String,
        enum: ['안정', '주의', '경고', '위험'],
        required: true
    },
    
    // 주의점검 문항 (15번=3, 35번=4)
    attention: {
        q15: { type: Boolean, required: true }, // 15번 문항 정답 여부
        q35: { type: Boolean, required: true }, // 35번 문항 정답 여부
        passed: { type: Boolean, required: true } // 전체 통과 여부
    },
    
    // 위험문항 반응 (2,6,11,19,28번 문항)
    riskyItems: {
        q2: { type: Boolean, required: true },  // 4점 이상 여부
        q6: { type: Boolean, required: true },
        q11: { type: Boolean, required: true },
        q19: { type: Boolean, required: true },
        q28: { type: Boolean, required: true },
        hasRiskyResponse: { type: Boolean, required: true } // 하나라도 위험반응 있는지
    },
    
    // 특별 관찰 영역 조합 (두 척도 모두 3.5 이상)
    combinations: {
        misfire: { type: Boolean, required: true },   // 막 나가는 착각형 (impulse + distort)
        trigger: { type: Boolean, required: true },   // 상상 바로 실행형 (impulse + fantasy)
        fixate: { type: Boolean, required: true },    // 별난 취향 고집형 (atypical + impulse)
        drifter: { type: Boolean, required: true },   // 상상에 푹 빠진형 (immersion + fantasy)
        unaware: { type: Boolean, required: true },   // 나만 몰랐어요형 (distort + irresponsibility)
        hasCombination: { type: Boolean, required: true } // 하나라도 조합 있는지
    },
    
    // 메타데이터
    completedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    ipAddress: {
        type: String,
        default: ''
    },
    userAgent: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// 인덱스 설정
testSchema.index({ riskLevel: 1 });
testSchema.index({ completedAt: -1 });
testSchema.index({ 'combinations.hasCombination': 1 });
testSchema.index({ 'riskyItems.hasRiskyResponse': 1 });
const Test = mongoose.model('Test', testSchema);

// ✅ TestResult 모델 새로 정의
const TestResultSchema = new mongoose.Schema({
  answers: [Number],
  gender: String,
  age: String,
  mari: String,
  rel: String,
  edu: String,
  occu: String,
  email: String,
  timestamp: Date,
  scaleScores: Object
});

const TestResult = mongoose.model('TestResult', TestResultSchema);

// ✅ 둘 다 export
module.exports = { Test, TestResult };
