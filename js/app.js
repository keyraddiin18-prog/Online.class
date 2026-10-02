/* =========================================
   KEYRADDIIN ONLINE CLASS
   APP.JS
========================================= */

"use strict";

/* =========================================
   GLOBAL APP OBJECT
========================================= */

const KEYRADDIIN_APP = {

    name: "KEYRADDIIN ONLINE CLASS",

    version: "1.0.0",

    currentUser: null,

    currentClass: null,

    initialized: false

};


/* =========================================
   PAGE READY
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    KEYRADDIIN_APP.initialized = true;

    loadSavedUser();

    setCurrentYear();

    setupGlobalButtons();

    console.log(
        "KEYRADDIIN ONLINE CLASS initialized."
    );

});


/* =========================================
   LOCAL USER
========================================= */

function loadSavedUser() {

    try {

        const savedUser =
            localStorage.getItem(
                "keyraddiin_current_user"
            );

        if (savedUser) {

            KEYRADDIIN_APP.currentUser =
                JSON.parse(savedUser);

        }

    } catch (error) {

        console.error(
            "Could not load saved user:",
            error
        );

    }

}


/* =========================================
   SAVE USER
========================================= */

function saveCurrentUser(user) {

    KEYRADDIIN_APP.currentUser = user;

    localStorage.setItem(
        "keyraddiin_current_user",
        JSON.stringify(user)
    );

}


/* =========================================
   LOGOUT
========================================= */

function logoutUser() {

    localStorage.removeItem(
        "keyraddiin_current_user"
    );

    KEYRADDIIN_APP.currentUser = null;

    window.location.href =
        "login.html";

}


/* =========================================
   CURRENT YEAR
========================================= */

function setCurrentYear() {

    const elements =
        document.querySelectorAll(
            "[data-current-year]"
        );

    const year =
        new Date().getFullYear();

    elements.forEach(element => {

        element.textContent = year;

    });

}


/* =========================================
   GLOBAL BUTTONS
========================================= */

function setupGlobalButtons() {

    const logoutButtons =
        document.querySelectorAll(
            "[data-logout]"
        );

    logoutButtons.forEach(button => {

        button.addEventListener(
            "click",
            logoutUser
        );

    });

}


/* =========================================
   SAFE STORAGE
========================================= */

function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        return true;

    } catch (error) {

        console.error(
            "Storage error:",
            error
        );

        return false;

    }

}


function getData(key, defaultValue = null) {

    try {

        const data =
            localStorage.getItem(key);

        if (!data) {
            return defaultValue;
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Could not read storage:",
            error
        );

        return defaultValue;

    }

}


/* =========================================
   PAGE NAVIGATION
========================================= */

function goTo(page) {

    window.location.href = page;

}


/* =========================================
   NOTIFICATION
========================================= */

function showNotification(
    message,
    type = "info"
) {

    const old =
        document.querySelector(
            ".keyraddiin-notification"
        );

    if (old) {
        old.remove();
    }

    const notification =
        document.createElement("div");

    notification.className =
        "keyraddiin-notification";

    notification.textContent =
        message;

    notification.style.position =
        "fixed";

    notification.style.top =
        "20px";

    notification.style.right =
        "20px";

    notification.style.zIndex =
        "99999";

    notification.style.padding =
        "12px 16px";

    notification.style.borderRadius =
        "8px";

    notification.style.background =
        type === "error"
            ? "#e53935"
            : "#0b3d91";

    notification.style.color =
        "#ffffff";

    notification.style.fontSize =
        "13px";

    notification.style.fontWeight =
        "700";

    document.body.appendChild(
        notification
    );

    setTimeout(() => {

        notification.remove();

    }, 3000);

}


/* =========================================
   EXPORT
========================================= */

window.KEYRADDIIN_APP =
    KEYRADDIIN_APP;

window.saveCurrentUser =
    saveCurrentUser;

window.logoutUser =
    logoutUser;

window.saveData =
    saveData;

window.getData =
    getData;

window.goTo =
    goTo;

window.showNotification =
    showNotification;