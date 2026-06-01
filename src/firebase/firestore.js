import {
  doc, setDoc, getDoc, updateDoc, addDoc, getDocs,
  collection, query, where, orderBy, limit,
  serverTimestamp, deleteDoc, increment,
} from 'firebase/firestore';
import { db } from './config';

const ts = () => serverTimestamp();

/* ── Users ─────────────────────────────────────────────────── */
export const createUserProfile = async (user) => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'candidate',
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      readinessScore: 0,
      totalInterviews: 0,
      achievements: [],
      createdAt: ts(),
      updatedAt: ts(),
    });
  }
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: ts() });
};

/* ── Resumes ────────────────────────────────────────────────── */
export const saveResume = async (uid, data) => {
  const ref = await addDoc(collection(db, 'resumes'), {
    uid, ...data, createdAt: ts(), updatedAt: ts(),
  });
  return ref.id;
};

export const getResumes = async (uid) => {
  const q = query(collection(db, 'resumes'), where('uid', '==', uid));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5);
};

export const getLatestResume = async (uid) => {
  const resumes = await getResumes(uid);
  return resumes[0] || null;
};

/* ── Job Descriptions ────────────────────────────────────────── */
export const saveJobDescription = async (uid, data) => {
  const ref = await addDoc(collection(db, 'jobDescriptions'), {
    uid, ...data, createdAt: ts(), updatedAt: ts(),
  });
  return ref.id;
};

export const getJobDescriptions = async (uid) => {
  const q = query(collection(db, 'jobDescriptions'), where('uid', '==', uid));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5);
};

/* ── Interviews ──────────────────────────────────────────────── */
export const createInterview = async (uid, config) => {
  const ref = await addDoc(collection(db, 'interviews'), {
    uid, ...config,
    status: 'in_progress',
    currentQuestion: 0,
    scores: [],
    createdAt: ts(),
    updatedAt: ts(),
  });
  return ref.id;
};

export const updateInterview = async (id, data) => {
  await updateDoc(doc(db, 'interviews', id), { ...data, updatedAt: ts() });
};

export const getInterview = async (id) => {
  const snap = await getDoc(doc(db, 'interviews', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getUserInterviews = async (uid, limitN = 10) => {
  const q = query(collection(db, 'interviews'), where('uid', '==', uid));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, limitN);
};

/* ── Answers ─────────────────────────────────────────────────── */
export const saveAnswer = async (data) => {
  const ref = await addDoc(collection(db, 'answers'), {
    ...data, createdAt: ts(),
  });
  return ref.id;
};

export const getInterviewAnswers = async (interviewId) => {
  const q = query(collection(db, 'answers'), where('interviewId', '==', interviewId));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return list.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
};

/* ── Evaluations ─────────────────────────────────────────────── */
export const saveEvaluation = async (data) => {
  const ref = await addDoc(collection(db, 'evaluations'), {
    ...data, createdAt: ts(),
  });
  return ref.id;
};

/* ── Analytics ───────────────────────────────────────────────── */
export const saveAnalytics = async (uid, data) => {
  const ref = await addDoc(collection(db, 'analytics'), {
    uid, ...data, createdAt: ts(),
  });
  return ref.id;
};

export const getUserAnalytics = async (uid) => {
  const q = query(collection(db, 'analytics'), where('uid', '==', uid));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 30);
};

/* ── Reports ─────────────────────────────────────────────────── */
export const saveReport = async (data) => {
  const ref = await addDoc(collection(db, 'reports'), { ...data, createdAt: ts() });
  return ref.id;
};

/* ── Leaderboard ─────────────────────────────────────────────── */
export const getLeaderboard = async (limitN = 50) => {
  const q = query(collection(db, 'users'), orderBy('readinessScore', 'desc'), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/* ── Achievements ────────────────────────────────────────────── */
export const unlockAchievement = async (uid, achievementId) => {
  const profile = await getUserProfile(uid);
  const current = profile?.achievements || [];
  if (!current.includes(achievementId)) {
    await updateDoc(doc(db, 'users', uid), {
      achievements: [...current, achievementId],
      xp: increment(50),
      updatedAt: ts(),
    });
  }
};

/* ── XP & Level ──────────────────────────────────────────────── */
export const addXP = async (uid, points) => {
  const profile = await getUserProfile(uid);
  const newXP = (profile?.xp || 0) + points;
  const newLevel = Math.floor(newXP / 500) + 1;
  await updateDoc(doc(db, 'users', uid), {
    xp: increment(points),
    level: newLevel,
    updatedAt: ts(),
  });
  return { newXP, newLevel };
};
