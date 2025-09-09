// Vivagram Pro - Professional AI Image Editing Guide
class VivagramProApp {
    constructor() {
        this.currentSection = 'main';
        this.currentTechnique = 'addition';
        this.currentTemplateCategory = 'portrait';
        this.currentFilter = 'all';
        this.visitedSections = new Set();
        this.favorites = new Set();
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeApp();
        this.initTelegramWebApp();
        this.loadUserData();
        this.setupProgressTracking();
    }

    initTelegramWebApp() {
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();

            // Theme configuration
            Telegram.WebApp.setHeaderColor('#1e293b');
            Telegram.WebApp.setBackgroundColor('#0a0f1c');

            // Main button
            Telegram.WebApp.MainButton.setText('Закрыть гид');
            Telegram.WebApp.MainButton.show();
            Telegram.WebApp.MainButton.onClick(() => {
                Telegram.WebApp.close();
            });

            // Enable closing confirmation
            Telegram.WebApp.enableClosingConfirmation();
        }
    }

    setupProgressTracking() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const sections = ['main', 'examples', 'practices', 'templates', 'development'];
            const updateProgress = () => {
                const progress = (this.visitedSections.size / sections.length) * 100;
                progressBar.style.width = progress + '%';

                if (progress === 100 && this.visitedSections.size === sections.length) {
                    setTimeout(() => {
                        this.showToast('🎉 Поздравляем! Вы изучили все разделы!', 'success');
                        this.createCelebration();
                    }, 500);
                }
            };

            // Track initial section
            this.visitedSections.add(this.currentSection);
            updateProgress();

            // Override navigation to track progress
            const originalNavigate = this.navigateToSection.bind(this);
            this.navigateToSection = (sectionId) => {
                originalNavigate(sectionId);
                this.visitedSections.add(sectionId);
                updateProgress();
                this.saveUserData();
            };
        }
    }

    loadUserData() {
        try {
            const savedData = localStorage.getItem('vivagram_pro_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.visitedSections = new Set(data.visitedSections || []);
                this.favorites = new Set(data.favorites || []);
            }
        } catch (e) {
            console.warn('Could not load user data');
        }
    }

    saveUserData() {
        try {
            const data = {
                visitedSections: Array.from(this.visitedSections),
                favorites: Array.from(this.favorites)
            };
            localStorage.setItem('vivagram_pro_data', JSON.stringify(data));
        } catch (e) {
            console.warn('Could not save user data');
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(section);
                this.trackEvent('navigation', section);
            });
        });

        // Hero navigation buttons
        document.querySelectorAll('[data-section]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                    this.trackEvent('hero_navigation', section);
                }
            });
        });

        // Technique tabs
        document.querySelectorAll('.technique-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const technique = e.target.dataset.technique;
                this.switchTechnique(technique);
                this.trackEvent('technique_switch', technique);
            });
        });

        // Technique previews
        document.querySelectorAll('.technique-preview').forEach(preview => {
            preview.addEventListener('click', (e) => {
                const technique = e.currentTarget.dataset.technique;
                this.navigateToSection('examples');
                setTimeout(() => this.switchTechnique(technique), 300);
            });
        });

        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const card = e.target.closest('[data-prompt]');
                if (card) {
                    const prompt = card.dataset.prompt;
                    this.copyToClipboard(prompt, e.target);
                    this.trackEvent('copy_prompt', prompt.substring(0, 30));
                }
            });
        });

        // Prompt cards (click to copy)
        document.querySelectorAll('[data-prompt]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('copy-btn')) return;
                const prompt = card.dataset.prompt;
                this.copyToClipboard(prompt, card);
                this.trackEvent('card_copy', prompt.substring(0, 30));
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = e.target.dataset.filter;
                this.filterExamples(filter);
            });
        });

        // Template categories
        document.querySelectorAll('.template-category').forEach(category => {
            category.addEventListener('click', (e) => {
                e.preventDefault();
                const cat = e.target.dataset.category;
                this.switchTemplateCategory(cat);
            });
        });

        // Quick actions
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.quick-btn').dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Scroll tracking
        window.addEventListener('scroll', this.throttle(() => {
            this.updateScrollProgress();
        }, 100));
    }

    initializeApp() {
        this.showSection(this.currentSection);
        this.updateNavigation();
        this.showTechnique(this.currentTechnique);
        this.showTemplateCategory(this.currentTemplateCategory);

        // Fade in animation
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.6s ease';
            document.body.style.opacity = '1';
        }, 100);

        // Initialize components
        this.initImageHovers();
        this.initTooltips();
    }

    initImageHovers() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('mouseenter', () => {
                img.style.transform = 'scale(1.02)';
            });
            img.addEventListener('mouseleave', () => {
                img.style.transform = 'scale(1)';
            });
        });
    }

    initTooltips() {
        // Add tooltips to complex elements
        document.querySelectorAll('[title]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                // Custom tooltip implementation could go here
            });
        });
    }

    navigateToSection(sectionId) {
        if (sectionId === this.currentSection) return;

        // Animate out current section
        const currentEl = document.getElementById(this.currentSection);
        if (currentEl) {
            currentEl.style.opacity = '0';
            currentEl.style.transform = 'translateY(-20px)';
        }

        setTimeout(() => {
            this.currentSection = sectionId;
            this.showSection(sectionId);
            this.updateNavigation();

            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Haptic feedback
            if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }, 150);
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            setTimeout(() => {
                targetSection.style.opacity = '1';
                targetSection.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    updateNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === this.currentSection) {
                item.classList.add('active');
            }
        });
    }

    switchTechnique(technique) {
        if (technique === this.currentTechnique) return;

        this.currentTechnique = technique;
        this.showTechnique(technique);
        this.updateTechniqueTabs();

        // Haptic feedback
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    showTechnique(technique) {
        // Hide all technique contents
        document.querySelectorAll('.technique-content').forEach(content => {
            content.classList.remove('active');
            content.style.opacity = '0';
        });

        // Show target technique
        setTimeout(() => {
            const targetContent = document.getElementById(technique);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.opacity = '1';
            }
        }, 150);
    }

    updateTechniqueTabs() {
        document.querySelectorAll('.technique-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.technique === this.currentTechnique) {
                tab.classList.add('active');
            }
        });
    }

    switchTemplateCategory(category) {
        if (category === this.currentTemplateCategory) return;

        this.currentTemplateCategory = category;
        this.showTemplateCategory(category);
        this.updateTemplateTabs();
    }

    showTemplateCategory(category) {
        document.querySelectorAll('.templates-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(category);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    updateTemplateTabs() {
        document.querySelectorAll('.template-category').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === this.currentTemplateCategory) {
                tab.classList.add('active');
            }
        });
    }

    filterExamples(filter) {
        this.currentFilter = filter;

        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        // Filter example cards
        document.querySelectorAll('.example-card').forEach(card => {
            const category = card.dataset.category;
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    if (card.style.opacity === '0') {
                        card.style.display = 'none';
                    }
                }, 300);
            }
        });
    }

    async copyToClipboard(text, element) {
        try {
            // Modern clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }

            this.showToast('Промпт скопирован! 🎉', 'success');
            this.animateCopyButton(element);
            this.createConfetti(element);

            // Haptic feedback
            if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

        } catch (err) {
            console.error('Failed to copy:', err);
            this.showToast('Ошибка копирования 😞', 'error');

            if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
        }
    }

    animateCopyButton(element) {
        const button = element.classList.contains('copy-btn') ? element : element.querySelector('.copy-btn');

        if (button) {
            const originalText = button.textContent;
            button.textContent = '✅ Скопировано!';
            button.style.transform = 'scale(1.1)';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.transform = 'scale(1)';
            }, 2000);
        }
    }

    createConfetti(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 15; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = centerX + 'px';
            confetti.style.top = centerY + 'px';
            confetti.style.width = '8px';
            confetti.style.height = '8px';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '10000';
            confetti.style.transform = 'scale(0)';
            confetti.style.transition = 'all 0.8s ease-out';

            document.body.appendChild(confetti);

            setTimeout(() => {
                const angle = (Math.PI * 2 * i) / 15;
                const distance = 60 + Math.random() * 60;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                confetti.style.transform = `translate(${x}px, ${y}px) scale(1)`;
                confetti.style.opacity = '0';
            }, 50);

            setTimeout(() => {
                if (document.body.contains(confetti)) {
                    document.body.removeChild(confetti);
                }
            }, 900);
        }
    }

    createCelebration() {
        // Full screen celebration effect
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
        `;

        document.body.appendChild(celebration);

        // Create multiple confetti bursts
        for (let burst = 0; burst < 3; burst++) {
            setTimeout(() => {
                for (let i = 0; i < 30; i++) {
                    const confetti = document.createElement('div');
                    confetti.style.position = 'absolute';
                    confetti.style.left = Math.random() * 100 + '%';
                    confetti.style.top = '-10px';
                    confetti.style.width = '10px';
                    confetti.style.height = '10px';
                    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
                    confetti.style.borderRadius = '50%';
                    confetti.style.transition = 'all 3s ease-out';

                    celebration.appendChild(confetti);

                    setTimeout(() => {
                        confetti.style.transform = `translateY(${window.innerHeight + 100}px) rotate(720deg)`;
                        confetti.style.opacity = '0';
                    }, 50);
                }
            }, burst * 300);
        }

        setTimeout(() => {
            if (document.body.contains(celebration)) {
                document.body.removeChild(celebration);
            }
        }, 4000);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastText = document.getElementById('toastText');

        if (toast && toastText) {
            toastText.textContent = message;

            if (type === 'error') {
                toast.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            } else {
                toast.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }

            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'search':
                this.showSearchOverlay();
                break;
            case 'favorites':
                this.showFavorites();
                break;
            case 'top':
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
        }
    }

    showSearchOverlay() {
        // Create search overlay if it doesn't exist
        let overlay = document.getElementById('searchOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'searchOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(10, 15, 28, 0.95);
                backdrop-filter: blur(10px);
                display: none;
                justify-content: center;
                align-items: flex-start;
                padding-top: 20vh;
                z-index: 9999;
            `;

            const container = document.createElement('div');
            container.style.cssText = `
                background: var(--bg-card);
                border-radius: 16px;
                padding: 24px;
                width: 90%;
                max-width: 500px;
                box-shadow: var(--shadow-glow);
            `;

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = '🔍 Поиск промптов...';
            input.style.cssText = `
                width: 100%;
                padding: 16px 20px;
                border: 2px solid var(--border-color);
                border-radius: 12px;
                background: var(--bg-primary);
                color: var(--text-primary);
                font-size: 16px;
                outline: none;
            `;

            const results = document.createElement('div');
            results.style.cssText = `
                margin-top: 16px;
                max-height: 300px;
                overflow-y: auto;
            `;

            container.appendChild(input);
            container.appendChild(results);
            overlay.appendChild(container);
            document.body.appendChild(overlay);

            // Event listeners
            input.addEventListener('input', this.debounce((e) => {
                this.performSearch(e.target.value, results);
            }, 300));

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideSearchOverlay();
                }
            });
        }

        overlay.style.display = 'flex';
        overlay.querySelector('input').focus();
    }

    hideSearchOverlay() {
        const overlay = document.getElementById('searchOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    performSearch(query, resultsContainer) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Введите запрос для поиска промптов</p>';
            return;
        }

        const allPrompts = document.querySelectorAll('[data-prompt]');
        const results = [];

        allPrompts.forEach(item => {
            const promptText = item.dataset.prompt.toLowerCase();
            const queryLower = query.toLowerCase();

            if (promptText.includes(queryLower)) {
                results.push({
                    text: item.dataset.prompt,
                    element: item
                });
            }
        });

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Промпты не найдены</p>';
            return;
        }

        resultsContainer.innerHTML = results.map(result => `
            <div class="search-result-item" style="
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            " data-prompt="${result.text}">
                <span style="color: var(--text-primary);">${this.highlightText(result.text, query)}</span>
            </div>
        `).join('');

        // Add click handlers
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const prompt = item.dataset.prompt;
                this.copyToClipboard(prompt, item);
                this.hideSearchOverlay();
            });

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'var(--bg-hover)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'var(--bg-primary)';
            });
        });
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--warning-color); color: var(--bg-primary); padding: 2px 4px; border-radius: 4px;">$1</mark>');
    }

    showFavorites() {
        // Implementation for favorites functionality
        this.showToast('Функция избранного в разработке', 'info');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Number keys for section navigation
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const sections = ['main', 'examples', 'practices', 'templates', 'development'];
            const index = parseInt(e.key) - 1;
            if (sections[index]) {
                this.navigateToSection(sections[index]);
            }
        }

        // Ctrl/Cmd + F for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            this.showSearchOverlay();
        }

        // Escape to close overlays
        if (e.key === 'Escape') {
            this.hideSearchOverlay();
            if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                Telegram.WebApp.close();
            }
        }

        // Arrow keys for technique navigation
        if (this.currentSection === 'examples' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            const techniques = ['addition', 'masking', 'style', 'composition', 'preservation'];
            const currentIndex = techniques.indexOf(this.currentTechnique);

            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                this.switchTechnique(techniques[currentIndex - 1]);
            } else if (e.key === 'ArrowRight' && currentIndex < techniques.length - 1) {
                this.switchTechnique(techniques[currentIndex + 1]);
            }
        }
    }

    updateScrollProgress() {
        const scrolled = window.pageYOffset;
        const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / maxHeight) * 100;

        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = Math.min(progress, 100) + '%';
        }
    }

    trackEvent(eventName, eventValue) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'engagement',
                event_label: eventValue
            });
        }

        console.log(`📊 Event: ${eventName}, Value: ${eventValue}`);
    }

    // Utility methods
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

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new VivagramProApp();

    // Global reference
    window.vivagramProApp = app;

    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`🚀 Vivagram Pro загружен за ${Math.round(loadTime)}ms`);
        });
    }

    console.log('🎨 Vivagram Pro инициализирован успешно!');
});