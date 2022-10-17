import firebase from 'components/firebase';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged, // 로그인 됬는지 알려주는 메서드
} from 'firebase/auth';

const auth = getAuth(firebase);

export { auth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged };
