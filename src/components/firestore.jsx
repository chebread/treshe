import firebase from 'components/firebase';
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

const db = getFirestore(firebase);

export {
  db,
  collection,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  updateDoc,
};
