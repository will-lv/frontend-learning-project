// ====== 全局应用类 ======
class FrontendLearningApp {
    constructor() {
        this.isInitialized = false;
        this.components = {};
        this.init();
    }

    // 应用初始化
    init() {
        if (this.isInitialized) return;
        
        console.log('🚀 前端学习项目启动中...');
        
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        this.isInitialized = true;
    }

    // 核心设置
    setup() {
        this.bindEvents();
        this.initComponents();
        this.hideLoading();
        this.showWelcomeMessage();
        console.log('✅ 前端学习项目加载完成！');
    }

    // 绑定事件监听器
    bindEvents() {
        // 窗口事件
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
        window.addEventListener('load', this.handleLoad.bind(this));
        
        // 页面焦点事件 - 刷新技能进度
        window.addEventListener('focus', () => {
            if (this.components.animation) {
                this.components.animation.refreshSkillProgress();
            }
        });
        
        // 页面可见性变化事件
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.components.animation) {
                this.components.animation.refreshSkillProgress();
            }
        });
        
        // 键盘事件
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // 错误处理
        window.addEventListener('error', this.handleError.bind(this));
        
        // 网络状态
        window.addEventListener('online', () => this.showToast('网络连接已恢复', 'success'));
        window.addEventListener('offline', () => this.showToast('网络连接已断开', 'warning'));
    }

    // 初始化组件
    initComponents() {
        this.components = {
            navigation: new NavigationManager(),
            theme: new ThemeManager(),
            scroll: new ScrollManager(),
            form: new FormManager(),
            animation: new AnimationManager(),
            projects: new ProjectManager()
        };
    }

    // 隐藏加载动画
    hideLoading() {
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.classList.add('hidden');
                setTimeout(() => loading.remove(), 500);
            }
        }, 1000);
    }

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 滚动处理
    handleScroll() {
        const scrollY = window.pageYOffset;
        this.components.scroll?.updateScrollProgress(scrollY);
        this.components.scroll?.updateBackToTop(scrollY);
        this.components.navigation?.updateNavbarOnScroll(scrollY);
    }

    // 窗口大小改变处理
    handleResize() {
        this.components.navigation?.handleResize();
    }

    // 页面加载完成处理
    handleLoad() {
        const loadTime = performance.timing?.loadEventEnd - performance.timing?.navigationStart;
        if (loadTime) {
            console.log(`⚡ 页面加载时间: ${loadTime}ms`);
            if (loadTime > 3000) {
                this.showToast('页面加载较慢，建议检查网络连接', 'warning');
            }
        }
    }

    // 键盘事件处理
    handleKeyboard(e) {
        // ESC 关闭移动菜单
        if (e.key === 'Escape') {
            this.components.navigation?.closeMobileMenu();
        }

        // Ctrl/Cmd + D 切换主题
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            this.components.theme?.toggle();
        }
    }

    // 错误处理
    handleError(e) {
        console.error('应用错误:', e.error);
        this.showToast('出现了一个错误，请刷新页面重试', 'error');
    }

    // Toast 消息系统
    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>${this.getToastIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (container.contains(toast)) {
                    container.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Toast 图标
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // 欢迎消息
    showWelcomeMessage() {
        setTimeout(() => {
            this.showToast('欢迎来到前端学习项目！尝试切换主题或滚动浏览各个区域。', 'info', 6000);
        }, 2000);
    }
}

// ====== 导航管理器 ======
class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavTracking();
    }

    // 移动端菜单
    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
                document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
            });
        }
    }

    // 平滑滚动
    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    this.closeMobileMenu();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    this.updateActiveNavLink(link);
                }
            });
        });
    }

    // 活动导航跟踪
    setupActiveNavTracking() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-menu a');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            rootMargin: '-50% 0px -50% 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    // 关闭移动菜单
    closeMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 更新活动导航链接
    updateActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // 滚动时更新导航栏
    updateNavbarOnScroll(scrollY) {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        if (scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                navbar.style.background = 'rgba(17, 24, 39, 0.95)';
            }
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.8)';
            if (document.documentElement.getAttribute('data-theme') === 'dark') {
                navbar.style.background = 'rgba(17, 24, 39, 0.8)';
            }
        }
    }

    // 窗口大小改变处理
    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }
}

// ====== 主题管理器 ======
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupThemeToggle();
        this.loadSavedTheme();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        themeToggle.addEventListener('click', () => this.toggle());
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.apply(savedTheme);
    }

    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.apply(newTheme);
        
        // 切换动画
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.style.transform = 'scale(0.8)';
            setTimeout(() => {
                themeToggle.style.transform = '';
            }, 150);
        }

        if (window.app) {
            window.app.showToast(`已切换到${newTheme === 'dark' ? '暗色' : '亮色'}主题`, 'info');
        }
    }

    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
}

// ====== 滚动管理器 ======
class ScrollManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollProgress();
        this.setupBackToTop();
    }

    setupScrollProgress() {
        this.progressBar = document.getElementById('scroll-progress');
    }

    setupBackToTop() {
        const backToTopButton = document.getElementById('back-to-top');
        if (backToTopButton) {
            backToTopButton.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    updateScrollProgress(scrollY) {
        if (!this.progressBar) return;
        
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollY / docHeight) * 100;
        this.progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    }

    updateBackToTop(scrollY) {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;

        if (scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }
}

// ====== 表单管理器 ======
class FormManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFormValidation();
    }

    setupFormValidation() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateForm(form)) {
                this.submitForm(form);
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldGroup = field.closest('.form-group');
        let isValid = true;
        let errorMessage = '';

        this.clearFieldError(field);

        switch (field.type) {
            case 'text':
                if (field.hasAttribute('required') && value === '') {
                    errorMessage = '此字段为必填项';
                    isValid = false;
                } else if (value.length > 0 && value.length < 2) {
                    errorMessage = '至少需要2个字符';
                    isValid = false;
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (field.hasAttribute('required') && value === '') {
                    errorMessage = '邮箱为必填项';
                    isValid = false;
                } else if (value.length > 0 && !emailRegex.test(value)) {
                    errorMessage = '请输入有效的邮箱地址';
                    isValid = false;
                }
                break;

            default:
                if (field.hasAttribute('required') && value === '') {
                    errorMessage = '此字段为必填项';
                    isValid = false;
                }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        const fieldGroup = field.closest('.form-group');
        const errorElement = fieldGroup.querySelector('.error-message');
        
        fieldGroup.classList.add('error');
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        const fieldGroup = field.closest('.form-group');
        const errorElement = fieldGroup.querySelector('.error-message');
        
        fieldGroup.classList.remove('error');
        errorElement.textContent = '';
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    submitForm(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        submitButton.textContent = '发送中...';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';

        setTimeout(() => {
            submitButton.textContent = '发送成功！';
            submitButton.style.background = 'var(--success-color)';
            
            if (window.app) {
                window.app.showToast('消息发送成功！我会尽快回复您。', 'success');
            }

            setTimeout(() => {
                form.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.opacity = '';
                submitButton.style.background = '';
            }, 2000);

        }, 1500);
    }
}

// ====== 动画管理器 ======
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.initCounterAnimations();
        this.initSkillProgressBars();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.skill-card, .project-card, .stat-card');
        animateElements.forEach(el => observer.observe(el));

        // 添加动画样式
        this.addAnimationStyles();
    }

    addAnimationStyles() {
        if (document.getElementById('animation-styles')) return;

        const style = document.createElement('style');
        style.id = 'animation-styles';
        style.textContent = `
            .animate-in {
                animation: fadeInUp 0.8s ease-out forwards;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    initCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter.closest('.stat-card'));
        });
    }

    initSkillProgressBars() {
        const skillCards = document.querySelectorAll('.skill-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target.querySelector('.progress-bar');
                    const progressText = entry.target.querySelector('.progress-text');
                    const skillType = entry.target.getAttribute('data-skill');
                    
                    // 获取实际学习进度
                    const actualProgress = this.getSkillProgress(skillType);
                    
                    setTimeout(() => {
                        const completedChapters = this.getCompletedChaptersCount(skillType);
                        const totalChapters = this.getTotalChaptersCount(skillType);
                        progressBar.style.width = `${actualProgress}%`;
                        if (progressText) {
                            progressText.textContent = `${actualProgress}% (${completedChapters}/${totalChapters})`;
                        }
                    }, 200);
                    
                    observer.unobserve(entry.target);
                }
            });
        });

        skillCards.forEach(card => observer.observe(card));
        
        // 立即刷新进度显示，不等待滚动触发
        setTimeout(() => {
            this.refreshSkillProgress();
        }, 100);
    }

    // 获取技能学习进度
            getSkillProgress(skillType) {
            try {
                const progressKey = `learning-progress-${skillType}`;
                const savedProgress = localStorage.getItem(progressKey);
                
                if (savedProgress) {
                    const data = JSON.parse(savedProgress);
                    const completedChapters = data.completedChapters ? data.completedChapters.length : 0;
                    
                    // 不同技能的章节数
                    const chapterCounts = {
                        'html': 19,     // HTML调整为19章
                        'css': 20,      // CSS扩展到20章
                        'javascript': 20, // JavaScript扩展到20章
                        'tools': 6      // Tools保持6章
                    };
                    
                    const totalChapters = chapterCounts[skillType] || 6;
                    return Math.round((completedChapters / totalChapters) * 100);
                }
            } catch (e) {
                console.warn(`无法加载 ${skillType} 的学习进度:`, e);
            }
            
            // 如果没有学习记录，返回0%
            return 0;
        }

    // 获取完成的章节数量
    getCompletedChaptersCount(skillType) {
        try {
            const progressKey = `learning-progress-${skillType}`;
            const savedProgress = localStorage.getItem(progressKey);
            
            if (savedProgress) {
                const data = JSON.parse(savedProgress);
                return data.completedChapters ? data.completedChapters.length : 0;
            }
        } catch (e) {
            console.warn(`无法加载 ${skillType} 的章节数量:`, e);
        }
        
        return 0;
    }

    // 获取技能的总章节数
    getTotalChaptersCount(skillType) {
        const chapterCounts = {
            'html': 19,     // HTML调整为19章
            'css': 20,      // CSS扩展到20章
            'javascript': 20, // JavaScript扩展到20章
            'tools': 6      // Tools保持6章
        };
        
        return chapterCounts[skillType] || 6;
    }

    // 刷新所有技能进度
    refreshSkillProgress() {
        const skillCards = document.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            const progressBar = card.querySelector('.progress-bar');
            const progressText = card.querySelector('.progress-text');
            const skillType = card.getAttribute('data-skill');
            
            if (progressBar && skillType) {
                const actualProgress = this.getSkillProgress(skillType);
                const completedChapters = this.getCompletedChaptersCount(skillType);
                const totalChapters = this.getTotalChaptersCount(skillType);
                
                progressBar.style.width = `${actualProgress}%`;
                if (progressText) {
                    progressText.textContent = `${actualProgress}% (${completedChapters}/${totalChapters})`;
                }
            }
        });
    }
}

// ====== 项目管理器 ======
class ProjectManager {
    constructor() {
        this.projects = {
            resume: {
                name: '个人简历页面',
                description: '使用HTML5语义化标签构建的响应式个人简历',
                tech: ['HTML5', 'CSS3', 'JavaScript'],
                github: 'https://github.com/username/resume-project',
                demo: '#'
            },
            calculator: {
                name: '计算器应用',
                description: '功能完整的计算器，支持基础运算和键盘操作',
                tech: ['JavaScript', 'CSS Grid', 'HTML5'],
                github: 'https://github.com/username/calculator-project',
                demo: '#'
            },
            todo: {
                name: '待办事项应用',
                description: '支持增删改查的待办事项管理应用',
                tech: ['JavaScript', 'LocalStorage', 'CSS3'],
                github: 'https://github.com/username/todo-project',
                demo: '#'
            }
        };
    }

    openProject(projectId) {
        const project = this.projects[projectId];
        if (project && window.app) {
            window.app.showToast(`正在打开 ${project.name}...`, 'info');
            setTimeout(() => {
                window.app.showToast('项目演示功能开发中...', 'info');
            }, 1000);
        }
    }

    viewCode(projectId) {
        const project = this.projects[projectId];
        if (project && window.app) {
            window.app.showToast(`正在查看 ${project.name} 源代码...`, 'info');
            setTimeout(() => {
                window.open(project.github, '_blank');
            }, 500);
        }
    }
}

// ====== 工具函数 ======
const utils = {
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            if (window.app) {
                window.app.showToast('已复制到剪贴板！', 'success');
            }
        } catch (err) {
            console.error('复制失败:', err);
            if (window.app) {
                window.app.showToast('复制失败，请手动复制', 'error');
            }
        }
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },

    isMobile() {
        return window.innerWidth <= 768;
    },

    getRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#10b981', '#f59e0b'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    openSkillPage(skill) {
        // 技能学习页面映射
        const skillPages = {
            'html': 'projects/learn/html.html',
            'css': 'projects/learn/css.html', 
            'javascript': 'projects/learn/javascript.html',
            'tools': 'projects/learn/tools.html'
        };

        const skillNames = {
            'html': 'HTML5',
            'css': 'CSS3',
            'javascript': 'JavaScript',
            'tools': '开发工具'
        };

        if (skillPages[skill]) {
            if (window.app) {
                window.app.showToast(`正在打开 ${skillNames[skill]} 学习页面...`, 'info');
            }
            
            // 添加loading效果
            setTimeout(() => {
                window.location.href = skillPages[skill];
            }, 800);
        } else {
            if (window.app) {
                window.app.showToast('学习页面开发中，敬请期待！', 'warning');
            }
        }
    },

    // 刷新技能进度（全局函数）
    refreshSkillProgress() {
        if (window.app?.components?.animation) {
            window.app.components.animation.refreshSkillProgress();
        }
    }
};

// ====== 全局变量和初始化 ======
let app;
let projectManager;

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    app = new FrontendLearningApp();
    projectManager = app.components.projects;
    
    // 暴露全局函数供HTML调用
    window.app = app;
    window.scrollToSection = utils.scrollToSection;
    window.openProject = (id) => projectManager?.openProject(id);
    window.viewCode = (id) => projectManager?.viewCode(id);
    window.openSkillPage = utils.openSkillPage;
    window.refreshSkillProgress = utils.refreshSkillProgress;
    window.utils = utils;
});

// 开发模式工具
if (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development') {
    console.log('🔧 开发模式已启用');
    
    window.debugApp = {
        app,
        utils,
        toggleTheme: () => app.components.theme?.toggle(),
        showAllToasts: () => {
            ['success', 'error', 'warning', 'info'].forEach((type, index) => {
                setTimeout(() => {
                    app.showToast(`这是${type}类型的消息`, type);
                }, index * 500);
            });
        }
    };
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        FrontendLearningApp, 
        NavigationManager, 
        ThemeManager, 
        ScrollManager, 
        FormManager, 
        AnimationManager, 
        ProjectManager, 
        utils 
    };
}