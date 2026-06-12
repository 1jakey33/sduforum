// 检查登录状态
function checkAuth() {
    const token= localStorage.getItem('admin_token');
    if (!token) {
        showLoginModal();
        // 隐藏主界面
        document.querySelector('.app-container').style.display = 'none';
        return false;
    }
    // 显示主界面
    document.querySelector('.app-container').style.display = 'flex';
    return true;

    
}

// 显示登录模态框
function showLoginModal() {
    document.getElementById('login-modal').style.display = 'flex';
    document.querySelector('.app-container').style.display = 'none';
}

// 隐藏登录模态框
function hideLoginModal() {
    document.getElementById('login-modal').style.display = 'none';
    document.querySelector('.app-container').style.display = 'flex';
}

// 登录表单提交处理
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        account: document.getElementById('username').value,
        password: document.getElementById('password').value
    };
    
    try {
        const response = await fetch('http://120.26.127.37:8081/sdu_forum/api/manage/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.state) {
            localStorage.setItem('admin_token', 'authenticated');
            hideLoginModal();
            // 加载控制面板
            loadDashboard();
        } else {
            alert('登录失败，请检查账号密码');
        }
    } catch (error) {
        console.error('登录错误:', error);
        alert('登录过程中发生错误');
    }
});

// 登出功能
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('admin_token');
    showLoginModal();
});

// 初始化检查
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});