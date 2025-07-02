document.getElementById('admin-write-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const content = document.getElementById('post-content').value.trim();
    const adminPassword = document.getElementById('admin-password').value;
    if (!title || !category || !content || !adminPassword) {
        alert('모든 필수 정보를 입력해 주세요.');
        return;
    }
    const btn = this.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '작성 중...';
const isEdit = this.dataset.mode === 'edit';
const postId = this.dataset.postId;

try {
  const res = await fetch(isEdit ? `/api/board/posts/${postId}` : '/api/board/posts', {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, category, content, adminPassword })
  });

const result = await res.json();
if (result.success) {
    this.reset();                        // ✅ 폼 초기화
    this.dataset.mode = '';             // ✅ 수정 모드 해제
    this.dataset.postId = '';           // ✅ 수정 대상 초기화
    loadAdminPosts();                   // ✅ 목록 새로고침

    document.getElementById('write-success').textContent =
        isEdit ? '글이 성공적으로 수정되었습니다!' : '글이 성공적으로 등록되었습니다!';
    document.getElementById('write-success').style.display = 'block';
} else {
    alert(result.message || '글 등록에 실패했습니다.');
}

    } catch (err) {
        alert('서버 오류가 발생했습니다.');
    } finally {
        btn.disabled = false;
        btn.textContent = '글쓰기';
    }
}); 


async function loadAdminPosts() {
    const res = await fetch('/api/board/posts?limit=20');
    const result = await res.json();

    if (result.success) {
        const listContainer = document.getElementById('admin-post-list');
        listContainer.innerHTML = result.data.posts.map(post => `
            <div class="post-item" data-id="${post._id}" style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ccc;">
                <strong>${post.title}</strong> [${post.category}]
	   <button class="edit-btn" data-id="${post._id}">✏ 수정</button>
	    <button class="delete-btn" data-id="${post._id}">🗑 삭제</button>
            </div>
        `).join('');
    } else {
        alert('글 목록 불러오기 실패');
    }
}

async function editPost(id) {
    const res = await fetch(`/api/board/posts/${id}`);
    const result = await res.json();

    if (result.success) {
        const post = result.data.post;
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-content').value = post.content;

        const form = document.getElementById('admin-write-form');
        form.dataset.mode = 'edit';
        form.dataset.postId = post._id;
    } else {
        alert('글 불러오기 실패');
    }
}

async function deletePost(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

const res = await fetch(`/api/board/posts/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        adminPassword: document.getElementById('admin-password').value
    })
});
    const result = await res.json();
    if (result.success) {
        alert('삭제 완료');
        loadAdminPosts();
    } else {
        alert('삭제 실패: ' + result.message);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadAdminPosts();
});

document.getElementById('admin-post-list').addEventListener('click', (e) => {
    const target = e.target;
    const postId = target.dataset.id;

    if (target.classList.contains('edit-btn')) {
        editPost(postId);
    }

    if (target.classList.contains('delete-btn')) {
        deletePost(postId);
    }
});


