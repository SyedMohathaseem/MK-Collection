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
        try {
            // Initialize products if not exists
            if (!this.safeGet(this.KEYS.PRODUCTS)) {
                this.saveProducts(MKData.products);
            }
            // Initialize orders if not exists
            if (!this.safeGet(this.KEYS.ORDERS)) {
                this.saveOrders(this.getDefaultOrders());
            }
            // Initialize inventory if not exists
            if (!this.safeGet(this.KEYS.INVENTORY)) {
                this.saveInventory(this.getDefaultInventory());
            }
        } catch (e) {
            console.error('MKStore Init Error:', e);
        }
    },

    // ========== SAFE STORAGE ==========
    safeGet(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Error reading ${key} from storage:`, e);
            return null;
        }
    },

    safeSet(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error(`Error saving ${key} to storage:`, e);
            return false;
        }
    },

    // ========== PRODUCTS ==========
    getProducts() {
        return this.safeGet(this.KEYS.PRODUCTS) || MKData.products;
    },

    saveProducts(products) {
        if (this.safeSet(this.KEYS.PRODUCTS, products)) {
            this.triggerSync('products');
        }
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
        return this.safeGet(this.KEYS.ORDERS) || [];
    },

    saveOrders(orders) {
        if (this.safeSet(this.KEYS.ORDERS, orders)) {
            this.triggerSync('orders');
        }
    },

    // Verify stock availability for all items in an order
    checkStockAvailability(items) {
        const inventory = this.getInventory();
        for (const item of items) {
            const invItem = inventory.find(i => i.id === item.productId);
            if (!invItem) return { available: false, error: `Product ${item.name} not found` };
            
            // Check specific size stock if available
            if (item.size && invItem.sizeStocks) {
                const sizeStock = invItem.sizeStocks[item.size] || 0;
                if (sizeStock < item.quantity) {
                    return { available: false, error: `Insufficient stock for ${item.name} (Size: ${item.size})` };
                }
            } else if (invItem.stock < item.quantity) {
                return { available: false, error: `Insufficient stock for ${item.name}` };
            }
        }
        return { available: true };
    },

    addOrder(orderData) {
        const orders = this.getOrders();
        
        // Final stock check before commitment
        const stockCheck = this.checkStockAvailability(orderData.itemDetails || []);
        if (!stockCheck.available) throw new Error(stockCheck.error);

        const order = {
            id: 'MK-' + new Date().getFullYear() + '-' + String(orders.length + 1).padStart(3, '0'),
            ...orderData,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        orders.unshift(order);
        this.saveOrders(orders);
        
        // Decrease inventory with size tracking
        if (orderData.itemDetails) {
            orderData.itemDetails.forEach(item => {
                this.decreaseStock(item.productId, item.quantity, item.size);
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
        return this.safeGet(this.KEYS.INVENTORY) || [];
    },

    saveInventory(inventory) {
        if (this.safeSet(this.KEYS.INVENTORY, inventory)) {
            this.triggerSync('inventory');
        }
    },

    restoreStock(orderId) {
        const order = this.getOrderById(orderId);
        if (!order || order.status === 'cancelled') return false;
        
        if (order.itemDetails) {
            order.itemDetails.forEach(item => {
                this.increaseStock(item.productId, item.quantity, item.size);
            });
        }
        return true;
    },

    increaseStock(productId, quantity, size = null) {
        const inventory = this.getInventory();
        const item = inventory.find(i => i.id === productId);
        if (item) {
            item.stock += quantity;
            if (size && item.sizeStocks) {
                item.sizeStocks[size] = (item.sizeStocks[size] || 0) + quantity;
            }
            item.status = item.stock < 10 ? 'low-stock' : 'in-stock';
            item.lastUpdated = new Date().toISOString().split('T')[0];
            this.saveInventory(inventory);
            this.updateProduct(productId, { stock: item.sizeStocks });
            return item;
        }
        return null;
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

    decreaseStock(productId, quantity = 1, size = null) {
        const inventory = this.getInventory();
        const item = inventory.find(i => i.id === productId);
        if (item && item.stock >= quantity) {
            item.stock -= quantity;
            if (size && item.sizeStocks) {
                item.sizeStocks[size] = Math.max(0, (item.sizeStocks[size] || 0) - quantity);
            }
            item.status = item.stock === 0 ? 'out-of-stock' : item.stock < 10 ? 'low-stock' : 'in-stock';
            item.lastUpdated = new Date().toISOString().split('T')[0];
            this.saveInventory(inventory);
            
            // Sync back to main product data
            this.updateProduct(productId, { stock: item.sizeStocks });
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
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Month stats
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return {
            totalOrders: orders.length,
            todayOrders: orders.filter(o => o.date === today).length,
            monthOrders: orders.filter(o => new Date(o.createdAt) >= startOfMonth).length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            processingOrders: orders.filter(o => o.status === 'processing').length,
            shippedOrders: orders.filter(o => o.status === 'shipped').length,
            deliveredOrders: orders.filter(o => o.status === 'delivered').length,
            totalRevenue: orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0),
            todayRevenue: orders.filter(o => o.date === today && o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
            monthRevenue: orders.filter(o => new Date(o.createdAt) >= startOfMonth && o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
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
