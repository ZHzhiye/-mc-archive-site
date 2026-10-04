// 权限检查：每个管理页面加载时执行
(function checkAuth() {
    var isAuth = localStorage.getItem('mc_admin_auth');
    if (isAuth !== 'true') {
        window.location.href = '../admin-login.html';
    }
})();

// 显示管理员信息
document.addEventListener('DOMContentLoaded', function() {
    var adminUser = localStorage.getItem('mc_admin_user') || 'admin';
    var userSpan = document.getElementById('adminUser');
    if (userSpan) {
        userSpan.textContent = adminUser;
    }
    var avatar = document.getElementById('adminAvatar');
    if (avatar) {
        avatar.textContent = adminUser.charAt(0).toUpperCase();
    }
});

// 退出登录
function logout() {
    localStorage.removeItem('mc_admin_auth');
    localStorage.removeItem('mc_admin_user');
    localStorage.removeItem('mc_admin_login_time');
    window.location.href = '../admin-login.html';
}
