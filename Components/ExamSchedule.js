import React, { useState, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { Text, StyleSheet, View, TextInput,  TouchableWithoutFeedback, Keyboard, ActivityIndicator, TouchableOpacity, FlatList} from 'react-native';
import { getExams,getSemesters,getInitialPrograms} from '../service/NLUApiCaller';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import { getUser } from '../service/NLUAppApiCaller';
import User from '../model/User';
import SubjectClass from '../model/SubjectClass';
import { Platform  } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { CheckBox } from 'react-native-elements';
import { colors } from '../BaseStyle/Style';



export default function ExamSchedule() {
  // Các lựa chọn cho dropdown
    const [data, setData] = useState([]); // Dữ liệu của dropdown
    
    const [exams, setExams] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null); // Giá trị đã chọn từ dropdown
    
    const [isLoading, setIsLoading] = useState(false);
    const detailsBSRef = useRef(null);
   
    const fetchSemesters = async () => {
      try {
        const initialprograms = await getInitialPrograms();
        const semesters = await getSemesters();
        const formattedData = semesters.map(semester => ({
          label: `${semester.name}`,
          value: semester.id,
        }));
        setData(formattedData);
        if (formattedData.length > 1) {
          setSelectedValue(formattedData[0].value); 
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Có lỗi xảy ra!',
          text2: 'Không thể lấy dữ liệu từ máy chủ',
          visibilityTime: 2000,
          autoHide: true,
        });
      }
    };

    const fetchExamSchedule = async (semesterID) => {
      console.log("fetch exam schedule");
      setIsLoading(true); // Đặt isLoading thành true khi bắt đầu lấy dữ liệu
      try {
        const data = await getExams(semesterID);
        if (data) {
          setExams(data); 
        } else {
          Toast.show({
            type: 'error',
            text1: 'Có lỗi xảy ra!',
            text2: 'Không thể lấy dữ liệu lịch thi',
            visibilityTime: 2000,
            autoHide: true,
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Có lỗi xảy ra!',
          text2: 'Không thể lấy dữ liệu lịch thi',
          visibilityTime: 2000,
          autoHide: true,
        });
      } finally {
        setIsLoading(false); // Đặt isLoading thành false khi hoàn thành hoặc có lỗi
      }
    };

    useEffect(() => {
      fetchSemesters();
    }, []);

    useEffect(() => {
        if (selectedValue) {
          fetchExamSchedule(selectedValue);
        }
      }, [selectedValue]); 

    const renderSubjectInfo = (exam) => {
          return (
            <View style={styles.subjectContainer} key={exam.id}>
              <Text style={styles.examTitle}>{`${exam.subject.name} - ${exam.subject.id}`}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreItem}>{`Ngày thi: ${exam.date}`}</Text>
                <Text style={styles.scoreItem}>{`Tiết bắt đầu: ${exam.startLesson}`}</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreItem}>{`Phòng thi: ${exam.room}`}</Text>
                <Text style={styles.scoreItem}>{`Thời gian thi: ${exam.lessonNum} tiết`}</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreItem}>{`Sĩ số: ${exam.studentNum}`}</Text>
                <Text style={styles.scoreItem}>{`Hình thức thi: ${exam.form}`}</Text>
              </View>
            
           
            </View>
          );
        };

    const ExamScheduleContainer = ({ item }) => {
      console.log("render exxam");
      return (
        <View style={styles.examScheduleContainer}>
          {/* Hiển thị môn học nếu có */}
          <View style={{maxHeight: '97%'}}>
            {item.length > 0 ? (
              <FlatList
                data={item}
                keyExtractor={(exam) => exam.id.toString()} // Đảm bảo mỗi phần tử có khóa duy nhất
                renderItem={({ item: exam }) => renderSubjectInfo(exam)}
                contentContainerStyle={styles.subjectsContainer} // Thêm style cho FlatList
              />
            ) : (
              <Text style={{textAlign: 'center'}}>Chưa có lịch thi</Text>
            )}
          </View>
        
    
     
        </View>
          
      )
    }

    return (
      <View style={styles.container}>
      <Dropdown
        style={styles.dropdown}
        data={data}
        labelField="label"
        valueField="value"
        placeholder="Chọn học kỳ"
        value={selectedValue}
        onChange={(item) => setSelectedValue(item.value)}
      />      
      {/* <ExamScheduleContainer item={exams} /> */}
       {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2bc250" />
        </View>
      ) : (
        <ExamScheduleContainer item={exams} />
      )}
     
    </View>


    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 40
  },
  dropdown: {
    marginTop: 5,
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  examScheduleContainer: {
    marginTop: 16,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  examScheduleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectContainer: {
    width: '100%', 
    marginBottom: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.borderColor, 
    borderRadius: 8,
    backgroundColor: colors.backgroundColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  scoreContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' , marginTop: 10
  },
  scoreItem: {
    flex: 1, textAlign: 'left'
  },
  
  loadingContainer: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#bec4c2',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: 0 }],
    width: 150,
    height: 150,
    justifyContent: 'center',
    borderRadius: 10,
    opacity: 0.8,
}

 

});

