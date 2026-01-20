import { state, setState } from './state.js';

// --- NAVIGATION & STATE HELPERS ---

export function changeAnalyticsMode(mode) {
    state.analyticsState.mode = mode;
    state.analyticsState.date = new Date(); // Reset to today when switching major modes
    updateModeUI(mode);
    renderAnalytics();
}

function updateModeUI(mode) {
    const modes = ['week', 'month', 'year'];
    modes.forEach(m => {
        const btn = document.getElementById(`btn-mode-${m}`);
        if (btn) {
            if (m === mode) {
                btn.className = "flex-1 py-2 rounded-lg bg-neutral-700 text-white shadow-md transition-all font-bold";
            } else {
                btn.className = "flex-1 py-2 rounded-lg text-neutral-500 hover:text-white transition-all";
            }
        }
    });

    const scroller = document.getElementById('analytics-date-label')?.parentElement;
    if (scroller) {
        if (mode === 'all') scroller.classList.add('hidden');
        else scroller.classList.remove('hidden');
    }
}

export function changeAnalyticsDate(offset) {
    const d = new Date(state.analyticsState.date);
    const mode = state.analyticsState.mode;

    if (mode === 'week') d.setDate(d.getDate() + (offset * 7));
    if (mode === 'month') d.setMonth(d.getMonth() + offset);
    if (mode === 'year') d.setFullYear(d.getFullYear() + offset);

    state.analyticsState.date = d;
    renderAnalytics();
}

// --- DATE HELPERS ---

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    d.setHours(0, 0, 0, 0);
    return new Date(d.setDate(diff));
}

function formatDateRange(date, mode) {
    const options = { month: 'short', day: 'numeric' };

    if (mode === 'week') {
        const start = getStartOfWeek(date);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleDateString('ro-RO', options)} - ${end.toLocaleDateString('ro-RO', options)}`;
    }
    if (mode === 'month') {
        return date.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
    }
    if (mode === 'year') {
        return date.getFullYear().toString();
    }
    return 'Dintotdeauna';
}

// --- CORE RENDER FUNCTION ---

export function renderAnalytics() {
    const container = document.getElementById('view-analytics');
    if (!container) return;

    // Ensure Insights Container Exists
    let insightsDiv = document.getElementById('insightsContainer');
    if (!insightsDiv) {
        // If it doesn't exist, we likely need to inject the basic structure first
        // But for now, let's assume index.html has it or we create it.
        // We will target the dynamic content mainly.
    }

    const mode = state.analyticsState.mode;
    const refDate = state.analyticsState.date;
    const breakdownList = document.getElementById('analyticsBreakdown');

    // 1. Update Label (if UI exists)
    const label = document.getElementById('analytics-date-label');
    if (label) label.innerText = formatDateRange(refDate, mode);
    updateModeUI(mode);

    // 2. Filter Data & Calculate Metrics
    let filteredData = [];
    const chartData = { labels: [], values: [], incomeVals: [] }; // For graphs

    if (mode === 'week') {
        const start = getStartOfWeek(refDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        filteredData = state.transactionsCache.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });

        // Daily Breakdown (Mon-Sun)
        chartData.labels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
        chartData.values = Array(7).fill(0); // Expense
        chartData.incomeVals = Array(7).fill(0); // Income

        filteredData.forEach(t => {
            let dayIdx = new Date(t.date).getDay() - 1; // 0=Sun
            if (dayIdx === -1) dayIdx = 6;

            if (t.type === 'Expense') chartData.values[dayIdx] += t.amount;
            if (t.type === 'Income') chartData.incomeVals[dayIdx] += (t.amount + (t.tipAmount || 0));
        });

    } else if (mode === 'month') {
        const month = refDate.getMonth();
        const year = refDate.getFullYear();
        // Get number of days in the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const numWeeks = daysInMonth > 28 ? 5 : 4;

        filteredData = state.transactionsCache.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });

        // Generate Labels: W1..W4 or W5
        chartData.labels = Array.from({ length: numWeeks }, (_, i) => `W${i + 1}`);
        chartData.values = Array(numWeeks).fill(0);

        filteredData.forEach(t => {
            if (t.type === 'Expense') {
                const day = new Date(t.date).getDate();
                // 1-7=0, 8-14=1, 15-21=2, 22-28=3, 29+=4
                const wIdx = Math.min(Math.floor((day - 1) / 7), numWeeks - 1);
                chartData.values[wIdx] += t.amount;
            }
        });

    } else if (mode === 'year') {
        const year = refDate.getFullYear();
        filteredData = state.transactionsCache.filter(t => {
            const d = new Date(t.date);
            return d.getFullYear() === year;
        });

        // Monthly Breakdown
        chartData.labels = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN', 'IUL', 'AUG', 'SEP', 'OCT', 'NOI', 'DEC'];
        chartData.values = Array(12).fill(0);

        filteredData.forEach(t => {
            if (t.type === 'Expense' && new Date(t.date).getFullYear() === year) {
                chartData.values[new Date(t.date).getMonth()] += t.amount;
            }
        });
    }

    // 3. Global Totals
    let income = 0;
    let expense = 0;
    const catMap = {};

    filteredData.forEach(t => {
        if (t.type === 'Income') income += (t.amount + (t.tipAmount || 0));
        if (t.type === 'Expense') {
            expense += t.amount;
            catMap[t.category] = (catMap[t.category] || 0) + t.amount;
        }
    });

    const net = income - expense;
    const pct = income > 0 ? (expense / income) * 100 : 0;

    // 4. Render HTML Structure
    const maxVal = Math.max(...chartData.values, 1);

    if (insightsDiv) {
        insightsDiv.innerHTML = `
            <!-- NET WORTH CARD -->
            <div class="bg-blue-600 rounded-3xl p-6 shadow-lg shadow-blue-500/20 text-center relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div class="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Rezultat Net (${formatDateRange(refDate, mode)})</div>
                <div class="text-3xl font-extrabold text-white mb-4 relative z-10">${net.toFixed(2)} <span class="text-sm font-normal opacity-70">RON</span></div>
                
                <div class="flex justify-center gap-2 relative z-10">
                    <div class="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                        <div class="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <div class="text-left">
                            <div class="text-[10px] text-blue-200 font-bold">VENITURI</div>
                            <div class="text-sm font-bold text-white">${income.toFixed(0)}</div>
                        </div>
                    </div>
                    <div class="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10">
                        <div class="w-2 h-2 rounded-full bg-red-400"></div>
                        <div class="text-left">
                            <div class="text-[10px] text-blue-200 font-bold">CHELTUIELI</div>
                            <div class="text-sm font-bold text-white">${expense.toFixed(0)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- BAR CHART -->
            <div class="bg-neutral-800 rounded-3xl p-5 border border-neutral-700/50 shadow-xl">
                <div class="flex justify-between items-end h-40 gap-2 px-1">
                    ${chartData.values.map((val, i) => `
                        <div class="flex flex-col items-center justify-end w-full group relative h-full">
                            <div class="peer w-full max-w-[16px] min-h-[4px] rounded-t-sm transition-all duration-500 ease-out 
                                ${val > 0 ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]' : 'bg-neutral-700/50'}"
                                style="height: ${val > 0 ? (val / maxVal) * 100 : 2}%">
                            </div>
                            <div class="absolute -top-8 bg-neutral-900 border border-neutral-700 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 peer-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none transform translate-y-2 peer-hover:translate-y-0">
                                ${val.toFixed(0)} RON
                            </div>
                            <div class="text-[10px] font-bold text-neutral-500 mt-2">${chartData.labels[i]}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- PROGRESS LINE -->
            <div class="bg-neutral-800 rounded-2xl p-4 border border-neutral-700/50">
                <div class="flex justify-between text-xs font-bold text-neutral-400 mb-2">
                    <span>Procent Cheltuit</span>
                    <span>${pct.toFixed(0)}% din Venituri</span>
                </div>
                <div class="h-3 bg-neutral-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-1000" style="width: ${Math.min(pct, 100)}%"></div>
                </div>
            </div>
        `;
    }

    // 5. Category Breakdown List
    if (breakdownList) {
        breakdownList.innerHTML = '';
        const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

        sortedCats.forEach(([cat, amt]) => {
            const catPct = expense > 0 ? (amt / expense) * 100 : 0;

            const div = document.createElement('div');
            div.className = "flex items-center gap-3 p-3 active:bg-neutral-800 rounded-xl transition";
            div.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
                <i class="fa-solid fa-tag"></i> 
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-bold text-white">${cat}</span>
                        <span class="text-sm font-bold text-white">${amt.toFixed(2)} <span class="text-xs text-neutral-500">RON</span></span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-500 rounded-full" style="width: ${catPct}%"></div>
                        </div>
                        <span class="text-[10px] font-bold text-neutral-500">${catPct.toFixed(0)}%</span>
                    </div>
                </div>
            `;
            breakdownList.appendChild(div);
        });
    }
}
