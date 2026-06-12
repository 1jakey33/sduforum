// 用户列表分页状态
let currentUserPage = 1;
const usersPerPage = 10;

// 加载用户列表
async function loadUserList(page = 1) {
    try {
        showLoader();
        currentUserPage = page;
        
        const start = (page - 1) * usersPerPage;
        const response = await api.getAllUsers(start, usersPerPage);
        
        renderUserList(response.result);
        renderUserPagination(response.result.length);
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 渲染用户列表
function renderUserList(users) {
    const userListContainer = document.getElementById('user-list-container');
    
    if (!users || users.length === 0) {
        userListContainer.innerHTML = '<div class="no-data">暂无用户数据</div>';
        return;
    }
    
    userListContainer.innerHTML = users.map(user => `
        <div class="user-card" data-userid="${user.user_id}">
            <div class="user-avatar">
                <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-info">
                <h4>${user.user_id}</h4>
                <span> ID: ${user.id}</span>
            </div>
            <div class="user-actions">
                <button class="btn btn-sm btn-view-profile">
                    <i class="fas fa-eye"></i> 查看
                </button>
                <button class="btn btn-sm btn-add-blacklist">
                    <i class="fas fa-ban"></i> 拉黑
                </button>
            </div>
        </div>
    `).join('');
    
    // 添加事件监听
    document.querySelectorAll('.btn-view-profile').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.closest('.user-card').getAttribute('data-userid');
            viewUserProfile(userId);
        });
    });
    
    document.querySelectorAll('.btn-add-blacklist').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.closest('.user-card').getAttribute('data-userid');
            showAddBlacklistModal(userId);
        });
    });
}

// 渲染分页控件
function renderUserPagination(itemsCount) {
    const container = document.getElementById('user-pagination');
    
    if (!container) return;
    
    container.innerHTML = `
        <button class="btn btn-prev ${currentUserPage === 1 ? 'disabled' : ''}">
            <i class="fas fa-chevron-left"></i> 上一页
        </button>
        <span class="page-info">第 ${currentUserPage} 页</span>
        <button class="btn btn-next ${itemsCount < usersPerPage ? 'disabled' : ''}">
            下一页 <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // 确保事件只绑定一次
    container.querySelector('.btn-prev:not(.bound)')?.addEventListener('click', () => {
        if (currentUserPage > 1) {
            loadUserList(currentUserPage - 1);
        }
    });
    
    container.querySelector('.btn-next:not(.bound)')?.addEventListener('click', () => {
        if (itemsCount >= usersPerPage) {
            loadUserList(currentUserPage + 1);
        }
    });
    
    // 标记已绑定
    container.querySelector('.btn-prev')?.classList.add('bound');
    container.querySelector('.btn-next')?.classList.add('bound');
}

// 查看用户详情
async function viewUserProfile(userId) {
    try {
        showLoader();
        
        const [profile, posts] = await Promise.all([
            api.getUserProfile(userId),
            api.searchPostsByUser(userId)
        ]);
        
        renderUserProfileModal(profile, posts);
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 渲染用户详情模态框
function renderUserProfileModal(profile, posts) {
    const modalContent = `
        <div class="modal-header">
            <h3>用户详情</h3>
            <button class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${profile.avatar_image_url || 'https://via.placeholder.com/100'}" alt="头像">
                </div>
                <div class="profile-basic">
                    <h2>${profile.nickName || '未设置昵称'}</h2>
                    <p><i class="fas fa-graduation-cap"></i> ${profile.major || '未知专业'}</p>
                    <p><i class="fas fa-calendar-alt"></i> 加入时间: ${formatTime(profile.join_date)}</p>
                </div>
                <div class="profile-stats">
                    <div class="stat-item">
                        <div class="stat-value">${profile.published_post_count || 0}</div>
                        <div class="stat-label">发帖数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${profile.liked_count || 0}</div>
                        <div class="stat-label">获赞数</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${profile.favorite_post_count || 0}</div>
                        <div class="stat-label">收藏数</div>
                    </div>
                </div>
            </div>
            
            <div class="profile-posts">
                <h4>最近发帖</h4>
                ${posts.length > 0 ? 
                    posts.map(post => `
                        <div class="post-item">
                            <div class="post-content">${truncateText(post.content, 50)}</div>
                            <div class="post-meta">
                                <span><i class="fas fa-heart"></i> ${post.favorite_count || 0}</span>
                                <span><i class="fas fa-comment"></i> ${post.comment_count || 0}</span>
                                <span>${formatTime(post.created_at)}</span>
                            </div>
                        </div>
                    `).join('') : 
                    '<p class="no-data">该用户暂未发布帖子</p>'
                }
            </div>
        </div>
    `;
    
    showCustomModal(modalContent);
    
    // 添加关闭按钮事件
    document.querySelector('.btn-close').addEventListener('click', hideCustomModal);
}

// 显示添加到黑名单模态框
function showAddBlacklistModal(userId) {
    const modalContent = `
        <div class="modal-header">
            <h3>添加到黑名单</h3>
            <button class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="blacklist-form">
                <input type="hidden" name="user_id" value="${userId}">
                
                <div class="form-group">
                    <label for="blacklist-reason">原因</label>
                    <select id="blacklist-reason" name="reason" class="form-control" required>
                        <option value="">请选择原因</option>
                        <option value="发布色情低俗内容">发布色情低俗内容</option>
                        <option value="传播暴力血腥信息">传播暴力血腥信息</option>
                        <option value="发布赌博 / 违法交易信息">发布赌博 / 违法交易信息</option>
                        <option value="散布谣言 / 虚假信息">散布谣言 / 虚假信息</option>
                        <option value="广告 / 垃圾信息">广告 / 垃圾信息</option>
                        <option value="人身攻击 / 辱骂他人">人身攻击 / 辱骂他人</option>
                        <option value="骚扰 / 威胁他人">骚扰 / 威胁他人</option>
                        <option value="恶意刷屏">恶意刷屏</option>
                        <option value="二手交易欺诈">二手交易欺诈</option>
                        <option value="虚假招聘信息">虚假招聘信息</option>
                        <option value="学习搭子骚扰">学习搭子骚扰</option>
                        <option value="泄露他人隐私信息">泄露他人隐私信息</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="blacklist-endtime">结束时间</label>
                    <input type="datetime-local" id="blacklist-endtime" name="end_time" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label for="blacklist-notes">备注</label>
                    <textarea id="blacklist-notes" name="notes" class="form-control" rows="3"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">确认添加</button>
                    <button type="button" class="btn btn-cancel" onclick="hideCustomModal()">取消</button>
                </div>
            </form>
        </div>
    `;
    
    showCustomModal(modalContent);
    
    // 设置默认结束时间（7天后）
    const defaultEndTime = new Date();
    defaultEndTime.setDate(defaultEndTime.getDate() + 7);
    document.getElementById('blacklist-endtime').value = defaultEndTime.toISOString().slice(0, 16);
    
    // 表单提交处理
    document.getElementById('blacklist-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            user_id: this.user_id.value,
            reason: this.reason.value,
            end_time: this.end_time.value + ':00' // 添加秒数
        };
        
        try {
            showLoader();
            const response = await api.addToBlacklist(
                formData.user_id, 
                formData.reason, 
                formData.end_time
            );
            
            if (response.state) {
                alert('已成功添加到黑名单');
                hideCustomModal();
                loadUserList(currentUserPage); // 刷新当前页
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            hideLoader();
        }
    });
    
    // 添加关闭按钮事件
    document.querySelector('.btn-close').addEventListener('click', hideCustomModal);
}

// // 自定义模态框显示/隐藏
// function showCustomModal(content) {
//     const modal = document.getElementById('custom-modal');
//     const modalContent = document.getElementById('custom-modal-content');
    
//     modalContent.innerHTML = content;
//     modal.style.display = 'flex';
// }

// function hideCustomModal() {
//     document.getElementById('custom-modal').style.display = 'none';
// }

// 初始化用户搜索
function initUserSearch() {
    const searchForm = document.getElementById('user-search-form');
    
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = this.querySelector('input').value.trim();
        if (!userId) return;
        
        try {
            showLoader();
            const response = await api.searchUser(userId);
            
            if (response.result) {
                // 清空当前列表显示搜索结果
                document.getElementById('user-list-container').innerHTML = `
                    <div class="user-card" data-userid="${response.result.user_id}">
                        <div class="user-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="user-info">
                            <h4>${response.result.user_id}</h4>
                            <span>ID: ${response.result.id}</span>
                        </div>
                        <div class="user-actions">
                            <button class="btn btn-sm btn-view-profile">
                                <i class="fas fa-eye"></i> 查看
                            </button>
                            <button class="btn btn-sm btn-add-blacklist">
                                <i class="fas fa-ban"></i> 拉黑
                            </button>
                        </div>
                    </div>
                `;
                
                // 隐藏分页
                document.getElementById('user-pagination').innerHTML = '';
                
                // 添加事件监听
                document.querySelector('.btn-view-profile').addEventListener('click', function() {
                    viewUserProfile(response.result.user_id);
                });
                
                document.querySelector('.btn-add-blacklist').addEventListener('click', function() {
                    showAddBlacklistModal(response.result.user_id);
                });
            } else {
                document.getElementById('user-list-container').innerHTML = `
                    <div class="no-data">未找到用户: ${userId}</div>
                `;
                document.getElementById('user-pagination').innerHTML = '';
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            hideLoader();
        }
    });
    
    // 重置搜索
    const resetBtn = document.getElementById('reset-search-btn');
    resetBtn.addEventListener('click', function() {
        searchForm.reset();
        loadUserList(1);
    });
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initUserSearch();
});



// 黑名单分页状态
let currentBlacklistPage = 1;
const blacklistPerPage = 10;

// 加载黑名单列表
async function loadBlacklist(page = 1) {
    try {
        showLoader();
        currentBlacklistPage = page;
        
        const start = (page - 1) * blacklistPerPage;
        const response = await api.getBlacklist(start, blacklistPerPage);
        
        renderBlacklist(response.result);
        renderBlacklistPagination(response.result.length);
        
        // 加载黑名单原因统计
        const stats = await api.getBlacklistReasonStats();
        renderBlacklistStats(stats.result);
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 渲染黑名单列表
function renderBlacklist(blacklistItems) {
    const container = document.getElementById('blacklist-container');
    
    if (!blacklistItems || blacklistItems.length === 0) {
        container.innerHTML = '<div class="no-data">黑名单为空</div>';
        return;
    }
    
    container.innerHTML = blacklistItems.map(item => `
        <div class="blacklist-item">
            <div class="blacklist-user">
                <div class="user-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="user-info">
                    <h4>${item.user_id}</h4>
                    <span>ID: ${item.id}</span>
                </div>
            </div>
            <div class="blacklist-details">
                <div class="detail-row">
                    <span class="detail-label">原因:</span>
                    <span class="detail-value">${getReasonText(item.reason)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">开始时间:</span>
                    <span class="detail-value">${formatTime(item.start_time)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">结束时间:</span>
                    <span class="detail-value">${formatTime(item.end_time)}</span>
                </div>
            </div>
            <div class="blacklist-actions">
                <button class="btn btn-sm btn-remove" data-userid="${item.user_id}">
                    <i class="fas fa-user-check"></i> 移除
                </button>
            </div>
        </div>
    `).join('');
    
    // 添加移除按钮事件
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', async function() {
            const userId = this.getAttribute('data-userid');
            if (confirm(`确定要将用户 ${userId} 移出黑名单吗?`)) {
                try {
                    showLoader();
                    const response = await api.removeFromBlacklist(userId);
                    
                    if (response.state) {
                        alert('用户已移出黑名单');
                        loadBlacklist(currentBlacklistPage); // 刷新当前页
                    }
                } catch (error) {
                    handleApiError(error);
                } finally {
                    hideLoader();
                }
            }
        });
    });
}

// 渲染黑名单分页
function renderBlacklistPagination(itemsCount) {
    const container = document.getElementById('blacklist-pagination');
    
    if (!container) {
        console.error('Blacklist pagination container not found');
        return;
    }
    
    // 当数据不足一页时隐藏分页控件
    // if (itemsCount < blacklistPerPage && currentBlacklistPage === 1) {
    //     container.innerHTML = '';
    //     return;
    // }
    
    container.innerHTML = `
        <button class="btn btn-prev ${currentBlacklistPage === 1 ? 'disabled' : ''}">
            <i class="fas fa-chevron-left"></i> 上一页
        </button>
        <span class="page-info">第 ${currentBlacklistPage} 页</span>
        <button class="btn btn-next ${itemsCount < blacklistPerPage ? 'disabled' : ''}">
            下一页 <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // 添加事件监听（使用事件委托避免重复绑定）
    container.onclick = (e) => {
        if (e.target.closest('.btn-prev:not(.disabled)')) {
            loadBlacklist(currentBlacklistPage - 1);
        }
        if (e.target.closest('.btn-next:not(.disabled)')) {
            loadBlacklist(currentBlacklistPage + 1);
        }
    };
}

// 渲染黑名单统计
function renderBlacklistStats(stats) {
    const container = document.getElementById('blacklist-stats');
    
    if (!stats || stats.length === 0) {
        container.innerHTML = '<div class="no-data">暂无统计数据</div>';
        return;
    }
    
    // 计算总数用于百分比
    const total = stats.reduce((sum, item) => sum + item.usage, 0);
    
    container.innerHTML = stats.map(item => `
        <div class="stat-item">
            <div class="stat-header">
                <span class="stat-label">${getReasonText(item.reason)}</span>
                <span class="stat-value">${item.usage} (${Math.round((item.usage / total) * 100)}%)</span>
            </div>
            <div class="stat-bar">
                <div class="bar-fill" style="width: ${(item.usage / total) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

// 获取原因文本
function getReasonText(reason) {
    const reasons = {
        'spam': '垃圾信息/广告',
        'inappropriate_content': '不当内容',
        'harassment': '骚扰他人',
        'fake_account': '虚假账号',
        'other': '其他原因'
    };
    return reasons[reason] || reason;
}