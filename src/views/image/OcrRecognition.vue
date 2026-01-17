<template>
  <section class="tool-section ocr-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-green);">📝</span>
        <h2>OCR 文字辨識</h2>
      </div>
      <div class="section-actions">
        <select v-model="selectedLang" class="form-select">
          <option value="chi_tra+eng">正體中文 + English</option>
          <option value="chi_tra">正體中文 (純中文)</option>
          <option value="chi_sim+eng">簡體中文 + English</option>
          <option value="chi_sim">簡體中文 (純中文)</option>
          <option value="eng">English</option>
        </select>
        <label class="btn">
          <input type="file" accept="image/*" multiple hidden @change="handleFileUpload">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          上傳圖片
        </label>
        <button class="btn" @click="copyAll" title="複製全部">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          複製全部
        </button>
        <button class="btn" @click="clearAll" title="清除">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          清除
        </button>
      </div>
    </div>
    <div 
      class="drop-zone" 
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <div class="drop-zone-content">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
        <p>拖放圖片到這裡進行文字辨識</p>
        <span class="drop-zone-hint">首次使用需下載語言模型，請耐心等待</span>
      </div>
    </div>
    <div class="progress-container" :class="{ show: isProcessing }">
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: progress + '%' }"></div>
      </div>
      <span class="progress-text">{{ progressText }}</span>
    </div>
    <div class="image-preview-list ocr-results" v-if="results.length > 0">
      <div class="image-preview-item" v-for="(item, index) in results" :key="index">
        <img :src="item.imageUrl" :alt="item.name" class="preview-image">
        <div class="preview-content">
          <div class="preview-header">
            <span class="preview-filename">{{ item.name }}</span>
            <div class="preview-actions">
              <button class="icon-btn" @click="copyText(index)" title="複製">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <button class="icon-btn" @click="removeResult(index)" title="移除">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <div class="preview-output">{{ item.text || '(辨識中...)' }}</div>
        </div>
      </div>
    </div>
    <div class="section-footer">
      <span class="status">{{ status }}</span>
      <span class="line-count">{{ results.length }} 張圖片</span>
    </div>
  </section>
</template>

<script setup>
import { ref, inject, onUnmounted } from 'vue'
import Tesseract from 'tesseract.js'

const showToast = inject('showToast')

const results = ref([])
const status = ref('準備就緒')
const isDragOver = ref(false)
const isProcessing = ref(false)
const progress = ref(0)
const progressText = ref('準備中...')
const selectedLang = ref('chi_tra+eng')

let worker = null

const initWorker = async (lang) => {
  if (worker) {
    await worker.terminate()
  }
  worker = await Tesseract.createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        progress.value = Math.round(m.progress * 100)
        progressText.value = `辨識中 ${progress.value}%`
      } else if (m.status === 'loading language traineddata') {
        progressText.value = '載入語言模型...'
      } else if (m.status === 'initializing api') {
        progressText.value = '初始化...'
      }
    }
  })
}

const handleFileUpload = async (e) => {
  const files = Array.from(e.target.files || [])
  await processFiles(files)
  if (e.target) e.target.value = ''
}

const handleDrop = async (e) => {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
  await processFiles(files)
}

const processFiles = async (files) => {
  if (files.length === 0) return

  isProcessing.value = true
  status.value = '處理中...'

  try {
    await initWorker(selectedLang.value)

    for (const file of files) {
      const imageUrl = await fileToDataUrl(file)
      const resultIndex = results.value.length
      results.value.push({
        name: file.name,
        imageUrl,
        text: ''
      })

      progressText.value = `處理 ${file.name}...`
      
      try {
        const { data } = await worker.recognize(imageUrl)
        results.value[resultIndex].text = data.text.trim() || '(未辨識到文字)'
      } catch (e) {
        results.value[resultIndex].text = `(辨識失敗: ${e.message})`
      }
    }

    showToast('success', `已完成 ${files.length} 張圖片的辨識`)
  } catch (e) {
    showToast('error', `OCR 初始化失敗: ${e.message}`)
  } finally {
    isProcessing.value = false
    progress.value = 0
    status.value = '準備就緒'
  }
}

const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const copyText = async (index) => {
  const text = results.value[index]?.text
  if (!text) {
    showToast('error', '沒有內容可複製')
    return
  }

  try {
    await navigator.clipboard.writeText(text)
    showToast('success', '已複製到剪貼簿')
  } catch (e) {
    showToast('error', '複製失敗')
  }
}

const copyAll = async () => {
  if (results.value.length === 0) {
    showToast('error', '沒有內容可複製')
    return
  }

  const text = results.value.map(r => `[${r.name}]\n${r.text}`).join('\n\n')
  try {
    await navigator.clipboard.writeText(text)
    showToast('success', '已複製全部')
  } catch (e) {
    showToast('error', '複製失敗')
  }
}

const removeResult = (index) => {
  results.value.splice(index, 1)
  showToast('success', '已移除')
}

const clearAll = () => {
  results.value = []
  showToast('success', '已清除全部')
}

onUnmounted(async () => {
  if (worker) {
    await worker.terminate()
  }
})
</script>

<style scoped>
.ocr-section {
  border-color: rgba(63, 185, 80, 0.3);
}
</style>
