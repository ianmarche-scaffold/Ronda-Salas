import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from 'firebase/auth';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs,
  serverTimestamp, documentId
} from 'firebase/firestore';

window.RondaFirebase = {
  initializeApp, getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, initializeFirestore, persistentLocalCache,
  persistentMultipleTabManager, doc, getDoc, setDoc, collection, query,
  orderBy, limit, getDocs, serverTimestamp, documentId
};
