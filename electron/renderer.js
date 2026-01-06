//Variable Form rednering and submission
const buttons = Array.from(document.getElementsByClassName('section-button'));
const formContainer = document.getElementById('form-variable-box');

// Event listeners for simulation section buttons
buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
        const simulation = btn.id; // section button id corresponds to simulation
        const data = await window.electronAPI.loadVariables(simulation);
        if (data.error) {
            formContainer.innerHTML = `<p>Error loading variables: ${data.error}</p>`;
            return;
        }
        renderForm(data);
    });
});

// Function to render the variables form based on selected simulation
function renderForm(data) {
    const { simulation, variables } = data;
    formContainer.innerHTML = `
      <form id="simulationForm">
        ${variables.map(
            (v) => `
            <div class="form-item">
                <label for="$v.name">${v.label}:</label>
                <input type="${v.type}" id="${v.name}" name="${v.name}" value="${v.default ?? ''}" required />
            </div>
            `
        ).join('')}
        <br><br>
      </form>
      <button type="submit" class="form-submit-button">SUBMIT</button>
    `;

    const form = document.getElementById('simulationForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {};
        variables.forEach((v) => {
            formData[v.name] = parseFloat(form[v.name].value);
        });
        console.log("User-entered data:", formData);
        //send data to main process to process into graphics
        window.electronAPI.submitForm(formData);
    })
}

// Event listener for form submission button 
// const submitButton = document.querySelector('.form-submit-button');
// submitButton.addEventListener('click', () => {
//     const form = document.getElementById('simulationForm');
//     const simulationType = form ? form.dataset.simulation : null;
//     renderSimulation(simulationType);
// });

// Function to render simulation graphics
function renderSimulation(simulationType) {

  console.log
}