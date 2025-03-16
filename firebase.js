// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDquQz5HMttKOoPEETOYpQaYa12ex0akcE",
  authDomain: "rentalcar-ccfb3.firebaseapp.com",
  projectId: "rentalcar-ccfb3",
  storageBucket: "rentalcar-ccfb3.firebasestorage.app",
  messagingSenderId: "974312959588",
  appId: "1:974312959588:web:68f304db61ead3ca30b971"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export {auth, db};