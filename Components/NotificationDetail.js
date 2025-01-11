import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet,ScrollView } from 'react-native';
import { getNotificationDetail} from '../service/NLUApiCaller';

const NotificationDetail = ({ route }) => {
  const { notification } = route.params; 
  const [notificationDetail, setNotificationDetail] = useState(null);  // Dùng state riêng cho chi tiết thông báo
   const fetchNotificationDetail = async (id) => {
      try {
        const data = await getNotificationDetail(id);
        setNotificationDetail(data);
        console.log("clien:" +notificationDetail)
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
    // Lấy id từ thông báo và gọi hàm fetch
    if (notification && notification.id) {
      fetchNotificationDetail(notification.id); 
    }
  }, [notification]);
  

  return (
    <View style={styles.container}>
         {notificationDetail ? (
           <ScrollView style={styles.scrollView}>
            <View>
              <Text style={[styles.title,{color: "green", fontWeight: 'bold'}]}>{notificationDetail.title}</Text> 
              <Text style={[styles.time]}>{notificationDetail.createAt}</Text> 
              <Text>{notificationDetail.content}</Text> 
              <Text style={[styles.author]}>{notificationDetail.author.name}</Text> 
            </View>
           </ScrollView>
       
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
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
  },
  time: {
    textAlign: 'right',
    fontSize: 10,
    fontStyle: 'italic',

  },
  author: {
    textAlign: 'right',
    fontSize: 14,
    fontStyle: 'italic',

  }
});

export default NotificationDetail;
