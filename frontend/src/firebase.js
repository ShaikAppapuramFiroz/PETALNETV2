import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPzq-auNOxnopt0_iSWbCcK0K2e_-elAI",
  authDomain: "petalnetv2.firebaseapp.com",
  projectId: "petalnetv2",
  storageBucket: "petalnetv2.firebasestorage.app",
  messagingSenderId: "928277497582",
  appId: "1:928277497582:web:0242d4fc164a7aed40d5ff",
  measurementId: "G-KB7QY0FLDT",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let analytics = null;
try {
  if (typeof window !== "undefined") {
    analyticsIsSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
} catch {
  // ignore analytics errors
}

export { app, auth, analytics };

