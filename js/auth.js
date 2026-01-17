/* MK Collection - User Authentication */

const MKAuth = {
    storageKey: 'mk_user',
    
    getUser() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : null;
    },

    isLoggedIn() {
        return this.getUser() !== null;
    },

    /**
     * Check if user is logged in as a WEBSITE customer (not admin)
     * Admins should only access admin panel, not customer website
     */
    isWebsiteUser() {
        const user = this.getUser();
        return user !== null && user.role !== 'admin';
    },

    async login(email, password, remember = false) {
        await new Promise(r => setTimeout(r, 500));
        if (!email || !password) throw new Error('Please enter email and password');
        
        const users = this.getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        const obfuscatedInput = this._obfuscate(password);
        if (!user || user.password !== obfuscatedInput) {
            // Check plain password fallback for legacy users if any exist
            if (user && user.password === password) {
                // Auto-fix legacy password to obfuscated
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

        localStorage.setItem(this.storageKey, JSON.stringify({
            id: user.id, 
            email: user.email, 
            firstName: user.firstName,
            lastName: user.lastName, 
            phone: user.phone, 
            role: user.role || 'user',
            addresses: user.addresses || []
        }));
        return this.getUser();
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
            role: data.role || 'user', // Allow role if provided (for setup)
            addresses: [], 
            createdAt: new Date().toISOString() 
        };
        users.push(newUser);
        localStorage.setItem('mk_users', JSON.stringify(users));
        return this.login(data.email, data.password);
    },

    logout() {
        localStorage.removeItem(this.storageKey);
        // Do not remove mk_users here!
        const prefix = window.location.pathname.includes('/admin/') ? '../' : '';
        window.location.href = prefix + 'login.html';
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

    requireAdmin() {
        const user = this.getUser();
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
