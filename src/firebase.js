import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBCkyO4Wd4c8gwOuaastuFI4HagErrhP3E",
  authDomain: "plannerapp-65d32.firebaseapp.com",
  projectId: "plannerapp-65d32",
  storageBucket: "plannerapp-65d32.firebasestorage.app",
  messagingSenderId: "1082680503102",
  appId: "1:1082680503102:web:392d0229871c34cf9f1a6f",
  measurementId: "G-WZMFWGJ8JB"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
