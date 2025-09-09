// Vivagram Photo Editor Mini App JavaScript
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
    }

    initTelegramWebApp() {
        // Initialize Telegram Web App if available
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();

            // Set theme colors
            Telegram.WebApp.setHeaderColor('#1e293b');
            Telegram.WebApp.setBackgroundColor('#0f172a');

            // Enable closing confirmation
            Telegram.WebApp.enableClosingConfirmation();
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
            });
        });

        // Copy buttons
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const promptItem = e.target.closest('.prompt-item');
                const prompt = promptItem.dataset.prompt;
                this.copyToClipboard(prompt, e.target);
            });
        });

        // Prompt items (click to copy)
        const promptItems = document.querySelectorAll('.prompt-item');
        promptItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('copy-btn')) return;
                const prompt = item.dataset.prompt;
                this.copyToClipboard(prompt, item);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                    Telegram.WebApp.close();
                }
            }
        });
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
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '1';
        }, 100);
    }

    navigateToSection(sectionId) {
        if (sectionId === this.currentSection) return;

        this.currentSection = sectionId;
        this.showSection(sectionId);
        this.updateNavigation();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Vibrate if supported
        if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    updateNavigation() {
        // Update nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === this.currentSection) {
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
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // Show target category
        const targetContent = document.getElementById(category);
        if (targetContent) {
            targetContent.classList.add('active');
        }
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

            this.showToast('Промпт скопирован!');
            this.animateCopyButton(element);

            // Haptic feedback
            if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showToast('Ошибка копирования', 'error');

            if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
                Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
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
            button.textContent = '✓ Скопировано';
            button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }, 1500);
        }
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

// Advanced features for better UX
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
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Numbers 1-4 for quick navigation
            if (e.key >= '1' && e.key <= '4') {
                const sections = ['main', 'basics', 'processing', 'protips'];
                const index = parseInt(e.key) - 1;
                if (sections[index]) {
                    this.app.navigateToSection(sections[index]);
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

            // Horizontal swipe
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (this.app.currentSection === 'processing') {
                    const categories = ['quality', 'style', 'colors', 'background', 'objects', 'effects'];
                    const currentIndex = categories.indexOf(this.app.currentCategory);

                    if (deltaX > 0 && currentIndex < categories.length - 1) {
                        // Swipe left - next category
                        this.app.switchCategory(categories[currentIndex + 1]);
                    } else if (deltaX < 0 && currentIndex > 0) {
                        // Swipe right - previous category
                        this.app.switchCategory(categories[currentIndex - 1]);
                    }
                }
            }

            startX = 0;
            startY = 0;
        });
    }

    setupSearchFunctionality() {
        // Create search input (hidden by default, can be activated with Ctrl+F)
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Поиск промптов...';
        searchInput.className = 'search-input';
        searchInput.style.cssText = `
            position: fixed;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            border: 2px solid var(--primary-color);
            border-radius: 25px;
            background: var(--bg-card);
            color: var(--text-primary);
            font-size: 16px;
            width: 300px;
            max-width: 80vw;
            z-index: 1001;
            transition: top 0.3s ease;
            outline: none;
        `;

        document.body.appendChild(searchInput);

        // Toggle search with Ctrl+F
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                this.toggleSearch(searchInput);
            } else if (e.key === 'Escape') {
                this.hideSearch(searchInput);
            }
        });

        // Search functionality
        searchInput.addEventListener('input', this.app.debounce((e) => {
            this.searchPrompts(e.target.value);
        }, 300));
    }

    toggleSearch(searchInput) {
        const isVisible = searchInput.style.top === '20px';
        if (isVisible) {
            this.hideSearch(searchInput);
        } else {
            searchInput.style.top = '20px';
            searchInput.focus();
        }
    }

    hideSearch(searchInput) {
        searchInput.style.top = '-50px';
        searchInput.value = '';
        this.searchPrompts('');
    }

    searchPrompts(query) {
        const promptItems = document.querySelectorAll('.prompt-item');
        const lowercaseQuery = query.toLowerCase();

        promptItems.forEach(item => {
            const promptText = item.dataset.prompt.toLowerCase();
            const matches = promptText.includes(lowercaseQuery);

            item.style.display = matches || !query ? 'flex' : 'none';

            // Highlight matching text
            if (query && matches) {
                const textElement = item.querySelector('.prompt-text');
                const originalText = item.dataset.prompt;
                const highlightedText = originalText.replace(
                    new RegExp(query, 'gi'),
                    match => `<mark style="background: var(--warning-color); color: var(--bg-primary);">${match}</mark>`
                );
                textElement.innerHTML = highlightedText;
            } else {
                const textElement = item.querySelector('.prompt-text');
                textElement.textContent = item.dataset.prompt;
            }
        });
    }

    setupFavorites() {
        // Add favorite buttons to prompt items
        const promptItems = document.querySelectorAll('.prompt-item');
        promptItems.forEach(item => {
            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'favorite-btn';
            favoriteBtn.innerHTML = '☆';
            favoriteBtn.style.cssText = `
                background: none;
                border: none;
                color: var(--text-muted);
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: auto;
                transition: color 0.2s ease;
            `;

            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(item, favoriteBtn);
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
            // Remove from favorites
            favorites = favorites.filter(fav => fav !== prompt);
            button.innerHTML = '☆';
            button.style.color = 'var(--text-muted)';
            this.app.showToast('Удалено из избранного');
        } else {
            // Add to favorites
            favorites.push(prompt);
            button.innerHTML = '★';
            button.style.color = 'var(--warning-color)';
            this.app.showToast('Добавлено в избранное');
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new VivagramEditorApp();
    new AdvancedFeatures(app);

    // Performance optimization
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Service worker registration failed, but that's okay
            });
        });
    }

    // Analytics (if needed)
    window.vivagramApp = app;

    console.log('🎨 Vivagram Editor загружен успешно!');
});