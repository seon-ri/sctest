console.log('--- admin-script.js SCRIPT STARTED ---');

// 즉시 실행 함수로 전체 코드를 감싸 변수 충돌을 방지합니다.
(function() {
    'use strict';

    // --- 전역 설정 ---
    const GOOGLE_SHEETS_API_KEY = 'AIzaSyDbCGi6wzsmDtRLpnJugzHiZmR90-TpWEU'; // 복원된 구글 시트 API 키
    const SPREADSHEET_ID = '1SZ8ofKNxPqDCuvu1L8suY6gnnQw_mtDLonzUhRmRFA8';
    const RANGE = '시트1!A:BA'; // 데이터 범위

    const GA_PROPERTY_ID = '494062835'; // 구글 애널리틱스 속성 ID
    const SERVICE_ACCOUNT_KEY_FILE = 'fluted-current-429607-n9-d0fffc21c063.json';

    function showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    // --- Helper Functions ---
    function findMostFrequent(statsObj) {
        if (!statsObj || Object.keys(statsObj).length === 0) {
            return ['없음', 0];
        }
        return Object.entries(statsObj).reduce((a, b) => a[1] > b[1] ? a : b, [null, 0]);
    }
    
    // --- 구글 시트 관련 함수 ---
    function loadSheetData() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        }).then(function(response) {
            console.log("Google Sheets data fetched successfully.");
            processSheetData(response.result);
        }, function(response) {
            console.error('Error loading Google Sheets data:', response.result.error.message);
            showError('구글 시트 데이터 로딩 실패: ' + response.result.error.message);
        });
    }

    function processSheetData(data) {
        const rows = data.values;
        if (!rows || rows.length <= 1) {
            console.log('No data in Google Sheet.');
            return;
        }
        
        const headers = rows[0];
        const statsData = rows.slice(1);
        
        const stats = {
            total: statsData.length,
            today: 0,
            gender: {},
            age: {},
            completion: 0
        };

        const todayStr = new Date().toDateString();
        statsData.forEach(row => {
            try {
                if (row[0] && new Date(row[0]).toDateString() === todayStr) stats.today++;
                const gender = row[2];
                if (gender) stats.gender[gender] = (stats.gender[gender] || 0) + 1;
                const age = row[3];
                if (age) stats.age[age] = (stats.age[age] || 0) + 1;
            } catch(e) { /* 날짜 포맷 에러 등 무시 */ }
        });
        
        const emailCount = statsData.filter(row => row[26] && row[26].includes('@')).length;
        stats.completion = stats.total > 0 ? Math.round((emailCount / stats.total) * 100) : 0;
        
        updateStatsFromSheets(stats);
    }
    
    function updateStatsFromSheets(stats) {
        document.getElementById('test-participants').textContent = stats.total.toLocaleString();
        document.getElementById('completion-rate').textContent = stats.completion + '%';
        
        document.getElementById('love-test-total').textContent = stats.total + '명';
        document.getElementById('love-test-today').textContent = stats.today + '명';
        document.getElementById('love-test-completion').textContent = stats.completion + '%';

        const maleCount = stats.gender['남성'] || 0;
        const malePercent = stats.total > 0 ? Math.round((maleCount / stats.total) * 100) : 0;
        document.getElementById('gender-male').textContent = `${maleCount}명 (${malePercent}%)`;

        const femaleCount = stats.gender['여성'] || 0;
        const femalePercent = stats.total > 0 ? Math.round((femaleCount / stats.total) * 100) : 0;
        document.getElementById('gender-female').textContent = `${femaleCount}명 (${femalePercent}%)`;

        const [ageCat, ageCount] = findMostFrequent(stats.age);
        const agePercent = stats.total > 0 ? Math.round((ageCount / stats.total) * 100) : 0;
        document.getElementById('age-label').textContent = `연령대 (${ageCat})`;
        document.getElementById('age-value').textContent = `${ageCount}명 (${agePercent}%)`;
        
        console.log("Stats display updated from Sheet data.");
    }

    // --- 구글 애널리틱스 관련 함수 ---
    async function getAnalyticsAccessToken(serviceAccount) {
        const header = { alg: 'RS256', typ: 'JWT' };
        const now = Math.floor(Date.now() / 1000);
        const claim = {
            iss: serviceAccount.client_email,
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600, iat: now
        };
        const sJWS = KJUR.jws.JWS.sign(null, JSON.stringify(header), JSON.stringify(claim), serviceAccount.private_key);
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${sJWS}`
        });
        if (!response.ok) throw new Error('Failed to get access token: ' + await response.text());
        return (await response.json()).access_token;
    }

    async function fetchAnalyticsData(accessToken) {
        const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:batchRunReports`, {
            method: 'POST',
            headers: {'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json'},
            body: JSON.stringify({
                "requests": [
                    { // 유입 경로 리포트
                        "dateRanges": [{ "startDate": "30daysAgo", "endDate": "today" }],
                        "dimensions": [{ "name": "sessionSourceMedium" }],
                        "metrics": [{ "name": "sessions" }]
                    },
                    { // 방문자 추이 리포트 (수정된 부분)
                        "dateRanges": [{ "startDate": "30daysAgo", "endDate": "today" }],
                        "dimensions": [{ "name": "date" }],
                        "metrics": [{ "name": "sessions" }],
                        "orderBys": [{ "dimension": { "dimensionName": "date", "orderType": "ALPHANUMERIC" } }]
                    }
                ]
            })
        });
        if (!response.ok) throw new Error('Failed to fetch GA data: ' + (await response.json()).error.message);
        return await response.json();
    }
    
    function processAnalyticsReports(response) {
        const sourceReport = response.reports[0];
        const trendReport = response.reports[1];
        
        // 유입 경로 처리
        const trafficStats = { naverCafe: 0, daumCafe: 0, kakaoChannel: 0, naverSearch: 0, googleSearch: 0, direct: 0, instagram: 0, other: 0 };
        let totalSessions = 0;

        if (sourceReport.rows) {
            sourceReport.rows.forEach(row => {
                const sourceMedium = row.dimensionValues[0].value.toLowerCase();
                const sessions = parseInt(row.metricValues[0].value, 10);
                totalSessions += sessions;

                if (sourceMedium.includes('cafe.naver.com')) trafficStats.naverCafe += sessions;
                else if (sourceMedium.includes('cafe.daum.net')) trafficStats.daumCafe += sessions;
                else if (sourceMedium.includes('pf.kakao')) trafficStats.kakaoChannel += sessions;
                else if (sourceMedium.includes('naver') && (sourceMedium.includes('search') || sourceMedium.includes('organic'))) trafficStats.naverSearch += sessions;
                else if (sourceMedium.includes('google') && sourceMedium.includes('organic')) trafficStats.googleSearch += sessions;
                else if (sourceMedium.includes('(direct)')) trafficStats.direct += sessions;
                else if (sourceMedium.includes('instagram')) trafficStats.instagram += sessions;
                else trafficStats.other += sessions;
            });
        }
        document.getElementById('total-visitors').textContent = totalSessions.toLocaleString();
        
        // 차트와 리스트를 모두 업데이트
        createTrafficSourceChart(trafficStats);
        updateTrafficSourceList(trafficStats, totalSessions);
        
        // 방문자 추이 차트 업데이트
        createVisitorsTrendChart(trendReport);
        
        console.log("Traffic, Trend, and List updated from GA data.");
    }

    // --- 차트 생성 함수들 ---
    let trafficChartInstance = null;
    function createTrafficSourceChart(trafficData) {
        const ctx = document.getElementById('trafficSourceChart').getContext('2d');
        const labels = {
            naverCafe: '네이버 카페', daumCafe: '다음 카페', kakaoChannel: '카카오 채널',
            naverSearch: '네이버 검색', googleSearch: '구글 검색', direct: '직접 유입',
            instagram: '인스타그램', other: '기타'
        };

        const filteredEntries = Object.entries(trafficData).filter(([, value]) => value > 0);
        const chartLabels = filteredEntries.map(([key]) => labels[key]);
        const chartData = filteredEntries.map(([, value]) => value);

        if (trafficChartInstance) {
            trafficChartInstance.destroy();
        }

        trafficChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartData.length > 0 ? chartLabels : ['데이터 없음'],
                datasets: [{
                    data: chartData.length > 0 ? chartData : [1],
                    backgroundColor: chartData.length > 0 ? ['#3182ce', '#38a169', '#d69e2e', '#805ad5', '#dd6b20', '#319795', '#e53e3e', '#718096'] : ['#E2E8F0'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${context.parsed.toLocaleString()}명`
                        }
                    }
                }
            }
        });
    }

    function updateTrafficSourceList(trafficStats, totalSessions) {
        const listContainer = document.getElementById('traffic-source-list-container');
        if (!listContainer) return;
        listContainer.innerHTML = ''; // 이전 목록 지우기

        const labels = {
            naverCafe: '네이버 카페', daumCafe: '다음 카페', kakaoChannel: '카카오 채널',
            naverSearch: '네이버 검색', googleSearch: '구글 검색', direct: '직접 유입',
            instagram: '인스타그램', other: '기타'
        };

        let hasData = false;
        for (const [key, label] of Object.entries(labels)) {
            const count = trafficStats[key] || 0;
            if (count > 0) hasData = true;
            const percentage = totalSessions > 0 ? ((count / totalSessions) * 100).toFixed(1) : 0;
            
            const statRow = document.createElement('div');
            statRow.className = 'stat-row';
            statRow.innerHTML = `<span>${label}</span><span>${count.toLocaleString()}명 (${percentage}%)</span>`;
            listContainer.appendChild(statRow);
        }

        if (!hasData) {
            listContainer.innerHTML = '<div class="stat-row"><span>데이터 없음</span><span></span></div>';
        }
    }

    let visitorsChartInstance = null;
    function createVisitorsTrendChart(trendData) {
        const ctx = document.getElementById('visitorsTrendChart').getContext('2d');
        const labels = [];
        const data = [];

        if (trendData.rows) {
            trendData.rows.forEach(row => {
                const dateStr = row.dimensionValues[0].value; // YYYYMMDD
                labels.push(`${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`);
                data.push(parseInt(row.metricValues[0].value, 10));
            });
        }
        
        if (visitorsChartInstance) visitorsChartInstance.destroy();
        
        visitorsChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length > 0 ? labels : ['데이터 없음'],
                datasets: [{
                    label: '방문자 수',
                    data: data.length > 0 ? data : [0],
                    borderColor: '#3182ce',
                    backgroundColor: 'rgba(49, 130, 206, 0.1)',
                    fill: true, tension: 0.1
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // --- 초기화 로직 ---
    function initialize() {
        // 1. 구글 시트 API 초기화
        gapi.load('client', () => {
            gapi.client.init({
                apiKey: GOOGLE_SHEETS_API_KEY,
                discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
            }).then(() => {
                console.log("Sheets API Initialized. Loading data...");
                loadSheetData();
            }, (error) => {
                console.error('Sheets API Init Error:', error);
                showError('구글 시트 API 초기화 실패: ' + JSON.stringify(error));
            });
        });

        // 2. 구글 애널리틱스 데이터 로드
        fetch(SERVICE_ACCOUNT_KEY_FILE)
            .then(response => {
                if (!response.ok) throw new Error(`Cannot find ${SERVICE_ACCOUNT_KEY_FILE}.`);
                return response.json();
            })
            .then(getAnalyticsAccessToken)
            .then(fetchAnalyticsData)
            .then(processAnalyticsReports)
            .catch(error => {
                console.error('GA Data Loading Error:', error);
                const trafficErrorElement = document.getElementById('traffic-error');
                if (trafficErrorElement) {
                    trafficErrorElement.textContent = '방문자 통계 로딩 오류: ' + error.message;
                    trafficErrorElement.style.display = 'block';
                }
            });
    }

    document.addEventListener('DOMContentLoaded', initialize);

})(); 