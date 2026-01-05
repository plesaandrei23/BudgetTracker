import { signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth, provider } from "./firebase.js";

export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
