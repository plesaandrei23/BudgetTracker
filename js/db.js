import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";
import { state, setState } from "./state.js";

export function subscribeToConfig(userId, callback) {
    const configRef = doc(db, "users", userId, "settings", "config");
    return onSnapshot(configRef, (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            setState('userConfig', data);
            callback(data);
        } else {
            setDoc(configRef, state.userConfig);
        }
    });
}

export function subscribeToTransactions(userId, callback) {
    const q = query(collection(db, "users", userId, "transactions"), orderBy("date", "desc"));
    return onSnapshot(q, (snapshot) => {
        const txs = [];
        snapshot.forEach((d) => txs.push({ id: d.id, ...d.data() }));
        setState('transactionsCache', txs);
        callback(txs);
    });
}

export async function addTransaction(userId, data) {
    await addDoc(collection(db, "users", userId, "transactions"), { ...data, createdAt: new Date() });
}

export async function updateTransaction(userId, txId, data) {
    await updateDoc(doc(db, "users", userId, "transactions", txId), data);
}

export async function deleteTransaction(userId, txId) {
    await deleteDoc(doc(db, "users", userId, "transactions", txId));
}

export async function updateConfig(userId, newConfig) {
    const ref = doc(db, "users", userId, "settings", "config");
    await updateDoc(ref, newConfig);
}
