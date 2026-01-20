import { auth } from './firebase.js';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { state, setState } from './state.js';
import { subscribeToConfig, subscribeToTransactions } from './db.js';
import * as UI from './ui.js';
import { renderAnalytics, changeAnalyticsMode, changeAnalyticsDate } from './charts.js';

// --- ROUTER ---

function navigateTo(view) {
    setState('currentView', view);
    UI.updateNavState(view);
}

// --- APP INIT ---

function initApp() {
    // Auth Listener
    onAuthStateChanged(auth, (user) => {
        if (user) {
            setState('currentUser', user);
            // Show App, Hide Login
            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('appHeader').classList.remove('hidden');
            document.getElementById('mainContainer').classList.remove('hidden');
            document.getElementById('bottomNav').classList.remove('hidden');

            // User Info
            document.getElementById('userPhoto').src = user.photoURL;
            document.getElementById('userName').innerText = user.displayName;
            document.getElementById('userEmail').innerText = user.email;

            // Load Data
            loadUserData(user.uid);

            // Determine start view
            navigateTo('home');
        } else {
            setState('currentUser', null);
            document.getElementById('loginScreen').classList.remove('hidden');
            document.getElementById('appHeader').classList.add('hidden');
            document.getElementById('mainContainer').classList.add('hidden');
            document.getElementById('bottomNav').classList.add('hidden');
        }
    });
}

function loadUserData(uid) {
    // 1. Config
    subscribeToConfig(uid, (config) => {
        UI.renderAccounts(); // Re-render when config changes (or accounts update)
    });

    // 2. Transactions
    subscribeToTransactions(uid, (transactions) => {
        UI.renderAccounts();     // Updates Balances
        UI.renderTransactions(); // Updates List
        if (state.currentView === 'analytics') {
            renderAnalytics(); // Refresh chart if visible
        }
    });
}

// --- GLOBAL BINDINGS ---
// Expose functions to window for onclick="" handlers in HTML

window.navigateTo = navigateTo;
window.openAddModal = UI.openAddModal;
window.closeAddModal = UI.closeAddModal;
window.setType = UI.setType;
window.saveTransaction = UI.saveTransaction;
window.selectAccount = UI.selectAccount;
window.triggerImport = UI.triggerImport;
window.handleImportFile = UI.handleImportFile;
window.exportData = UI.exportData;

// Analytics
window.renderAnalytics = renderAnalytics;
window.changeAnalyticsMode = changeAnalyticsMode;
window.changeAnalyticsDate = changeAnalyticsDate;

window.toggleSettings = UI.toggleSettings;
window.renderSettings = UI.renderSettings;
window.closeSettingsModal = UI.closeSettingsModal;
window.openEditModal = UI.openEditModal;
window.changeTab = UI.changeTab;
window.saveSettings = UI.saveSettings;
window.deleteAccount = UI.deleteAccount;
window.deleteCategory = UI.deleteCategory;

// Login/Logout
document.getElementById('googleLoginBtn').addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(e => alert(e.message));
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Log out?')) signOut(auth);
});

// Dynamic Listener for Account Change (Business Tip Logic)
document.getElementById('inpAccount').addEventListener('change', () => {
    UI.checkBusinessFields();
});

// Start
initApp();
