// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5q6bqfsCjy6d_cFIEQgBjxj-B_fTvQqA",
  authDomain: "vkwash-web.firebaseapp.com",
  projectId: "vkwash-web",
  storageBucket: "vkwash-web.firebasestorage.app",
  messagingSenderId: "857336808885",
  appId: "1:857336808885:web:eb39c480eeca5918d185fc",
  measurementId: "G-HSJE30L8ZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
