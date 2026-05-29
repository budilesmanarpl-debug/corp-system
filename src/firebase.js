// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOVkuowWCw1j7Wfgg2k3jPfNId4hMj7M8",
  authDomain: "corp-system-ccc86.firebaseapp.com",
  projectId: "corp-system-ccc86",
  storageBucket: "corp-system-ccc86.firebasestorage.app",
  messagingSenderId: "698875326010",
  appId: "1:698875326010:web:8b2335b2ae087ff8750f03",
  measurementId: "G-4JX0H17N16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;