/* ========================================
   MK Collection - Main Application
   ======================================== */

const MKApp = {
    // Initialize Application
    init() {
        this.bindEvents();
        this.initHeader();
        this.initNavActive();
        this.initMobileMenu();
        this.initSearch();
        this.initCartDrawer();
        this.updateCartBadge();
        this.initScrollEffects();
        this.initTooltips();
    },

    // Set active nav link based on current page
    initNavActive() {
        const currentPath = window.location.pathname;
        const currentParams = new URLSearchParams(window.location.search);
        
        // Select all navigation links (Desktop and Mobile)
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            try {
                const linkUrl = new URL(link.href, window.location.origin);
                const linkPath = linkUrl.pathname;
                const linkParams = linkUrl.searchParams;

                const isHomeCurrent = currentPath === '/' || currentPath.endsWith('index.html');
                const isHomeLink = linkPath === '/' || linkPath.endsWith('index.html');
                const isProductsPath = currentPath.includes('products.html');
                
                let isActive = false;

                // Handle Home / New Arrivals
                if (isHomeCurrent) {
                    // Highlight "New Arrivals" on home page
                    if (link.textContent.trim() === 'New Arrivals') {
                        isActive = true;
                    }
                } else if (isProductsPath) {
                    const currentFilter = currentParams.get('filter');
                    const currentCat = currentParams.get('cat');
                    const linkFilter = linkParams.get('filter');
                    const linkCat = linkParams.get('cat');

                    // Match filter or category
                    if (currentFilter && currentFilter === linkFilter) {
                        isActive = true;
                    } else if (currentCat && currentCat === linkCat) {
                        isActive = true;
                    } else if (!currentFilter && !currentCat && linkPath.endsWith('products.html') && !linkUrl.search) {
                        // Generic products link
                        isActive = true;
                    }
                } else {
                    // Exact page match for other pages (About, Account, etc.)
                    const pageName = currentPath.split('/').pop();
                    if (pageName && linkPath.endsWith(pageName) && !linkUrl.search) {
                        isActive = true;
                    }
                }

                if (isActive) link.classList.add('active');
            } catch (e) {
                const href = link.getAttribute('href');
                if (href && currentPath.includes(href)) link.classList.add('active');
            }
        });
    },

    // Bind Global Events
    bindEvents() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    },

    // Header Scroll Effect
    initHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    },

    // Mobile Menu
    initMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.mobile-menu');

        if (!toggle || !menu) return;

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
        });

        // Submenu toggles
        const submenuToggles = menu.querySelectorAll('.mobile-nav-link[data-submenu]');
        submenuToggles.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const submenu = item.nextElementSibling;
                if (submenu) {
                    submenu.classList.toggle('active');
                    item.querySelector('.icon')?.classList.toggle('rotate');
                }
            });
        });
    },

    // Search Functionality
    initSearch() {
        const searchToggle = document.querySelector('[data-search-toggle]');
        const searchModal = document.querySelector('.search-modal');
        const searchInput = document.querySelector('.search-input');
        const searchResults = document.querySelector('.search-results');

        if (searchToggle && searchModal) {
            searchToggle.addEventListener('click', () => {
                searchModal.classList.add('active');
                setTimeout(() => searchInput?.focus(), 100);
            });

            searchModal.addEventListener('click', (e) => {
                if (e.target === searchModal) {
                    searchModal.classList.remove('active');
                }
            });
        }

        // Search Input Handler
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }
    },

    // Perform Search
    performSearch(query) {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer || !query.trim()) {
            if (resultsContainer) resultsContainer.innerHTML = '';
            return;
        }

        const results = MKData.searchProducts(query);
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <p>No products found for "${query}"</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = results.slice(0, 6).map(product => `
            <a href="product-detail.html?id=${product.id}" class="search-result-item">
                <div class="search-result-image">
                    <img src="${product.images[0]}" alt="${product.name}">
                </div>
                <div class="search-result-info">
                    <h4>${product.name}</h4>
                    <span class="search-result-price">$${product.price.toFixed(2)}</span>
                </div>
            </a>
        `).join('');
    },

    // Cart Drawer
    initCartDrawer() {
        const cartToggle = document.querySelector('[data-cart-toggle]');
        const cartDrawer = document.querySelector('.cart-drawer');
        const cartBackdrop = document.querySelector('.cart-drawer-backdrop');
        const cartClose = document.querySelector('.cart-drawer-close');

        if (cartToggle && cartDrawer) {
            cartToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCartDrawer();
            });
        }

        if (cartClose) {
            cartClose.addEventListener('click', () => this.closeCartDrawer());
        }

        if (cartBackdrop) {
            cartBackdrop.addEventListener('click', () => this.closeCartDrawer());
        }
    },

    openCartDrawer() {
        const cartDrawer = document.querySelector('.cart-drawer');
        const cartBackdrop = document.querySelector('.cart-drawer-backdrop');

        if (cartDrawer) {
            cartDrawer.classList.add('active');
            cartBackdrop?.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.renderCartDrawer();
        }
    },

    closeCartDrawer() {
        const cartDrawer = document.querySelector('.cart-drawer');
        const cartBackdrop = document.querySelector('.cart-drawer-backdrop');

        if (cartDrawer) {
            cartDrawer.classList.remove('active');
            cartBackdrop?.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    renderCartDrawer() {
        const cartBody = document.querySelector('.cart-drawer-body');
        const cartSubtotal = document.querySelector('.cart-subtotal-value');
        const cartItems = MKCart.getItems();

        if (!cartBody) return;

        if (cartItems.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-drawer-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p>Your bag is empty</p>
                    <a href="products.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }

        cartBody.innerHTML = cartItems.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-variant">${item.color || ''} ${item.size ? '/ ' + item.size : ''}</p>
                    <div class="cart-item-bottom">
                        <div class="quantity-selector quantity-selector-sm">
                            <button class="quantity-btn" onclick="MKApp.updateCartQuantity('${item.id}', ${item.quantity - 1})">−</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn" onclick="MKApp.updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                        <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="MKApp.removeFromCart('${item.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `).join('');

        if (cartSubtotal) {
            cartSubtotal.textContent = `$${MKCart.getSubtotal().toFixed(2)}`;
        }

        // Update shipping progress
        this.updateShippingProgress();
    },

    updateShippingProgress() {
        const progressBar = document.querySelector('.cart-shipping-progress .progress-fill');
        const progressText = document.querySelector('.cart-shipping-text');
        const subtotal = MKCart.getSubtotal();
        const freeShippingThreshold = 150;

        if (progressBar && progressText) {
            const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
            progressBar.style.width = `${progress}%`;

            if (subtotal >= freeShippingThreshold) {
                progressText.textContent = '🎉 You qualify for free shipping!';
            } else {
                const remaining = freeShippingThreshold - subtotal;
                progressText.textContent = `Add $${remaining.toFixed(2)} more for free shipping`;
            }
        }
    },

    updateCartQuantity(itemId, quantity) {
        if (quantity <= 0) {
            this.removeFromCart(itemId);
        } else {
            MKCart.updateQuantity(itemId, quantity);
            this.renderCartDrawer();
            this.updateCartBadge();
        }
    },

    removeFromCart(itemId) {
        MKCart.removeItem(itemId);
        this.renderCartDrawer();
        this.updateCartBadge();
        this.showToast('Item removed from bag');
    },

    updateCartBadge() {
        const badges = document.querySelectorAll('.header-action-badge');
        const count = MKCart.getItemCount();

        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    },

    // Scroll Effects
    initScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-in, .slide-up').forEach(el => {
            observer.observe(el);
        });
    },

    // Tooltips
    initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-popup';
                tooltip.textContent = el.dataset.tooltip;
                document.body.appendChild(tooltip);

                const rect = el.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - 10}px`;
            });

            el.addEventListener('mouseleave', () => {
                document.querySelector('.tooltip-popup')?.remove();
            });
        });
    },

    // Close All Modals
    closeAllModals() {
        document.querySelectorAll('.modal.active, .modal-backdrop.active').forEach(el => {
            el.classList.remove('active');
        });
        this.closeCartDrawer();
        document.querySelectorAll('.mobile-menu.active').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector('.mobile-menu-toggle')?.classList.remove('active');
        document.body.style.overflow = '';
    },

    // Toast Notifications
    showToast(message, type = 'default') {
        const container = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    },

    // Format Currency
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    },

    // Debounce Helper
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
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    MKApp.init();
});
