// ================================
// 세온연구소 JavaScript - 정리된 버전
// Index.html에 맞춤 최적화
// ================================

// 전역 변수
let currentSection = 'home';
let currentSubsection = null;
let currentBoardTab = 'notice';
let posts = [];
let totalPosts = 0;
let currentPage = 1;
let currentUser = null;

// 섹션 매핑 (새로운 HTML 구조에 맞춤)
const sectionMapping = {
    'home': 'home',
    'about': 'about',
    'education-counseling': 'education-counseling',
    'evaluation': 'evaluation',
    'analysis': 'analysis',
    'education-research': 'education-research',
    'board': 'board'
};

// 서브섹션 매핑 (새로운 구조에 맞춤)
const subsectionMapping = {
    'about': ['intro', 'members', 'contact', 'location'],
    'education-counseling': ['process', 'programs', 'counseling'],
    'evaluation': ['recidivism', 'sexual-violence', 'comprehensive', 'victim', 'education-effect'],
    'analysis': ['statement', 'sentencing', 'case-analysis'],
    'education-research': ['training', 'development']
};

// ================================
// DOM 로드 및 초기화
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[DOMContentLoaded] 초기화 시작');
    
       
    // 초기 화면 설정
    showSection('home');
    loadHomepagePosts();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 브라우저 히스토리 관리
    setupHistoryManagement();
    
    console.log('[DOMContentLoaded] 초기화 완료');
});

// ================================
// 이벤트 리스너 설정
// ================================

function setupEventListeners() {
    // 통합 클릭 이벤트 처리
    document.addEventListener('click', function(e) {
        handleGlobalClick(e);
    });
    
    // 게시판 탭 이벤트
    const boardTabs = document.querySelector('.board-tabs');
    if (boardTabs) {
        boardTabs.addEventListener('click', function(e) {
            if (e.target.classList.contains('tab-btn')) {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                switchBoardTab(category);
            }
        });
    }
    
    // 글쓰기 폼 이벤트
    const writePostForm = document.getElementById('write-post-form');
    if (writePostForm) {
        writePostForm.addEventListener('submit', handleWritePostSubmit);
    }
}

// ================================
// 클릭 이벤트 처리
// ================================

function handleGlobalClick(e) {
    // 홈페이지 게시글 링크
    const postLink = e.target.closest('.home-post-link');
    if (postLink) {
        e.preventDefault();
        const postId = postLink.getAttribute('data-id');
        if (postId) {
            loadPostDetail(postId);
        }
        return;
    }
    
    // 메인 네비게이션
    if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        const section = e.target.getAttribute('data-section');
        if (section) {
            showSection(section);
            updateActiveNavigation(section);
        }
        return;
    }
    
    // 드롭다운 메뉴
    if (e.target.classList.contains('dropdown-item')) {
        e.preventDefault();
        const section = e.target.getAttribute('data-section');
        const subsection = e.target.getAttribute('data-subsection');
        if (section) {
            showSection(section, subsection);
        }
        return;
    }
    
    // 서브 네비게이션
    if (e.target.classList.contains('sub-nav-link')) {
        e.preventDefault();
        const section = e.target.closest('.content-section').id;
        const subsection = e.target.getAttribute('data-subsection');
        if (section && subsection) {
            showSubsection(section, subsection);
            updateSubNavigation(section, subsection);
        }
        return;
    }
    
    // 퀵메뉴
    const quickMenuItem = e.target.closest('.quick-menu-item');
    if (quickMenuItem) {
        e.preventDefault();
        handleQuickMenuClick(quickMenuItem);
        return;
    }
    
    // 로고 및 홈 링크
    if (e.target.closest('.logo-link') || e.target.classList.contains('home-link') || e.target.closest('.home-link')) {
        e.preventDefault();
        showSection('home');
        return;
    }
    
    // 홈페이지 더보기 버튼
    if (e.target.classList.contains('home-notice-plus')) {
        e.preventDefault();
        const target = e.target.getAttribute('data-target');
        showSection('board');
        if (target) {
            switchBoardTab(target);
        }
        return;
    }
    
    // FAQ 아코디언
    if (e.target.classList.contains('faq-question')) {
        e.preventDefault();
        toggleFAQ(e.target);
        return;
    }
      // 모바일 메뉴 처리
    if (e.target.closest('.mobile-fixed-menu')) {
        const menuItem = e.target.closest('.menu-item');
        if (menuItem) {
            e.preventDefault();
            const href = menuItem.getAttribute('href');
            console.log('전체 href:', href);
            
            if (href && href.startsWith('#')) {
                const section = href.substring(1); // # 제거
                console.log('추출된 섹션 전체:', section);
                showSection(section);
                return; // 이 return은 함수 안에 있어야 함
            }
        }
        return; // 이것도 함수 안에 있어야 함
    }
    // 모달 관련
    handleModalClicks(e);
    
    // 게시글 행 클릭
    const postRow = e.target.closest('.post-row');
    if (postRow) {
        const postId = postRow.getAttribute('data-id');
        if (postId) {
            loadPostDetail(postId);
        }
        return;
    }
}

// ================================
// 섹션 관리
// ================================

function showSection(sectionId, subsectionId = null, skipPush = false) {
    console.log('[showSection] 호출됨 - sectionId:', sectionId, 'subsectionId:', subsectionId);
    
    // 브라우저 히스토리 관리
    if (!skipPush) {
        const newUrl = subsectionId ? `#${sectionId}-${subsectionId}` : `#${sectionId}`;
        history.pushState({ section: sectionId, subsection: subsectionId }, '', newUrl);
    }
    
    // 모든 섹션 숨기기
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 선택된 섹션 표시
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        currentSubsection = subsectionId;
        
        // 섹션별 특별 처리
        handleSectionSpecificLogic(sectionId, subsectionId);
        
        // 서브섹션 처리
        if (subsectionId && subsectionMapping[sectionId]) {
            showSubsection(sectionId, subsectionId);
        } else if (subsectionMapping[sectionId]) {
            // 첫 번째 서브섹션을 기본으로 표시
            showSubsection(sectionId, subsectionMapping[sectionId][0]);
        }
        
        // 네비게이션 업데이트
        updateActiveNavigation(sectionId);
        
        // 페이지 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        console.log('[showSection] 섹션 활성화 성공:', sectionId);
    } else {
        console.warn('[showSection] 섹션을 찾을 수 없음:', sectionId);
    }
}

function showSubsection(sectionId, subsectionId) {
    console.log('[showSubsection] 호출됨 - sectionId:', sectionId, 'subsectionId:', subsectionId);
  
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) {
        console.warn('[showSubsection] 섹션을 찾을 수 없음:', sectionId);
        return;
    }
  
    // 모든 서브콘텐츠 숨기기
    sectionElement.querySelectorAll('.sub-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 선택된 서브콘텐츠 표시
    const targetSubcontent = document.getElementById(`${sectionId}-${subsectionId}`);
    if (targetSubcontent) {
        targetSubcontent.classList.add('active');
        currentSubsection = subsectionId;
        console.log('[showSubsection] 서브콘텐츠 활성화 성공:', `${sectionId}-${subsectionId}`);
    } else {
        console.warn('[showSubsection] 서브콘텐츠를 찾을 수 없음:', `${sectionId}-${subsectionId}`);
    }
    
    // 서브 네비게이션 업데이트
    updateSubNavigation(sectionId, subsectionId);
}

function handleSectionSpecificLogic(sectionId, subsectionId) {
    switch(sectionId) {
        case 'home':
            loadHomepagePosts();
            break;
        case 'board':
            switchBoardTab(currentBoardTab);
            break;
        default:
            break;
    }
}

// ================================
// 네비게이션 업데이트
// ================================

function updateActiveNavigation(sectionId) {
    // 모든 네비게이션 링크에서 active 클래스 제거
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 현재 섹션에 해당하는 네비게이션 링크 활성화
    const activeNavLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeNavLink && activeNavLink.classList.contains('nav-link')) {
        activeNavLink.classList.add('active');
    }
}

function updateSubNavigation(sectionId, subsectionId) {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
        // 서브 네비게이션 링크 업데이트
        sectionElement.querySelectorAll('.sub-nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // 해당 서브 네비게이션 링크 활성화
        const activeSubNavLink = sectionElement.querySelector(`[data-subsection="${subsectionId}"]`);
        if (activeSubNavLink) {
            activeSubNavLink.classList.add('active');
        }
    }
}

// ================================
// 퀵메뉴 처리
// ================================

function handleQuickMenuClick(quickMenuItem) {
    const quickMenuItems = Array.from(document.querySelectorAll('.quick-menu-item'));
    const index = quickMenuItems.indexOf(quickMenuItem);
    
    console.log('[QuickMenu] 퀵메뉴 클릭, 인덱스:', index);
    
    switch(index) {
        case 0: // 상담예약
            showSection('about', 'contact');
            break;
        case 1: // 교육신청
            showSection('education-counseling', 'process');
            break;
        case 2: // 평가신청
            showSection('evaluation', 'recidivism');
            break;
        case 3: // 서류신청
            alert("수료증은 교육 완료 후 발급됩니다.");
            break;
        default:
            console.warn('[QuickMenu] 알 수 없는 퀵메뉴 인덱스:', index);
    }
}

// ================================
// FAQ 기능
// ================================

function toggleFAQ(questionElement) {
    const answer = questionElement.nextElementSibling;
    const isActive = answer.style.display === 'block';
    
    // 모든 FAQ 답변 닫기
    document.querySelectorAll('.faq-answer').forEach(ans => {
        ans.style.display = 'none';
    });
    
    // 현재 클릭된 FAQ만 열기/닫기
    if (!isActive) {
        answer.style.display = 'block';
    }
}

// ================================
// 브라우저 히스토리 관리
// ================================

function setupHistoryManagement() {
    // 뒤로가기 버튼 처리
    window.addEventListener('popstate', function(event) {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const [main, sub] = hash.split('-');
            showSection(main, sub || null, true);
        } else {
            showSection('home', null, true);
        }
    });

    
    // 초기 URL 해시 처리
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
        const [main, sub] = initialHash.split('-');
        if (sectionMapping[main]) {
            showSection(main, sub || null, true);
        }
    }
}

// ================================
// 게시판 관련 함수들
// ================================

function switchBoardTab(category) {
    console.log('[switchBoardTab] 호출됨 - category:', category);
    currentBoardTab = category;
    
    // 탭 버튼 활성화 상태 업데이트
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-category="${category}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // 게시글 로드
    loadPosts(1, category);
}

async function loadPosts(page = 1, category = null) {
    try {
        currentPage = page;
        const params = new URLSearchParams({
            page: page,
            limit: 15
        });
        
        if (category && category !== 'all') {
            params.append('category', category);
        }
        
        const response = await fetch(`/api/board/posts?${params}`);
        const result = await response.json();
        
        if (result.success) {
            posts = result.data.posts || [];
            totalPosts = result.data.totalPosts || 0;
            
            renderPosts();
            renderPagination();
            updatePostCount();
        }
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        showMessage('게시글을 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

async function loadHomepagePosts() {
    try {
        // 게시판 로드
        const noticeResponse = await fetch('/api/board/posts?category=notice&limit=5');
        const noticeData = await noticeResponse.json();
        if (noticeData.success) {
            renderHomepagePostList(noticeData.data.posts, 'home-notice-list');
        }
        
        // Case Cipher 로드
      /*   const caseResponse = await fetch('/api/board/posts?category=case-cipher&limit=5');
        const caseData = await caseResponse.json();
        if (caseData.success) {
            renderHomepagePostList(caseData.data.posts, 'home-case-list');
        } */
    } catch (error) {
        console.error('홈페이지 게시글 로드 실패:', error);
    }
}


// ================================
// 게시글 렌더링 함수들
// ================================

function renderPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="no-posts">
                    <div class="no-posts-content">
                        <p>등록된 게시글이 없습니다.</p>
                        <p>첫 번째 게시글을 작성해보세요!</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const postsHTML = posts.map((post, index) => {
        const rowNumber = (currentPage - 1) * 15 + index + 1;
        return `
            <tr class="post-row" data-id="${post._id}">
                <td class="col-number">${rowNumber}</td>
                <td class="col-category">
                    <span class="post-category ${post.category}">${getCategoryLabel(post.category)}</span>
                </td>
                <td class="col-title">
                    <span class="post-title">${post.title}</span>
                    ${post.commentCount > 0 ? `<span class="comment-count">[${post.commentCount}]</span>` : ''}
                </td>
                <td class="col-author">
                    ${post.author ? (post.author.name || post.author.username) : '관리자'}
                </td>
                <td class="col-date">${formatDate(post.createdAt)}</td>
                <td class="col-views">${post.views || 0}</td>
            </tr>
        `;
    }).join('');
    
    container.innerHTML = postsHTML;
}

function renderHomepagePostList(posts, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<li>등록된 게시글이 없습니다.</li>';
        return;
    }
    
    const postsHTML = posts.map(post => `
        <li>
            <a href="#" class="home-post-link" data-id="${post._id}">${post.title}</a>
            <span class="info-post-date">${formatDate(post.createdAt)}</span>
        </li>
    `).join('');
    
    container.innerHTML = postsHTML;
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = Math.ceil(totalPosts / 15);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // 이전 페이지 버튼
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage - 1})">‹</button>`;
    }
    
    // 페이지 번호들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" onclick="changePage(${currentPage + 1})">›</button>`;
    }
    
    container.innerHTML = paginationHTML;
}

// ================================
// 모달 관련 함수들
// ================================

function handleModalClicks(e) {
    // 글쓰기 버튼
    if (e.target.id === 'write-post-btn' || e.target.closest('#write-post-btn')) {
        e.preventDefault();
        showWritePostModal();
        return;
    }
    
    // 모달 닫기 버튼
    if (e.target.classList.contains('close')) {
        e.preventDefault();
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
        return;
    }
    
    // 모달 취소 버튼
    if (e.target.classList.contains('btn-secondary') && e.target.textContent === '취소') {
        e.preventDefault();
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.style.display = 'none';
        }
        return;
    }
}

function showWritePostModal() {
    const modal = document.getElementById('write-post-modal');
    if (modal) {
        modal.style.display = 'block';
        
        // 폼 초기화
        const form = document.getElementById('write-post-form');
        if (form) {
            form.reset();
            form.dataset.mode = '';
            form.dataset.postId = '';
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = '작성 완료';
            }
        }
    }
}

async function handleWritePostSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const isEdit = form.dataset.mode === 'edit';
    const postId = form.dataset.postId;
    
    const postData = {
        title: form.querySelector('input[name="title"]').value,
        content: form.querySelector('textarea[name="content"]').value,
        category: form.querySelector('select[name="category"]').value
    };
    
    if (!postData.title || !postData.content || !postData.category) {
        showMessage('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = isEdit ? '수정 중...' : '작성 중...';
    submitBtn.disabled = true;
    
    try {
        let response;
        if (isEdit) {
            response = await fetch(`/api/board/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
        } else {
            response = await fetch('/api/board/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(postData)
            });
        }
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(isEdit ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.', 'success');
            
            // 모달 닫기
            const modal = document.getElementById('write-post-modal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            if (!isEdit) {
                form.reset();
            }
            
            form.dataset.mode = '';
            form.dataset.postId = '';
            
            loadPosts(1, currentBoardTab);
        } else {
            showMessage(result.message || '게시글 작성에 실패했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('게시글 작성 에러:', error);
        showMessage('서버 오류가 발생했습니다.', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ================================
// 유틸리티 함수들
// ================================

function getCategoryLabel(category) {
    const labels = {
        'notice': '게시판',
        //'case-cipher': 'Case Cipher',//
        'general': '일반게시판',
        'qna': 'Q&A'
    };
    return labels[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return '오늘';
    } else if (diffDays === 2) {
        return '어제';
    } else if (diffDays <= 7) {
        return `${diffDays - 1}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR');
    }
}

function updatePostCount() {
    const postCountElement = document.getElementById('post-count');
    if (postCountElement) {
        postCountElement.textContent = `(총 ${totalPosts}개)`;
    }
}

function showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    if (!container) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    container.appendChild(messageElement);
    
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 3000);
}

function loadPostDetail(postId) {
    console.log('게시글 상세보기:', postId);
    window.location.href = `/post-detail.html?id=${postId}`;
}

// ================================
// 전역 함수 (HTML에서 사용)
// ================================

function changePage(page) {
    currentPage = page;
    loadPosts(page, currentBoardTab === 'all' ? null : currentBoardTab);
}

// 전역 함수로 내보내기
window.showSection = showSection;
window.showSubsection = showSubsection;
window.changePage = changePage;
window.loadPostDetail = loadPostDetail;
