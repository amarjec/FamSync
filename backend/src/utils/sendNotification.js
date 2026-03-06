const initializeFirebase = require('../config/firebase');

const sendNotification = async ({ token, title, body, data = {} }) => {
  if (!token) {
    return;
  }

  const firebase = initializeFirebase();
  if (!firebase) {
    return;
  }

  try {
    await firebase.messaging().send({
      token,
      notification: { title, body },
      data
    });
  } catch (error) {
    console.error('FCM send error:', error.message);
  }
};

module.exports = sendNotification;
