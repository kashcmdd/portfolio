import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for PWA support
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('Service worker registration successful');
  },
  onUpdate: (registration) => {
    console.log('Service worker updated');
    // You could add a UI notification here to prompt user to refresh
  },
});
