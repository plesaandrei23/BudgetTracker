import { state, setState } from './state.js';

// Paleta de culori extinsa (12 culori)
const chartColors = [
    '#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
    '#06b6d4', '#84cc16', '#e11d48', '#6366f1', '#14b8a6', '#d946ef'
];

export function updateChart(totals) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (state.chartInstance) state.chartInstance.destroy();

    // Daca nu sunt cheltuieli, afisam un cerc gri gol
    const dataValues = Object.values(totals);
    const isEmpty = dataValues.length === 0;

    const newChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: isEmpty ? ['Fără date'] : Object.keys(totals),
            datasets: [{
                data: isEmpty ? [1] : dataValues,
                backgroundColor: isEmpty ? ['#e2e8f0'] : chartColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: !isEmpty, // Afisam legenda doar daca avem date
                    position: 'bottom',
                    labels: { usePointStyle: true, boxWidth: 8, font: { size: 10 } }
                },
                tooltip: { enabled: !isEmpty }
            },
            cutout: '75%'
        }
    });

    setState('chartInstance', newChart);
}
