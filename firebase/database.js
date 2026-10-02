/* =========================================
   KEYRADDIIN ONLINE CLASS
   DATABASE.JS
========================================= */

import {

    collection,

    addDoc,

    setDoc,

    doc,

    getDoc,

    getDocs,

    updateDoc,

    deleteDoc,

    query,

    where,

    orderBy,

    serverTimestamp

} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


import {

    ref,

    set,

    update,

    remove,

    push,

    onValue,

    onDisconnect

} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";


import {

    ref as storageRef,

    uploadBytes,

    getDownloadURL

} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";


import {

    firestore,

    realtimeDatabase,

    firebaseStorage

} from
    "./config.js";


/* =========================================
   CREATE CLASS
========================================= */

async function createClass(
    classData
) {

    try {

        const classRef =
            await addDoc(

                collection(
                    firestore,
                    "classes"
                ),

                {

                    ...classData,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp(),

                    studentsCount:
                        0,

                    status:
                        classData.status ||
                        "upcoming"

                }

            );


        return {

            success: true,

            id:
                classRef.id

        };

    } catch (error) {

        console.error(
            "Create class error:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}


/* =========================================
   GET CLASS
========================================= */

async function getClass(
    classId
) {

    try {

        const snapshot =
            await getDoc(

                doc(
                    firestore,
                    "classes",
                    classId
                )

            );


        if (!snapshot.exists()) {

            return null;

        }


        return {

            id:
                snapshot.id,

            ...snapshot.data()

        };

    } catch (error) {

        console.error(
            "Get class error:",
            error
        );

        return null;

    }

}


/* =========================================
   GET ALL CLASSES
========================================= */

async function getClasses(
    grade = null
) {

    try {

        let classQuery;


        if (grade) {

            classQuery =
                query(

                    collection(
                        firestore,
                        "classes"
                    ),

                    where(
                        "grade",
                        "==",
                        grade
                    )

                );

        } else {

            classQuery =
                collection(
                    firestore,
                    "classes"
                );

        }


        const snapshot =
            await getDocs(
                classQuery
            );


        return snapshot.docs.map(
            item => ({

                id:
                    item.id,

                ...item.data()

            })
        );


    } catch (error) {

        console.error(
            "Get classes error:",
            error
        );

        return [];

    }

}


/* =========================================
   CREATE LESSON
========================================= */

async function createLesson(
    lessonData
) {

    try {

        const lessonRef =
            await addDoc(

                collection(
                    firestore,
                    "lessons"
                ),

                {

                    ...lessonData,

                    createdAt:
                        serverTimestamp(),

                    updatedAt:
                        serverTimestamp()

                }

            );


        return {

            success: true,

            id:
                lessonRef.id

        };

    } catch (error) {

        console.error(
            "Create lesson error:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}


/* =========================================
   UPLOAD PDF
========================================= */

async function uploadLessonPDF(
    file,
    lessonId
) {

    try {

        if (!file) {

            throw new Error(
                "PDF file hin filatamne."
            );

        }


        if (
            file.type !==
            "application/pdf"
        ) {

            throw new Error(
                "Faayiliin PDF ta'uu qaba."
            );

        }


        const filePath =
            `lessons/${lessonId}/${Date.now()}-${file.name}`;


        const fileReference =
            storageRef(

                firebaseStorage,

                filePath

            );


        const uploadResult =
            await uploadBytes(

                fileReference,

                file

            );


        const downloadURL =
            await getDownloadURL(

                uploadResult.ref

            );


        await updateDoc(

            doc(
                firestore,
                "lessons",
                lessonId
            ),

            {

                pdfURL:
                    downloadURL,

                pdfPath:
                    filePath,

                pdfName:
                    file.name,

                pdfUploadedAt:
                    serverTimestamp()

            }

        );


        return {

            success: true,

            url:
                downloadURL,

            path:
                filePath

        };


    } catch (error) {

        console.error(
            "PDF upload error:",
            error
        );


        return {

            success: false,

            error:
                error.message

        };

    }

}


/* =========================================
   GET LESSONS
========================================= */

async function getLessons(
    classId
) {

    try {

        const lessonQuery =
            query(

                collection(
                    firestore,
                    "lessons"
                ),

                where(
                    "classId",
                    "==",
                    classId
                )

            );


        const snapshot =
            await getDocs(
                lessonQuery
            );


        return snapshot.docs.map(
            item => ({

                id:
                    item.id,

                ...item.data()

            })
        );


    } catch (error) {

        console.error(
            "Get lessons error:",
            error
        );

        return [];

    }

}


/* =========================================
   START LIVE CLASS
========================================= */

async function startLiveClass(
    classId,
    teacherId
) {

    try {

        const liveRef =
            ref(

                realtimeDatabase,

                `liveClasses/${classId}`

            );


        await set(

            liveRef,

            {

                classId:
                    classId,

                teacherId:
                    teacherId,

                active:
                    true,

                startedAt:
                    Date.now(),

                participantsCount:
                    0

            }

        );


        await updateDoc(

            doc(
                firestore,
                "classes",
                classId
            ),

            {

                status:
                    "live",

                live:
                    true,

                liveStartedAt:
                    serverTimestamp()

            }

        );


        return {

            success: true

        };

    } catch (error) {

        console.error(
            "Start live error:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}


/* =========================================
   END LIVE CLASS
========================================= */

async function endLiveClass(
    classId
) {

    try {

        await update(

            ref(

                realtimeDatabase,

                `liveClasses/${classId}`

            ),

            {

                active:
                    false,

                endedAt:
                    Date.now()

            }

        );


        await updateDoc(

            doc(
                firestore,
                "classes",
                classId
            ),

            {

                status:
                    "completed",

                live:
                    false

            }

        );


        return {

            success: true

        };

    } catch (error) {

        console.error(
            "End live error:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}


/* =========================================
   JOIN LIVE CLASS
========================================= */

async function joinLiveClass(
    classId,
    user
) {

    try {

        const participantRef =
            push(

                ref(

                    realtimeDatabase,

                    `liveClasses/${classId}/participants`

                )

            );


        const participant = {

            uid:
                user.uid,

            name:
                user.name ||
                user.fullName ||
                "Student",

            role:
                user.role ||
                "student",

            joinedAt:
                Date.now(),

            online:
                true

        };


        await set(

            participantRef,

            participant

        );


        await onDisconnect(
            participantRef
        ).update({

            online:
                false,

            leftAt:
                Date.now()

        });


        return {

            success: true,

            participantId:
                participantRef.key

        };


    } catch (error) {

        console.error(
            "Join live error:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}


/* =========================================
   LIVE PARTICIPANTS LISTENER
========================================= */

function watchParticipants(
    classId,
    callback
) {

    const participantsRef =
        ref(

            realtimeDatabase,

            `liveClasses/${classId}/participants`

        );


    return onValue(

        participantsRef,

        snapshot => {

            const data =
                snapshot.val() || {};


            const participants =
                Object.entries(
                    data
                ).map(
                    ([id, value]) => ({

                        id,

                        ...value

                    })
                );


            callback(
                participants
            );

        }

    );

}


/* =========================================
   SEND LIVE CHAT
========================================= */

async function sendLiveMessage(
    classId,
    user,
    message
) {

    try {

        const chatRef =
            push(

                ref(

                    realtimeDatabase,

                    `liveClasses/${classId}/chat`

                )

            );


        await set(

            chatRef,

            {

                uid:
                    user.uid,

                name:
                    user.name ||
                    user.fullName ||
                    "Student",

                role:
                    user.role ||
                    "student",

                message:
                    message,

                timestamp:
                    Date.now()

            }

        );


        return {

            success: true

        };

    } catch (error) {

        console.error(
            "Chat error:",
            error
        );

        return {

            success: false,

            error:
                error.message

        };

    }

}


/* =========================================
   WATCH CHAT
========================================= */

function watchLiveChat(
    classId,
    callback
) {

    const chatRef =
        ref(

            realtimeDatabase,

            `liveClasses/${classId}/chat`

        );


    return onValue(

        chatRef,

        snapshot => {

            const data =
                snapshot.val() || {};


            const messages =
                Object.entries(
                    data
                )
                .map(
                    ([id, value]) => ({

                        id,

                        ...value

                    })
                )
                .sort(
                    (a, b) =>
                        a.timestamp -
                        b.timestamp
                );


            callback(
                messages
            );

        }

    );

}


/* =========================================
   EXPORT
========================================= */

export {

    createClass,

    getClass,

    getClasses,

    createLesson,

    uploadLessonPDF,

    getLessons,

    startLiveClass,

    endLiveClass,

    joinLiveClass,

    watchParticipants,

    sendLiveMessage,

    watchLiveChat

};