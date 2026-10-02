/* =========================================
   AUTH.JS
   KEYRADDIIN ONLINE CLASS
========================================= */

"use strict";


/* =========================================
   DEFAULT DEMO USERS
========================================= */

const DEMO_USERS = [

    {
        id: "KM-00000001",
        password: "student123",
        name: "Student Name",
        role: "student",
        grade: "Grade 10",
        section: "A"
    },

    {
        id: "TEACHER-001",
        password: "teacher123",
        name: "Teacher Name",
        role: "teacher",
        grade: "Grade 10",
        section: "A"
    }

];


/* =========================================
   LOGIN FORM
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "loginForm"
            );

        if (!form) {
            return;
        }

        form.addEventListener(
            "submit",
            handleLogin
        );

    }
);


/* =========================================
   LOGIN
========================================= */

function handleLogin(event) {

    event.preventDefault();

    const idInput =
        document.getElementById(
            "studentId"
        );

    const passwordInput =
        document.getElementById(
            "password"
        );

    if (!idInput || !passwordInput) {
        return;
    }

    const id =
        idInput.value.trim();

    const password =
        passwordInput.value.trim();


    if (!id || !password) {

        showNotification(
            "Please enter your ID and password.",
            "error"
        );

        return;
    }


    const user =
        DEMO_USERS.find(
            item =>
                item.id.toLowerCase() ===
                id.toLowerCase() &&
                item.password === password
        );


    if (!user) {

        showNotification(
            "Invalid ID or password.",
            "error"
        );

        return;
    }


    saveCurrentUser(user);


    if (user.role === "teacher") {

        window.location.href =
            "teacher-dashboard.html";

    } else {

        window.location.href =
            "student-dashboard.html";

    }

}


/* =========================================
   AUTH CHECK
========================================= */

function requireLogin() {

    const user =
        getData(
            "keyraddiin_current_user"
        );

    if (!user) {

        window.location.href =
            "login.html";

        return null;

    }

    return user;

}


/* =========================================
   ROLE CHECK
========================================= */

function requireRole(role) {

    const user =
        requireLogin();

    if (!user) {
        return null;
    }

    if (user.role !== role) {

        showNotification(
            "You do not have permission to access this page.",
            "error"
        );

        setTimeout(() => {

            window.location.href =
                "student-dashboard.html";

        }, 1200);

        return null;

    }

    return user;

}


/* =========================================
   GET CURRENT USER
========================================= */

function getCurrentUser() {

    return getData(
        "keyraddiin_current_user"
    );

}


/* =========================================
   LOGOUT
========================================= */

function authLogout() {

    localStorage.removeItem(
        "keyraddiin_current_user"
    );

    window.location.href =
        "login.html";

}


/* =========================================
   EXPORT
========================================= */

window.requireLogin =
    requireLogin;

window.requireRole =
    requireRole;

window.getCurrentUser =
    getCurrentUser;

window.authLogout =
    authLogout;