/* ========================================
   MK Collection - Wishlist
   ======================================== */

const MKWishlist = {
    storageKey: 'mk_wishlist',

    // Get all wishlist items
    getItems() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    },

    // Save wishlist to localStorage
    save(items) {
        localStorage.setItem(this.storageKey, JSON.stringify(items));
    },

    // Add item to wishlist
    addItem(product) {
        const items = this.getItems();

        if (!this.hasItem(product.id)) {
            items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images[0],
                slug: product.slug,
                addedAt: new Date().toISOString()
            });
            this.save(items);
        }

        return items;
    },

    // Remove item from wishlist
    removeItem(productId) {
        const items = this.getItems().filter(item => item.id !== productId);
        this.save(items);
        return items;
    },

    // Toggle item in wishlist
    toggleItem(product) {
        if (this.hasItem(product.id)) {
            this.removeItem(product.id);
            return false;
        } else {
            this.addItem(product);
            return true;
        }
    },

    // Check if item is in wishlist
    hasItem(productId) {
        return this.getItems().some(item => item.id === productId);
    },

    // Get wishlist count
    getCount() {
        return this.getItems().length;
    },

    // Clear wishlist
    clear() {
        localStorage.removeItem(this.storageKey);
    },

    // Move item to cart
    moveToCart(productId, options = {}) {
        const item = this.getItems().find(i => i.id === productId);
        if (item) {
            const product = MKData.getProductById(productId);
            if (product) {
                MKCart.addItem(product, options);
                this.removeItem(productId);
            }
        }
    }
};

// Update wishlist badge
function updateWishlistBadge() {
    const badges = document.querySelectorAll('.wishlist-badge');
    const count = MKWishlist.getCount();

    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Toggle wishlist button state
function toggleWishlistButton(productId) {
    const buttons = document.querySelectorAll(`[data-wishlist-toggle="${productId}"]`);
    const isInWishlist = MKWishlist.hasItem(productId);

    buttons.forEach(btn => {
        if (isInWishlist) {
            btn.classList.add('active');
            btn.querySelector('svg')?.setAttribute('fill', 'currentColor');
        } else {
            btn.classList.remove('active');
            btn.querySelector('svg')?.setAttribute('fill', 'none');
        }
    });
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MKWishlist;
}
