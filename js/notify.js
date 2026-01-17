/* ========================================
   MK Collection - Notification System
   Push notifications, popups, and sound
   ======================================== */

const MKNotify = {
    // Storage keys
    KEYS: {
        CUSTOMER: 'mk_customer_notifications',
        ADMIN: 'mk_admin_notifications',
        LAST_CHECK: 'mk_last_notification_check',
        STATUS_CACHE: 'mk_order_status_cache'
    },
    
    orderStatusCache: {},

    // Sound effect (using Web Audio API for cross-browser support)
    audioContext: null,

    // Initialize notification system
    init(isAdmin = false) {
        this.isAdmin = isAdmin;
        this.loadStatusCache();
        this.requestPermission();
        this.initAudio();
        this.startWatching();
        this.createPopupContainer();
        this.updateBadge();
    },

    loadStatusCache() {
        const stored = localStorage.getItem(this.KEYS.STATUS_CACHE);
        if (stored) {
            this.orderStatusCache = JSON.parse(stored);
        }
    },

    saveStatusCache() {
        localStorage.setItem(this.KEYS.STATUS_CACHE, JSON.stringify(this.orderStatusCache));
    },

    // Request browser notification permission
    requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    // Initialize audio context for sound
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    },

    // Play notification sound
    playSound(type = 'notification') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Different sounds for different notification types
        if (type === 'order') {
            // Two-tone chime for new orders
            oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1100, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(1320, this.audioContext.currentTime + 0.2);
        } else if (type === 'alert') {
            // Higher pitch for alerts
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.15);
        } else {
            // Standard notification sound
            oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1);
        }

        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    },

    // Create popup container
    createPopupContainer() {
        if (document.getElementById('mk-notification-popup-container')) return;

        const container = document.createElement('div');
        container.id = 'mk-notification-popup-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 380px;
            width: 100%;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    },

    // Show popup notification
    showPopup(notification) {
        const container = document.getElementById('mk-notification-popup-container');
        if (!container) return;

        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            padding: 16px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            transform: translateX(120%);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: auto;
            border-left: 4px solid ${this.getTypeColor(notification.type)};
        `;

        popup.innerHTML = `
            <div style="
                width: 40px;
                height: 40px;
                background: ${this.getTypeBgColor(notification.type)};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            ">
                ${this.getTypeIcon(notification.type)}
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${notification.title}</div>
                <div style="font-size: 14px; color: #6b7280; line-height: 1.4;">${notification.message}</div>
                <div style="font-size: 12px; color: #9ca3af; margin-top: 6px;">Just now</div>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                cursor: pointer;
                color: #9ca3af;
                padding: 4px;
                flex-shrink: 0;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        `;

        container.appendChild(popup);

        // Animate in
        requestAnimationFrame(() => {
            popup.style.transform = 'translateX(0)';
        });

        // Auto-remove after 6 seconds
        setTimeout(() => {
            popup.style.transform = 'translateX(120%)';
            setTimeout(() => popup.remove(), 400);
        }, 6000);
    },

    // Show browser push notification
    showPushNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const options = {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: notification.id || Date.now(),
                requireInteraction: false,
                silent: true // We play our own sound
            };

            const pushNotif = new Notification(notification.title, options);

            // Handle click
            pushNotif.onclick = () => {
                window.focus();
                if (this.isAdmin) {
                    window.location.href = '/admin/notifications.html';
                } else {
                    window.location.href = '/notifications.html';
                }
            };
        }
    },

    // Send notification (plays sound, shows popup, shows push notification)
    send(notification, options = {}) {
        const defaults = {
            playSound: true,
            showPopup: true,
            showPush: true,
            save: true
        };
        const settings = { ...defaults, ...options };

        // Generate ID if not present
        if (!notification.id) {
            notification.id = Date.now();
        }
        if (!notification.time) {
            notification.time = new Date().toISOString();
        }
        if (!notification.read) {
            notification.read = false;
        }

        // Play sound
        if (settings.playSound) {
            this.playSound(notification.type);
        }

        // Show popup
        if (settings.showPopup) {
            this.showPopup(notification);
        }

        // Show push notification
        if (settings.showPush) {
            this.showPushNotification(notification);
        }

        // Save to storage
        if (settings.save) {
            this.saveNotification(notification);
        }
    },

    // Save notification to localStorage
    saveNotification(notification) {
        const key = this.isAdmin ? this.KEYS.ADMIN : this.KEYS.CUSTOMER;
        const notifications = this.getNotifications();
        notifications.unshift(notification);
        // Keep only last 50 notifications
        if (notifications.length > 50) {
            notifications.length = 50;
        }
        localStorage.setItem(key, JSON.stringify(notifications));
        this.updateBadge();
    },

    updateBadge() {
        const notifications = this.getNotifications();
        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },

    // Get notifications from storage
    getNotifications() {
        const key = this.isAdmin ? this.KEYS.ADMIN : this.KEYS.CUSTOMER;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    },

    // Watch for new orders (for admin) or order status changes (for customer)
    startWatching() {
        // Cross-tab sync
        window.addEventListener('storage', (e) => {
            if (e.key === 'mk_orders') {
                const newOrders = JSON.parse(e.newValue || '[]');
                const oldOrders = JSON.parse(e.oldValue || '[]');

                if (this.isAdmin) {
                    // New order placed - notify admin
                    if (newOrders.length > oldOrders.length) {
                        const latestOrder = newOrders[0];
                        this.send({
                            type: 'order',
                            title: '🛍️ New Order Received!',
                            message: `Order #${latestOrder.id} from ${latestOrder.customer} - $${latestOrder.total?.toFixed(2) || '0.00'}`
                        });
                    }
                } else if (typeof MKAuth !== 'undefined' && MKAuth.isLoggedIn()) {
                    // Order status updated - notify customer
                    const user = MKAuth.getUser();
                    const userOrders = newOrders.filter(o => o.email.toLowerCase() === user.email.toLowerCase());
                    
                    userOrders.forEach(order => {
                        const lastStatus = this.orderStatusCache[order.id];
                        if (lastStatus && lastStatus !== order.status) {
                            this.send({
                                type: 'order',
                                title: '📦 Order Status Updated',
                                message: `Your order #${order.id} is now ${order.status.toUpperCase()}.`
                            });
                        }
                        // Update cache
                        this.orderStatusCache[order.id] = order.status;
                    });
                    this.saveStatusCache();
                }
            }
        });

        // Initial cache population for customers to prevent notifications on first load
        if (!this.isAdmin && typeof MKAuth !== 'undefined' && MKAuth.isLoggedIn()) {
            const user = MKAuth.getUser();
            const orders = JSON.parse(localStorage.getItem('mk_orders') || '[]');
            orders.filter(o => o.email.toLowerCase() === user.email.toLowerCase()).forEach(order => {
                if (!this.orderStatusCache[order.id]) {
                    this.orderStatusCache[order.id] = order.status;
                }
            });
            this.saveStatusCache();
        }

        // Check for updates periodically
        if (this.isAdmin) {
            this.checkInventoryAlerts();
        }
    },

    // Check for low stock items
    checkInventoryAlerts() {
        if (typeof MKStore === 'undefined') return;

        const inventory = MKStore.getInventory();
        const lowStock = inventory.filter(i => i.status === 'low-stock');
        const outOfStock = inventory.filter(i => i.status === 'out-of-stock');

        const lastCheck = localStorage.getItem(this.KEYS.LAST_CHECK);
        const now = new Date().toISOString();

        // Only alert once per session
        if (!lastCheck) {
            if (outOfStock.length > 0) {
                this.send({
                    type: 'alert',
                    title: '⚠️ Out of Stock Alert',
                    message: `${outOfStock.length} item(s) are out of stock and need restocking.`
                }, { showPush: false });
            }

            if (lowStock.length > 0) {
                setTimeout(() => {
                    this.send({
                        type: 'inventory',
                        title: '📦 Low Stock Warning',
                        message: `${lowStock.length} item(s) are running low on stock.`
                    }, { showPush: false });
                }, 2000);
            }

            localStorage.setItem(this.KEYS.LAST_CHECK, now);
        }
    },

    // Helper: Get type color
    getTypeColor(type) {
        const colors = {
            order: '#ec4899',
            orders: '#ec4899',
            alert: '#f59e0b',
            inventory: '#f59e0b',
            promo: '#10b981',
            system: '#6366f1',
            success: '#10b981'
        };
        return colors[type] || '#6366f1';
    },

    // Helper: Get type background color
    getTypeBgColor(type) {
        const colors = {
            order: '#fce7f3',
            orders: '#fce7f3',
            alert: '#fef3c7',
            inventory: '#fef3c7',
            promo: '#d1fae5',
            system: '#e0e7ff',
            success: '#d1fae5'
        };
        return colors[type] || '#e0e7ff';
    },

    // Helper: Get type icon
    getTypeIcon(type) {
        const icons = {
            order: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
            orders: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
            alert: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
            inventory: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
            promo: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>',
            system: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
        };
        return icons[type] || icons.system;
    },

    // Test notification (for debugging)
    test(type = 'order') {
        const testNotifications = {
            order: { type: 'order', title: '🛍️ New Order Received!', message: 'Order #MK-2026-TEST from Test Customer - $299.00' },
            alert: { type: 'alert', title: '⚠️ Low Stock Alert', message: 'Classic White Linen Blouse is running low (5 units left)' },
            promo: { type: 'promo', title: '🎉 Flash Sale!', message: 'Use code FLASH30 for 30% off all dresses. Limited time!' },
            system: { type: 'system', title: '🔔 System Update', message: 'Your store settings have been updated successfully.' }
        };

        this.send(testNotifications[type] || testNotifications.order);
    }
};

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Detect if we're on admin page
    const isAdmin = window.location.pathname.includes('/admin');
    MKNotify.init(isAdmin);
});
