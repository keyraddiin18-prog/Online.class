/* =========================================
   STUDENT.JS
========================================= */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const dashboard =
            document.querySelector(
                ".student-info"
            );

        if (!dashboard) {
            return;
        }

        loadStudentDashboard();

    }
);


/* =========================================
   LOAD STUDENT
========================================= */

function loadStudentDashboard() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    const nameElement =
        document.querySelector(
            ".student-info h2"
        );


    const smallElements =
        document.querySelectorAll(
            ".student-info small"
        );


    if (nameElement) {

        nameElement.textContent =
            user.name;

    }


    if (smallElements.length >= 2) {

        smallElements[1].textContent =
            `${user.grade} • Section ${user.section}`;

    }


    const welcome =
        document.querySelector(
            ".dashboard-welcome h1"
        );


    if (welcome) {

        welcome.textContent =
            `Welcome, ${user.name} 👋`;

    }

}


/* =========================================
   STUDENT CLASS JOIN
========================================= */

function joinStudentClass(classId) {

    if (!classId) {
        return;
    }

    saveData(
        "keyraddiin_current_class",
        classId
    );

    window.location.href =
        "live-class.html";

}


/* =========================================
   EXPORT
========================================= */

window.joinStudentClass =
    joinStudentClass;