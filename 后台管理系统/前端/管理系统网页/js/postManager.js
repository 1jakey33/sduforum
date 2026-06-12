// 帖子分页状态
let currentPostPage = 1;
const postsPerPage = 10;
let currentPostView = 'all'; // 'all' 或 'today'

// 加载帖子管理页面
async function loadPostManage(view = 'all') {
    try {
        showLoader();
        currentPostView = view;
        currentPostPage = 1;
        
        // 更新活动标签
        document.querySelectorAll('.post-view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-view') === view);
        });
        
        // 加载帖子
        await loadPosts();
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 加载帖子列表
async function loadPosts(page = 1) {
    try {
        showLoader();
        currentPostPage = page;
        
        const start = (page - 1) * postsPerPage;
        let response;
        
        if (currentPostView === 'today') {
            response = await api.getTodayPosts(start, postsPerPage);
        } else {
            response = await api.getAllPosts(start, postsPerPage);
        }
        
        renderPostList(response.result);
        renderPostPagination(response.result.length);
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 渲染帖子列表
function renderPostList(posts) {
    const container = document.getElementById('post-list-container');
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="no-data">暂无帖子数据</div>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card" data-postid="${post.id}">
            <div class="post-header">
                <img src="${post.avatar_image_url || '../assets/images/avatar_default.jpg'}" 
                     alt="../assets/images/avatar_default.jpg" class="post-avatar">
                <div class="post-author">
                    <h4>${post.nickName}</h4>
                    <span>${formatTime(post.created_at)}</span>
                </div>
                <div class="post-actions">
                    <button class="btn btn-sm btn-view-post">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                    <button class="btn btn-sm btn-delete-post">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            </div>
            <div class="post-content">${truncateText(post.content, 150)}</div>
            <div class="post-footer">
                <div class="post-stats">
                    <span><i class="fas fa-heart"></i> ${post.favorite_count || 0}</span>
                    <span><i class="fas fa-comment"></i> ${post.comment_count || 0}</span>
                </div>
                <div class="post-tags">
                    <button class="btn btn-tag btn-view-by-tag" data-tag="SDU论坛">
                        <i class="fas fa-tag"></i> SDU论坛-postID:${post.id}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // 添加事件监听
    document.querySelectorAll('.btn-view-post').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.closest('.post-card').getAttribute('data-postid');
            viewPostDetails(postId);
        });
    });
    
    document.querySelectorAll('.btn-delete-post').forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.closest('.post-card').getAttribute('data-postid');
            deletePost(postId);
        });
    });
    
    document.querySelectorAll('.btn-view-by-tag').forEach(btn => {
        btn.addEventListener('click', function() {
            const tag = this.getAttribute('data-tag');
            searchPostsByTag(tag);
        });
    });
}

// 渲染帖子分页
function renderPostPagination(itemsCount) {
    const container = document.getElementById('post-pagination');
    
    if (!container) return;
    
    container.innerHTML = `
        <button class="btn btn-prev ${currentPostPage === 1 ? 'disabled' : ''}">
            <i class="fas fa-chevron-left"></i> 上一页
        </button>
        <span class="page-info">第 ${currentPostPage} 页</span>
        <button class="btn btn-next ${itemsCount < postsPerPage ? 'disabled' : ''}">
            下一页 <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.querySelector('.btn-prev:not(.bound)')?.addEventListener('click', () => {
        if (currentPostPage > 1) {
            loadPosts(currentPostPage - 1);
        }
    });
    
    container.querySelector('.btn-next:not(.bound)')?.addEventListener('click', () => {
        if (itemsCount >= postsPerPage) {
            loadPosts(currentPostPage + 1);
        }
    });
    
    container.querySelector('.btn-prev')?.classList.add('bound');
    container.querySelector('.btn-next')?.classList.add('bound');
}

// 查看帖子详情
async function viewPostDetails(postId) {
    try {
        showLoader();
        
        const response = await api.getPostDetails(postId);
        
        renderPostDetailModal(response);
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 渲染帖子详情模态框
function renderPostDetailModal(data) {
    const { base_data, tags, images, user_profile } = data;
    
    const modalContent = `
        <div class="modal-header">
            <h3>帖子详情</h3>
            <button class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="post-detail-header">
                <img src="${user_profile.avatar_image_url || 'https://via.placeholder.com/50'}" 
                     alt="作者头像" class="author-avatar">
                <div class="author-info">
                    <h4>${user_profile.nickName}</h4>
                    <span>${formatTime(base_data.created_at)}</span>
                </div>
                <div class="post-stats">
                    <span><i class="fas fa-heart"></i> ${base_data.favorite_count || 0}</span>
                    <span><i class="fas fa-comment"></i> ${base_data.comment_count || 0}</span>
                </div>
            </div>
            
            <div class="post-detail-content">
                ${base_data.content}
            </div>
            
            ${images.length > 0 ? `
                <div class="post-images">
                    <h4>图片附件</h4>
                    <div class="image-grid">
                        ${images.map(img => `
                            <div class="image-item">
                                <img src="${img}" alt="帖子图片" onclick="openImageModal('${img}')">
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${tags.length > 0 ? `
                <div class="post-tags">
                    <h4>标签</h4>
                    <div class="tag-list">
                        ${tags.map(tag => `
                            <span class="tag">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="post-actions">
                <button class="btn btn-danger btn-block btn-delete-post" data-postid="${base_data.id}">
                    <i class="fas fa-trash"></i> 删除帖子
                </button>
            </div>
        </div>
    `;
    
    showCustomModal(modalContent);
    
    // 添加删除按钮事件
    document.querySelector('.btn-delete-post').addEventListener('click', function() {
        const postId = this.getAttribute('data-postid');
        hideCustomModal();
        deletePost(postId);
    });
    
    // 添加关闭按钮事件
    document.querySelector('.btn-close').addEventListener('click', hideCustomModal);

    // 添加查看评论按钮事件
    document.querySelector('.btn-view-comments')?.addEventListener('click', function() {
    const postId = this.getAttribute('data-postid');
        hideCustomModal();
        document.querySelector('.menu-item[data-target="comment-manage"]').click();
        document.getElementById('comment-search-form').querySelector('input').value = postId;
        searchPostComments(postId);
    });
}

// 图片模态框
function openImageModal(src) {
    const modalContent = `
        <div class="modal-header">
            <h3>查看图片</h3>
            <button class="btn-close">&times;</button>
        </div>
        <div class="modal-body image-modal-body">
            <img src="${src}" alt="预览" class="image-preview">
        </div>
    `;
    
    showCustomModal(modalContent);
    
    // 添加关闭按钮事件
    document.querySelector('.btn-close').addEventListener('click', hideCustomModal);
}

// 删除帖子
async function deletePost(postId) {
    if (!confirm('确定要删除这个帖子吗？此操作不可恢复！')) {
        return;
    }
    
    try {
        showLoader();
        const response = await api.deletePost(postId);
        console.log(response);
        if (response.state) {
            alert('帖子已删除');
            loadPosts(currentPostPage); // 刷新当前页
        }
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoader();
    }
}

// 搜索状态管理
let currentSearchQuery = '';
let currentSearchType = ''; // 'user' | 'tag'

// 统一搜索入口
async function performSearch(query) {
    try {
        showLoader();
        currentSearchQuery = query;
        
        // 先尝试按用户搜索
        let result = await searchByUser(query);
        
        // 如果没结果或结果为空，尝试按标签搜索
        if (!result || result.length === 0) {
            result = await searchByTag(query);
            currentSearchType = 'tag';
        } else {
            currentSearchType = 'user';
        }
        
        // 渲染结果
        renderSearchResults(result, query);
        
    } catch (error) {
        handleApiError(error);
    } finally {
        hideLoader();
    }
}

// 按用户搜索
async function searchByUser(userId) {
    try {
        const response = await api.searchPostsByUser(userId);
        return Array.isArray(response) ? response : [response];
    } catch (error) {
        console.error('用户搜索失败:', error);
        return null;
    }
}

// 按标签搜索
async function searchByTag(tag) {
    try {
        const response = await api.searchPostsByTag(tag, 0, 100); // 获取足够多的结果
        return response?.result || [];
    } catch (error) {
        console.error('标签搜索失败:', error);
        return null;
    }
}

// 渲染搜索结果
function renderSearchResults(posts, query) {
    if (!posts || posts.length === 0) {
        document.getElementById('post-list-container').innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h4>没有找到匹配的帖子</h4>
                <p>未找到包含 "${query}" 的${currentSearchType === 'user' ? '用户发帖' : '标签帖子'}</p>
                <button class="btn btn-primary" id="try-other-search">
                    尝试${currentSearchType === 'user' ? '按标签搜索' : '按用户搜索'}
                </button>
            </div>
        `;
        
        document.getElementById('try-other-search').addEventListener('click', () => {
            if (currentSearchType === 'user') {
                searchByTag(currentSearchQuery);
            } else {
                searchByUser(currentSearchQuery);
            }
        });
        return;
    }
    
    // 正常渲染帖子列表
    renderPostList(posts, true);
    document.getElementById('post-pagination').innerHTML = '';
    document.getElementById('page-title').textContent = 
        `搜索${currentSearchType === 'user' ? '用户' : '标签'}: ${query}`;
}

// 初始化搜索
function initPostSearch() {
    const searchForm = document.getElementById('post-search-form');
    const searchInput = searchForm.querySelector('input');
    
    // 实时显示搜索类型提示
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim();
        if (query.length > 0) {
            document.getElementById('search-type-hint').textContent = 
                `将搜索: ${query.startsWith('#') ? '标签' : '用户ID'}`;
        } else {
            document.getElementById('search-type-hint').textContent = '';
        }
    }, 300));

    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) {
            resetSearch();
            return;
        }
        await performSearch(query);
    });
    
    // 重置搜索
    document.getElementById('reset-post-search-btn').addEventListener('click', resetSearch);
}

function resetSearch() {
    document.getElementById('post-search-form').reset();
    document.getElementById('search-type-hint').textContent = '';
    loadPostManage('all');
    document.getElementById('page-title').textContent = '帖子管理';
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initPostSearch();
    
    // 帖子视图标签切换
    document.querySelectorAll('.post-view-tab').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            loadPostManage(view);
        });
    });
});