// Enhanced Vivagram Photo Editor Mini App JavaScript
class VivagramEditorApp {
    constructor() {
        this.currentSection = 'main';
        this.currentCategory = 'quality';
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeApp();
        this.initTelegramWebApp();
        this.initFloatingActions();
        this.initImageLazyLoading();
    }

    initTelegramWebApp() {
        // Initialize Telegram Web App if available
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();

            // Set theme colors
            Telegram.WebApp.setHeaderColor('#1e293b');
            Telegram.WebApp.setBackgroundColor('#0a0f1c');

            // Enable closing confirmation
            Telegram.WebApp.enableClosingConfirmation();

            // Configure main button
            Telegram.WebApp.MainButton.setText('Закрыть гид');
            Telegram.WebApp.MainButton.onClick(() => {
                Telegram.WebApp.close();
            });
        }
    }

    initFloatingActions() {
        const fabMain = document.getElementById('fabMain');
        const fabMenu = document.getElementById('fabMenu');

        if (fabMain && fabMenu) {
            fabMain.addEventListener('click', () => {
                fabMenu.classList.toggle('active');
                fabMain.style.transform = fabMenu.classList.contains('active') 
                    ? 'rotate(45deg)' : 'rotate(0deg)';
            });
        }
    }

    initImageLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    bindEvents() {
        // Navigation events
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(section);
                this.trackEvent('navigation', section);
            });
        });

        // Hero button navigation
        const heroNavButtons = document.querySelectorAll('[data-section]');
        heroNavButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                    this.trackEvent('hero_action', section);
                }
            });
        });

        // Category tabs
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.switchCategory(category);
                this.trackEvent('category_change', category);
            });
        });

        // Copy buttons with enhanced feedback
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const promptItem = e.target.closest('.prompt-item');
                const prompt = promptItem.dataset.prompt;
                this.copyToClipboard(prompt, e.target);
                this.trackEvent('copy_prompt', prompt.substring(0, 20));
            });
        });

        // Prompt items (click to copy)
        const promptItems = document.querySelectorAll('.prompt-item');
        promptItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('copy-btn')) return;
                const prompt = item.dataset.prompt;
                this.copyToClipboard(prompt, item);
                this.trackEvent('click_copy_prompt', prompt.substring(0, 20));
            });
        });

        // Gallery image interactions
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                this.showImageModal(item.querySelector('img').src);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
                if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                    Telegram.WebApp.close();
                }
            }

            // Quick navigation with numbers
            if (e.key >= '1' && e.key <= '5') {
                const sections = ['main', 'basics', 'processing', 'protips', 'gallery'];
                const index = parseInt(e.key) - 1;
                if (sections[index]) {
                    this.navigateToSection(sections[index]);
                }
            }
        });

        // Scroll-based nav highlighting
        window.addEventListener('scroll', this.throttle(() => {
            this.updateActiveNavOnScroll();
        }, 100));
    }

    initializeApp() {
        // Show initial section
        this.showSection(this.currentSection);
        this.updateNavigation();

        // Initialize first category
        this.showCategory(this.currentCategory);

        // Add loading animation
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.6s ease';
            document.body.style.opacity = '1';
        }, 100);

        // Initialize particles or other visual effects
        this.initVisualEffects();
    }

    initVisualEffects() {
        // Add subtle animations to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.animationDelay = `\${index * 0.1}s`;
            card.classList.add('animate-in');
        });
    }

    navigateToSection(sectionId) {
        if (sectionId === this.currentSection) return;

        // Add exit animation to current section
        const currentSectionEl = document.getElementById(this.currentSection);
        if (currentSectionEl) {
            currentSectionEl.style.opacity = '0';
            currentSectionEl.style.transform = 'translateY(-20px)';
        }

        setTimeout(() => {
            this.currentSection = sectionId;
            this.showSection(sectionId);
            this.updateNavigation();

            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Haptic feedback
            if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        }, 150);
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
        });

        // Show target section with animation
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
        // Update nav items with smooth transitions
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === this.currentSection) {
                item.classList.add('active');
            }
        });
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('.section');
        const navItems = document.querySelectorAll('.nav-item');

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === current) {
                item.classList.add('active');
            }
        });
    }

    switchCategory(category) {
        if (category === this.currentCategory) return;

        this.currentCategory = category;
        this.showCategory(category);
        this.updateCategoryTabs();

        // Haptic feedback
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    showCategory(category) {
        // Hide all tab contents with fade effect
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.opacity = '0';
        });

        // Show target category
        setTimeout(() => {
            const targetContent = document.getElementById(category);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.opacity = '1';
            }
        }, 150);
    }

    updateCategoryTabs() {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.category === this.currentCategory) {
                button.classList.add('active');
            }
        });
    }

    async copyToClipboard(text, element) {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
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
            console.error('Failed to copy text: ', err);
            this.showToast('Ошибка копирования 😞', 'error');

            if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
        }
    }

    createConfetti(element) {
        // Simple confetti effect
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 10; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = centerX + 'px';
            confetti.style.top = centerY + 'px';
            confetti.style.width = '6px';
            confetti.style.height = '6px';
            confetti.style.backgroundColor = `hsl(\${Math.random() * 360}, 70%, 60%)`;
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '10000';
            confetti.style.transform = 'scale(0)';
            confetti.style.transition = 'all 0.6s ease-out';

            document.body.appendChild(confetti);

            setTimeout(() => {
                const angle = (Math.PI * 2 * i) / 10;
                const distance = 50 + Math.random() * 50;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                confetti.style.transform = `translate(\${x}px, \${y}px) scale(1)`;
                confetti.style.opacity = '0';
            }, 10);

            setTimeout(() => {
                document.body.removeChild(confetti);
            }, 700);
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastText = document.getElementById('toastText');

        if (toast && toastText) {
            toastText.textContent = message;

            // Set toast color based on type
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

    animateCopyButton(element) {
        const button = element.classList.contains('copy-btn') ? element : element.querySelector('.copy-btn');

        if (button) {
            const originalText = button.textContent;
            button.textContent = '✅ Скопировано!';
            button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            button.style.transform = 'scale(1.1)';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                button.style.transform = 'scale(1)';
            }, 2000);
        }
    }

    showImageModal(imageSrc) {
        // Create modal for image viewing
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        modal.appendChild(img);
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 10);

        modal.addEventListener('click', () => {
            modal.style.opacity = '0';
            img.style.transform = 'scale(0.8)';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
    }

    closeModals() {
        const modals = document.querySelectorAll('.image-modal');
        modals.forEach(modal => {
            modal.click();
        });
    }

    trackEvent(eventName, eventValue) {
        // Simple analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'engagement',
                event_label: eventValue
            });
        }

        console.log(`📊 Event: \${eventName}, Value: \${eventValue}`);
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

// Enhanced features for better UX
class AdvancedFeatures {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        this.setupKeyboardShortcuts();
        this.setupSwipeGestures();
        this.setupSearchFunctionality();
        this.setupFavorites();
        this.setupProgressTracking();
    }

    setupProgressTracking() {
        // Track user progress through the guide
        const sections = ['main', 'basics', 'processing', 'protips', 'gallery'];
        let visitedSections = JSON.parse(localStorage.getItem('visited_sections') || '[]');

        const originalNavigate = this.app.navigateToSection.bind(this.app);
        this.app.navigateToSection = (sectionId) => {
            originalNavigate(sectionId);

            if (!visitedSections.includes(sectionId)) {
                visitedSections.push(sectionId);
                localStorage.setItem('visited_sections', JSON.stringify(visitedSections));

                // Show completion progress
                const progress = (visitedSections.length / sections.length) * 100;
                if (progress === 100) {
                    setTimeout(() => {
                        this.app.showToast('🎉 Поздравляем! Вы изучили весь гид!', 'success');
                    }, 1000);
                }
            }
        };
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Enhanced keyboard navigation
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.app.navigateToSection('main');
                        break;
                    case '2':
                        e.preventDefault();
                        this.app.navigateToSection('basics');
                        break;
                    case '3':
                        e.preventDefault();
                        this.app.navigateToSection('processing');
                        break;
                    case '4':
                        e.preventDefault();
                        this.app.navigateToSection('protips');
                        break;
                    case '5':
                        e.preventDefault();
                        this.app.navigateToSection('gallery');
                        break;
                }
            }

            // Arrow keys for tab navigation
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                if (this.app.currentSection === 'processing') {
                    const categories = ['quality', 'style', 'colors', 'background', 'objects', 'effects'];
                    const currentIndex = categories.indexOf(this.app.currentCategory);

                    if (e.key === 'ArrowLeft' && currentIndex > 0) {
                        this.app.switchCategory(categories[currentIndex - 1]);
                    } else if (e.key === 'ArrowRight' && currentIndex < categories.length - 1) {
                        this.app.switchCategory(categories[currentIndex + 1]);
                    }
                }
            }
        });
    }

    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;

            const deltaX = startX - endX;
            const deltaY = startY - endY;

            // Horizontal swipe for categories
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (this.app.currentSection === 'processing') {
                    const categories = ['quality', 'style', 'colors', 'background', 'objects', 'effects'];
                    const currentIndex = categories.indexOf(this.app.currentCategory);

                    if (deltaX > 0 && currentIndex < categories.length - 1) {
                        this.app.switchCategory(categories[currentIndex + 1]);
                    } else if (deltaX < 0 && currentIndex > 0) {
                        this.app.switchCategory(categories[currentIndex - 1]);
                    }
                }
            }

            startX = 0;
            startY = 0;
        });
    }

    setupSearchFunctionality() {
        // Enhanced search with better UI
        const searchOverlay = document.createElement('div');
        searchOverlay.className = 'search-overlay';
        searchOverlay.style.cssText = `
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

        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = `
            background: var(--bg-card);
            border-radius: 16px;
            padding: 24px;
            width: 90%;
            max-width: 500px;
            box-shadow: var(--shadow-glow);
        `;

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '🔍 Поиск промптов...';
        searchInput.style.cssText = `
            width: 100%;
            padding: 16px 20px;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s ease;
        `;

        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        searchResults.style.cssText = `
            margin-top: 16px;
            max-height: 300px;
            overflow-y: auto;
        `;

        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchResults);
        searchOverlay.appendChild(searchContainer);
        document.body.appendChild(searchOverlay);

        // Search functionality
        searchInput.addEventListener('input', this.app.debounce((e) => {
            this.performSearch(e.target.value, searchResults);
        }, 300));

        // Toggle search with Ctrl+F or Cmd+F
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.toggleSearch(searchOverlay, searchInput);
            } else if (e.key === 'Escape') {
                this.hideSearch(searchOverlay);
            }
        });

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                this.hideSearch(searchOverlay);
            }
        });
    }

    toggleSearch(overlay, input) {
        if (overlay.style.display === 'flex') {
            this.hideSearch(overlay);
        } else {
            overlay.style.display = 'flex';
            input.focus();
        }
    }

    hideSearch(overlay) {
        overlay.style.display = 'none';
    }

    performSearch(query, resultsContainer) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">Введите запрос для поиска промптов</p>';
            return;
        }

        const allPrompts = document.querySelectorAll('.prompt-item');
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
            " data-prompt="\${result.text}">
                <span style="color: var(--text-primary);">\${this.highlightText(result.text, query)}</span>
            </div>
        `).join('');

        // Add click handlers to search results
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const prompt = item.dataset.prompt;
                this.app.copyToClipboard(prompt, item);
                this.hideSearch(resultsContainer.closest('.search-overlay'));
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
        const regex = new RegExp(`(\${query})`, 'gi');
        return text.replace(regex, '<mark style="background: var(--warning-color); color: var(--bg-primary); padding: 2px 4px; border-radius: 4px;">$1</mark>');
    }

    setupFavorites() {
        // Enhanced favorites system
        const promptItems = document.querySelectorAll('.prompt-item');
        promptItems.forEach(item => {
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'favorite-btn';
            favoriteBtn.innerHTML = '☆';
            favoriteBtn.style.cssText = `
                background: none;
                border: none;
                color: var(--text-muted);
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: auto;
                transition: all 0.3s ease;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(item, favoriteBtn);
            });

            favoriteBtn.addEventListener('mouseenter', () => {
                favoriteBtn.style.backgroundColor = 'var(--bg-glass)';
                favoriteBtn.style.transform = 'scale(1.1)';
            });

            favoriteBtn.addEventListener('mouseleave', () => {
                favoriteBtn.style.backgroundColor = 'transparent';
                favoriteBtn.style.transform = 'scale(1)';
            });

            item.insertBefore(favoriteBtn, item.querySelector('.copy-btn'));

            // Check if already favorited
            const favorites = this.getFavorites();
            if (favorites.includes(item.dataset.prompt)) {
                favoriteBtn.innerHTML = '★';
                favoriteBtn.style.color = 'var(--warning-color)';
            }
        });
    }

    toggleFavorite(item, button) {
        const prompt = item.dataset.prompt;
        let favorites = this.getFavorites();

        if (favorites.includes(prompt)) {
            favorites = favorites.filter(fav => fav !== prompt);
            button.innerHTML = '☆';
            button.style.color = 'var(--text-muted)';
            this.app.showToast('❌ Удалено из избранного');
        } else {
            favorites.push(prompt);
            button.innerHTML = '★';
            button.style.color = 'var(--warning-color)';
            this.app.showToast('⭐ Добавлено в избранное');
        }

        this.saveFavorites(favorites);
    }

    getFavorites() {
        try {
            const favorites = localStorage.getItem('vivagram_favorites');
            return favorites ? JSON.parse(favorites) : [];
        } catch (e) {
            return [];
        }
    }

    saveFavorites(favorites) {
        try {
            localStorage.setItem('vivagram_favorites', JSON.stringify(favorites));
        } catch (e) {
            console.warn('Could not save favorites to localStorage');
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new VivagramEditorApp();
    new AdvancedFeatures(app);

    // Global app reference
    window.vivagramApp = app;

    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`🚀 Vivagram Editor загружен за \${Math.round(loadTime)}ms`);
        });
    }

    console.log('🎨 Vivagram Editor инициализирован успешно!');
});