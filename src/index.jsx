import './polyfills';

import('./App.jsx').catch((err) => {
  console.error('Failed to load app:', err);
  document.getElementById('root').innerHTML =
    '<div style="padding:2rem;color:#fff;font-family:sans-serif">Failed to load app. Check console.</div>';
});
