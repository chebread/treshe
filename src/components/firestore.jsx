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
} from 'firebase/firestore';
// Initialize Firebase

// Initialize Cloud Storage and get a reference to the service
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
};
