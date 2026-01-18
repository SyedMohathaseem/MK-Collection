/* MK Collection - Admin JavaScript */

const MKAdmin = {
    // Get orders from shared store (real-time sync)
    get orders() {
        return typeof MKStore !== 'undefined' ? MKStore.getOrders() : [];
    },

    // Get inventory from shared store (real-time sync)
    get inventory() {
        return typeof MKStore !== 'undefined' ? MKStore.getInventory() : [];
    },

    // Get products from shared store (real-time sync)
    get products() {
        return typeof MKStore !== 'undefined' ? MKStore.getProducts() : [];
    },

    // Initialize dashboard
    init() {
        this.initSidebar();
        this.initCharts();
        this.setupSync();
        this.updateStats();
        
        // Only render table if we are on the dashboard page
        if (document.getElementById('orders-table')) {
            this.renderOrdersTable('orders-table');
        }
    },

    initSidebar() {
        this.bindEvents();
    },

    initCharts() {
        const salesCanvas = document.getElementById('salesChart');
        const ordersCanvas = document.getElementById('ordersChart');
        if (salesCanvas) initSalesChart('salesChart');
        if (ordersCanvas) {
            // Doughnut chart logic if needed, or just let Chart.js handle it
        }
    },

    toggleSidebar() {
        document.querySelector('.admin-sidebar')?.classList.toggle('open');
        document.querySelector('.admin-sidebar-overlay')?.classList.toggle('active');
        document.body.classList.toggle('sidebar-open');
    },

    setupSync() {
        // Listen for changes from website
        if (typeof MKStore !== 'undefined') {
            MKStore.onSync('orders', () => this.updateStats());
            MKStore.onSync('inventory', () => this.updateStats());
            MKStore.onSync('products', () => this.updateStats());
        }
    },

    bindEvents() {
        // Mobile sidebar toggle
        document.querySelector('.admin-mobile-toggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Overlay click to close
        document.querySelector('.admin-sidebar-overlay')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Sidebar link click (close on mobile)
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) {
                    this.toggleSidebar();
                }
            });
        });

        // Chart period buttons
        document.querySelectorAll('.chart-period-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateChart(btn.dataset.period);
            });
        });
    },

    updateStats() {
        // Calculate stats from orders
        const todayOrders = this.orders.filter(o => o.date === '2026-01-17').length;
        const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
        const totalRevenue = this.orders.reduce((sum, o) => sum + o.total, 0);
        const lowStockItems = this.inventory.filter(i => i.status === 'low-stock' || i.status === 'out-of-stock').length;

        // Update DOM if elements exist
        const statElements = {
            'stat-orders': todayOrders,
            'stat-revenue': `$${totalRevenue.toLocaleString()}`,
            'stat-pending': pendingOrders,
            'stat-low-stock': lowStockItems
        };

        Object.entries(statElements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    },

    updateChart(period) {
        console.log('Updating chart for period:', period);
        // Chart update logic would go here
    },

    renderOrdersTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.orders.map(order => `
                        <tr>
                            <td><strong>${order.id}</strong></td>
                            <td>
                                <div>${order.customer}</div>
                                <small style="color:var(--color-gray-500)">${order.email}</small>
                            </td>
                            <td>${order.items}</td>
                            <td><strong>$${order.total.toFixed(2)}</strong></td>
                            <td><span class="status-badge ${order.status}">${order.status}</span></td>
                            <td>${order.date}</td>
                            <td>
                                <button class="btn btn-ghost btn-sm" onclick="MKAdmin.viewOrder('${order.id}')">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    renderInventoryTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.inventory.map(item => `
                        <tr>
                            <td><strong>${item.name}</strong></td>
                            <td><code style="font-size:var(--text-sm)">${item.sku}</code></td>
                            <td>${item.stock}</td>
                            <td><span class="status-badge ${item.status}">${item.status.replace('-', ' ')}</span></td>
                            <td>${item.lastUpdated}</td>
                            <td>
                                <button class="btn btn-ghost btn-sm" onclick="MKAdmin.editStock('${item.id}')">Edit</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    viewOrder(orderId) {
        alert(`Viewing order ${orderId}`);
    },

    editStock(productId) {
        const newStock = prompt('Enter new stock quantity:');
        if (newStock !== null && typeof MKStore !== 'undefined') {
            const inventory = MKStore.getInventory();
            const item = inventory.find(i => i.id === productId);
            if (item) {
                item.stock = parseInt(newStock);
                item.status = item.stock === 0 ? 'out-of-stock' : item.stock < 10 ? 'low-stock' : 'in-stock';
                item.lastUpdated = new Date().toISOString().split('T')[0];
                MKStore.saveInventory(inventory);
                this.renderInventoryTable('inventory-table');
                this.showToast('Stock updated successfully', 'success');
            }
        }
    },

    showToast(message, type = 'default') {
        const container = document.querySelector('.toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    },

    // AI Insights
    getAIInsights() {
        return [
            { type: 'trend', title: 'Sales Trending Up', message: 'Sales increased by 23% compared to last week. Dresses are the top-selling category.' },
            { type: 'alert', title: 'Stock Alert', message: '3 products are running low on stock. Consider reordering soon.' },
            { type: 'suggestion', title: 'Best Seller', message: 'Size M in Blush Pink is the most popular combination. Consider increasing inventory.' }
        ];
    }
};

// Chart.js initialization (if available)
function initSalesChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Sales',
                data: [1200, 1900, 1500, 2100, 1800, 2400, 2200],
                borderColor: '#F5B8C9',
                backgroundColor: 'rgba(245, 184, 201, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f0f0f0' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => MKAdmin.init());
