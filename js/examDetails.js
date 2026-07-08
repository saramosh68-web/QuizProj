import { ExamService } from "./services/ExamService.js";

const CURRENT_USER_KEY = "currentUser";
const RESULTS_KEY = "examResults";

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
        <section class="exam-info-section">
            <h2>${currentExam.title}</h2>

            <p><strong>ID:</strong> ${currentExam.id}</p>
            <p><strong>Exam Name:</strong> ${currentExam.title}</p>
            <p><strong>Description:</strong> ${currentExam.description || "No description"}</p>
            <p><strong>Category:</strong> ${currentExam.category || "No category"}</p>
            <p><strong>Exam Code:</strong> ${currentExam.examCode || "No code"}</p>
            <p><strong>Duration:</strong> ${currentExam.duration || "No duration"} minutes</p>
            <p><strong>Teacher:</strong> ${currentExam.teacherName}</p>
            <p><strong>Questions:</strong> ${currentExam.questions.length}</p>
            <p><strong>Created:</strong> ${new Date(currentExam.createdAt).toLocaleString()}</p>

            <button id="edit-exam-btn" class="action-button edit">
                Edit Exam
            </button>
        </section>

        <hr>

        <section>
            <h3>Questions</h3>
            <div id="questions-container"></div>
        </section>

        <hr>

        <section>
            <h3>Exam Results</h3>
            <div id="exam-results-container"></div>
        </section>
    `;

    renderQuestionsView();
    renderExamResults();

    const editButton = document.getElementById("edit-exam-btn");

    editButton.addEventListener("click", function() {
        renderEditMode();
    });
}

function renderQuestionsView() {
    const questionsContainer = document.getElementById("questions-container");

    questionsContainer.innerHTML = "";

    if (currentExam.questions.length === 0) {
        questionsContainer.innerHTML = `
            <p class="empty-message">This exam has no questions.</p>
        `;
        return;
    }

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

        questionsContainer.appendChild(questionDiv);
    });
}

function renderExamResults() {
    const resultsContainer = document.getElementById("exam-results-container");

    const data = localStorage.getItem(RESULTS_KEY);

    if (!data) {
        resultsContainer.innerHTML = `
            <p class="empty-message">No results for this exam yet.</p>
        `;
        return;
    }

    const allResults = JSON.parse(data);

    const examResults = allResults.filter(function(result) {
        return String(result.examId) === String(currentExam.id);
    });

    if (examResults.length === 0) {
        resultsContainer.innerHTML = `
            <p class="empty-message">No results for this exam yet.</p>
        `;
        return;
    }

    resultsContainer.innerHTML = "";

    examResults.forEach(function(result) {
        const resultDiv = document.createElement("div");
        resultDiv.className = "result-card";

        resultDiv.innerHTML = `
            <h4>${result.studentName}</h4>
            <p><strong>Score:</strong> ${result.score} / ${result.totalQuestions}</p>
            <p><strong>Grade:</strong> ${result.percent}%</p>
            <p><strong>Date:</strong> ${new Date(result.createdAt).toLocaleString()}</p>
        `;

        resultsContainer.appendChild(resultDiv);
    });
}

function renderEditMode() {
    detailsContainer.innerHTML = `
        <h2>Edit Exam</h2>

        <div class="form-group">
            <label for="edit-exam-title">Exam Name</label>
            <input
                type="text"
                id="edit-exam-title"
                value="${currentExam.title}">
        </div>

        <div class="form-group">
            <label for="edit-description">Description</label>
            <textarea id="edit-description">${currentExam.description || ""}</textarea>
        </div>

        <div class="form-group">
            <label for="edit-category">Category</label>
            <input
                type="text"
                id="edit-category"
                value="${currentExam.category || ""}">
        </div>

        <div class="form-group">
            <label for="edit-exam-code">Exam Code</label>
            <input
                type="text"
                id="edit-exam-code"
                value="${currentExam.examCode || ""}">
        </div>

        <div class="form-group">
            <label for="edit-duration">Duration in minutes</label>
            <input
                type="number"
                id="edit-duration"
                min="1"
                value="${currentExam.duration || ""}">
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

    renderQuestionsEdit();

    const saveButton = document.getElementById("save-changes-btn");
    const cancelButton = document.getElementById("cancel-edit-btn");

    saveButton.addEventListener("click", saveChanges);

    cancelButton.addEventListener("click", function() {
        renderViewMode();
    });
}

function renderQuestionsEdit() {
    const editQuestionsContainer = document.getElementById("edit-questions-container");

    editQuestionsContainer.innerHTML = "";

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
}

function saveChanges() {
    const messageBox = document.getElementById("edit-message");

    const title = document.getElementById("edit-exam-title").value.trim();
    const description = document.getElementById("edit-description").value.trim();
    const category = document.getElementById("edit-category").value.trim();
    const examCode = document.getElementById("edit-exam-code").value.trim();
    const duration = document.getElementById("edit-duration").value.trim();

    if (!title) {
        showEditError("Exam name cannot be empty.");
        return;
    }

    if (!examCode) {
        showEditError("Exam code cannot be empty.");
        return;
    }

    if (!duration || Number(duration) <= 0) {
        showEditError("Duration must be a positive number.");
        return;
    }

    currentExam.title = title;
    currentExam.description = description;
    currentExam.category = category;
    currentExam.examCode = examCode;
    currentExam.duration = duration;

    const questionTextInputs = document.querySelectorAll(".edit-question-text");

    for (const input of questionTextInputs) {
        const questionIndex = Number(input.dataset.questionIndex);
        const questionText = input.value.trim();

        if (!questionText) {
            showEditError("Question text cannot be empty.");
            return;
        }

        currentExam.questions[questionIndex].text = questionText;
    }

    const answerInputs = document.querySelectorAll(".edit-answer");

    for (const input of answerInputs) {
        const questionIndex = Number(input.dataset.questionIndex);
        const answerIndex = Number(input.dataset.answerIndex);
        const answerText = input.value.trim();

        if (!answerText) {
            showEditError("All answers must be filled.");
            return;
        }

        currentExam.questions[questionIndex].answers[answerIndex] = answerText;
    }

    const correctAnswerInputs = document.querySelectorAll(".edit-correct-answer");

    for (const input of correctAnswerInputs) {
        const questionIndex = Number(input.dataset.questionIndex);
        const correctAnswerNumber = Number(input.value);

        if (correctAnswerNumber < 1 || correctAnswerNumber > 4) {
            showEditError("Correct answer must be a number from 1 to 4.");
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

function showEditError(message) {
    const messageBox = document.getElementById("edit-message");

    messageBox.textContent = message;
    messageBox.className = "message error";
}