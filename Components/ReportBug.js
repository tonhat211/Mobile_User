import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../BaseStyle/Style';

const ReportBug = ({ navigation }) => {
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');

  const handleSubmitBug = () => {
    // Thực hiện xử lý báo cáo lỗi ở đây
    // Gửi thông tin báo cáo lỗi đến server hoặc thực hiện các bước cần thiết
    // Sau khi xử lý xong, bạn có thể chuyển về màn hình trước đó hoặc màn hình khác
    navigation.goBack(); // Chuyển về màn hình trước đó
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report Bug</Text>
      <TextInput
        style={styles.input}
        placeholder="Bug Title"
        value={bugTitle}
        onChangeText={(text) => setBugTitle(text)}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Bug Description"
        multiline
        numberOfLines={4}
        value={bugDescription}
        onChangeText={(text) => setBugDescription(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmitBug}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
  },
});

export default ReportBug;
