import { useEffect, useState } from 'react';
import Router from 'components/Router';
import Auth from 'routes/Auth';
import { auth, onAuthStateChanged } from 'components/auth';
import { userDataState } from 'components/state';
import { useSetRecoilState } from 'recoil';

const App = () => {
  const isGeolocation = 'geolocation' in navigator;
  const [init, setInit] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const setUserData = useSetRecoilState(userDataState);

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        const userId = user.uid;
        const username = user.displayName;
        setUserData({
          userId,
          username,
        }); // 저장할 정보만 저장한다
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setInit(true);
    });
  }, []);
  return <Router />;
  return isGeolocation ? (
    init ? (
      isLoggedIn ? (
        <Router />
      ) : (
        <Auth />
      )
    ) : (
      <div>init</div>
    )
  ) : (
    <div>you are not using service</div>
  );
};

export default App;
