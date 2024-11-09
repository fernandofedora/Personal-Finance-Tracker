// Función para obtener las transacciones desde Local Storage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}

// Función para filtrar transacciones por mes
function filterTransactionsByMonth(transactions, year, month) {
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
    });
}

// Función para calcular los totales de gastos por tarjeta
function calculateCardTotals(transactions) {
    const totals = {
        'Visa-La Fise': 0,
        'Mastercard-Banpro': 0,
        'American Express-BAC': 0,
        'General': 0
    };

    transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            if (totals.hasOwnProperty(transaction.creditCard)) {
                totals[transaction.creditCard] += transaction.amount;
            } else {
                totals['General'] += transaction.amount;
            }
        }
    });

    return totals;
}

// Función para actualizar los totales en la página
function updateCardTotals(year, month) {
    const transactions = getTransactions();
    const filteredTransactions = filterTransactionsByMonth(transactions, year, month);
    const totals = calculateCardTotals(filteredTransactions);

    document.getElementById('totalVisaLaFise').textContent = 
        totals['Visa-La Fise'].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('totalMastercardBanpro').textContent = 
        totals['Mastercard-Banpro'].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('totalAmexBAC').textContent = 
        totals['American Express-BAC'].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('totalGeneral').textContent = 
        totals['General'].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// Función para manejar el cambio en el selector de mes
function handleMonthChange() {
    const monthSelector = document.getElementById('monthSelector');
    const [year, month] = monthSelector.value.split('-');
    updateCardTotals(parseInt(year), parseInt(month) - 1); // Restamos 1 al mes porque en JavaScript los meses van de 0 a 11
}

// Configurar el evento de cambio para el selector de mes
document.getElementById('monthSelector').addEventListener('change', handleMonthChange);

// Inicializar la página con el mes actual
window.onload = function () {
    const now = new Date();
    const monthSelector = document.getElementById('monthSelector');
    monthSelector.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    updateCardTotals(now.getFullYear(), now.getMonth());
};