const CURRENT_USER_KEY = "currentUser";
const RESULTS_KEY = "examResults";

const studentNameElement = document.getElementById("student-name");
const logoutButton = document.getElementById("logout-btn");

const completedCountElement = document.getElementById("completed-count");
const averageGradeElement = document.getElementById("average-grade");
const studentResultsList = document.getElementById("student-results-list");

const currentUserData = localStorage.getItem(CURRENT_USER_KEY);

let currentUser = null;

if (!currentUserData) {
    window.location.href = "pageSignIn.html";
} else {
    currentUser = JSON.parse(currentUserData);

    if (currentUser.role !== "student") {
        window.location.href = "teacher.html";
    } else {
        studentNameElement.textContent = `Welcome, ${currentUser.fullName}`;
        renderStudentResults(currentUser);
    }
}

function getAllResults() {
    const data = localStorage.getItem(RESULTS_KEY);

    if (!data) {
        return [];
    }

    return JSON.parse(data);
}

function renderStudentResults(currentUser) {
    const allResults = getAllResults();

    const studentResults = allResults.filter(function(result) {
        return String(result.studentId) === String(currentUser.id);
    });

    completedCountElement.textContent = studentResults.length;

    if (studentResults.length === 0) {
        averageGradeElement.textContent = "0%";

        studentResultsList.innerHTML = `
            <p class="empty-message">
                You have not completed any exams yet.
            </p>
        `;

        return;
    }

    const totalPercent = studentResults.reduce(function(sum, result) {
        return sum + result.percent;
    }, 0);

    const average = Math.round(totalPercent / studentResults.length);

    averageGradeElement.textContent = `${average}%`;

    studentResultsList.innerHTML = "";

    studentResults.forEach(function(result) {
        const resultCard = document.createElement("div");
        resultCard.className = "result-card";

        resultCard.innerHTML = `
            <h3>${result.examTitle}</h3>

            <p><strong>Score:</strong> ${result.score} / ${result.totalQuestions}</p>
            <p><strong>Grade:</strong> ${result.percent}%</p>
            <p><strong>Date:</strong> ${new Date(result.createdAt).toLocaleString()}</p>
        `;

        studentResultsList.appendChild(resultCard);
    });
}

logoutButton.addEventListener("click", function() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = "mainPage.html";
});