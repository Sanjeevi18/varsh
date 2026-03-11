// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmlYWGOseIO-JQA2wLBaxAfsy5Rn1hdjU",
  authDomain: "svgt-7de13.firebaseapp.com",
  projectId: "svgt-7de13",
  storageBucket: "svgt-7de13.firebasestorage.app",
  messagingSenderId: "1026301570190",
  appId: "1:1026301570190:web:64e616de4b5d1cebedaddf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
