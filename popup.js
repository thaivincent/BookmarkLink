import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import  {firebaseConfig} from './firebase.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const  db = getFirestore(app)

// DOM Elements
const signInButton = document.getElementById('signInButton');
const authContainer = document.getElementById('auth-container');
const bookmarksContainer = document.getElementById('bookmarks-container');
const errorDiv = document.getElementById('error');

// Sign in with Google
signInButton.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (error) {
    errorDiv.textContent = `Sign-in failed: ${error.message}`;
  }
});

// Update UI based on auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    authContainer.style.display = 'none';
    bookmarksContainer.style.display = 'block';
    loadBookmarks(user.uid); // Load shared bookmarks
  } else {
    // User is signed out
    authContainer.style.display = 'block';
    bookmarksContainer.style.display = 'none';
  }
});

// Example: Load bookmarks (replace with your Firestore logic)
async function loadBookmarks(userId) {
  // Fetch bookmarks from Firestore and render them
}