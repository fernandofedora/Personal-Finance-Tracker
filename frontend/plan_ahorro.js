let savingGoal = 0;
let totalSaved = 0;
let contributions = []; // Almacena el historial de contribuciones

// Cargar el plan de ahorro desde localStorage cuando la página se cargue
window.addEventListener('DOMContentLoaded', (event) => {
    loadSavingsPlan();
});

// Función para inicializar el plan de ahorro
document.getElementById('planAhorroForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const savingName = document.getElementById('savingName').value;
    savingGoal = parseFloat(document.getElementById('savingGoal').value);
    totalSaved = 0;
    contributions = [];

    // Guardar el plan de ahorro en localStorage
    saveSavingsPlan(savingName, savingGoal, totalSaved, contributions);

    // Actualizar el texto del plan y mostrar la sección de contribuciones
    updatePlanDetails(savingName, savingGoal);

    // Mostrar la sección de contribuciones
    document.getElementById('contributionSection').style.display = 'block';

    // Reiniciar barra de progreso y tabla
    updateProgressBar();
    renderContributionsTable();
});

// Función para agregar una contribución
function addContribution() {
    const contributionAmount = parseFloat(document.getElementById('contributionAmount').value);

    if (contributionAmount > 0) {
        const now = new Date();
        const contribution = {
            amount: contributionAmount,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        };

        contributions.push(contribution);
        totalSaved += contributionAmount;

        // Asegurarse que no exceda la meta de ahorro
        if (totalSaved >= savingGoal) {
            totalSaved = savingGoal;
            showSuccessMessage();
        }

        // Guardar la contribución actualizada en localStorage
        saveSavingsPlan(null, savingGoal, totalSaved, contributions);

        // Actualizar barra de progreso y tabla
        updateProgressBar();
        renderContributionsTable();

        // Limpiar el campo de contribución
        document.getElementById('contributionAmount').value = '';
    } else {
        alert('Por favor, ingresa una cantidad válida para contribuir.');
    }
}

// Función para eliminar una contribución
function deleteContribution(index) {
    totalSaved -= contributions[index].amount;
    contributions.splice(index, 1);

    // Guardar cambios en localStorage y actualizar la interfaz
    saveSavingsPlan(null, savingGoal, totalSaved, contributions);
    updateProgressBar();
    renderContributionsTable();
}

// Función para actualizar una contribución
function updateContribution(index) {
    const newAmount = parseFloat(prompt('Ingrese la nueva cantidad para esta contribución:', contributions[index].amount));

    if (newAmount > 0) {
        totalSaved -= contributions[index].amount; // Restar la cantidad actual
        totalSaved += newAmount; // Agregar la nueva cantidad

        contributions[index].amount = newAmount;

        // Asegurarse de que no exceda la meta
        if (totalSaved >= savingGoal) {
            totalSaved = savingGoal;
            showSuccessMessage();
        }

        // Guardar los cambios en localStorage y actualizar la interfaz
        saveSavingsPlan(null, savingGoal, totalSaved, contributions);
        updateProgressBar();
        renderContributionsTable();
    } else {
        alert('Por favor, ingrese una cantidad válida.');
    }
}

// Función para actualizar la barra de progreso
function updateProgressBar() {
    const progressPercentage = (totalSaved / savingGoal) * 100;
    const progressBar = document.getElementById('progressBar');

    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
    progressBar.innerText = `${progressPercentage.toFixed(2)}%`;

    if (progressPercentage >= 100) {
        progressBar.innerText = '100%';
    }
}

// Función para mostrar el mensaje de éxito al alcanzar la meta
function showSuccessMessage() {
    document.getElementById('successMessage').style.display = 'block';
}

// Función para guardar el plan de ahorro en localStorage
function saveSavingsPlan(savingName, savingGoal, totalSaved, contributions) {
    const plan = {
        name: savingName ? savingName : localStorage.getItem('savingName'),
        goal: savingGoal,
        saved: totalSaved,
        contributions: contributions
    };
    localStorage.setItem('savingPlan', JSON.stringify(plan));
}

// Función para cargar el plan de ahorro desde localStorage
function loadSavingsPlan() {
    const savedPlan = localStorage.getItem('savingPlan');

    if (savedPlan) {
        const plan = JSON.parse(savedPlan);
        savingGoal = plan.goal;
        totalSaved = plan.saved;
        contributions = plan.contributions;

        updatePlanDetails(plan.name, plan.goal);
        updateProgressBar();
        renderContributionsTable();

        document.getElementById('contributionSection').style.display = 'block';

        if (totalSaved >= savingGoal) {
            showSuccessMessage();
        }
    }
}

// Función para actualizar los detalles del plan en la interfaz
function updatePlanDetails(savingName, savingGoal) {
    document.getElementById('planName').innerText = `Plan de Ahorro: ${savingName}`;
    document.getElementById('planGoalText').innerText = `Meta Total: $${savingGoal.toFixed(2)}`;
}

//Función para renderizar la tabla de contribuciones
function renderContributionsTable() {
    const tableBody = document.getElementById('contributionTableBody');
    tableBody.innerHTML = ''; // Limpiar la tabla

    contributions.forEach((contribution, index) => {
        const row = document.createElement('tr');

        // Formatear la cantidad como dólares ($)
        const formattedAmount = contribution.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

        row.innerHTML = `
            <td>${formattedAmount}</td>
            <td>${contribution.date}</td>
            <td>${contribution.time}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="updateContribution(${index})">Actualizar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteContribution(${index})">Eliminar</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

