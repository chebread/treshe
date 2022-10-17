import React from 'react';
import ReactDOM from 'react-dom/client';
import App from 'App';
import GlobalStyles from 'GlobalStyles';
import { RecoilRoot } from 'recoil';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RecoilRoot>
    <GlobalStyles />
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 1500,
      }}
    />
    <App />
  </RecoilRoot>
);
