// 权限检查：每个管理页面加载时执行
(function checkAuth() {
    const isAuth = localStorage.getItem('mc_admin_auth');
    if (isAuth !== 'true') {
        window.location.href = '../admin-login.html';
    }
})();

// 显示管理员信息
document.addEventListener('DOMContentLoaded', function() {
    const adminUser = localStorage.getItem('mc_admin_user') || 'admin';
    const userSpan = document.getElementById('adminUser');
    if (userSpan) {
        userSpan.textContent = '👤 ' + adminUser;
    }
});

// 退出登录
function logout() {
    localStorage.removeItem('mc_admin_auth');
    localStorage.removeItem('mc_admin_user');
    localStorage.removeItem('mc_admin_login_time');
    window.location.href = '../admin-login.html';
}
