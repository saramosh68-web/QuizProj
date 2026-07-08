import { Exam } from "./models/Exam.js";
import { Question } from "./models/Question.js";
import { ExamService } from "./services/ExamService.js";

const CURRENT_USER_KEY = "currentUser";

const examService = new ExamService();

const examTitleInput = document.getElementById("exam-title");
const questionTextInput = document.getElementById("question-text");

const answer1Input = document.getElementById("answer-1");
const answer2Input = document.getElementById("answer-2");
const answer3Input = document.getElementById("answer-3");
const answer4Input = document.getElementById("answer-4");

const correctAnswerInput = document.getElementById("correct-answer");

const addQuestionButton = document.getElementById("add-question-btn");
const saveExamButton = document.getElementById("save-exam-btn");

const messageBox = document.getElementById("create-exam-message");
const questionsList = document.getElementById("questions-list");

const currentUserData = localStorage.getItem(CURRENT_USER_KEY);

let currentUser = null;
let currentExam = null;

if (!currentUserData) {
    window.location.href = "pageSignIn.html";
} else {
    currentUser = JSON.parse(currentUserData);

    if (currentUser.role !== "teacher") {
        window.location.href = "student.html";
    }
}

addQuestionButton.addEventListener("click", function () {
    const title = examTitleInput.value.trim();
    const questionText = questionTextInput.value.trim();

    const answers = [
        answer1Input.value.trim(),
        answer2Input.value.trim(),
        answer3Input.value.trim(),
        answer4Input.value.trim()
    ];

    const correctAnswerNumber = Number(correctAnswerInput.value);

    if (!title) {
        showMessage("Please enter exam title.", "error");
        return;
    }

    if (!questionText) {
        showMessage("Please enter question text.", "error");
        return;
    }

    if (answers.some(function(answer) {
        return answer === "";
    })) {
        showMessage("Please fill all 4 answers.", "error");
        return;
    }

    if (correctAnswerNumber < 1 || correctAnswerNumber > 4) {
        showMessage("Correct answer must be a number from 1 to 4.", "error");
        return;
    }

    if (!currentExam) {
        currentExam = new Exam(title, currentUser.id, currentUser.fullName);
    }

    const correctAnswerIndex = correctAnswerNumber - 1;

    const question = new Question(questionText, answers, correctAnswerIndex);

    currentExam.addQuestion(question);

    showMessage("Question added successfully.", "success");

    clearQuestionInputs();
    renderQuestionsPreview();
});

saveExamButton.addEventListener("click", function () {
    if (!currentExam || currentExam.getQuestionCount() === 0) {
        showMessage("Add at least one question before saving the exam.", "error");
        return;
    }

    examService.saveExam(currentExam);

    showMessage("Exam saved successfully.", "success");

    setTimeout(function () {
        window.location.href = "teacher.html";
    }, 1000);
});

function renderQuestionsPreview() {
    questionsList.innerHTML = "";

    currentExam.questions.forEach(function(question, index) {
        const questionDiv = document.createElement("div");
        questionDiv.className = "question-preview-card";

        questionDiv.innerHTML = `
            <h3>${index + 1}. ${question.text}</h3>
            <p>Answers: ${question.answers.length}</p>
            <p>Correct Answer: ${question.correctAnswerIndex + 1}</p>
        `;

        questionsList.appendChild(questionDiv);
    });
}

function clearQuestionInputs() {
    questionTextInput.value = "";
    answer1Input.value = "";
    answer2Input.value = "";
    answer3Input.value = "";
    answer4Input.value = "";
    correctAnswerInput.value = "";
}

function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
}