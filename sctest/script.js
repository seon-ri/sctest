// 검사 데이터
const questions = [
    "하루에도 여러 번 성적 상상에 빠진다",
    "술에 취한 상태에서의 동의도 성관계에 충분한 동의로 볼 수 있다.",
    "일반적인 성적 상황에서는 흥분을 느끼기 어렵다",
    "나는 한 번도 거짓말을 한 적이 없다",
    "갑자기 강한 성적 충동이 일어나 제어하기 어려울 때가 있다",
    "성적 환상을 실제로 실행해도 문제되지 않는다고 생각한다",
    "성적 행동의 책임은 꼭 내가 다 질 필요는 없다",
    "성적 상상을 시작하면 오래 지속된다",
    "특정한 상황이나 조건이 있어야 성적 만족을 느낀다",
    "성관계를 시작했다면 중간에 멈추는 것은 옳지 않다.",
    "성충동을 느끼면 계획에 없던 성적 행동을 하는 경우가 있다",
    "나는 부적절한 성적 상상을 한 적이 없다",
    "가끔 성적 환상이 현실처럼 느껴진다",
    "때로는 명시적 동의 없이도 상대방이 원한다고 확신할 수 있다",

    "이 문항은 확인용입니다. '보통이다'를 선택해주세요",

    "일이나 공부 중에도 성적 상상이 떠오른다",
    "노출이 심한 옷을 입으면 성적 접근을 어느 정도 예상해야 한다",
    "성적으로 흥분하기 위해 점점 더 새로운 자극이 필요하다",
    "충동적 성행동 후 자주 후회한다",
    "나는 항상 내 감정을 완벽하게 통제한다",
    "성적 환상을 구체적으로 계획해본 적이 있다",
    "성적 행동이 법적으로 문제 될 거라고는 잘 생각하지 않는다",
    "성적 상상을 멈추려 해도 잘 되지 않는다",
    "친절한 태도는 성적 관심의 표현일 수 있다",
    "내 성적 취향을 다른 사람은 이해하기 어려울 것이다",
    "성적인 충동을 참으면 정서적으로 괴롭다",
    "나는 성적인 충동을 언제나 쉽게 억제할 수 있다",
    "성적 환상을 실행했을 때의 결과를 제대로 생각하지 않는다",
    "성적 행동은 옳고 그름의 문제라기보다는 개인 선택이라고 생각한다",
    "성적 환상이 일상생활이나 업무에 방해가 된다",
    "연인 사이라면 성관계는 당연한 것이다",
    "특정 물건, 복장, 신체 부위에 강한 성적 흥미를 느낀다",
    "감정적으로 불안할 때 성충동이 더 강해진다",
    "다른 사람과 달리 성적인 상상을 거의 하지 않는다",
    "이 문항을 읽고 있다면 '그렇다'를 선택해주세요",
    "성적으로 흥분하면 현실 판단력이 흐려진다",
    "성 피해자들이 너무 과민하게 반응하는 경우도 있다고 생각한다",
    "성적 상상을 할 때 점점 더 강렬해진다",
    "성적 문제가 생기면 유혹한 쪽에도 책임이 있다",
    "시간이 지날수록 더 특별한 자극이 필요하다",
    "성충동을 느낄 때 다른 활동으로 전환하기 어렵다",
    "나는 사회적으로 용납되지 않는 것에 흥미를 느낀 적이 없다",
    "성적 환상과 현실을 구별하는 것이 어려울 때가 있다",
    "성적 행동에서 상대방의 감정보다 내 만족이 우선이다"
];

// 척도별 문항 매핑
const scaleMapping = {
    'immersion': [1, 8, 16, 23, 30, 38],      // 성적 상상의 몰입도
    'distort': [2, 10, 17, 24, 31, 39],       // 성인식 왜곡
    'atypical': [3, 9, 18, 25, 32, 40],       // 성적 관심의 특이성
    'desirability': [4, 12, 20, 27, 34, 42],  // 사회적 바람직성
    'impulse': [5, 11, 19, 26, 33, 41],       // 성충동 조절 어려움
    'fantasy': [6, 13, 21, 28, 36, 43],       // 환상현실 경계 모호성
    'irresponsibility': [7, 14, 22, 29, 37, 44] // 성적 책임감 부족
};

// 척도 이름
const scaleNames = {
    'immersion': '성적 상상의 몰입도',
    'distort': '성인식 왜곡',
    'atypical': '성적 관심의 특이성',
    'desirability': '사회적 바람직성',
    'impulse': '성충동 조절 어려움',
    'fantasy': '환상현실 경계 모호성',
    'irresponsibility': '성적 책임감 부족'
};

// 주의점검 문항
const attentionQuestions = {
    15: 3,  // 15번 문항은 "보통이다" 선택해야 함
    35: 4   // 35번 문항은 "그렇다" 선택해야 함
};

// 위험 문항
const riskyItems = [2, 6, 11, 19, 28];

// 전역 변수
let currentQuestionIndex = 0;
let answers = [];
let isTestCompleted = false;
let hasAgreedToTerms = false; // 개인정보 동의 여부
let userInfo = {}; 

// DOM 요소들
const startScreen = document.getElementById('start-screen');
const testScreen = document.getElementById('test-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const questionText = document.querySelector('.question-text');
const optionCards = document.querySelectorAll('.option-card');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');
const warningMessage = document.getElementById('warning-message');

// 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    startBtn.addEventListener('click', startTest);
    
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            selectOption(this);
        });
    });
    
   // 사용자 정보 폼은 submit 대신 button click으로 처리
    const startTestBtn = document.getElementById('start-test-btn');
    if (startTestBtn) {
        startTestBtn.addEventListener('click', function(event) {
            event.preventDefault();
            handleUserInfoSubmit(event);
        });
    }

    // 결과 화면 버튼들
    document.getElementById('retake-btn').addEventListener('click', retakeTest);
    document.getElementById('send-email-btn').addEventListener('click', sendEmail);
});


// 검사 시작
function startTest() {
    if (!hasAgreedToTerms) {
        showTermsAgreement();
        return;
    }
    
    currentQuestionIndex = 0;
    answers = [];
    isTestCompleted = false;
    
    showScreen(testScreen);
    showQuestion();
}

// 개인정보 동의 후 사용자 정보 화면으로 이동
function agreeAndProceed() {
    hasAgreedToTerms = true;
    
    // 기존 동의 화면 제거
    const agreementScreen = document.getElementById('agreement-screen');
    if (agreementScreen) {
        document.body.removeChild(agreementScreen);
    }
    
    // 사용자 정보 입력 화면으로 이동
    showUserInfoScreen();
}

// 사용자 정보 입력 화면 표시
function showUserInfoScreen() {
    const userInfoScreen = document.getElementById('user-info-screen');
    showScreen(userInfoScreen);
}


// 사용자 정보 폼 제출 처리
function handleUserInfoSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    // 🔧 수정: form 요소를 직접 선택해서 전달
    const formElement = document.getElementById('user-info-form');
    const formData = new FormData(formElement);

    userInfo = {
        gender: formData.get('gender'),
        age: formData.get('age'),
        mari: formData.get('mari'),
        rel: formData.get('rel'),
        edu: formData.get('edu'),
        occu: formData.get('occu'),
        sexori: formData.get('sexori') || '',
        sexcon: formData.get('sexcon') || ''
    };

    // 필수 정보 누락 확인
    const requiredFields = ['gender', 'age', 'mari', 'rel', 'edu', 'occu'];
    const missingFields = requiredFields.filter(field => !userInfo[field]);

    if (missingFields.length > 0) {
        alert('모든 필수 정보를 입력해주세요.');
        return;
    }

    // 검사 시작
    hasAgreedToTerms = true;
    startTest();
}


// 개인정보 수집 동의 화면 표시
function showTermsAgreement() {
    const agreementHtml = `
        <div class="container">
            <div class="header">
                <h1>개인정보 수집 및 이용 동의</h1>
            </div>
            
            <div class="terms-card">
                <h3>개인정보 수집 및 이용에 대한 안내</h3>
                <div class="terms-content">
                    <p><strong>1. 수집하는 개인정보 항목</strong></p>
                    <ul>
                        <li>성별, 연령, 결혼상태, 연애관계, 최종학력, 직업상태</li>
                        <li>성적 지향성 (선택사항)</li>
                        <li>성 관련 전문 상담 경험 (선택사항)</li>
                        <li>이메일 주소 (선택사항, 상세 결과 수신용)</li>
                    </ul>
                    
                    <p><strong>2. 개인정보의 수집 및 이용목적</strong></p>
                    <ul>
                        <li> 검사 결과 분석 및 제공</li>
                        <li>검사 도구의 신뢰도 및 타당도 연구</li>
                        <li>상세 결과 리포트 이메일 발송 (선택시)</li>
                    </ul>
                    
                    <p><strong>3. 개인정보의 보유 및 이용기간</strong></p>
                    <ul>
                        <li>검사 완료 후 1년간 보관 후 자동 삭제</li>
                        <li>이메일 주소는 상세 결과 발송 후 즉시 삭제</li>
                    </ul>
                    
                    <p><strong>4. 동의 거부권 및 거부시 불이익</strong></p>
                    <ul>
                        <li>개인정보 수집 동의를 거부할 수 있습니다</li>
                        <li>동의 거부시 검사 참여가 제한됩니다</li>
                    </ul>
                </div>
                
                <div class="agreement-checkbox">
                    <label>
                        <input type="checkbox" id="terms-checkbox">
                        <span>위 내용을 모두 읽고 개인정보 수집 및 이용에 동의합니다 (필수)</span>
                    </label>
                </div>
            </div>
            
            <div class="button-group">
                <button id="agree-btn" class="btn-primary" disabled>동의하고 검사 시작</button>
                <button id="back-to-start" class="btn-secondary">돌아가기</button>
            </div>
        </div>
    `;
    
    // 동의 화면 생성
    const agreementScreen = document.createElement('div');
    agreementScreen.id = 'agreement-screen';
    agreementScreen.className = 'screen active';
    agreementScreen.innerHTML = agreementHtml;
    
    // 기존 화면들 숨기기
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // 동의 화면 추가
    document.body.appendChild(agreementScreen);
    
    // 이벤트 리스너 등록
    const checkbox = document.getElementById('terms-checkbox');
    const agreeBtn = document.getElementById('agree-btn');
    const backBtn = document.getElementById('back-to-start');
    
    checkbox.addEventListener('change', function() {
        agreeBtn.disabled = !this.checked;
    });
    
    agreeBtn.addEventListener('click', agreeAndProceed);

  
    backBtn.addEventListener('click', function() {
        document.body.removeChild(agreementScreen);
        showScreen(startScreen);
    });
}

// 화면 전환
function showScreen(screen) {
    // 모든 화면 숨기기
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    
    // 선택된 화면 보이기
    screen.classList.add('active');
}

// 문항 표시
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        completeTest();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    questionText.textContent = question;
    
    // 진행률 업데이트
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = `${currentQuestionIndex + 1} / ${questions.length}`;
    
    // 선택지 초기화
    optionCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    // 이전 답변이 있으면 선택 상태로 복원
    if (answers[currentQuestionIndex] !== undefined) {
        const selectedValue = answers[currentQuestionIndex];
        optionCards.forEach(card => {
            if (parseInt(card.dataset.value) === selectedValue) {
                card.classList.add('selected');
            }
        });
    }
    
    // 경고 메시지 숨기기
    warningMessage.style.display = 'none';
    
    // 이전/다음 버튼 상태 업데이트
    updateNavigationButtons();
}

// 이전/다음 버튼 상태 업데이트
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    
    if (prevBtn) {
        prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
        // 이전 버튼 이벤트 리스너 등록
        prevBtn.onclick = goToPreviousQuestion;
    }
}

// 이전 문항으로 이동
function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// 선택지 선택
function selectOption(selectedCard) {
    const selectedValue = parseInt(selectedCard.dataset.value);
    const questionNumber = currentQuestionIndex + 1;
    
    // 주의점검 문항 확인
    if (attentionQuestions[questionNumber]) {
        const expectedAnswer = attentionQuestions[questionNumber];
        if (selectedValue !== expectedAnswer) {
            showWarning();
            // 오답 선택 시 이동/저장 금지
            return;
        }
    }
    
    // 선택지 시각적 피드백
    optionCards.forEach(card => {
        card.classList.remove('selected');
    });
    selectedCard.classList.add('selected');
    
    // 답변 저장
    answers[currentQuestionIndex] = selectedValue;
    
    // 다음 문항으로 자동 이동 (약간의 지연 후)
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 500);
}

// 경고 메시지 표시
function showWarning() {
    warningMessage.style.display = 'block';
    warningMessage.scrollIntoView({ behavior: 'smooth' });
}

// 검사 완료
function completeTest() {
    isTestCompleted = true;
    calculateResults();
    showResults();
    showScreen(resultScreen);

    // 검사 결과 서버로 저장
    saveTestResult();
}

// 검사 결과 서버 저장
async function saveTestResult() {
    const results = window.testResults;
    if (!results) {
        console.error('검사 결과가 없습니다.');
        return;
    }

    // 사용자 정보와 답변을 함께 전송
    const payload = {
        ...userInfo,  // 사용자 정보 포함
        answers: results.answers,
        email: userInfo.email || ''
    };

    try {
        console.log('서버로 전송할 데이터:', payload);
        
        const response = await fetch('https://sctest-4q9l.onrender.com/api/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('검사 결과 저장 성공:', data);
        } else {
            console.error('검사 결과 저장 실패:', response.status);
        }
    } catch (err) {
        console.error('서버 통신 오류:', err);
    }
}

// 결과 계산
function calculateResults() {
    // 척도별 점수 계산
    const scaleScores = {};
    
    Object.keys(scaleMapping).forEach(scale => {
        const questionIndices = scaleMapping[scale].map(q => q - 1); // 0-based index로 변환
        const scaleAnswers = questionIndices.map(index => answers[index] || 0);
        const total = scaleAnswers.reduce((sum, answer) => sum + answer, 0);
        const average = total / scaleAnswers.length;
        
        scaleScores[scale] = {
            total: total,
            average: average,
            answers: scaleAnswers
        };
    });
    
    // 전체 결과 저장
    window.testResults = {
        answers: answers,
        scaleScores: scaleScores,
        timestamp: new Date().toISOString()
    };
    
    console.log('검사 결과:', window.testResults);
}

// 결과 표시
function showResults() {
    const results = window.testResults;
    if (!results) return;

    // 종합 평가
    const overallResult = calculateOverallResult(results.scaleScores);
    displayOverallResult(overallResult);
    
    // 척도별 결과
     displayScaleResults(results.scaleScores);
    
    // 특별 관찰 영역
    const specialObservation = calculateSpecialObservation(results.scaleScores);
    if (specialObservation.hasObservation) {
    displaySpecialObservation(specialObservation);
      }
      showScreen(resultScreen);
}

// 종합 결과 계산
function calculateOverallResult(scaleScores) {
    const scores = Object.values(scaleScores).map(scale => scale.average);
    const highScores = scores.filter(score => score >= 3.5);
    const veryHighScores = scores.filter(score => score >= 4.5);
    
    if (veryHighScores.length > 0) {
        return {
            level: '위험',
            description: '특정 영역에서 성적 인식 및 행동 조절에 매우 높은 수준의 어려움이 나타나고 있습니다. 신속히 전문적 도움이 필요한 상태입니다.',
            recommendation: '가까운 정신건강복지센터 즉시 연락, 응급 상황 시 1577-0199 (정신건강 위기상담), 이번 주 내로 전문가 상담 필수',
            color: '#e53e3e'
        };
    } else if (highScores.length >= 3) {
        return {
            level: '경고',
            description: '여러 영역에서 동시에 주의 신호가 나타나고 있습니다. 심층적인 자기 탐색 또는 전문가 상담을 권장합니다.',
            recommendation: '전문 상담 필요, 미루지 말고 빠른 시일 내 상담 예약',
            color: '#dd6b20'
        };
    } else if (highScores.length >= 1) {
        return {
            level: '주의',
            description: '특정 영역에서 개선이 필요한 부분이 발견되었습니다. 당장 문제가 있는 것은 아니지만, 자기 점검과 예방적 인식이 필요합니다.',
            recommendation: '높게 나온 영역을 중심으로 자기 관찰, 필요시 상담 고려',
            color: '#d69e2e'
        };
    } else {
        return {
            level: '안정',
            description: '전반적으로 건강한 성적 인식과 태도를 보이며, 자율적인 통제력이 양호한 상태입니다. 현재의 건강한 상태를 유지하시기 바랍니다.',
            recommendation: '파트너와의 지속적인 소통, 정기적인 자기 성찰, 건강한 관계 유지를 위한 노력 지속',
            color: '#38a169'
        };
    }
}

// 종합 결과 표시
function displayOverallResult(result) {
    const levelText = document.querySelector('.level-text');
    const resultDescription = document.querySelector('.result-description p');
    const resultCard = document.querySelector('.result-card');

    levelText.textContent = result.level;
    levelText.style.color = result.color;
    resultDescription.textContent = result.description;

    // 기존 클래스 제거
    resultCard.classList.remove('stable', 'caution', 'warning', 'danger');
    // 결과에 따라 클래스 추가
    if (result.level === '안정') {
        resultCard.classList.add('stable');
    } else if (result.level === '주의') {
        resultCard.classList.add('caution');
    } else if (result.level === '경고') {
        resultCard.classList.add('warning');
    } else if (result.level === '위험') {
        resultCard.classList.add('danger');
    }
}

// 척도별 결과 표시
function getLevelByScore(score) {
  if (score >= 4.0) return "심각";
  if (score >= 3.0) return "높음";
  if (score >= 2.0) return "중간";
  return "낮음";
}
function getColorByLevel(level) {
  return {
    '심각': '#e53e3e',
    '높음': '#dd6b20',
    '중간': '#d69e2e',
    '낮음': '#38a169'
  }[level] || '#999';
}
function displayScaleResults(scaleScores) {
    const scalesContainer = document.querySelector('.scales-container');
    scalesContainer.innerHTML = '';
    
    Object.keys(scaleScores).forEach(scale => {
        if (scale === 'desirability') return; // 사회적 바람직성은 결과에 표시하지 않음
        
        const score = scaleScores[scale];
        const scaleName = scaleNames[scale];
        
        const level = getLevelByScore(score.average);
        const color = getColorByLevel(level);
        const interpretation = getScaleText(scale, level); 
        
        const scaleItem = document.createElement('div');
        scaleItem.className = 'scale-item';
        scaleItem.innerHTML = `
            <div class="scale-header">
                <div class="scale-name">${scaleName}</div>
                <div class="scale-score">${score.average.toFixed(1)}점 / ${level}</div>
            </div>
            <div class="scale-description">${interpretation}</div>
        `;
        
        scalesContainer.appendChild(scaleItem);
    });
}

 

// 척도별 텍스트 (간단한 버전)
function getScaleText(scale, level) {
    const texts = {
        'immersion': {
            '낮음': '성적 상상과 일상생활의 균형을 잘 유지하고 있습니다.',
            '중간': '성적 환상에 빠지는 시간이 늘어나고 있습니다. 일상 활동에 더 집중해보세요.',
            '높음': '성적 상상이 일상을 방해할 정도로 과도합니다. 현실 활동을 늘려야 합니다.',
            '심각': '성적 환상에 지나치게 몰입하여 일상생활에 심각한 지장이 있습니다.'
        },
        'distort': {
            '낮음': '성적 상황에서 상대방의 의사를 잘 파악하고 존중합니다.',
            '중간': '때때로 상대방의 신호를 자의적으로 해석하는 경향이 있습니다.',
            '높음': '상대방의 동의와 거부의 신호를 자주 오해합니다.',
            '심각': '성적 상황에 대한 인식이 매우 왜곡되어 있습니다.'
        },
        'atypical': {
            '낮음': '일반적인 범위의 성적 관심을 가지고 있습니다.',
            '중간': '특정한 조건이나 상황을 선호하는 경향이 있습니다.',
            '높음': '매우 특수한 조건에만 관심을 가집니다.',
            '심각': '극도로 제한적이고 특이한 성적 관심으로 인해 어려움이 예상됩니다.'
        },
        'impulse': {
            '낮음': '성충동을 적절히 인식하고 조절할 수 있습니다.',
            '중간': '때때로 충동 조절에 어려움을 겪습니다.',
            '높음': '성충동 조절에 어려움을 자주 겪고 있습니다.',
            '심각': '충동 조절이 매우 어려운 상태이며, 부적절한 행동으로 이어질 우려가 있습니다.'
        },
        'fantasy': {
            '낮음': '환상과 현실을 명확히 구분하고 있습니다.',
            '중간': '가끔 환상과 현실의 경계가 분명하지 않습니다.',
            '높음': '환상과 현실의 경계가 모호해지는 경우가 많습니다.',
            '심각': '환상과 현실을 자주 혼동하며, 정확한 현실 인식을 위한 전문적 개입이 권장됩니다.'
        },
        'irresponsibility': {
            '낮음': '성적 행동에 대한 책임감과 윤리 의식을 갖추고 있습니다.',
            '중간': '때때로 책임을 회피하려는 경향이 있습니다.',
            '높음': '성적 행동의 결과를 고려하지 않습니다.',
            '심각': '성적 책임감이 매우 부족하여 자신과 타인에게 해를 끼칠 수 있습니다.'
        }
    };
    
    return texts[scale]?.[level] || '해석을 제공할 수 없습니다.';
}

// 특별 관찰 영역 계산
function calculateSpecialObservation(scaleScores) {
    const combinations = [
        { name: '막 나가는 착각형', scales: ['impulse', 'distort'], code: 'misfire' },
        { name: '상상 바로 실행형', scales: ['impulse', 'fantasy'], code: 'trigger' },
        { name: '별난 취향 고집형', scales: ['atypical', 'impulse'], code: 'fixate' },
        { name: '상상에 푹 빠진형', scales: ['immersion', 'fantasy'], code: 'drifter' },
        { name: '나만 몰랐어요형', scales: ['distort', 'irresponsibility'], code: 'unaware' }
    ];
    
    const foundCombinations = combinations.filter(combo => {
        return combo.scales.every(scale => scaleScores[scale].average >= 3.5);
    });
    
    const riskyItemResponses = riskyItems.map(item => ({
        item: item,
        response: answers[item - 1] || 0,
        isHigh: (answers[item - 1] || 0) >= 4
    })).filter(item => item.isHigh);
    
    return {
        hasObservation: foundCombinations.length > 0 || riskyItemResponses.length > 0,
        combinations: foundCombinations,
        riskyItems: riskyItemResponses
    };
}

// 특별 관찰 영역 표시
function displaySpecialObservation(observation) {
    const specialSection = document.getElementById('special-observation');
    const observationContent = document.querySelector('.observation-content');
        let content = '';
        if (observation.combinations.length > 0) {
        content += '<h3> 🔍 조합 패턴들</h3>';
        content += '<p>다음과 같은 패턴이 발견되어 특별한 관찰이 필요합니다:</p>';
        observation.combinations.forEach(combo => {
            content += `<p style="margin-left: 1.8em; line-height:1.6;">• ${combo.name}</p>`;
        });
    }
    
    if (observation.riskyItems.length > 0) {
        content += '<h4> ⚠️ 주의 필요한 문항</h4>';
        content += '<p>다음 문항들에서 높은 점수가 나타났습니다:</p>';
        observation.riskyItems.forEach(item => {
            content += `<p style="margin-left: 1.5em;">• ${item.item}번 문항 (응답: ${item.response}점)</p>`;
        });
    }
 
    content += '<p><strong> 안내:</strong>  이메일 주소를 입력하시면 맞춤 분석 결과가 제공됩니다.</p>';
    
    observationContent.innerHTML = content;
    specialSection.style.display = 'block';
}

// 다시 검사하기
function retakeTest() {
    showScreen(startScreen);
}

// script.js에 추가할 함수들 (기존 sendEmail 함수 위에 추가)

// 조합별 상세 설명 함수 (ob2)
function getDetailedCombinationText(combinationCode) {
    const combinationTexts = {
        'misfire': '확실하지 않으면 꼭 물어보기. 상대의 말과 표정, 몸짓까지 같이 읽는 연습을 해보세요.',
        'trigger': '환상은 환상으로만. 충동이 올 때는 잠시 자리를 떠나 심호흡하세요.',
        'fixate': '평범한 스킨십도 충분히 좋아요. 일반적인 친밀감을 즐기는 연습을 해보세요.',
        'drifter': '하루 30분만 상상하기. 알람을 맞춰두고 현실로 돌아오세요.',
        'unaware': '내 행동은 내 책임. 상대방 입장에서 한 번 더 생각해보세요.'
    };
    
    return combinationTexts[combinationCode] || '전문가 상담을 권장합니다.';
}

// 위험문항별 상세 설명 함수
function getRiskyItemText(itemNumber) {
    const riskyItemTexts = {
        2: "술 마신 상태에서의 동의는 법적으로도 인정되지 않아요. 맑은 정신일 때, 명확한 의사로만 행동하세요.",
        6: "실행 전에 '이 행동이 진짜 괜찮을까?'를 스스로에게 꼭 물어보세요. 상상은 머릿속에서 끝내도 충분해요.",
        11: "'지금 바로 행동해야 하나?'를 한번 멈춰 생각해보세요. 찬물 샤워, 자리 피하기 같은 방법도 도움이 돼요.",
        19: "반복되는 후회는 패턴을 바꿔야 한다는 신호예요. 언제, 어디서, 어떤 상황에서 충동이 생기는지 기록하고, 그 상황을 미리 피하세요.",
        28: "행동의 결과는 되돌릴 수 없어요. 법적 문제, 관계 파괴, 상대방의 상처 등 현실의 결과를 먼저 생각해보세요."
    };
    
    return riskyItemTexts[itemNumber] || '전문가 상담을 권장합니다.';
}



// 2. 척도별 해석 맵 (요약 샘플 — 전체는 실제 JSON에서 확장 가능)
const scaleInterpretationMap = {
  "distort": {
    "낮음": {
      "상태": "현실적인 성 인식을 보이고 있으며, 왜곡된 성 개념이 거의 드러나지 않습니다.",
      "핵심": "왜곡된 성 개념에 빠지지 않고 안정적인 성 개념을 유지하고 있습니다.",
      "실천": "현재의 성에 대한 인식을 지속적으로 유지하고, 다양한 건강한 성교육 콘텐츠를 접해보세요."
    },
    "중간": {
      "상태": "성에 대한 일부 편견이나 비현실적인 요소가 드러나고 있습니다.",
      "핵심": "왜곡된 믿음이 특정 상황에서 영향을 줄 수 있습니다.",
      "실천": "성 관련 정보에 대해 비판적으로 사고하는 연습을 하며, 현실과 판타지를 구분하는 훈련이 필요합니다."
    },
    "높음": {
      "상태": "현실과 동떨어진 왜곡된 성 개념이 자주 드러나고 있습니다.",
      "핵심": "왜곡된 성 개념이 실제 관계에 영향을 줄 수 있습니다.",
      "실천": "왜곡된 믿음의 출처를 점검하고, 전문가 상담이나 교육 프로그램을 고려해보세요."
    },
    "심각": {
      "상태": "심각하게 왜곡된 성 개념이 반복적으로 드러나며 현실 판단에 문제가 있을 수 있습니다.",
      "핵심": "성에 대한 인식이 극단적으로 비현실적이며 위험 행동으로 이어질 가능성이 높습니다.",
      "실천": "전문적인 개입이 필요하며, 성 인식 재구조화 훈련 및 지속적인 모니터링이 요구됩니다."
    }
  },
  "immersion": {
    "낮음": {
      "상태": "성적 상상과 일상생활의 균형을 잘 유지하고 있습니다. 건강한 수준의 환상을 가지며 현실 활동에 지장이 없습니다.",
      "핵심": "상상은 삶을 풍요롭게 하는 양념입니다.",
      "실천": "현재의 건강한 균형 유지하기"
    },
    "중간": {
      "상태": "성적 환상에 빠지는 시간이 늘어나고 있습니다. 일상 활동에 더 집중해보세요.",
      "핵심": "현실의 즐거움을 놓치고 있지 않나요?",
      "실천": "하루 중 환상 시간을 1시간 이내로 제한하기"
    },
    "높음": {
      "상태": "성적 상상이 일상을 방해할 정도로 과도합니다. 현실 활동을 늘려야 합니다.",
      "핵심": "상상이 일상을 방해하기 시작했습니다.",
      "실천": "친구나 가족과의 약속 주 3회 이상 잡기"
    },
    "심각": {
      "상태": "성적 환상에 지나치게 몰입하여 일상생활에 심각한 지장이 있습니다. 정상적인 직장이나 학업, 관계가 불가능합니다.",
      "핵심": "현실이 사라지고 환상만 남았습니다.",
      "실천": "정신건강 전문가 즉시 상담 예약 (이번 주 내)"
    }
  },
  "atypical": {
    "낮음": {
      "상태": "일반적인 범위의 성적 관심을 가지고 있습니다. 다양한 상황에서 친밀감과 즐거움을 느낄 수 있습니다.",
      "핵심": "건강하고 유연한 성적 관심을 갖고 있습니다.",
      "실천": "파트너와 새로운 경험 탐색하기"
    },
    "중간": {
      "상태": "특정한 조건이나 상황을 선호하는 경향이 있습니다. 일반적인 친밀감에서 만족을 느끼기 어려울 수 있습니다.",
      "핵심": "특별함에 갇히면 평범한 행복을 놓칩니다.",
      "실천": "일반적인 스킨십과 친밀감 연습하기"
    },
    "높음": {
      "상태": "매우 특수한 조건에만 관심을 가집니다. 일반적인 성적 상황에서는 만족하기 어려우며, 관계 형성에 어려움이 있습니다.",
      "핵심": "성적 관심의 폭을 넓힐 필요가 있습니다.",
      "실천": "감각 집중 훈련 프로그램 참여"
    },
    "심각": {
      "상태": "극도로 제한적이고 특이한 성적 관심으로 인해 어려움이 예상됩니다.",
      "핵심": "전문적 도움 없이는 개선이 어렵습니다.",
      "실천": "성 문제 전문 치료기관 즉시 방문"
    }
  },
  "impulse": {
    "낮음": {
      "상태": "성충동을 적절히 인식하고 조절할 수 있습니다. 충동이 일어나도 상황에 맞게 대처하며, 계획적인 행동을 합니다.",
      "핵심": "충동을 느끼되 선택은 내가 합니다.",
      "실천": "건강한 충동 해소 방법 유지하기"
    },
    "중간": {
      "상태": "때때로 충동 조절에 어려움을 겪습니다. 대처 방법을 익히면 도움이 됩니다.",
      "핵심": "충동과 행동 사이 잠시 멈춤이 필요합니다.",
      "실천": "충동이 올라올 때 10초 카운트하기"
    },
    "높음": {
      "상태": "성충동 조절에 어려움을 자주 겪고 있습니다. 스스로 관리 방법을 익히거나 도움을 받으면 개선될 수 있습니다.",
      "핵심": "충동이 당신을 지배하고 있습니다.",
      "실천": "위험 상황에서 즉시 자리 떠나기"
    },
    "심각": {
      "상태": "충동 조절이 매우 어려운 상태이며, 부적절한 행동으로 이어질 우려가 있습니다.",
      "핵심": "혼자서는 해결할 수 없습니다.",
      "실천": "성 문제 전문기관에서 조기 상담, 고위험 장소 방문 금지"
    }
  },
  "fantasy": {
    "낮음": {
      "상태": "환상과 현실을 명확히 구분하고 있습니다. 상상은 상상으로 즐기며, 현실에서는 적절한 판단을 합니다.",
      "핵심": "환상은 안전한 마음속 놀이터입니다.",
      "실천": "일기나 창작활동으로 환상 표현하기"
    },
    "중간": {
      "상태": "가끔 환상과 현실의 경계가 분명하지 않습니다.",
      "핵심": "환상에 현실감을 부여하고 있습니다.",
      "실천": "환상 후 현실 체크 루틴 만들기"
    },
    "높음": {
      "상태": "환상과 현실의 경계가 모호해지는 경우가 많습니다. 현실 인식 훈련이 필요합니다.",
      "핵심": "환상의 실행은 현실의 파괴입니다.",
      "실천": "매일 3번 현실 점검 알람 설정하기"
    },
    "심각": {
      "상태": "환상과 현실을 자주 혼동하며, 정확한 현실 인식을 위한 전문적 개입이 권장됩니다.",
      "핵심": "당신의 환상이 누군가의 악몽이 될 수 있습니다",
      "실천": "응급 상황 우려시 가까운 정신건강의학과 방문"
    }
  },
  "irresponsibility": {
    "낮음": {
      "상태": "성적 행동에 대한 책임감과 윤리의식을 갖추고 있습니다. 자신과 상대방 모두를 존중하며 성숙한 태도를 보입니다.",
      "핵심": "책임감 있는 성은 모두를 행복하게 합니다.",
      "실천": "파트너와 책임에 대해 대화하기"
    },
    "중간": {
      "상태": "때때로 책임을 회피하려는 경향이 있습니다. 성숙한 태도가 필요합니다.",
      "핵심": "모든 선택에는 책임이 따릅니다.",
      "실천": "내 행동-내 책임 원칙 매일 되새기기"
    },
    "높음": {
      "상태": "성적 행동의 결과를 고려하지 않습니다. 책임감 교육이 필요합니다.",
      "핵심": "회피할수록 대가는 커집니다.",
      "실천": "법적 책임에 대해 공부하기"
    },
    "심각": {
      "상태": "성적 책임감이 매우 부족하여 자신과 타인에게 해를 끼칠 수 있습니다.",
      "핵심": "당신의 무책임이 타인의 삶을 파괴합니다.",
      "실천": "가해자 교정 프로그램 즉시 등록"
    }
   },
  };

// 3. 해석 호출 함수
function getDetailedScaleInterpretation(scale, score) {
  const level = getLevelByScore(score);
  const data = scaleInterpretationMap[scale]?.[level];
  if (!data) return "해석 정보가 없습니다.";
  return `
    <strong>상태:</strong> ${data["상태"]}<br>
    <strong>핵심:</strong> ${data["핵심"]}<br>
    <strong>실천 과제:</strong> ${data["실천"]}
  `;
}



// 상세 리포트 생성 함수 250709 
function generateEnhancedReport(results, userInfo) {
  const scaleScores = results.scaleScores;
  const overallResult = calculateOverallResult(scaleScores);
  const specialObservation = calculateSpecialObservation(scaleScores);

  const scoreMap = {
    'distort': '성인식 왜곡',
    'atypical': '성적 관심 특이성',
    'immersion': '성적 상상의 몰입도',
    'impulse': '성충동 조절 어려움',
    'fantasy': '환상-현실 경계 모호성',
    'irresponsibility': '성적 책임감 부족'
  };

  const levelColors = {
    '심각': '#e53e3e',
    '높음': '#dd6b20',
    '중간': '#d69e2e',
    '낮음': '#38a169'
  };

  const percent = v => Math.min(100, Math.max(0, Math.round((v / 5) * 100)));

  let report = `
<div style="font-family:'Noto Sans KR',sans-serif; max-width:800px; margin:auto; padding:24px; border:1px solid #ccc; border-radius:8px; background:#fff; color:#333; line-height:1.75;">

<div style="background-color:#1a3e72; padding:20px; border-radius:6px;">
  <h1 style="margin: 0; font-size: 24px; color: #ffffff; text-align: center;">나의 성, 문제 없을까?</h1>
  <p style="margin: 5px 0 0 0; font-size: 14px; color: #ffffff; text-align: center;">자가진단 검사 결과 보고서</p>
</div>

<p style="font-size:13px; color:#555; text-align:right; margin-bottom:24px;">
  이름: ${userInfo.name || '홍길동'}님 │ 검사일: ${new Date().toLocaleDateString('ko-KR')}
</p>

  <h2 style="color:#1a3e72; margin-top:40px; margin-bottom:12px; font-size:18px;">1. 종합 평가</h2>
  <div style="border-left: 6px solid ${overallResult.color}; background:${overallResult.color}20; padding:16px; margin-top:12px; border-radius:4px;">
    <p><strong>결과:</strong> ${overallResult.level}</p>
    <p><strong>해석:</strong> ${overallResult.description}</p>
    <p><strong>권장사항:</strong> ${overallResult.recommendation}</p>
  </div>
`;

  if (specialObservation.hasObservation) {
    report += `
<h2 style="color:#1a3e72; margin-top:40px; margin-bottom:12px; font-size:18px;">2. 특별 관찰 영역</h2>
<div style="border:1px solid #f6ad55; padding:16px; border-radius:6px;">

  <p style="color:#1a3e72; font-weight:600; font-size:16px; margin-bottom:8px;"><strong>조합 패턴</strong></p>
  ${specialObservation.combinations.map(combo => `
    <p style="text-indent:-1em; padding-left:1.8em; margin:6px 0;">
      • <strong>${combo.name}:</strong> ${getDetailedCombinationText(combo.code)}
    </p>
  `).join('')}

  ${specialObservation.riskyItems.length > 0 ? `
    <p style="color:#1a3e72; font-weight:600; font-size:16px; margin-bottom:8px;"><strong>주의 문항</strong></p>
    ${specialObservation.riskyItems.map(item => `
<p style="text-indent:-1em; padding-left:1.8em; margin:6px 0;">
  • <strong>${item.item}번:</strong> ${getRiskyItemText(item.item)}
</p>
    `).join('')}
  ` : ''}

</div>
`;
  }

  report += `
  <h2 style="color:#1a3e72; margin-top:40px; margin-bottom:12px; font-size:18px;">3. 척도별 점수 요약</h2>
  <div style="margin-bottom:12px; font-size:13px;">
    <strong>범례:</strong> 
    <span style="color:#e53e3e">■ 심각</span> 
    <span style="color:#dd6b20">■ 높음</span> 
    <span style="color:#d69e2e">■ 중간</span> 
    <span style="color:#38a169">■ 낮음</span>
  </div>

  <table style="width:100%; table-layout: fixed; border-collapse:collapse; font-size:14px;">
    <tr style="background:#f0f4f8;">
      <th align="left" style="padding:8px;">척도</th>
      <th style="padding:8px;">그래프</th>
      <th align="right" style="padding:8px;">점수</th>
    </tr>
`;

  Object.entries(scaleScores).forEach(([scale, score]) => {
    if (scale === 'desirability') return;
    const avg = score.average;
    const level = getLevelByScore(avg);
    const color = levelColors[level] || '#ccc';

    report += `
    <tr>
      <td style="padding:6px 8px;">${scoreMap[scale]}</td>
      <td style="padding:6px 8px;">
        <div style="background:#eee; height:12px; border-radius:4px;">
          <div style="height:12px; background:${color}; width:${percent(avg)}%; border-radius:4px;"></div>
        </div>
      </td>
      <td style="padding:6px 8px; text-align:right;">${avg.toFixed(1)}점 / ${level}</td>
    </tr>`;
  });

  report += `</table>`;

  report += `
    <h2 style="color:#1a3e72; margin-top:40px; font-size:18px;">4. 척도별 상세 해석</h2>
  `;

  Object.entries(scaleScores).forEach(([scale, score]) => {
    if (scale === 'desirability') return;
    const avg = score.average;
    const label = scoreMap[scale];
    const interpretation = getDetailedScaleInterpretation(scale, avg);

    report += `
    <div style="margin-bottom:24px;">
      <h3 style="margin:12px 0 6px; color:#1a3e72;">${label} (${avg.toFixed(1)}점)</h3>
      <div style="border-left: 4px solid #ccc; padding-left:12px;">${interpretation}</div>
    </div>
    `;
  });

  report += `
    <div style="margin-top:40px; font-size:13px; color:#666; text-align:center; border-top:1px solid #ddd; padding-top:16px;">
      본 결과는 자기이해를 위한 참고용 자료이며, 의학적 진단을 위한 도구는 아닙니다.<br>
      현재는 파일럿 연구 중이며, 상세 상담이 필요한 경우 아래 연락처로 문의해주세요.<br>
      이메일: seonresearch@gmail.com │ 전화: 0507-1463-8122 │
      <a href="https://www.seon-r.com" target="_blank" style="color:#1a3e72; font-weight:bold;">www.seon-r.com</a>
  </div>
</div>
`;

  return report;
}



// 이메일 부분 수정 250708 chat 
async function sendEmail() {
    const email = document.getElementById('email-input').value.trim();
    if (!email) {
        alert('이메일 주소를 입력해주세요.');
        return;
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('올바른 이메일 주소를 입력해주세요.');
        return;
    }

    try {
        const sendBtn = document.getElementById('send-email-btn');
        const originalText = sendBtn.textContent;
        sendBtn.disabled = true;
        sendBtn.textContent = '발송 중...';

        const results = window.testResults;
        const detailedReport = generateEnhancedReport(results, userInfo);
        const overallResult = calculateOverallResult(results.scaleScores);

        // ✅ 실제 이메일 전송 요청
        const response = await fetch('https://sctest-4q9l.onrender.com/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                reportContent: detailedReport,
                userInfo: userInfo,
                resultLevel: overallResult.level
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('상세 결과가 이메일로 발송되었습니다!\n\n※ 스팸함도 확인해주세요.');
        } else {
            throw new Error(data.detail || '이메일 발송 실패');
        }

        sendBtn.disabled = false;
        sendBtn.textContent = originalText;

    } catch (error) {
        console.error('이메일 발송 실패:', error);
        alert('이메일 발송에 실패했습니다.\n잠시 후 다시 시도해주세요.');
        const sendBtn = document.getElementById('send-email-btn');
        sendBtn.disabled = false;
        sendBtn.textContent = '상세 결과 받기';
    }
}
