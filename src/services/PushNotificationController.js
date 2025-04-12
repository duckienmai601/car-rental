import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { db } from '../../firebase'; // Đảm bảo đường dẫn đúng
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Hàm yêu cầu quyền gửi thông báo
const requestNotificationPermission = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
        android: {
          allowAlert: true, 
          allowBadge: true, 
          allowSound: true, 
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Thông báo', 'Bạn cần cấp quyền để nhận thông báo.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Lỗi khi yêu cầu quyền thông báo:', error);
    Alert.alert('Lỗi', 'Không thể yêu cầu quyền thông báo. Vui lòng thử lại.');
    return false;
  }
};

// Hàm lấy Expo Push Token và lưu vào bảng notifications
const getExpoPushToken = async (userId) => {
  try {
    console.log('Bắt đầu lấy Expo Push Token cho user:', userId);
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Không có quyền thông báo, không thể lấy token.');
      return null;
    }

    // Truyền projectId trực tiếp
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: '0dc57c63-65d4-4e97-8b68-7f91a55a0dc5', 
    })).data;

    if (token) {
      console.log('Expo Push Token:', token);

      const notificationRef = doc(db, 'notifications', userId);
      await setDoc(notificationRef, {
        userId: userId,
        expoPushToken: token,
        createdAt: serverTimestamp(),
      });
      console.log('Đã lưu Expo Push Token vào bảng notifications cho user:', userId);
      return token;
    } else {
      console.warn('Không thể lấy Expo Push Token.');
      return null;
    }
  } catch (error) {
    console.error('Lỗi khi lấy Expo Push Token:', error);
    return null;
  }
};

// Hàm xử lý thông báo khi ứng dụng đang chạy (foreground)
const setupForegroundNotificationListener = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  Notifications.addNotificationReceivedListener((notification) => {
    const { title, body } = notification.request.content;
    Alert.alert(title || 'Thông báo mới', body || 'Bạn có thông báo mới.');
  });
};

// Khởi tạo Push Notification
const initializePushNotifications = async (userId) => {
  // Yêu cầu quyền và lấy token
  const token = await getExpoPushToken(userId);

  // Xử lý thông báo foreground
  setupForegroundNotificationListener();

  return token;
};

export default initializePushNotifications;