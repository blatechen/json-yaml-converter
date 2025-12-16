<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-content">
        <router-view />
      </main>
    </div>
    <AppFooter />
    <Toast ref="toastRef" />
  </div>
</template>

<script setup>
import { provide, ref } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import Toast from './components/common/Toast.vue'

const toastRef = ref(null)

const showToast = (type, message) => {
  toastRef.value?.show(type, message)
}

provide('showToast', showToast)
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  background: var(--bg-primary);
}
</style>
