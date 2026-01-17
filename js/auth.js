/* MK Collection - User Authentication */
/* SEPARATE SESSIONS: Admin and Customer use different storage keys */

const MKAuth = {
    // Separate storage keys for admin and customer
    customerStorageKey: 'mk_customer_session',
    adminStorageKey: 'mk_admin_session',
    
    /**
     * Get the appropriate storage key based on context
     */
    _getStorageKey() {
        // Admin pages use admin session, website uses customer session
        const isAdminPage = window.location.pathname.includes('/admin/');
        return isAdminPage ? this.adminStorageKey : this.customerStorageKey;
    },

    /**
     * Get current user from appropriate session
     */
    getUser() {
        const key = this._getStorageKey();
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
    },

    /**
     * Get admin user (for admin panel only)
     */
    getAdminUser() {
        const stored = localStorage.getItem(this.adminStorageKey);
        return stored ? JSON.parse(stored) : null;
    },

    /**
     * Get customer user (for website only)
     */
    getCustomerUser() {
        const stored = localStorage.getItem(this.customerStorageKey);
        return stored ? JSON.parse(stored) : null;
    },

    isLoggedIn() {
        return this.getUser() !== null;
    },

    /**
     * Check if user is logged in as a WEBSITE customer (not admin)
     */
    isWebsiteUser() {
        const user = this.getCustomerUser();
        return user !== null && user.role !== 'admin';
    },

    /**
     * Check if admin is logged in (for admin panel)
     */
    isAdminLoggedIn() {
        const user = this.getAdminUser();
        return user !== null && user.role === 'admin';
    },

    async login(email, password, remember = false) {
        await new Promise(r => setTimeout(r, 500));
        if (!email || !password) throw new Error('Please enter email and password');
        
        const users = this.getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        const obfuscatedInput = this._obfuscate(password);
        if (!user || user.password !== obfuscatedInput) {
            // Check plain password fallback for legacy users
            if (user && user.password === password) {
                user.password = obfuscatedInput;
                localStorage.setItem('mk_users', JSON.stringify(users));
            } else {
                throw new Error('Invalid credentials');
            }
        }

        if (remember) {
            localStorage.setItem('mk_remembered_email', email);
        } else {
            localStorage.removeItem('mk_remembered_email');
        }

        const sessionData = {
            id: user.id, 
            email: user.email, 
            firstName: user.firstName,
            lastName: user.lastName, 
            phone: user.phone, 
            role: user.role || 'user',
            addresses: user.addresses || []
        };

        // IMPORTANT: Save to the CORRECT session based on role
        if (user.role === 'admin') {
            // Admin login - save to admin session ONLY
            localStorage.setItem(this.adminStorageKey, JSON.stringify(sessionData));
            // Do NOT touch customer session
        } else {
            // Customer login - save to customer session ONLY
            localStorage.setItem(this.customerStorageKey, JSON.stringify(sessionData));
            // Do NOT touch admin session
        }
        
        return sessionData;
    },

    getRememberedEmail() {
        return localStorage.getItem('mk_remembered_email') || '';
    },

    async register(data) {
        await new Promise(r => setTimeout(r, 500));
        if (!data.email || !data.password || !data.firstName) throw new Error('Fill all fields');
        
        const users = this.getStoredUsers();
        if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) throw new Error('Email exists');

        const newUser = { 
            id: 'user-' + Date.now(), 
            ...data, 
            password: this._obfuscate(data.password),
            role: 'user', // New registrations are always customers
            addresses: [], 
            createdAt: new Date().toISOString() 
        };
        users.push(newUser);
        localStorage.setItem('mk_users', JSON.stringify(users));
        return this.login(data.email, data.password);
    },

    logout() {
        const isAdminPage = window.location.pathname.includes('/admin/');
        
        // Only remove the session for the current context
        if (isAdminPage) {
            localStorage.removeItem(this.adminStorageKey);
        } else {
            localStorage.removeItem(this.customerStorageKey);
        }
        
        const prefix = isAdminPage ? '../' : '';
        window.location.href = prefix + 'login.html';
    },

    /**
     * Logout admin specifically (used when switching)
     */
    logoutAdmin() {
        localStorage.removeItem(this.adminStorageKey);
    },

    /**
     * Logout customer specifically (used when switching)
     */
    logoutCustomer() {
        localStorage.removeItem(this.customerStorageKey);
    },

    getStoredUsers() {
        try {
            const stored = localStorage.getItem('mk_users');
            if (!stored || stored === '[]') {
                const demo = [
                    { 
                        id: 'user-001', 
                        email: 'demo@mk.com', 
                        password: this._obfuscate('demo123'), 
                        role: 'admin', 
                        firstName: 'Admin', 
                        lastName: 'User', 
                        phone: '+1 555-1234', 
                        addresses: [] 
                    },
                    { 
                        id: 'user-002', 
                        email: 'user@mk.com', 
                        password: this._obfuscate('user123'), 
                        role: 'user', 
                        firstName: 'Sarah', 
                        lastName: 'Johnson', 
                        phone: '+1 555-5678', 
                        addresses: [] 
                    }
                ];
                localStorage.setItem('mk_users', JSON.stringify(demo));
                return demo;
            }
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse users', e);
            return [];
        }
    },

    requireLogin() {
        if (!this.isLoggedIn()) {
            const currentPath = window.location.pathname;
            const prefix = currentPath.includes('/admin/') ? '../' : '';
            window.location.href = prefix + 'login.html?return=' + encodeURIComponent(currentPath);
            return false;
        }
        return true;
    },

    /**
     * Require admin login - checks admin session specifically
     */
    requireAdmin() {
        const user = this.getAdminUser();
        if (!user || user.role !== 'admin') {
            const currentPath = window.location.pathname;
            const prefix = currentPath.includes('/admin/') ? '../' : '';
            window.location.href = prefix + 'login.html?return=' + encodeURIComponent(currentPath);
            return false;
        }
        return true;
    },

    _obfuscate(str) {
        if (!str) return '';
        return btoa('mk_' + str).split('').reverse().join('');
    }
};
