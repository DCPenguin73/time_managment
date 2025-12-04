// Firebase initialization (compat SDK)

const firebaseConfig = {
  apiKey: "AIzaSyBpPCKao57aZ2o7NEN4hl_-ehsHyua1K-s",
  authDomain: "time-management-e095d.firebaseapp.com",
  databaseURL: "https://time-management-e095d-default-rtdb.firebaseio.com",
  projectId: "time-management-e095d",
  storageBucket: "time-management-e095d.firebasestorage.app",
  messagingSenderId: "243527966893",
  appId: "1:243527966893:web:277fa7425019051b1ee624"
};

firebase.initializeApp(firebaseConfig);

// Global handles used by other files
const auth = firebase.auth();
const firestore = firebase.firestore();

// If you want offline persistence (optional, single tab only):
// firestore.enablePersistence().catch(err => console.warn("persistence:", err && err.message));
