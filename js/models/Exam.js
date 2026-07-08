export class Exam {
    constructor(title, teacherId, teacherName) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.questions = [];
        this.createdAt = new Date().toISOString();
    }

    addQuestion(question) {
        this.questions.push(question);
    }

    getQuestionCount() {
        return this.questions.length;
    }
}