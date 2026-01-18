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
        this.initMobileBottomNav();
        this.initSearch();
        this.initCartDrawer();
        this.updateCartBadge();
        this.initScrollEffects();
        this.initTooltips();
        this.initSync();
    },

    // Initialize Mobile Bottom Navigation
    initMobileBottomNav() {
        const accountLink = document.getElementById('mobile-nav-account');
        if (!accountLink) return;

        // Update Login/Profile label based on auth state
        const updateAccountLabel = () => {
            const user = typeof MKAuth !== 'undefined' ? MKAuth.getUser() : null;
            const label = accountLink.querySelector('span');
            if (label) {
                label.textContent = user ? 'Profile' : 'Login';
            }
        };

        updateAccountLabel();

        // Re-check on visibility change (user may have logged in/out in another tab)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) updateAccountLabel();
        });
    },

    // Registry for page-specific refreshers
    refreshers: [],
    onRefresh(callback) {
        this.refreshers.push(callback);
    },

    // Initialize cross-tab sync
    initSync() {
        window.addEventListener('mk-store-sync', (e) => {
            const eventType = e.detail?.event;
            console.log(`Sync event received: ${eventType}`);
            
            // Common updates
            this.updateCartBadge();
            
            // Call page-specific refreshers
            this.refreshers.forEach(cb => {
                try { cb(eventType); } catch(err) { console.error('Refresher error:', err); }
            });
        });
    },

    // Set active nav link based on current page
    initNavActive() {
        const currentPath = window.location.pathname;
        const currentParams = new URLSearchParams(window.location.search);
        
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            try {
                const linkUrl = new URL(link.href, window.location.origin);
                const linkPath = linkUrl.pathname;
                const linkParams = linkUrl.searchParams;

                const isHomeCurrent = currentPath === '/' || currentPath.endsWith('index.html');
                const isProductsPath = currentPath.includes('products.html');
                
                let isActive = false;
                const linkText = link.textContent.trim().toLowerCase();

                if (isHomeCurrent) {
                    if (linkText === 'new arrivals') isActive = true;
                } else if (isProductsPath) {
                    const currentFilter = currentParams.get('filter');
                    const currentCat = currentParams.get('cat');
                    const currentColl = currentParams.get('collection');
                    
                    const linkFilter = linkParams.get('filter');
                    const linkCat = linkParams.get('cat');
                    const linkColl = linkParams.get('collection');

                    // Priority 1: Direct link match (specific sub-links)
                    if (linkFilter && currentFilter === linkFilter) isActive = true;
                    else if (linkCat && currentCat === linkCat) isActive = true;
                    else if (linkColl && currentColl === linkColl) isActive = true;
                    
                    // Priority 2: Parent link logic
                    else if (!linkUrl.search || linkUrl.search === '') {
                        if (currentCat && linkText === 'categories') isActive = true;
                        else if (currentColl && linkText === 'collections') isActive = true;
                        else if (currentFilter === 'sale' && linkText === 'sale') isActive = true;
                        else if (!currentCat && !currentColl && !currentFilter && linkPath.endsWith('products.html')) {
                            // If on "All Products", we don't highlight both Categories and Collections.
                            // We can either highlight none or the first generic products link found.
                        }
                    }
                } else {
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
        if (this._mobileMenuInit) return;
        
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.mobile-menu');

        if (!toggle || !menu) return;
        this._mobileMenuInit = true;

        const toggleMenu = (forceState) => {
            const isActive = forceState !== undefined ? forceState : !menu.classList.contains('active');
            
            toggle.classList.toggle('active', isActive);
            menu.classList.toggle('active', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';

            // Reset submenus when closing
            if (!isActive) {
                menu.querySelectorAll('.mobile-nav-submenu.active').forEach(sub => sub.classList.remove('active'));
                menu.querySelectorAll('.icon.rotate').forEach(icon => icon.classList.remove('rotate'));
            }
        };

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') && 
                !menu.contains(e.target) && 
                !toggle.contains(e.target)) {
                toggleMenu(false);
            }
        });

        // Close menu when clicking a link (handles internal anchors or slow loads)
        const links = menu.querySelectorAll('.mobile-nav-link:not([data-submenu]), .mobile-nav-submenu a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(false);
            });
        });

        // Submenu toggles
        const submenuToggles = menu.querySelectorAll('.mobile-nav-link[data-submenu]');
        submenuToggles.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const submenu = item.nextElementSibling;
                if (submenu) {
                    // Close other submenus if they exist or just toggle
                    submenu.classList.toggle('active');
                    item.querySelector('.icon')?.classList.toggle('rotate');
                }
            });
        });
    },

    // Search Functionality
    initSearch() {
        const searchToggles = document.querySelectorAll('[data-search-toggle]');
        const searchModal = document.querySelector('.search-modal');
        const searchInput = document.querySelector('.search-input');
        const searchResults = document.querySelector('.search-results');

        if (searchToggles.length && searchModal) {
            searchToggles.forEach(toggle => {
                toggle.addEventListener('click', () => {
                    searchModal.classList.add('active');
                    setTimeout(() => searchInput?.focus(), 100);
                });
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

// Initialize on DOM ready (handles both cases: before and after DOMContentLoaded)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        MKApp.init();
    });
} else {
    // DOM already loaded, initialize immediately
    MKApp.init();
}
