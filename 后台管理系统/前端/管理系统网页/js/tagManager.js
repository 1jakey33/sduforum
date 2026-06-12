// 加载标签统计页面
async function loadTagStatistic() {
    try {
        showLoader();
        
        // 获取标签统计数据
        const [stats, hotTags] = await Promise.all([
            api.getTagStatistics(),
            api.getHotTags()
        ]);
        
        renderTagStatistics(stats.result);
        renderHotTags(hotTags.result);
        
        hideLoader();
    } catch (error) {
        handleApiError(error);
    }
}

// 渲染标签统计数据
function renderTagStatistics(tags) {
    const container = document.getElementById('tag-statistics-container');
    
    if (!tags || tags.length === 0) {
        container.innerHTML = '<div class="no-data">暂无标签数据</div>';
        return;
    }
    
    // 计算总数用于百分比
    const total = tags.reduce((sum, tag) => sum + tag.usage, 0);
    
    container.innerHTML = `
        <div class="tag-stats-header">
            <h3><i class="fas fa-tags"></i> 标签使用统计</h3>
            <span>共 ${total} 次使用</span>
        </div>
        <div class="tag-stats-list">
            ${tags.map(tag => `
                <div class="tag-stat-item">
                    <div class="tag-info">
                        <span class="tag-name">${tag.name}</span>
                        <span class="tag-count">${tag.usage} 次</span>
                    </div>
                    <div class="tag-progress">
                        <div class="progress-bar" style="width: ${(tag.usage / total) * 100}%"></div>
                    </div>
                    <div class="tag-percent">${Math.round((tag.usage / total) * 100)}%</div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 添加标签点击事件
    document.querySelectorAll('.tag-name').forEach(tag => {
        tag.addEventListener('click', function() {
            const tagName = this.textContent;
            searchPostsByTag(tagName);
        });
    });
}

// 渲染热门标签
function renderHotTags(tags) {
    const container = document.getElementById('hot-tags-container');
    
    if (!tags || tags.length === 0) {
        container.innerHTML = '<div class="no-data">暂无热门标签数据</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="hot-tags-header">
            <h3><i class="fas fa-fire"></i> 热门标签</h3>
        </div>
        <div class="hot-tags-list">
            ${tags.map(tag => `
                <div class="hot-tag-item" data-tag="${tag.name}">
                    <span class="tag-name">${tag.name}</span>
                    <span class="tag-usage">${tag.usage} 次</span>
                    <button class="btn btn-view-posts">
                        <i class="fas fa-search"></i> 查看帖子
                    </button>
                </div>
            `).join('')}
        </div>
    `;
    
    // 添加查看帖子按钮事件
    document.querySelectorAll('.btn-view-posts').forEach(btn => {
        btn.addEventListener('click', function() {
            const tagName = this.closest('.hot-tag-item').getAttribute('data-tag');
            searchPostsByTag(tagName);
        });
    });
}

// 按标签搜索帖子 (复用postManager中的函数)
function searchPostsByTag(tag) {
    // 切换到帖子管理标签
    document.querySelector('.menu-item[data-target="post-manage"]').click();
    
    // 模拟搜索操作
    document.getElementById('post-search-form').querySelector('input').value = tag;
    document.getElementById('post-search-form').dispatchEvent(new Event('submit'));
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 添加标签点击事件委托
    document.getElementById('tag-statistics-container')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('tag-name')) {
            const tagName = e.target.textContent;
            searchPostsByTag(tagName);
        }
    });
});