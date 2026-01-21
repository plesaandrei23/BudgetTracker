import { state, setState } from './state.js';
import { addTransaction, updateTransaction, updateConfig, importData } from './db.js';
import { renderAnalytics } from './charts.js';

// --- ROUTER UI ---

export function updateNavState(view) {
    document.querySelectorAll('main > section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`view-${view}`).classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        const isTarget = btn.dataset.target === view;
        btn.classList.toggle('text-amber-500', isTarget);
        btn.classList.toggle('text-slate-400', !isTarget);
        btn.classList.toggle('dark:text-slate-500', !isTarget);
    });

    if (view === 'analytics') renderAnalytics('week');
    if (view === 'settings') renderSettingsUI();
}

// --- ACCOUNTS ---

export function renderAccounts() {
    const list = document.getElementById('accountsList');

    const balances = {};
    state.userConfig.accounts.forEach(a => balances[a.id] = 0);

    state.transactionsCache.forEach(t => {
        const accId = t.accountId || 'cash';
        if (balances[accId] !== undefined) {
            if (t.type === 'Income') {
                balances[accId] += (t.amount + (t.tipAmount || 0));
            } else if (t.type === 'Expense') {
                balances[accId] -= t.amount;
            } else if (t.type === 'Transfer' && t.toAccountId) {
                balances[accId] -= t.amount;
                if (balances[t.toAccountId] !== undefined) balances[t.toAccountId] += t.amount;
            }
        }
    });

    // Total Balance (Sum of all defined accounts)
    const total = Object.values(balances).reduce((a, b) => a + b, 0);

    let html = `
        <div onclick="selectAccount('all')" class="flex-shrink-0 w-36 h-24 bg-white dark:bg-slate-800 rounded-2xl p-4 border ${state.selectedAccount === 'all' ? 'border-amber-500' : 'border-slate-200 dark:border-slate-700'} flex flex-col justify-between cursor-pointer snap-start shadow-sm">
            <div class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Total Net Worth</div>
            <div class="text-lg font-bold text-slate-900 dark:text-white">${total.toFixed(2)}</div>
        </div>
    `;

    state.userConfig.accounts.forEach(acc => {
        const bal = balances[acc.id] || 0;
        const isSel = state.selectedAccount === acc.id;
        html += `
            <div onclick="selectAccount('${acc.id}')" class="flex-shrink-0 w-36 h-24 bg-white dark:bg-slate-800 rounded-2xl p-4 border ${isSel ? 'border-amber-500' : 'border-slate-200 dark:border-slate-700'} flex flex-col justify-between cursor-pointer snap-start shadow-sm">
                <div class="flex justify-between items-start">
                    <span class="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold truncate pr-2">${acc.name}</span>
                    <i class="fa-solid ${acc.icon} ${acc.color === 'text-white' ? 'text-slate-900 dark:text-white' : acc.color}"></i>
                </div>
                <div class="text-lg font-bold text-slate-900 dark:text-white">${bal.toFixed(2)}</div>
            </div>
        `;
    });

    list.innerHTML = html;
}

export function selectAccount(id) {
    setState('selectedAccount', id);
    renderAccounts();
    renderTransactions();
}

// --- TRANSACTIONS ---

export function renderTransactions() {
    const list = document.getElementById('transactionList');
    list.innerHTML = '';

    let data = state.transactionsCache;

    // Filter
    if (state.selectedAccount !== 'all') {
        data = data.filter(t => t.accountId === state.selectedAccount || t.toAccountId === state.selectedAccount);
    }

    if (data.length === 0) {
        list.innerHTML = `<div class="text-center text-slate-500 py-10">No transactions found.</div>`;
        return;
    }

    // Grouping
    const groups = {};
    data.forEach(t => {
        const d = new Date(t.date);
        const key = d.toDateString(); // Simplified key for map
        if (!groups[key]) groups[key] = { label: getReadableDate(d), items: [] };
        groups[key].items.push(t);
    });

    Object.values(groups).forEach(group => {
        const header = document.createElement('div');
        header.className = "sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur z-10 py-2 px-1 text-xs font-bold text-slate-500 uppercase";
        header.innerText = group.label;
        list.appendChild(header);

        const groupDiv = document.createElement('div');
        groupDiv.className = "bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-700 shadow-sm";

        group.items.forEach(t => {
            const isExp = t.type === 'Expense';
            const isInc = t.type === 'Income';

            let color = 'text-slate-900 dark:text-white';
            let icon = 'fa-bag-shopping';
            let sign = '';

            // Logic: Expense = Red (-), Income = Green (+)
            if (isExp) {
                color = 'text-red-500';
                sign = '-';
            } else if (isInc) {
                color = 'text-emerald-500';
                sign = '+';
                icon = 'fa-arrow-down';
            } else {
                color = 'text-amber-500'; // Transfer
                icon = 'fa-arrow-right-arrow-left';
            }

            const div = document.createElement('div');
            div.className = "p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition border-b border-slate-200 dark:border-slate-700 last:border-0 cursor-pointer";
            div.onclick = () => openAddModal(t.id); // EDIT MODE

            div.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-300">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between">
                        <span class="font-bold text-sm text-slate-800 dark:text-slate-200">${t.description || t.category}</span>
                        <span class="font-bold text-sm ${color}">${sign}${t.amount.toFixed(2)}</span>
                    </div>
                     <div class="flex justify-between mt-0.5">
                        <span class="text-xs text-slate-500">${t.category}</span>
                        ${t.tipAmount ? `<span class="text-[10px] bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 px-1 rounded">Tip: ${t.tipAmount}</span>` : ''}
                    </div>
                </div>
            `;
            groupDiv.appendChild(div);
        });

        list.appendChild(groupDiv);
    });
}

function getReadableDate(d) {
    const today = new Date();
    const splitT = today.toDateString();
    const dateStr = d.toDateString();
    if (dateStr === splitT) return "Today";

    // Check Yesterday
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    if (dateStr === yest.toDateString()) return "Yesterday";

    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// --- MODAL / EDIT ---

export function openAddModal(editingId = null) {
    const modal = document.getElementById('addModal');
    modal.classList.remove('hidden');
    setState('editingId', editingId);

    // Populate Selects first
    populateAccountSelects();

    if (editingId) {
        // Find TX
        const tx = state.transactionsCache.find(t => t.id === editingId);
        if (!tx) return;

        document.getElementById('inpAmount').value = tx.amount;
        document.getElementById('inpDesc').value = tx.description;
        document.getElementById('inpDate').value = tx.date.split('T')[0]; // simple ISO date
        document.getElementById('inpAccount').value = tx.accountId || 'cash';
        document.getElementById('inpCategory').value = tx.category;

        setType(tx.type);

        if (tx.type === 'Transfer') {
            document.getElementById('inpToAccount').value = tx.toAccountId;
        }
        if (tx.tipAmount) document.getElementById('inpTip').value = tx.tipAmount;

    } else {
        // New
        document.getElementById('inpAmount').value = '';
        document.getElementById('inpDesc').value = '';
        document.getElementById('inpDate').valueAsDate = new Date();
        document.getElementById('inpTip').value = '';

        // Default Account: Selected or First
        const defAcc = state.selectedAccount !== 'all' ? state.selectedAccount : state.userConfig.accounts[0].id;
        document.getElementById('inpAccount').value = defAcc;

        setType('Expense');
    }

    checkBusinessLogic(); // ensure tip field visibility is correct
}

function populateAccountSelects() {
    const s1 = document.getElementById('inpAccount');
    const s2 = document.getElementById('inpToAccount');
    s1.innerHTML = ''; s2.innerHTML = '';

    state.userConfig.accounts.forEach(a => {
        s1.add(new Option(a.name, a.id));
        s2.add(new Option(a.name, a.id));
    });
}

export function closeAddModal() {
    document.getElementById('addModal').classList.add('hidden');
    setState('editingId', null);
}

export function setType(type) {
    setState('inputMode', type);

    // Buttons state
    const map = { Expense: 'btnEp', Income: 'btnIn', Transfer: 'btnTr' };
    Object.keys(map).forEach(k => {
        const el = document.getElementById(map[k]);
        if (k === type) el.className = "flex-1 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 shadow text-slate-900 dark:text-white transition-all";
        else el.className = "flex-1 py-2 rounded-lg text-sm font-bold text-slate-400 dark:text-slate-500 transition-all";
    });

    // Visibility
    document.getElementById('fieldCategory').classList.toggle('hidden', type === 'Transfer');
    document.getElementById('fieldToAccount').classList.toggle('hidden', type !== 'Transfer');

    if (type !== 'Transfer') {
        renderCategoryList(type);
    }

    checkBusinessLogic();
}

function renderCategoryList(type) {
    const list = document.getElementById('catList');
    list.innerHTML = '';
    const cats = type === 'Expense' ? state.userConfig.expenseCats : state.userConfig.incomeCats;
    const currentCat = document.getElementById('inpCategory').value;

    cats.forEach(c => {
        const isActive = c === currentCat;
        const btn = document.createElement('button');
        btn.className = `flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition ${isActive ? 'bg-amber-500 text-black border-transparent' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent'}`;
        btn.innerText = c;
        btn.onclick = (e) => {
            e.preventDefault(); // prevent form issues
            document.getElementById('inpCategory').value = c;
            renderCategoryList(type); // re-render to update active class
        };
        list.appendChild(btn);
    });

    // Validation: if current category not in list, pick first
    if (!cats.includes(document.getElementById('inpCategory').value) && cats.length > 0) {
        document.getElementById('inpCategory').value = cats[0];
        // Re-render once to show selection
        // renderCategoryList(type); // Avoid infinite loop, just let logic handle next click or save
    }
}

// Global hook to checking Business Tip Logic
export function checkBusinessLogic() {
    // Requirements: Type == Income AND Account == 'business_cash'
    const type = state.inputMode;
    const accId = document.getElementById('inpAccount').value;

    const tipField = document.getElementById('fieldTip');

    if (type === 'Income' && accId === 'business_cash') {
        tipField.classList.remove('hidden');
    } else {
        tipField.classList.add('hidden');
        document.getElementById('inpTip').value = ''; // clear if hidden
    }
}

export async function saveTransaction() {
    const data = {
        amount: document.getElementById('inpAmount').value,
        description: document.getElementById('inpDesc').value,
        date: document.getElementById('inpDate').value,
        type: state.inputMode,
        accountId: document.getElementById('inpAccount').value,
        category: document.getElementById('inpCategory').value
    };

    if (!data.amount || !data.date) { alert("Missing fields"); return; }

    if (data.type === 'Transfer') {
        data.toAccountId = document.getElementById('inpToAccount').value;
        if (data.accountId === data.toAccountId) { alert("Same account transfer restricted"); return; }
    }

    const tip = document.getElementById('inpTip').value;
    if (tip && !document.getElementById('fieldTip').classList.contains('hidden')) {
        data.tipAmount = tip;
    }

    // UI Feedback
    const btn = document.getElementById('saveTxBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    try {
        if (state.editingId) {
            await updateTransaction(state.currentUser.uid, state.editingId, data);
        } else {
            await addTransaction(state.currentUser.uid, data);
        }
        closeAddModal();
    } catch (e) {
        console.error(e);
        alert("Error saving: " + e.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// --- SETTINGS UI ---

export function renderSettingsUI() {
    // This updates the #view-settings section dynamically if needed
    // For now, most static content is in HTML, but we can add list management here.

    // We can add a "Manage Lists" area here later if requested specifically in code (user asked for logic).
    // Let's implement simple prompts for managing cats/accounts for now to fulfill requirement.

    // Injecting a simple manager into Settings view
    const container = document.querySelector('#view-settings .space-y-3');
    // Check if we already added it
    if (document.getElementById('manageConfigDiv')) return;

    const div = document.createElement('div');
    div.id = 'manageConfigDiv';
    div.className = "bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 mt-4";
    div.innerHTML = `
        <div class="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-500 uppercase">Configuration</div>
        <button onclick="addConfigItem('expenseCats')" class="w-full flex justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition border-b border-slate-200 dark:border-slate-700">
            <span class="text-slate-900 dark:text-slate-200">Add Expense Category</span> <i class="fa-solid fa-plus text-amber-500"></i>
        </button>
        <button onclick="addConfigItem('incomeCats')" class="w-full flex justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition border-b border-slate-200 dark:border-slate-700">
            <span class="text-slate-900 dark:text-slate-200">Add Income Category</span> <i class="fa-solid fa-plus text-amber-500"></i>
        </button>
        <button onclick="addConfigItem('accounts')" class="w-full flex justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition">
            <span class="text-slate-900 dark:text-slate-200">Add New Account</span> <i class="fa-solid fa-plus text-amber-500"></i>
        </button>
    `;
    container.appendChild(div);
}

// Helper to add items
window.addConfigItem = async (key) => {
    const name = prompt(`Enter name for new ${key === 'accounts' ? 'Account' : 'Category'}:`);
    if (!name) return;

    const newConfig = { ...state.userConfig };

    if (key === 'accounts') {
        const id = name.toLowerCase().replace(/\s+/g, '_');
        newConfig.accounts.push({ id, name, type: 'bank', icon: 'fa-piggy-bank', color: 'text-slate-900 dark:text-white' });
    } else {
        newConfig[key].push(name);
    }

    await updateConfig(state.currentUser.uid, newConfig);
    alert('Added!');
};

// --- IMPORT/EXPORT ---

export function triggerImport() { document.getElementById('importFile').click(); }

export async function handleImportFile(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target.result);
            if (confirm(`Import ${json.transactions?.length || 0} transactions?`)) {
                await importData(state.currentUser.uid, json);
                alert("Import Complete!");
                location.reload();
            }
        } catch (e) { alert("Invalid JSON"); }
    };
    reader.readAsText(file);
}

export function exportData() {
    const data = { config: state.userConfig, transactions: state.transactionsCache };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
}
