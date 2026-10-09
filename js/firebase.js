import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const configured = Object.values(firebaseConfig).every((value) => typeof value === "string" && value.trim() !== "");
export const app = configured ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const firebaseReady = Boolean(app);
export { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut };

export async function saveAnalysis(userId, analysis) {
  if (!db || !userId) {
    throw new Error("Sign in with a configured Firebase project to save analysis history.");
  }

  await addDoc(collection(db, "users", userId, "analyses"), {
    level: analysis.level,
    messageType: analysis.messageType,
    categories: analysis.categories,
    messageText: analysis.messageText,
    summary: analysis.summary,
    signals: analysis.signals,
    advice: analysis.advice,
    recommendations: analysis.recommendations,
    createdAt: serverTimestamp(),
  });
}

export async function getAnalysisHistory(userId) {
  if (!db || !userId) {
    throw new Error("Sign in with a configured Firebase project to view analysis history.");
  }

  const analyses = collection(db, "users", userId, "analyses");
  const historyQuery = query(analyses, orderBy("createdAt", "desc"), limit(50));
  const snapshot = await getDocs(historyQuery);
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
}
