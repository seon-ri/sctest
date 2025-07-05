// 세온연구소 JavaScript - SPA 네비게이션 및 인터랙션

// 전역 변수들
let currentSection = 'home';
let currentSubSection = null;
let currentBoardTab = 'notice';
let posts = [];
let totalPosts = 0;
let currentPage = 1;

document.addEventListener('DOMContentLoaded', function() {
    console.log('[DOMContentLoaded] 초기화 시작');
    
    // 글쓰기 버튼 최우선으로 표시
    const writePostBtn = document.getElementById('write-post-btn');
    if (writePostBtn) {
        writePostBtn.classList.add('force-show');
    }

    // 게시판 섹션이 처음 활성화될 때 공지사항 탭을 강제로 한 번 실행
    const boardSection = document.getElementById('board');
    if (boardSection && boardSection.classList.contains('active')) {
        switchBoardTab('notice');
    }

    // SPA 네비게이션 및 인터랙션 초기화
    if (typeof initNavigation === 'function') initNavigation();
    if (typeof initMobileMenu === 'function') initMobileMenu();
    if (typeof initScrollEffects === 'function') initScrollEffects();
    if (typeof initCardEffects === 'function') initCardEffects();
    if (typeof initSmoothAnimations === 'function') initSmoothAnimations();
    if (typeof initTypingEffect === 'function') initTypingEffect();
    if (typeof initKeyboardNavigation === 'function') initKeyboardNavigation();
    if (typeof initLoadingAnimation === 'function') initLoadingAnimation();
    if (typeof initLazyLoading === 'function') initLazyLoading();
    if (typeof initRippleEffect === 'function') initRippleEffect();

    // 통합 이벤트 위임 - 모든 네비게이션 이벤트 처리
    document.addEventListener('click', function(e) {
        console.log('[Event] 클릭된 요소:', e.target.tagName, e.target.className);

       // 홈페이지 게시글 링크 클릭
// 기존 document.addEventListener('click', function(e) { ... }) 내부에 추가해야 하는 코드
const postLink = e.target.closest('.home-post-link');
if (postLink) {
  e.preventDefault();
  const postId = postLink.getAttribute('data-id');
  console.log('[HomePost] 정확 클릭 감지:', postId);
  if (postId) {
      e.preventDefault();  // ✅ postId가 있을 때만 기본 이벤트 막기
      console.log('[HomePost] 정확 클릭 감지:', postId);
      loadPostDetail(postId);
    }
    return; // 이후 이벤트 중단 (중복 실행 방지)
  }
        
        // 메뉴바(nav-link) 클릭 이벤트 연결
        if (e.target.classList.contains('nav-link')) {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            console.log('[Nav] 메뉴 클릭:', section);
            if (section) showSection(section);
            return;
        }
        
        // 드롭다운(dropdown-item) 클릭 이벤트 연결
        if (e.target.classList.contains('dropdown-item')) {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            const subsection = e.target.getAttribute('data-subsection');
            console.log('[Dropdown] 드롭다운 클릭:', section, subsection);
            if (section) showSection(section, subsection);
            return;
        }
        
        // 퀵메뉴(quick-menu-item) 클릭 이벤트 연결
        if (e.target.closest('.quick-menu-item')) {
            e.preventDefault();
            const quickMenuItem = e.target.closest('.quick-menu-item');
            const idx = Array.from(document.querySelectorAll('.quick-menu-item')).indexOf(quickMenuItem);
            console.log('[QuickMenu] 퀵메뉴 클릭, 인덱스:', idx);
            
            if (idx === 0) showSection('about', 'contact'); // 상담예약 → 소개-상담절차
            else if (idx === 1) showSection('services', 'education'); // 교육프로그램 → 전문서비스-구속전교육
            else if (idx === 2) showSection('services', 'testing'); // 심리검사 → 전문서비스-심리검사
            else if (idx === 3) showSection('home'); // 수료증 출력 → 홈
            return;
        }
        
        // 서브네비(sub-nav-link) 클릭 이벤트 연결
        if (e.target.classList.contains('sub-nav-link')) {
            e.preventDefault();
            const section = e.target.closest('.content-section').id;
            const subsection = e.target.getAttribute('data-subsection');
            console.log('[SubNav] 서브네비 클릭:', section, subsection);
            if (section && subsection) {
                showSubSection(section, subsection);
                // 활성화 표시
                e.target.closest('.sub-nav-list').querySelectorAll('.sub-nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            }
            return;
        }



        // '처음으로' 클릭
        if (e.target.classList.contains('home-link') || e.target.closest('.home-link')) {
            e.preventDefault();
            console.log('[Home] 처음으로 클릭');
            showSection('home'); 
            const header = document.getElementById('header');
            if (header) header.style.transform = 'translateY(0)';
            return;
        }
        
        // 로고 클릭
        if (e.target.closest('.logo-link')) {
            e.preventDefault();
            console.log('[Logo] 로고 클릭');
            showSection('home'); 
            return;
        }
        
        // 글쓰기 버튼
        if (e.target.id === 'write-post-btn' || e.target.closest('#write-post-btn')) {
            e.preventDefault();
            console.log('[Write] 글쓰기 버튼 클릭');
            showWritePostModal();
            return;
        }
        
        // 로그인 버튼
        if (e.target.classList.contains('login-btn')) {
            e.preventDefault();
            console.log('[Login] 로그인 버튼 클릭');
            showLoginModal();
            return;
        }
        
        // 로그아웃 버튼
        if (e.target.classList.contains('logout-btn')) {
            e.preventDefault();
            console.log('[Logout] 로그아웃 버튼 클릭');
            logout();
            return;
        }
        
        // 회원가입 링크
        if (e.target.classList.contains('register-link')) {
            e.preventDefault();
            console.log('[Register] 회원가입 링크 클릭');
            showRegisterModal();
            return;
        }
        
        // 모달 닫기 버튼
        if (e.target.classList.contains('close')) {
            e.preventDefault();
            console.log('[Modal] 닫기 버튼 클릭');
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
            return;
        }
        
        // 모달 취소 버튼
        if (e.target.classList.contains('btn-secondary') && e.target.textContent === '취소') {
            e.preventDefault();
            console.log('[Modal] 취소 버튼 클릭');
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
              }
            return;
        }
 
        // 홈화면 +버튼 클릭
        if (e.target.classList.contains('home-notice-plus')) {
            e.preventDefault();
            const target = e.target.getAttribute('data-target');
            console.log('[HomePlus] +버튼 클릭, 타겟:', target);
            showSection('board');
            if (target) switchBoardTab(target);
            return;
        }
    });

    // 게시판 탭 이벤트 위임
    const boardTabs = document.querySelector('.board-tabs');
    if (boardTabs) {
        boardTabs.addEventListener('click', function(e) {
            if (e.target.classList.contains('tab-btn')) {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                console.log('[BoardTab] 탭 클릭:', category);
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                switchBoardTab(category);
            }
        });
    }

    // 초기 로드
    loadHomepagePosts();

if (location.hash === '#board' && sessionStorage.getItem('scrollToBoard')) {
    showSection('board');
    sessionStorage.removeItem('scrollToBoard');
}
    console.log('[DOMContentLoaded] 초기화 완료');
});

// 섹션 표시 함수 (디버깅 로그 추가)
function showSection(sectionId, subsectionId = null) {
    console.log('[showSection] 호출됨 - sectionId:', sectionId, 'subsectionId:', subsectionId);
    
    // 모든 섹션 숨기기
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    
    // 선택된 섹션 표시
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        currentSubSection = subsectionId;
        console.log('[showSection] 섹션 활성화 성공:', sectionId);
        
        // 게시판 섹션인 경우 탭 처리
        if (sectionId === 'board') {
            console.log('[showSection] 게시판 섹션 - 탭 처리');
            switchBoardTab(currentBoardTab);
        }
        
        // 홈 섹션인 경우 게시글 로드
        if (sectionId === 'home') {
            console.log('[showSection] 홈 섹션 - 게시글 로드');
            loadHomepagePosts();
        }
        
        // subsection이 있을 때 해당 서브네비 버튼 active 처리
        if (subsectionId) {
            setTimeout(() => {
                const subNavLinks = document.querySelectorAll(`#${sectionId} .sub-nav-link`);
                subNavLinks.forEach(link => {
                    if (link.getAttribute('data-subsection') === subsectionId) {
                        link.classList.add('active');
                        console.log('[showSection] 서브네비 활성화:', subsectionId);
                    } else {
                        link.classList.remove('active');
                    }
                });
            }, 10);
        }
    } else {
        console.warn('[showSection] 섹션을 찾을 수 없음:', sectionId);
    }
    
    // 서브섹션이 있는 경우 처리
    if (subsectionId) {
        showSubSection(sectionId, subsectionId);
    }
}

// 서브섹션 표시 함수 (디버깅 로그 추가)
function showSubSection(sectionId, subsectionId) {
    console.log('[showSubSection] 호출됨 - sectionId:', sectionId, 'subsectionId:', subsectionId);
    
    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) {
        console.warn('[showSubSection] 섹션을 찾을 수 없음:', sectionId);
        return;
    }
    
    // 모든 서브콘텐츠 숨기기
    sectionElement.querySelectorAll('.sub-content').forEach(content => content.classList.remove('active'));
    
    // 선택된 서브콘텐츠 표시
    const targetSubContent = document.getElementById(`${sectionId}-${subsectionId}`);
    if (targetSubContent) {
        targetSubContent.classList.add('active');
        console.log('[showSubSection] 서브콘텐츠 활성화 성공:', `${sectionId}-${subsectionId}`);
    } else {
        console.warn('[showSubSection] 서브콘텐츠를 찾을 수 없음:', `${sectionId}-${subsectionId}`);
    }
}

// 게시판 탭 전환 함수 (디버깅 로그 추가)
function switchBoardTab(category) {
    console.log('[switchBoardTab] 호출됨 - category:', category);
    currentBoardTab = category;
    loadPosts(1, category);
}

// 카테고리 라벨 반환 함수
function getCategoryLabel(category) {
    const labels = {
        'notice': '공지사항',
        'case-cipher': 'Case Cipher',
        'general': '일반게시판',
        'qna': '질문과답변'
    };
    return labels[category] || category;
}

// 게시글 로드 함수
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
const result = await response.json(); // 변수명 변경

if (result.success) {
    posts = result.data.posts || [];
    totalPosts = result.data.totalPosts || 0;
            
            // 공지사항이 있는 경우 별도 처리
            if (category === 'notice' || category === 'all') {
                const noticePosts = posts.filter(post => post.isNotice);
                renderNoticePosts(noticePosts);
                document.getElementById('notice-section').style.display = noticePosts.length > 0 ? 'block' : 'none';
            } else {
                document.getElementById('notice-section').style.display = 'none';
            }
            
            renderPosts();
            renderPagination();
            updatePostCount();
        }
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        showMessage('게시글을 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// 홈페이지 게시글 로드 함수
async function loadHomepagePosts() {
    try {
        // 공지사항 로드
        const noticeResponse = await fetch('/api/board/posts?category=notice&limit=5');
        const noticeData = await noticeResponse.json();
        if (noticeData.success) {
            renderHomepagePostList(noticeData.data.posts, 'home-notice-list');
        }
        
        // Case Cipher 로드
        const caseResponse = await fetch('/api/board/posts?category=case-cipher&limit=5');
        const caseData = await caseResponse.json();
        if (caseData.success) {
            renderHomepagePostList(caseData.data.posts, 'home-case-list');
        }
    } catch (error) {
        console.error('홈페이지 게시글 로드 실패:', error);
    }
}

// 게시글 수 업데이트 함수
function updatePostCount() {
    const postCountElement = document.getElementById('post-count');
    if (postCountElement) {
        postCountElement.textContent = `(총 ${totalPosts}개)`;
    }
}

// 날짜 포맷 함수
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

// 메시지 표시 함수
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

// 모달 관련 함수들
function showLoginModal() {
    document.getElementById('login-modal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
}

function showRegisterModal() {
    document.getElementById('register-modal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('register-modal').style.display = 'none';
}

function showWritePostModal() {
    document.getElementById('write-post-modal').style.display = 'block';
}

function closeWritePostModal() {
    document.getElementById('write-post-modal').style.display = 'none';
}

// 공지사항 렌더링
const renderNoticePosts = (noticePosts) => {
    const noticeContainer = document.getElementById('notice-posts');
    if (noticePosts.length === 0) {
        noticeContainer.innerHTML = '<p class="no-notice">등록된 공지사항이 없습니다.</p>';
        return;
    }
    const noticeHTML = noticePosts.map(post => `
        <div class="notice-post-item" data-id="${post._id}">
            <div class="notice-post-header">
                <span class="notice-badge">📢 공지</span>
                <span class="notice-title">${post.title}</span>
                <span class="notice-date">${formatDate(post.createdAt)}</span>
            </div>
        </div>
    `).join('');
    noticeContainer.innerHTML = noticeHTML;

    // 이벤트 리스너 연결
    noticeContainer.querySelectorAll('.notice-post-item').forEach(item => {
        item.addEventListener('click', function() {
            const postId = item.getAttribute('data-id');
        if (postId) {
            console.log('🔍 공지사항 상세보기 요청 postId:', postId);
            showPostDetailPage(postId);
        } else {
            console.warn('⚠️ 공지사항 postId 없음');
            }
        });
    });
}; // ✅ 전체 함수 닫는 괄호 추가

// 게시글 렌더링 (테이블 형태로 업데이트)
const renderPosts = () => {
    const container = document.getElementById('posts-container');
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

    // 이벤트 리스너 연결
    container.querySelectorAll('.post-row').forEach(row => {
        row.addEventListener('click', function() {
            const postId = row.getAttribute('data-id');
            showPostDetailPage(postId);
        });
    });
};

// 홈페이지 게시글 목록 렌더링 (공지사항/Case Cipher)
const renderHomepagePostList = (posts, containerId) => {
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

};

// 게시글 상세 모달 표시 함수 (올바르게 수정됨)
const showPostDetailModal = (post) => {
    try {
        console.log('🟢 모달 진입 성공', post);
        console.log('📝 게시글 내용:', post.content); // 내용 확인용 로그

        const modal = document.createElement('div');
        modal.className = 'modal post-detail-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${post.title || '제목 없음'}</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="post-meta">
                        <span>작성자: ${post.author ? (post.author.name || post.author.username) : '관리자'}</span>
                        <span>작성일: ${formatDate(post.createdAt)}</span>
                        <span>조회수: ${post.viewCount || 0}</span>
                    </div>
                    <div class="post-content">
                        ${post.content || '내용이 없습니다.'}
                    </div>
                    <div class="post-actions">
                        <button class="edit-btn" data-post-id="${post._id}">
                            ✏️ 수정하기
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        // 모달 닫기
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // 수정 버튼 이벤트
        const editBtn = modal.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            closeModal(modal);  // 기존 모달 닫기
            openEditPostForm(post);  // 수정 폼 열기
            console.log('✏️ 수정폼 열기', post);
        });

    } catch (e) {
        console.error('❌ 모달 생성 실패:', e);
    }
};

// 페이지네이션 렌더링 (업데이트)
const renderPagination = () => {
    const container = document.getElementById('pagination');
    const totalPages = Math.ceil(totalPosts / 15);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    let paginationHTML = '';
    // 이전 페이지 버튼
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}">이전</button>`;
    }
    // 페이지 번호들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}">다음</button>`;
    }
    container.innerHTML = paginationHTML;
    // 페이지네이션 버튼 이벤트 리스너 연결
    container.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = parseInt(btn.getAttribute('data-page'));
            loadPosts(page, currentBoardTab === 'all' ? null : currentBoardTab);
        });
    });
};

// 게시판 카테고리별 리스트 렌더링 함수
async function loadBoardCategoryLists() {
    // 공지사항
    try {
        const noticeRes = await fetch('/api/board/posts?category=notice&limit=10');
        const noticeData = await noticeRes.json();
        renderBoardCategoryList(noticeData.posts || [], 'board-notice-list');
    } catch (e) { renderBoardCategoryList([], 'board-notice-list'); }
    // Case Cipher
    try {
        const caseRes = await fetch('/api/board/posts?category=case-cipher&limit=10');
        const caseData = await caseRes.json();
        renderBoardCategoryList(caseData.posts || [], 'board-case-list');
    } catch (e) { renderBoardCategoryList([], 'board-case-list'); }
    // 일반게시판
    try {
        const generalRes = await fetch('/api/board/posts?category=general&limit=10');
        const generalData = await generalRes.json();
        renderBoardCategoryList(generalData.posts || [], 'board-general-list');
    } catch (e) { renderBoardCategoryList([], 'board-general-list'); }
}

function renderBoardCategoryList(posts, containerId) {
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
    container.querySelectorAll('.home-post-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = link.getAttribute('data-id');
            showPostDetailPage(postId);
        });
    });
}

// 게시판 섹션이 활성화될 때 카테고리별 리스트 로드
const boardSection = document.getElementById('board');
if (boardSection) {
    const observer = new MutationObserver(() => {
        if (boardSection.classList.contains('active')) {
            loadBoardCategoryLists();
        }
    });
    observer.observe(boardSection, { attributes: true, attributeFilter: ['class'] });
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
        console.log('응답 결과:', result);

        if (result.success) {
            showMessage(isEdit ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.', 'success');
            closeWritePostModal();

            if (!isEdit) {
                form.reset(); // 작성일 때만 초기화
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


// 게시글 상세 조회 함수
function showPostDetailPage(postId) {
    window.location.href = `/post-detail.html?id=${postId}`;
}

// 좋아요 토글 함수
async function toggleLike(postId, buttonElement) {
    if (!currentUser) {
        showMessage('로그인이 필요합니다.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/board/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 버튼 텍스트 업데이트
            const likeCount = result.data.likeCount;
            buttonElement.textContent = `❤️ 좋아요 (${likeCount})`;
        } else {
            showMessage(result.message || '좋아요 처리에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('좋아요 토글 에러:', error);
        showMessage('서버 오류가 발생했습니다.', 'error');
    }
}

// 댓글 작성 함수
async function submitComment(postId) {
    const commentContent = document.getElementById('comment-content');
    const content = commentContent.value.trim();
    
    if (!content) {
        showMessage('댓글 내용을 입력해주세요.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/board/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content })
        });
        
        const result = await response.json();
        
        if (result.success) {
            commentContent.value = '';
            showMessage('댓글이 작성되었습니다.', 'success');
            // 댓글 목록 새로고침 (모달 내에서)
            // 실제로는 모달을 다시 로드하거나 댓글만 업데이트
        } else {
            showMessage(result.message || '댓글 작성에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('댓글 작성 에러:', error);
        showMessage('서버 오류가 발생했습니다.', 'error');
    } 
} 

// 댓글 렌더링 함수
function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<p>아직 댓글이 없습니다.</p>';
    }
    
    return comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.author.name || comment.author.username}</span>
                <span class="comment-date">${formatDate(comment.createdAt)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
} 

function openEditPostForm(post) {
    const modal = document.getElementById('write-post-modal');
    if (!modal) {
        console.error('❌ write-post-modal not found');
        return;
    }
    modal.style.display = 'block';

    const form = document.getElementById('write-post-form');
    if (!form) {
        console.error('❌ write-post-form not found');
        return;
    }

    console.log('✏️ 수정폼 열기', post);

    // 필드 연결
    const titleInput = form.querySelector('input[name="title"]');
    const contentTextarea = form.querySelector('textarea[name="content"]');
    const categorySelect = form.querySelector('select[name="category"]');

    // 확인 로그
    console.log('🎯 필드 확인:', titleInput, contentTextarea, categorySelect);

    if (!titleInput || !contentTextarea || !categorySelect) {
        console.error('❌ 입력 필드를 찾을 수 없습니다');
        return;
    }

    // 데이터 채우기
    titleInput.value = post.title || '';
    contentTextarea.value = post.content || '';
setTimeout(() => {
  categorySelect.value = post.category || 'notice';
  categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
  categorySelect.blur(); // 포커스 뺐다가
  categorySelect.focus(); // 다시 포커스 줘서 브라우저 렌더링 강제
categorySelect.style.color = 'black';
categorySelect.style.backgroundColor = 'lightyellow';
categorySelect.style.opacity = '1';
categorySelect.style.visibility = 'visible';
categorySelect.style.zIndex = '1000';
}, 10);


    // 모드 설정
    form.dataset.mode = 'edit';
    form.dataset.postId = post._id;

    // 버튼 텍스트 바꾸기
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = '수정 완료';
    }
}


function closeModal(modalElement) {
    if (modalElement && modalElement.parentNode) {
        modalElement.parentNode.removeChild(modalElement);
    }
}
// script.js 파일 맨 아래에 추가할 코드

// loadPostDetail 함수 강제 재정의 (다른 곳에서 덮어쓰는 것 방지)
window.loadPostDetail = function(postId) {
    console.log('올바른 loadPostDetail 실행:', postId);
    window.location.href = `/post-detail.html?id=${postId}`;
};
