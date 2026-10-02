/* =========================================
   TEACHER.JS
   KEYRADDIIN ONLINE CLASS
========================================= */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const teacherPage =
            document.querySelector(
                ".teacher-stats"
            );

        if (teacherPage) {

            loadTeacherDashboard();

        }

        setupPDFUpload();

    }
);


/* =========================================
   TEACHER DASHBOARD
========================================= */

function loadTeacherDashboard() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    const title =
        document.querySelector(
            ".dashboard-welcome h1"
        );


    if (title) {

        title.textContent =
            `Teacher Dashboard 👨‍🏫`;

    }

}


/* =========================================
   PDF UPLOAD SETUP
========================================= */

function setupPDFUpload() {

    const input =
        document.getElementById(
            "pdfUpload"
        );

    if (!input) {
        return;
    }

    input.addEventListener(
        "change",
        handlePDFUpload
    );

}


/* =========================================
   PDF UPLOAD
========================================= */

function handlePDFUpload(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    if (
        file.type !==
        "application/pdf"
    ) {

        showNotification(
            "Please select a PDF file.",
            "error"
        );

        return;
    }


    const maxSize =
        20 * 1024 * 1024;


    if (file.size > maxSize) {

        showNotification(
            "PDF must be smaller than 20 MB.",
            "error"
        );

        return;
    }


    const fileURL =
        URL.createObjectURL(file);


    const pdfData = {

        name: file.name,

        size: file.size,

        type: file.type,

        url: fileURL,

        uploadedAt:
            new Date().toISOString()

    };


    /*
       Temporary local preview.

       Later:
       Firebase Storage
       ↓
       Firestore
       ↓
       Student access
    */

    window.currentPDF =
        pdfData;


    showPDFPreview(
        pdfData
    );


    showNotification(
        "PDF loaded successfully."
    );

}


/* =========================================
   PDF PREVIEW
========================================= */

function showPDFPreview(pdfData) {

    let viewer =
        document.getElementById(
            "pdfViewer"
        );


    if (!viewer) {

        viewer =
            document.createElement(
                "div"
            );

        viewer.id =
            "pdfViewer";

        viewer.style.marginTop =
            "20px";

        const container =
            document.querySelector(
                ".container"
            ) ||
            document.body;

        container.appendChild(
            viewer
        );

    }


    viewer.innerHTML = `

        <div
            style="
                background:#ffffff;
                border:1px solid #e1e7f0;
                border-radius:12px;
                padding:18px;
            "
        >

            <h3
                style="
                    margin-bottom:10px;
                    color:#172033;
                "
            >
                📄 ${escapeHTML(pdfData.name)}
            </h3>

            <p
                style="
                    color:#697386;
                    font-size:13px;
                    margin-bottom:15px;
                "
            >
                PDF ready for teaching.
            </p>

            <iframe
                src="${pdfData.url}"
                width="100%"
                height="600"
                style="
                    border:1px solid #ddd;
                    border-radius:8px;
                "
                title="PDF Viewer"
            ></iframe>

        </div>

    `;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================
   CREATE LESSON
========================================= */

function createLesson(data) {

    const lessons =
        getData(
            "keyraddiin_lessons",
            []
        );


    const lesson = {

        id:
            "LESSON-" +
            Date.now(),

        title:
            data.title || "Untitled Lesson",

        subject:
            data.subject || "General",

        grade:
            data.grade || "Grade 10",

        description:
            data.description || "",

        pdf:
            data.pdf || null,

        createdAt:
            new Date().toISOString()

    };


    lessons.push(
        lesson
    );


    saveData(
        "keyraddiin_lessons",
        lessons
    );


    return lesson;

}


/* =========================================
   EXPORT
========================================= */

window.handlePDFUpload =
    handlePDFUpload;

window.createLesson =
    createLesson;