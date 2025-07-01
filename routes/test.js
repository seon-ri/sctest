const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

// 척도별 문항 매핑
const scaleMapping = {
    'distort': [2, 10, 17, 24, 31, 39],
    'atypical': [3, 9, 18, 25, 32, 40],
    'immersion': [1, 8, 16, 23, 30, 38],
    'impulse': [5, 11, 19, 26, 33, 41],
    'fantasy': [6, 13, 21, 28, 36, 43],
    'irresponsibility': [7, 14, 22, 29, 37, 44],
    'desirability': [4, 12, 20, 27, 34, 42]
};

// 위험 문항
const riskyItems = [2, 6, 11, 19, 28];

// 척도별 점수 계산 함수
function calculateScaleScores(answers) {
    const scaleScores = {};
    
    Object.keys(scaleMapping).forEach(scale => {
        const questionIndices = scaleMapping[scale].map(q => q - 1); // 0-based index
        const scaleAnswers = questionIndices.map(index => answers[index] || 0);
        const total = scaleAnswers.reduce((sum, answer) => sum + answer, 0);
        const average = total / scaleAnswers.length;
        
        scaleScores[scale] = {
            total: total,
            average: Number(average.toFixed(2)),
            answers: scaleAnswers
        };
    });
    
    return scaleScores;
}

// 가장 높은 척도 찾기
function findHighestScale(scaleScores) {
    let highestScale = 'distort';
    let highestAverage = 0;
    
    Object.keys(scaleScores).forEach(scale => {
        if (scale !== 'desirability' && scaleScores[scale].average > highestAverage) {
            highestAverage = scaleScores[scale].average;
            highestScale = scale;
        }
    });
    
    return highestScale;
}

// 위험도 판단
function calculateRiskLevel(scaleScores) {
    const scores = Object.values(scaleScores)
        .filter((_, index) => Object.keys(scaleScores)[index] !== 'desirability')
        .map(scale => scale.average);
    
    const highScores = scores.filter(score => score >= 3.5);
    const veryHighScores = scores.filter(score => score >= 4.5);
    
    if (veryHighScores.length > 0) {
        return '위험';
    } else if (highScores.length >= 3) {
        return '경고';
    } else if (highScores.length >= 1) {
        return '주의';
    } else {
        return '안정';
    }
}

// 주의점검 문항 확인
function checkAttentionQuestions(answers) {
    const q15 = answers[14] === 3; // 15번 문항 (index 14)
    const q35 = answers[34] === 4; // 35번 문항 (index 34)
    
    return {
        q15: q15,
        q35: q35,
        passed: q15 && q35
    };
}

// 위험문항 확인
function checkRiskyItems(answers) {
    const results = {};
    
    riskyItems.forEach(itemNum => {
        const answer = answers[itemNum - 1]; // 0-based index
        results[`q${itemNum}`] = answer >= 4;
    });
    
    results.hasRiskyResponse = Object.values(results).some(val => val === true);
    
    return results;
}

// 조합 확인
function checkCombinations(scaleScores) {
    const combinations = {
        misfire: scaleScores.impulse.average >= 3.5 && scaleScores.distort.average >= 3.5,
        trigger: scaleScores.impulse.average >= 3.5 && scaleScores.fantasy.average >= 3.5,
        fixate: scaleScores.atypical.average >= 3.5 && scaleScores.impulse.average >= 3.5,
        drifter: scaleScores.immersion.average >= 3.5 && scaleScores.fantasy.average >= 3.5,
        unaware: scaleScores.distort.average >= 3.5 && scaleScores.irresponsibility.average >= 3.5
    };
    
    combinations.hasCombination = Object.values(combinations).some(val => val === true);
    
    return combinations;
}

// 검사 결과 저장 (완전한 버전)
router.post('/', async (req, res) => {
    try {
        console.log('받은 데이터:', req.body);
        
        const { 
            gender, age, mari, rel, edu, occu, 
            sexori, sexcon, answers, email 
        } = req.body;
        

// 필수 필드 검증 전에 추가
console.log('answers 길이:', answers?.length);
console.log('answers 내용:', answers);
console.log('answers의 각 값들:');
answers?.forEach((answer, index) => {
    console.log(`${index + 1}번 문항: ${answer} (타입: ${typeof answer})`);
    if (answer < 1 || answer > 5) {
        console.log(`❌ ${index + 1}번 문항이 범위를 벗어남!`);
    }
});
        // 필수 필드 검증
        if (!gender || !age || !mari || !rel || !edu || !occu) {
            return res.status(400).json({
                success: false,
                error: '필수 정보가 누락되었습니다.'
            });
        }
        
        if (!answers || !Array.isArray(answers) || answers.length !== 44) {
            return res.status(400).json({
                success: false,
                error: '44개 문항에 모두 답변해주세요.'
            });
        }
        
        // 점수 계산 및 분석
        const scaleScores = calculateScaleScores(answers);
        const highestScale = findHighestScale(scaleScores);
        const riskLevel = calculateRiskLevel(scaleScores);
        const attention = checkAttentionQuestions(answers);
        const riskyItems = checkRiskyItems(answers);
        const combinations = checkCombinations(scaleScores);
        
        // 전체 데이터로 저장
        const test = new Test({
            gender, age, mari, rel, edu, occu,
            sexori: sexori || '',
            sexcon: sexcon || '',
            answers: answers,
            email: email || '',
            scaleScores: scaleScores,
            highestScale: highestScale,
            riskLevel: riskLevel,
            attention: attention,
            riskyItems: riskyItems,
            combinations: combinations
        });
        
        const saved = await test.save();
        console.log('저장 성공:', saved._id);
        
        res.status(201).json({
            success: true,
            message: '검사 결과가 저장되었습니다.',
            id: saved._id,
            completedAt: saved.completedAt,
            riskLevel: riskLevel
        });
        
    } catch (err) {
        console.error('저장 에러:', err);
        res.status(500).json({
            success: false,
            error: '서버 오류가 발생했습니다.',
            detail: err.message
        });
    }
});

// 저장된 결과 조회 (테스트용)
router.get('/count', async (req, res) => {
    try {
        const count = await Test.countDocuments();
        res.json({
            success: true,
            totalTests: count
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: '조회 실패'
        });
    }
});

module.exports = router;