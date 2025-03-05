// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuwB4tifihXO3XMinmq9fSzwDCqnRvq6w",
  authDomain: "car-rental-742fe.firebaseapp.com",
  projectId: "car-rental-742fe",
  storageBucket: "car-rental-742fe.firebasestorage.app",
  messagingSenderId: "992723152351",
  appId: "1:992723152351:web:5bf332dbce8f5826cba86a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export {auth}