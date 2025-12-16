<template>
  <section class="tool-section json-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-yellow);">{ }</span>
        <h2>JSON 格式化</h2>
      </div>
      <div class="section-actions">
        <label class="btn">
          <input type="file" accept=".json" hidden @change="handleFileUpload">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          上傳
        </label>
        <button class="btn" @click="pasteFromClipboard" title="貼上">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          貼上
        </button>
        <button class="btn primary" @click="formatJson">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="21" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="3" y2="18" />
          </svg>
          格式化
        </button>
        <button class="btn" @click="toggleCollapseAll" title="全部折疊/展開">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <button class="btn" @click="copyToClipboard" title="複製">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <button class="btn" @click="clearContent" title="清除">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
    <div class="editor-wrapper" style="min-height: 300px;">
      <div class="editor-container">
        <div class="gutter">
          <div class="line-numbers" ref="lineNumbersRef">
            <span 
              v-for="(line, index) in lineNumbers" 
              :key="index"
              :class="{ 'error-line': errorLine === index + 1 }"
            >{{ line }}</span>
          </div>
          <div class="fold-gutter">
            <button 
              v-for="(foldable, index) in foldableLines" 
              :key="index"
              v-show="foldable"
              class="fold-btn"
              :class="{ collapsed: foldState[index] }"
              @click="toggleFold(index)"
            ></button>
            <span v-for="(foldable, index) in foldableLines" :key="'s'+index" v-show="!foldable" style="height: 1.5em; display: block;"></span>
          </div>
        </div>
        <textarea 
          ref="editorRef"
          v-model="content"
          class="editor" 
          placeholder="在此貼上 JSON 內容，或點擊「上傳」按鈕選擇檔案..."
          @input="onInput"
          @scroll="syncScroll"
        ></textarea>
      </div>
      <div class="error-panel" :class="{ show: hasError }">
        <div class="error-header">
          <span class="error-icon">❌</span>
          <span class="error-title">JSON 格式錯誤</span>
        </div>
        <div class="error-content">
          <div class="error-line">行號: {{ errorLine || '-' }}</div>
          <div class="error-message">{{ errorMessage }}</div>
        </div>
      </div>
    </div>
    <div class="section-footer">
      <span class="status" :class="statusClass">{{ status }}</span>
      <span class="line-count">{{ lineCount }} 行</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject, watch, nextTick } from 'vue'

const showToast = inject('showToast')

const content = ref('')
const editorRef = ref(null)
const lineNumbersRef = ref(null)
const status = ref('準備就緒')
const statusClass = ref('')
const hasError = ref(false)
const errorLine = ref(null)
const errorMessage = ref('')
const foldState = ref({})
const allCollapsed = ref(false)

const lineCount = computed(() => {
  return content.value ? content.value.split('\n').length : 0
})

const lineNumbers = computed(() => {
  const count = Math.max(lineCount.value, 1)
  return Array.from({ length: count }, (_, i) => i + 1)
})

const foldableLines = computed(() => {
  const lines = content.value.split('\n')
  return lines.map(line => {
    const trimmed = line.trim()
    return trimmed.endsWith('{') || trimmed.endsWith('[')
  })
})

const onInput = () => {
  hideError()
  updateLineNumbers()
}

const updateLineNumbers = () => {
  nextTick(() => {
    syncScroll()
  })
}

const syncScroll = () => {
  if (lineNumbersRef.value && editorRef.value) {
    lineNumbersRef.value.scrollTop = editorRef.value.scrollTop
  }
}

const formatJson = () => {
  if (!content.value.trim()) {
    showToast('error', '請輸入 JSON 內容')
    return
  }

  try {
    // First try standard JSON parse
    let parsed
    try {
      parsed = JSON.parse(content.value)
    } catch (standardError) {
      // If standard parse fails, try normalizing (handle unquoted keys like {a:""})
      const normalized = normalizeJson(content.value)
      parsed = JSON.parse(normalized)
    }
    content.value = JSON.stringify(parsed, null, 2)
    hideError()
    status.value = '格式化成功'
    statusClass.value = 'success'
    showToast('success', 'JSON 格式化完成')
  } catch (e) {
    showJsonError(e)
    status.value = '格式錯誤'
    statusClass.value = 'error'
  }
}

// Normalize JSON5-like syntax to valid JSON (handle unquoted keys and trailing commas)
const normalizeJson = (str) => {
  // Step 1: Replace unquoted keys with quoted keys
  // Match: { key: or , key: where key is not already quoted
  let result = str.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
  
  // Step 2: Remove trailing commas before } or ]
  // Match: , followed by optional whitespace/newlines and then } or ]
  result = result.replace(/,(\s*[}\]])/g, '$1')
  
  return result
}

const validateJson = () => {
  if (!content.value.trim()) return

  try {
    JSON.parse(content.value)
    hideError()
  } catch (e) {
    showJsonError(e)
  }
}

const showJsonError = (e) => {
  hasError.value = true
  const match = e.message.match(/position\s*(\d+)/i)
  if (match) {
    const pos = parseInt(match[1])
    const beforeError = content.value.substring(0, pos)
    errorLine.value = beforeError.split('\n').length
  } else {
    const lineMatch = e.message.match(/line\s*(\d+)/i)
    errorLine.value = lineMatch ? parseInt(lineMatch[1]) : null
  }
  errorMessage.value = e.message
}

const hideError = () => {
  hasError.value = false
  errorLine.value = null
  errorMessage.value = ''
  statusClass.value = ''
  status.value = '準備就緒'
}

const toggleFold = (lineIndex) => {
  foldState.value[lineIndex] = !foldState.value[lineIndex]
}

const toggleCollapseAll = () => {
  allCollapsed.value = !allCollapsed.value
  foldableLines.value.forEach((foldable, index) => {
    if (foldable) {
      foldState.value[index] = allCollapsed.value
    }
  })
}

const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    content.value = event.target.result
    onInput()
    showToast('success', `已載入 ${file.name}`)
  }
  reader.readAsText(file)
  e.target.value = ''
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    content.value = text
    onInput()
    showToast('success', '已貼上剪貼簿內容')
  } catch (e) {
    showToast('error', '無法讀取剪貼簿')
  }
}

const copyToClipboard = async () => {
  if (!content.value) {
    showToast('error', '沒有內容可複製')
    return
  }

  try {
    await navigator.clipboard.writeText(content.value)
    showToast('success', '已複製到剪貼簿')
  } catch (e) {
    showToast('error', '複製失敗')
  }
}

const clearContent = () => {
  content.value = ''
  hideError()
  foldState.value = {}
  showToast('success', '已清除')
}
</script>

<style scoped>
.json-section {
  border-color: rgba(210, 153, 34, 0.3);
}
</style>
