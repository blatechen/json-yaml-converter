<template>
  <section class="tool-section learning-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-green);">🎓</span>
        <h2>Markdown 學習中心</h2>
      </div>
    </div>

    <div class="learning-container">
      <div class="info-card">
        <h3>Markdown 語法教學 (25 種基本與進階元素)</h3>
        <p>本頁面提供完整的本地化說明與即時預覽，無需跳轉外部網站。點擊元素可查看詳細用法。</p>
      </div>

      <div class="category-tabs">
        <button 
          v-for="cat in categories" 
          :key="cat.id"
          :class="['tab-btn', { active: activeCategory === cat.id }]"
          @click="activeCategory = cat.id"
        >
          {{ cat.label }} ({{ getCategoryCount(cat.id) }})
        </button>
      </div>

      <div class="syntax-list">
        <div v-for="item in filteredItems" :key="item.id" class="syntax-item">
          <div class="item-header" @click="toggleItem(item.id)">
            <div class="item-title-group">
              <span class="item-icon">{{ getIcon(item.id) }}</span>
              <span class="item-name">{{ item.name }}</span>
            </div>
            <span class="toggle-arrow" :class="{ rotated: expandedItems.includes(item.id) }">▼</span>
          </div>
          
          <Transition name="expand">
            <div v-if="expandedItems.includes(item.id)" class="item-body">
              <div class="item-content">
                <div class="description">
                  <strong>描述：</strong> {{ item.description }}
                </div>
                
                <div class="example-grid">
                  <div class="example-box">
                    <label>Markdown 語法</label>
                    <pre><code>{{ item.syntax }}</code></pre>
                    <button class="copy-btn-sm" @click="copyText(item.syntax)">複製</button>
                  </div>
                  <div class="preview-box">
                    <label>即時效果預覽</label>
                    <div class="markdown-preview markdown-body" v-html="renderMarkdown(item.syntax)"></div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <div class="section-footer">
      <span class="status">目前顯示：{{ filteredItems.length }} 個元素</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { marked } from 'marked'

const showToast = inject('showToast')

const activeCategory = ref('common')
const expandedItems = ref([])

const categories = [
  { id: 'common', label: '常用' },
  { id: 'advanced', label: '進階' },
  { id: 'other', label: '其它' }
]

const syntaxData = [
  // 常用 (Common) - 12項
  { id: 'h1', cat: 'common', name: '標題 (Headings)', description: '使用 # 來建立標題，# 的數量代表標題層級。', syntax: '# 第一級標題\n## 第二級標題\n### 第三級標題' },
  { id: 'bold', cat: 'common', name: '粗體 (Bold)', description: '在文字前後加上兩個星號 ** 或底線 __。', syntax: '**這是粗體文字**' },
  { id: 'italic', cat: 'common', name: '斜體 (Italic)', description: '在文字前後加上一個星號 * 或底線 _。', syntax: '*這是斜體文字*' },
  { id: 'ul', cat: 'common', name: '無序列表 (Unordered List)', description: '使用 -、* 或 + 作為列表標記。', syntax: '- 項目一\n- 項目二\n  - 子項目' },
  { id: 'ol', cat: 'common', name: '有序列表 (Ordered List)', description: '使用數字加上點點。', syntax: '1. 第一步\n2. 第二步\n3. 第三步' },
  { id: 'link', cat: 'common', name: '超連結 (Link)', description: '語法為 [顯示名稱](網址)。', syntax: '[點我前往 Google](https://www.google.com)' },
  { id: 'image', cat: 'common', name: '圖片 (Image)', description: '語法為 ![替代文字](圖片網址)。', syntax: '![範例圖片](https://picsum.photos/200/100)' },
  { id: 'quote', cat: 'common', name: '引用 (Blockquote)', description: '在行首使用 > 符號。', syntax: '> 這是引用的文字內容。\n> 可以多行引用。' },
  { id: 'code_inline', cat: 'common', name: '行內程式碼 (Inline Code)', description: '使用反引號 ` 包裹。', syntax: '請輸入 `git commit` 指令。' },
  { id: 'hr', cat: 'common', name: '水平分割線 (Horizontal Rule)', description: '使用三個或以上的星號 ***、減號 --- 或底線 ___。', syntax: '---' },
  { id: 'p', cat: 'common', name: '段落 (Paragraph)', description: '使用一個或多個空行來分隔段落。', syntax: '這是第一個段落。\n\n這是第二個段落。' },
  { id: 'br', cat: 'common', name: '強制換行 (Line Break)', description: '在行尾加上兩個以上的空格，或使用 <br>。', syntax: '第一行  \n第二行' },

  // 進階 (Advanced) - 8項
  { id: 'table', cat: 'advanced', name: '表格 (Table)', description: '使用 | 分隔欄位，並用 - 分隔標題列與內容。', syntax: '| 標題一 | 標題二 |\n| :--- | :--- |\n| 內容一 | 內容二 |' },
  { id: 'code_block', cat: 'advanced', name: '程式碼區塊 (Code Block)', description: '使用三個反引號 ``` 包裹，可指定語言。', syntax: '```javascript\nconsole.log("Hello World");\n```' },
  { id: 'task', cat: 'advanced', name: '工作列表 (Task List)', description: '使用 [ ] 表示待辦，[x] 表示已完成。', syntax: '- [x] 已完成項目\n- [ ] 待辦項目' },
  { id: 'escape', cat: 'advanced', name: '反斜線符號 (Escaping)', description: '使用 \\ 來顯示 Markdown 的保留字元。', syntax: '\\*這不會變成斜體\\*' },
  { id: 'html', cat: 'advanced', name: 'HTML 標籤', description: 'Markdown 支援直接寫入 HTML。', syntax: '<span style="color:red">這是紅色的文字</span>' },
  { id: 'footnote', cat: 'advanced', name: '註腳 (Footnote)', description: '使用 [^1] 標記，並在底部定義內容。', syntax: '這是一個註腳標記[^1]\n\n[^1]: 這是註腳的詳細說明。' },
  { id: 'strikethrough', cat: 'advanced', name: '刪除線 (Strikethrough)', syntax: '~~刪除這些文字~~', description: '在文字前後加上兩個波浪號 ~~。' },
  { id: 'math', cat: 'advanced', name: '數學公式 (LaTeX)', description: '使用 $ 包裹，通常需要支援插件擴展（此處僅展示語法）。', syntax: '$E = mc^2$' },

  // 其它 (Other) - 5項
  { id: 'auto_link', cat: 'other', name: '自動連結 (Auto Link)', description: '直接寫網址或用 <> 包裹網址。', syntax: '<https://www.google.com>\n<contact@example.com>' },
  { id: 'emoji', cat: 'other', name: '表情符號 (Emoji)', description: '直接輸入 Emoji 或使用代碼 (如 :smile:)。', syntax: '我很開心 😄 :smile:' },
  { id: 'highlight', cat: 'other', name: '文字高亮 (Highlight)', description: '使用兩個等號 == 包裹。', syntax: '==這段文字被高亮了==' },
  { id: 'sub', cat: 'other', name: '下標 (Subscript)', description: '使用 ~ 包裹。', syntax: 'H~2~O' },
  { id: 'sup', cat: 'other', name: '上標 (Superscript)', description: '使用 ^ 包裹。', syntax: 'X^2^' }
]

const filteredItems = computed(() => {
  return syntaxData.filter(item => item.cat === activeCategory.value)
})

const getCategoryCount = (catId) => {
  return syntaxData.filter(item => item.cat === catId).length
}

const toggleItem = (itemId) => {
  const index = expandedItems.value.indexOf(itemId)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(itemId)
  }
}

const renderMarkdown = (text) => {
  return marked(text)
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast('success', '語法已複製')
  } catch (err) {
    showToast('error', '複製失敗')
  }
}

const getIcon = (id) => {
  const icons = {
    h1: 'H#', bold: 'B', italic: 'I', ul: '•', ol: '1.', link: '🔗', image: '🖼️', quote: '❝', code_inline: '`', hr: '—',
    table: '田', code_block: '{}', task: '☑', html: '<>', emoji: '☺', highlight: '🖍️'
  }
  return icons[id] || '📄'
}
</script>

<style scoped>
.learning-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  max-width: 1000px;
  margin: 0 auto;
}

.info-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-left: 4px solid var(--accent-green);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}

.category-tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
  border-bottom: 1px solid var(--border-primary);
  padding-bottom: var(--space-xs);
}

.tab-btn {
  padding: var(--space-sm) var(--space-lg);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.tab-btn.active {
  color: var(--accent-green);
  border-bottom-color: var(--accent-green);
}

.syntax-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.syntax-item {
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  overflow: hidden;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  cursor: pointer;
  transition: background 0.2s;
}

.item-header:hover {
  background: var(--bg-hover);
}

.item-title-group {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.item-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 6px;
  font-weight: 800;
  color: var(--accent-green);
  font-size: 0.8rem;
}

.item-name {
  font-weight: 600;
  color: var(--text-primary);
}

.toggle-arrow {
  font-size: 0.7rem;
  color: var(--text-muted);
  transition: transform 0.3s;
}

.toggle-arrow.rotated {
  transform: rotate(180deg);
}

.item-body {
  border-top: 1px solid var(--border-primary);
  background: var(--bg-tertiary);
}

.item-content {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.description {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.example-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.example-box, .preview-box {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  position: relative;
}

.example-box label, .preview-box label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

pre {
  margin: 0;
  padding: var(--space-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  font-family: 'Consolas', monospace;
  font-size: 0.9rem;
  color: var(--accent-orange);
  white-space: pre-wrap;
}

.markdown-preview {
  padding: var(--space-md);
  background: white;
  color: #24292e;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  min-height: 80px;
}

.copy-btn-sm {
  position: absolute;
  top: 24px;
  right: 8px;
  padding: 4px 8px;
  font-size: 0.7rem;
  background: var(--bg-hover);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
}

.copy-btn-sm:hover {
  background: var(--accent-blue);
  color: white;
  border-color: var(--accent-blue);
}

/* expand transition */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
}

@media (max-width: 768px) {
  .example-grid {
    grid-template-columns: 1fr;
  }
}
</style>
