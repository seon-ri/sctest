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

// 섹션 매핑
const sectionMapping = {
    'home': 'home',
    'about': 'about',
    'education-counseling': 'education-counseling',
    'evaluation': 'evaluation',
    'analysis': 'analysis',
    'education-research': 'education-research',
    'board': 'board'
};

// 서브섹션 매핑
const subsectionMapping = {
    'about': ['intro', 'members', 'contact', 'directions', 'faq', 'location'],
    'education-counseling': ['process', 'programs', 'counseling'],
    'evaluation': ['recidivism', 'sexual-violence', 'comprehensive', 'victim', 'education-effect'],
    'analysis': ['statement', 'sentencing'],
    'education-research': ['training', 'development']
};

// ================================
// DOM 로드 및 초기화
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('[DOMContentLoaded] 초기화 시작');

    showSection('home');
    loadHomepagePosts();
    setupEventListeners();
    setupHistoryManagement();

    console.log('[DOMContentLoaded] 초기화 완료');
});

// ================================
// 이벤트 리스너 설정
// ================================

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        handleGlobalClick(e);
    });

    var boardTabs = document.querySelector('.board-tabs');
    if (boardTabs) {
        boardTabs.addEventListener('click', function(e) {
            if (e.target.classList.contains('tab-btn')) {
                e.preventDefault();
                var category = e.target.getAttribute('data-category');
                switchBoardTab(category);
            }
        });
    }

    var writePostForm = document.getElementById('write-post-form');
    if (writePostForm) {
        writePostForm.addEventListener('submit', handleWritePostSubmit);
    }
}

// ================================
// 클릭 이벤트 처리
// ================================

function handleGlobalClick(e) {
    // 홈페이지 게시글 링크
    var postLink = e.target.closest('.home-post-link');
    if (postLink) {
        e.preventDefault();
        var postId = postLink.getAttribute('data-id');
        if (postId) loadPostDetail(postId);
        return;
    }

    // 메인 네비게이션
    if (e.target.classList.contains('nav-link')) {
        e.preventDefault();
        var section = e.target.getAttribute('data-section');
        if (section) {
            showSection(section);
            updateActiveNavigation(section);
        }
        return;
    }

    // 드롭다운 메뉴
    if (e.target.classList.contains('dropdown-item')) {
        e.preventDefault();
        var section = e.target.getAttribute('data-section');
        var subsection = e.target.getAttribute('data-subsection');
        if (section) showSection(section, subsection);
        return;
    }

    // 서브 네비게이션
    if (e.target.classList.contains('sub-nav-link')) {
        e.preventDefault();
        var sectionEl = e.target.closest('.content-section');
        var section = sectionEl ? sectionEl.id : null;
        var subsection = e.target.getAttribute('data-subsection');
        if (section && subsection) {
            showSubsection(section, subsection);
            updateSubNavigation(section, subsection);
        }
        return;
    }

    // 퀵메뉴
    var quickMenuItem = e.target.closest('.quick-menu-item');
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
        var target = e.target.getAttribute('data-target');
        showSection('board');
        if (target) switchBoardTab(target);
        return;
    }

    // FAQ 아코디언
    if (e.target.classList.contains('faq-question')) {
        e.preventDefault();
        toggleFAQ(e.target);
        return;
    }

    // 모바일 고정 메뉴
    if (e.target.closest('.mobile-fixed-menu')) {
        var menuItem = e.target.closest('.menu-item');
        if (menuItem) {
            e.preventDefault();
            var href = menuItem.getAttribute('href');
            if (href && href.startsWith('#')) {
                var section = href.substring(1);
                showSection(section);
            }
        }
        return;
    }

    // 모달 관련
    handleModalClicks(e);

    // 게시글 행 클릭
    var postRow = e.target.closest('.post-row');
    if (postRow) {
        var postId = postRow.getAttribute('data-id');
        if (postId) loadPostDetail(postId);
        return;
    }
}

// ================================
// 섹션 관리
// ================================

function showSection(sectionId, subsectionId, skipPush) {
    subsectionId = subsectionId || null;
    skipPush = skipPush || false;

    console.log('[showSection]', sectionId, subsectionId);

    // 브라우저 히스토리
    if (!skipPush) {
        var newUrl = subsectionId ? '#' + sectionId + '/' + subsectionId : '#' + sectionId;
        history.pushState({ section: sectionId, subsection: subsectionId }, '', newUrl);
    }

    // 모든 섹션 숨기기
    document.querySelectorAll('.content-section').forEach(function(s) {
        s.classList.remove('active');
    });

    // 선택된 섹션 표시
    var targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        currentSubsection = subsectionId;

        handleSectionSpecificLogic(sectionId, subsectionId);

        if (subsectionId && subsectionMapping[sectionId]) {
            showSubsection(sectionId, subsectionId);
        } else if (subsectionMapping[sectionId]) {
            showSubsection(sectionId, subsectionMapping[sectionId][0]);
        }

        updateActiveNavigation(sectionId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.warn('[showSection] 섹션 없음:', sectionId);
    }
}

function showSubsection(sectionId, subsectionId) {
    var sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;

    sectionElement.querySelectorAll('.sub-content').forEach(function(c) {
        c.classList.remove('active');
    });

    var targetId = sectionId + '-' + subsectionId;
    var target = document.getElementById(targetId);
    if (target) {
        target.classList.add('active');
        currentSubsection = subsectionId;
    } else {
        console.warn('[showSubsection] 서브콘텐츠 없음:', targetId);
    }

    updateSubNavigation(sectionId, subsectionId);
}

function handleSectionSpecificLogic(sectionId, subsectionId) {
    switch (sectionId) {
        case 'home':
            loadHomepagePosts();
            break;
        case 'board':
            switchBoardTab(currentBoardTab);
            break;
    }
}

// ================================
// 네비게이션 업데이트
// ================================

function updateActiveNavigation(sectionId) {
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.classList.remove('active');
    });
    var activeLink = document.querySelector('.nav-link[data-section="' + sectionId + '"]');
    if (activeLink) activeLink.classList.add('active');
}

function updateSubNavigation(sectionId, subsectionId) {
    var sectionElement = document.getElementById(sectionId);
    if (!sectionElement) return;

    sectionElement.querySelectorAll('.sub-nav-link').forEach(function(link) {
        link.classList.remove('active');
    });

    var activeLink = sectionElement.querySelector('.sub-nav-link[data-subsection="' + subsectionId + '"]');
    if (activeLink) activeLink.classList.add('active');
}

// ================================
// 퀵메뉴 처리
// ================================

function handleQuickMenuClick(quickMenuItem) {
    var items = Array.from(document.querySelectorAll('.quick-menu-item'));
    var index = items.indexOf(quickMenuItem);

    switch (index) {
        case 0: showSection('about', 'contact'); break;
        case 1: showSection('education-counseling', 'process'); break;
        case 2: showSection('evaluation', 'recidivism'); break;
        case 3: alert('수료증은 교육 완료 후 발급됩니다'); break;
    }
}

// ================================
// FAQ 기능
// ================================

function toggleFAQ(questionElement) {
    var answer = questionElement.nextElementSibling;
    var isActive = answer.style.display === 'block';

    // 같은 섹션 내 FAQ만 닫기 (다른 섹션 FAQ 간섭 방지)
    var parentSection = questionElement.closest('.sub-content') || questionElement.closest('.content-card');
    if (parentSection) {
        parentSection.querySelectorAll('.faq-answer').forEach(function(ans) {
            ans.style.display = 'none';
        });
    }

    if (!isActive) {
        answer.style.display = 'block';
    }
}

// ================================
// 브라우저 히스토리 관리
// ================================

function setupHistoryManagement() {
    window.addEventListener('popstate', function(event) {
        var hash = window.location.hash.replace('#', '');
        if (hash) {
            parseAndNavigate(hash, true);
        } else {
            showSection('home', null, true);
        }
    });

    // 초기 URL 해시 처리
    var initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
        parseAndNavigate(initialHash, true);
    }

    // 게시판에서 돌아왔을 때 스크롤 복원
    if (sessionStorage.getItem('scrollToBoard') === 'true') {
        sessionStorage.removeItem('scrollToBoard');
        showSection('board', null, true);
    }
}

// 해시 파싱 유틸리티 (about/directions 같은 복합 경로 대응)
function parseAndNavigate(hash, skipPush) {
    // 슬래시 구분자 우선 (새 형식: about/directions)
    if (hash.indexOf('/') !== -1) {
        var parts = hash.split('/');
        var main = parts[0];
        var sub = parts[1] || null;
        if (sectionMapping[main]) {
            showSection(main, sub, skipPush);
            return;
        }
    }

    // 하이픈 구분자 (기존 형식: about-directions)
    // 섹션 ID에 하이픈이 포함된 경우 처리 (education-counseling 등)
    var matched = false;
    var sectionKeys = Object.keys(sectionMapping).sort(function(a, b) {
        return b.length - a.length; // 긴 키부터 매칭
    });

    for (var i = 0; i < sectionKeys.length; i++) {
        var key = sectionKeys[i];
        if (hash === key) {
            showSection(key, null, skipPush);
            matched = true;
            break;
        }
        if (hash.indexOf(key + '-') === 0) {
            var sub = hash.substring(key.length + 1);
            showSection(key, sub, skipPush);
            matched = true;
            break;
        }
    }

    if (!matched) {
        // 단순 섹션명으로 시도
        showSection(hash, null, skipPush);
    }
}

// ================================
// 게시판 관련 함수들
// ================================

function switchBoardTab(category) {
    currentBoardTab = category;

    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });

    var activeTab = document.querySelector('.tab-btn[data-category="' + category + '"]');
    if (activeTab) activeTab.classList.add('active');

    loadPosts(1, category);
}

async function loadPosts(page, category) {
    page = page || 1;
    category = category || null;

    try {
        currentPage = page;
        var params = new URLSearchParams({ page: page, limit: 15 });

        if (category && category !== 'all') {
            params.append('category', category);
        }

        var response = await fetch('/api/board/posts?' + params);
        var result = await response.json();

        if (result.success) {
            posts = result.data.posts || [];
            // API 응답 구조 대응 (pagination 객체 또는 직접 totalPosts)
            totalPosts = (result.data.pagination && result.data.pagination.totalPosts)
                       || result.data.totalPosts
                       || 0;

            renderPosts();
            renderPagination();
            updatePostCount();
        }
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        showMessage('게시글을 불러오는 중 오류가 발생했습니다', 'error');
    }
}

async function loadHomepagePosts() {
    try {
        var response = await fetch('/api/board/posts?category=notice&limit=5');
        var data = await response.json();
        if (data.success) {
            renderHomepagePostList(data.data.posts, 'home-notice-list');
        }
    } catch (error) {
        console.error('홈페이지 게시글 로드 실패:', error);
    }
}

// ================================
// 게시글 렌더링 함수들
// ================================

function renderPosts() {
    var container = document.getElementById('posts-container');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML =
            '<tr><td colspan="5" class="no-posts">' +
            '<div class="no-posts-content">' +
            '<p>등록된 게시글이 없습니다</p>' +
            '</div></td></tr>';
        return;
    }

    var html = posts.map(function(post, index) {
        var rowNumber = (currentPage - 1) * 15 + index + 1;
        return '<tr class="post-row" data-id="' + post._id + '">' +
            '<td class="col-number">' + rowNumber + '</td>' +
            '<td class="col-category"><span class="post-category ' + post.category + '">' + getCategoryLabel(post.category) + '</span></td>' +
            '<td class="col-title"><span class="post-title">' + escapeHtml(post.title) + '</span>' +
            (post.commentCount > 0 ? '<span class="comment-count">[' + post.commentCount + ']</span>' : '') +
            '</td>' +
            '<span class="info-post-date">' + formatDate(post.createdAt) + '</span>' +
            '<td class="col-views">' + (post.viewCount || 0) + '</td>' +
            '</tr>';
    }).join('');

    container.innerHTML = html;
}

function renderHomepagePostList(postsList, containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    if (!postsList || postsList.length === 0) {
        container.innerHTML = '<li>등록된 게시글이 없습니다</li>';
        return;
    }

    var html = postsList.map(function(post) {
        return '<li>' +
            '<a href="#" class="home-post-link" data-id="' + post._id + '">' + escapeHtml(post.title) + '</a>' +
            '<span class="info-post-date">' + formatDate(post.createdAt) + '</span>' +
            '</li>';
    }).join('');

    container.innerHTML = html;
}

function renderPagination() {
    var container = document.getElementById('pagination');
    if (!container) return;

    var totalPages = Math.ceil(totalPosts / 15);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    var html = '';

    if (currentPage > 1) {
        html += '<button class="page-btn" onclick="changePage(' + (currentPage - 1) + ')">‹</button>';
    }

    var startPage = Math.max(1, currentPage - 2);
    var endPage = Math.min(totalPages, currentPage + 2);

    for (var i = startPage; i <= endPage; i++) {
        html += '<button class="page-btn ' + (i === currentPage ? 'active' : '') + '" onclick="changePage(' + i + ')">' + i + '</button>';
    }

    if (currentPage < totalPages) {
        html += '<button class="page-btn" onclick="changePage(' + (currentPage + 1) + ')">›</button>';
    }

    container.innerHTML = html;
}

// ================================
// 모달 관련 함수들
// ================================

function handleModalClicks(e) {
    if (e.target.id === 'write-post-btn' || e.target.closest('#write-post-btn')) {
        e.preventDefault();
        showWritePostModal();
        return;
    }

    if (e.target.classList.contains('close')) {
        e.preventDefault();
        var modal = e.target.closest('.modal');
        if (modal) modal.style.display = 'none';
        return;
    }

    if (e.target.classList.contains('btn-secondary') && e.target.textContent === '취소') {
        e.preventDefault();
        var modal = e.target.closest('.modal');
        if (modal) modal.style.display = 'none';
        return;
    }
}

function showWritePostModal() {
    var modal = document.getElementById('write-post-modal');
    if (modal) {
        modal.style.display = 'block';
        var form = document.getElementById('write-post-form');
        if (form) {
            form.reset();
            form.dataset.mode = '';
            form.dataset.postId = '';
            var submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = '작성 완료';
        }
    }
}

async function handleWritePostSubmit(e) {
    e.preventDefault();

    var form = e.target;
    var isEdit = form.dataset.mode === 'edit';
    var postId = form.dataset.postId;

    var postData = {
        title: form.querySelector('input[name="title"]').value,
        content: form.querySelector('textarea[name="content"]').value,
        category: form.querySelector('select[name="category"]').value
    };

    if (!postData.title || !postData.content || !postData.category) {
        showMessage('모든 필드를 입력해주세요', 'error');
        return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.textContent = isEdit ? '수정 중...' : '작성 중...';
    submitBtn.disabled = true;

    try {
        var url = isEdit ? '/api/board/posts/' + postId : '/api/board/posts';
        var method = isEdit ? 'PUT' : 'POST';

        var response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(postData)
        });

        var result = await response.json();

        if (result.success) {
            showMessage(isEdit ? '게시글이 수정되었습니다' : '게시글이 작성되었습니다', 'success');
            var modal = document.getElementById('write-post-modal');
            if (modal) modal.style.display = 'none';
            if (!isEdit) form.reset();
            form.dataset.mode = '';
            form.dataset.postId = '';
            loadPosts(1, currentBoardTab);
        } else {
            showMessage(result.message || '게시글 작성에 실패했습니다', 'error');
        }
    } catch (error) {
        console.error('게시글 작성 에러:', error);
        showMessage('서버 오류가 발생했습니다', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ================================
// 유틸리티 함수들
// ================================

function getCategoryLabel(category) {
    var labels = {
        'notice': '공지',
        'general': '일반'
    };
    return labels[category] || category;
}

function formatDate(dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diffTime = Math.abs(now - date);
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '오늘';
    if (diffDays === 2) return '어제';
    if (diffDays <= 7) return (diffDays - 1) + '일 전';
    return date.toLocaleDateString('ko-KR');
}

function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function updatePostCount() {
    var el = document.getElementById('post-count');
    if (el) el.textContent = '(총 ' + totalPosts + '개)';
}

function showMessage(message, type) {
    type = type || 'info';
    var container = document.getElementById('message-container');
    if (!container) return;

    var el = document.createElement('div');
    el.className = 'message ' + type;
    el.textContent = message;
    container.appendChild(el);

    setTimeout(function() {
        if (el.parentNode) el.parentNode.removeChild(el);
    }, 3000);
}

function loadPostDetail(postId) {
    window.location.href = '/post-detail.html?id=' + postId;
}

function changePage(page) {
    currentPage = page;
    loadPosts(page, currentBoardTab === 'all' ? null : currentBoardTab);
}

// 전역 함수 내보내기
window.showSection = showSection;
window.showSubsection = showSubsection;
window.changePage = changePage;
window.loadPostDetail = loadPostDetail;
