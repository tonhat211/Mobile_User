import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../BaseStyle/Style';

const items = [
  { title: 'ĐKMH', icon: 'book', screen: 'RegisterClass' },
  { title: 'Xem điểm', icon: 'bar-chart', screen: 'Score' }, 
  { title: 'Lịch thi', icon: 'calendar', screen: 'ExamSchedule' },
  { title: 'Chat GPT', icon: 'chatbubble-outline', screen: 'ChatGPTScreen' },
  { title: 'Chương trình đào tạo', icon: 'book', screen: 'InitialProgram' },
  { title: 'Học phí', icon: 'cash-outline', screen: 'LearningFee' },
];

const GridItem = ({ title, icon, screen }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate(screen);
  };

  return (
    <TouchableOpacity style={styles.gridItem} onPress={handlePress}>
      <Icon name={icon} style={styles.iconStyle} />
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

const Extensions = () => (
  <View style={styles.container}>
    <View style={styles.gridContainer}>
      {items.map((item, index) => (
        <GridItem key={index} title={item.title} icon={item.icon} screen={item.screen} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
   
  },
  gridItem: {
    width: '48%',
    height: 150,
    marginVertical: 10,
    backgroundColor: colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  gridItemText: {
    
  },
  iconStyle: {
    color: colors.primary,
    fontWeight: 600,
    fontSize: 50,
    
  },
});

export default Extensions;