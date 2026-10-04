// 选项卡切换（上传页用）
function switchTab(tabName) {
    // 隐藏所有选项卡内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的 active 类
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的选项卡
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // 给当前按钮加 active
    event.target.classList.add('active');
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('MC Archive 空壳网站已加载 ✅');
    console.log('下一步：接入后端和文件处理功能');
});
