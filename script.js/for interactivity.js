document.addEventListener("DOMContentLoaded", function() {
    const startBtn = document.getElementById("startConsultation");
    const optionsDiv = document.getElementById("consultationOptions");
    const consultDoctorBtn = document.getElementById("consultDoctor");
    const bookAppointmentBtn = document.getElementById("bookAppointment");

    // Show consultation options when "Start Consultation" is clicked
    startBtn.addEventListener("click", function() {
        optionsDiv.classList.remove("d-none");
    });

    // Function when "Consult Doctor Directly" is clicked
    consultDoctorBtn.addEventListener("click", function() {
        alert("Redirecting to a live consultation with a doctor...");
        // Add redirection or chat function here
        // window.location.href = "consultation.html";
    });

    // Function when "Take an Appointment" is clicked
    bookAppointmentBtn.addEventListener("click", function() {
        alert("Redirecting to appointment booking page...");
        // Add redirection to booking page
        // window.location.href = "appointment.html";
    });

    // Chatbot Functionality
    document.getElementById("send-btn").addEventListener("click", function() {
        let userInput = document.getElementById("user-input").value;
        if (userInput.trim() === "") return;

        let chatBox = document.getElementById("chat-messages");

        // Add user message
        let userMsg = document.createElement("p");
        userMsg.innerHTML = "<strong>You:</strong> " + userInput;
        chatBox.appendChild(userMsg);

        // Simulated AI response
        let botMsg = document.createElement("p");
        botMsg.innerHTML = "<strong>AI:</strong> Analyzing symptoms...";
        chatBox.appendChild(botMsg);

        // Clear input field
        document.getElementById("user-input").value = "";

        // Simulated response delay
        setTimeout(() => {
            botMsg.innerHTML = "<strong>AI:</strong> Based on your symptoms, please consult a doctor.";
        }, 2000);
    });
});

// services code

function viewPrescriptions() {
    alert('Fetching prescriptions...');
    // Implement prescription management functionality here
}

function viewRecords() {
    alert('Accessing medical records...');
    // Implement medical records access functionality here
}

function orderMedicines() {
    alert('Redirecting to e-pharmacy...');
    // Implement e-pharmacy functionality here
}

function bookLabTest() {
    alert('Booking lab test...');
    // Implement lab test booking functionality here
}