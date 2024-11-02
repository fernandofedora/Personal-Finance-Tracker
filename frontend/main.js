// Función para obtener las transacciones desde Local Storage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}

// Función para guardar transacciones en Local Storage
function saveTransactions(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Función para agregar una nueva transacción
function saveTransaction(transaction) {
    const transactions = getTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);
    updateUI();
    //updateCardTotals(); 
}

// Función para eliminar una transacción
function deleteTransaction(index) {
    const transactions = getTransactions();
    transactions.splice(index, 1); // Elimina la transacción en el índice dado
    saveTransactions(transactions);
    updateUI();
}

// Función para actualizar una transacción
function updateTransaction(index, updatedTransaction) {
    const transactions = getTransactions();
    transactions[index] = updatedTransaction; // Actualiza la transacción en el índice dado
    saveTransactions(transactions);
    updateUI();
    updateCardTotals(); 

}

function renderTransactionTable() {
    const transactions = getTransactions();
    const tableBody = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];

    // Limpiar la tabla antes de agregar nuevas filas
    tableBody.innerHTML = '';

    transactions.forEach((transaction, index) => {
        const row = tableBody.insertRow();

        const titleCell = row.insertCell(0);
        const amountCell = row.insertCell(1);
        const typeCell = row.insertCell(2);
        const creditCardCell = row.insertCell(3); // Nueva celda para el tipo de tarjeta
        const dateCell = row.insertCell(4);
        const timeCell = row.insertCell(5);
        const actionCell = row.insertCell(6); // Celda para los botones de acción

        const transactionDate = new Date(transaction.date);

        titleCell.textContent = transaction.title;

        // Formatear el monto como moneda con signo de dólar
        amountCell.textContent = `${transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;

        typeCell.textContent = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
        creditCardCell.textContent = transaction.creditCard; // Mostrar el tipo de tarjeta en la tabla
        dateCell.textContent = transactionDate.toLocaleDateString();
        timeCell.textContent = transactionDate.toLocaleTimeString();

        // Crear botón de eliminar
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('btn', 'btn-danger', 'btn-sm', 'me-2');
        deleteButton.onclick = function() {
            deleteTransaction(index);
        };

        // Crear botón de actualizar
        const updateButton = document.createElement('button');
        updateButton.textContent = 'Actualizar';
        updateButton.classList.add('btn', 'btn-warning', 'btn-sm');
        updateButton.onclick = function() {
            populateUpdateForm(transaction, index);
        };

        // Agregar los botones a la celda de acciones
        actionCell.appendChild(deleteButton);
        actionCell.appendChild(updateButton);
    });
}

// Función para rellenar el formulario con datos existentes para su actualización
function populateUpdateForm(transaction, index) {
    document.getElementById('title').value = transaction.title;
    document.getElementById('amount').value = transaction.amount;
    document.getElementById('type').value = transaction.type;
    document.getElementById('creditCard').value = transaction.creditCard; // Cargar el valor de la tarjeta en el formulario

    // Cambiamos el comportamiento del formulario para que actualice en lugar de crear una nueva transacción
    document.getElementById('transactionForm').onsubmit = function(e) {
        e.preventDefault();
        
        const updatedTitle = document.getElementById('title').value;
        const updatedAmount = parseFloat(document.getElementById('amount').value);
        const updatedType = document.getElementById('type').value;
        const updatedCreditCard = document.getElementById('creditCard').value; // Obtener el nuevo valor de la tarjeta
        const updatedDate = new Date().toISOString(); // Fecha y hora actualizadas

        const updatedTransaction = { title: updatedTitle, amount: updatedAmount, type: updatedType, creditCard: updatedCreditCard, date: updatedDate };
        updateTransaction(index, updatedTransaction);

        // Resetear el formulario y restaurar el comportamiento para agregar nuevas transacciones
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionForm').onsubmit = handleFormSubmit;
    };
}

// Función para manejar el envío del formulario (agregar transacción)
function handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const creditCard = document.getElementById('creditCard').value; // Obtener la tarjeta de crédito seleccionada
    const date = new Date().toISOString(); // Almacenar la fecha y hora en formato ISO

    const transaction = { title, amount, type, creditCard, date }; // Incluir tarjeta en la transacción
    saveTransaction(transaction);

    // Actualizar la UI y resetear el formulario
    updateUI();
    document.getElementById('transactionForm').reset();
    document.getElementById('type').value = 'income'; // Restablecer tipo a 'income'
}

// Función para actualizar la UI (tabla, gráfico y totales/balance)
function updateUI() {
    renderTransactionTable();
    updateTotalsAndBalance();
    // Actualizar el gráfico con el período seleccionado actualmente
    updateChartData(currentPeriod);
}

// Variable para almacenar el período seleccionado actualmente
let currentPeriod = 'month';

// Función para filtrar transacciones por período
function filterTransactionsByPeriod(period) {
    const transactions = getTransactions();
    const now = new Date();

    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);

        if (period === 'day') {
            return transactionDate.toDateString() === now.toDateString();
        } else if (period === 'week') {
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            return transactionDate >= startOfWeek && transactionDate <= now;
        } else if (period === 'month') {
            return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
        }

        return true; // Si no se especifica un período, devuelve todas las transacciones
    });
}

// Función para actualizar los totales y balance
function updateTotalsAndBalance() {
    const transactions = getTransactions();

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = totalIncome - totalExpense;

    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `$${totalExpense.toFixed(2)}`;
    document.getElementById('balance').textContent = `$${balance.toFixed(2)}`;
}

// Variable global para la instancia del gráfico
let chart;

// Función para actualizar los datos del gráfico según el período seleccionado
function updateChartData(period) {
    currentPeriod = period; // Actualizamos el período actual
    const transactions = filterTransactionsByPeriod(period);

    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const chartData = {
        labels: ['Income', 'Expense'],
        datasets: [{
            label: 'Finance Overview',
            data: [income, expense],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        }]
    };

    if (chart) {
        chart.data = chartData;
        chart.update();
    } else {
        const ctx = document.getElementById('financeChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Función que se ejecuta al cargar la página
window.onload = function () {
    updateUI(); // Inicializa la tabla, el gráfico y los totales al cargar la página
};

// Asignar el controlador para el envío del formulario (por defecto para agregar transacciones)
document.getElementById('transactionForm').onsubmit = handleFormSubmit;