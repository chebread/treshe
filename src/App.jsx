import Router from 'components/Router';
import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from 'components/auth';
import Auth from 'routes/Auth';
import { userDataState } from 'components/state';
import { useSetRecoilState } from 'recoil';

const App = () => {
  const isGeolocation = 'geolocation' in navigator;
  const [init, setInit] = useState(false); // default : false
  const [isLoggedIn, setIsLoggedIn] = useState(false); // default : false
  const setUserData = useSetRecoilState(userDataState);

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        const userId = user.uid;
        const username = user.displayName;
        console.log(user);
        setUserData({
          userId,
          username,
        }); // 이거때문에 오류 발생함
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setInit(true);
    });
  }, []);

  return isGeolocation ? (
    init ? (
      isLoggedIn ? (
        // 로그인 되어 있다면 라우터 컴포넌트 실행
        <Router />
      ) : (
        // 비로그인시 로그인 컴포넌트 실행
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
