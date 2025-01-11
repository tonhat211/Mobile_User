import AsyncStorage from '@react-native-async-storage/async-storage';
import User from '../model/User';


//Login NLUApp Api
//return user object or null if error 
export async function LoginApi(username, password, name) {
    const urlString = "localhost:8080/api/v1/auth/login";
    const params = `{"username":"tominhat","password":"1234", "name":"tominhat"}`;

    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: params,
    });

    if (response.ok) {
        const responseData = await response.json();
        const data = responseData.data;
        if (!data) return responseData.message;
        const id = responseData.data.user_name;
        const name = responseData.data.name;
        const isNonLocked = responseData.data.non_locked;
        const isVip = responseData.data.vip;
        const expiredVipDate = responseData.data.expired_vip_date;
        const token = responseData.data.access_token;
        return new User(id, name, isNonLocked, isVip, expiredVipDate, token);
    }
    return null;
}

export async function getUser(id) {
    const urlString = "http://103.9.159.203:8001/users/"+id;
    const token = await AsyncStorage.getItem('tokenApp');
    const params = "";

    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: params,
    });

    if (response.ok) {
        const responseData = await response.json();
        const id = responseData.user_name;
        const name = responseData.name;
        const isNonLocked = responseData.non_locked;
        const isVip = responseData.vip;
        const expiredVipDate = responseData.expired_vip_date;
        const token = responseData.access_token;
        return new User(id, name, isNonLocked, isVip, expiredVipDate, token);
    }
    return null;
}

//Send a report to admin
//return ok message or null if error 
export async function sendReport(message) {
    const urlString = "http://103.9.159.203:8001/authenticate/login";
    const token = await AsyncStorage.getItem('tokenApp');
    const params = `{"message":"${message}"}`;

    const response = await fetch(urlString, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
        },
        body: params,
    });

    if (response.ok) {
        const responseData = await response.json();
        const responseMessage = responseData.message;
        return responseMessage;
    }
    return null;
}