const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service.json'); // download from Firebase console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

module.exports = db;
