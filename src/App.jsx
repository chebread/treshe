import Router from 'components/Router';
import { RecoilRoot } from 'recoil';
import { Toaster } from 'react-hot-toast';
const App = () => {
  return (
    <RecoilRoot>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 1500,
        }}
      />
      <Router />
    </RecoilRoot>
  );
};

export default App;
