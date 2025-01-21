import React, { useState, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { Text, StyleSheet, View, TextInput,  TouchableWithoutFeedback, Keyboard, ActivityIndicator, TouchableOpacity, FlatList} from 'react-native';
import { getLearningFee,getLearningFeeAll,getSemesters} from '../service/NLUApiCaller';
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



export default function LearningFee() {
  // Các lựa chọn cho dropdown
    const [data, setData] = useState([]); // Dữ liệu của dropdown
    const [allSemester, setAllSemester] = useState(false);
    
    const [leanrningFees, setLeanrningFees] = useState([]);
    const [selectedValue, setSelectedValue] = useState(null); // Giá trị đã chọn từ dropdown
    
    const [isLoading, setIsLoading] = useState(false);
    const detailsBSRef = useRef(null);
   
    const fetchSemesters = async () => {
      try {
        const semesters = await getSemesters();
        const customValue = {
          label: "Tất cả học kỳ",
          value: "semesters",
        };
        
        // Thêm giá trị tùy chỉnh vào đầu danh sách
        const formattedData = [
          customValue, // thêm mục tuyd chọn all học kỳ vào ds
          ...semesters.map(semester => ({
            label: `${semester.name}`,
            value: semester.id,
          })),
        ];
        setData(formattedData);
        if (formattedData.length > 1) {
          setSelectedValue(formattedData[0].value); // đặt gtri mặc định all học kỳ
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Có lỗi xảy ra!',
          text2: 'Không thể lấy dữ liệu từ trang ĐKMH',
          visibilityTime: 2000,
          autoHide: true,
        });
      }
    };

    const fetchLearningFee = async (queryFilter) => {
      console.log("fetch exam schedule");
      setIsLoading(true); // Đặt isLoading thành true khi bắt đầu lấy dữ liệu
      try {
        let data;
        if(queryFilter==='semesters') data = await getLearningFeeAll();// lấy học phí tc hky
        else data = await getLearningFee(queryFilter);// lấy học phí theo hky
        if (data) {
          setLeanrningFees(data); // câp nhật trthai vs data api
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
          if(selectedValue==='semesters') setAllSemester(true); 
          else setAllSemester(false);
          fetchLearningFee(selectedValue);
        }
      }, [selectedValue]); 

    const renderAllLearningFee = (fee) => {
      return (
        <View style={styles.subjectContainer} key={program.semesterID}>
          {/* <Text style={styles.examTitle}>{`Mã học kỳ: ${program.semesterID}`}</Text> */}
          <View style={styles.row}>
            <Text style={styles.cellName}>Học kỳ</Text>
            <Text style={styles.cell}>Tạm tính</Text>
            <Text style={styles.cell}>Miễn giảm</Text>
            <Text style={styles.cell}>Tổng thanh toán</Text>
            <Text style={styles.cell}>Trạng thái</Text>
          </View>
          <FlatList
            data={fee.subjects}
            renderItem={({ item }) => renderItem(item, program.semesterID)}  // Pass subject item along with semesterID
            keyExtractor={(subject) => `${program.semesterID}-${subject.id}`}  // Unique key for each subject
          />
        </View>
      );
    };

    const renderItem = (subject, semesterID) => (
      <View style={styles.row} key={`${semesterID}-${subject.id}`}>
        <Text style={styles.cell}>{subject.id}</Text>
        <Text style={styles.cellName}>{subject.name}</Text>
        <Text style={styles.cell}>{subject.credit}</Text>
        <Text style={styles.cell}>{subject.group}</Text>
      </View>
    );

      const renderAllSemeseterLearningFeeInfo = (fee) => {
        return (
          <View style={styles.subjectContainer} key={fee.semester.id}>
            <Text style={styles.examTitle}>{`${fee.semester.name}`}</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreItem}>{`Tạm tính: ${fee.tempMoney.toLocaleString()}`}</Text>
              <Text style={styles.scoreItem}>{`Miễn giảm: ${fee.discountMoney.toLocaleString()}`}</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreItem}>{`Tổng thanh toán: ${fee.money.toLocaleString()}`}</Text>
              <Text style={styles.scoreItem}>{`Trạng thái: ${(fee.isPay?'Đã thanh toán':'Chưa thanh toán')}`}</Text>
            </View>
          </View>
        );
      };

    const AllSemesterLearningFeeContainer = ({ item }) => { //hthi ds học phí của all học kỳ
      console.log("render all semester fee");
      return (
        <View style={styles.examScheduleContainer}>
          {/* Hiển thị môn học nếu có */}
          <View style={{maxHeight: '97%'}}>
            {item.length > 0 ? (
              <FlatList
                data={item}
                keyExtractor={(fee) => fee.semester.id.toString()} // Đảm bảo mỗi phần tử có khóa duy nhất
                renderItem={({ item: fee }) => renderAllSemeseterLearningFeeInfo(fee)}
              // Thêm style cho FlatList
              />
            ) : (
              <Text style={{textAlign: 'center'}}>Chưa có học phí</Text>
            )}
          </View>
        </View>
          
      )
    }

    const renderSemeseterLearningFeeInfo = (subjectFee) => {
      return (
        <View style={styles.subjectContainer} key={subjectFee.subject.id}>
          <Text style={styles.examTitle}>{`${subjectFee.subject.name} - ${subjectFee.subject.id}`}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreItem}>{`Số TC: ${subjectFee.subject.credit}`}</Text>
            <Text style={styles.scoreItem}>{`Đơn giá: ${subjectFee.priceUnit.toLocaleString()}`}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreItem}>{`Miễn giảm: ${subjectFee.discountMoney.toLocaleString()}`}</Text>
            <Text style={styles.scoreItem}>{`Tạm tính: ${subjectFee.money.toLocaleString()}`}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreItem}>{`Trạng thái: ${(subjectFee.isPay?'Đã thanh toán':'Chưa thanh toán')}`}</Text>
          </View>
        </View>
      );
    };

    const SemesterLearningFeeContainer = ({ item }) => { // hiển thị tổng học phí chi tiết từng môn học trong ky đã chọn
      console.log("render semester fee");
      const totalMoney = item.reduce((total, subjectFee) => {
        return total + (subjectFee.subject.credit * subjectFee.priceUnit - subjectFee.discountMoney);
      }, 0);
      return (
        <View style={styles.examScheduleContainer}>
          {/* Hiển thị môn học nếu có */}
          <View style={{maxHeight: '97%'}}>
          <View style={styles.row}>
            <Text style={styles.cell}>Tổng thanh toán</Text>
            <Text style={styles.cell}>{totalMoney.toLocaleString()}</Text>
          </View>
            {item.length > 0 ? (
              <FlatList
                data={item}
                keyExtractor={(subjectFee) => subjectFee.subject.id.toString()} // Đảm bảo mỗi phần tử có khóa duy nhất
                renderItem={({ item: subjectFee }) => renderSemeseterLearningFeeInfo(subjectFee)}
              // Thêm style cho FlatList
              />
            ) : (
              <Text style={{textAlign: 'center'}}>Chưa có học phí</Text>
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
        allSemester ? (
            <AllSemesterLearningFeeContainer item={leanrningFees} />
        ) : (
          <View>
           <SemesterLearningFeeContainer item={leanrningFees} />
          </View>
        )
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
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    padding: 10,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  cellName: {
    flex: 2,
    paddingHorizontal: 10,
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

