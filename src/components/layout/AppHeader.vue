<template>
  <header class="header">
    <h1>🛠️ My Kits</h1>
  </header>
</template>

<script setup>
</script>

<style scoped>
.header {
  text-align: center;
  padding: var(--space-md) var(--space-lg);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
}

.header h1 {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #58a6ff, #a371f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-top: var(--space-xs);
}
</style>
