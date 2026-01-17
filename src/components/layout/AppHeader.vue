<template>
  <header class="header">
    <h1>🛠️ My Kits</h1>
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切換明亮模式' : '切換暗黑模式'">
      {{ isDark ? '☀️' : '🌙' }}
    </button>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.header h1 {
  font-size: 1.25rem;
  color: var(--accent-blue);
  font-weight: 700;
}

.theme-toggle {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  border-color: var(--accent-blue);
}
</style>
