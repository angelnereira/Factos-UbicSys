// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-7875732711-2b800",
  appId: "1:133672149206:web:e73e0fb257492c64f36977",
  apiKey: "AIzaSyATnNpGkVVDXiCVJX3sBI388h5koK9iylU",
  authDomain: "studio-7875732711-2b800.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "133672149206"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
