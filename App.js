import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import MenuPane from './Components/MenuPane';
import Login from './Components/Login';
import ReportBug from './Components/ReportBug';
import Profile from './Components/Profile';
import About from './Components/About';
import RegisterClass from './Components/RegisterClass';
import Score from './Components/Score';
import { Platform, Text, View } from 'react-native';
import ExamSchedule from './Components/ExamSchedule';
import InitialProgram from './Components/InitialProgram';
import LearningFee from './Components/LearningFee';
const App = () => {
  const Stack = createStackNavigator();
  return (
    
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, gestureEnabled: false }}>
          <Stack.Screen name="Login" component={Login}/>
          <Stack.Screen name="Profile" component={Profile} options={{ gestureEnabled: true }} />
          <Stack.Screen name="RegisterClass" component={RegisterClass} />
          <Stack.Screen name="ExamSchedule" component={ExamSchedule} options={{ gestureEnabled: true }} />
          <Stack.Screen name="InitialProgram" component={InitialProgram} options={{ gestureEnabled: true }} />
          <Stack.Screen name="LearningFee" component={LearningFee} options={{ gestureEnabled: true }} />
          <Stack.Screen name="About" component={About} options={{ gestureEnabled: true }}/>
          <Stack.Screen name="Score" component={Score} options={{ gestureEnabled: true }}/>
          <Stack.Screen name="ReportBug" component={ReportBug} />
          <Stack.Screen name="MenuPane" component={MenuPane} options={{ gestureEnabled: false }} />
        </Stack.Navigator>
          
        <Toast />
      </NavigationContainer>
  );
};

export default App;