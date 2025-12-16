<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="visible" class="toast" :class="type">
        <span class="toast-icon"></span>
        <span class="toast-message">{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const type = ref('success')
const message = ref('')

let timeout = null

const show = (toastType, toastMessage) => {
  if (timeout) clearTimeout(timeout)
  type.value = toastType
  message.value = toastMessage
  visible.value = true
  timeout = setTimeout(() => {
    visible.value = false
  }, 2500)
}

defineExpose({ show })
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.toast.success {
  border-color: var(--accent-green);
}

.toast.error {
  border-color: var(--accent-red);
}

.toast.success .toast-icon::before {
  content: '✓';
  color: var(--accent-green);
}

.toast.error .toast-icon::before {
  content: '✕';
  color: var(--accent-red);
}

.toast-message {
  color: var(--text-primary);
  font-size: 0.85rem;
}

/* Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 250ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
