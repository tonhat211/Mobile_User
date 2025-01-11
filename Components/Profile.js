import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { colors } from '../BaseStyle/Style';
import { getUserInfo} from '../service/NLUApiCaller';


const Profile = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState([]); // Dữ liệu của dropdown
    
    const fetchUserInfo = async () => {
      try {
        const data = await getUserInfo();
        console.log(data);
        setUserInfo(data);
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

    useEffect(() => {
      fetchUserInfo();
    }, []);
  return (
    <View style={styles.container}>
      {userInfo ? (
       
        <View>
          <Text style={styles.heading}>Thông Tin Tài Khoản</Text>
          <View style={styles.infoContainer}>
            <View style={styles.row}>
              <Text style={styles.label}>Mã số SV:</Text>
              <Text style={styles.value}>{userInfo.id}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Họ và Tên:</Text>
              <Text style={styles.value}>{userInfo.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Lớp:</Text>
              <Text style={styles.value}>{userInfo.classID}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Ngành:</Text>
              <Text style={styles.value}>{userInfo.major}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Trường:</Text>
              <Text style={styles.value}>{userInfo.school}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Khóa:</Text>
              <Text style={styles.value}>{userInfo.year}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Sinh Ngày:</Text>
              <Text style={styles.value}>{userInfo.birthday}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Quê Quán:</Text>
              <Text style={styles.value}>{userInfo.country}</Text>
            </View>
          </View>
    
        </View>
      
    
          // Hiển thị chi tiết thông báo
      ) : (
        <Text>Đang tải...</Text>  // Hiển thị trạng thái đang tải
      )}

    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
 
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  infoContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  value: {},
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    width: 100,
    marginLeft: 135,
    marginTop: 20,
    alignItems: 'center',
  },
});

export default Profile;
