import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Ganti dengan konfigurasi Firebase milik Anda
const firebaseConfig = {
  apiKey: "AIzaSyDVhr4FfUmV9mJRV4V6-Z9KhmFSwywt1gM",
  authDomain: "panitia-qurban-95df2.firebaseapp.com",
  projectId: "panitia-qurban-95df2",
  storageBucket: "panitia-qurban-95df2.firebasestorage.app",
  messagingSenderId: "652308608642",
  appId: "1:652308608642:web:1356dd0ada0e6e06fba69b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, app }; 