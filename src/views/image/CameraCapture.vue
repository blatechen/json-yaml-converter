<template>
  <section class="tool-section camera-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-blue);">📷</span>
        <h2>攝影拍照</h2>
      </div>
      <div class="section-actions">
        <select 
          v-model="selectedResolution" 
          class="res-select" 
          :disabled="cameraActive || hasCaptured"
          :title="cameraActive || hasCaptured ? '請點擊右邊的「重置」按鈕關閉相機，即可重新選擇' : '選擇相機解析度'"
        >
          <!-- Fix: 鎖定解析度以避免硬體串流衝突與 UX 困惑 -->
          <option value="720p">HD (720p)</option>
          <option value="1080p">Full HD (1080p)</option>
          <option value="4k">4K (2160p)</option>
        </select>
        <button class="btn" @click="downloadImage" :disabled="!hasCaptured" title="下載圖片">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          下載
        </button>
        <button class="btn" @click="copyBase64" :disabled="!hasCaptured" title="複製 Base64">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Base64
        </button>
        <button class="btn" @click="clearAll" title="清空並重置所有狀態">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          重置
        </button>
      </div>
    </div>

    <div class="camera-container">
      <div class="camera-stream-wrapper">
        <div class="camera-view" :class="{ 'has-captured': hasCaptured }">
          <video ref="videoRef" autoplay playsinline muted v-show="!hasCaptured"></video>
          <canvas ref="canvasRef" style="display: none;"></canvas>
          <div v-if="hasCaptured" class="captured-preview">
            <img :src="capturedDataUrl" alt="Captured photo">
          </div>
          <div v-if="error" class="error-overlay">
            <span class="error-icon">⚠️</span>
            <p>{{ error }}</p>
            <button class="btn btn-sm" @click="startCamera">重新嘗試啟動相機</button>
          </div>
          <div v-if="!cameraActive && !hasCaptured && !error" class="placeholder-overlay">
            <button class="btn btn-primary" @click="startCamera">開啟鏡頭</button>
          </div>
        </div>
        
        <div class="capture-controls" v-if="cameraActive && !hasCaptured">
          <button class="btn-capture" @click="capturePhoto" :disabled="!isReady">
            <div class="inner-circle"></div>
          </button>
          <span class="capture-hint">點擊拍照</span>
        </div>
        
        <div class="action-overlay" v-if="hasCaptured">
          <button class="btn btn-outline" @click="retake">重新拍攝</button>
        </div>
      </div>
    </div>

    <div class="section-footer">
      <span class="status">{{ status }}</span>
      <span v-if="cameraActive && currentResolution" class="info" style="margin-left: 10px;">
        當前解析度: {{ currentResolution.width }}x{{ currentResolution.height }}
      </span>
      <span v-if="hasCaptured" class="info">圖片大小: {{ imageInfo }}</span>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, computed } from 'vue'

const showToast = inject('showToast')

const videoRef = ref(null)
const canvasRef = ref(null)
const cameraActive = ref(false)
const isReady = ref(false)
const hasCaptured = ref(false)
const capturedDataUrl = ref('')
const error = ref('')
const status = ref('等待相機啟動...')
const selectedResolution = ref('1080p')
const currentResolution = ref(null)

const resolutions = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 }
}

let stream = null

const startCamera = async () => {
  error.value = ''
  status.value = '正在存取相機...'
  const res = resolutions[selectedResolution.value]
  
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: res.width },
        height: { ideal: res.height },
        facingMode: 'user'
      } 
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      cameraActive.value = true
      status.value = '相機已啟動'
      videoRef.value.onloadedmetadata = () => {
        isReady.value = true
        currentResolution.value = {
          width: videoRef.value.videoWidth,
          height: videoRef.value.videoHeight
        }
      }
    }
  } catch (err) {
    console.error('Camera error:', err)
    error.value = '無法存取相機，請確認已授予權限並確認設備正常工作。'
    status.value = '連線失敗'
    cameraActive.value = false
  }
}

const capturePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const context = canvas.getContext('2d')

  // Use actual video dimensions as reported by the stream
  const width = video.videoWidth
  const height = video.videoHeight

  if (width === 0 || height === 0 || video.readyState < 2) {
    // Fix: 檢查 readyState 防止視訊數據未載入導致的白屏/黑屏
    showToast('error', '視訊數據尚未完全載入，請稍後再試')
    return
  }

  canvas.width = width
  canvas.height = height

  // Clear canvas first
  context.clearRect(0, 0, width, height)
  
  // Mirror the capture to match the mirrored preview
  // scaleX(-1) means we need to translate by width and scale -1
  // Fix: 水平翻轉畫布以匹配預覽畫面的鏡像效果
  context.save()
  context.translate(width, 0)
  context.scale(-1, 1)
  context.drawImage(video, 0, 0, width, height)
  context.restore()

  // Use JPEG to reduce Base64 string length and avoid memory/truncation issues
  // Quality 0.9 is excellent while saving a lot of size over PNG
  // Fix: 改用 JPEG 避免高解析度下 PNG Base64 字串過長導致截斷
  try {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    if (!dataUrl || dataUrl.length < 100) {
      throw new Error('產生的圖片數據無效')
    }
    capturedDataUrl.value = dataUrl
    hasCaptured.value = true
    status.value = `已完成拍攝 (${width}x${height})`
    showToast('success', '拍照成功')
    stopCamera()
  } catch (err) {
    console.error('Capture error:', err)
    showToast('error', '拍照失敗：' + err.message)
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
  cameraActive.value = false
  isReady.value = false
}

const retake = () => {
  hasCaptured.value = false
  capturedDataUrl.value = ''
  startCamera()
}

const downloadImage = () => {
  if (!capturedDataUrl.value) return
  const link = document.createElement('a')
  link.download = `photo-${Date.now()}.jpg`
  link.href = capturedDataUrl.value
  link.click()
  showToast('success', '圖片已開始下載')
}

const copyBase64 = async () => {
  if (!capturedDataUrl.value) return
  try {
    await navigator.clipboard.writeText(capturedDataUrl.value)
    showToast('success', 'Base64 碼已複製到剪貼簿')
  } catch (err) {
    showToast('error', '複製失敗')
  }
}

const clearAll = () => {
  stopCamera()
  hasCaptured.value = false
  capturedDataUrl.value = ''
  error.value = ''
  status.value = '等待相機啟動...'
  currentResolution.value = null
}

const imageInfo = computed(() => {
  if (!capturedDataUrl.value) return ''
  const base64Length = capturedDataUrl.value.length
  const sizeInBytes = Math.round(base64Length * 0.75)
  if (sizeInBytes > 1024 * 1024) {
    return (sizeInBytes / (1024 * 1024)).toFixed(2) + ' MB'
  }
  return (sizeInBytes / 1024).toFixed(2) + ' KB'
})

onMounted(() => {
  // We can choose to star camera immediately or wait for user action
  // User interaction is better for mobile/permission clarity
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.camera-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  max-width: 900px;
  margin: 0 auto;
}

.camera-stream-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 1px solid var(--border-primary);
}

.camera-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1); /* Mirror effect for user convenience */
}

.captured-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.error-overlay, .placeholder-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: var(--space-lg);
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.error-overlay p {
  margin-bottom: var(--space-md);
  max-width: 400px;
}

.capture-controls {
  position: absolute;
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  z-index: 10;
}

.btn-capture {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  border: 4px solid white;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-capture:hover:not(:disabled) {
  background: rgba(255,255,255,0.5);
}

.btn-capture:active:not(:disabled) {
  transform: scale(0.9);
}

.btn-capture:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.inner-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
}

.capture-hint {
  color: white;
  font-size: 0.8rem;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  font-weight: 600;
}

.action-overlay {
  position: absolute;
  bottom: var(--space-md);
  right: var(--space-md);
  z-index: 10;
}

.btn-outline {
  background: rgba(0,0,0,0.5);
  border: 1px solid white;
  color: white;
}

.btn-outline:hover {
  background: white;
  color: black;
}

.res-select {
  padding: 6px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.res-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
