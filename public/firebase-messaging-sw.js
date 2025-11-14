importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBCkyO4Wd4c8gwOuaastuFI4HagErrhP3E",
  authDomain: "plannerapp-65d32.firebaseapp.com",
  projectId: "plannerapp-65d32",
  sstorageBucket: "plannerapp-65d32.firebasestorage.app",
  messagingSenderId: "1082680503102",
  appId: "1:1082680503102:web:392d0229871c34cf9f1a6f",
  measurementId: "G-WZMFWGJ8JB"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = { body: payload.notification.body };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
