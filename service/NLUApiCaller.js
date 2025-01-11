import AsyncStorage from '@react-native-async-storage/async-storage';
import Student from '../model/Student';
import Semester from '../model/Semester';
import Subject from '../model/Subject';
import Teacher from '../model/Teacher';
import Exam from '../model/Exam';
import Grade from '../model/Grade';
import ScoreBoard from '../model/ScoreBoard';
import Notification from '../model/Notification';
import SubjectClass from '../model/SubjectClass';
import ResultRegister from '../model/ResultRegister';
import config from '../config.json';
import Registration from '../model/Registration';
import SubjectScore from '../model/SubjectScore';
import SemesterScore from '../model/SemesterScore';
import TotalScore from '../model/TotalScore';
import InitialProgram from '../model/InitialProgram';
import LearningFee from '../model/LearningFee';
import SemesterLearningFee from '../model/SemesterLearningFee';
import UserInfo from '../model/UserInfo';

// async function setLoginData(username, password) {
//     try {
//         await AsyncStorage.setItem('username', username);
//         await AsyncStorage.setItem('password', password);
//         console.log('Login data saved');
//     } catch (error) {
//         console.error('Error saving data to AsyncStorage', error);
//     }
// }
// setLoginData('tominhat', '1234');

export async function LoginDefault(){
    const username = await AsyncStorage.getItem('username');
    const password = await AsyncStorage.getItem('password');
    const student = await LoginNLU(username, password);
    return student;
}

//Login to NLU API
//return a student object or null if error
export async function LoginNLU(id, password) {
    console.log("login nlu");
    const grant_type = "student";
    const urlString = `${config.api_url}/api/v1/auth/login`;
    // const params = `username=${username}&password=${password}&grant_type=${grant_type}`;
    // const params = `username=tominhat&password=1234&grant_type=student`;
    console.log("url: " + urlString);
    const params = {
        "id": id,
        "password": password,
        grant_type: 'student'
    };
    // console.log("params: " + JSON.stringify(params));

    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (response.ok) {
        console.log("response ok");

        const responseData = await response.json();
        console.log(responseData);
        const token = responseData.token;
        const id = responseData.id;
        const name = responseData.name;
        const student = new Student(id, name, token);
        
        const studentJson = JSON.stringify(student);
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("student", studentJson);
        await AsyncStorage.setItem("userID", JSON.stringify(id));
        // AsyncStorage.setItem("name", name);
        // AsyncStorage.setItem("password", password);

        return student;
    }
    console.log("response null");

    return null;
}

//Get list of semester
//return a list of semester or null if error
export async function getSemesters() {
    console.log("Getsemester");
    const urlString = `${config.api_url}/api/v1/schedule/semesters`;
    const token = await AsyncStorage.getItem('token');
    const params = "{\"filter\":{\"is_tieng_anh\":null},\"additional\":{\"paging\":{\"limit\":100,\"page\":1},\"ordering\":[{\"name\":\"hoc_ky\",\"order_type\":1}]}}";
    const response = await fetch(urlString, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        // body: params,
    });


    if (response.ok) {
        const res = [];
        const responseData = await response.json();
        const listSemester = responseData;
        // listSemester.sort((a, b) => b.id - a.id); // Sắp xếp theo id giảm dần

        for (let i = 0; i < listSemester.length; i++) {
            const item = listSemester[i];
            const id = item.id; 
            const name = item.name; 
            const startDate = new Date(item.startDate);  
            const endDate = new Date(item.endDate);  

            const semester = new Semester(id, name, startDate, endDate);
            res.push(semester);
        }
        console.log("semester ok: length: " + res.length);

        return res;
    }
    console.log("Getsemester response: not ok");

    return null;
}

//Get list of subject in a semester
//return a list of subject in a semester or null if error
export async function getSchedule(semesterID) {
    console.log("getScheduleApi");
    const urlString = `${config.api_url}/api/v1/schedule/subjectclasses`;
    const token = await AsyncStorage.getItem('token');
    const userID = await AsyncStorage.getItem('userID');
    const params = JSON.stringify({
      semesterID: semesterID,
      loai_doi_tuong: 1,
      id_du_lieu: null,
      userID: userID
    });
    try {
      const response = await fetch(urlString, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: params,
      });
  
      if (response.ok) {
        console.log("getscheduleApi okk");
        const res = [];
        const responseData = await response.json();
        // console.log("response: "+ JSON.stringify(responseData, null, 2))
        if (responseData) {
          const listSubject = responseData;
           for (let i = 0; i < listSubject.length; i++) {
              const item = listSubject[i];
              const id = item.id;
              const team = item.team;
              const classID = item.classID;
              const subjectID = item.subjectID;
              const subjectName = item.subjectName;
              const teacherID = item.teacherID;
              const teacherName = item.teacherName;
              const startLesson = item.startLesson;
              const lessonNum = item.lessonNum;
              const day = item.day;
              const room = item.room;
              const studentNum = item.studentNum;
              const startDate = item.startDate;
              const endDate = item.endDate;

              const subject =  new Subject(subjectID, subjectName);
              const teacher = new Teacher (teacherID, teacherName); 
              const subjectClass = new SubjectClass(id, team, classID, subject, teacher, startLesson, lessonNum, day, room, studentNum, startDate, endDate)
              res.push(subjectClass);
    
          }
          
          return res;
      
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

//Get list of subject of a day
//return a list of subject of a day or null if error
export async function getScheduleOfDay(semesterID,day) {
console.log("getScheduleApi");
const urlString = `${config.api_url}/api/v1/schedule/subjectclasses`;
const token = await AsyncStorage.getItem('token');
const userID = await AsyncStorage.getItem('userID');
const params = JSON.stringify({
    semesterID: semesterID,
    loai_doi_tuong: 1,
    id_du_lieu: null,
    userID: userID,
    day : day
});
try {
    const response = await fetch(urlString, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    },
    body: params,
    });

    if (response.ok) {
    console.log("getscheduleApi okk");
    const res = [];
    const responseData = await response.json();
    // console.log("response: "+ JSON.stringify(responseData, null, 2))
    if (responseData) {
        const listSubject = responseData;
        for (let i = 0; i < listSubject.length; i++) {
            const item = listSubject[i];
            const id = item.id;
            const team = item.team;
            const classID = item.classID;
            const subjectID = item.subjectID;
            const subjectName = item.subjectName;
            const teacherID = item.teacherID;
            const teacherName = item.teacherName;
            const startLesson = item.startLesson;
            const lessonNum = item.lessonNum;
            const day = item.day;
            const room = item.room;
            const studentNum = item.studentNum;
            const startDate = item.startDate;
            const endDate = item.endDate;

            const subject =  new Subject(subjectID, subjectName);
            const teacher = new Teacher (teacherID, teacherName); 
            const subjectClass = new SubjectClass(id, team, classID, subject, teacher, startLesson, lessonNum, day, room, studentNum, startDate, endDate)
            res.push(subjectClass);

        }
        
        return res;
    
    } else {
        return null;
    }
    } else {
    return null;
    }
} catch (error) {
    return null;
}
}
//Get list of test day in a semester
//return a list of test day in a semester or null if error
export async function getExams(idSemester) {
    console.log("get exams api");
    const urlString = `${config.api_url}/api/v1/examschedule/schedule`;
    const token = await AsyncStorage.getItem('token');
    const userID = await AsyncStorage.getItem('userID');
    const params = JSON.stringify({
        "semesterID": idSemester,
        "userID": userID,
      });
    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: params,
    });

    if (response.ok) {
        console.log("get exams api: ok");
        const res = [];
        const responseData = await response.json();
        const listExam = responseData;
        for (let i = 0; i < listExam.length; i++) {
            const item = listExam[i];
            const subjectJson = item.subject;
            const subjectID = subjectJson.id;
            const subjectName = subjectJson.name;
            const id = item.id;
            const startLesson = item.startLesson;
            const lessonNum = item.lessonNum;
            const date = item.date;
            const room = item.room;
            const studentNum = item.studentNum;
            const form = item.form;
            const semesterID = item.semesterID;

            const subject = new Subject(subjectID,subjectName);

            const exam = new Exam(id, semesterID, subject, startLesson, lessonNum, date, room, studentNum, form) ;
            res.push(exam);
        }
        return res;
    }
    return null;
}

//Get score board for all semester
//return a list of score board or null if error
export async function getScoreBoard(semesterID) {
    console.log("getScoreBoard api: " +semesterID );

    const urlString = `${config.api_url}/api/v1/result/semester`;
    const token = await AsyncStorage.getItem('token');
    const userID = await AsyncStorage.getItem('userID');
    const params = JSON.stringify({
        "semesterID": semesterID,
        "userID": userID,
    });

    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: params,
    });

    if (response.ok) {
        console.log("getScoreBoard api: ok");
        const responseData = await response.json();
        const subjectScores = [];
        const listSubjectScore = responseData.subjectScores;
        for (let i = 0; i < listSubjectScore.length; i++) {
            const item = listSubjectScore[i];
            const subject = item.subject;
            const id = subject.id;
            const name = subject.name;
            const group = subject.group;
            const credit = subject.credit;
            const examScore = item.examScore;
            const score10 = item.score10;
            const score4 = item.score4;
            const scoreC = item.scoreC;
            const result = item.result;
            const subjectScore = new SubjectScore(id,name, group,credit,examScore, score10, score4,scoreC,result);
            subjectScores.push(subjectScore);
        }
        var semesterScore = null;
        const semesterScoreItem = responseData.semesterScore;
        if (semesterScoreItem) {
            const id = semesterScoreItem.id;
            const name = semesterScoreItem.name;
            const semesterAvg10 = semesterScoreItem.avgScore10; 
            const semesterAvg4 = semesterScoreItem.avgScore4; 
            const semesterReachedCredit = semesterScoreItem.reachedCredit; 
            semesterScore = new SemesterScore(id,name,semesterAvg10,semesterAvg4,semesterReachedCredit);
        } 
        var totalScore =null;
        const totalScoreItem = responseData.totalScore;
        if(totalScoreItem) {
            const totalAvg10 = totalScoreItem.avgScore10; 
            const totalAvg4 = totalScoreItem.avgScore4; 
            const totalReachedCredit = totalScoreItem.reachedCredit; 
            totalScore = new TotalScore(totalAvg10,totalAvg4,totalReachedCredit);
        }
       
        var semesterID = "";
        var semesterName = "";
        if(listSubjectScore.length>0) {
            semesterID = listSubjectScore[0].semester.id;
            semesterName = listSubjectScore[0].semester.name;
        }

        const scoreBoard = new ScoreBoard(semesterID,semesterName,subjectScores,semesterScore,totalScore);
        return scoreBoard;

    }
    return null;
}


export async function getInitialPrograms() {
    console.log("get initialprograms api");
    const urlString = `${config.api_url}/api/v1/schedule/initialprograms`;
    const userID = await AsyncStorage.getItem('userID');
    const token = await AsyncStorage.getItem('token');
    const params = JSON.stringify({ "userID": userID });

    try {
        const response = await fetch(urlString, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            },
            body: params,
        });

        if (response.ok) {
            console.log("get initialprograms api: ok");
            const res = new Map(); // Sử dụng Map để lưu trữ theo semesterID
            const responseData = await response.json();
            const listProgram = responseData;

            listProgram.forEach(item => {
                const subjectJson = item.subject;
                const semesterID = item.semesterID;
                const subjectID = subjectJson.id;
                const subjectName = subjectJson.name;
                const subjectGroup = subjectJson.group;
                const subjectCredit = subjectJson.credit;
                const subject = new Subject(subjectID, subjectName, subjectGroup, subjectCredit);

                if (res.has(semesterID)) {
                    // Nếu semesterID đã tồn tại trong Map, thêm môn học vào subjects
                    res.get(semesterID).subjects.push(subject);
                } else {
                    // Nếu chưa tồn tại, tạo mới InitialProgram với subjects là mảng chứa môn học
                    const program = new InitialProgram(semesterID, subject);
                    res.set(semesterID, program);
                }
            });

            // Chuyển đổi Map thành mảng để trả về kết quả
            const result = Array.from(res.values());
            // console.log("response: ", JSON.stringify(result, null, 2));
            return result;
        } else {
            console.error("API request failed with status: ", response.status);
            return null;
        }
    } catch (error) {
        console.error("Error during API call: ", error);
        return null;
    }
}

export async function getLearningFee(semesterID) {
    console.log("getLearningFee api");
    const urlString = `${config.api_url}/api/v1/learningfee/semester`;
    const userID = await AsyncStorage.getItem('userID');
    const token = await AsyncStorage.getItem('token');
    const params = JSON.stringify({ 
        "userID": userID,
        "semesterID": semesterID
    });

    try {
        const response = await fetch(urlString, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,

            },
            body: params,
        });

        if (response.ok) {
            console.log("getLearningFee api: ok");
            const res = []; // Sử dụng Map để lưu trữ theo semesterID
            const responseData = await response.json();
            const listFee = responseData;

            for (let i = 0; i < listFee.length; i++) {
                const item = listFee[i];
                const learningFeeItem = item.learningFee;
                const subjectItem = learningFeeItem.subject;
                const subjectID = subjectItem.id;
                const subjectName = subjectItem.name;
                const subjectGroup = subjectItem.group;
                const subjectCredit = subjectItem.credit;
                const priceUnit = learningFeeItem.priceUnit;
                const discountMoney = learningFeeItem.discountMoney;
                const isPay = learningFeeItem.isPay;
                const money = item.money;
                
                var isPayBoolean = true;
                if(isPay==0) isPayBoolean=false;
    
                const subject = new Subject(subjectID,subjectName,subjectGroup,subjectCredit);
                const learningFee = new LearningFee(subject,priceUnit,discountMoney,money,isPayBoolean);
                res.push(learningFee);
            }
            console.log("response: "+ JSON.stringify(res, null, 2))
            return res;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error during API call: ", error);
        return null;
    }
}

export async function getLearningFeeAll() {
    console.log("getLearningFee ALL api");
    const urlString = `${config.api_url}/api/v1/learningfee/semesters`;
    const userID = await AsyncStorage.getItem('userID');
    const token = await AsyncStorage.getItem('token');
    const params = JSON.stringify({ 
        "userID": userID
    });

    try {
        const response = await fetch(urlString, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
            },
            body: params,
        });

        if (response.ok) {
            console.log("getLearningFee ALL api: ok");
            const res = []; // Sử dụng Map để lưu trữ theo semesterID
            const responseData = await response.json();
            const listSemesterFee = responseData;

            for (let i = 0; i < listSemesterFee.length; i++) {
                const item = listSemesterFee[i];
                const semesterItem = item.semester;
                const semesterID = semesterItem.id;
                const semesterName = semesterItem.name;

                const tempMoney = item.tempMoney;
                const discountMoney = item.discountMoney;
                const money = item.money;
                const isPay = item.isPay;    
                var isPayBoolean = true;
                if(isPay==0) isPayBoolean=false;
    
                const semester = new Semester(semesterID,semesterName);
                const semesterLearningFee = new SemesterLearningFee(semester,tempMoney,discountMoney,money,isPayBoolean);
                res.push(semesterLearningFee);
            }
          

            return res;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error during API call: ", error);
        return null;
    }
}


//get list of notification
//return list of notification or null if error
export async function getNotifications() {
    console.log("getNotifications api");
    const urlString = `${config.api_url}/api/v1/notification/notifications`;
    const response = await fetch(urlString, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        // body: params,
    });

    if (response.ok) {
        console.log("getNotifications api: ok"); 
        const res = [];
        const responseData = await response.json();
        const listNotification = responseData;
        for (let i = 0; i < listNotification.length; i++) {
            const item = listNotification[i];
            const id = item.id;
            const title = item.title;
            const createAt = item.createAt;
            const subContent = item.subContent;

            const notification = new Notification(id, title, subContent,"" ,createAt);
            res.push(notification);
        }
        return res;
    }
    return null;
}

//get content of a notification by id
//return notification object with content or null if error
export async function getNotificationDetail(id) {
    console.log("getNotification detail api");
    const urlString = `${config.api_url}/api/v1/notification/notification`;
    
    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(id) 

    });

    if (response.ok) {
        console.log("getNotification detail api: ok"); 
       
        const responseData = await response.json();
        const notificationjson  = responseData;
        const id = notificationjson.id;
        console.log("ID:" + id);
        const title = notificationjson.title;
        const subContent = notificationjson.subContent;
        const content = notificationjson.content;
        const createAt = notificationjson.createAt;
        const teacherItem = notificationjson.teacher;
        const teacherID = teacherItem.id;
        const teacherName = teacherItem.name;
        console.log("teacher: " + teacherID + " " + teacherName)
        const teacher = new Teacher(teacherID,teacherName);
        console.log("teacher: " + teacher.id + " " + teacher.name)
        const notification = new Notification(id, title, subContent, content,createAt,teacher);
        console.log(notification);
        return notification;
    }
    return null;
}

//Get list of subject class in this semester
//return a list of subject class in this semester or null if error
export async function getRegisterSubjectClass(queryFilter) {
    console.log("get register api");
    const urlString =  `${config.api_url}/api/v1/register/subjectclasses`;
    const token = await AsyncStorage.getItem('token');
    const userID =await AsyncStorage.getItem("userID");
    const params = JSON.stringify({
        "userID": userID,
        "queryFilter": queryFilter
    });

    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: params,
    });

    if (response.ok) {
        console.log("get register api: ok");
        const res = [];
        const responseData = await response.json(); 
        // console.log("response: "+ JSON.stringify(responseData, null, 2))


        let subjectMap = new Map();
        const listSubject = responseData;
        for (let i = 0; i < listSubject.length; i++) {
            const item = listSubject[i];
            subjectMap.set(item.subjectID, item.subjectName);
        }

        const listSubjectClass = responseData;
        for (let i = 0; i < listSubjectClass.length; i++) {
            const item = listSubjectClass[i];
            const id = item.id;
            const studentID = item.userID;
            const createAt = item.createAt;
            const avai = item.avai;
            
            const subjectClassID = item.subjectClassID;
            const team = item.team;
            const classID = item.classID;
            const subjectID = item.subjectID;
            const subjectName = item.subjectName;
            const subjectCredit = item.subjectCredit;
            const subjectGroup = item.subjectGroup;
            const teacherID = item.teacherID;
            const teacherName = item.teacherName;
            const startLesson = item.startLesson;
            const lessonNum = item.lessonNum;
            const day = item.day;
            const room = item.room;
            const studentNum = item.studentNum;
            const startDate = item.startDate;
            const endDate = item.endDate;
            const subject =  new Subject(subjectID, subjectName,subjectGroup,subjectCredit);
            const teacher = new Teacher (teacherID, teacherName); 
            const student = new Student (studentID);
            const subjectClass = new SubjectClass(subjectClassID, team, classID, subject, teacher, startLesson, lessonNum, day, room, studentNum, startDate, endDate)
            const registration = new Registration(id,subjectClass,student,createAt,avai);
            console.log("Avai:" + registration.avai);
            res.push(registration);
        }
        return res;
    }
    return null;
}

//let register a subject class. if subject is registered, you will cancel register this subject
//return ok message if success, error message if not success, null if error
export async function registerSubjectClass(subjectClassID,queryFilter) {
    console.log("registerSubjectClass");
    const urlString = `${config.api_url}/api/v1/register/register`;
    const token = await AsyncStorage.getItem('token');
    const userID = await AsyncStorage.getItem('userID');
    const params = JSON.stringify({
        "subjectClassID": subjectClassID,
        "queryFilter": queryFilter,
        userID: userID
      });

    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: params,
    });

    if (response.ok) {
        console.log("registerSubjectClass api: ok");
        const res = [];
        const responseData = await response.json(); 
        const listSubjectClass = responseData.subjectClasses;
        for (let i = 0; i < listSubjectClass.length; i++) {
            const item = listSubjectClass[i];
            const id = item.id;
            const studentID = item.userID;
            const createAt = item.createAt;
            const avai = item.avai;
            
            const subjectClassID = item.subjectClassID;
            const team = item.team;
            const classID = item.classID;
            const subjectID = item.subjectID;
            const subjectName = item.subjectName;
            const subjectCredit = item.subjectCredit;
            const subjectGroup = item.subjectGroup;
            const teacherID = item.teacherID;
            const teacherName = item.teacherName;
            const startLesson = item.startLesson;
            const lessonNum = item.lessonNum;
            const day = item.day;
            const room = item.room;
            const studentNum = item.studentNum;
            const startDate = item.startDate;
            const endDate = item.endDate;
            const subject =  new Subject(subjectID, subjectName,subjectGroup,subjectCredit);
            const teacher = new Teacher (teacherID, teacherName); 
            const student = new Student (studentID);
            const subjectClass = new SubjectClass(subjectClassID, team, classID, subject, teacher, startLesson, lessonNum, day, room, studentNum, startDate, endDate)
            const registration = new Registration(id,subjectClass,student,createAt,avai);
            console.log("Avai:" + registration.avai);
            res.push(registration);
        }
        const status = responseData.status;
        return { res, status };
        
    }
    return null;
}

// cancel register
export async function cancelSubjectClass(subjectClassID,queryFilter) {
    console.log("registerSubjectClass");
    const urlString = `${config.api_url}/api/v1/register/cancel`;
    const token = await AsyncStorage.getItem('token');
    const userID = await AsyncStorage.getItem('userID');
    const params = JSON.stringify({
        "subjectClassID": subjectClassID,
        "queryFilter": queryFilter,
        userID: userID
      });

    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: params,
    });

    if (response.ok) {
        console.log("registerSubjectClass api: ok");
        const res = [];
        const responseData = await response.json(); 
        const listSubjectClass = responseData.subjectClasses;
        for (let i = 0; i < listSubjectClass.length; i++) {
            const item = listSubjectClass[i];
            const id = item.id;
            const studentID = item.userID;
            const createAt = item.createAt;
            const avai = item.avai;
            
            const subjectClassID = item.subjectClassID;
            const team = item.team;
            const classID = item.classID;
            const subjectID = item.subjectID;
            const subjectName = item.subjectName;
            const subjectCredit = item.subjectCredit;
            const subjectGroup = item.subjectGroup;
            const teacherID = item.teacherID;
            const teacherName = item.teacherName;
            const startLesson = item.startLesson;
            const lessonNum = item.lessonNum;
            const day = item.day;
            const room = item.room;
            const studentNum = item.studentNum;
            const startDate = item.startDate;
            const endDate = item.endDate;
            const subject =  new Subject(subjectID, subjectName,subjectGroup,subjectCredit);
            const teacher = new Teacher (teacherID, teacherName); 
            const student = new Student (studentID);
            const subjectClass = new SubjectClass(subjectClassID, team, classID, subject, teacher, startLesson, lessonNum, day, room, studentNum, startDate, endDate)
            const registration = new Registration(id,subjectClass,student,createAt,avai);
            console.log("Avai:" + registration.avai);
            res.push(registration);
        }
        const status = responseData.status;
        return { res, status };
        
    }
    return null;
}

//get subjectclass by id
export async function getSubjectClass(subjectClassID) {
    console.log("getSubjectClass: " + subjectClassID);
    const urlString = `${config.api_url}/api/v1/subjectclass/subjectclass`;
    const params = JSON.stringify({
        "subjectClassID": subjectClassID,
    });

    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
         
        },
        body: params,
    });

    if (response.ok) {
        console.log("getSubjectClass api: ok");
        const responseData = await response.json(); 
        const item = responseData;
        const id = item.id;
        const team = item.team;
        const classID = item.classID;
        const subjectID = item.subjectID;
        const subjectName = item.subjectName;
        const teacherID = item.teacherID;
        const teacherName = item.teacherName;
        const startLesson = item.startLesson;
        const lessonNum = item.lessonNum;
        const day = item.day;
        const room = item.room;
        const studentNum = item.studentNum;
        const startDate = item.startDate;
        const endDate = item.endDate;
        const remainingQty = item.remainingQty;
        

        const subject =  new Subject(subjectID, subjectName);
        console.log(subject.id);
        const teacher = new Teacher (teacherID, teacherName); 
        console.log(teacher.id);
        const subjectClass = new SubjectClass(id, team, classID, subject, teacher, startLesson, lessonNum, day, room, studentNum, startDate, endDate,remainingQty)
        return subjectClass;
        
    }
    return null;
}

//search register subject class
export async function searchtRegisterSubjectClass(searchInput) {
    console.log("searchtRegisterSubjectClass api");
    const urlString =  `${config.api_url}/api/v1/register/search`;
    const params = JSON.stringify({
        "searchInput": searchInput
    });
    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: params,
    });

    if (response.ok) {
        console.log("searchtRegisterSubjectClass api: ok");
        const res = [];
        const responseData = await response.json(); 
        const listSubjectClass = responseData;
        for (let i = 0; i < listSubjectClass.length; i++) {
            const item = listSubjectClass[i];
            const id = item.id;
            const studentID = item.userID;
            const createAt = item.createAt;
            const avai = item.avai;
            
            const subjectClassID = item.subjectClassID;
            const team = item.team;
            const classID = item.classID;
            const subjectID = item.subjectID;
            const subjectName = item.subjectName;
            const subjectCredit = item.subjectCredit;
            const subjectGroup = item.subjectGroup;
            const teacherID = item.teacherID;
            const teacherName = item.teacherName;
            const startLesson = item.startLesson;
            const lessonNum = item.lessonNum;
            const day = item.day;
            const room = item.room;
            const studentNum = item.studentNum;
            const startDate = item.startDate;
            const endDate = item.endDate;
            const subject =  new Subject(subjectID, subjectName,subjectGroup,subjectCredit);
            const teacher = new Teacher (teacherID, teacherName); 
            const student = new Student (studentID);
            const subjectClass = new SubjectClass(subjectClassID, team, classID, subject, teacher, startLesson, lessonNum, day, room, studentNum, startDate, endDate)
            const registration = new Registration(id,subjectClass,student,createAt,avai);
            res.push(registration);
        }
        return res;
    }
    return null;
}

//Get list of register result 
//return a list of register result or null if error

export async function getUserInfo() {
    console.log("getUserInfo api");
    const urlString = `${config.api_url}/api/v1/info/student`;    
    const userID = await AsyncStorage.getItem('userID');
  
    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userID) 
    });

    if (response.ok) {
        console.log("getUserInfo api: ok");
        const responseData = await response.json();
        const data = responseData;
        const id = data.id;
        const name = data.name;
        const email = data.email;
        const classID = data.classID;
        const major = data.major;
        const year = data.year;
        const program = data.program;
        const country = data.country;
        const school = data.school;
        const birthday = data.birthday;

        const userInfo = new UserInfo(id, name, email, classID, major, year, program, country, school, birthday)
        return userInfo;
      

    }
    return null;
}

function StringToDate(dateString) {
    let parts = dateString.split("/");
    let formattedDate = parts[2] + "-" + parts[1] + "-" + parts[0];
    return new Date(formattedDate);
}
function ChangeDate(dateString) {
    const correctedDateString = dateString.replace(/^00/, '20');
    return new Date(correctedDateString);
  }



