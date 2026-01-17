/* ========================================
   MK Collection - Shared Data Store
   Real-time sync between website and admin
   ======================================== */

const MKStore = {
    // Storage keys
    KEYS: {
        PRODUCTS: 'mk_products',
        ORDERS: 'mk_orders',
        INVENTORY: 'mk_inventory',
        CUSTOMERS: 'mk_customers'
    },

    // Initialize store with default data
    init() {
        // Initialize products if not exists
        if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
            this.saveProducts(MKData.products);
        }
        // Initialize orders if not exists
        if (!localStorage.getItem(this.KEYS.ORDERS)) {
            this.saveOrders(this.getDefaultOrders());
        }
        // Initialize inventory if not exists
        if (!localStorage.getItem(this.KEYS.INVENTORY)) {
            this.saveInventory(this.getDefaultInventory());
        }
    },

    // ========== PRODUCTS ==========
    getProducts() {
        const stored = localStorage.getItem(this.KEYS.PRODUCTS);
        return stored ? JSON.parse(stored) : MKData.products;
    },

    saveProducts(products) {
        localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
        this.triggerSync('products');
    },

    addProduct(product) {
        const products = this.getProducts();
        product.id = 'prod-' + Date.now();
        product.createdAt = new Date().toISOString();
        products.push(product);
        this.saveProducts(products);
        return product;
    },

    updateProduct(productId, updates) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === productId);
        if (index !== -1) {
            products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveProducts(products);
            return products[index];
        }
        return null;
    },

    deleteProduct(productId) {
        const products = this.getProducts().filter(p => p.id !== productId);
        this.saveProducts(products);
    },

    getProductById(productId) {
        return this.getProducts().find(p => p.id === productId);
    },

    // ========== ORDERS ==========
    getOrders() {
        const stored = localStorage.getItem(this.KEYS.ORDERS);
        return stored ? JSON.parse(stored) : [];
    },

    saveOrders(orders) {
        localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));
        this.triggerSync('orders');
    },

    addOrder(orderData) {
        const orders = this.getOrders();
        const order = {
            id: 'MK-' + new Date().getFullYear() + '-' + String(orders.length + 1).padStart(3, '0'),
            ...orderData,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        orders.unshift(order);
        this.saveOrders(orders);
        
        // Decrease inventory
        if (orderData.items) {
            orderData.items.forEach(item => {
                this.decreaseStock(item.productId, item.quantity);
            });
        }
        
        return order;
    },

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
            this.saveOrders(orders);
            return order;
        }
        return null;
    },

    getOrderById(orderId) {
        return this.getOrders().find(o => o.id === orderId);
    },

    // ========== INVENTORY ==========
    getInventory() {
        const stored = localStorage.getItem(this.KEYS.INVENTORY);
        return stored ? JSON.parse(stored) : [];
    },

    saveInventory(inventory) {
        localStorage.setItem(this.KEYS.INVENTORY, JSON.stringify(inventory));
        this.triggerSync('inventory');
    },

    updateStock(productId, sizeStocks) {
        const inventory = this.getInventory();
        const item = inventory.find(i => i.id === productId);
        if (item) {
            item.stock = Object.values(sizeStocks).reduce((sum, s) => sum + parseInt(s), 0);
            item.sizeStocks = sizeStocks;
            item.status = item.stock === 0 ? 'out-of-stock' : item.stock < 10 ? 'low-stock' : 'in-stock';
            item.lastUpdated = new Date().toISOString().split('T')[0];
            this.saveInventory(inventory);
            
            // Also update product stock
            this.updateProduct(productId, { stock: sizeStocks });
            
            return item;
        }
        return null;
    },

    decreaseStock(productId, quantity = 1) {
        const inventory = this.getInventory();
        const item = inventory.find(i => i.id === productId);
        if (item && item.stock >= quantity) {
            item.stock -= quantity;
            item.status = item.stock === 0 ? 'out-of-stock' : item.stock < 10 ? 'low-stock' : 'in-stock';
            item.lastUpdated = new Date().toISOString().split('T')[0];
            this.saveInventory(inventory);
            return item;
        }
        return null;
    },

    getInventoryItem(productId) {
        return this.getInventory().find(i => i.id === productId);
    },

    // ========== SYNC FUNCTIONALITY ==========
    listeners: {},

    onSync(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    triggerSync(event) {
        // Dispatch custom event for cross-tab sync
        window.dispatchEvent(new CustomEvent('mk-store-sync', { detail: { event } }));
        
        // Call registered listeners
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb());
        }
    },

    // Listen for changes from other tabs
    initCrossTabSync() {
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('mk_')) {
                const event = e.key.replace('mk_', '');
                this.triggerSync(event);
            }
        });
    },

    // ========== DEFAULT DATA ==========
    getDefaultOrders() {
        return [
            { id: 'MK-2026-001', customer: 'Emily Chen', email: 'emily@example.com', phone: '+1 555-0101', items: 3, itemDetails: [{ productId: 'prod-001', name: 'Elegant Blush Midi Dress', size: 'M', color: 'Blush Pink', quantity: 1, price: 189 }], total: 347.00, status: 'pending', date: '2026-01-17', address: '123 Fashion Ave, NYC' },
            { id: 'MK-2026-002', customer: 'Sarah Miller', email: 'sarah@example.com', phone: '+1 555-0102', items: 1, itemDetails: [{ productId: 'prod-002', name: 'Classic White Linen Blouse', size: 'S', color: 'White', quantity: 1, price: 79 }], total: 189.00, status: 'processing', date: '2026-01-17', address: '456 Style St, LA' },
            { id: 'MK-2026-003', customer: 'Jessica Brown', email: 'jess@example.com', phone: '+1 555-0103', items: 2, itemDetails: [{ productId: 'prod-003', name: 'High-Waist Tailored Trousers', size: 'L', color: 'Navy', quantity: 2, price: 129 }], total: 258.00, status: 'shipped', date: '2026-01-16', address: '789 Chic Blvd, Miami' },
            { id: 'MK-2026-004', customer: 'Amanda Wilson', email: 'amanda@example.com', phone: '+1 555-0104', items: 4, itemDetails: [{ productId: 'prod-004', name: 'Summer Floral Maxi Dress', size: 'M', color: 'Floral', quantity: 1, price: 149 }], total: 512.00, status: 'delivered', date: '2026-01-15', address: '321 Trendy Lane, Chicago' },
            { id: 'MK-2026-005', customer: 'Rachel Green', email: 'rachel@example.com', phone: '+1 555-0105', items: 1, itemDetails: [{ productId: 'prod-002', name: 'Classic White Linen Blouse', size: 'M', color: 'White', quantity: 1, price: 79 }], total: 79.00, status: 'processing', date: '2026-01-15', address: '654 Mode Way, Seattle' }
        ];
    },

    getDefaultInventory() {
        return [
            { id: 'prod-001', name: 'Elegant Blush Midi Dress', sku: 'MK-DRS-001', stock: 43, sizeStocks: { XS: 5, S: 12, M: 8, L: 15, XL: 3 }, status: 'in-stock', lastUpdated: '2026-01-17' },
            { id: 'prod-002', name: 'Classic White Linen Blouse', sku: 'MK-TOP-001', stock: 8, sizeStocks: { XS: 1, S: 2, M: 2, L: 2, XL: 1 }, status: 'low-stock', lastUpdated: '2026-01-16' },
            { id: 'prod-003', name: 'High-Waist Tailored Trousers', sku: 'MK-BTM-001', stock: 61, sizeStocks: { XS: 10, S: 15, M: 18, L: 12, XL: 6 }, status: 'in-stock', lastUpdated: '2026-01-17' },
            { id: 'prod-004', name: 'Summer Floral Maxi Dress', sku: 'MK-DRS-002', stock: 0, sizeStocks: { XS: 0, S: 0, M: 0, L: 0, XL: 0 }, status: 'out-of-stock', lastUpdated: '2026-01-14' },
            { id: 'prod-005', name: 'Athleisure Yoga Set', sku: 'MK-ACT-001', stock: 80, sizeStocks: { XS: 15, S: 20, M: 25, L: 15, XL: 5 }, status: 'in-stock', lastUpdated: '2026-01-17' }
        ];
    },

    // ========== STATS ==========
    getStats() {
        const orders = this.getOrders();
        const inventory = this.getInventory();
        const today = new Date().toISOString().split('T')[0];

        return {
            totalOrders: orders.length,
            todayOrders: orders.filter(o => o.date === today).length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            processingOrders: orders.filter(o => o.status === 'processing').length,
            shippedOrders: orders.filter(o => o.status === 'shipped').length,
            deliveredOrders: orders.filter(o => o.status === 'delivered').length,
            totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
            todayRevenue: orders.filter(o => o.date === today).reduce((sum, o) => sum + o.total, 0),
            totalProducts: inventory.length,
            inStock: inventory.filter(i => i.status === 'in-stock').length,
            lowStock: inventory.filter(i => i.status === 'low-stock').length,
            outOfStock: inventory.filter(i => i.status === 'out-of-stock').length
        };
    },

    // ========== RESET ==========
    resetAllData() {
        localStorage.removeItem(this.KEYS.PRODUCTS);
        localStorage.removeItem(this.KEYS.ORDERS);
        localStorage.removeItem(this.KEYS.INVENTORY);
        this.init();
    }
};

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    MKStore.init();
    MKStore.initCrossTabSync();
});
