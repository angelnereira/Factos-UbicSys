
// This file is intentionally left blank in development.
// The service worker is only enabled in production.
if (process.env.NODE_ENV !== 'development') {
  self.addEventListener('install', (event) => {
    console.log('Service worker installing...');
    // Add a call to skipWaiting here
  });

  self.addEventListener('activate', (event) => {
    console.log('Service worker activating.');
  });

  self.addEventListener('fetch', (event) => {
    // console.log('Fetching:', event.request.url);
  });
}
