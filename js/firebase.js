import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBIVp3XbgLUgu2Q06RxCo8oM5j4YIz9V7k",
    authDomain: "budgettracker-75aa0.firebaseapp.com",
    projectId: "budgettracker-75aa0",
    storageBucket: "budgettracker-75aa0.firebasestorage.app",
    messagingSenderId: "694531423880",
    appId: "1:694531423880:web:d37237e6609899be1f693d",
    measurementId: "G-BRHXCRQYX2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
