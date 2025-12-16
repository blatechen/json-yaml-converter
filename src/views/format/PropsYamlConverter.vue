<template>
  <section class="tool-section converter-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-purple);">⟷</span>
        <h2>Properties ⟷ YAML 轉換</h2>
      </div>
    </div>
    <div class="converter-container">
      <!-- Properties Panel -->
      <div class="converter-panel properties-panel">
        <div class="panel-header">
          <span class="format-badge properties">Properties</span>
          <div class="panel-actions">
            <label class="icon-btn" title="上傳">
              <input type="file" accept=".properties" hidden @change="e => handleFileUpload(e, 'properties')">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </label>
            <button class="icon-btn" @click="paste('properties')" title="貼上">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button class="icon-btn" @click="copy('properties')" title="複製">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button class="icon-btn" @click="clear('properties')" title="清除">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
        <div class="editor-wrapper">
          <div class="editor-container">
            <div class="line-numbers" ref="propsLineNumbersRef">
              <span v-for="n in propsLineCount" :key="n">{{ n }}</span>
            </div>
            <textarea 
              ref="propsEditorRef"
              v-model="propsContent"
              class="editor" 
              placeholder="輸入 Properties 格式...

例如:
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/db"
              @input="updateLineNumbers('properties')"
              @scroll="syncScroll('properties')"
            ></textarea>
          </div>
          <div class="error-panel compact" :class="{ show: propsError.show }">
            <span class="error-icon">❌</span>
            <span>行 {{ propsError.line }}: </span>
            <span>{{ propsError.message }}</span>
          </div>
        </div>
        <div class="panel-footer">
          <span class="status" :class="propsStatus.class">{{ propsStatus.text }}</span>
          <span class="line-count">{{ propsLineCount }} 行</span>
        </div>
      </div>

      <!-- Convert Buttons -->
      <div class="convert-buttons">
        <button class="convert-btn" @click="propsToYaml" title="Properties → YAML">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12,5 19,12 12,19" />
          </svg>
        </button>
        <button class="convert-btn" @click="yamlToProps" title="YAML → Properties">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12,19 5,12 12,5" />
          </svg>
        </button>
      </div>

      <!-- YAML Panel -->
      <div class="converter-panel yaml-panel">
        <div class="panel-header">
          <span class="format-badge yaml">YAML</span>
          <div class="panel-actions">
            <label class="icon-btn" title="上傳">
              <input type="file" accept=".yaml,.yml" hidden @change="e => handleFileUpload(e, 'yaml')">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </label>
            <button class="icon-btn" @click="paste('yaml')" title="貼上">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button class="icon-btn" @click="copy('yaml')" title="複製">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button class="icon-btn" @click="clear('yaml')" title="清除">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
        <div class="editor-wrapper">
          <div class="editor-container">
            <div class="line-numbers" ref="yamlLineNumbersRef">
              <span v-for="n in yamlLineCount" :key="n">{{ n }}</span>
            </div>
            <textarea 
              ref="yamlEditorRef"
              v-model="yamlContent"
              class="editor" 
              placeholder="輸入 YAML 格式...

例如:
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/db"
              @input="updateLineNumbers('yaml')"
              @scroll="syncScroll('yaml')"
            ></textarea>
          </div>
          <div class="error-panel compact" :class="{ show: yamlError.show }">
            <span class="error-icon">❌</span>
            <span>行 {{ yamlError.line }}: </span>
            <span>{{ yamlError.message }}</span>
          </div>
        </div>
        <div class="panel-footer">
          <span class="status" :class="yamlStatus.class">{{ yamlStatus.text }}</span>
          <span class="line-count">{{ yamlLineCount }} 行</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import jsyaml from 'js-yaml'

const showToast = inject('showToast')

const propsContent = ref('')
const yamlContent = ref('')
const propsEditorRef = ref(null)
const yamlEditorRef = ref(null)
const propsLineNumbersRef = ref(null)
const yamlLineNumbersRef = ref(null)

const propsStatus = ref({ text: '準備就緒', class: '' })
const yamlStatus = ref({ text: '準備就緒', class: '' })
const propsError = ref({ show: false, line: '-', message: '' })
const yamlError = ref({ show: false, line: '-', message: '' })

const propsLineCount = computed(() => Math.max(propsContent.value.split('\n').length, 1))
const yamlLineCount = computed(() => Math.max(yamlContent.value.split('\n').length, 1))

const updateLineNumbers = (target) => {
  // Line numbers are computed reactively
}

const syncScroll = (target) => {
  if (target === 'properties' && propsLineNumbersRef.value && propsEditorRef.value) {
    propsLineNumbersRef.value.scrollTop = propsEditorRef.value.scrollTop
  } else if (target === 'yaml' && yamlLineNumbersRef.value && yamlEditorRef.value) {
    yamlLineNumbersRef.value.scrollTop = yamlEditorRef.value.scrollTop
  }
}

const hideError = (target) => {
  if (target === 'properties') {
    propsError.value = { show: false, line: '-', message: '' }
    propsStatus.value = { text: '準備就緒', class: '' }
  } else {
    yamlError.value = { show: false, line: '-', message: '' }
    yamlStatus.value = { text: '準備就緒', class: '' }
  }
}

// Parse properties string to object
const parseProperties = (str) => {
  const result = {}
  const lines = str.split('\n')
  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) return
    const key = trimmed.substring(0, eqIdx).trim()
    const value = trimmed.substring(eqIdx + 1).trim()
    setNestedValue(result, key, parseValue(value))
  })
  return result
}

const setNestedValue = (obj, path, value) => {
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) current[keys[i]] = {}
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
}

const parseValue = (v) => {
  if (v === 'true') return true
  if (v === 'false') return false
  if (!isNaN(v) && v !== '') return Number(v)
  return v
}

// Convert object to properties string
const objectToProperties = (obj, prefix = '') => {
  let result = []
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      result = result.concat(objectToProperties(val, fullKey))
    } else {
      result.push(`${fullKey}=${val}`)
    }
  }
  return result
}

const propsToYaml = () => {
  if (!propsContent.value.trim()) {
    showToast('error', '請輸入 Properties 內容')
    return
  }

  try {
    hideError('properties')
    const obj = parseProperties(propsContent.value)
    yamlContent.value = jsyaml.dump(obj, { indent: 2, lineWidth: -1 })
    propsStatus.value = { text: '轉換成功', class: 'success' }
    showToast('success', 'Properties → YAML 轉換完成')
  } catch (e) {
    propsError.value = { show: true, line: '-', message: e.message }
    propsStatus.value = { text: '轉換失敗', class: 'error' }
    showToast('error', '轉換失敗')
  }
}

const yamlToProps = () => {
  if (!yamlContent.value.trim()) {
    showToast('error', '請輸入 YAML 內容')
    return
  }

  try {
    hideError('yaml')
    const obj = jsyaml.load(yamlContent.value)
    const lines = objectToProperties(obj)
    propsContent.value = lines.join('\n')
    yamlStatus.value = { text: '轉換成功', class: 'success' }
    showToast('success', 'YAML → Properties 轉換完成')
  } catch (e) {
    const lineMatch = e.message.match(/line\s*(\d+)/i)
    yamlError.value = { 
      show: true, 
      line: lineMatch ? lineMatch[1] : '-', 
      message: e.message 
    }
    yamlStatus.value = { text: '轉換失敗', class: 'error' }
    showToast('error', 'YAML 格式錯誤')
  }
}

const handleFileUpload = (e, target) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    if (target === 'properties') {
      propsContent.value = event.target.result
      hideError('properties')
    } else {
      yamlContent.value = event.target.result
      hideError('yaml')
    }
    showToast('success', `已載入 ${file.name}`)
  }
  reader.readAsText(file)
  e.target.value = ''
}

const paste = async (target) => {
  try {
    const text = await navigator.clipboard.readText()
    if (target === 'properties') {
      propsContent.value = text
      hideError('properties')
    } else {
      yamlContent.value = text
      hideError('yaml')
    }
    showToast('success', '已貼上剪貼簿內容')
  } catch (e) {
    showToast('error', '無法讀取剪貼簿')
  }
}

const copy = async (target) => {
  const content = target === 'properties' ? propsContent.value : yamlContent.value
  if (!content) {
    showToast('error', '沒有內容可複製')
    return
  }

  try {
    await navigator.clipboard.writeText(content)
    showToast('success', '已複製到剪貼簿')
  } catch (e) {
    showToast('error', '複製失敗')
  }
}

const clear = (target) => {
  if (target === 'properties') {
    propsContent.value = ''
    hideError('properties')
  } else {
    yamlContent.value = ''
    hideError('yaml')
  }
  showToast('success', '已清除')
}
</script>

<style scoped>
.converter-section {
  border-color: rgba(163, 113, 247, 0.3);
}
</style>
