import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors } from '../BaseStyle/Style';
import { getScoreBoard,getSemesters } from '../service/NLUApiCaller';
import { Dropdown } from 'react-native-element-dropdown';

const calculateTotalCredits = (subjects) => {
    return subjects.reduce((total, subject) => total + subject.credits, 0);
  };

  
  
  const calculateWeightedAverage = (subjects, gradeType) => {
    const totalCredits = calculateTotalCredits(subjects);
    const weightedSum = subjects.reduce((sum, subject) => sum + subject[gradeType] * subject.credits, 0);
    return totalCredits > 0 ? weightedSum / totalCredits : 0;
  };
  
  const Score = () => {
    const [data, setData] = useState([]); // Dữ liệu của dropdown
    const [selectedValue, setSelectedValue] = useState(null); // Giá trị đã chọn từ dropdown
    const [scoreData, setScoreData] = useState([]); // Dữ liệu điểm

    const results = [
      'Không đạt',  // 0
      'Đạt',  
    ];
  
    // Hàm lấy học kỳ từ API
    const fetchSemesters = async () => {
      try {
        const semesters = await getSemesters();
        const formattedData = semesters.map(semester => ({
          label: `${semester.name}`,
          value: semester.id,
        }));
        setData(formattedData);
        if (formattedData.length > 1) {
          setSelectedValue(formattedData[1].value); // Đặt giá trị mặc định là học kỳ đầu tiên
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
  
    // Hàm lấy điểm từ API
    const fetchScoreData = async (semesterID) => {
      try {
        const data = await getScoreBoard(semesterID);
  
        if (data) {
          setScoreData(data); // Cập nhật dữ liệu điểm
        } else {
          Toast.show({
            type: 'error',
            text1: 'Có lỗi xảy ra!',
            text2: 'Không thể lấy dữ liệu điểm',
            visibilityTime: 2000,
            autoHide: true,
          });
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Có lỗi xảy ra!',
          text2: 'Không thể lấy dữ liệu điểm',
          visibilityTime: 2000,
          autoHide: true,
        });
      }
    };
  
    useEffect(() => {
      fetchSemesters();
    }, []);
  
    // Gọi API lấy điểm khi giá trị học kỳ thay đổi
    useEffect(() => {
      if (selectedValue) {
        fetchScoreData(selectedValue);
      }
    }, [selectedValue]); // Phụ thuộc vào selectedValue
  
    const renderSubjectInfo = (subject) => {
      return (
        <View style={styles.subjectContainer} key={subject.id}>
          <Text>{`${subject.id} - ${subject.name}`}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreItem}>{`Số tín chỉ: ${subject.credit}`}</Text>
            <Text style={styles.scoreItem}>{`Điểm thi: ${subject.examScore}`}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreItem}>{`Điểm TK (10): ${subject.score10}`}</Text>
            <Text style={styles.scoreItem}>{`Điểm TK (4): ${subject.score4}`}</Text>
          </View>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreItem}>{`Điểm TK (C): ${subject.scoreC}`}</Text>
            <Text style={styles.scoreItem}>{`Kết quả: ${results[subject.result]}`}</Text>
          </View>
        
       
        </View>
      );
    };
  
    // Hàm hiển thị thông tin tổng kết học kỳ
    const renderSemesterScore = (semesterScore) => {
      return (
        <View style={{marginTop: 16}}>
          <Text style={styles.scoreStyle}>{`Điểm TB học kỳ hệ 4: ${semesterScore.avgScore4 || ''}`}</Text>
          <Text style={styles.scoreStyle}>{`Điểm TB học kỳ hệ 10: ${semesterScore.avgScore10 || ''}`}</Text>
          <Text style={styles.scoreStyle}>{`Tổng số tín chỉ học kỳ đạt: ${semesterScore.reachedCredit || ''}`}</Text>
        </View>
      );
    };
  
    // Hàm hiển thị tổng điểm của cả kỳ
    const renderTotalScore = (totalScore) => {
      return (
        <View style={{marginTop:10}}>
          <Text style={styles.scoreStyleCK}>{`Điểm TB tích lũy hệ 4: ${totalScore.avgScore4 || ''}`}</Text>
          <Text style={styles.scoreStyleCK}>{`Điểm TB  tích lũy hệ 10: ${totalScore.avgScore10 || ''}`}</Text>
          <Text style={styles.scoreStyleCK}>{`Tổng số tín chỉ tích lũy đạt: ${totalScore.reachedCredit || ''}`}</Text>
        </View>
      );
    };

const ScoreBoardItem = ({ item }) => {
  return (
    <View style={styles.semesterContainer}>
      {/* <Text style={styles.semesterText}>{item.semesterName}</Text> */}
      {/* Hiển thị môn học nếu có */}
      <View style={{maxHeight: '75%'}}>
        {item.subjectScores && item.subjectScores.length > 0 ? (
          <FlatList
            data={item.subjectScores}
            keyExtractor={(subject) => subject.id.toString()} // Đảm bảo mỗi phần tử có khóa duy nhất
            renderItem={({ item: subject }) => renderSubjectInfo(subject)}
            contentContainerStyle={styles.subjectsContainer} // Thêm style cho FlatList
          />
        ) : (
          <Text>Chưa môn nào có điểm</Text>
        )}
      </View>
    

      {/* Hiển thị thông tin tổng kết học kỳ */}
      {item.semesterScore && renderSemesterScore(item.semesterScore)}

      {/* Hiển thị thông tin tổng điểm của cả kỳ */}
      {item.totalScore && renderTotalScore(item.totalScore)}
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
        <ScoreBoardItem item={scoreData} />
      
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      marginTop: 40
    },
    dropdown: {
      marginTop: 5,
      width: '90%',
      height: 40,
      borderWidth: 1,
      borderColor: 'black',
      borderRadius: 10,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    semesterContainer: {
      marginTop: 16,
    },
    semesterText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subjectsContainer: {
      // flexDirection: 'row',
      // flexWrap: 'wrap',
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
   
    scoreStyle: {
      fontWeight: 'bold', 
      color: colors.primary,
    },
    scoreStyleCK: {
      fontWeight: 'bold', 
      color: colors.success,
    },
  });
  
  export default Score;