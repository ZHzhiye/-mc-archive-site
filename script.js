/* ============================================
   MC 档案馆 - 交互脚本
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    initParticles();
    initStatCounters();
    initMusicToggle();
    initTabs();
});

/* --- 粒子背景（飘落的方块碎片） --- */
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const blockColors = ['#5d9c3b', '#8b5a2b', '#7a7a7a', '#3fd1d9', '#d33838', '#ffd700'];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 创建粒子
    const count = Math.min(50, Math.floor(window.innerWidth / 25));
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 4 + Math.random() * 10,
            speedY: 0.3 + Math.random() * 1,
            speedX: (Math.random() - 0.5) * 0.4,
            color: blockColors[Math.floor(Math.random() * blockColors.length)],
            opacity: 0.15 + Math.random() * 0.25,
            rot: Math.random() * Math.PI,
            rotSpeed: (Math.random() - 0.5) * 0.02
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            // 画小方块（像素风）
            const s = p.size;
            ctx.fillRect(-s / 2, -s / 2, s, s);
            // 亮面
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(-s / 2, -s / 2, s, s * 0.35);
            // 暗面
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fillRect(-s / 2, s / 2 - s * 0.35, s, s * 0.35);
            ctx.restore();

            // 更新
            p.y += p.speedY;
            p.x += p.speedX;
            p.rot += p.rotSpeed;

            // 循环
            if (p.y > canvas.height + p.size) {
                p.y = -p.size;
                p.x = Math.random() * canvas.width;
            }
            if (p.x < -p.size) p.x = canvas.width + p.size;
            if (p.x > canvas.width + p.size) p.x = -p.size;
        });

        requestAnimationFrame(draw);
    }
    draw();
}

/* --- 统计数字滚动动画 --- */
function initStatCounters() {
    const nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    nums.forEach(n => observer.observe(n));
}

function animateNumber(el) {
    const target = parseInt(el.getAttribute('data-target')) || 0;
    const duration = 1500;
    const start = performance.now();

    function easeOutQuad(t) { return t * (2 - t); }

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(easeOutQuad(progress) * target);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
    }
    requestAnimationFrame(update);
}

/* --- 背景音乐开关 --- */
function initMusicToggle() {
    const btn = document.getElementById('musicBtn');
    const icon = document.getElementById('musicIcon');
    const bgm = document.getElementById('bgm');
    if (!btn || !bgm) return;

    // 记住用户偏好
    const saved = localStorage.getItem('mc-music') === 'on';
    if (saved) {
        bgm.volume = 0.3;
        bgm.play().then(() => { icon.textContent = '🔊'; }).catch(() => {});
    }

    btn.addEventListener('click', () => {
        if (bgm.paused) {
            bgm.volume = 0.3;
            bgm.play().then(() => {
                icon.textContent = '🔊';
                localStorage.setItem('mc-music', 'on');
            }).catch(err => {
                icon.textContent = '🔇';
                console.log('音频播放被浏览器阻止，请先与页面交互');
            });
        } else {
            bgm.pause();
            icon.textContent = '🔇';
            localStorage.setItem('mc-music', 'off');
        }
    });
}

/* --- 选项卡切换（上传页） --- */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    if (!tabBtns.length) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const content = document.getElementById(target + '-tab');
            if (content) content.classList.add('active');
        });
    });
}
