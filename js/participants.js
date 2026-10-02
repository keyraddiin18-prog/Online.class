/* =========================================
   PARTICIPANTS.JS
========================================= */

"use strict";


let participants = [

    {
        id: "teacher-001",
        name: "Teacher",
        role: "Teacher",
        avatar: "👨‍🏫",
        online: true
    },

    {
        id: "student-001",
        name: "Student 1",
        role: "Student",
        avatar: "👨‍🎓",
        online: true
    },

    {
        id: "student-002",
        name: "Student 2",
        role: "Student",
        avatar: "👩‍🎓",
        online: true
    },

    {
        id: "student-003",
        name: "Student 3",
        role: "Student",
        avatar: "👨‍🎓",
        online: true
    }

];


/* =========================================
   PAGE READY
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const list =
            document.querySelector(
                ".participants"
            );

        if (!list) {
            return;
        }

        renderParticipants();

    }
);


/* =========================================
   RENDER
========================================= */

function renderParticipants() {

    const list =
        document.querySelector(
            ".participants"
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        participants
            .map(
                participant =>
                    `

                    <div class="participant">

                        <div class="avatar">
                            ${participant.avatar}
                        </div>

                        <div>

                            ${escapeHTML(
                                participant.name
                            )}

                            <div class="online">
                                ● Online
                            </div>

                        </div>

                    </div>

                    `
            )
            .join("");


    updateParticipantCount();

}


/* =========================================
   COUNT
========================================= */

function updateParticipantCount() {

    const count =
        document.querySelector(
            ".participant-count"
        );


    if (!count) {
        return;
    }


    const online =
        participants.filter(
            item =>
                item.online
        ).length;


    /*
       Demo count.

       Firebase realtime database
       keessatti count dhugaa ta'a.
    */

    const displayedCount =
        online < 37
            ? 37
            : online;


    count.textContent =
        `👥 ${displayedCount}`;

}


/* =========================================
   ADD PARTICIPANT
========================================= */

function addParticipant(
    participant
) {

    if (!participant.id) {

        participant.id =
            "user-" +
            Date.now();

    }


    participants.push(
        participant
    );


    renderParticipants();

}


/* =========================================
   REMOVE PARTICIPANT
========================================= */

function removeParticipant(
    participantId
) {

    participants =
        participants.filter(
            item =>
                item.id !==
                participantId
        );


    renderParticipants();

}


/* =========================================
   ESCAPE
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


/* =========================================
   EXPORT
========================================= */

window.addParticipant =
    addParticipant;

window.removeParticipant =
    removeParticipant;

window.renderParticipants =
    renderParticipants;