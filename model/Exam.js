export default class Exam {
    constructor(id, semesterID, subject, startLesson, lessonNum, date, room, studentNum, form) {
        this.id = id;
        this.semesterID=semesterID;
        this.subject = subject;
        this.startLesson = startLesson;
        this.lessonNum = lessonNum;
        this.date = date;
        this.room = room;
        this.studentNum = studentNum;
        this.form = form;
    }

}