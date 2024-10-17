// Función para obtener transacciones desde Local Storage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}

// Función para guardar transacciones en Local Storage
function saveTransaction(transaction) {
    const transactions = getTransactions();
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Variable global para la instancia del gráfico
let chart;

// Función para renderizar las transacciones en la tabla
function renderTransactionTable() {
    const transactions = getTransactions();
    const tableBody = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];

    // Limpiar la tabla antes de agregar nuevas filas
    tableBody.innerHTML = '';

    transactions.forEach(transaction => {
        const row = tableBody.insertRow();

        const titleCell = row.insertCell(0);
        const amountCell = row.insertCell(1);
        const typeCell = row.insertCell(2);
        const dateCell = row.insertCell(3);
        const timeCell = row.insertCell(4);

        const transactionDate = new Date(transaction.date);

        titleCell.textContent = transaction.title;  // Mostrar el título
        amountCell.textContent = transaction.amount;
        typeCell.textContent = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1); // Capitaliza 'income' y 'expense'
        dateCell.textContent = transactionDate.toLocaleDateString(); // Fecha en formato legible
        timeCell.textContent = transactionDate.toLocaleTimeString(); // Hora en formato legible
    });
}

// Función para agregar una nueva transacción
document.getElementById('transactionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value;  // Obtener el título
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const date = new Date().toISOString(); // Almacenar la fecha y hora en formato ISO

    const transaction = { title, amount, type, date };  // Incluir el título
    saveTransaction(transaction);

    // Actualizar el gráfico y la tabla después de agregar una nueva transacción
    renderTransactionTable();
    updateChartData('month'); // Aseguramos que la gráfica se actualice, en lugar de recrearla

    // Resetear el formulario
    document.getElementById('transactionForm').reset();
    document.getElementById('type').value = 'income'; // Restablecer el tipo a 'income'
});

// Función para filtrar transacciones por día, semana o mes
function filterTransactionsByPeriod(period) {
    const transactions = getTransactions();
    const now = new Date();

    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);

        if (period === 'day') {
            return transactionDate.toDateString() === now.toDateString();
        } else if (period === 'week') {
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            return transactionDate >= startOfWeek && transactionDate <= new Date();
        } else if (period === 'month') {
            return transactionDate.getMonth() === new Date().getMonth() && transactionDate.getFullYear() === new Date().getFullYear();
        }

        return true; // Si no se especifica un período, devuelve todas las transacciones
    });
}

// Función para cargar y actualizar los datos del gráfico según el período seleccionado
function updateChartData(period) {
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

    // Si el gráfico ya existe, actualizamos los datos
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

// Cargar los datos iniciales del mes y la tabla de transacciones al cargar la página
window.onload = function () {
    updateChartData('month');
    renderTransactionTable();
};
