let savingGoal = 0;
let totalSaved = 0;
let contributions = []; // Almacena el historial de contribuciones
let editingIndex = null; // Variable global para rastrear la contribución en edición
let savingGoalName = ''; // Variable global para el nombre del plan de ahorro

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

    // Resetear el botón "Añadir Contribución" a su estado original
    document.getElementById('addContributionButton').innerText = 'Añadir Contribución';
    document.getElementById('addContributionButton').onclick = function() { addContribution(); };
});

// Función para agregar una contribución
function addContribution() {
    if (editingIndex === null) { // Asegurarse de que no esté en modo edición
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
    } else {
        alert("Finalice la edición actual antes de agregar una nueva contribución.");
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

// Función para preparar la edición de una contribución
function prepareUpdateContribution(index) {
    editingIndex = index; // Establecer el índice de la contribución en edición
    const contributionAmountInput = document.getElementById('contributionAmount');
    contributionAmountInput.value = contributions[index].amount; // Asignar el valor actual al input
    document.getElementById('addContributionButton').innerText = 'Actualizar'; // Cambiar el texto del botón
    document.getElementById('addContributionButton').onclick = function() { updateContributionFromInput(); }; // Cambiar la función del botón
}

// Función para actualizar una contribución desde el input
function updateContributionFromInput() {
    if (editingIndex!== null) {
        const newAmount = parseFloat(document.getElementById('contributionAmount').value);
        if (newAmount > 0) {
            totalSaved -= contributions[editingIndex].amount; // Restar la cantidad actual
            totalSaved += newAmount; // Agregar la nueva cantidad
            contributions[editingIndex].amount = newAmount;

            // Asegurarse de que no exceda la meta
            if (totalSaved >= savingGoal) {
                totalSaved = savingGoal;
                showSuccessMessage();
            }

            // Guardar los cambios en localStorage y actualizar la interfaz
            saveSavingsPlan(null, savingGoal, totalSaved, contributions);
            updateProgressBar();
            renderContributionsTable();

            // Resetear el botón y el input
            document.getElementById('addContributionButton').innerText = 'Añadir Contribución';
            document.getElementById('addContributionButton').onclick = function() { addContribution(); };
            document.getElementById('contributionAmount').value = '';
            editingIndex = null;
        } else {
            alert('Por favor, ingrese una cantidad válida.');
        }
    }
}

// Función para preparar la actualización del plan de ahorro
function prepareUpdatePlan() {
    const planNameInput = document.getElementById('updateSavingName');
    const planGoalInput = document.getElementById('updateSavingGoal');
    
    // Rellenar los inputs con los valores actuales
    planNameInput.value = savingGoalName;
    planGoalInput.value = savingGoal;
    
    // Mostrar el modal
    const updatePlanModal = new bootstrap.Modal(document.getElementById('updatePlanModal'));
    updatePlanModal.show();
}

// Función para actualizar el plan de ahorro
function updatePlan() {
    const newPlanName = document.getElementById('updateSavingName').value;
    const newPlanGoal = parseFloat(document.getElementById('updateSavingGoal').value);

    if (newPlanName && newPlanGoal > 0) {
        // Actualizar el plan de ahorro en localStorage
        saveSavingsPlan(newPlanName, newPlanGoal, totalSaved, contributions);

        // Actualizar la interfaz
        updatePlanDetails(newPlanName, newPlanGoal);
        updateProgressBar(); // En caso de que la meta haya cambiado, actualizar la barra de progreso

        // Ocultar el modal
        const updatePlanModal = bootstrap.Modal.getInstance(document.getElementById('updatePlanModal'));
        updatePlanModal.hide();
    } else {
        alert('Por favor, ingrese un nombre de plan válido y una meta total mayor a cero.');
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
        name: savingName || savingGoalName, // Usa el nombre existente si no se pasa uno nuevo
        goal: savingGoal !== undefined ? savingGoal : savingGoal, // Usa el objetivo existente si no se pasa uno nuevo
        saved: totalSaved !== undefined ? totalSaved : totalSaved, // Usa el total guardado existente si no se pasa uno nuevo
        contributions: contributions || contributions
    };
    localStorage.setItem('savingPlan', JSON.stringify(plan));

    // Actualizar las variables globales
    savingGoalName = plan.name;
    savingGoal = plan.goal;
    totalSaved = plan.saved;
    contributions = plan.contributions;
}

// Función para cargar el plan de ahorro desde localStorage
function loadSavingsPlan() {
    const savedPlan = localStorage.getItem('savingPlan');

    if (savedPlan) {
        const plan = JSON.parse(savedPlan);
        savingGoal = plan.goal;
        totalSaved = plan.saved;
        contributions = plan.contributions;
        savingGoalName = plan.name;

        updatePlanDetails(savingGoalName, savingGoal);
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
                <button class="btn btn-warning btn-sm" onclick="prepareUpdateContribution(${index})">Actualizar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteContribution(${index})">Eliminar</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}