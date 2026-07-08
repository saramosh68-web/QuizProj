import { ExamService } from "./services/ExamService.js";

const CURRENT_USER_KEY = "currentUser";

const teacherNameElement = document.getElementById("teacher-name");
const logoutButton = document.getElementById("logout-btn");
const teacherExamList = document.getElementById("teacher-exam-list");

const examService = new ExamService();

const currentUserData = localStorage.getItem(CURRENT_USER_KEY);

if (!currentUserData) {
    window.location.href = "pageSignIn.html";
} else {
    const currentUser = JSON.parse(currentUserData);

    if (currentUser.role !== "teacher") {
        window.location.href = "student.html";
    } else {
        teacherNameElement.textContent = `Welcome, ${currentUser.fullName}`;
        renderTeacherExams(currentUser);
    }
}

function renderTeacherExams(currentUser) {
    const allExams = examService.getAllExams();

    const teacherExams = allExams.filter(function(exam) {
        return exam.teacherId === currentUser.id;
    });

    teacherExamList.innerHTML = "";

    if (teacherExams.length === 0) {
        teacherExamList.innerHTML = `
            <p class="empty-message">You have not created any exams yet.</p>
        `;
        return;
    }

    teacherExams.forEach(function(exam) {
        const examCard = document.createElement("div");
        examCard.className = "exam-card";

        examCard.innerHTML = `
            <h3>${exam.title}</h3>

            <p>Questions: ${exam.questions.length}</p>

            <p>Created: ${new Date(exam.createdAt).toLocaleString()}</p>

            <div class="exam-actions">
                <a href="examDetails.html?id=${exam.id}" class="small-button view">
                    View Details
                </a>

                <button class="small-button delete" data-id="${exam.id}">
                    Delete
                </button>
            </div>
        `;

        teacherExamList.appendChild(examCard);
    });
}