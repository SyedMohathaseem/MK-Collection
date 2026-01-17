/* MK Collection - UI Components */

const MKUI = {
    // Initialize product cards
    initProductCards() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.dataset.productId;
            
            // Wishlist toggle
            card.querySelector('.wishlist-toggle')?.addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                e.preventDefault();
                MKUI.setLoading(btn, true);
                
                await new Promise(r => setTimeout(r, 600)); // Simulate processing
                
                const product = MKData.getProductById(productId);
                if (product) {
                    const added = MKWishlist.toggleItem(product);
                    btn.classList.toggle('active', added);
                    MKUI.setLoading(btn, false);
                    MKApp.showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
                }
            });
            
            // Quick add to cart
            card.querySelector('.quick-add')?.addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                e.preventDefault();
                MKUI.setLoading(btn, true);

                await new Promise(r => setTimeout(r, 600)); // Simulate processing

                const product = MKData.getProductById(productId);
                if (product) {
                    MKCart.addItem(product, { size: product.sizes[2], color: product.colors[0]?.name });
                    MKApp.updateCartBadge();
                    MKUI.setLoading(btn, false);
                    MKApp.showToast('Added to bag!', 'success');
                }
            });
        });
    },

    // Render product card HTML
    renderProductCard(product) {
        const isInWishlist = MKWishlist.hasItem(product.id);
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-card-image">
                    <a href="product-detail.html?id=${product.id}">
                        <img src="${product.images[0]}" alt="${product.name}" loading="lazy">
                    </a>
                    <div class="product-card-badges">
                        ${product.isNew ? '<span class="badge badge-new">New</span>' : ''}
                        ${product.isSale ? '<span class="badge badge-sale">-' + product.discount + '%</span>' : ''}
                    </div>
                    <div class="product-card-actions">
                        <button class="product-card-action wishlist-toggle ${isInWishlist ? 'active' : ''}" data-tooltip="Add to Wishlist">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="${isInWishlist ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                            </svg>
                        </button>
                        <button class="product-card-action quick-add" data-tooltip="Quick Add">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="product-card-body">
                    <p class="product-card-category">${product.category}</p>
                    <h3 class="product-card-title"><a href="product-detail.html?id=${product.id}">${product.name}</a></h3>
                    <div class="product-card-price">
                        <span class="current">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? `<span class="original">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    ${product.colors.length > 1 ? `
                        <div class="product-card-colors">
                            ${product.colors.slice(0, 4).map(c => `<span class="product-card-color" style="background:${c.code}" title="${c.name}"></span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Carousel
    initCarousel(container) {
        const track = container.querySelector('.carousel-track');
        const prevBtn = container.querySelector('.carousel-prev');
        const nextBtn = container.querySelector('.carousel-next');
        if (!track) return;

        let position = 0;
        const slideWidth = track.children[0]?.offsetWidth + 24 || 300;
        const maxPosition = -(track.scrollWidth - track.parentElement.offsetWidth);

        prevBtn?.addEventListener('click', () => {
            position = Math.min(position + slideWidth * 2, 0);
            track.style.transform = `translateX(${position}px)`;
            updateButtons();
        });

        nextBtn?.addEventListener('click', () => {
            position = Math.max(position - slideWidth * 2, maxPosition);
            track.style.transform = `translateX(${position}px)`;
            updateButtons();
        });

        function updateButtons() {
            if (prevBtn) prevBtn.disabled = position >= 0;
            if (nextBtn) nextBtn.disabled = position <= maxPosition;
        }
        updateButtons();
    },

    // Tabs
    initTabs(container) {
        const tabs = container.querySelectorAll('.tab');
        const contents = container.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                container.querySelector(`[data-tab-content="${target}"]`)?.classList.add('active');
            });
        });
    },

    // Accordion
    initAccordion(container) {
        container.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const isOpen = item.classList.contains('active');
                container.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
                if (!isOpen) item.classList.add('active');
            });
        });
    },

    // Modal
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.classList.add('active');
            backdrop?.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        const backdrop = document.querySelector('.modal-backdrop');
        if (modal) {
            modal.classList.remove('active');
            backdrop?.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // Quantity selector
    initQuantitySelectors() {
        document.querySelectorAll('.quantity-selector').forEach(selector => {
            const minusBtn = selector.querySelector('.quantity-minus');
            const plusBtn = selector.querySelector('.quantity-plus');
            const input = selector.querySelector('.quantity-value, input');

            minusBtn?.addEventListener('click', () => {
                let val = parseInt(input.value || input.textContent) || 1;
                if (val > 1) {
                    val--;
                    if (input.tagName === 'INPUT') input.value = val;
                    else input.textContent = val;
                    selector.dispatchEvent(new CustomEvent('change', { detail: { value: val } }));
                }
            });

            plusBtn?.addEventListener('click', () => {
                let val = parseInt(input.value || input.textContent) || 1;
                val++;
                if (input.tagName === 'INPUT') input.value = val;
                else input.textContent = val;
                selector.dispatchEvent(new CustomEvent('change', { detail: { value: val } }));
            });
        });
    },

    // Global loading helper
    setLoading(btn, isLoading) {
        if (!btn) return;
        if (isLoading) {
            btn.classList.add('btn-loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('btn-loading');
            btn.disabled = false;
        }
    },

    // Skeleton Loaders
    renderProductCardSkeleton() {
        return `
            <div class="skeleton-product-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton-body">
                    <div class="skeleton skeleton-category"></div>
                    <div class="skeleton skeleton-name"></div>
                    <div class="skeleton skeleton-price"></div>
                    <div class="skeleton-colors">
                        <div class="skeleton skeleton-color"></div>
                        <div class="skeleton skeleton-color"></div>
                        <div class="skeleton skeleton-color"></div>
                    </div>
                </div>
            </div>
        `;
    },

    renderProductGridSkeleton(count = 8) {
        return Array(count).fill(this.renderProductCardSkeleton()).join('');
    },

    renderTableRowSkeleton(columns = 5) {
        const cells = Array(columns).fill('<div class="skeleton skeleton-table-cell"></div>').join('');
        return `<div class="skeleton-table-row">${cells}</div>`;
    },

    renderTableSkeleton(rows = 5, columns = 5) {
        return `<div class="skeleton-table">${Array(rows).fill(this.renderTableRowSkeleton(columns)).join('')}</div>`;
    },

    renderStatCardSkeleton() {
        return `
            <div class="skeleton-stat-card">
                <div class="skeleton skeleton-icon"></div>
                <div class="skeleton skeleton-value"></div>
                <div class="skeleton skeleton-label"></div>
            </div>
        `;
    },

    renderChartSkeleton() {
        return `
            <div class="skeleton-chart">
                <div class="skeleton skeleton-chart-title"></div>
                <div class="skeleton skeleton-chart-area"></div>
            </div>
        `;
    },

    // Show skeleton in a container
    showSkeleton(container, type = 'products', options = {}) {
        if (!container) return;
        container.classList.add('skeleton-loading');
        
        let html = '';
        switch (type) {
            case 'products':
                html = this.renderProductGridSkeleton(options.count || 8);
                break;
            case 'table':
                html = this.renderTableSkeleton(options.rows || 5, options.columns || 5);
                break;
            case 'stats':
                html = Array(options.count || 4).fill(this.renderStatCardSkeleton()).join('');
                break;
            case 'chart':
                html = this.renderChartSkeleton();
                break;
        }
        container.innerHTML = html;
    },

    // Hide skeleton and show real content
    hideSkeleton(container) {
        if (!container) return;
        container.classList.remove('skeleton-loading');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MKUI.initProductCards();
    MKUI.initQuantitySelectors();
    document.querySelectorAll('.carousel-section').forEach(c => MKUI.initCarousel(c));
    document.querySelectorAll('.tabs-container').forEach(c => MKUI.initTabs(c));
    document.querySelectorAll('.accordion').forEach(c => MKUI.initAccordion(c));
});
