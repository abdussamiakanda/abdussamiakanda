import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2FLUPlMF4tVFBPtIea1AUzM6RgWeaZ1o",
    authDomain: "life-abdussamiakanda.firebaseapp.com",
    databaseURL: "https://life-abdussamiakanda-default-rtdb.firebaseio.com",
    projectId: "life-abdussamiakanda",
    storageBucket: "life-abdussamiakanda.appspot.com",
    messagingSenderId: "699844726358",
    appId: "1:699844726358:web:98bb59195a9e33354bf5f7",
    measurementId: "G-S411V27PLT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getDatabase(app);
export const auth = getAuth(app);

export default app;

