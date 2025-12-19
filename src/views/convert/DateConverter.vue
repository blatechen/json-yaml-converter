<template>
  <section class="tool-section date-converter-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-orange);">📅</span>
        <h2>日期轉換</h2>
      </div>
      <div class="section-actions">
        <button class="btn" @click="setToNow" title="現在時間">
          ⚡ 現在時間
        </button>
        <button class="btn" @click="clearContent" title="清除">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>

    <div class="converter-layout">
      <div class="input-pane">
        <div class="input-group">
          <label for="timestamp-input">請輸入時間戳 (10 或 13 位數字)</label>
          <div class="input-wrapper">
            <input 
              id="timestamp-input"
              v-model="timestampInput" 
              type="text" 
              class="form-control" 
              placeholder="例如: 1734619811 或 1734619811000"
              @input="validateAndConvert"
            />
            <span v-if="errorMsg" class="error-msg">{{ errorMsg }}</span>
          </div>
        </div>

        <div class="format-options">
          <label>快速格式選擇</label>
          <div class="radio-group">
            <label v-for="opt in formatOptions" :key="opt.value" class="radio-label">
              <input 
                type="radio" 
                :value="opt.value" 
                v-model="selectedFormat"
                @change="convert"
              >
              {{ opt.label }}
            </label>
          </div>
        </div>

        <div class="input-group">
          <label for="custom-format">自訂格式 (YYYY, MM, DD, HH, mm, ss)</label>
          <input 
            id="custom-format"
            v-model="customFormat" 
            type="text" 
            class="form-control" 
            placeholder="例如: YYYY/MM/DD HH:mm"
            @input="handleCustomFormatInput"
          />
        </div>
      </div>

      <div class="result-pane">
        <label>轉換結果</label>
        <div class="result-display" :class="{ 'has-error': errorMsg }">
          <div v-if="convertedDate" class="date-text">
            {{ convertedDate }}
          </div>
          <div v-else class="placeholder">
            等待輸入...
          </div>
          <button 
            v-if="convertedDate" 
            class="copy-btn" 
            @click="copyResult"
            title="複製結果"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="section-footer">
      <span class="status" :class="statusClass">{{ status }}</span>
    </div>
  </section>
</template>

<script setup>
import { ref, inject, watch } from 'vue'

const showToast = inject('showToast')

const timestampInput = ref('')
const selectedFormat = ref('YYYY-MM-DD HH:mm:ss')
const customFormat = ref('')
const convertedDate = ref('')
const errorMsg = ref('')
const status = ref('準備就緒')
const statusClass = ref('')

const formatOptions = [
  { label: '年-月-日 時:分:秒', value: 'YYYY-MM-DD HH:mm:ss' },
  { label: '年-月-日', value: 'YYYY-MM-DD' },
  { label: '時:分:秒', value: 'HH:mm:ss' },
  { label: '自訂', value: 'custom' }
]

const validateAndConvert = () => {
  errorMsg.value = ''
  if (!timestampInput.value) {
    convertedDate.value = ''
    status.value = '等待輸入'
    return
  }

  if (!/^\d+$/.test(timestampInput.value)) {
    errorMsg.value = '請輸入純數字時間戳'
    convertedDate.value = ''
    status.value = '輸入錯誤'
    statusClass.value = 'error'
    return
  }

  const len = timestampInput.value.length
  if (len !== 10 && len !== 13) {
    errorMsg.value = '時間戳長度應為 10 或 13 位'
    convertedDate.value = ''
    status.value = '輸入錯誤'
    statusClass.value = 'error'
    return
  }

  convert()
}

const convert = () => {
  if (!timestampInput.value || errorMsg.value) return

  try {
    let ts = parseInt(timestampInput.value)
    if (timestampInput.value.length === 10) {
      ts *= 1000
    }

    const date = new Date(ts)
    if (isNaN(date.getTime())) {
      errorMsg.value = '無效的時間戳'
      convertedDate.value = ''
      return
    }

    const format = selectedFormat.value === 'custom' ? customFormat.value : selectedFormat.value
    convertedDate.value = formatDate(date, format)
    status.value = '轉換成功'
    statusClass.value = 'success'
  } catch (err) {
    console.error(err)
    errorMsg.value = '轉換過程出錯'
    convertedDate.value = ''
    status.value = '錯誤'
    statusClass.value = 'error'
  }
}

const formatDate = (date, format) => {
  if (!format) return date.toLocaleString()

  const map = {
    YYYY: date.getFullYear(),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0')
  }

  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched])
}

const handleCustomFormatInput = () => {
  selectedFormat.value = 'custom'
  convert()
}

const setToNow = () => {
  timestampInput.value = String(Date.now())
  validateAndConvert()
}

const clearContent = () => {
  timestampInput.value = ''
  convertedDate.value = ''
  errorMsg.value = ''
  status.value = '已清除'
  statusClass.value = ''
}

const copyResult = async () => {
  if (!convertedDate.value) return
  try {
    await navigator.clipboard.writeText(convertedDate.value)
    showToast('success', '已複製到剪貼簿')
  } catch (err) {
    showToast('error', '複製失敗')
  }
}

// Watch for format changes
watch(selectedFormat, () => {
  if (selectedFormat.value !== 'custom') {
    convert()
  }
})
</script>

<style scoped>
.converter-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  padding: var(--space-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.input-pane, .result-pane {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.form-control {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-control:focus {
  border-color: var(--accent-blue);
}

.error-msg {
  color: var(--error);
  font-size: 0.8rem;
  margin-top: 4px;
}

.format-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.format-options label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.result-display {
  position: relative;
  min-height: 80px;
  padding: var(--space-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-display.has-error {
  border-color: var(--error);
}

.date-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-blue);
  font-family: 'Consolas', monospace;
}

.placeholder {
  color: var(--text-muted);
  font-style: italic;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

@media (min-width: 768px) {
  .converter-layout {
    flex-direction: row;
  }
  .input-pane {
    flex: 3;
  }
  .result-pane {
    flex: 2;
  }
  .result-display {
    height: 100%;
  }
}
</style>
