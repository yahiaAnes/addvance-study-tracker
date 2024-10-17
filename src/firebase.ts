// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
 
  databaseURL: "https://advance-study-tracker-default-rtdb.firebaseio.com/",
  
  apiKey: "AIzaSyCKhHe8lTwRrQeo9cewrK-5dI3bKEa-51M",
  authDomain: "advance-study-tracker.firebaseapp.com",
  projectId: "advance-study-tracker",
  storageBucket: "advance-study-tracker.appspot.com",
  messagingSenderId: "619037432692",
  appId: "1:619037432692:web:58201091940220b8e76a21",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
