// 学习页面通用JavaScript功能

class LearningSystem {
    constructor() {
        this.currentChapter = 1;
        this.completedChapters = new Set();
        this.totalChapters = this.getTotalChapters();
        this.skillType = this.getSkillType();
        this.init();
    }

    // 获取不同技能的总章节数
    getTotalChapters() {
        const chapterCounts = {
            'html': 19,     // HTML调整为19章
            'css': 20,      // CSS扩展到20章
            'javascript': 20, // JavaScript扩展到20章
            'tools': 6      // Tools保持6章
        };
        
        const skillType = this.getSkillType();
        return chapterCounts[skillType] || 6;
    }

    // 获取当前技能类型
    getSkillType() {
        const pathname = window.location.pathname;
        if (pathname.includes('html.html')) return 'html';
        if (pathname.includes('css.html')) return 'css';
        if (pathname.includes('javascript.html')) return 'javascript';
        if (pathname.includes('tools.html')) return 'tools';
        return 'unknown';
    }

    init() {
        this.setupNavigation();
        this.setupProgressTracking();
        this.setupAssistant();
        this.setupScrollSpy();
        this.loadProgress();
        
        // 延迟添加完成按钮，确保DOM完全加载
        setTimeout(() => {
            this.initCompleteButtons();
        }, 500);
    }

    // 初始化完成按钮
    initCompleteButtons() {
        document.querySelectorAll('.chapter').forEach((chapter, index) => {
            const chapterNumber = index + 1;
            this.addCompleteButton(chapter, chapterNumber);
        });
        this.updateAllButtonStates();
    }

    // 设置导航功能
    setupNavigation() {
        const navLinks = document.querySelectorAll('.chapter-nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const chapter = parseInt(link.getAttribute('data-chapter'));
                this.navigateToChapter(targetId, chapter);
            });
        });
    }

    // 导航到指定章节
    navigateToChapter(targetId, chapter) {
        const target = document.getElementById(targetId);
        if (target) {
            // 更新当前章节
            this.currentChapter = chapter;
            
            // 滚动到目标位置
            target.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // 更新导航状态
            this.updateNavigation();
            
            // 不再自动标记为已访问，需要用户手动完成
        }
    }

    // 更新导航状态
    updateNavigation() {
        const navLinks = document.querySelectorAll('.chapter-nav a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const chapter = parseInt(link.getAttribute('data-chapter'));
            if (chapter === this.currentChapter) {
                link.classList.add('active');
            }
        });
    }

    // 设置进度追踪
    setupProgressTracking() {
        // 监听滚动位置来更新当前章节
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chapter = entry.target.getAttribute('data-chapter') || 
                                   Array.from(document.querySelectorAll('.chapter')).indexOf(entry.target) + 1;
                    this.currentChapter = parseInt(chapter);
                    this.updateNavigation();
                    // 不再自动标记为已完成
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-100px 0px -50% 0px'
        });

        // 观察所有章节
        document.querySelectorAll('.chapter').forEach((chapter, index) => {
            chapter.setAttribute('data-chapter', index + 1);
            observer.observe(chapter);
        });
    }

    // 为章节添加完成按钮
    addCompleteButton(chapterElement, chapterNumber) {
        // 检查是否已经添加过按钮
        if (chapterElement.querySelector('.chapter-complete-btn')) {
            return;
        }

        const completeBtn = document.createElement('div');
        completeBtn.className = 'chapter-complete-section';
        completeBtn.innerHTML = `
            <div class="complete-controls">
                <button class="chapter-complete-btn" onclick="window.learningSystem?.toggleChapterComplete(${chapterNumber})">
                    <span class="btn-icon">✓</span>
                    <span class="btn-text">标记学习</span>
                </button>
                <div class="complete-status" style="display: none;">
                    <div class="complete-info">
                        <span class="complete-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" fill="#28a745"/>
                                <path d="M8.5 12.5L10.5 14.5L15.5 9.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                        <span class="complete-text">已完成</span>
                    </div>

                </div>
            </div>
        `;
        
        chapterElement.appendChild(completeBtn);
    }

    // 切换章节完成状态
    toggleChapterComplete(chapterNumber) {
        const isCompleted = this.completedChapters.has(chapterNumber);
        
        if (isCompleted) {
            // 取消完成状态
            this.completedChapters.delete(chapterNumber);
            this.updateProgress();
            this.updateNavigation();
            this.saveProgress();
            this.showSimpleToast(`第${chapterNumber}章已标记为未学习`);
        } else {
            // 标记为完成
            this.markChapterVisited(chapterNumber);
            this.showCompletionToast(chapterNumber);
        }
        
        // 更新按钮状态
        const chapterElement = document.querySelector(`[data-chapter="${chapterNumber}"]`)?.closest('.chapter') ||
                              document.querySelector(`.chapter:nth-child(${chapterNumber})`);
        if (chapterElement) {
            this.updateButtonState(chapterElement, !isCompleted);
        }
    }

    // 撤销章节完成
    undoChapterComplete(chapterNumber) {
        if (this.completedChapters.has(chapterNumber)) {
            this.completedChapters.delete(chapterNumber);
            this.updateProgress();
            this.saveProgress();
            
            // 更新按钮状态
            const chapterElement = document.querySelector(`[data-chapter="${chapterNumber}"]`);
            if (chapterElement) {
                this.updateButtonState(chapterElement, false);
            }
            
            // 显示撤销提示
            const chapterNames = ['', '第一章', '第二章', '第三章', '第四章', '第五章', 
                                '第六章', '第七章', '第八章', '第九章', '第十章', 
                                '第十一章', '第十二章', '第十三章', '第十四章', '第十五章',
                                '第十六章', '第十七章', '第十八章', '第十九章', '第二十章'];
            const message = `已取消${chapterNames[chapterNumber]}的完成状态`;
            this.showSimpleToast(message);
        }
    }

    // 显示简单提示
    showSimpleToast(message) {
        const toast = document.createElement('div');
        toast.className = 'simple-toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }

    // 更新按钮状态
    updateButtonState(chapterElement, isCompleted) {
        const btn = chapterElement.querySelector('.chapter-complete-btn');
        const btnText = btn?.querySelector('.btn-text');
        const btnIcon = btn?.querySelector('.btn-icon');
        
        if (btn && btnText && btnIcon) {
            if (isCompleted) {
                // 已完成状态
                btnText.textContent = '已完成';
                btnIcon.textContent = '✓';
                btn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                btn.style.color = 'white';
                btn.classList.add('completed');
            } else {
                // 未学习状态
                btnText.textContent = '标记学习';
                btnIcon.textContent = '○';
                btn.style.background = 'linear-gradient(135deg, #6c757d 0%, #495057 100%)';
                btn.style.color = 'white';
                btn.classList.remove('completed');
            }
        }
        
        // 隐藏旧的complete-status元素
        const status = chapterElement.querySelector('.complete-status');
        if (status) {
            status.style.display = 'none';
        }
    }

    // 显示完成提示
    showCompletionToast(chapterNumber) {
        const chapterNames = ['', '第一章', '第二章', '第三章', '第四章', '第五章', 
                            '第六章', '第七章', '第八章', '第九章', '第十章', 
                            '第十一章', '第十二章', '第十三章', '第十四章', '第十五章',
                            '第十六章', '第十七章', '第十八章', '第十九章', '第二十章'];
        const message = `🎉 恭喜完成${chapterNames[chapterNumber]}！继续加油！`;
        
        // 创建toast提示
        const toast = document.createElement('div');
        toast.className = 'completion-toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 自动隐藏
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 标记章节为已访问
    markChapterVisited(chapter) {
        this.completedChapters.add(chapter);
        this.updateProgress();
        this.saveProgress();
    }

    // 更新总体进度
    updateProgress() {
        const progressPercentage = (this.completedChapters.size / this.totalChapters) * 100;
        
        // 更新进度条
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `进度: ${Math.round(progressPercentage)}%`;
        }

        // 更新助手面板进度
        const chapterProgress = document.getElementById('chapter-progress');
        if (chapterProgress) {
            chapterProgress.textContent = `${this.completedChapters.size}/${this.totalChapters}`;
        }

        // 更新章节点
        document.querySelectorAll('.chapter-dot').forEach((dot, index) => {
            const chapter = index + 1;
            dot.classList.remove('completed', 'current');
            
            if (this.completedChapters.has(chapter)) {
                dot.classList.add('completed');
            } else if (chapter === this.currentChapter) {
                dot.classList.add('current');
            }
        });
    }

    // 设置学习助手
    setupAssistant() {
        const assistantBtn = document.getElementById('assistant-toggle');
        const assistantPanel = document.getElementById('assistant-panel');
        
        if (assistantBtn && assistantPanel) {
            assistantBtn.addEventListener('click', () => {
                assistantPanel.classList.toggle('active');
                this.updateAssistantTips();
            });

            // 点击其他地方关闭助手面板
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.assistant')) {
                    assistantPanel.classList.remove('active');
                }
            });
        }
    }

    // 更新助手提示
    updateAssistantTips() {
        const tipsElement = document.getElementById('assistant-tips');
        if (!tipsElement) return;

        const tips = [
            '使用左侧导航快速跳转到不同章节',
            '完成每个章节的练习来提升技能',
            '尝试修改代码示例来加深理解',
            '查看浏览器开发者工具来调试代码',
            '练习是学习编程的最佳方式'
        ];

        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        tipsElement.innerHTML = `<p>💡 ${randomTip}</p>`;
    }

    // 设置滚动监听
    setupScrollSpy() {
        let isScrolling = false;
        
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });
    }

    // 处理滚动事件
    handleScroll() {
        // 获取所有章节元素
        const chapters = document.querySelectorAll('.chapter');
        const navLinks = document.querySelectorAll('.chapter-nav a');
        
        let currentChapter = 1;
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // 找到当前在视口中的章节
        chapters.forEach((chapter, index) => {
            const chapterTop = chapter.offsetTop;
            const chapterBottom = chapterTop + chapter.offsetHeight;
            
            // 判断章节是否在视口中（考虑一些偏移量）
            if (scrollTop + windowHeight / 3 >= chapterTop && scrollTop < chapterBottom) {
                currentChapter = index + 1;
            }
        });
        
        // 更新导航高亮
        navLinks.forEach((link, index) => {
            link.classList.remove('active');
            if (index + 1 === currentChapter) {
                link.classList.add('active');
            }
        });
        
        // 更新当前章节
        if (this.currentChapter !== currentChapter) {
            this.currentChapter = currentChapter;
        }
    }

    // 保存学习进度
    saveProgress() {
        const progressData = {
            completedChapters: Array.from(this.completedChapters),
            currentChapter: this.currentChapter,
            lastVisit: new Date().toISOString()
        };
        
        const progressKey = `learning-progress-${this.skillType}`;
        localStorage.setItem(progressKey, JSON.stringify(progressData));
        
        // 同时保存通用进度（向后兼容）
        localStorage.setItem('learning-progress', JSON.stringify(progressData));
    }

    // 加载学习进度
    loadProgress() {
        const progressKey = `learning-progress-${this.skillType}`;
        let savedProgress = localStorage.getItem(progressKey);
        
        // 如果没有技能特定的进度，尝试加载通用进度（向后兼容）
        if (!savedProgress) {
            savedProgress = localStorage.getItem('learning-progress');
        }
        
        if (savedProgress) {
            try {
                const data = JSON.parse(savedProgress);
                this.completedChapters = new Set(data.completedChapters || []);
                this.currentChapter = data.currentChapter || 1;
                this.updateProgress();
                this.updateNavigation();
                this.updateAllButtonStates();
            } catch (e) {
                console.warn(`无法加载 ${this.skillType} 的学习进度:`, e);
            }
        }
    }

    // 更新所有按钮状态
    updateAllButtonStates() {
        document.querySelectorAll('.chapter').forEach((chapter, index) => {
            const chapterNumber = index + 1;
            const isCompleted = this.completedChapters.has(chapterNumber);
            this.updateButtonState(chapter, isCompleted);
        });
    }

    // 重置学习进度
    resetProgress() {
        const skillNames = {
            'html': 'HTML5',
            'css': 'CSS3', 
            'javascript': 'JavaScript',
            'tools': '开发工具'
        };
        
        const skillName = skillNames[this.skillType] || '当前技能';
        const confirmed = confirm(`确定要重置 ${skillName} 的学习进度吗？\n\n此操作将清除所有已完成的章节，无法撤销！`);
        
        if (confirmed) {
            this.completedChapters.clear();
            this.currentChapter = 1;
            this.updateProgress();
            this.updateNavigation();
            this.updateAllButtonStates();
            
            const progressKey = `learning-progress-${this.skillType}`;
            localStorage.removeItem(progressKey);
            localStorage.removeItem('learning-progress'); // 同时删除通用进度
            
            this.showSimpleToast(`${skillName} 学习进度已重置`);
        }
    }
}

// 代码编辑器功能
class CodeEditor {
    constructor() {
        this.editors = new Map();
        this.init();
    }

    init() {
        // 初始化所有代码编辑器
        document.querySelectorAll('.code-editor').forEach((editor, index) => {
            this.setupEditor(editor, `editor-${index}`);
        });
    }

    setupEditor(element, id) {
        // 保存原始代码
        const originalCode = element.value;
        element.setAttribute('data-original', originalCode);
        
        // 添加语法高亮（简单版本）
        this.addSyntaxHighlight(element);
        
        // 添加自动缩进
        this.addAutoIndent(element);
        
        // 添加行号（可选）
        this.addLineNumbers(element);
        
        this.editors.set(id, {
            element: element,
            originalCode: originalCode
        });
    }

    addSyntaxHighlight(editor) {
        // 简单的语法高亮，可以后续扩展
        editor.addEventListener('input', (e) => {
            // 这里可以添加实时语法高亮逻辑
        });
    }

    addAutoIndent(editor) {
        editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                
                editor.value = editor.value.substring(0, start) + 
                              '    ' + 
                              editor.value.substring(end);
                
                editor.selectionStart = editor.selectionEnd = start + 4;
            }
        });
    }

    addLineNumbers(editor) {
        // 可以添加行号显示功能
        // 这里是简化版本，实际实现可能需要更复杂的逻辑
    }

    runCode(editorId, outputId) {
        const editor = this.editors.get(editorId);
        if (!editor) return;

        const code = editor.element.value;
        const output = document.getElementById(outputId);
        
        if (!output) return;

        try {
            // 根据代码类型执行不同的处理
            this.executeCode(code, output);
        } catch (error) {
            output.innerHTML = `<div class="error">错误: ${error.message}</div>`;
        }
    }

    executeCode(code, output) {
        // 这里实现代码执行逻辑
        // 对于HTML，直接显示
        if (code.includes('<!DOCTYPE html>') || code.includes('<html')) {
            this.renderHTML(code, output);
        } else if (code.includes('console.log')) {
            this.runJavaScript(code, output);
        } else {
            output.innerHTML = '<p>代码已运行</p>';
        }
    }

    renderHTML(htmlCode, output) {
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '300px';
        iframe.style.border = '1px solid #ddd';
        iframe.style.borderRadius = '5px';
        
        output.innerHTML = '';
        output.appendChild(iframe);
        
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(htmlCode);
        doc.close();
    }

    runJavaScript(jsCode, output) {
        // 创建一个安全的JavaScript执行环境
        const logs = [];
        const originalLog = console.log;
        
        console.log = function(...args) {
            logs.push(args.join(' '));
        };
        
        try {
            eval(jsCode);
            output.innerHTML = logs.map(log => `<div>${log}</div>`).join('');
        } catch (error) {
            output.innerHTML = `<div class="error">错误: ${error.message}</div>`;
        } finally {
            console.log = originalLog;
        }
    }

    resetEditor(editorId) {
        const editor = this.editors.get(editorId);
        if (editor) {
            editor.element.value = editor.originalCode;
        }
    }
}

// 移动端适配
class MobileAdapter {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupResponsiveFeatures();
    }

    setupMobileMenu() {
        // 添加移动端菜单切换
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn';
        menuBtn.innerHTML = '☰';
        menuBtn.style.display = 'none';
        
        const nav = document.querySelector('.learn-nav .nav-container');
        if (nav) {
            nav.appendChild(menuBtn);
        }

        menuBtn.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('mobile-open');
            }
        });

        // 响应式显示/隐藏菜单按钮
        this.checkMobile();
        window.addEventListener('resize', () => this.checkMobile());
    }

    checkMobile() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        if (menuBtn) {
            if (window.innerWidth <= 768) {
                menuBtn.style.display = 'block';
            } else {
                menuBtn.style.display = 'none';
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        }
    }

    setupResponsiveFeatures() {
        // 处理移动端特定功能
        if (window.innerWidth <= 768) {
            // 移动端优化
            this.optimizeForMobile();
        }
    }

    optimizeForMobile() {
        // 移动端优化代码
        document.querySelectorAll('.code-editor').forEach(editor => {
            editor.style.fontSize = '14px';
        });
    }
}

// 全局初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化学习系统
    window.learningSystem = new LearningSystem();
    
    // 初始化代码编辑器
    window.codeEditor = new CodeEditor();
    
    // 初始化移动端适配
    window.mobileAdapter = new MobileAdapter();
    
    // 添加完成按钮样式
    addCompleteButtonStyles();
    
    // 初始化完成提示
    console.log('学习系统初始化完成!');
});

// 添加完成按钮样式
function addCompleteButtonStyles() {
    if (document.getElementById('complete-button-styles')) return;

    const style = document.createElement('style');
    style.id = 'complete-button-styles';
    style.textContent = `
        .chapter-complete-section {
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            background: rgba(248, 249, 250, 0.6);
            border-radius: 8px;
            border-left: 4px solid #e9ecef;
            text-align: right;
        }
        
        .complete-controls {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .chapter-complete-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
        }
        
        .chapter-complete-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }
        
        .chapter-complete-btn.completed {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
        }
        
        .chapter-complete-btn.completed:hover {
            background: linear-gradient(135deg, #218838 0%, #1e7e34 100%) !important;
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }
        
        .chapter-complete-btn:active {
            transform: translateY(0);
        }
        
        .btn-icon {
            font-size: 1.2rem;
        }
        
        .complete-status {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            color: #28a745;
            font-weight: 600;
            font-size: 1rem;
        }
        
        .complete-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .complete-icon {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .complete-icon svg {
            filter: drop-shadow(0 2px 4px rgba(40, 167, 69, 0.3));
        }
        
        .undo-complete-btn {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            color: #6c757d;
            border: 1px solid #dee2e6;
            padding: 0.5rem;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .undo-complete-btn:hover {
            background: linear-gradient(135deg, #e9ecef, #dee2e6);
            color: #495057;
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .undo-complete-btn svg {
            transition: transform 0.3s ease;
        }
        
        .undo-complete-btn:hover svg {
            transform: rotate(-15deg);
        }
        
        .simple-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #6c757d;
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 0.9rem;
            max-width: 250px;
        }
        
        .simple-toast.show {
            transform: translateX(0);
        }
        
        .completion-toast {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-weight: 600;
            max-width: 300px;
        }
        
        .completion-toast.show {
            transform: translateX(0);
        }
        
        @media (max-width: 768px) {
            .completion-toast, .simple-toast {
                top: 10px;
                right: 10px;
                left: 10px;
                max-width: none;
                text-align: center;
            }
            
            .chapter-complete-section {
                text-align: center;
                padding: 0.5rem;
            }
            
            .chapter-complete-btn {
                font-size: 0.8rem;
                padding: 0.4rem 0.8rem;
            }
            
            .complete-controls {
                flex-direction: row;
                justify-content: center;
                gap: 0.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// 导出全局函数供HTML使用
window.runHTML = function(editorId, previewId) {
    const editor = document.getElementById(editorId);
    const preview = document.getElementById(previewId);
    
    if (editor && preview) {
        const code = editor.value;
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '300px';
        iframe.style.border = '1px solid #ddd';
        iframe.style.borderRadius = '5px';
        
        preview.innerHTML = '';
        preview.appendChild(iframe);
        
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(code);
        doc.close();
    }
};

window.resetEditor = function(editorId) {
    const editor = document.getElementById(editorId);
    if (editor) {
        const original = editor.getAttribute('data-original');
        if (original) {
            editor.value = original;
        }
    }
};

window.openSkillPage = function(skill) {
    window.location.href = `projects/learn/${skill}.html`;
};
