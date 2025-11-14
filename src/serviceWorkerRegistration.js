// src/serviceWorkerRegistration.js
// Kijkt of de browser service workers ondersteunt en registreert deze

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(`${process.env.PUBLIC_URL}/service-worker.js`)
        .then((registration) => {
          console.log('ServiceWorker geregistreerd met scope:', registration.scope);
        })
        .catch((error) => {
          console.error('ServiceWorker registratie mislukt:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
