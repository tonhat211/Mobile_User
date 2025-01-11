export default class SubjectClass {
    constructor(id, team, classID, subject, teacher, startLesson, lessonNum, day, room, studentNum, startDate, endDate,remainingQty) {
        this.id = id;
        this.team = team;
        this.classID = classID;
        this.subject = subject;
        this.teacher = teacher;
        this.startLesson = startLesson;
        this.lessonNum = lessonNum;
        this.day = day;
        this.room = room;
        this.studentNum = studentNum;
        this.startDate = startDate;
        this.endDate = endDate;
        this.remainingQty=remainingQty;
    }

}