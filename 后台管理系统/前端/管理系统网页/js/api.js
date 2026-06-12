// API请求基础封装
async function makeApiRequest(url, method = 'GET', body = null) {
    
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    
    const config = {
        method,
        headers
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }
    
    try {
        showLoader();
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        hideLoader();
        return data;
    } catch (error) {
        hideLoader();
        handleApiError(error);
        throw error;
    }
}

// 特定API端点封装
const api = {
    // 用户管理
    getAllUsers: (start = 0, limit = 10) => 
        makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/getALLUser?start=${start}&limit=${limit}`),
    
    searchUser: (userId) => 
        makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/searchUser?user_id=${userId}`),
    
    getUserProfile: (userId) => 
        makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/getUserProfile?user_id=${userId}`),
    
    addToBlacklist: (userId, reason, endTime) => 
        makeApiRequest('http://120.26.127.37:8081/sdu_forum/api/manage/Add_user_id_to_blackList', 'POST', {
            user_id: userId,
            reason,
            end_time: endTime
        }),
    
    removeFromBlacklist: (userId) => 
        makeApiRequest('http://120.26.127.37:8081/sdu_forum/api/manage/Remove_user_id_from_blackList', 'POST', {
            user_id: userId
        }),
    
    getBlacklistReasonStats: () => 
        makeApiRequest('http://120.26.127.37:8081/sdu_forum/api/manage/Get_blackList_reason_statistic'),
    
    getFeedback: (start = 0, limit = 10) => 
        makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/getFeedback?start=${start}&limit=${limit}`),
    
    getBlacklist: (start = 0, limit = 10) => 
        makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/getBlacklist?start=${start}&limit=${limit}`),
    
    // 帖子管理
    getTodayPosts: (start = 0, limit = 10) => 
        makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/post/getTodayPost?start=${start}&limit=${limit}`),
    
    getAllPosts: (start = 0, limit = 10) => 
        makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/post/getAllPost?start=${start}&limit=${limit}`),
    
    getPostDetails: (postId) => 
        makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/post/getPostDetails?post_id=${postId}`),
    
    searchPostsByUser: (userId) => {
    // 确保userId是字符串且不为空
    if (!userId || typeof userId !== 'string') {
        return Promise.reject(new Error('Invalid user ID'));
    }
    return makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/post/search_user_id?user_id=${encodeURIComponent(userId)}`);
},

searchPostsByTag: (tag, start = 0, pageSize = 10) => {
    // 去除#号并验证
    const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
    if (!cleanTag) {
        return Promise.reject(new Error('Invalid tag'));
    }
    return makeApiRequest(
        `http://120.26.127.37:8081/sdu_forum/api/manage/post/search_tag?tag=${encodeURIComponent(cleanTag)}&start=${start}&pageSize=${pageSize}`
    );
},
    
    deletePost: (postId) => 
        makeApiRequest('http://120.26.127.37:8081/sdu_forum/api/manage/post/deletePost', 'POST', {
            post_id: postId
        }),
    
    // 评论管理
    getComments: (postId) => 
        makeApiRequest(`http://120.26.127.37:8081/sdu_forum/api/manage/comment/getComment?post_id=${postId}`),
    
    deleteComment: (postId, commentId) => 
        makeApiRequest('http://120.26.127.37:8081/sdu_forum/api/manage/comment/deleteComment', 'POST', {
            post_id: postId,
            id: commentId
        }),
    
    // 标签管理
    getTagStatistics: () => 
        makeApiRequest('http://120.26.127.37:8081/sdu_forum/api/manage/tag/tag_statistic'),
    
    getHotTags: () => 
        makeApiRequest('http://120.26.127.37:8081/sdu_forum/api/manage/tag/hotTag'),
    
    // 数据统计
    getTotalNumbers: () => 
        makeApiRequest('http://120.26.127.37:8081/sdu_forum/api/manage/get_total_num')
    .then(response => response || {}), 
};