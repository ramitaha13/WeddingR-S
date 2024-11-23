import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBjd4OVnO8-W1ZG7S0Mke-4cGSx1EryDsw",
  authDomain: "booking-appointments-4c1b0.firebaseapp.com",
  databaseURL: "https://booking-appointments-4c1b0-default-rtdb.firebaseio.com",
  projectId: "booking-appointments-4c1b0",
  storageBucket: "booking-appointments-4c1b0.appspot.com",
  messagingSenderId: "201722682570",
  appId: "1:201722682570:web:a8b0e327391f5a04336833",
  measurementId: "G-GDFX1HNNE5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
