/* MK Collection - Skeleton Loading Utility */

const MKSkeleton = {
    /**
     * Generate a skeleton product card HTML
     */
    productCard() {
        return `
            <div class="product-card skeleton-card">
                <div class="product-card-image skeleton skeleton-image"></div>
                <div class="product-card-body">
                    <div class="skeleton skeleton-text" style="width:40%"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text" style="width:50%"></div>
                    <div class="skeleton-colors">
                        <div class="skeleton skeleton-circle"></div>
                        <div class="skeleton skeleton-circle"></div>
                        <div class="skeleton skeleton-circle"></div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate a skeleton table row
     * @param {number} cols - Number of columns
     */
    tableRow(cols = 5) {
        let cells = '';
        for (let i = 0; i < cols; i++) {
            const width = 40 + Math.random() * 40; // Random width between 40-80%
            cells += `<td><div class="skeleton skeleton-text" style="width:${width}%"></div></td>`;
        }
        return `<tr class="skeleton-row">${cells}</tr>`;
    },

    /**
     * Generate skeleton stat card for admin dashboard
     */
    statCard() {
        return `
            <div class="stat-card skeleton-stat">
                <div class="stat-card-header">
                    <div class="skeleton skeleton-circle" style="width:40px;height:40px"></div>
                    <div class="skeleton skeleton-text" style="width:50px"></div>
                </div>
                <div class="skeleton skeleton-title" style="width:60%;height:2rem;margin-bottom:var(--space-2)"></div>
                <div class="skeleton skeleton-text" style="width:80%"></div>
            </div>
        `;
    },

    /**
     * Generate skeleton chart placeholder
     */
    chart() {
        return `
            <div class="skeleton-chart">
                <div class="skeleton" style="width:100%;height:300px;border-radius:var(--radius-lg)"></div>
            </div>
        `;
    },

    /**
     * Generate skeleton notification item
     */
    notification() {
        return `
            <div class="notification-item skeleton-notification">
                <div class="skeleton skeleton-circle" style="width:48px;height:48px;flex-shrink:0"></div>
                <div style="flex:1">
                    <div class="skeleton skeleton-text" style="width:70%"></div>
                    <div class="skeleton skeleton-text" style="width:90%"></div>
                    <div class="skeleton skeleton-text" style="width:30%"></div>
                </div>
            </div>
        `;
    },

    /**
     * Generate skeleton order row for admin
     */
    orderRow() {
        return `
            <div class="admin-table-row skeleton-row" style="display:grid;grid-template-columns:1fr 2fr 1fr 1fr 1fr;gap:var(--space-4);padding:var(--space-4)">
                <div class="skeleton skeleton-text" style="width:80%"></div>
                <div class="skeleton skeleton-text" style="width:60%"></div>
                <div class="skeleton skeleton-text" style="width:50%"></div>
                <div class="skeleton skeleton-text" style="width:70%"></div>
                <div class="skeleton skeleton-text" style="width:40%"></div>
            </div>
        `;
    },

    /**
     * Generate skeleton category card
     */
    categoryCard() {
        return `
            <div class="category-card skeleton-category">
                <div class="skeleton" style="width:100%;height:100%;position:absolute;inset:0"></div>
            </div>
        `;
    },

    /**
     * Inject skeletons into a container
     * @param {string|HTMLElement} container - Container selector or element
     * @param {string} type - Skeleton type: 'product', 'table', 'stat', 'chart', 'notification', 'order', 'category'
     * @param {number} count - Number of skeletons to show
     * @param {number} cols - For table type, number of columns
     */
    show(container, type, count = 4, cols = 5) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;

        let html = '';
        const generators = {
            product: () => this.productCard(),
            table: () => this.tableRow(cols),
            stat: () => this.statCard(),
            chart: () => this.chart(),
            notification: () => this.notification(),
            order: () => this.orderRow(),
            category: () => this.categoryCard()
        };

        const generator = generators[type];
        if (!generator) return;

        for (let i = 0; i < count; i++) {
            html += generator();
        }

        el.innerHTML = html;
        el.classList.add('skeleton-container');
    },

    /**
     * Hide skeletons by removing the skeleton container class
     * @param {string|HTMLElement} container - Container selector or element
     */
    hide(container) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;
        el.classList.remove('skeleton-container');
    },

    /**
     * Replace skeletons with actual content
     * @param {string|HTMLElement} container - Container selector or element
     * @param {string} content - HTML content to replace skeletons with
     */
    replace(container, content) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;
        el.innerHTML = content;
        el.classList.remove('skeleton-container');
        el.classList.add('skeleton-loaded');
    }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MKSkeleton;
}
