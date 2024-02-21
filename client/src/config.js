// config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBNwdkIToUy7qDVDYeMSgq8BfU451zsAhQ",
    authDomain: "react-ban-kinh.firebaseapp.com",
    databaseURL: "https://react-ban-kinh-default-rtdb.firebaseio.com",
    projectId: "react-ban-kinh",
    storageBucket: "react-ban-kinh.appspot.com",
    messagingSenderId: "635036795045",
    appId: "1:635036795045:web:aa11fc520ef1487eb48d4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const storage = getStorage(app)

export const API_URL = 'http://localhost:5000'
export const CLIENT_ID = process.env.CLIENT_ID || "AbEkMIt57ky9uFBp5IUSAyEEZq_f4PbXCIIXPAzxVl5LXQjjMCvd82yWQRJFiw39jnwKoQfleIvq-3iR"
export const APP_SECRET = process.env.APP_SECRET || "EMnfFIhE7d0kZZDLKST-0LWbOHIzjYC-j__bVFFejZgT2mMdTMliEmiGS1Zr6VxWheTMZpYPzpQhR19c"