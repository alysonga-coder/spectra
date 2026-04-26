import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          setUserProfile(snap.exists() ? { uid: firebaseUser.uid, ...snap.data() } : null);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    const profile = snap.exists() ? { uid: cred.user.uid, ...snap.data() } : null;
    setUserProfile(profile);
    return profile;
  }

  async function signup(email, password, role, profileData) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const data = { role, email, ...profileData, createdAt: new Date().toISOString() };
    await setDoc(doc(db, 'users', cred.user.uid), data);
    const profile = { uid: cred.user.uid, ...data };
    setUserProfile(profile);
    return profile;
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    navigate('/');
  }

  async function refreshProfile() {
    if (!user) return;
    const snap = await getDoc(doc(db, 'users', user.uid));
    setUserProfile(snap.exists() ? { uid: user.uid, ...snap.data() } : null);
  }

  const value = { user, userProfile, loading, login, signup, logout, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
