// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAfgPy27b3srHPk6FVxSIXZO4yhH_veXjM",
  authDomain: "agrosense-1ff60.firebaseapp.com",
  databaseURL: "https://agrosense-1ff60-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agrosense-1ff60",
  storageBucket: "agrosense-1ff60.firebasestorage.app",
  messagingSenderId: "358594084060",
  appId: "1:358594084060:web:bd26b829fc521e32390819"
};

const app = initializeApp(firebaseConfig);

// Realtime Database — used for Farmer-to-Farmer chat
export const rtdb = getDatabase(app);

// Firestore — used for Shop products
export const db = getFirestore(app);

// Storage — used for product images
export const storage = getStorage(app);

// Auth — used for authentication
export const auth = getAuth(app);

export default app;
