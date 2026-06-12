// 加载控制面板数据
async function loadDashboard() {
    try {
        showLoader();
        
        // 获取统计数据
        const stats = await api.getTotalNumbers();
        
        // 渲染统计卡片
        renderStatsCards(stats);
        
        // 获取今日帖子
        const todayPosts = await api.getTodayPosts(0, 5);
        renderTodayPosts(todayPosts.result);
        
        // 获取最新反馈
        const feedbacks = await api.getFeedback(0, 5);
        renderRecentFeedbacks(feedbacks.result);
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
        hideLoader();
    }
}

async function checkServiceStatus() {
    try {
        const response = await fetch('http://120.26.127.37:8080/sdu_forum/api/system/statu');
        if (response.status === 200) {
            return {
                status: 'running',
                text: '服务正常'
            };
        }
        return {
            status: 'error',
            text: '服务异常'
        };
    } catch (error) {
        return {
            status: 'error',
            text: '无法连接服务'
        };
    }
}

// 渲染统计卡片
function renderStatsCards(stats={}) {
   
    const statsContainer = document.getElementById('dashboard-stats');
     if (!statsContainer) {
        console.error('Stats container not found');
        return;
    }
// 设置默认值
    const data = {
        user_total_num: 0,
        post_total_num: 0,
        comment_total_num: 0,
        blacklist_total_num: 0,
        service_status: { status: 'unknown', text: '状态未知' },
        ...stats
    };
    const statusColor = data.service_status.status === 'running' ? 'bg-info' : 'bg-danger';
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon bg-primary">
                <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
                <h3>${data.user_total_num || 0}</h3>
                <p>用户总数</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon bg-success">
                <i class="fas fa-newspaper"></i>
            </div>
            <div class="stat-info">
                <h3>${data.post_total_num || 0}</h3>
                <p>帖子总数</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon bg-warning">
                <i class="fas fa-comments"></i>
            </div>
            <div class="stat-info">
                <h3>${data.comment_total_num || 0}</h3>
                <p>评论总数</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon bg-danger">
                <i class="fas fa-ban"></i>
            </div>
            <div class="stat-info">
                <h3>${data.blacklist_total_num || 0}</h3>
                <p>黑名单用户</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon ${statusColor}">
                <i class="fas fa-server"></i>
            </div>
            <div class="stat-info">
                <h3>${data.service_status.text}</h3>
                <p>服务状态</p>
            </div>
        </div>
    `;
}

// 渲染今日帖子
function renderTodayPosts(posts) {
    const postsContainer = document.getElementById('today-posts-list');
    
    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = '<p class="no-data">今日暂无新帖子</p>';
        return;
    }
    
    postsContainer.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-header">
                <img src="${post.avatar_image_url || '../assets/images/avatar_default.jpg'}" alt="../assets/images/avatar_default.jpg" class="post-avatar">
                <span class="post-author">${post.nickName}</span>
                <span class="post-time">${formatTime(post.created_at)}</span>
            </div>
            <div class="post-content">${truncateText(post.content, 100)}</div>
            <div class="post-stats">
                <span><i class="fas fa-heart"></i> ${post.favorite_count}</span>
                <span><i class="fas fa-comment"></i> ${post.comment_count}</span>
            </div>
        </div>
    `).join('');
}

// 渲染最新反馈
function renderRecentFeedbacks(feedbacks) {
    const feedbackContainer = document.getElementById('recent-feedbacks');
    
    if (!feedbacks || feedbacks.length === 0) {
        feedbackContainer.innerHTML = '<p class="no-data">暂无用户反馈</p>';
        return;
    }
    
    feedbackContainer.innerHTML = feedbacks.map(feedback => `
        <div class="feedback-item">
            <div class="feedback-header">
                <span class="feedback-user">用户ID: ${feedback.user_id}</span>
                <span class="feedback-time">${formatTime(feedback.time)}</span>
            </div>
            <div class="feedback-content">${feedback.feedback}</div>
        </div>
    `).join('');
}

// 工具函数 - 格式化时间
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// 工具函数 - 截断文本
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}