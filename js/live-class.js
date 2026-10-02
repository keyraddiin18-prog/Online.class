/* =========================================
   LIVE-CLASS.JS
========================================= */

"use strict";


let localStream = null;

let microphoneEnabled = true;

let cameraEnabled = true;


/* =========================================
   PAGE READY
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const videoArea =
            document.querySelector(
                ".teacher-video"
            );

        if (!videoArea) {
            return;
        }

        setupLiveControls();

        loadLiveClass();

    }
);


/* =========================================
   LOAD LIVE CLASS
========================================= */

function loadLiveClass() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const classId =
        params.get("class") ||
        "BIO-G10-U1";


    const classData =
        getClassById
            ? getClassById(classId)
            : null;


    if (!classData) {
        return;
    }


    const title =
        document.querySelector(
            ".class-title"
        );

    if (title) {

        title.textContent =
            `${classData.subject} — ${classData.unit}`;

    }

}


/* =========================================
   LIVE CONTROLS
========================================= */

function setupLiveControls() {

    const buttons =
        document.querySelectorAll(
            ".control"
        );


    if (buttons.length >= 1) {

        buttons[0].addEventListener(
            "click",
            toggleMicrophone
        );

    }


    if (buttons.length >= 2) {

        buttons[1].addEventListener(
            "click",
            toggleCamera
        );

    }

}


/* =========================================
   MICROPHONE
========================================= */

async function toggleMicrophone() {

    microphoneEnabled =
        !microphoneEnabled;


    if (localStream) {

        localStream
            .getAudioTracks()
            .forEach(track => {

                track.enabled =
                    microphoneEnabled;

            });

    }


    showNotification(
        microphoneEnabled
            ? "Microphone enabled."
            : "Microphone muted."
    );

}


/* =========================================
   CAMERA
========================================= */

async function toggleCamera() {

    cameraEnabled =
        !cameraEnabled;


    if (localStream) {

        localStream
            .getVideoTracks()
            .forEach(track => {

                track.enabled =
                    cameraEnabled;

            });

    }


    showNotification(
        cameraEnabled
            ? "Camera enabled."
            : "Camera turned off."
    );

}


/* =========================================
   REQUEST MEDIA
========================================= */

async function requestMedia() {

    try {

        localStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: true,

                    audio: true

                });


        connectLocalVideo(
            localStream
        );


        return localStream;

    } catch (error) {

        console.error(
            "Media error:",
            error
        );

        showNotification(
            "Camera or microphone permission was not granted.",
            "error"
        );

        return null;

    }

}


/* =========================================
   CONNECT LOCAL VIDEO
========================================= */

function connectLocalVideo(
    stream
) {

    let video =
        document.getElementById(
            "localVideo"
        );


    if (!video) {

        video =
            document.createElement(
                "video"
            );

        video.id =
            "localVideo";

        video.autoplay = true;

        video.playsInline = true;

        video.muted = true;

        video.style.width =
            "100%";

        video.style.height =
            "100%";

        video.style.objectFit =
            "cover";

        const area =
            document.querySelector(
                ".teacher-video"
            );

        if (area) {

            area.innerHTML = "";

            area.appendChild(
                video
            );

        }

    }


    video.srcObject =
        stream;

}


/* =========================================
   LEAVE CLASS
========================================= */

function leaveLiveClass() {

    if (localStream) {

        localStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );

        localStream = null;

    }


    window.location.href =
        "classes.html";

}


/* =========================================
   EXPORT
========================================= */

window.requestMedia =
    requestMedia;

window.leaveLiveClass =
    leaveLiveClass;

window.toggleMicrophone =
    toggleMicrophone;

window.toggleCamera =
    toggleCamera;