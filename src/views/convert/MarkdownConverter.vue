<template>
  <section class="tool-section markdown-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-blue);">M↓</span>
        <h2>Markdown 格式轉換</h2>
      </div>
      <div class="section-actions">
        <label class="btn">
          <input type="file" accept=".md,.pdf,.docx" hidden @change="handleFileUpload">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          上傳檔案
        </label>
        <button class="btn" @click="pasteFromClipboard" title="貼上">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          貼上
        </button>
          <button class="btn" @click="downloadPdf" title="預覽/列印 PDF">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9V2h12v7"></path>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <path d="M6 14h12v8H6z"></path>
            </svg>
            預覽/列印 PDF
          </button>
        <button class="btn" @click="downloadDocx" title="下載為 Docx">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          下載 Docx
        </button>
        <button class="btn" @click="clearContent" title="清除">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>

    <div class="editor-wrapper split-view">
      <div class="editor-pane">
        <textarea 
          v-model="markdown" 
          class="editor" 
          placeholder="在此輸入 Markdown 或上傳 PDF/Docx/MD..."
        ></textarea>
      </div>
      <div class="preview-pane">
        <div class="preview-content markdown-body" ref="previewRef" v-html="htmlContent"></div>
      </div>
    </div>
    
    <div class="section-footer">
      <span class="status" :class="statusClass">{{ status }}</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { marked } from 'marked'
import mammoth from 'mammoth'
import TurndownService from 'turndown'
import { asBlob } from 'html-docx-js-typescript'
import { saveAs } from 'file-saver'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const showToast = inject('showToast')

const markdown = ref('# Hello World\n\nStarting typing or upload a file...')
const status = ref('準備就緒')
const statusClass = ref('')

const htmlContent = computed(() => {
  return marked(markdown.value)
})

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  status.value = '讀取中...'
  
  try {
    if (file.name.endsWith('.docx')) {
      await convertDocxToMarkdown(file)
    } else if (file.name.endsWith('.pdf')) {
      await convertPdfToMarkdown(file)
    } else if (file.name.endsWith('.md')) {
      const text = await file.text()
      markdown.value = text
      showToast('success', 'Markdown 載入完成')
      status.value = '讀取完成'
      statusClass.value = 'success'
    } else {
      showToast('error', '不支援的檔案格式')
    }
    event.target.value = ''
  } catch (error) {
    console.error(error)
    showToast('error', '檔案轉換失敗: ' + error.message)
    status.value = '轉換失敗'
    statusClass.value = 'error'
  }
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    markdown.value = text
    showToast('success', '已貼上剪貼簿內容')
  } catch (e) {
    showToast('error', '無法讀取剪貼簿')
  }
}

const convertDocxToMarkdown = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  const turndownService = new TurndownService()
  markdown.value = turndownService.turndown(result.value)
  showToast('success', 'Docx 轉換完成')
  status.value = '轉換完成'
  statusClass.value = 'success'
}

const convertPdfToMarkdown = async (file) => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
  let text = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const strings = content.items.map(item => item.str)
    text += strings.join(' ') + '\n\n'
  }
  
  markdown.value = text
  showToast('success', 'PDF 轉換完成 (純文字)')
  status.value = '轉換完成'
  statusClass.value = 'success'
}

const getFormattedTime = () => {
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

const downloadPdf = () => {
    // Determine if we should warn about "Background Graphics"
    // Usually browser print default is fine, but good to know.
    showToast('info', '請在列印視窗中選擇「另存為 PDF」')
    setTimeout(() => {
        window.print()
    }, 500)
}

const downloadDocx = async () => {
  try {
    const htmlString = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Document</title>
        <style>
          body { font-family: 'Microsoft JhengHei', 'SimSun', 'Arial', sans-serif; font-size: 11pt; }
          h1 { font-size: 24pt; color: #333; }
          h2 { font-size: 18pt; color: #333; }
          h3 { font-size: 14pt; color: #333; }
          p { margin-bottom: 1em; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
          td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
          pre { background-color: #f5f5f5; padding: 10px; white-space: pre-wrap; font-family: 'Courier New', monospace; }
        </style>
      </head>
      <body>
        ${htmlContent.value}
      </body>
      </html>
    `
    // Ensure blob is created with correct type and utf-8 with BOM
    const blob = await asBlob('\ufeff' + htmlString)
    const timestamp = getFormattedTime()
    saveAs(blob, `markdown_${timestamp}.docx`)
    showToast('success', 'Docx 下載開始')
  } catch (err) {
    showToast('error', 'Docx 產生失敗')
    console.error(err)
  }
}

const clearContent = () => {
  markdown.value = ''
  status.value = '已清除'
}
</script>

<style scoped>
.split-view {
  display: flex;
  gap: var(--space-md);
  height: calc(100vh - 250px);
  min-height: 400px;
}

.editor-pane, .preview-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  overflow: hidden;
}

.editor {
  flex: 1;
  width: 100%;
  padding: var(--space-md);
  background: transparent;
  border: none;
  resize: none;
  font-family: 'Consolas', monospace;
  font-size: 0.9rem;
  color: var(--text-primary);
  outline: none;
}

.preview-content {
  flex: 1;
  padding: var(--space-md);
  overflow-y: auto;
  background: white;
  color: #24292e;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  line-height: 1.6;
}

/* Enhanced Preview Styles */
.preview-content :deep(h1) { font-size: 2em; margin-bottom: 0.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
.preview-content :deep(h2) { font-size: 1.5em; margin-bottom: 0.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
.preview-content :deep(h3) { font-size: 1.25em; margin-bottom: 0.5em; }
.preview-content :deep(p) { margin-bottom: 1em; }
.preview-content :deep(ul), .preview-content :deep(ol) { margin-left: 2em; margin-bottom: 1em; }
.preview-content :deep(code) { background: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace; font-size: 85%; }
.preview-content :deep(pre) { background: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; margin-bottom: 1em; }
.preview-content :deep(pre code) { background: transparent; padding: 0; font-size: 100%; }
.preview-content :deep(blockquote) { border-left: 0.25em solid #dfe2e5; color: #6a737d; padding: 0 1em; margin: 0 0 1em 0; }
.preview-content :deep(table) { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
.preview-content :deep(th), .preview-content :deep(td) { border: 1px solid #dfe2e5; padding: 6px 13px; }
.preview-content :deep(th) { background-color: #fafbfc; font-weight: 600; }
.preview-content :deep(tr:nth-child(2n)) { background-color: #f6f8fa; }
.preview-content :deep(img) { max-width: 100%; box-sizing: content-box; background-color: #fff; }

@media (max-width: 768px) {
  .split-view {
    flex-direction: column;
    height: auto;
  }
  .editor-pane, .preview-pane {
    height: 300px;
  }
}
</style>

<!-- Global styles for export content that might be rendered outside of scoped styles -->
<style>
.export-content {
  font-family: 'Noto Sans CJK TC', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
  padding: 20px;
  color: black;
  background: white;
  line-height: 1.5;
}
.export-content h1, .export-content h2, .export-content h3 {
  page-break-after: avoid;
}
.export-content p, .export-content li {
  page-break-inside: avoid;
}
.export-content table {
  page-break-inside: avoid; /* Better table handling for print */
  width: 100%;
  border-collapse: collapse;
}
.export-content tr {
  page-break-inside: avoid;
  page-break-after: auto;
}
.export-content td, .export-content th {
  overflow: visible;
  word-wrap: break-word;
}
.export-content img {
  max-width: 100%;
}

@media print {
  /* Hide Global UI */
  :root {
    --sidebar-width: 0px !important; 
  }
  
  /* Hide specific UI elements */
  .section-header, 
  .section-footer,
  .editor-pane,
  .sidebar, 
  aside,
  header,
  nav,
  .toast, /* Common toast class */
  .toast-container,
  [class*="toast"], /* Aggressive toast hiding */
  .layout-sidebar 
  {
    display: none !important;
  }

  /* Reset Containers */
  body, #app, .main-layout, .content-area, .tool-section, .editor-wrapper, .split-view {
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: white !important;
    display: block !important; 
    border: none !important; /* Remove borders from containers */
  }

  /* Content Visibility */
  .preview-pane {
    display: block !important;
    border: none !important; /* Key fix for grid lines */
    box-shadow: none !important;
    height: auto !important;
    overflow: visible !important;
    width: 100% !important;
    margin: 0 !important;
  }

  .preview-content {
    overflow: visible !important;
    padding: 0 !important;
    height: auto !important;
    border: none !important; /* Key fix */
  }

  /* Page Setup */
  @page {
    size: A4;
    margin: 15mm; /* Reduce margin to obscure headers/footers if possible, but keep some for content */
  }
}
</style>
