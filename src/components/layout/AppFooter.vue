<template>
  <footer class="footer">
    <span>© 2024 格式化工具</span>
    <span class="footer-version">v1.0.0</span>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-lg);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-primary);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.footer-version {
  font-family: var(--font-mono);
}
</style>
