/* =========================================================
   KEYRADDIIN ONLINE CLASS
   js/app.js
   Main Homepage Controller
   ========================================================= */

import {
  getClasses,
  getClass,
  watchParticipants
} from "../firebase/database.js";

import {
  getUserProfile
} from "../firebase/auth.js";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const APP_CONFIG = {
  defaultClassPage: "pages/classes.html",
  liveClassPage: "pages/live-class.html",
  loginPage: "pages/login.html",

  refreshInterval: 30000,

  // Demo/fake values are NOT allowed.
  showDemoData: false
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(selector) {
  return document.querySelector(selector);
}


function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   PAGE STATE
   ========================================================= */

const state = {
  classes: [],
  liveClass: null,
  participants: [],
  participantUnsubscribe: null,
  refreshTimer: null
};


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  console.log(
    "KEYRADDIIN ONLINE CLASS initialized."
  );

  setupCurrentYear();

  await loadLiveClass();

  startAutoRefresh();

});


/* =========================================================
   CURRENT YEAR
   ========================================================= */

function setupCurrentYear() {

  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent =
      new Date().getFullYear();
  }

}


/* =========================================================
   LOAD LIVE CLASS
   ========================================================= */

async function loadLiveClass() {

  try {

    const classes = await getClasses();

    state.classes = Array.isArray(classes)
      ? classes
      : [];

    const liveClass = findLiveClass(
      state.classes
    );

    state.liveClass = liveClass;

    if (!liveClass) {

      showNoLiveClass();

      return;
    }


    /*
      We found a real live class.
    */

    await renderLiveClass(
      liveClass
    );


    /*
      Start listening to participants
      in real time.
    */

    startParticipantListener(
      liveClass.id
    );


  } catch (error) {

    console.error(
      "Failed to load live class:",
      error
    );

    showLiveClassError();

  }

}


/* =========================================================
   FIND ACTIVE LIVE CLASS
   ========================================================= */

function findLiveClass(classes) {

  if (!Array.isArray(classes)) {
    return null;
  }


  /*
    Only classes explicitly marked
    as live/active are accepted.
  */

  const live = classes.find((classItem) => {

    if (!classItem) {
      return false;
    }

    const status =
      String(classItem.status || "")
        .toLowerCase();

    const live =
      classItem.live === true ||
      classItem.isLive === true ||
      classItem.active === true;

    return (
      live ||
      status === "live" ||
      status === "live now" ||
      status === "active"
    );

  });


  return live || null;
}


/* =========================================================
   RENDER LIVE CLASS
   ========================================================= */

async function renderLiveClass(classItem) {

  const liveCard = document.querySelector(
    ".live-card"
  );

  if (!liveCard) {
    return;
  }


  /*
    Get basic class information.
  */

  const subject =
    classItem.subject ||
    classItem.title ||
    classItem.name ||
    "Live Class";


  const unit =
    classItem.unit ||
    classItem.unitName ||
    "";


  const grade =
    classItem.grade ||
    "";


  /*
    Teacher information.
  */

  let teacherName =
    classItem.teacherName ||
    classItem.teacher ||
    "";


  /*
    If only teacherId exists,
    get teacher profile from Firestore.
  */

  if (
    !teacherName &&
    classItem.teacherId
  ) {

    try {

      const teacher =
        await getUserProfile(
          classItem.teacherId
        );

      if (teacher) {

        teacherName =
          teacher.fullName ||
          teacher.displayName ||
          teacher.name ||
          "Teacher";
      }

    } catch (error) {

      console.warn(
        "Teacher profile could not be loaded:",
        error
      );

    }

  }


  if (!teacherName) {
    teacherName = "Teacher";
  }


  /*
    Update subject.
  */

  const titleElement =
    liveCard.querySelector(
      ".card-header h2"
    );

  if (titleElement) {

    titleElement.textContent =
      subject;
  }


  /*
    Update unit + grade.
  */

  const subtitleElement =
    liveCard.querySelector(
      ".card-header p"
    );

  if (subtitleElement) {

    const information = [];

    if (unit) {
      information.push(unit);
    }

    if (grade) {
      information.push(
        `Grade ${grade}`
      );
    }

    subtitleElement.textContent =
      information.length
        ? information.join(" • ")
        : "Online Class";
  }


  /*
    Update teacher name.
  */

  const teacherStrong =
    liveCard.querySelector(
      ".teacher strong"
    );

  if (teacherStrong) {

    teacherStrong.textContent =
      teacherName;
  }


  /*
    Update teacher avatar.
  */

  const teacherAvatar =
    liveCard.querySelector(
      ".teacher-avatar"
    );

  if (teacherAvatar) {

    teacherAvatar.textContent =
      getInitials(teacherName);
  }


  /*
    Store class ID on the card.
  */

  liveCard.dataset.classId =
    classItem.id;


  /*
    Join button.
  */

  const joinButton =
    liveCard.querySelector(
      ".join-btn"
    );

  if (joinButton) {

    joinButton.href =
      `${APP_CONFIG.liveClassPage}?classId=${encodeURIComponent(classItem.id)}`;

    joinButton.setAttribute(
      "aria-label",
      `Join ${subject} live class`
    );
  }


  /*
    Make card visible.
  */

  liveCard.style.display = "";


  /*
    Update initial participant count
    if the class contains one.
  */

  if (
    typeof classItem.participantsCount ===
    "number"
  ) {

    updateParticipantCount(
      classItem.participantsCount
    );
  }

}


/* =========================================================
   PARTICIPANT REAL-TIME LISTENER
   ========================================================= */

function startParticipantListener(classId) {

  /*
    Remove previous listener.
  */

  if (
    typeof state.participantUnsubscribe ===
    "function"
  ) {

    state.participantUnsubscribe();
  }


  try {

    const unsubscribe =
      watchParticipants(
        classId,
        (participants) => {

          const list =
            Array.isArray(participants)
              ? participants
              : [];

          state.participants = list;

          updateParticipantCount(
            list.length
          );

          renderParticipantAvatars(
            list
          );

        }
      );


    /*
      Firebase listener may return
      an unsubscribe function.
    */

    if (
      typeof unsubscribe ===
      "function"
    ) {

      state.participantUnsubscribe =
        unsubscribe;
    }

  } catch (error) {

    console.error(
      "Participant listener failed:",
      error
    );

  }

}


/* =========================================================
   PARTICIPANT COUNT
   ========================================================= */

function updateParticipantCount(count) {

  const countElement =
    document.getElementById(
      "liveStudentCount"
    );


  if (!countElement) {
    return;
  }


  const safeCount =
    Number.isFinite(Number(count))
      ? Math.max(
          0,
          Number(count)
        )
      : 0;


  countElement.textContent =
    safeCount.toLocaleString();


  /*
    Update text beside number.
  */

  const countContainer =
    countElement.closest(
      ".student-count"
    );


  if (countContainer) {

    const label =
      countContainer.querySelector(
        "span"
      );

    if (label) {

      label.textContent =
        safeCount === 1
          ? "Student"
          : "Students";
    }
  }

}


/* =========================================================
   PARTICIPANT AVATARS
   ========================================================= */

function renderParticipantAvatars(
  participants
) {

  const container =
    document.querySelector(
      ".avatars"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  const visibleParticipants =
    participants.slice(0, 3);


  visibleParticipants.forEach(
    (participant) => {

      const avatar =
        document.createElement("span");


      avatar.className =
        "participant-avatar";


      const name =
        participant.fullName ||
        participant.displayName ||
        participant.name ||
        "Student";


      /*
        Use initials instead of
        fake student images.
      */

      avatar.textContent =
        getInitials(name);


      avatar.title =
        name;


      container.appendChild(
        avatar
      );

    }
  );


  /*
    Show +N only when more
    participants exist.
  */

  const remaining =
    participants.length -
    visibleParticipants.length;


  if (remaining > 0) {

    const more =
      document.createElement("span");

    more.className =
      "avatar-more";

    more.textContent =
      `+${remaining}`;

    more.title =
      `${remaining} more students`;

    container.appendChild(
      more
    );
  }


  /*
    If nobody is in the class,
    show a neutral icon.
  */

  if (
    participants.length === 0
  ) {

    const empty =
      document.createElement("span");

    empty.className =
      "avatar-more";

    empty.textContent =
      "0";

    empty.title =
      "No students currently joined";

    container.appendChild(
      empty
    );

  }

}


/* =========================================================
   INITIALS
   ========================================================= */

function getInitials(name) {

  if (!name) {
    return "?";
  }


  const words =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (words.length === 1) {

    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }


  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();

}


/* =========================================================
   NO LIVE CLASS
   ========================================================= */

function showNoLiveClass() {

  const liveCard =
    document.querySelector(
      ".live-card"
    );


  if (!liveCard) {
    return;
  }


  const title =
    liveCard.querySelector(
      ".card-header h2"
    );

  const subtitle =
    liveCard.querySelector(
      ".card-header p"
    );

  const badge =
    liveCard.querySelector(
      ".now-live"
    );

  const teacher =
    liveCard.querySelector(
      ".teacher strong"
    );

  const joinButton =
    liveCard.querySelector(
      ".join-btn"
    );


  if (badge) {

    badge.innerHTML =
      `
        <span></span>
        NO LIVE CLASS
      `;

    badge.style.color =
      "#94a3b8";
  }


  if (title) {

    title.textContent =
      "No Live Class";
  }


  if (subtitle) {

    subtitle.textContent =
      "Live class yeroo ammaa hin jiru.";
  }


  if (teacher) {

    teacher.textContent =
      "Waiting for teacher";
  }


  if (joinButton) {

    joinButton.textContent =
      "View Classes →";

    joinButton.href =
      APP_CONFIG.defaultClassPage;
  }


  updateParticipantCount(0);


  const avatars =
    document.querySelector(
      ".avatars"
    );


  if (avatars) {

    avatars.innerHTML = "";

    const empty =
      document.createElement("span");

    empty.className =
      "avatar-more";

    empty.textContent =
      "—";

    avatars.appendChild(
      empty
    );

  }

}


/* =========================================================
   FIREBASE ERROR STATE
   ========================================================= */

function showLiveClassError() {

  const liveCard =
    document.querySelector(
      ".live-card"
    );


  if (!liveCard) {
    return;
  }


  const title =
    liveCard.querySelector(
      ".card-header h2"
    );

  const subtitle =
    liveCard.querySelector(
      ".card-header p"
    );


  if (title) {

    title.textContent =
      "Live Class";
  }


  if (subtitle) {

    subtitle.textContent =
      "Connection issue";
  }


  updateParticipantCount(0);

}


/* =========================================================
   AUTO REFRESH
   ========================================================= */

function startAutoRefresh() {

  if (state.refreshTimer) {

    clearInterval(
      state.refreshTimer
    );
  }


  state.refreshTimer =
    setInterval(
      async () => {

        /*
          Don't unnecessarily reload
          if the page is hidden.
        */

        if (
          document.hidden
        ) {
          return;
        }


        await loadLiveClass();

      },
      APP_CONFIG.refreshInterval
    );

}


/* =========================================================
   PAGE VISIBILITY
   ========================================================= */

document.addEventListener(
  "visibilitychange",
  async () => {

    if (
      !document.hidden
    ) {

      await loadLiveClass();
    }

  }
);


/* =========================================================
   CLEANUP
   ========================================================= */

window.addEventListener(
  "beforeunload",
  () => {

    if (
      typeof state.participantUnsubscribe ===
      "function"
    ) {

      state.participantUnsubscribe();
    }


    if (state.refreshTimer) {

      clearInterval(
        state.refreshTimer
      );
    }

  }
);


/* =========================================================
   DEBUG ACCESS
   ========================================================= */

window.KEYRADDIIN_ONLINE_CLASS = {
  getState: () => ({
    classes: state.classes,
    liveClass: state.liveClass,
    participants: state.participants
  }),

  refresh: loadLiveClass
};