import { register } from 'register-service-worker'

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (registration) {
    console.info('[PWA] Service worker active.', registration)
  },

  registered (registration) {
    console.info('[PWA] Service worker registered.', registration)
  },

  cached (registration) {
    console.info('[PWA] Content cached for offline use.', registration)
  },

  updatefound (/* registration */) {
    // console.log('New content is downloading.')
  },

  updated (registration) {
    console.info('[PWA] New content available. Refresh recommended.', registration)
  },

  offline () {
    console.info('[PWA] App running in offline mode.')
  },

  error (err) {
    console.error('[PWA] Service worker registration error:', err)
  }
})
