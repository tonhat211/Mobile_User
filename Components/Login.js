import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { Text, StyleSheet, View, Image, TextInput, BackHandler, TouchableWithoutFeedback, Keyboard, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LoginNLU } from '../service/NLUApiCaller';
import { LoginApi} from '../service/NLUAppApiCaller';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


export default function Login({ navigation }) {
    var isBack = false;
    const [mssv, setMssv] = useState('21130463');
    const [password, setPassword] = useState('1234');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        
        const backAction = () => {
            if (isBack) BackHandler.exitApp();
            else {
                isBack = true;
                Toast.show({
                    type: 'info',
                    text1: 'Nhấn nút back lần nữa để thoát',
                    visibilityTime: 2000,
                    autoHide: true,
                });
            }
            setTimeout(() => {
                isBack = false;
            }, 2000);
            return true;
        };

        const onInactive = navigation.addListener('blur', () => {
            BackHandler.removeEventListener('hardwareBackPress', backAction);
        });

        const onActive = navigation.addListener('focus', () => {
            BackHandler.addEventListener('hardwareBackPress', backAction);
        });

        return () => {
            onActive();
            onInactive();
        };
    }, [navigation]);

    async function login() {
        setIsLoading(true);
        try {
            if(mssv==='') {
                Toast.show({
                    type: 'error',
                    text1: 'Vui lòng nhập MSSV!',
                    visibilityTime: 2000,
                });
            } else {
                if(password==='') {
                    Toast.show({
                        type: 'error',
                        text1: 'Vui lòng nhập mật khẩu!',
                        visibilityTime: 2000,
                    });
                } else {
                    const student = await LoginNLU(mssv, password);
                    if (student) {
                        await AsyncStorage.setItem("token", student.token);
                        console.log("Token in AsyncStorage: " + student.token);
        
                        navigation.navigate('MenuPane');
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: 'Đăng nhập thất bại!',
                            text2: 'Sai thông tin đăng nhập',
                            visibilityTime: 2000,
                        });
                    }
                }
            }
            
        } catch (error) {
            console.error("Login failed:", error);
            Toast.show({
                type: 'error',
                text1: 'Có lỗi xảy ra, vui lòng thử lại!',
                visibilityTime: 2000,
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
        }}>

            <View style={styles.container}>
                <Image source={require('../resource/images/logo_nlu.png')} style={styles.logo} />
                <View style={styles.forms}>
                    <TextInput style={styles.inputText} placeholderTextColor={"lightgray"} placeholder='Mã số sinh viên' onChangeText={setMssv} value={mssv} />
                    <TextInput style={styles.inputText} placeholderTextColor={"lightgray"} placeholder='Mật khẩu' secureTextEntry={true} onChangeText={setPassword} value={password} />
                    <TouchableOpacity style={styles.loginButton} onPress={login}>
                        <Text style={styles.titleButton}>ĐĂNG NHẬP</Text>
                    </TouchableOpacity>
                </View>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2bc250" />
                    </View>) : (<></>)
                }

            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        // backgroundColor: '#2bc250',
        // height: '100%'
    },
    logo: {
        width: 200,
        height: 200,
        objectFit: "cover",
        marginTop: 70,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    forms: {
        width: "100%",

        alignItems: "center",
        ...Platform.select({
            ios: {
                marginTop: 40,
            },
            android: {
                marginTop: 20,
            },
        }),
    },
    inputText: {
        width: "80%",
        marginTop: 0,
        marginBottom: 20,
        padding: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        textAlign: 'center'
    },
    loginButton: {
        backgroundColor: "#2196F3",
        padding: 10,
        marginTop: 10,
        borderRadius: 3,
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
    titleButton: {
        fontWeight: 'bold',
        color: 'white'
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