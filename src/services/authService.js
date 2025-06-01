import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export { auth }; 