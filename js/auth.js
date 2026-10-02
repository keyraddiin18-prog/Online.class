/*
========================================================
KEYRADDIIN ONLINE CLASS
Authentication System

Student:
- Student ID + Password
- Phone Number stored in profile
- No email required from the student

Teacher/Admin:
- Email + Password

Firebase Authentication:
- Uses an internal Firebase email for student accounts
- Student never needs to enter that email
========================================================
*/

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
  firebaseAuth,
  firestore
} from "../firebase/config.js";


/* =====================================================
   CONFIGURATION
===================================================== */

/*
  This is an INTERNAL authentication email domain.

  Students will NOT see or enter this email.

  It is only used because Firebase Email/Password
  Authentication requires an email internally.
*/

const STUDENT_AUTH_DOMAIN =
  "keyraddiin-online-class.firebaseapp.com";


/* =====================================================
   HELPERS
===================================================== */

/**
 * Convert Student ID into a Firebase-safe internal email.
 *
 * Example:
 * KDM10025
 *
 * becomes:
 * kdm10025@keyraddiin-online-class.firebaseapp.com
 */
function studentIdToAuthEmail(studentId) {

  const cleanStudentId = String(studentId)
    .trim()
    .toLowerCase();

  if (!cleanStudentId) {
    throw new Error("Student ID is required.");
  }

  /*
    Only allow letters, numbers, dot, underscore and hyphen.
  */
  if (!/^[a-z0-9._-]+$/.test(cleanStudentId)) {
    throw new Error(
      "Student ID can contain only letters, numbers, dots, underscores and hyphens."
    );
  }

  return `${cleanStudentId}@${STUDENT_AUTH_DOMAIN}`;
}


/**
 * Clean phone number.
 */
function normalizePhone(phoneNumber) {

  return String(phoneNumber)
    .trim()
    .replace(/\s+/g, "");
}


/**
 * Validate Ethiopian-style phone number.

   Accepted examples:

   0912345678
   0712345678
   +251912345678
   +251712345678

   This is only basic validation.
 */
function isValidPhoneNumber(phoneNumber) {

  const phone = normalizePhone(phoneNumber);

  return /^(09|07)\d{8}$/.test(phone) ||
         /^\+251(9|7)\d{8}$/.test(phone);
}


/**
 * Get current user's Firestore profile.
 */
export async function getUserProfile(uid) {

  if (!uid) {
    return null;
  }

  const userRef = doc(
    firestore,
    "users",
    uid
  );

  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    uid: snapshot.id,
    ...snapshot.data()
  };
}


/* =====================================================
   STUDENT REGISTRATION
===================================================== */

/**
 * Register a new student.
 *
 * Required:
 * fullName
 * phoneNumber
 * studentId
 * grade
 * section
 * password
 */
export async function registerStudent({
  fullName,
  phoneNumber,
  studentId,
  grade,
  section,
  password
}) {

  /* ---------- Basic validation ---------- */

  const cleanName = String(fullName || "").trim();
  const cleanPhone = normalizePhone(phoneNumber);
  const cleanStudentId = String(studentId || "").trim();
  const cleanGrade = String(grade || "").trim();
  const cleanSection = String(section || "").trim();

  if (!cleanName) {
    throw new Error("Please enter your full name.");
  }

  if (!cleanPhone) {
    throw new Error("Please enter your phone number.");
  }

  if (!isValidPhoneNumber(cleanPhone)) {
    throw new Error(
      "Please enter a valid phone number."
    );
  }

  if (!cleanStudentId) {
    throw new Error("Please enter your Student ID.");
  }

  if (!/^[A-Za-z0-9._-]+$/.test(cleanStudentId)) {
    throw new Error(
      "Student ID contains invalid characters."
    );
  }

  if (!cleanGrade) {
    throw new Error("Please select your grade.");
  }

  if (!cleanSection) {
    throw new Error("Please enter your section.");
  }

  if (!password) {
    throw new Error("Please enter a password.");
  }

  if (password.length < 6) {
    throw new Error(
      "Password must be at least 6 characters."
    );
  }


  /* ---------- Create internal Firebase email ---------- */

  const internalEmail =
    studentIdToAuthEmail(cleanStudentId);


  /* ---------- Create Firebase Auth account ---------- */

  const credential =
    await createUserWithEmailAndPassword(
      firebaseAuth,
      internalEmail,
      password
    );

  const user = credential.user;


  /* ---------- Update Firebase profile ---------- */

  await updateProfile(user, {
    displayName: cleanName
  });


  /* ---------- Save student profile ---------- */

  await setDoc(
    doc(firestore, "users", user.uid),
    {
      uid: user.uid,

      fullName: cleanName,

      /*
        Phone number is stored as profile information.
        It is NOT used as a password.
      */
      phoneNumber: cleanPhone,

      studentId: cleanStudentId,

      grade: cleanGrade,

      section: cleanSection,

      role: "student",

      accountStatus: "active",

      createdAt: serverTimestamp(),

      updatedAt: serverTimestamp()
    }
  );


  /* ---------- Save Student ID lookup ---------- */

  /*
    This document makes the Student ID unique.

    IMPORTANT:
    Firestore Security Rules must protect this collection.
  */

  await setDoc(
    doc(
      firestore,
      "studentIds",
      cleanStudentId.toLowerCase()
    ),
    {
      studentId: cleanStudentId,
      uid: user.uid,
      createdAt: serverTimestamp()
    }
  );


  return {
    uid: user.uid,
    fullName: cleanName,
    studentId: cleanStudentId,
    phoneNumber: cleanPhone,
    grade: cleanGrade,
    section: cleanSection,
    role: "student"
  };
}


/* =====================================================
   STUDENT LOGIN
===================================================== */

/**
 * Login student using:
 *
 * Student ID + Password
 */
export async function loginStudent(
  studentId,
  password
) {

  const cleanStudentId =
    String(studentId || "").trim();

  if (!cleanStudentId) {
    throw new Error(
      "Please enter your Student ID."
    );
  }

  if (!password) {
    throw new Error(
      "Please enter your password."
    );
  }

  const internalEmail =
    studentIdToAuthEmail(cleanStudentId);


  /* ---------- Firebase Login ---------- */

  const credential =
    await signInWithEmailAndPassword(
      firebaseAuth,
      internalEmail,
      password
    );

  const user = credential.user;


  /* ---------- Get student profile ---------- */

  const profile =
    await getUserProfile(user.uid);


  if (!profile) {

    await signOut(firebaseAuth);

    throw new Error(
      "Student profile was not found."
    );
  }


  /* ---------- Check role ---------- */

  if (profile.role !== "student") {

    await signOut(firebaseAuth);

    throw new Error(
      "This account is not a student account."
    );
  }


  /* ---------- Check account status ---------- */

  if (
    profile.accountStatus &&
    profile.accountStatus !== "active"
  ) {

    await signOut(firebaseAuth);

    throw new Error(
      "Your student account is not active."
    );
  }


  return {
    user,
    profile
  };
}


/* =====================================================
   TEACHER / ADMIN LOGIN
===================================================== */

/**
 * Teacher/Admin login.
 *
 * This keeps normal email/password authentication
 * available for teacher/admin accounts.
 */
export async function loginUser(
  email,
  password
) {

  if (!email) {
    throw new Error(
      "Please enter your email address."
    );
  }

  if (!password) {
    throw new Error(
      "Please enter your password."
    );
  }

  const credential =
    await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

  const user = credential.user;

  const profile =
    await getUserProfile(user.uid);

  return {
    user,
    profile
  };
}


/* =====================================================
   LOGOUT
===================================================== */

export async function logoutFirebaseUser() {

  await signOut(firebaseAuth);

  return true;
}


/* =====================================================
   AUTH STATE
===================================================== */

export function watchAuthState(callback) {

  return onAuthStateChanged(
    firebaseAuth,
    async (user) => {

      if (!user) {

        callback(null, null);

        return;
      }

      try {

        const profile =
          await getUserProfile(user.uid);

        callback(user, profile);

      } catch (error) {

        console.error(
          "Failed to load user profile:",
          error
        );

        callback(user, null);
      }
    }
  );
}


/* =====================================================
   FIREBASE ERROR MESSAGES
===================================================== */

export function getAuthErrorMessage(error) {

  if (!error) {
    return "An unknown error occurred.";
  }

  const code =
    error.code || "";

  switch (code) {

    case "auth/email-already-in-use":
      return "This Student ID is already registered.";

    case "auth/invalid-email":
      return "The Student ID format is invalid.";

    case "auth/weak-password":
      return "Password must be at least 6 characters.";

    case "auth/invalid-credential":
      return "Incorrect Student ID or password.";

    case "auth/wrong-password":
      return "Incorrect Student ID or password.";

    case "auth/user-not-found":
      return "Student account not found.";

    case "auth/user-disabled":
      return "This student account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";

    case "permission-denied":
      return "You do not have permission to perform this action.";

    default:
      return error.message ||
        "Authentication failed. Please try again.";
  }
}


/* =====================================================
   EXPORTS
===================================================== */

export {
  studentIdToAuthEmail,
  normalizePhone,
  isValidPhoneNumber
};