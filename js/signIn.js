import { signIn } from "./authService.js";

const signinForm = document.getElementById("signin-form");
const emailInput = document.getElementById("signin-email");
const passwordInput = document.getElementById("signin-password");
const messageBox = document.getElementById("signin-message");

signinForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const result = signIn(email, password);

    if (!result.success) {
        messageBox.textContent = result.message;
        messageBox.className = "message error";
        return;
    }

    messageBox.textContent = result.message;
    messageBox.className = "message success";

    setTimeout(function() {
        if (result.user.role === "teacher") {
            window.location.href = "teacher.html";
        } else {
            window.location.href = "student.html";
        }
    }, 1000);
});