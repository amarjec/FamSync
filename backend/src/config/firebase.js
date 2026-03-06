const admin = require('firebase-admin');

let initialized = false;

const initializeFirebase = () => {
  if (initialized) {
    return admin;
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    console.warn('Firebase env vars missing. Notifications will be skipped.');
    return null;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    initialized = true;
    return admin;
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    return null;
  }
};

module.exports = initializeFirebase;
