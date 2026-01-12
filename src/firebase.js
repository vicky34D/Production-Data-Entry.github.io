import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBISAfWfBTZLgfREmCPzm-WgCweZwMlH3s",
    authDomain: "production-db-15a9e.firebaseapp.com",
    projectId: "production-db-15a9e",
    storageBucket: "production-db-15a9e.firebasestorage.app",
    messagingSenderId: "131734445186",
    appId: "1:131734445186:web:bf22d78b8984d3dd0b289b",
    measurementId: "G-2GK0MKQ43B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
