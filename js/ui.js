import { state, setState } from './state.js';
import { updateChart } from './charts.js';

export function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsOverlay');
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden'); overlay.classList.remove('hidden');
        renderSettingsCats('Expense');
    } else {
        panel.classList.add('hidden'); overlay.classList.add('hidden');
    }
}

export function setType(type) {
    setState('currentType', type);
    const btnExp = document.getElementById('btnExpense');
    const btnInc = document.getElementById('btnIncome');
    const catSelect = document.getElementById('category');
    catSelect.innerHTML = '';
    const list = type === 'Expense' ? state.userConfig.expenseCats : state.userConfig.incomeCats;
    if (list) list.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c; opt.innerText = c; catSelect.appendChild(opt);
    });
    if (type === 'Expense') {
        btnExp.className = "flex-1 py-2.5 rounded-lg text-sm font-bold bg-white text-rose-600 shadow-sm transition-all";
        btnInc.className = "flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-400 transition-all";
    } else {
        btnExp.className = "flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-400 transition-all";
        btnInc.className = "flex-1 py-2.5 rounded-lg text-sm font-bold bg-white text-emerald-600 shadow-sm transition-all";
    }

    // Populate card select
    const cardSelect = document.getElementById('cardSelect');
    cardSelect.innerHTML = '';
    state.userConfig.cards.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c; opt.innerText = c; cardSelect.appendChild(opt);
    });
}

export function togglePaymentMethod(method) {
    const btnCash = document.getElementById('btnCash');
    const btnCard = document.getElementById('btnCard');
    const cardSelect = document.getElementById('cardSelect');

    if (method === 'Cash') {
        btnCash.className = "flex-1 py-2.5 rounded-lg text-sm font-bold bg-white text-slate-800 shadow-sm transition-all";
        btnCard.className = "flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-400 transition-all";
        cardSelect.classList.add('hidden');
    } else {
        btnCash.className = "flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-400 transition-all";
        btnCard.className = "flex-1 py-2.5 rounded-lg text-sm font-bold bg-white text-blue-600 shadow-sm transition-all";
        cardSelect.classList.remove('hidden');
    }
}

export function renderSettingsCats(tab) {
    setState('settingsTab', tab);
    const list = document.getElementById('settingsCatList');
    const btnExp = document.getElementById('setTabExp');
    const btnInc = document.getElementById('setTabInc');
    const btnCards = document.getElementById('setTabCards');

    // Reset classes
    const activeClass = "flex-1 py-2.5 rounded-lg text-sm font-bold bg-white text-rose-600 shadow-sm transition-all";
    const inactiveClass = "flex-1 py-2.5 rounded-lg text-sm font-bold text-slate-400 transition-all";

    btnExp.className = inactiveClass;
    btnInc.className = inactiveClass;
    btnCards.className = inactiveClass;

    let items = [];
    if (tab === 'Expense') {
        btnExp.className = activeClass;
        items = state.userConfig.expenseCats;
    } else if (tab === 'Income') {
        btnInc.className = activeClass.replace('text-rose-600', 'text-emerald-600');
        items = state.userConfig.incomeCats;
    } else { // Cards tab
        btnCards.className = activeClass.replace('text-rose-600', 'text-blue-600');
        items = state.userConfig.cards;
    }

    list.innerHTML = '';
    if (items) items.forEach(c => {
        const item = document.createElement('div');
        item.className = "flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100";
        item.innerHTML = `
            <span class="font-bold text-sm text-slate-700">${c}</span>
            <button onclick="removeCat('${c}')" class="text-slate-300 hover:text-red-500 w-8 h-8 flex items-center justify-center"><i class="fa-solid fa-trash"></i></button>
        `;
        list.appendChild(item);
    });
}

export function renderApp(transactions) {
    const list = document.getElementById('transactionList');
    list.innerHTML = '';
    let inc = 0, exp = 0;
    const catTotals = {};

    if (transactions.length === 0) list.innerHTML = '<div class="p-8 text-center text-slate-400 text-sm">Nu ai tranzacții.</div>';

    transactions.forEach(t => {
        if (t.type === 'Income') inc += t.amount;
        else {
            exp += t.amount;
            catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
        }
        const isInc = t.type === 'Income';
        const dateDisp = new Date(t.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
        const paymentInfo = t.paymentType === 'Card' ? `<span class="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[10px] ml-1">${t.cardName}</span>` : '';

        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center hover:bg-slate-50 transition group";
        div.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded-full bg-slate-50 flex-shrink-0 flex items-center justify-center text-slate-400">
                   <i class="fa-solid ${isInc ? 'fa-wallet' : 'fa-receipt'}"></i>
                </div>
                <div class="min-w-0">
                    <p class="font-bold text-slate-800 text-sm truncate pr-2 flex items-center">${t.description} ${paymentInfo}</p>
                    <p class="text-xs text-slate-400 font-medium">${dateDisp} • ${t.category}</p>
                </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-shrink-0">
                <p class="font-bold ${isInc ? 'text-emerald-500' : 'text-slate-800'} text-base">${isInc ? '+' : '-'}${t.amount}</p>
                <div class="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="editTx('${t.id}')" class="text-slate-300 hover:text-blue-500 p-1"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteTx('${t.id}')" class="text-slate-300 hover:text-rose-500 p-1"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div>
        `;
        list.appendChild(div);
    });

    document.getElementById('totalIncome').innerText = inc;
    document.getElementById('totalExpense').innerText = exp;
    document.getElementById('chartTotal').innerText = exp + " Lei";
    document.getElementById('balance').innerText = (inc - exp).toFixed(2) + " Lei";
    updateChart(catTotals);
}

export function editTx(id) {
    const tx = state.transactionsCache.find(t => t.id === id);
    if (!tx) return;
    setState('editingId', id);
    document.getElementById('editHeader').classList.remove('hidden');
    document.getElementById('saveBtn').innerText = "Actualizează";
    document.getElementById('saveBtn').classList.replace('bg-slate-900', 'bg-blue-600');
    if (window.innerWidth < 768) document.querySelector('main').scrollTop = 0;
    setType(tx.type);

    // Set payment method
    togglePaymentMethod(tx.paymentType || 'Cash');

    setTimeout(() => {
        document.getElementById('dateInput').value = tx.date;
        document.getElementById('amount').value = tx.amount;
        document.getElementById('category').value = tx.category;
        document.getElementById('description').value = tx.description;
        if (tx.paymentType === 'Card') document.getElementById('cardSelect').value = tx.cardName;
    }, 50);
}

export function cancelEdit() {
    setState('editingId', null);
    document.getElementById('editHeader').classList.add('hidden');
    document.getElementById('saveBtn').innerText = "Salvează";
    document.getElementById('saveBtn').classList.replace('bg-blue-600', 'bg-slate-900');
    document.getElementById('amount').value = ''; document.getElementById('description').value = '';
    togglePaymentMethod('Cash'); // Reset to default
}
