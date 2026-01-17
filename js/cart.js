/* ========================================
   MK Collection - Shopping Cart
   ======================================== */

const MKCart = {
    storageKey: 'mk_cart',

    // Get all cart items
    getItems() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    },

    // Save cart to localStorage
    save(items) {
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    },

    // Add item to cart
    addItem(product, options = {}) {
        const items = this.getItems();
        const itemId = this.generateItemId(product.id, options);

        const existingIndex = items.findIndex(item => item.id === itemId);

        if (existingIndex > -1) {
            items[existingIndex].quantity += options.quantity || 1;
        } else {
            items.push({
                id: itemId,
                productId: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images[0],
                color: options.color || null,
                size: options.size || null,
                quantity: options.quantity || 1
            });
        }

        this.save(items);
        return items;
    },

    // Generate unique item ID based on product + variants
    generateItemId(productId, options) {
        const parts = [productId];
        if (options.color) parts.push(options.color);
        if (options.size) parts.push(options.size);
        return parts.join('-');
    },

    // Remove item from cart
    removeItem(itemId) {
        const items = this.getItems().filter(item => item.id !== itemId);
        this.save(items);
        return items;
    },

    // Update item quantity
    updateQuantity(itemId, quantity) {
        const items = this.getItems();
        const item = items.find(i => i.id === itemId);

        if (item) {
            item.quantity = Math.max(1, quantity);
            this.save(items);
        }

        return items;
    },

    // Get cart subtotal
    getSubtotal() {
        return this.getItems().reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },

    // Get total item count
    getItemCount() {
        return this.getItems().reduce((count, item) => count + item.quantity, 0);
    },

    // Get total savings
    getSavings() {
        return this.getItems().reduce((savings, item) => {
            if (item.originalPrice && item.originalPrice > item.price) {
                return savings + ((item.originalPrice - item.price) * item.quantity);
            }
            return savings;
        }, 0);
    },

    // Clear cart
    clear() {
        localStorage.removeItem(this.storageKey);
    },

    // Check if item is in cart
    hasItem(productId, options = {}) {
        const itemId = this.generateItemId(productId, options);
        return this.getItems().some(item => item.id === itemId);
    },

    // Calculate shipping
    getShipping() {
        const subtotal = this.getSubtotal();
        if (subtotal >= 150) return 0; // Free shipping over $150
        if (subtotal >= 75) return 5.99; // Reduced shipping
        return 9.99; // Standard shipping
    },

    // Get estimated tax (example: 8%)
    getTax() {
        return this.getSubtotal() * 0.08;
    },

    // Get order total
    getTotal() {
        return this.getSubtotal() + this.getShipping() + this.getTax();
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MKCart;
}
