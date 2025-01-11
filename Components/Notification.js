
import React, { useState, useEffect, useRef } from 'react';

import {StyleSheet, View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getNotifications} from '../service/NLUApiCaller';



const Notification = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);

  const fetchNofitications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
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

  useEffect(() => {
    fetchNofitications();
    }, []);
  const handlePress = (id) => {
      // Tìm thông báo với id tương ứng
      const notification = notifications.find((notification) => notification.id === id);
      console.log("pres:"+ notification.id );
      
      // Chuyển đến trang "Thông Báo Chi Tiết" với thông tin của thông báo
      navigation.navigate('Thông Báo Chi Tiết', {notification});
  };
    const renderItem = ({ item }) => (
        <View style={styles.notification}  onTouchEnd={() => handlePress(item.id)}>
          <View style={styles.row}>
            <Text style={[styles.cellName,{color: "green", fontWeight: 'bold'}]} numberOfLines={2} ellipsizeMode="tail" >{item.title}</Text>
            <Text style={[styles.cell,{ fontStyle: 'italic' }]}>{item.createAt}</Text>
          </View>
          <Text numberOfLines={2} ellipsizeMode="tail">{item.subContent} </Text>
        </View>
  );

  return (
    <FlatList style ={{height: 200}}
      data={notifications}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};
const styles = StyleSheet.create({
    notification: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
      margin: 5,
    },
    row: {
      flexDirection: 'row',
      // padding: 10,
      paddingBottom: 10
    },
    cell: {
      flex: 1,
      textAlign: 'right',
    },
    cellName: {
      flex: 3,
      paddingRight: 10,
    },
  });
export default Notification;

