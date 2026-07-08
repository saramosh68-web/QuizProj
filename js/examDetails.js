import { ExamService } from "./services/ExamService.js";

const CURRENT_USER_KEY = "currentUser";

const examService = new ExamService();

const detailsContainer = document.getElementById("exam-details-container");

const currentUserData = localStorage.getItem(CURRENT_USER_KEY);

let currentUser = null;
let currentExam = null;

if (!currentUserData) {
    window.location.href = "pageSignIn.html";
} else {
    currentUser = JSON.parse(currentUserData);

    if (currentUser.role !== "teacher") {
        window.location.href = "student.html";
    } else {
        loadExamDetails();
    }
}

function loadExamDetails() {
    const params = new URLSearchParams(window.location.search);
    const examId = params.get("id");

    if (!examId) {
        detailsContainer.innerHTML = `
            <p class="error-message">No exam selected.</p>
        `;
        return;
    }

    const exam = examService.getExamById(examId);

    if (!exam) {
        detailsContainer.innerHTML = `
            <p class="error-message">Exam not found.</p>
        `;
        return;
    }

    if (String(exam.teacherId) !== String(currentUser.id)) {
        detailsContainer.innerHTML = `
            <p class="error-message">You are not allowed to view this exam.</p>
        `;
        return;
    }

    currentExam = exam;
    renderViewMode();
}

function renderViewMode() {
    detailsContainer.innerHTML = `
        <h2>${currentExam.title}</h2>

        <p><strong>Teacher:</strong> ${currentExam.teacherName}</p>
        <p><strong>Questions:</strong> ${currentExam.questions.length}</p>
        <p><strong>Created:</strong> ${new Date(currentExam.createdAt).toLocaleString()}</p>

        <button id="edit-exam-btn" class="action-button edit">
            Edit Exam
        </button>

        <hr>

        <h3>Questions</h3>
    `;

    currentExam.questions.forEach(function(question, index) {
        const questionDiv = document.createElement("div");
        questionDiv.className = "question-details-card";

        questionDiv.innerHTML = `
            <h4>${index + 1}. ${question.text}</h4>

            <ol>
                ${question.answers.map(function(answer, answerIndex) {
                    const correctClass =
                        answerIndex === question.correctAnswerIndex ? "correct-answer" : "";

                    return `
                        <li class="${correctClass}">
                            ${answer}
                        </li>
                    `;
                }).join("")}
            </ol>
        `;

        detailsContainer.appendChild(questionDiv);
    });

    const editButton = document.getElementById("edit-exam-btn");

    editButton.addEventListener("click", function() {
        renderEditMode();
    });
}

function renderEditMode() {
    detailsContainer.innerHTML = `
        <h2>Edit Exam</h2>

        <div class="form-group">
            <label for="edit-exam-title">Exam Title</label>
            <input
                type="text"
                id="edit-exam-title"
                value="${currentExam.title}">
        </div>

        <hr>

        <h3>Edit Questions</h3>

        <div id="edit-questions-container"></div>

        <p id="edit-message" class="message"></p>

        <div class="edit-actions">
            <button id="save-changes-btn" class="action-button save">
                Save Changes
            </button>

            <button id="cancel-edit-btn" class="action-button cancel">
                Cancel
            </button>
        </div>
    `;

    const editQuestionsContainer = document.getElementById("edit-questions-container");

    currentExam.questions.forEach(function(question, questionIndex) {
        const questionDiv = document.createElement("div");
        questionDiv.className = "question-edit-card";

        questionDiv.innerHTML = `
            <h4>Question ${questionIndex + 1}</h4>

            <div class="form-group">
                <label>Question Text</label>
                <input
                    type="text"
                    class="edit-question-text"
                    data-question-index="${questionIndex}"
                    value="${question.text}">
            </div>

            ${question.answers.map(function(answer, answerIndex) {
                return `
                    <div class="form-group">
                        <label>Answer ${answerIndex + 1}</label>
                        <input
                            type="text"
                            class="edit-answer"
                            data-question-index="${questionIndex}"
                            data-answer-index="${answerIndex}"
                            value="${answer}">
                    </div>
                `;
            }).join("")}

            <div class="form-group">
                <label>Correct Answer Number</label>
                <input
                    type="number"
                    min="1"
                    max="4"
                    class="edit-correct-answer"
                    data-question-index="${questionIndex}"
                    value="${question.correctAnswerIndex + 1}">
            </div>
        `;

        editQuestionsContainer.appendChild(questionDiv);
    });

    const saveButton = document.getElementById("save-changes-btn");
    const cancelButton = document.getElementById("cancel-edit-btn");

    saveButton.addEventListener("click", saveChanges);

    cancelButton.addEventListener("click", function() {
        renderViewMode();
    });
}

function saveChanges() {
    const titleInput = document.getElementById("edit-exam-title");
    const messageBox = document.getElementById("edit-message");

    const newTitle = titleInput.value.trim();

    if (!newTitle) {
        messageBox.textContent = "Exam title cannot be empty.";
        messageBox.className = "message error";
        return;
    }

    currentExam.title = newTitle;

    const questionTextInputs = document.querySelectorAll(".edit-question-text");

    for (const input of questionTextInputs) {
        const questionIndex = Number(input.dataset.questionIndex);
        const newQuestionText = input.value.trim();

        if (!newQuestionText) {
            messageBox.textContent = "Question text cannot be empty.";
            messageBox.className = "message error";
            return;
        }

        currentExam.questions[questionIndex].text = newQuestionText;
    }

    const answerInputs = document.querySelectorAll(".edit-answer");

    for (const input of answerInputs) {
        const questionIndex = Number(input.dataset.questionIndex);
        const answerIndex = Number(input.dataset.answerIndex);
        const newAnswerText = input.value.trim();

        if (!newAnswerText) {
            messageBox.textContent = "All answers must be filled.";
            messageBox.className = "message error";
            return;
        }

        currentExam.questions[questionIndex].answers[answerIndex] = newAnswerText;
    }

    const correctAnswerInputs = document.querySelectorAll(".edit-correct-answer");

    for (const input of correctAnswerInputs) {
        const questionIndex = Number(input.dataset.questionIndex);
        const correctAnswerNumber = Number(input.value);

        if (correctAnswerNumber < 1 || correctAnswerNumber > 4) {
            messageBox.textContent = "Correct answer must be between 1 and 4.";
            messageBox.className = "message error";
            return;
        }

        currentExam.questions[questionIndex].correctAnswerIndex = correctAnswerNumber - 1;
    }

    examService.updateExam(currentExam);

    messageBox.textContent = "Exam updated successfully.";
    messageBox.className = "message success";

    setTimeout(function() {
        renderViewMode();
    }, 1000);
}