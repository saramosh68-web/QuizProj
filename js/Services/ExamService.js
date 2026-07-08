import { Exam } from "../models/Exam.js";
import { Question } from "../models/Question.js";

export class ExamService {
    constructor() {
        this.storageKey = "exams";
    }

    getAllExams() {
        const data = localStorage.getItem(this.storageKey);

        if (!data) {
            return [];
        }

        const plainExams = JSON.parse(data);

        return plainExams.map(function(examData) {
            const exam = new Exam(
                examData.title,
                examData.teacherId,
                examData.teacherName,
                examData.description || "",
                examData.category || "",
                examData.examCode || "",
                examData.duration || ""
            );

            exam.id = examData.id;
            exam.createdAt = examData.createdAt;

            exam.questions = examData.questions.map(function(questionData) {
                const question = new Question(
                    questionData.text,
                    questionData.answers,
                    questionData.correctAnswerIndex
                );

                question.id = questionData.id;

                return question;
            });

            return exam;
        });
    }

    saveExam(exam) {
        const exams = this.getAllExams();

        exams.push(exam);

        localStorage.setItem(this.storageKey, JSON.stringify(exams));
    }

    updateExam(updatedExam) {
        const exams = this.getAllExams();

        const updatedExams = exams.map(function(exam) {
            if (exam.id === updatedExam.id) {
                return updatedExam;
            }

            return exam;
        });

        localStorage.setItem(this.storageKey, JSON.stringify(updatedExams));
    }

    deleteExam(examId) {
        const exams = this.getAllExams();

        const filteredExams = exams.filter(function(exam) {
            return exam.id !== examId;
        });

        localStorage.setItem(this.storageKey, JSON.stringify(filteredExams));
    }

    getExamById(examId) {
        const exams = this.getAllExams();

        return exams.find(function(exam) {
            return exam.id === examId;
        });
    }

    clearAllExams() {
        localStorage.removeItem(this.storageKey);
    }
}