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

    async login(email, password) {
        await new Promise(r => setTimeout(r, 500));
        if (!email || !password) throw new Error('Please enter email and password');
        
        const users = this.getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        // Use obfuscated password check
        const obfuscatedInput = this._obfuscate(password);
        if (!user || user.password !== obfuscatedInput) throw new Error('Invalid credentials');

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

    async register(data) {
        await new Promise(r => setTimeout(r, 500));
        if (!data.email || !data.password || !data.firstName) throw new Error('Fill all fields');
        
        const users = this.getStoredUsers();
        if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) throw new Error('Email exists');

        const newUser = { 
            id: 'user-' + Date.now(), 
            ...data, 
            password: this._obfuscate(data.password), // Store obfuscated
            role: 'user',
            addresses: [], 
            createdAt: new Date().toISOString() 
        };
        users.push(newUser);
        localStorage.setItem('mk_users', JSON.stringify(users));
        return this.login(data.email, data.password);
    },

    logout() {
        localStorage.removeItem(this.storageKey);
        const prefix = window.location.pathname.includes('/admin/') ? '../' : '';
        window.location.href = prefix + 'login.html';
    },

    getStoredUsers() {
        const stored = localStorage.getItem('mk_users');
        if (!stored) {
            // Default demo users with obfuscated passwords
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
    },

    requireLogin() {
        if (!this.isLoggedIn()) {
            const prefix = window.location.pathname.includes('/admin/') ? '../' : '';
            window.location.href = prefix + 'login.html';
            return false;
        }
        return true;
    },

    requireAdmin() {
        const user = this.getUser();
        if (!user || user.role !== 'admin') {
            const prefix = window.location.pathname.includes('/admin/') ? '../' : '';
            window.location.href = prefix + 'login.html';
            return false;
        }
        return true;
    },

    _obfuscate(str) {
        // Simple base64-like obfuscation for production-level mock performance
        return btoa('mk_' + str).split('').reverse().join('');
    }
};
