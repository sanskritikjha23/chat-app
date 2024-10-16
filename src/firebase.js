// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAPZPLRqEuUUtYyaWoKxgZVvZaVGMrHhGs",
  authDomain: "chat-app-deaad.firebaseapp.com",
  projectId: "chat-app-deaad",
  storageBucket: "chat-app-deaad.appspot.com",
  messagingSenderId: "511063480411",
  appId: "1:511063480411:web:e2384445d16073f96c877e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app);

export { auth, db , storage};
