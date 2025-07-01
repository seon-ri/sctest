// 세온연구소 JavaScript - SPA 네비게이션 및 인터랙션

document.addEventListener('DOMContentLoaded', function() {
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

    // 로그인 버튼 항상 보이게
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
        authContainer.innerHTML = '<button class="login-btn">로그인</button>';
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

    // 이벤트 위임 방식으로 메뉴/퀵메뉴/글쓰기/서브네비/로그인 버튼 처리
    document.addEventListener('click', function(e) {
        // 소메뉴(드롭다운)
        if (e.target.classList.contains('dropdown-item')) {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            const subsection = e.target.getAttribute('data-subsection');
            if (section && typeof showSection === 'function') showSection(section, subsection);
            return;
        }
        // 상단 메뉴(nav-link)
        if (e.target.classList.contains('nav-link')) {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            if (section && typeof showSection === 'function') showSection(section);
            document.querySelectorAll('.dropdown-menu').forEach(menu => menu.style.display = 'none');
            return;
        }
        // 드롭다운/서브네비
        if (e.target.classList.contains('sub-nav-link')) {
            e.preventDefault();
            const section = this.closest('.content-section').id;
            const subsection = this.getAttribute('data-subsection');
            if (section && subsection && typeof showSubSection === 'function') {
                showSubSection(section, subsection);
            }
            // 활성화 표시
            this.parentElement.parentElement.querySelectorAll('.sub-nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        }
        // 퀵메뉴
        if (e.target.closest('.quick-menu-item')) {
            e.preventDefault();
            const idx = Array.from(document.querySelectorAll('.quick-menu-item')).indexOf(e.target.closest('.quick-menu-item'));
            if (idx === 0) { if (typeof showSection === 'function') showSection('about', 'contact'); }
            else if (idx === 1) { if (typeof showSection === 'function') showSection('services', 'education'); }
            else if (idx === 2) { if (typeof showSection === 'function') showSection('services', 'testing'); }
            else if (idx === 3) { if (typeof showSection === 'function') showSection('home'); }
        }
        // '처음으로' 클릭
        if (e.target.classList.contains('home-link') || e.target.closest('.home-link')) {
            e.preventDefault();
            if (typeof showSection === 'function') showSection('home');
            const header = document.getElementById('header');
            if (header) header.style.transform = 'translateY(0)';
        }
        // 글쓰기 버튼
        if (e.target.id === 'write-post-btn') {
            e.preventDefault();
            if (typeof showWritePostModal === 'function') showWritePostModal();
        }
        // 로그인 버튼
        if (e.target.classList.contains('login-btn')) {
            e.preventDefault();
            if (typeof showLoginModal === 'function') showLoginModal();
        }
        // 로그아웃 버튼
        if (e.target.classList.contains('logout-btn')) {
            e.preventDefault();
            if (typeof logout === 'function') logout();
        }
    });

    document.querySelectorAll('.sub-nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.closest('.content-section').id;
            const subsection = this.getAttribute('data-subsection');
            if (section && subsection && typeof showSubSection === 'function') {
                showSubSection(section, subsection);
            }
            // 활성화 표시
            this.parentElement.parentElement.querySelectorAll('.sub-nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // --- 서비스 메뉴 연동: 예시용 ---
    // 서비스 메뉴(예시) 동적 생성 및 이벤트 연결
    const serviceMenuHtml = `
        <div class="service-menu-bar">
            <button class="service-menu-btn" data-section="services" data-subsection="criminal">형사사건 심리자문</button>
            <button class="service-menu-btn" data-section="services" data-subsection="prevention">사건예방·행동개선상담</button>
            <button class="service-menu-btn" data-section="services" data-subsection="testing">심리검사</button>
            <button class="service-menu-btn" data-section="services" data-subsection="etc">기타서비스</button>
        </div>
    `;
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.insertAdjacentHTML('afterend', serviceMenuHtml);
    }
    // 버튼 클릭 시 서비스 섹션 전환
    document.querySelectorAll('.service-menu-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showSection('services');
            showSubSection('services', this.getAttribute('data-subsection'));
            // 버튼 활성화 표시
            document.querySelectorAll('.service-menu-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// --- SPA 섹션 전환 핵심 함수 개선 ---
function showSection(sectionId, subsectionId = null) {
    // 모든 섹션 숨김
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
    // 해당 섹션만 보이기
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    // 소섹션 처리
    if (subsectionId) showSubSection(sectionId, subsectionId);
}
function showSubSection(sectionId, subsectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    // 모든 소섹션 숨김
    section.querySelectorAll('.sub-content').forEach(sub => sub.classList.remove('active'));
    // 해당 소섹션만 보이기
    const target = document.getElementById(`${sectionId}-${subsectionId}`);
    if (target) target.classList.add('active');
}
// --- SPA 섹션 전환 핵심 함수 끝 ---

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
            loadPostDetail(postId);
        });
    });
};

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
                <td class="col-author">${post.author.name || post.author.username}</td>
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
            loadPostDetail(postId);
        });
    });
};

// 홈페이지 게시글 목록 렌더링
const renderHomepagePostList = (posts, containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (posts.length === 0) {
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
    // 이벤트 리스너 연결
    container.querySelectorAll('.home-post-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = link.getAttribute('data-id');
            loadPostDetail(postId);
        });
    });
};

// 게시글 상세 모달 내 댓글 작성 버튼 이벤트 리스너 연결
const showPostDetailModal = (post) => {
    const modal = document.createElement('div');
    modal.className = 'modal post-detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${post.title}</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="post-meta">
                    <span>작성자: ${post.author.name}</span>
                    <span>작성일: ${formatDate(post.createdAt)}</span>
                    <span>조회수: ${post.viewCount}</span>
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
                <div class="post-actions">
                    <button class="like-btn" data-post-id="${post._id}">
                        ❤️ 좋아요 (${post.likeCount})
                    </button>
                </div>
                <div class="comments-section">
                    <h3>댓글 (${post.commentCount})</h3>
                    <div class="comments-list">
                        ${renderComments(post.comments)}
                    </div>
                    ${currentUser ? `
                        <div class="comment-form">
                            <textarea id="comment-content" placeholder="댓글을 입력하세요..."></textarea>
                            <button class="submit-comment-btn" data-post-id="${post._id}">댓글 작성</button>
                        </div>
                    ` : '<p>댓글을 작성하려면 로그인이 필요합니다.</p>'}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    // 모달 닫기
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    // 좋아요 버튼 이벤트
    const likeBtn = modal.querySelector('.like-btn');
    likeBtn.addEventListener('click', () => {
        toggleLike(post._id, likeBtn);
    });
    // 댓글 작성 버튼 이벤트
    const submitCommentBtn = modal.querySelector('.submit-comment-btn');
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', function() {
            const postId = submitCommentBtn.getAttribute('data-post-id');
            submitComment(postId);
        });
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
// ... 기존 코드 ... 