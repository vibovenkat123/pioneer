// import initialize app and get performance
import { initializeApp } from "firebase/app";
import { getPerformance } from "firebase/performance";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// create firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDEVwKrFPXGTpiTvuaUrwEsR94feaScpJ8",
  authDomain: "pioneer-dev-c22de.firebaseapp.com",
  projectId: "pioneer-dev-c22de",
  storageBucket: "pioneer-dev-c22de.appspot.com",
  messagingSenderId: "596670985746",
  appId: "1:596670985746:web:480dab700f215d74a84acb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let perf;
// only get performance on the client
if (typeof window !== "undefined") {
  perf = getPerformance(app);
}
// get storage bucket
export const storage = getStorage(app);
// get performance
export { perf };
// get auth
export const auth = getAuth(app);
// get provider
export const provider = new GoogleAuthProvider;
// get firestore database
export const db = getFirestore(app);