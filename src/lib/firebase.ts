
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaic0ESPKJNu4algp3RKmrVM0_gne7MNc",
  authDomain: "vk-wash-web.firebaseapp.com",
  databaseURL: "https://vk-wash-web-default-rtdb.firebaseio.com",
  projectId: "vk-wash-web",
  storageBucket: "vk-wash-web.firebasestorage.app",
  messagingSenderId: "401453674104",
  appId: "1:401453674104:web:46f4ccc168bb4b206cc78d",
  measurementId: "G-2CN44HDNSP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
