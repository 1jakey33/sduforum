// 全局模态框函数
window.showCustomModal = function(content) {
    const modal = document.getElementById('custom-modal');
    const modalContent = document.getElementById('custom-modal-content');
    
    modalContent.innerHTML = content;
    modal.style.display = 'flex';
}

window.hideCustomModal = function() {
    document.getElementById('custom-modal').style.display = 'none';
}



// 页面切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 侧边栏菜单点击事件
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有active类
            document.querySelectorAll('.menu-item').forEach(i => {
                i.classList.remove('active');
            });
            // 添加当前active类
            this.classList.add('active');
            
            // 隐藏所有页面内容
            document.querySelectorAll('.page-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 显示目标页面内容
            const target = this.getAttribute('data-target');
            document.getElementById(`${target}-content`).classList.add('active');
            
            // 更新页面标题
            document.getElementById('page-title').textContent = this.querySelector('span').textContent;
            
            // 根据目标页面加载相应内容
            switch(target) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'user-list':
                    loadUserList();
                    break;
                case 'blacklist':
                    loadBlacklist();
                    break;
                case 'post-manage':
                    loadPostManage();
                    break;
                case 'comment-manage':
                    loadCommentManage();
                    break;
                case 'tag-statistic':
                    loadTagStatistic();
                    break;
                case 'feedback-manage':
                    loadFeedbackManage();
                    break;
            }
        });
    });
    
    // 侧边栏折叠按钮
    document.querySelector('.sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
        document.querySelector('.main-content').classList.toggle('collapsed');
    });

    // 查看全部按钮点击事件
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-all')) {
            e.preventDefault();
            const target = e.target.getAttribute('data-target');
            document.querySelector(`.menu-item[data-target="${target}"]`).click();
        }
    });

    // 黑名单刷新按钮
    document.getElementById('refresh-blacklist')?.addEventListener('click', function() {
        loadBlacklist(currentBlacklistPage);
    });
    if (e.target.closest('.btn-prev:not(.disabled)')) {
        e.preventDefault();
        const container = e.target.closest('.pagination');
        if (container) {
            const page = parseInt(container.querySelector('.page-info').textContent.match(/\d+/)[0] || 1);
            const targetPage = page - 1;
            // 根据所在模块调用对应的加载函数
            if (document.getElementById('user-pagination') === container) {
                loadUserList(targetPage);
            } else if (document.getElementById('post-pagination') === container) {
                loadPosts(targetPage);
            }
           
        }
    }
    
    if (e.target.closest('.btn-next:not(.disabled)')) {
        e.preventDefault();
        const container = e.target.closest('.pagination');
        if (container) {
            const page = parseInt(container.querySelector('.page-info').textContent.match(/\d+/)[0] || 1);
            const targetPage = page + 1;
            // 根据所在模块调用对应的加载函数
            if (document.getElementById('user-pagination') === container) {
                loadUserList(targetPage);
            }
            
        }
    }


});

// 全局加载指示器
function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

// 全局错误处理
function handleApiError(error) {
    console.error('API Error:', error);
    alert('操作失败: ' + (error.message || '未知错误'));
    hideLoader();
}

// 在全局作用域添加
window.showCustomModal = showCustomModal;
window.hideCustomModal = hideCustomModal;