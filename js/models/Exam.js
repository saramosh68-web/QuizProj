export class Exam {
    constructor(
        title,
        teacherId,
        teacherName,
        description = "",
        category = "",
        examCode = "",
        duration = ""
    ) {
        this.id = crypto.randomUUID();

        this.title = title;
        this.description = description;
        this.category = category;
        this.examCode = examCode;
        this.duration = duration;

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