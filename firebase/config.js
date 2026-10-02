/* =========================================
   KEYRADDIIN ONLINE CLASS
   FIREBASE CONFIGURATION
========================================= */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import { getDatabase } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

import { getStorage } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";


/* =========================================
   FIREBASE PROJECT CONFIG
========================================= */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT_ID.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT_ID.firebasestorage.app",

    messagingSenderId:
        "YOUR_MESSAGING_SENDER_ID",

    appId:
        "YOUR_APP_ID",

    databaseURL:
        "https://keyraddiin-online-class-default-rtdb.firebaseio.com/"

};


/* =========================================
   INITIALIZE FIREBASE
========================================= */

const app =
    initializeApp(
        firebaseConfig
    );


/* =========================================
   SERVICES
========================================= */

const firebaseAuth =
    getAuth(app);

const firestore =
    getFirestore(app);

const realtimeDatabase =
    getDatabase(app);

const firebaseStorage =
    getStorage(app);


/* =========================================
   EXPORT
========================================= */

export {

    app,

    firebaseAuth,

    firestore,

    realtimeDatabase,

    firebaseStorage

};