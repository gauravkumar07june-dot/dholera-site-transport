window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBJXRjZ8d1gz-Zrgl4IwmJz8aFMSCuEKmk",
  authDomain: "dholera-project-cdcfe.firebaseapp.com",
  projectId: "dholera-project-cdcfe",
  storageBucket: "dholera-project-cdcfe.firebasestorage.app",
  messagingSenderId: "403348455212",
  appId: "1:403348455212:web:0aeae031eb4e0c7ad3f689",
  measurementId: "G-4L9SNYZ880"
};

// Transport admin email(s). Must match the list in firestore.rules (function isAdmin).
// The admin signs in on the website like everyone else (create account + verify email).
window.ADMIN_EMAILS = ["gaurav.kumar21@lntecc.com"];

// Login codes by email: the Web app URL of login-code-script.gs (ends in /exec). See README → "Login codes by email".
window.OTP_URL = "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE";
