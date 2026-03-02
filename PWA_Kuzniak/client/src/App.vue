<template>
  <div>
    <q-banner
      v-if="update"
      class="bg-warning text-black q-ma-md"
      rounded
      inline-actions
    >
      Eine neue Version der App ist verfuegbar.
      <template #action>
        <q-btn
          flat
          color="black"
          label="Jetzt aktualisieren"
          @click="activateUpdate"
        />
      </template>
    </q-banner>

    <router-view />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const update = ref(false)

async function checkForWaitingServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) {
    console.log('registration failed!')
    return
  }

  registration.addEventListener('updatefound', () => {
    update.value = true
  })

  if (registration.waiting) update.value = true
}

async function activateUpdate() {
  const registration = await navigator.serviceWorker.getRegistration()
  if (registration) registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
  window.location.reload()
}

onMounted(() => {
  void checkForWaitingServiceWorker()
})
</script>
