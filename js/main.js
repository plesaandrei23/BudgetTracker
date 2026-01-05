import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebase.js";
import { state, setState } from "./state.js";
import { subscribeToConfig, subscribeToTransactions, addTransaction, updateTransaction, deleteTransaction, updateConfig } from "./db.js";
import { loginWithGoogle, logout } from "./auth.js";
import { toggleSettings, setType, renderSettingsCats, renderApp, editTx, cancelEdit, togglePaymentMethod } from "./ui.js";

// -- Initial Setup --

onAuthStateChanged(auth, (user) => {
    if (user) {
        setState('currentUser', user);
        document.getElementById('userName').innerText = user.displayName;
        document.getElementById('userPhoto').src = user.photoURL;
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('appHeader').classList.remove('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        initAppData();
    } else {
        setState('currentUser', null);
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('appHeader').classList.add('hidden');
        document.getElementById('mainContent').classList.add('hidden');
    }
});

function initAppData() {
    setType('Expense');
    togglePaymentMethod('Cash');
    document.getElementById('dateInput').valueAsDate = new Date();

    subscribeToConfig(state.currentUser.uid, (config) => {
        setType(state.currentType);
    });

    subscribeToTransactions(state.currentUser.uid, (transactions) => {
        renderApp(transactions);
    });
}

// -- Event Listeners --

document.getElementById('googleLoginBtn').addEventListener('click', loginWithGoogle);
document.getElementById('logoutBtn').addEventListener('click', () => { toggleSettings(); logout(); });

document.getElementById('saveBtn').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('amount').value);
    const dateVal = document.getElementById('dateInput').value;
    const cat = document.getElementById('category').value;
    const desc = document.getElementById('description').value || cat;

    // Get Payment Type info
    const isCard = !document.getElementById('cardSelect').classList.contains('hidden');
    const paymentType = isCard ? 'Card' : 'Cash';
    const cardName = isCard ? document.getElementById('cardSelect').value : null;

    if (!amount) { alert("Introdu suma!"); return; }

    const btn = document.getElementById('saveBtn');
    btn.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i>"; btn.disabled = true;

    try {
        const txData = {
            date: dateVal, amount, category: cat, description: desc, type: state.currentType,
            paymentType, cardName
        };

        if (state.editingId) {
            await updateTransaction(state.currentUser.uid, state.editingId, txData);
            cancelEdit();
        } else {
            await addTransaction(state.currentUser.uid, txData);
            document.getElementById('amount').value = ''; document.getElementById('description').value = '';
        }
    } catch (e) {
        console.error(e);
        alert("Eroare");
    }

    btn.innerHTML = "Salvează"; btn.disabled = false;
});

// -- Global Exports for HTML onclick --

window.toggleSettings = toggleSettings;
window.setType = setType;
window.renderSettingsCats = renderSettingsCats;
window.cancelEdit = cancelEdit;
window.togglePaymentMethod = togglePaymentMethod;

window.editTx = editTx; // Called from renderApp HTML string

window.deleteTx = async (id) => {
    if (confirm("Ștergi?")) {
        if (state.editingId === id) cancelEdit();
        await deleteTransaction(state.currentUser.uid, id);
    }
};

window.addNewCategory = async () => {
    const input = document.getElementById('newCatName');
    const name = input.value.trim();
    if (!name) return;

    let updateObj = {};
    let list = [];

    if (state.settingsTab === 'Expense') {
        list = [...state.userConfig.expenseCats];
        if (!list.includes(name)) updateObj = { expenseCats: [...list, name] };
    } else if (state.settingsTab === 'Income') {
        list = [...state.userConfig.incomeCats];
        if (!list.includes(name)) updateObj = { incomeCats: [...list, name] };
    } else { // Cards
        list = [...state.userConfig.cards];
        if (!list.includes(name)) updateObj = { cards: [...list, name] };
    }

    if (Object.keys(updateObj).length > 0) {
        await updateConfig(state.currentUser.uid, updateObj);
    }
    input.value = '';
};

window.removeCat = async (name) => {
    if (!confirm("Ștergi?")) return;

    let updateObj = {};
    let list = [];

    if (state.settingsTab === 'Expense') {
        list = [...state.userConfig.expenseCats].filter(c => c !== name);
        updateObj = { expenseCats: list };
    } else if (state.settingsTab === 'Income') {
        list = [...state.userConfig.incomeCats].filter(c => c !== name);
        updateObj = { incomeCats: list };
    } else { // Cards
        list = [...state.userConfig.cards].filter(c => c !== name);
        updateObj = { cards: list };
    }

    await updateConfig(state.currentUser.uid, updateObj);
};

window.exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.transactionsCache));
    const node = document.createElement('a'); node.href = dataStr;
    node.download = "backup.json"; node.click();
};
