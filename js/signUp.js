import { signUp } from "./authService.js";

const signupForm = document.getElementById("signup-form");
const fullNameInput = document.getElementById("signup-name");
const emailInput = document.getElementById("signup-email");
const roleInput = document.getElementById("signup-role");
const passwordInput = document.getElementById("signup-password");
const confirmPasswordInput = document.getElementById("signup-confirm-password");
const messageBox = document.getElementById("signup-message");

signupForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        messageBox.textContent = "Passwords do not match";
        messageBox.className = "message error";
        return;
    }

    const result = signUp(fullName, email, password, role);

    if (!result.success) {
        messageBox.textContent = result.message;
        messageBox.className = "message error";
        return;
    }

    messageBox.textContent = result.message;
    messageBox.className = "message success";

    signupForm.reset();

    setTimeout(function() {
        window.location.href = "pageSignIn.html";
    }, 1000);
});