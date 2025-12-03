import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRKWJhqIDFSyKmbRmtHKa0A-vdUZrpf3Q",
  authDomain: "registration-page-1d09f.firebaseapp.com",
  projectId: "registration-page-1d09f",
  storageBucket: "registration-page-1d09f.firebasestorage.app",
  messagingSenderId: "447257710518",
  appId: "1:447257710518:web:74285859d4d149dffdbb17"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
