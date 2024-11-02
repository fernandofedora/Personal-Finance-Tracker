// Función para obtener las transacciones desde Local Storage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}

// Función para calcular los totales de gastos por tarjeta
function calculateCardTotals() {
    const transactions = getTransactions();
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
function updateCardTotals() {
    const totals = calculateCardTotals();

    document.getElementById('totalVisaLaFise').textContent = 
        totals['Visa-La Fise'].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('totalMastercardBanpro').textContent = 
        totals['Mastercard-Banpro'].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('totalAmexBAC').textContent = 
        totals['American Express-BAC'].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    document.getElementById('totalGeneral').textContent = 
        totals['General'].toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// Llama a la función para actualizar los totales al cargar la página
window.onload = function () {
    updateCardTotals();
};
