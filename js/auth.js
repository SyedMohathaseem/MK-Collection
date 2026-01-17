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
        if (!user || user.password !== password) throw new Error('Invalid credentials');

        localStorage.setItem(this.storageKey, JSON.stringify({
            id: user.id, email: user.email, firstName: user.firstName,
            lastName: user.lastName, phone: user.phone, addresses: user.addresses || []
        }));
        return this.getUser();
    },

    async register(data) {
        await new Promise(r => setTimeout(r, 500));
        if (!data.email || !data.password || !data.firstName) throw new Error('Fill all fields');
        
        const users = this.getStoredUsers();
        if (users.some(u => u.email === data.email)) throw new Error('Email exists');

        const newUser = { id: 'user-' + Date.now(), ...data, addresses: [], createdAt: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('mk_users', JSON.stringify(users));
        return this.login(data.email, data.password);
    },

    logout() {
        localStorage.removeItem(this.storageKey);
        window.location.href = 'login.html';
    },

    getStoredUsers() {
        const stored = localStorage.getItem('mk_users');
        if (!stored) {
            const demo = [{ id: 'user-001', email: 'demo@mk.com', password: 'demo123', firstName: 'Sarah', lastName: 'Johnson', phone: '+1 555-1234', addresses: [] }];
            localStorage.setItem('mk_users', JSON.stringify(demo));
            return demo;
        }
        return JSON.parse(stored);
    },

    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};
