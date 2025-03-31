import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrALoC0eU1ZBYdRA1pkxQ3fHaEr1ecSQY",
  authDomain: "carrentalapp-44434.firebaseapp.com",
  projectId: "carrentalapp-44434",
  storageBucket: "carrentalapp-44434.firebasestorage.app",
  messagingSenderId: "178415670100",
  appId: "1:178415670100:web:0b162e3432a4b1954e2ec1",
  measurementId: "G-FEFWL4D4SH"
};

const app = initializeApp(firebaseConfig);

// Khởi tạo Auth với AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { auth, db };