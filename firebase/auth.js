/* =========================================
   KEYRADDIIN ONLINE CLASS
   FIREBASE AUTHENTICATION
========================================= */

import {

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    signOut,

    onAuthStateChanged,

    updateProfile

} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


import {

    doc,

    setDoc,

    getDoc

} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


import {

    firebaseAuth,

    firestore

} from
    "./config.js";


/* =========================================
   REGISTER USER
========================================= */

async function registerUser({

    email,

    password,

    fullName,

    role = "student",

    grade = "",

    section = ""

}) {

    try {

        const userCredential =
            await createUserWithEmailAndPassword(

                firebaseAuth,

                email,

                password

            );


        const user =
            userCredential.user;


        /* ================================
           UPDATE FIREBASE PROFILE
        ================================= */

        await updateProfile(
            user,
            {
                displayName:
                    fullName
            }
        );


        /* ================================
           SAVE USER PROFILE
        ================================= */

        await setDoc(

            doc(
                firestore,
                "users",
                user.uid
            ),

            {

                uid:
                    user.uid,

                fullName:
                    fullName,

                email:
                    email,

                role:
                    role,

                grade:
                    grade,

                section:
                    section,

                createdAt:
                    new Date().toISOString()

            }

        );


        return {

            success: true,

            user: user

        };


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        return {

            success: false,

            error:
                getAuthErrorMessage(
                    error
                )

        };

    }

}


/* =========================================
   LOGIN USER
========================================= */

async function loginUser(
    email,
    password
) {

    try {

        const result =
            await signInWithEmailAndPassword(

                firebaseAuth,

                email,

                password

            );


        const user =
            result.user;


        const profile =
            await getUserProfile(
                user.uid
            );


        return {

            success: true,

            user: user,

            profile: profile

        };


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return {

            success: false,

            error:
                getAuthErrorMessage(
                    error
                )

        };

    }

}


/* =========================================
   LOGOUT
========================================= */

async function logoutFirebaseUser() {

    try {

        await signOut(
            firebaseAuth
        );

        return {
            success: true
        };

    } catch (error) {

        console.error(
            "Logout error:",
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
   GET USER PROFILE
========================================= */

async function getUserProfile(
    uid
) {

    try {

        const snapshot =
            await getDoc(

                doc(
                    firestore,
                    "users",
                    uid
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
            "Profile error:",
            error
        );

        return null;

    }

}


/* =========================================
   CURRENT USER LISTENER
========================================= */

function watchAuthState(
    callback
) {

    return onAuthStateChanged(

        firebaseAuth,

        async user => {

            if (!user) {

                callback(
                    null,
                    null
                );

                return;

            }


            const profile =
                await getUserProfile(
                    user.uid
                );


            callback(
                user,
                profile
            );

        }

    );

}


/* =========================================
   AUTH ERROR MESSAGES
========================================= */

function getAuthErrorMessage(
    error
) {

    const code =
        error.code || "";


    switch (code) {

        case "auth/email-already-in-use":

            return "Email kun duraan account qaba.";

        case "auth/invalid-email":

            return "Email sirrii miti.";

        case "auth/weak-password":

            return "Password cimaa fayyadami.";

        case "auth/invalid-credential":

            return "Email ykn password sirrii miti.";

        case "auth/user-not-found":

            return "Account kun hin argamne.";

        case "auth/wrong-password":

            return "Password sirrii miti.";

        case "auth/too-many-requests":

            return "Yaalii baay'ee taasifame. Mee yeroo muraasa eegi.";

        default:

            return (
                error.message ||
                "Dogoggorri tokko uumame."
            );

    }

}


/* =========================================
   EXPORT
========================================= */

export {

    registerUser,

    loginUser,

    logoutFirebaseUser,

    getUserProfile,

    watchAuthState

};