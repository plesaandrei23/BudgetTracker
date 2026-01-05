export let state = {
    currentUser: null,
    currentType: 'Expense',
    settingsTab: 'Expense',
    transactionsCache: [],
    editingId: null,
    userConfig: {
        expenseCats: ["Mâncare", "Transport", "Casă", "Distracție", "Educație"],
        incomeCats: ["Salariu", "Părinți", "Freelance"],
        cards: ["BT", "Revolut", "Saltbank"]
    },
    chartInstance: null
};

export const setState = (key, value) => {
    state[key] = value;
};
