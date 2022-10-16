import Router from 'components/Router';
import { RecoilRoot } from 'recoil';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const isGeolocation = 'geolocation' in navigator;
  return isGeolocation ? (
    <RecoilRoot>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 1500,
        }}
      />
      <Router />
    </RecoilRoot>
  ) : (
    <h1>Not approching geolocation</h1>
  );
};

export default App;
