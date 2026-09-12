/* ============================================================
   PharmaCare — Firebase Configuration
   ------------------------------------------------------------
   👉 HOW TO CONNECT YOUR FIREBASE PROJECT:
   1. Go to https://console.firebase.google.com → your project
   2. Project Settings (⚙) → "Your apps" → Web app (</>) → register
   3. Copy the "firebaseConfig" values and paste them below
   4. Enable: Authentication → Email/Password, and Firestore Database
   5. Reload the app — it auto-switches to CLOUD (online) mode.

   While the keys still say "PASTE_..." the app runs in LOCAL mode
   (offline, browser-only) so nothing breaks before you connect.
   ============================================================ */
window.FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCp_liJVHGBDuLsL9oj1M7xNN3l-7Jj8Rc",
  authDomain:        "pharmency-management-system.firebaseapp.com",
  projectId:         "pharmency-management-system",
  storageBucket:     "pharmency-management-system.firebasestorage.app",
  messagingSenderId: "491936371664",
  appId:             "1:491936371664:web:00943d0d81c8078643dfd5",
  measurementId:     "G-ZR49ME5B2C"
};

/* Auto-detect: real keys → cloud mode. The ?local override (force offline demo) only works
   on localhost — on the deployed site it is ignored, so production is always cloud mode. */
(function(){
  var hasKeys = !String(window.FIREBASE_CONFIG.apiKey || "").includes("PASTE");
  var isLocalhost = /^(localhost$|127\.|0\.0\.0\.0$|\[::1\]$)/.test(location.hostname);
  var forceLocal = isLocalhost && /[?&]local\b/.test(location.search);
  window.FIREBASE_ENABLED = hasKeys && !forceLocal;
})();

/* Firebase Web SDK version loaded from the official CDN (ESM). */
window.FIREBASE_SDK_VERSION = "11.0.2";
