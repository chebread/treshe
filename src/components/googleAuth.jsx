import { auth, signInWithPopup, GoogleAuthProvider } from 'components/auth';

const googleAuth = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

export default googleAuth;
