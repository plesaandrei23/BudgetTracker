import { db } from './firebase.js';
import {
    collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { state, setState, defaultAccounts } from './state.js';

// --- HELPERS ---

// Helper to run migration once per session/load
let migrationRun = false;

// --- CONFIGURATION ---

export function subscribeToConfig(uid, callback) {
    const docRef = doc(db, 'users', uid);

    return onSnapshot(docRef, async (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            // Merge defaults if needed
            if (!data.accounts) {
                await updateConfig(uid, { accounts: defaultAccounts });
            }
            setState('userConfig', data);
            callback(data);
        } else {
            // New user init
            await setDoc(docRef, state.userConfig);
        }
    }, (error) => {
        console.error("Firebase Config Error:", error);
        if (error.code === 'permission-denied' || error.message.includes('access control')) {
            alert("⚠️ EROARE DE CONEXIUNE ⚠️\n\nFirebase a refuzat conexiunea.\n\nCAUZA: Domeniul nu este autorizat.\n\nSOLUȚIE:\n1. Mergi la Firebase Console > Authentication > Settings > Authorized Domains.\n2. Adaugă 'localhost' și '127.0.0.1'.");
        }
    });
}

export async function updateConfig(uid, newConfig) {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, newConfig, { merge: true });
}

// --- TRANSACTIONS ---

export function subscribeToTransactions(uid, callback) {
    const q = query(collection(db, `users/${uid}/transactions`), orderBy('date', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const transactions = [];
        snapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        setState('transactionsCache', transactions);

        // Run migration if needed
        if (!migrationRun && transactions.length > 0) {
            migrateData(uid, transactions);
            migrationRun = true;
        }

        callback(transactions);
    });
}

export async function addTransaction(uid, data) {
    const tx = {
        amount: parseFloat(data.amount),
        date: data.date,
        description: data.description || '',
        category: data.category,
        type: data.type,
        accountId: data.accountId,
        createdAt: new Date().toISOString()
    };

    if (data.type === 'Transfer') {
        tx.toAccountId = data.toAccountId;
        tx.category = 'Transfer';
    }

    if (data.tipAmount) {
        tx.tipAmount = parseFloat(data.tipAmount);
    }

    await addDoc(collection(db, `users/${uid}/transactions`), tx);
}

export async function updateTransaction(uid, txId, data) {
    // FIX: Using doc() correctly to get the reference
    const ref = doc(db, `users/${uid}/transactions`, txId);

    const updates = {
        amount: parseFloat(data.amount),
        date: data.date,
        description: data.description || '',
        category: data.category,
        type: data.type,
        accountId: data.accountId
    };

    if (data.type === 'Transfer') updates.toAccountId = data.toAccountId;
    if (data.tipAmount) updates.tipAmount = parseFloat(data.tipAmount);
    else updates.tipAmount = 0; // Reset if removed

    await updateDoc(ref, updates);
}

export async function deleteTransaction(uid, txId) {
    const ref = doc(db, `users/${uid}/transactions`, txId);
    await deleteDoc(ref);
}

// --- MIGRATION & UTILS ---

async function migrateData(uid, transactions) {
    const batch = writeBatch(db);
    let count = 0;

    transactions.forEach(t => {
        if (!t.accountId) {
            const ref = doc(db, `users/${uid}/transactions`, t.id);
            batch.update(ref, { accountId: 'cash' });
            count++;
        }
    });

    if (count > 0) {
        console.log(`Migrating ${count} transactions to 'cash' account...`);
        await batch.commit();
        console.log('Migration complete.');
    }
}

export async function importData(uid, jsonContent) {
    const { config, transactions } = jsonContent;

    // Import Config
    if (config) {
        // Merge logic handled in UI usually, but doing strict save here
        await updateConfig(uid, config);
    }

    // Import Transactions
    if (transactions && transactions.length > 0) {
        const batchSize = 400;
        const chunks = [];
        for (let i = 0; i < transactions.length; i += batchSize)
            chunks.push(transactions.slice(i, i + batchSize));

        for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach(tx => {
                const ref = doc(collection(db, `users/${uid}/transactions`));
                const safeTx = { ...tx };
                delete safeTx.id;
                if (!safeTx.accountId) safeTx.accountId = 'cash'; // Default on import too
                batch.set(ref, safeTx);
            });
            await batch.commit();
        }
    }
}
