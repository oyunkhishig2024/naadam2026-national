import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVB4T7c0v8jkVMfDZHZlOGQh65bmq3xRc",
  authDomain: "naadam2026-national.firebaseapp.com",
  projectId: "naadam2026-national",
  storageBucket: "naadam2026-national.firebasestorage.app",
  messagingSenderId: "315256295079",
  appId: "1:315256295079:web:5d218db50c19fe896d9582",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const usersCol   = collection(db, "users");
const horsesCol  = collection(db, "horses");
const seqRef     = doc(db, "meta", "sequences");
const settingsRef= doc(db, "meta", "settings");

// ── ATOMIC NUMBER ────────────────────────────────────────────────────────────
async function getNextHorseNumber() {
  return await runTransaction(db, async (tx) => {
    const snap = await tx.get(seqRef);
    if (!snap.exists()) {
      await setDoc(seqRef, { nextHorse: 1 });
      tx.update(seqRef, { nextHorse: 2 });
      return 1;
    }
    const next = snap.data().nextHorse;
    if (next > 1500) throw new Error("Бүртгэлийн дугаар 1500-аас хэтэрлээ!");
    tx.update(seqRef, { nextHorse: next + 1 });
    return next;
  });
}

// ── USER ─────────────────────────────────────────────────────────────────────
export async function loginOrCreateUser({ surname, givenName, phone }) {
  const q = query(usersCol, where("phone", "==", phone));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  }
  const ref = await addDoc(usersCol, {
    surname, givenName,
    name: `${surname} ${givenName}`,
    phone,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, surname, givenName, name: `${surname} ${givenName}`, phone };
}

// ── REGISTER HORSE ───────────────────────────────────────────────────────────
// Үндэсний наадам: бүх морь үнэгүй, дугаар хуваалцахгүй — морь бүр өөр дугаар авна
export async function registerHorse(userId, phone, ageGroupId, ageGroupName, formData) {
  // Every horse gets its own unique number (no sharing for national naadam)
  const number = await getNextHorseNumber();
  const needsPayment = false; // Always free

  const horse = {
    ...formData,
    number,
    needsPayment,
    ageGroupId,
    ageGroupName,
    userId,
    ownerPhone: phone,
    paid: true,      // Auto-paid (free)
    approved: true,  // Auto-approved (no admin needed)
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(horsesCol, horse);
  return { id: ref.id, ...horse };
}

// ── GET MY HORSES ────────────────────────────────────────────────────────────
export async function getMyHorses(phone) {
  const q = query(horsesCol, where("ownerPhone", "==", phone));
  const snap = await getDocs(q);
  const horses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return horses.sort((a, b) => {
    const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return ta - tb;
  });
}

// ── GET ALL HORSES (admin) ───────────────────────────────────────────────────
export async function getAllHorses() {
  const snap = await getDocs(horsesCol);
  const horses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return horses.sort((a, b) => (a.number || 0) - (b.number || 0));
}

// ── MARK PAID (not needed for national naadam but kept for compatibility) ────
export async function markHorsesPaid(horseIds) {
  await Promise.all(horseIds.map(id =>
    updateDoc(doc(db, "horses", id), { paid: true, approved: true })
  ));
}

// ── APPROVE / DELETE ─────────────────────────────────────────────────────────
export async function approveHorse(id) {
  await updateDoc(doc(db, "horses", id), { approved: true });
}

export async function deleteHorse(id) {
  await deleteDoc(doc(db, "horses", id));
}

// ── DEADLINE ─────────────────────────────────────────────────────────────────
export async function saveDeadline(val) {
  await setDoc(settingsRef, { regDeadline: val }, { merge: true });
}

export async function getDeadline() {
  const snap = await getDoc(settingsRef);
  return snap.exists() ? snap.data().regDeadline || null : null;
}

export async function clearDeadline() {
  await updateDoc(settingsRef, { regDeadline: null });
}
