/* =========================================
   CHAT.JS
========================================= */

"use strict";


let chatMessages = [];


/* =========================================
   PAGE READY
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "chatForm"
            );

        if (!form) {
            return;
        }

        form.addEventListener(
            "submit",
            sendChatMessage
        );

        loadChatMessages();

    }
);


/* =========================================
   SEND MESSAGE
========================================= */

function sendChatMessage(event) {

    event.preventDefault();


    const input =
        document.getElementById(
            "messageInput"
        );


    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    const user =
        getCurrentUser();


    const message = {

        id:
            "MSG-" +
            Date.now(),

        sender:
            user
                ? user.name
                : "Student",

        text: text,

        time:
            new Date()
                .toLocaleTimeString(
                    [],
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )

    };


    chatMessages.push(
        message
    );


    saveData(
        "keyraddiin_chat_messages",
        chatMessages
    );


    renderChatMessage(
        message
    );


    input.value = "";

}


/* =========================================
   LOAD MESSAGES
========================================= */

function loadChatMessages() {

    chatMessages =
        getData(
            "keyraddiin_chat_messages",
            []
        );


    const box =
        document.getElementById(
            "messages"
        );


    if (!box) {
        return;
    }


    box.innerHTML = "";


    chatMessages.forEach(
        message => {

            renderChatMessage(
                message,
                false
            );

        }
    );

}


/* =========================================
   RENDER MESSAGE
========================================= */

function renderChatMessage(
    message,
    scroll = true
) {

    const box =
        document.getElementById(
            "messages"
        );


    if (!box) {
        return;
    }


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "message";


    const strong =
        document.createElement(
            "strong"
        );


    strong.textContent =
        message.sender;


    const paragraph =
        document.createElement(
            "p"
        );


    paragraph.textContent =
        message.text;


    item.appendChild(
        strong
    );


    item.appendChild(
        paragraph
    );


    box.appendChild(
        item
    );


    if (scroll) {

        box.scrollTop =
            box.scrollHeight;

    }

}


/* =========================================
   CLEAR CHAT
========================================= */

function clearChat() {

    chatMessages = [];


    localStorage.removeItem(
        "keyraddiin_chat_messages"
    );


    const box =
        document.getElementById(
            "messages"
        );


    if (box) {

        box.innerHTML = "";

    }

}


/* =========================================
   EXPORT
========================================= */

window.sendChatMessage =
    sendChatMessage;

window.clearChat =
    clearChat;