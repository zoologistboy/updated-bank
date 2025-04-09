// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDH__iEQK8uaBS10EOamzvEJZVYu7AYkvo",
  authDomain: "bankingapp-1eb5e.firebaseapp.com",
  projectId: "bankingapp-1eb5e",
  storageBucket: "bankingapp-1eb5e.firebasestorage.app",
  messagingSenderId: "324926746789",
  appId: "1:324926746789:web:efe8372bd9aa6a24099d4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get elements
const loginForm = document.getElementById('loginForm');
const errorP = document.getElementById('errorP');
const createBTN = document.getElementById('createBTN'); // Ensure this exists in HTML
const createBTNB = document.getElementById('createBTNB'); // Ensure this exists in HTML

// Add event listener
loginForm.addEventListener('submit', login);

async function login(e) {
  e.preventDefault(); // Prevent form submission

  try {
    console.log('Logging in...');

    // Hide primary button and show loading button
    createBTN.classList.add("d-none");
    createBTNB.classList.remove("d-none");
    createBTN.disabled = true;

    // Get form data
    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();

    // Regex validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!emailRegex.test(email)) throw new Error('* Please enter a valid email address');
    if (!passwordRegex.test(password)) throw new Error('* Password must be at least 8 characters long and include a number and a special character');

    // Firebase login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Login successful', userCredential.user);

    // Redirect or display success message
    window.location.href = `../htmls/dashboard.html?id=${userCredential.user.uid}`; // Change to your dashboard page

  }  catch (error) {
    console.log(error);

    // Firebase auth-specific error messages
    if (error.code === "auth/wrong-password") {
      errorP.textContent = "* Incorrect password. Please try again.";
    } else if (error.code === "auth/user-not-found") {
      errorP.textContent = "* No account found with this email.";
    } else if (error.code === "auth/invalid-email") {
      errorP.textContent = "* Invalid email format.";
    } else {
      errorP.textContent = error.message.includes("auth/") ? "* Invalid email or password" : error.message;
    }
  }
   finally {
    // Reset button state
    createBTN.classList.remove("d-none");
    createBTNB.classList.add("d-none");
    createBTN.disabled = false;
    
  }
}
