import React, { useState, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { Text, StyleSheet, View, TextInput,  TouchableWithoutFeedback, Keyboard, ActivityIndicator, TouchableOpacity, FlatList} from 'react-native';
import { LoginDefault, getRegisterSubjectClass, registerSubjectClass,cancelSubjectClass ,getSubjectClass, searchtRegisterSubjectClass} from '../service/NLUApiCaller';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import User from '../model/User';
import SubjectClass from '../model/SubjectClass';
import { Platform  } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { CheckBox } from 'react-native-elements';


export default function RegisterClass() {
  // Các lựa chọn cho dropdown
    const data = [
        { label: 'Chọn theo lớp', value: 'class' },
        { label: 'Môn trong chương trình đào tạo', value: 'program' },
        { label: 'Chọn theo môn', value: 'subject' },
        { label: 'Chọn theo khoa', value: 'major' }
    ];
    const daysOfWeek = [
        'CN',  // 0
        'Thứ hai',  
        'Thứ ba',   
        'Thứ tư',   
        'Thứ năm',   
        'Thứ sáu',   
        'Thứ bảy'    // 6
    ];
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [searchInput, setSearchInput] = useState(""); // Nội dung ô tìm kiếm

    const searchSubjectClass = async (searchInput) => {
        console.log("searchSubjectClass");
        try {
            const res = await searchtRegisterSubjectClass(searchInput); // Chờ kết quả từ API
            console.log(res);
            setSubjectClasses(res); // Cập nhật state với dữ liệu mới
        } catch (error) {
            console.error("Error during search:", error); // Xử lý lỗi nếu có
        }
    };

    useEffect(() => {
        searchSubjectClass(searchInput);
    }, [searchInput]);

    const [subjectClassAll, setSubjectClassAll] = useState([]);
    const [classChosen, setClassChosen] = useState([]);
    const [subjectClasses, setSubjectClasses] = useState([]);
    const [resultRegister, setResultRegister] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(new User('', '', true, false, null, ''));
    const [subjectClassDetails, setSubjectClassDetails] = useState(new SubjectClass('', '', '', '', '', '', '', '', '', '', '', ''));
    const bottomSheetRef = useRef(null);
    const detailsBSRef = useRef(null);


    const [queryFilter, setQueryFilter] = useState('class');
    const handleDropdownChange = (item) => {
        setQueryFilter(item.value);
        setShowSearchBox(item.value === 'subject'); 
    
        setIsLoading(true); 
        // Hàm để xử lý API và hiển thị lỗi nếu không có dữ liệu
        const handleApiResponse = (val) => {
            if (val) {
                setSubjectClassAll(val);  // Cập nhật subjectClassAll với dữ liệu trả về
            } else {
                // Hiển thị thông báo lỗi nếu không có dữ liệu
                Toast.show({
                    type: 'error',
                    text1: 'Có lỗi xảy ra!',
                    text2: 'Không thể lấy dữ liệu từ trang ĐKMH',
                    visibilityTime: 2000,
                    autoHide: true,
                });
            }
        };

        getRegisterSubjectClass(item.value)
        .then(handleApiResponse)
        .finally(() => setIsLoading(false));
    
        // Kiểm tra và gọi API tùy theo giá trị của item.value
        // if (item.value === 'class') {
        //     getRegisterSubjectClass(queryFilter)
        //         .then(handleApiResponse)
        //         .finally(() => setIsLoading(false));
        // } else if (item.value === 'program') {
        //     getRegisterSubjectClassByProgram()
        //         .then(handleApiResponse)
        //         .finally(() => setIsLoading(false));
        // }
    };
    


    const toggleCheckbox = async (subjectClassID, isChecked) => {
        console.log("toggleCheckbox: " + subjectClassID, isChecked,queryFilter);
        if (!isChecked) {
            // Nếu checkbox chưa được chọn (newValue === true), gọi hàm register
            const { res, status } = await registerSubjectClass(subjectClassID, queryFilter);
            setSubjectClassAll(res);

            if (status === 1) {
                Toast.show({
                    type: 'success',  
                    text1: 'Đăng ký thành công!',
                    text2: 'Lớp học đã được đăng ký thành công.',
                    visibilityTime: 2000, 
                    autoHide: true, 
                });
            } else if (status === -1) {
                Toast.show({
                    type: 'error',  
                    text1: 'Đăng ký thất bại!',
                    text2: 'Trùng lịch học.',
                    visibilityTime: 2000, 
                    autoHide: true, 
                });
            } else {
                Toast.show({
                    type: 'error',  
                    text1: 'Đăng ký thất bại',
                    text2: 'Đã hết slot.',
                    visibilityTime: 2000, 
                    autoHide: true, 
                });
            }
        } else {
            // Nếu checkbox đã được chọn (newValue === false), gọi hàm cancel (dự đoán bạn có một hàm cancel API)
            const { res, status } = await cancelSubjectClass(subjectClassID, queryFilter);
            setSubjectClassAll(res);

            if (status === 1) {
                Toast.show({
                    type: 'success',  
                    text1: 'Hủy đăng ký thành công!',
                    text2: '',
                    visibilityTime: 2000, 
                    autoHide: true, 
                });
            } else {
                Toast.show({
                    type: 'error',  
                    text1: 'Hủy đăng ký thất bại',
                    text2: '',
                    visibilityTime: 2000, 
                    autoHide: true, 
                });
            }
        }
    };
    

    // Cập nhật queryFilter mỗi khi selectedValue thay đổi
    // useEffect(() => {
    //     setQueryFilter((prevState) => ({
    //         ...prevState,
    //         filterByClass: selectedValue, // Cập nhật lớp học được chọn từ dropdown
    //     }));
    // }, [selectedValue]);

    // useEffect(() => {
    //     if (subjectClassAll.length > 0) {
    //         console.log("Current subjectClassAll:", subjectClassAll);
    //     }
    // }, [subjectClassAll]);

    useEffect(() => {
        setIsLoading(true);
        getRegisterSubjectClass('class').then((val) => {
            if (val) {
                // setSubjectClassDetails(val);
                setSubjectClassAll(val);
                // setSubjectClasses(val);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Có lỗi xảy ra!',
                    text2: 'Không thể lấy dữ liệu từ trang ĐKMH',
                    visibilityTime: 2000,
                    autoHide: true,
                });
            }
        });
        // getResultRegister().then(vals => {
        //     if (vals) setResultRegister(vals);
        // })
        // AsyncStorage.getItem('id').then(id => {
        //     getUser(id).then(u => {
        //         setUser(u);
        //     })
        // })
        setIsLoading(false);
    }, []);
    

    const unchoose = (id) => {
        const unchosen = classChosen.filter(item => item.id !== id);
        setClassChosen(unchosen);
    }

    const choose = (item) => {
        setIsLoading(true);
        const isContain = classChosen.some(obj => obj.id === item.id);
        const isRegistered = resultRegister.some(obj => obj.idSubject === item.idSubject);
        const isContainSubject = classChosen.some(obj => obj.idSubject === item.idSubject);
        const isRemain = (item.remain > 0);
        setIsLoading(false);
        if (isContain) {
            unchoose(item.id);
            return;
        }
        if (isRegistered) {
            Toast.show({
                type: 'error',
                text1: 'Bạn đã đăng ký môn này rồi!',
                text2: 'Có 1 môn mà đăng ký gì mấy lần vậy nhỉ :v',
                visibilityTime: 2000,
                autoHide: true,
            });
            return;
        }
        if (isContainSubject) {
            Toast.show({
                type: 'error',
                text1: 'Bạn đã chọn môn này rồi!',
                text2: 'Hỏng lẽ bạn muốn học 1 môn 2 ngày :v',
                visibilityTime: 2000,
                autoHide: true,
            });
            return;
        }
        if (isRemain) {
            Toast.show({
                type: 'error',
                text1: 'Hết slot rồi bạn eiii!',
                text2: 'Đời mà! Nhanh tay thì còn chậm tay thì mất :))',
                visibilityTime: 2000,
                autoHide: true,
            });
            return;
        }
        const newClassChosen = [...classChosen, item]
        setClassChosen(newClassChosen);
    }

    // const doSearch = (text) => {
    //     const data = subjectClassAll.filter(item => item.idSubject.indexOf(text) !== -1 || item.name.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    //     setSubjectClasses(data);
    // }

    const SubjectDetails = ({ subjectClass }) => {
        return (
            <BottomSheetView>
                <View style={{ flexDirection: 'column', width: '95%', alignSelf: 'center', }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{subjectClass.subject.name} ({subjectClass.subject.id})</Text>
                    <View style={[styles.rowDetails, { backgroundColor: 'lightgray', borderTopLeftRadius: 10, borderTopRightRadius: 10}]}>
                        <Text style={styles.textDetails}>Nhóm: {subjectClass.team}</Text>
                        <Text style={styles.textDetails}>Số TC: {subjectClass.subject.credit}</Text>
                    </View>
                    <View style={[styles.rowDetails, { backgroundColor: '#eeeeee' }]}>
                        <Text style={styles.textDetails}>Thứ: {daysOfWeek[subjectClass.day]}</Text>
                        <Text style={styles.textDetails}>Tiết BD: {subjectClass.startLesson}</Text>
                        <Text style={styles.textDetails}>Số tiết: {subjectClass.lessonNum}</Text>
                    </View>
                    <View style={[styles.rowDetails, { backgroundColor: 'lightgray'}]}>
                        <Text style={styles.textDetails}>Số lượng: {subjectClass.studentNum}</Text>
                        <Text style={styles.textDetails}>Còn lại: {subjectClass.remainingQty}</Text>
                    </View>
                    {/* <View style={[styles.rowDetails, { backgroundColor: '#eeeeee', borderBottomLeftRadius: 10, borderBottomRightRadius: 10}]}>
                        <Text style={[styles.textDetails,]}>Chi tiết: {subjectClass.id}</Text>
                    </View> */}
                </View>
            </BottomSheetView>
        )
    }

    const classItem = ({ item }) => {
        const rowStyle = item.qty === 0 ? [styles.row, { backgroundColor: 'red' }] : styles.row;

        const handlePress = async () => {
            const selectedSubjectClass = await getSubjectClass(item.subjectclass.id);
            setSubjectClassDetails(selectedSubjectClass);
            detailsBSRef.current.snapToIndex(1);
        };

        return (
            <TouchableOpacity onPress={handlePress}>
                <View style={rowStyle}>
                    <Text style={[styles.pH5, { flex: 0.6 }]}>
                        <Text style={{ paddingLeft: 10 }}>{item.subjectclass.subject.id}</Text>
                        {'\n'}
                        <Text numberOfLines={1}>
                            {item.subjectclass.subject.name}
                        </Text>
                    </Text>
                    <Text style={[styles.pH5, { flex: 0.15}]}>{item.subjectclass.team}</Text>
                    <Text style={[styles.pH5, { flex: 0.2}]}>
                        <Text>{daysOfWeek[item.subjectclass.day]}</Text>
                        {'\n'}
                        <Text>
                            Tiết {item.subjectclass.startLesson}
                        </Text>
                    </Text>
                    <CheckBox
                        checked={item.avai === 1}  // `checked` thay cho `value`
                        onPress={() => toggleCheckbox(item.subjectclass.id, item.avai === 1)}  // onPress thay vì onValueChange
                        checkedColor="#4CAF50"  // Màu khi checkbox được chọn
                        uncheckedColor="#f44336"  // Màu khi checkbox chưa được chọn
                        containerStyle={{ flex: 0.1 }}  // Đảm bảo nó không bị che khuất
                    />

                    {/* <CheckBox
                        value={item.avai===1}
                        // onValueChange={() => toggleCheckbox(item.subjectclass.id)}
                        style={{ flex:0.1}}
                        // onValueChange={() => {
                        //     if (item.avai === 1) {
                        //         cancel(item.subjectclass.id, queryFilter);
                        //     } else {
                        //         register(item.subjectclass.id, queryFilter);
                        //     }
                        // }}
                 
                        onValueChange={(newValue) => toggleCheckbox(item.subjectclass.id, newValue)}
                    /> */}
               
                </View>
            </TouchableOpacity>
        )
    }

    const bottomSheetItem = ({ item }) => {
        const isContain = classChosen.some(obj => obj.id === item.id)
        let bgColor = '#f3f3f3'
        if (isContain) bgColor = 'green'
        return (
            <TouchableOpacity style={[styles.bottomSheetItem, { backgroundColor: bgColor }]} onPress={() => choose(item)}>
                <View style={{ flexDirection: 'column', width: '100%' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.cell, { flex: 0.7, color: 'red' }]}>{item.name} ({item.idSubject})</Text>
                        <Text style={[styles.cell, { flex: 0.3, textAlign: 'center', color: '#2196F3' }]}>Nhóm: {item.group}</Text>
                    </View>
                    <View>
                        <Text style={{ flex: 1, fontStyle: 'italic', }}>TKB: {item.schedule}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const startRegister = async () => {
        if (classChosen.length<1) {
            Toast.show({
                type: 'error',
                text1: 'Đã chọn môn nào đâu mà đăng ký! hmmm...',
                text2: 'Chọn vài môn đeeee',
                visibilityTime: 3000,
                autoHide: true,
            });
            return;
        }
        setIsLoading(true);
        let res = []
        await LoginDefault();
        for (let i = 0; i<classChosen.length;i++){
            let result = await registerSubject(classChosen[i].id);
            if (result == null) {
                Toast.show({
                    type: 'error',
                    text1: 'Có lỗi gì đó rồi á!',
                    text2: 'Thử tắt mở lại xem, biết đâu lại được :v',
                    visibilityTime: 3000,
                    autoHide: true,
                });
                res.push(classChosen[i])
                continue;
            }
            if (result === true) {
                Toast.show({
                    type: 'info',
                    text1: 'Đăng ký xong 1 môn nè!',
                    text2: classChosen[i].name,
                    visibilityTime: 3000,
                    autoHide: true,
                });
            } else if (result === false) {
                Toast.show({
                    type: 'info',
                    text1: 'Hủy xong 1 môn nè!',
                    text2: classChosen[i].name,
                    visibilityTime: 3000,
                    autoHide: true,
                });
            } if (result == 'Cảnh báo: tài khoản của bạn không được đăng ký/hủy đăng ký ở thời điểm hiện tại.'){
                Toast.show({
                    type: 'error',
                    text1: 'Ngoài thời gian đăng ký môn học á bạn -_-',
                    visibilityTime: 3000,
                    autoHide: true,
                });
                setIsLoading(false);
                return;
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Có lỗi gì đó!',
                    text2: result,
                    visibilityTime: 3000,
                    autoHide: true,
                });
                res.push(classChosen[i])
            }
        }
        setIsLoading(false);
        Toast.show({
            type: 'success',
            text1: 'Xong hết rồi nè bạn eiii! ('+(classChosen.length-res.length)+'/'+classChosen.length+')',
            text2: 'Có ' + res.length + ' môn đăng ký không thành công!',
            visibilityTime: 20000,
            autoHide: false,
        });
        
        return res;
    }

    
    const renderData = searchInput.trim() === "" ? subjectClassAll : subjectClasses;

    return (
        (<TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
        }}>
            <View style={styles.container}>
                <Dropdown
                    style={styles.dropdown}
                    data={data}
                    labelField="label"
                    valueField="value"
                    placeholder="Chọn theo lớp"
                    value={queryFilter}
                    onChange={handleDropdownChange} 
                   
                />
                {showSearchBox && (
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBox}>
                            <TouchableOpacity onPress={() => searchSubjectClass(searchInput)} >
                                <Icon name="search" size={20} color="#aaa" style={styles.searchIcon} />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm môn học..."
                                value={searchInput} // Gắn giá trị từ trạng thái
                                onChangeText={(text) => setSearchInput(text)} // Cập nhật nội dung tìm kiếm
                            />
                        </View>
                        <View style={styles.searchCancel}>
                            <TouchableOpacity onPress={() => setSearchInput("")} >
                                <Text style={styles.searchCancelText}>Hủy</Text>
                            </TouchableOpacity>
                        </View>
                    
                        
                    </View>
                    
                )}
                <View style={styles.table}>
                    <View style={styles.headerPane}>
                        <View style={styles.headerRow}>
                            <Text style={[styles.header, { flex: 0.6}]}>Môn</Text>
                            <Text style={[styles.header, { flex: 0.15 }]}>Nhóm</Text>
                            <Text style={[styles.header, { flex: 0.2 }]}>Thời gian</Text>
                            <Text style={[styles.header, { flex: 0.1 }]}>Chọn</Text>
                        </View>
                    </View>
                    <View style={styles.tablePane}>
                        {subjectClassAll.length > 0 ? (
                            <FlatList 
                                data={renderData} 
                                keyExtractor={item => item.subjectclass.id} 
                                renderItem={classItem} 
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={true}
                           
                            />
                        ) : (
                            <View style={[styles.row,]}>
                                <Text style={{ textAlign: 'center', flex: 1, color: 'gray' }}>Không có môn học nào</Text>
                            </View>
                        )}
                    </View>
                </View>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2bc250" />
                    </View>) : (<></>)
                }
                <BottomSheet ref={detailsBSRef} snapPoints={['1%','35%', '60%']} enablePanDownToClose={true}>
                    <SubjectDetails subjectClass={subjectClassDetails} />
                </BottomSheet>
            </View>

        </TouchableWithoutFeedback>)


    );
}

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#2bc250',
        height: '100%',
        alignItems: 'center',
        paddingTop: 30
        

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
    table: {
        width: '95%',
        marginHorizontal: 'auto',
        marginTop: 10,
    },
    headerPane: {

    },
    headerRow: {
        flexDirection: 'row'
    },
    header: {
        fontWeight: 'bold',
        paddingHorizontal: 5
    },
    tablePane: {
        maxHeight: '90%'
    },
    row: {
        flexDirection: 'row',
        backgroundColor: 'lightgray',
        marginTop: 5,
        marginBottom: 5,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 5,
    },
    pH5: {
        paddingHorizontal: 5
    },
    searchContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '90%',
        marginTop: 16, 
    },
    searchBox: {
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '90%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,  
    },
    searchIcon: {marginHorizontal: 8 },
    searchInput: {flex: 1,padding: 4,},
    searchCancel: {
        flex: 1, // Để container chiếm toàn bộ chiều cao và chiều rộng của view cha
        justifyContent: "center", // Căn giữa theo chiều dọc
        alignItems: "center",
    },
    searchCancelText: {
        color: "#007AFF",
    },
    cell: {
        paddingRight: 5
    },
    button: {
        backgroundColor: '#2196F3',
        width: 'auto',
        padding: 7,
        borderRadius: 5,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
            },
            android: {
                elevation: 10,
            },
        }),
    },
    startButtonBlock: {
        width: '80%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        left: '10%'
    },
    startButton: {
        width: '100%',

    },
    buttonTitle: {
        fontWeight: 'bold',
        color: 'white',
        // textAlign: 'center'
    },
    bottomSheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f3f3',
        paddingVertical: 5,
        paddingHorizontal: 10
    },
    // searchContainer: {
    //     width: '100%',
    //     alignItems: 'center',
    // },
    searchBlock: {
        flexDirection: 'row',
        width: '95%',
        alignItems: 'center',
        marginHorizontal: 'auto',
        borderColor: 'lightgray',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginVertical: 5,
    },
    searchInput: {
        flex: 1,
    },
    searchButton: {

    },
    rowDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    textDetails: {
        fontSize: 15,

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
})