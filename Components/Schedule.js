import React, { useEffect, useState } from 'react';
import { TouchableOpacity, FlatList, View, Text, Button, TextInput, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Calendar } from 'react-native-calendars';
import moment from 'moment/min/moment-with-locales';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import { Alert } from 'react-native';
import { getSchedule, getSemesters } from '../service/NLUApiCaller';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Schedule = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [lastTaskId, setLastTaskId] = useState(0);
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    [moment().format('YYYY-MM-DD')]: {
      selected: true,
      selectedColor: 'blue',
    },
  });
  const [isTitleEmpty, setIsTitleEmpty] = useState(true);
  const [isTitleUpdateEmpty, setIsTitleUpdateEmpty] = useState(false);
  const [numberOfWeeks, setNumberOfWeeks] = useState(1);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isModal2Visible, setModal2Visible] = useState(false);
  const [newTask, setNewTask] = useState({});
  const [currentDay, setCurrentDay] = useState(moment().format('YYYY-MM-DD'));
  const [semesters, setSemesters] = useState([]);


  const handleIncrease = () => {
    setNumberOfWeeks(prevNumber => prevNumber + 1);
  };

  const handleDecrease = () => {
    setNumberOfWeeks(prevNumber => (prevNumber > 1 ? prevNumber - 1 : 1));
  };

  const handleTextChange = (text) => {
    const parsedNumber = parseInt(text);
    if (!isNaN(parsedNumber)) {
      setNumberOfWeeks(parsedNumber);
    }
  };
  const handleWeeksChange = (value) => {
    setNumberOfWeeks(value);
  };

  const addTask = async () => {
    const startDate = moment(currentDay);
    const endDate = startDate.clone().add(numberOfWeeks * 7, 'days');
    let updatedTasks = { ...tasks };
    let dayOfWeek = startDate.day();

    for (let date = startDate; date.isBefore(endDate); date.add(1, 'weeks')) {
      const taskDate = date.clone().day(dayOfWeek);
      const formattedDate = taskDate.format('YYYY-MM-DD');

      if (!updatedTasks[formattedDate]) {
        updatedTasks[formattedDate] = [];
      }
      const newTaskWithId = {
        ...newTask,
        id: (lastTaskId + 1).toString,
        status: 0,
        startDate: taskDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      };
      updatedTasks[formattedDate].push(newTaskWithId);
    }

    setTasks(updatedTasks);

    try {
      await AsyncStorage.setItem('@tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
    setLastTaskId(lastTaskId + 1);
    setNewTask({});
    setIsTitleEmpty(true);
    setNumberOfWeeks(1);
    setShowModal(false);
  };


  useEffect(() => {
    const retrieveTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('@tasks');
        if (savedTasks !== null) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error('Error retrieving tasks:', error);
      }
    };

    retrieveTasks();
    setIsTitleEmpty(true);
  }, []);

  const deleteTask = async (id) => {
    const taskToDelete = tasks[currentDay].find(task => task.id === id);
    const endDate = taskToDelete ? moment(taskToDelete.endDate) : null;

    if (!endDate) {
      console.error('Task with the specified ID does not have an endDate or does not exist.');
      return;
    }

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa công việc này không?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Xóa",
          onPress: async () => {
            const updatedTasks = { ...tasks };

            Object.keys(updatedTasks).forEach(date => {
              const index = updatedTasks[date].findIndex(task => task.id === id && task.endDate === taskToDelete.endDate);
              if (index !== -1) {
                updatedTasks[date].splice(index, 1);
              }
            });

            setTasks(updatedTasks);
            try {
              await AsyncStorage.setItem('@tasks', JSON.stringify(updatedTasks));
            } catch (error) {
              console.error('Error saving tasks:', error);
            }
          }
        }
      ]
    );
  };
  const handleBackButton = () => {
    setIsTitleEmpty(true); 
    setShowModal(false); 
  };
  const handleBackUpdateButton = () => {
    setIsTitleUpdateEmpty(false); 
    setModal2Visible(false); 
  };
  const openEditModal = (taskToEdit) => {
    const start = moment(taskToEdit.startDate);
    const end = moment(taskToEdit.endDate);
    const duration = moment.duration(end.diff(start));
    const weeks = duration.asWeeks();

    setNewTask({ ...taskToEdit, numberOfWeeks: Math.round(weeks) });
    setIsTitleUpdateEmpty(!taskToEdit.title.trim());
    setModal2Visible(true);
  };

  const editTask = async (task) => {
    const updatedTasks = { ...tasks };
    const start = moment(task.startDate);
    const oldEndDate = moment(task.endDate);
    const newEndDate = start.clone().add(task.numberOfWeeks * 7, 'days');
    const dayOfWeek = start.day(); 

    if (newEndDate.isBefore(oldEndDate)) {
      Object.keys(updatedTasks).forEach(date => {
        if (moment(date).isAfter(newEndDate)) {
          updatedTasks[date] = updatedTasks[date].filter(t => !(t.id === task.id && t.dayOfWeek === dayOfWeek));
        }
      });
    }
    if (newEndDate.isAfter(oldEndDate)) {
      let date = oldEndDate.clone().add(1, 'weeks').day(dayOfWeek); 
      while (date.isSameOrBefore(newEndDate)) {
        const formattedDate = date.format('YYYY-MM-DD');
        if (!updatedTasks[formattedDate]) {
          updatedTasks[formattedDate] = [];
        }
        updatedTasks[formattedDate].push({ ...task, startDate: formattedDate, endDate: newEndDate.format('YYYY-MM-DD') });
        date.add(1, 'weeks');
      }
    }
    const taskIndex = updatedTasks[task.startDate].findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      updatedTasks[task.startDate][taskIndex] = { ...task, endDate: newEndDate.format('YYYY-MM-DD') };
    }
    setIsTitleUpdateEmpty(false);
    setNumberOfWeeks(1);
    setTasks(updatedTasks);
    try {
      await AsyncStorage.setItem('@tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };



  const generateMarkedDates = (tasks) => {
    const markedDates = {};
    const today = moment().format('YYYY-MM-DD');

    for (const date in tasks) {
      if (tasks.hasOwnProperty(date) && tasks[date].length > 0) {
        const isToday = date === today;


        markedDates[date] = {
          customStyles: {
            container: {
              borderWidth: 1,
              borderColor: isToday ? 'aqua' : 'green',
              backgroundColor: 'white',
              borderRadius: 5,
            },
            text: {
              color: isToday ? 'aqua' : 'green',
              fontWeight: 'bold',
            },
          },
        };
      }
    }

    return markedDates;
  };


  const handleTitleChange = (text) => {
    setNewTask(prev => ({ ...prev, title: text }));
    setIsTitleEmpty(!text);
  };
  /* Dropdown */
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const semesters = await getSemesters();
        const formattedData = semesters.map(semester => ({
          label: `${semester.name}`,
          value: semester.id,
        }));
        setData(formattedData);
        if (formattedData.length > 0) {
          setSelectedValue(formattedData[0].value);
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Có lỗi xảy ra!',
          text2: 'Không thể lấy dữ liệu từ máy chủ!',
          visibilityTime: 2000,
          autoHide: true,
        });
      }
    };

    fetchSemesters();
  }, []);
  /* calendar */
  useEffect(() => {
    setIsTitleEmpty(newTask.title ? newTask.title.trim() === "" : true);
  }, [newTask.title]);

  useEffect(() => {
    const fetchTodaySchedule = async () => {
      console.log("todayschedule: get schedule for all days");
      const scheduleData = await getSchedule(selectedValue);
      if (scheduleData) {
        const tasksByDate = { ...tasks };
        scheduleData.forEach(subjectClass  => {
          const startDate = moment(subjectClass.startDate);
          const endDate = moment(subjectClass.endDate);
          const dayOfWeek = subjectClass.day; 

          let currentDate = startDate.clone();
          while (currentDate.isSameOrBefore(endDate)) {
            if (currentDate.day() === dayOfWeek) {
                const formattedDate = currentDate.format('YYYY-MM-DD');
    
                // Nếu chưa có ngày này trong tasksByDate, thêm vào
                if (!tasksByDate[formattedDate]) {
                    tasksByDate[formattedDate] = [];
                }
    
                // Thêm thông tin lớp học vào ngày đó
                tasksByDate[formattedDate].push({
                    id: subjectClass.id,
                    title: subjectClass.subject.name,
                    time: `Tiết ${subjectClass.startLesson} - ${subjectClass.startLesson + subjectClass.lessonNum - 1}`,
                    location: subjectClass.room,
                    instructor: `GV: ${subjectClass.teacher.name}`,
                    status: 1
                });
            }
    
            // Tăng ngày lên 1
            currentDate.add(1, 'days');
          }

         
        });
        setTasks(tasksByDate);
      } else {
        // setTasks({});
      }
    };

    fetchTodaySchedule();
  }, [selectedValue]);
  useEffect(() => {
    const fetchSemesters = async () => {
      const semestersData = await getSemesters();
      if (semestersData) {
        setSemesters(semestersData);
      }
    };

    fetchSemesters();
  }, []);

  useEffect(() => {
    const selectedSemester = semesters.find(semester => semester.id === selectedValue);
    if (selectedSemester && selectedSemester.startDate) {
      const formattedStartDate = moment(selectedSemester.startDate).format('20YY-MM-DD');
      setSelectedDate({
        [formattedStartDate]: {
          selected: true,
          selectedColor: 'blue',
        },
      });
      setCurrentDay(formattedStartDate);
    }
  }, [selectedValue, semesters]);
  const uniqueTasks = (tasks) => {
    const seen = new Set();
    return tasks.filter(task => {
      const key = `${task.id}-${task.time}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };
  const markedDates = generateMarkedDates(tasks);
  const totalTasksForCurrentDay = uniqueTasks(tasks[currentDay] ?? []).length;

  const reloadPage = async () => {
    try {
      setIsLoading(true);
      const scheduleData = await getSchedule(selectedValue);
      console.log("reload page")
      if (scheduleData) {
        const tasksByDate = { ...tasks };
        scheduleData.forEach(subjectClass  => {
          const startDate = moment(subjectClass.startDate);
          const endDate = moment(subjectClass.endDate);
          const dayOfWeek = subjectClass.day; 

          let currentDate = startDate.clone();
          while (currentDate.isSameOrBefore(endDate)) {
            if (currentDate.day() === dayOfWeek) {
                const formattedDate = currentDate.format('YYYY-MM-DD');
    
                // Nếu chưa có ngày này trong tasksByDate, thêm vào
                if (!tasksByDate[formattedDate]) {
                    tasksByDate[formattedDate] = [];
                }
    
                // Thêm thông tin lớp học vào ngày đó
                tasksByDate[formattedDate].push({
                    id: subjectClass.id,
                    title: subjectClass.subject.name,
                    time: `Tiết ${subjectClass.startLesson} - ${subjectClass.startLesson + subjectClass.lessonNum - 1}`,
                    location: subjectClass.room,
                    instructor: `GV: ${subjectClass.teacher.name}`,
                    status: 1
                });
            }
    
            // Tăng ngày lên 1
            currentDate.add(1, 'days');
          }

         
        });
        setTasks(tasksByDate);
      } else {
        // setTasks({});
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Có lỗi xảy ra!',
        text2: 'Không thể lấy dữ liệu từ trang ĐKMH',
        visibilityTime: 2000,
        autoHide: true,
      });
    } finally {
      setIsLoading(false)
    }
  };

  const handleTitleUpdateChange = (text) => {
    setNewTask(prev => ({ ...prev, title: text }));
    setIsTitleUpdateEmpty(!text.trim());
  };

  const onDayPress = (day) => {
    setSelectedDate({
      [day.dateString]: {
        selected: true,
        selectedColor: 'blue',
      },
    });
    console.log(day);
    console.log(day.dateString);
    setCurrentDay(day.dateString);
  
    try {
      console.log("ondaypress");
  
      // Truy cập vào tasks để lọc lịch học cho ngày được chọn
      const tasksForSelectedDay = tasks[day.dateString] || [];
  
      // Cập nhật lại state selectedDayTasks để hiển thị lịch học cho ngày
      setSelectedDayTasks(tasksForSelectedDay);
  
      console.log(tasksForSelectedDay);
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

  return (
    <View style={{ flex: 1 }}>
      {isLoading && (

        <ActivityIndicator style={styles.ActivityIndicator} size="large" color="#0000ff" />
      )}
      <View style={{
        paddingHorizontal: 10,
      }}>
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
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={reloadPage}
          >
            <Icon name="ios-refresh" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Calendar
          key={currentDay}
          style={styles.calendar}
          markingType='custom'
          markedDates={{ ...markedDates, ...selectedDate }}
          current={currentDay}
          onDayPress={onDayPress}
          hideExtraDays
          theme={{
            'stylesheet.calendar.main': {
              dayToday: {
                borderWidth: 2,
              },
            },
            'stylesheet.day.basic': {
              sunday: {
                color: 'red',
                fontWeight: 'bold',
              },
            },
          }}
        />
        <View style={styles.innerContainer}>
          <Text style={styles.marginRT_5 + styles.font_30}>Tổng số: <Text style={styles.textblue_bold}>{totalTasksForCurrentDay}</Text></Text>
          <TouchableOpacity style={styles.buttonAddTask} onPress={() => setShowModal(true)}>
            <Text style={styles.addTask}>+</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showModal} transparent={true} animationType="slide">
          <View style={styles.containerModal}>
            <View style={styles.modalContent}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: 'bold', color: 'green', alignItems: 'center', justifyContent: 'center' }}>THÊM LỊCH HỌC</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                <Text style={{ fontWeight: 'bold' }}>Tên môn học:{isTitleEmpty && <Text style={{ color: 'red' }}>*</Text>}</Text>
                <TextInput style={{ marginLeft: 10, height: 30, width: '72%', borderColor: 'gray', borderWidth: 1, borderRadius: 5 }} onChangeText={handleTitleChange} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Thời gian:</Text>
                <TextInput style={{ marginLeft: 34, height: 30, width: '72%', borderColor: 'gray', borderWidth: 1, borderRadius: 5 }} onChangeText={text => setNewTask(prev => ({ ...prev, time: text }))} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Phòng học:</Text>
                <TextInput style={{ marginLeft: 25, height: 30, width: '72%', borderColor: 'gray', borderWidth: 1, borderRadius: 5 }} onChangeText={text => setNewTask(prev => ({ ...prev, location: text }))} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Giảng viên:</Text>
                <TextInput style={{ marginLeft: 26, height: 30, width: '72%', borderColor: 'gray', borderWidth: 1, borderRadius: 5 }} onChangeText={text => setNewTask(prev => ({ ...prev, instructor: text }))} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Chọn số tuần:</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 50 }}>
                  <TouchableOpacity onPress={handleDecrease}>
                    <Text style={{ fontSize: 20, paddingHorizontal: 10 }}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={{ height: 30, width: 100, borderRadius: 5, textAlign: 'center', borderWidth: 1, borderColor: 'gray' }}
                    onChangeText={handleTextChange}
                    value={numberOfWeeks.toString()}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={handleIncrease}>
                    <Text style={{ fontSize: 20, paddingHorizontal: 10 }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 200, marginTop: 10 }}>
                  <TouchableOpacity style={{ width: 80, borderRadius: 5, height: 30, backgroundColor: '#003', alignItems: 'center', justifyContent: 'center' }} onPress={handleBackButton}>
                    <Text style={{ color: 'white' }}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 80, borderRadius: 5, height: 30, backgroundColor: isTitleEmpty ? 'lightgray' : 'blue', alignItems: 'center', justifyContent: 'center' }} onPress={addTask} disabled={isTitleEmpty}>
                    <Text style={{ color: 'white' }}>Thêm</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>
        </Modal>
        <FlatList
          data={uniqueTasks(tasks[currentDay] ?? [])}
          keyExtractor={item => `${item.id}-${item.time}`}
          style={{ height: 66 * 3 + 50 }}
          renderItem={({ item }) => (
            <View style={styles.containerFlatList}>

              <View style={{ flexDirection: 'row' }}>
                <Text>
                  <Icon name="book-outline" size={15} color="#000" />:{' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    {item.title && item.title.length > 35 ? item.title.substring(0, 35) + '...' : item.title}
                  </Text>
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1 }}>
                  <TouchableOpacity onPress={() => openEditModal(item)} disabled={item.status === 1}>
                    <Icon name="create-outline" size={20} color={item.status === 1 ? 'gray' : 'blue'} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTask(item.id)} style={{ marginLeft: 10 }} disabled={item.status === 1}>
                    <Icon name="trash" size={20} color={item.status === 1 ? 'gray' : 'red'} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text><Icon name="alarm-outline" size={15} color="#000" />: <Text style={{ color: 'red' }}>{item.time && item.time.length > 20 ? item.time.substring(0, 20) + '...' : item.time}, {item.location && item.location.length > 15 ? item.location.substring(0, 15) + '...' : item.location}</Text></Text>
              <Text><Icon name="person-outline" size={15} color="#000" />: <Text>{item.instructor && item.instructor.length > 35 ? item.instructor.substring(0, 35) + '...' : item.instructor}</Text></Text>
            </View>
          )}
        />

        <Modal visible={isModal2Visible} transparent={true} animationType="slide">
          <View style={styles.containerModal}>
            <View style={styles.modalContent}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontWeight: 'bold', color: 'green', alignItems: 'center', justifyContent: 'center' }}>SỬA LỊCH HỌC</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                <Text style={{ fontWeight: 'bold' }}>Tên môn học: {isTitleUpdateEmpty && <Text style={{ color: 'red' }}>*</Text>}</Text>
                <TextInput style={{ marginLeft: 10, height: 30, width: '72%', borderColor: 'gray', borderWidth: 1, borderRadius: 5 }} onChangeText={handleTitleUpdateChange}
                  value={newTask.title} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Thời gian:</Text>
                <TextInput style={{ marginLeft: 34, height: 30, width: '72%', borderColor: 'gray', borderWidth: 1, borderRadius: 5 }} onChangeText={text => setNewTask(prev => ({ ...prev, time: text }))}
                  value={newTask.time} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Phòng học:</Text>
                <TextInput style={{ marginLeft: 25, height: 30, width: '72%', borderColor: 'gray', borderWidth: 1, borderRadius: 5 }} onChangeText={text => setNewTask(prev => ({ ...prev, location: text }))}
                  value={newTask.location}/>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Giảng viên:</Text>
                <TextInput style={{ marginLeft: 26, height: 30, width: '72%', borderColor: 'gray', borderWidth: 1, borderRadius: 5 }} onChangeText={text => setNewTask(prev => ({ ...prev, instructor: text }))}
                  value={newTask.instructor}/>
              </View>
              {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Chọn số tuần:</Text>
                <TouchableOpacity onPress={handleDecrease1}>
                  <Text style={{ fontSize: 20, paddingHorizontal: 10,  marginLeft: 50 }}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={{ height: 30, width: 100, borderRadius: 5, textAlign: 'center', borderWidth: 1, borderColor: 'gray' }}
                  onChangeText={text => {
                    const parsedNumber = parseInt(text);
                    if (!isNaN(parsedNumber)) {
                      setNewTask(prev => ({ ...prev, numberOfWeeks: parsedNumber }));
                    }
                  }}
                  value={newTask.numberOfWeeks?.toString()}
                  keyboardType="numeric"
                />
                <TouchableOpacity onPress={handleIncrease1}>
                  <Text style={{ fontSize: 20, paddingHorizontal: 10 }}>+</Text>
                </TouchableOpacity>
              </View> */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 200, marginTop: 10 }}>
                  <TouchableOpacity style={{ width: 80, borderRadius: 5, height: 30, marginTop: 5, backgroundColor: '#003', alignItems: 'center', justifyContent: 'center' }} onPress={handleBackUpdateButton}>
                    <Text style={{ color: 'white' }}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 80, borderRadius: 5, height: 30, marginTop: 5, backgroundColor: isTitleUpdateEmpty ? 'lightgray' : 'blue', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => {
                      if (!isTitleUpdateEmpty) {
                        editTask(newTask);
                        setModal2Visible(false);
                      }
                    }}
                    disabled={isTitleUpdateEmpty}>
                    <Text style={{ color: 'white' }}>Cập nhật</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>

  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  ActivityIndicator: {
    position: 'absolute', top: '50%', left: '50%', zIndex: 9999
  },
  innerContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginRight: 10, alignItems: 'center'
  },
  font_30: {
    fontSize: 30,
  },
  activityIndicator: {

  },
  addTask: {
    color: 'white', fontSize: 20
  },
  buttonAddTask: {
    width: 30, borderRadius: 5, marginTop: 5, backgroundColor: 'black', alignItems: 'center', marginLeft: 10
  },
  textblue_bold: {
    color: 'blue',
    fontWeight: 'bold'
  },
  marginRT_5: {
    marginRight: 5,
    marginTop: 5,
  },
  modalContent: {
    backgroundColor: 'white', padding: 20, borderRadius: 10
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
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTaskBtn: {

  },
  containerFlatList: {
    marginTop: 10,
    width: '100%',
    height: 66,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 10,
    paddingHorizontal: 10
  },
  flatListContent: {

  },
  calendar: {
    backgroundColor: 'white',
    marginTop: 10,
    borderRadius: 10,
  },
  containerModal: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center'
  },
  modalAdd: {

  },
  modalEdit: {

  }

});

export default Schedule;
