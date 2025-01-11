import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../BaseStyle/Style';
import AsyncStorage from '@react-native-async-storage/async-storage';


const About = () => {
  const navigation = useNavigation();

  const handleViewProfile = () => {
    // Điều hướng đến màn hình xem thông tin tài khoản
    navigation.navigate('Profile');
  };

  const handleLogout = async () => {
    try {
      // Xóa thông tin người dùng khỏi AsyncStorage (ví dụ: token, thông tin đăng nhập)
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('student');
      await AsyncStorage.removeItem('userID');
  
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // 'Login' là tên màn hình đăng nhập
      });
  
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    }
  };

  const handleReportBug = () => {
    // Điều hướng đến màn hình báo cáo lỗi
    navigation.navigate('ReportBug');
  };

  return (
    <View style={styles.container}>
    {/* Item Xem thông tin tài khoản */}
    <TouchableOpacity style={styles.item} onPress={handleViewProfile}>
      <Icon name="information-circle" style={styles.icon} />
      <Text style={styles.itemText}>Thông tin</Text>
    </TouchableOpacity>

    {/* Item Báo cáo lỗi */}
    <TouchableOpacity style={styles.item} onPress={handleReportBug}>
      <Icon name="bug" style={styles.icon}  />
      <Text style={styles.itemText}>Báo lỗi</Text>
    </TouchableOpacity>

    {/* Item Đăng xuất */}
    <TouchableOpacity style={styles.item} onPress={handleLogout}>
      <Icon name="log-out" style={styles.icon_logout}  />
      <Text style={styles.itemText}>Đăng xuất</Text>
    </TouchableOpacity>
  </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundColor,
    padding: 16,
    marginTop: 24,
    marginVertical: 50,
    marginHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    height: 150,
    width: 150,
  },
  itemText: {
    marginTop: 8,
  },
  icon: {
    fontSize: 30,
    color: colors.primary,
  },
  icon_logout:{
    fontSize: 30,
    color: colors.dangerous,
  }
});

export default About;
