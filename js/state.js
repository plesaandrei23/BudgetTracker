export const defaultAccounts = [
    { id: 'cash', name: 'Cash', type: 'cash', icon: 'fa-wallet', color: 'text-emerald-400' },
    { id: 'bt_personal', name: 'BT Personal', type: 'bank', icon: 'fa-building-columns', color: 'text-yellow-400' },
    { id: 'revolut_personal', name: 'Revolut', type: 'bank', icon: 'fa-globe', color: 'text-blue-400' },
    { id: 'business_pfa', name: 'Business (PFA)', type: 'business', icon: 'fa-briefcase', color: 'text-purple-400' },
    { id: 'business_cash', name: 'Business Cash', type: 'business', icon: 'fa-sack-dollar', color: 'text-green-500' }
];

export const defaultConfig = {
    accounts: defaultAccounts,
    expenseCats: ['Food', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Travel'],
    incomeCats: ['Salary', 'Freelance', 'Business', 'Gift', 'Other']
};

export const state = {
    currentUser: null,
    currentView: 'home',
    userConfig: defaultConfig,
    transactionsCache: [],

    // UI State
    selectedAccount: 'all',
    inputMode: 'Expense',
    editingId: null, // ID of transaction being edited

    // Analytics State
    analyticsState: {
        mode: 'week', // 'week', 'month', 'year', 'all'
        date: new Date() // Reference date for navigation
    },

    listeners: [],
    subscribe(fn) { this.listeners.push(fn); },
    notify(key, value) { this.listeners.forEach(fn => fn(key, value)); }
};

export function setState(key, value) {
    state[key] = value;
    state.notify(key, value);
}

export function getState() {
    return state;
}
