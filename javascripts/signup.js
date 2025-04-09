// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, collection, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDH__iEQK8uaBS10EOamzvEJZVYu7AYkvo",
  authDomain: "bankingapp-1eb5e.firebaseapp.com",
  projectId: "bankingapp-1eb5e",
  storageBucket: "bankingapp-1eb5e.appspot.com",
  messagingSenderId: "324926746789",
  appId: "1:324926746789:web:efe8372bd9aa6a24099d4c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const bankUsersRef = collection(db, "bankUsers");

// DOM Elements
const signUpForm = document.getElementById('signUpForm');
const errorP = document.getElementById('errorP');
const createBTN = document.getElementById('createBTN');
const createBTNB = document.getElementById('createBTNB');
const logoClick = document.getElementById('logoClick');
const existing = document.getElementById('existing');

// Event Listeners
signUpForm?.addEventListener('submit', register);
logoClick?.addEventListener('click', goToHomePage);
existing?.addEventListener('click', goToLoginPage);

// Account Generation Functions
function generateAdvancedAccountNumber() {
  const prefix = '62'; // Standard bank prefix
  let accountNumber = prefix;
  
  // Generate 8 random digits
  for (let i = 0; i < 8; i++) {
    accountNumber += Math.floor(Math.random() * 10);
  }
  
  // Add Luhn check digit
  accountNumber += calculateLuhnCheckDigit(accountNumber);
  
  // Format with spacing (XXXX XXXX XX)
  return `${accountNumber.slice(0, 4)} ${accountNumber.slice(4, 8)} ${accountNumber.slice(8)}`;
}

function calculateLuhnCheckDigit(number) {
  let sum = 0;
  let alternate = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i), 10);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit = (digit % 10) + 1;
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return (10 - (sum % 10)) % 10;
}

// Utility Functions
function isValidAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 18;
}

function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
    messages: [
      password.length >= minLength ? null : "At least 8 characters",
      hasUpperCase ? null : "At least one uppercase letter",
      hasLowerCase ? null : "At least one lowercase letter",
      hasNumber ? null : "At least one number",
      hasSpecialChar ? null : "At least one special character"
    ].filter(msg => msg !== null)
  };
}

// Navigation Functions
function goToHomePage() {
  location.href = "../index.html";
} 

function goToLoginPage() {
  location.href = "../htmls/login.html";
}

// Main Registration Function
async function register(e) {
  e.preventDefault();
  
  try {
    // UI Loading state
    createBTN?.classList.add("d-none");
    createBTNB?.classList.remove("d-none");
    createBTN.disabled = true;
    errorP.textContent = '';
    
    // Get form values
    const userDetails = {
      name: signUpForm.fullName.value.trim(),
      phone: signUpForm.phone.value.trim(),
      email: signUpForm.email.value.trim().toLowerCase(),
      dob: signUpForm.dob.value.trim(),
      accountType: signUpForm.accountType.value.toUpperCase().trim(),
      password: signUpForm.password.value.trim(),
      confirmPassword: signUpForm.confirmPassword.value.trim(),
      terms: signUpForm.terms.checked,
      accountNumber: generateAdvancedAccountNumber(),
      accountBalance: 273.50, // Starting balance
      createdAt: new Date().toISOString()
    };

    // Validation
    if (!/^[A-Z][a-z]+(?: [A-Z][a-z]+)+$/.test(userDetails.name)) {
      throw new Error('Please enter a valid full name (e.g., John Smith)');
    }
    
    if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(userDetails.phone)) {
      throw new Error('Please enter a valid phone number');
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (!isValidAge(userDetails.dob)) {
      throw new Error('You must be at least 18 years old to register');
    }
    
    const passwordValidation = validatePassword(userDetails.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password requirements: ${passwordValidation.messages.join(', ')}`);
    }
    
    if (userDetails.password !== userDetails.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (!userDetails.terms) {
      throw new Error('You must accept the terms and conditions');
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userDetails.email, 
      userDetails.password
    );
    
    // Save additional user data to Firestore
    const { password, confirmPassword, terms, ...userData } = userDetails;
    await setDoc(doc(bankUsersRef, userCredential.user.uid), userData);
    
    // Success
    alert('Account created successfully! Your account number is: ' + userDetails.accountNumber);
    window.location.href = `../htmls/dashboard.html?id=${userCredential.user.uid}`;
    
  } catch (error) {
    console.error("Registration error:", error);
    
    // User-friendly error messages
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please use a different email.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use a stronger password.';
    } else if (error.code) {
      errorMessage = 'Registration failed. Please try again later.';
    }
    
    errorP.textContent = errorMessage;
    
  } finally {
    // Reset UI state
    if (createBTN && createBTNB) {
      createBTN.classList.remove("d-none");
      createBTNB.classList.add("d-none");
      createBTN.disabled = false;
    }
  }
}