<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <div v-for="(group, index) in menuItems" :key="index" class="menu-group">
        <button 
          class="menu-group-header" 
          @click="toggleGroup(index)"
          :class="{ expanded: expandedGroups.includes(index) }"
        >
          <span class="menu-icon">{{ group.icon }}</span>
          <span class="menu-label">{{ group.label }}</span>
          <span class="menu-arrow">▼</span>
        </button>
        <Transition name="slide">
          <ul v-show="expandedGroups.includes(index)" class="menu-items">
            <li v-for="item in group.children" :key="item.path">
              <router-link 
                :to="item.path" 
                class="menu-item"
                :class="{ active: $route.path === item.path }"
              >
                {{ item.label }}
              </router-link>
            </li>
          </ul>
        </Transition>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const menuItems = [
  {
    icon: '📝',
    label: '格式化工具',
    children: [
      { path: '/format/json', label: 'JSON 格式化' }
    ]
  },
  {
    icon: '🖼️',
    label: '圖片處理',
    children: [
      { path: '/image/base64', label: '圖片轉 Base64' },
      { path: '/image/ocr', label: 'OCR 文字辨識' },
      { path: '/image/camera', label: '攝影拍照' }
    ]
  },
  {
    icon: '🔄',
    label: '格式轉換',
    children: [
      { path: '/convert/props-yaml', label: 'Properties ⟷ YAML' },
      { path: '/convert/json-pojo', label: 'JSON 轉 Java POJO' },
      { path: '/convert/xml-pojo', label: 'XML 轉 JAXB' },
      { path: '/convert/markdown', label: 'Markdown 格式轉換' },
      { path: '/convert/date', label: '日期轉換' },
      { path: '/convert/cron', label: 'Cron 表達式轉換' }
    ]
  },
  {
    icon: '📚',
    label: '學習',
    children: [
      { path: '/learning/markdown', label: 'Markdown 學習' }
    ]
  }
]

const expandedGroups = ref([0, 1, 2, 3])

const toggleGroup = (index) => {
  const idx = expandedGroups.value.indexOf(index)
  if (idx > -1) {
    expandedGroups.value.splice(idx, 1)
  } else {
    expandedGroups.value.push(index)
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  overflow-y: auto;
}

.sidebar-nav {
  padding: var(--space-md);
}

.menu-group {
  margin-bottom: var(--space-sm);
}

.menu-group-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms;
  gap: var(--space-sm);
}

.menu-group-header:hover {
  background: var(--bg-hover);
}

.menu-icon {
  font-size: 1rem;
}

.menu-label {
  flex: 1;
  text-align: left;
}

.menu-arrow {
  font-size: 0.65rem;
  color: var(--text-muted);
  transition: transform 200ms;
}

.menu-group-header.expanded .menu-arrow {
  transform: rotate(0deg);
}

.menu-group-header:not(.expanded) .menu-arrow {
  transform: rotate(-90deg);
}

.menu-items {
  list-style: none;
  margin: 0;
  padding: var(--space-xs) 0 0 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  padding-left: calc(var(--space-md) + var(--space-lg));
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 150ms;
}

.menu-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.menu-item.active {
  background: rgba(79, 70, 229, 0.1);  /* indigo with 10% opacity */
  color: var(--accent-blue);
  font-weight: 500;
}

/* Slide transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 200ms ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
