/**
 * Firebase project config. This is PUBLIC by design -- it just tells the
 * browser which Firebase project to talk to. It is not a secret and is
 * safe to commit/deploy as-is. Real security comes from the Firestore and
 * Storage security rules (see FIREBASE_SETUP.md), not from hiding this.
 *
 * Follow FIREBASE_SETUP.md to create your Firebase project, then replace
 * every "PASTE_ME" below with the values from Firebase Console -> Project
 * Settings -> General -> Your apps -> (web app) -> SDK setup and
 * configuration -> Config.
 */
window.firebase.initializeApp({
  apiKey: "PASTE_ME",
  authDomain: "PASTE_ME",
  projectId: "PASTE_ME",
  storageBucket: "PASTE_ME",
  messagingSenderId: "PASTE_ME",
  appId: "PASTE_ME"
});
