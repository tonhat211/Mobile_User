import React, { useState, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { Text, StyleSheet, View, TextInput,  TouchableWithoutFeedback, Keyboard, ActivityIndicator, TouchableOpacity, FlatList} from 'react-native';
import { getInitialPrograms} from '../service/NLUApiCaller';
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



export default function InitialProgram() {
  const [initialPrograms, setInitialPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Thêm state isLoading


  const fetchInitialPrograms = async () => {
    setIsLoading(true); // Đặt isLoading thành true khi bắt đầu lấy dữ liệu
    try {
      const initialProgramsData = await getInitialPrograms();
      setInitialPrograms(initialProgramsData);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra!',
        text2: 'Không thể lấy dữ liệu từ máy chủ',
        visibilityTime: 2000,
        autoHide: true,
      });
    } finally {
      setIsLoading(false); // Đặt isLoading thành false khi hoàn thành hoặc lỗi
    }
  };


  useEffect(() => {
    fetchInitialPrograms();
  }, []);

  const renderInitialProgramInfo = (program) => {
    return (
      <View style={styles.subjectContainer} key={program.semesterID}>
        <Text style={styles.examTitle}>{`Mã học kỳ: ${program.semesterID}`}</Text>
        <View style={styles.row}>
          <Text style={styles.cell}>Mã MH</Text>
          <Text style={styles.cellName}>Tên MH</Text>
          <Text style={styles.cell}>Số TC</Text>
          <Text style={styles.cell}>Nhóm</Text>
        </View>
        <FlatList
          data={program.subjects}
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

  const InitialProgramContainer = ({ programs }) => {
    return (
      <View style={styles.examScheduleContainer}>
        <View style={{ maxHeight: '97%' }}>
          {programs.length > 0 ? (
            <FlatList
              data={programs}
              keyExtractor={(program) => program.semesterID.toString()}
              renderItem={({ item: program }) => renderInitialProgramInfo(program)}
              contentContainerStyle={styles.subjectsContainer}
            />
          ) : (
            <Text style={{ textAlign: 'center' }}>Chưa có chương trình đào tạo</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
     
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2bc250" />
        </View>
      ) : (
        <View>
          {/* Hiển thị dữ liệu nếu không còn loading */}
          {initialPrograms.length > 0 ? (
             <InitialProgramContainer programs={initialPrograms} />
          ) : (
            <Text>Chưa có chương trình đào tạo</Text>
          )}
        </View>
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
    flex: 3,
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

