// feedbackManager.js

// 分页状态
let currentFeedbackPage = 1;
const feedbacksPerPage = 10;

// 加载反馈管理页面
async function loadFeedbackManage(page = 1) {
    try {
        showLoader();
        currentFeedbackPage = page;
        
        const start = (page - 1) * feedbacksPerPage;
        const response = await api.getFeedback(start, feedbacksPerPage);
        
        renderFeedbackList(response.result);
        renderFeedbackPagination(response.result.length);
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 渲染反馈列表
function renderFeedbackList(feedbacks) {
    const container = document.getElementById('feedback-list-container');
    
    if (!feedbacks || feedbacks.length === 0) {
        container.innerHTML = '<div class="no-data">暂无反馈数据</div>';
        return;
    }
    
    container.innerHTML = feedbacks.map(feedback => `
        <div class="feedback-item" data-userid="${feedback.user_id}">
            <div class="feedback-header">
                <span class="feedback-user">用户ID: ${feedback.user_id}</span>
                <span class="feedback-time">${formatTime(feedback.time)}</span>
            </div>
            <div class="feedback-content">${feedback.feedback}</div>
            <div class="feedback-actions">
                <button class="btn btn-sm btn-view-user">
                    <i class="fas fa-user"></i> 查看用户
                </button>
            </div>
        </div>
    `).join('');
    
    // 添加查看用户按钮事件
    document.querySelectorAll('.btn-view-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.closest('.feedback-item').getAttribute('data-userid');
            viewUserProfile(userId);
        });
    });
}

// 渲染分页控件
function renderFeedbackPagination(itemsCount) {
    const container = document.getElementById('feedback-pagination');
    
    if (!container) return;
    
    container.innerHTML = `
        <button class="btn btn-prev ${currentFeedbackPage === 1 ? 'disabled' : ''}">
            <i class="fas fa-chevron-left"></i> 上一页
        </button>
        <span class="page-info">第 ${currentFeedbackPage} 页</span>
        <button class="btn btn-next ${itemsCount < feedbacksPerPage ? 'disabled' : ''}">
            下一页 <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.querySelector('.btn-prev:not(.bound)')?.addEventListener('click', () => {
        if (currentFeedbackPage > 1) {
            loadFeedbackManage(currentFeedbackPage - 1);
        }
    });
    
    container.querySelector('.btn-next:not(.bound)')?.addEventListener('click', () => {
        if (itemsCount >= feedbacksPerPage) {
            loadFeedbackManage(currentFeedbackPage + 1);
        }
    });
    
    container.querySelector('.btn-prev')?.classList.add('bound');
    container.querySelector('.btn-next')?.classList.add('bound');
}

// 初始化反馈搜索
function initFeedbackSearch() {
    const searchForm = document.getElementById('feedback-search-form');
    
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = this.querySelector('input').value.trim();
        if (!userId) return;
        
        try {
            showLoader();
            
            // 这里假设API支持按用户ID搜索反馈
            // 如果没有这个API，可以先加载全部然后前端过滤
            const response = await api.getFeedback(0, 100); // 加载足够多的数据
            
            // 前端过滤
            const filtered = response.result.filter(f => f.user_id.includes(userId));
            renderFeedbackList(filtered);
            document.getElementById('feedback-pagination').innerHTML = '';
            
            hideLoader();
        } catch (error) {
            handleApiError(error);
        }
    });
    
    // 重置搜索
    document.getElementById('reset-feedback-search-btn').addEventListener('click', function() {
        document.getElementById('feedback-search-form').reset();
        loadFeedbackManage(1);
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initFeedbackSearch();
});

// 工具函数 - 复用之前的
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
}