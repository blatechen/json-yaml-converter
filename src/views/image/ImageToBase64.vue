<template>
  <section class="tool-section image-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-blue);">🖼️</span>
        <h2>圖片轉 Base64</h2>
      </div>
      <div class="section-actions">
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
      @click="triggerFileInput"
    >
      <input type="file" ref="hiddenInput" accept="image/*" multiple hidden @change="handleFileUpload">
      <div class="drop-zone-content">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <p>拖放圖片到這裡，或點擊上方「上傳圖片」按鈕</p>
        <span class="drop-zone-hint">支援 JPG、PNG、GIF、WebP 等格式，可多選</span>
      </div>
    </div>
    <div class="image-preview-list" v-if="images.length > 0">
      <div class="image-preview-item" v-for="(img, index) in images" :key="index">
        <img :src="img.dataUrl" :alt="img.name" class="preview-image">
        <div class="preview-content">
          <div class="preview-header">
            <span class="preview-filename">{{ img.name }}</span>
            <span class="preview-size">{{ formatSize(img.size) }}</span>
            <div class="preview-actions">
              <button class="icon-btn" @click="copyBase64(index, 'raw')" title="複製 Raw Base64">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <button class="icon-btn" @click="removeImage(index)" title="移除">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          <div class="preview-output-group">
            <div class="output-row">
              <span class="output-label">Data URL</span>
              <div class="output-content">
                <input type="text" class="output-text" :value="img.dataUrl" readonly>
                <button class="output-copy-btn" @click="copyBase64(index, 'dataUrl')" title="複製">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="output-row">
              <span class="output-label">Raw Base64</span>
              <div class="output-content">
                <input type="text" class="output-text" :value="img.rawBase64" readonly>
                <button class="output-copy-btn" @click="copyBase64(index, 'raw')" title="複製">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="section-footer">
      <span class="status">{{ status }}</span>
      <span class="line-count">{{ images.length }} 張圖片</span>
    </div>
  </section>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')

const images = ref([])
const status = ref('準備就緒')
const isDragOver = ref(false)
const hiddenInput = ref(null)

const triggerFileInput = () => {
  hiddenInput.value?.click()
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

  status.value = '處理中...'
  
  for (const file of files) {
    try {
      const dataUrl = await fileToBase64(file)
      const rawBase64 = dataUrl.split(',')[1]
      images.value.push({
        name: file.name,
        size: file.size,
        dataUrl,
        rawBase64
      })
    } catch (e) {
      showToast('error', `無法讀取 ${file.name}`)
    }
  }

  status.value = '準備就緒'
  showToast('success', `已載入 ${files.length} 張圖片`)
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const copyBase64 = async (index, type) => {
  const img = images.value[index]
  const text = type === 'dataUrl' ? img.dataUrl : img.rawBase64

  try {
    await navigator.clipboard.writeText(text)
    showToast('success', '已複製到剪貼簿')
  } catch (e) {
    showToast('error', '複製失敗')
  }
}

const copyAll = async () => {
  if (images.value.length === 0) {
    showToast('error', '沒有圖片可複製')
    return
  }

  const text = images.value.map(img => `${img.name}:\n${img.dataUrl}`).join('\n\n')
  try {
    await navigator.clipboard.writeText(text)
    showToast('success', '已複製全部')
  } catch (e) {
    showToast('error', '複製失敗')
  }
}

const removeImage = (index) => {
  images.value.splice(index, 1)
  showToast('success', '已移除')
}

const clearAll = () => {
  images.value = []
  showToast('success', '已清除全部')
}
</script>

<style scoped>
.image-section {
  border-color: rgba(88, 166, 255, 0.3);
}
</style>
