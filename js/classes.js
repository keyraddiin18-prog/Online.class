/* =========================================================
   KEYRADDIIN ONLINE CLASS
   js/class-details.js

   PURPOSE
   ---------------------------------------------------------
   - Read class ID from URL
   - Load one class from Firestore
   - Load lessons belonging to that class
   - Show PDF materials
   - Show live class button only when live
   - No fake data
   ========================================================= */


import {
    getClass,
    getLessons
} from "../firebase/database.js";



/* =========================================================
   PAGE STATE
========================================================= */

let currentClass = null;

let currentLessons = [];



/* =========================================================
   DOM ELEMENTS
========================================================= */

const classTitle =
    document.getElementById("classTitle");

const classDescription =
    document.getElementById("classDescription");

const classStatus =
    document.getElementById("classStatus");

const statusText =
    document.getElementById("statusText");

const classMeta =
    document.getElementById("classMeta");

const joinLiveBtn =
    document.getElementById("joinLiveBtn");

const lessonsList =
    document.getElementById("lessonsList");

const lessonCount =
    document.getElementById("lessonCount");

const infoSubject =
    document.getElementById("infoSubject");

const infoGrade =
    document.getElementById("infoGrade");

const infoStudents =
    document.getElementById("infoStudents");

const infoTeacher =
    document.getElementById("infoTeacher");

const infoLessons =
    document.getElementById("infoLessons");

const infoPDFs =
    document.getElementById("infoPDFs");

const yearElement =
    document.getElementById("year");



/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeClassDetails
);



async function initializeClassDetails() {

    setCurrentYear();


    const classId =
        getClassIdFromURL();


    if (!classId) {

        showPageError(
            "Class Not Found",
            "No class ID was provided."
        );

        return;

    }


    await loadClassDetails(
        classId
    );

}



/* =========================================================
   GET CLASS ID FROM URL
========================================================= */

function getClassIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get("id");

}



/* =========================================================
   LOAD CLASS
========================================================= */

async function loadClassDetails(
    classId
) {

    try {

        const classSnapshot =
            await getClass(classId);


        /*
         * Firebase getDoc()
         * returns DocumentSnapshot.
         */

        if (
            !classSnapshot ||
            !classSnapshot.exists()
        ) {

            showPageError(
                "Class Not Found",
                "This class does not exist or is no longer available."
            );

            return;

        }


        currentClass =
            classSnapshot.data();


        currentClass.id =
            classId;


        renderClass(
            currentClass
        );


        await loadLessons(
            classId
        );


    } catch (error) {

        console.error(
            "Class details error:",
            error
        );


        showPageError(
            "Unable to Load Class",
            "Please check your internet connection and try again."
        );

    }

}



/* =========================================================
   RENDER CLASS
========================================================= */

function renderClass(
    classData
) {

    const subject =
        getClassName(
            classData
        );


    const grade =
        getGrade(
            classData
        );


    const teacher =
        getTeacherName(
            classData
        );


    const students =
        getStudentCount(
            classData
        );


    const live =
        isLiveClass(
            classData
        );


    const description =
        classData.description ||
        "Online learning class with lessons and learning materials.";


    /*
     * PAGE TITLE
     */

    document.title =
        `${subject} | KEYRADDIIN ONLINE CLASS`;


    /*
     * HERO
     */

    classTitle.textContent =
        subject;


    classDescription.textContent =
        description;


    /*
     * STATUS
     */

    updateStatus(
        live
    );


    /*
     * META
     */

    classMeta.innerHTML = "";


    if (grade) {

        addMetaItem(
            "🎓",
            `Grade ${grade}`
        );

    }


    if (teacher) {

        addMetaItem(
            "👨‍🏫",
            teacher
        );

    }


    addMetaItem(
        "👥",
        `${students} Students`
    );


    /*
     * SIDEBAR
     */

    infoSubject.textContent =
        subject || "—";


    infoGrade.textContent =
        grade
            ? `Grade ${grade}`
            : "—";


    infoStudents.textContent =
        String(students);


    infoTeacher.textContent =
        teacher || "—";


    /*
     * LIVE BUTTON
     */

    if (live) {

        showLiveButton(
            classData
        );

    } else {

        hideLiveButton();

    }

}



/* =========================================================
   STATUS
========================================================= */

function updateStatus(
    live
) {

    if (!classStatus) {
        return;
    }


    if (live) {

        classStatus.classList.add(
            "live"
        );


        statusText.textContent =
            "LIVE NOW";

    } else {

        classStatus.classList.remove(
            "live"
        );


        statusText.textContent =
            "AVAILABLE";

    }

}



/* =========================================================
   ADD META ITEM
========================================================= */

function addMetaItem(
    icon,
    text
) {

    const item =
        document.createElement("span");


    item.className =
        "meta-item";


    item.innerHTML = `

        <span>
            ${icon}
        </span>

        <span>
            ${escapeHTML(text)}
        </span>

    `;


    classMeta.appendChild(
        item
    );

}



/* =========================================================
   LIVE BUTTON
========================================================= */

function showLiveButton(
    classData
) {

    if (!joinLiveBtn) {
        return;
    }


    joinLiveBtn.classList.remove(
        "hidden"
    );


    joinLiveBtn.href =
        `live-class.html?id=${encodeURIComponent(
            classData.id
        )}`;

}



function hideLiveButton() {

    if (!joinLiveBtn) {
        return;
    }


    joinLiveBtn.classList.add(
        "hidden"
    );


    joinLiveBtn.removeAttribute(
        "href"
    );

}



/* =========================================================
   LOAD LESSONS
========================================================= */

async function loadLessons(
    classId
) {

    showLessonsLoading();


    try {

        const snapshot =
            await getLessons(
                classId
            );


        currentLessons = [];


        snapshot.forEach(
            (doc) => {

                currentLessons.push({

                    id: doc.id,

                    ...doc.data()

                });

            }
        );


        /*
         * Sort by lesson/unit number
         */

        currentLessons.sort(
            sortLessons
        );


        renderLessons();


    } catch (error) {

        console.error(
            "Lessons loading error:",
            error
        );


        showLessonsError();

    }

}



/* =========================================================
   SORT LESSONS
========================================================= */

function sortLessons(
    a,
    b
) {

    const aOrder =
        getLessonOrder(a);

    const bOrder =
        getLessonOrder(b);


    if (
        aOrder !== null &&
        bOrder !== null
    ) {

        return aOrder - bOrder;

    }


    if (
        aOrder !== null &&
        bOrder === null
    ) {

        return -1;

    }


    if (
        aOrder === null &&
        bOrder !== null
    ) {

        return 1;

    }


    return getLessonTitle(a)
        .localeCompare(
            getLessonTitle(b)
        );

}



/* =========================================================
   LESSON ORDER
========================================================= */

function getLessonOrder(
    lesson
) {

    const value =
        lesson.order ??
        lesson.lessonNumber ??
        lesson.unitNumber ??
        lesson.number;


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : null;

}



/* =========================================================
   LESSON TITLE
========================================================= */

function getLessonTitle(
    lesson
) {

    return (
        lesson.title ||
        lesson.lessonTitle ||
        lesson.name ||
        lesson.unit ||
        "Lesson"
    );

}



/* =========================================================
   RENDER LESSONS
========================================================= */

function renderLessons() {

    if (!lessonsList) {
        return;
    }


    const total =
        currentLessons.length;


    updateLessonCounts();


    if (total === 0) {

        showNoLessons();

        return;

    }


    lessonsList.innerHTML = "";


    currentLessons.forEach(
        (lesson, index) => {

            const item =
                createLessonItem(
                    lesson,
                    index
                );


            lessonsList.appendChild(
                item
            );

        }
    );

}



/* =========================================================
   CREATE LESSON ITEM
========================================================= */

function createLessonItem(
    lesson,
    index
) {

    const item =
        document.createElement("article");


    item.className =
        "lesson-item";


    const order =
        getLessonOrder(
            lesson
        );


    const number =
        order !== null
            ? order
            : index + 1;


    const title =
        escapeHTML(
            getLessonTitle(
                lesson
            )
        );


    const description =
        escapeHTML(
            lesson.description ||
            lesson.summary ||
            "Learning material"
        );


    const pdfURL =
        getPDFURL(
            lesson
        );


    const pdfName =
        escapeHTML(
            lesson.pdfName ||
            "PDF Lesson"
        );


    let pdfHTML = "";


    if (pdfURL) {

        pdfHTML = `

            <a
                class="lesson-pdf"
                href="${escapeAttribute(
                    pdfURL
                )}"
                target="_blank"
                rel="noopener noreferrer"
                title="Open PDF"
            >

                <span>
                    📄
                </span>

                <span>
                    Open PDF
                </span>

            </a>

        `;

    } else {

        pdfHTML = `

            <span
                class="lesson-pdf"
                style="
                    background:#f1f5f9;
                    color:#94a3b8;
                    cursor:default;
                "
                title="No PDF available"
            >

                📄

                <span>
                    No PDF
                </span>

            </span>

        `;

    }


    item.innerHTML = `

        <div class="lesson-number">
            ${number}
        </div>


        <div class="lesson-info">

            <h3>
                ${title}
            </h3>

            <p>
                ${description}
            </p>

        </div>


        ${pdfHTML}

    `;


    /*
     * Keep PDF name available as title
     */

    if (pdfURL) {

        const pdfButton =
            item.querySelector(
                ".lesson-pdf"
            );


        if (pdfButton) {

            pdfButton.setAttribute(
                "aria-label",
                `Open ${pdfName}`
            );

        }

    }


    return item;

}



/* =========================================================
   PDF URL
========================================================= */

function getPDFURL(
    lesson
) {

    return (
        lesson.pdfURL ||
        lesson.pdfUrl ||
        lesson.pdf ||
        lesson.fileURL ||
        lesson.fileUrl ||
        ""
    );

}



/* =========================================================
   UPDATE LESSON COUNTS
========================================================= */

function updateLessonCounts() {

    const total =
        currentLessons.length;


    const pdfTotal =
        currentLessons.filter(
            (lesson) =>
                Boolean(
                    getPDFURL(
                        lesson
                    )
                )
        ).length;


    if (lessonCount) {

        lessonCount.textContent =
            total === 1
                ? "1 Lesson"
                : `${total} Lessons`;

    }


    if (infoLessons) {

        infoLessons.textContent =
            String(total);

    }


    if (infoPDFs) {

        infoPDFs.textContent =
            String(pdfTotal);

    }

}



/* =========================================================
   LOADING
========================================================= */

function showLessonsLoading() {

    lessonsList.innerHTML = `

        <div class="details-message">

            <div
                class="details-loading"
            ></div>

            <p>
                Loading lessons...
            </p>

        </div>

    `;

}



/* =========================================================
   NO LESSONS
========================================================= */

function showNoLessons() {

    lessonsList.innerHTML = `

        <div class="details-message">

            <div class="details-message-icon">
                📚
            </div>

            <h3>
                No Lessons Yet
            </h3>

            <p>
                The teacher has not uploaded
                lessons or learning materials
                for this class yet.
            </p>

        </div>

    `;

}



/* =========================================================
   LESSON ERROR
========================================================= */

function showLessonsError() {

    lessonsList.innerHTML = `

        <div class="details-message">

            <div class="details-message-icon">
                ⚠️
            </div>

            <h3>
                Unable to Load Lessons
            </h3>

            <p>
                Please check your internet
                connection and try again.
            </p>

        </div>

    `;


    if (lessonCount) {

        lessonCount.textContent =
            "Unavailable";

    }

}



/* =========================================================
   PAGE ERROR
========================================================= */

function showPageError(
    title,
    message
) {

    document.title =
        `${title} | KEYRADDIIN ONLINE CLASS`;


    if (classTitle) {

        classTitle.textContent =
            title;

    }


    if (classDescription) {

        classDescription.textContent =
            message;

    }


    if (classStatus) {

        classStatus.classList.remove(
            "live"
        );

    }


    if (statusText) {

        statusText.textContent =
            "UNAVAILABLE";

    }


    hideLiveButton();


    if (classMeta) {

        classMeta.innerHTML = "";

    }


    if (lessonsList) {

        lessonsList.innerHTML = `

            <div class="details-message">

                <div
                    class="details-message-icon"
                >
                    ⚠️
                </div>

                <h3>
                    ${escapeHTML(title)}
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>

        `;

    }


    if (lessonCount) {

        lessonCount.textContent =
            "0 Lessons";

    }


    if (infoSubject) {
        infoSubject.textContent = "—";
    }

    if (infoGrade) {
        infoGrade.textContent = "—";
    }

    if (infoStudents) {
        infoStudents.textContent = "—";
    }

    if (infoTeacher) {
        infoTeacher.textContent = "—";
    }

    if (infoLessons) {
        infoLessons.textContent = "0";
    }

    if (infoPDFs) {
        infoPDFs.textContent = "0";
    }

}



/* =========================================================
   CLASS HELPERS
========================================================= */

function getClassName(
    classData
) {

    return (
        classData.subject ||
        classData.name ||
        classData.title ||
        "Untitled Class"
    );

}



function getGrade(
    classData
) {

    return (
        classData.grade ||
        classData.classGrade ||
        ""
    );

}



function getTeacherName(
    classData
) {

    return (
        classData.teacherName ||
        classData.teacher ||
        classData.teacherDisplayName ||
        ""
    );

}



function getStudentCount(
    classData
) {

    const value =
        classData.studentCount ??
        classData.studentsCount ??
        classData.participantsCount ??
        0;


    const number =
        Number(value);


    return Number.isFinite(number) &&
        number >= 0
        ? number
        : 0;

}



function isLiveClass(
    classData
) {

    return (
        classData.status === "live" ||
        classData.status === "LIVE" ||
        classData.isLive === true ||
        classData.live === true
    );

}



/* =========================================================
   CURRENT YEAR
========================================================= */

function setCurrentYear() {

    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();

    }

}



/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}



function escapeAttribute(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        );

}