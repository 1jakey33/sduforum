// 评论分页状态
let currentCommentPage = 1;
const commentsPerPage = 10;
let currentPostId = null;

// 加载评论管理页面
async function loadCommentManage() {
    try {
        showLoader();
        
        // 重置状态
        currentCommentPage = 1;
        currentPostId = null;
        
        // 显示搜索表单
        document.getElementById('comment-search-container').style.display = 'block';
        document.getElementById('comment-list-container').innerHTML = '';
        document.getElementById('comment-pagination').innerHTML = '';
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 搜索帖子评论
async function searchPostComments(postId) {
    try {
        showLoader();
        
        currentPostId = postId;
        const response = await api.getComments(postId);
        
        renderCommentList(response.result);
        
        // 隐藏搜索表单，显示结果
        document.getElementById('comment-search-container').style.display = 'none';
        document.getElementById('comment-result-header').style.display = 'flex';
        document.getElementById('comment-back-btn').style.display = 'block';
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 渲染评论列表
function renderCommentList(comments) {
    const container = document.getElementById('comment-list-container');
    
    if (!comments || comments.length === 0) {
        container.innerHTML = '<div class="no-data">该帖子暂无评论</div>';
        return;
    }
    
    container.innerHTML = comments.map(comment => `
        <div class="comment-card" data-commentid="${comment.id}">
            
            <div class="comment-header">
                <div class="comment-author">
                    <span>${comment.id}</span>
                    <i class="fas fa-user-circle"></i>
                    <span>${comment.nickName}</span>
                </div>
                <span class="comment-time">${formatTime(comment.releaseTime)}</span>
            </div>
            <div class="comment-content">
                ${comment.text}
            </div>
            <div class="comment-footer">
                <div class="comment-likes">
                    <i class="fas fa-thumbs-up"></i> ${comment.like_num || 0}
                </div>
                <div class="comment-actions">
                    <button class="btn btn-sm btn-delete-comment">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
            ${comment.father !== 0 ? `
                <div class="comment-reply-to">
                    <i class="fas fa-reply"></i> 回复给 #${comment.father}
                </div>
            ` : ''}
        </div>
    `).join('');
    
    // 添加删除按钮事件
    document.querySelectorAll('.btn-delete-comment').forEach(btn => {
        btn.addEventListener('click', function() {
            const commentId = this.closest('.comment-card').getAttribute('data-commentid');
            deleteComment(commentId);
        });
    });
}

// 删除评论
async function deleteComment(commentId) {
    if (!confirm('确定要删除这条评论吗？此操作不可恢复！')) {
        return;
    }
    
    try {
        showLoader();
        const response = await api.deleteComment(currentPostId, commentId);
        
        if (response.state) {
            alert('评论已删除');
            searchPostComments(currentPostId); // 刷新当前列表
        }
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoader();
    }
}

// 初始化评论搜索
function initCommentSearch() {
    const searchForm = document.getElementById('comment-search-form');
    
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const postId = this.querySelector('input').value.trim();
        if (!postId) return;
        
        await searchPostComments(postId);
    });
    
    // 返回按钮
    document.getElementById('comment-back-btn').addEventListener('click', function() {
        document.getElementById('comment-search-container').style.display = 'block';
        document.getElementById('comment-result-header').style.display = 'none';
        document.getElementById('comment-list-container').innerHTML = '';
        this.style.display = 'none';
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initCommentSearch();
});