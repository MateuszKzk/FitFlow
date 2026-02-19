<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-dark-header text-white">
      <q-toolbar class="q-px-md fitflow-toolbar">
        <div class="brand-wrap">
          <img src="/icons/Logo_FitFlow.svg" alt="FitFlow Logo" class="brand-logo">
          <div>
            <div class="brand-title">FitFlow</div>
            <div class="brand-sub">PWA Workout Planner</div>
          </div>
        </div>
        <q-chip dense color="cyan-9" text-color="cyan-2" class="desktop-chip">
          Camera + GPS + PWA
        </q-chip>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
