<template>
  <section class="tool-section cron-converter-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-purple);">⏰</span>
        <h2>Cron 表達式轉換器</h2>
      </div>
      <div class="section-actions">
        <button class="btn" @click="clearContent" title="清除">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>

    <div class="converter-layout">
      <!-- Type Selector -->
      <div class="type-selector">
        <label class="type-option" :class="{ active: cronType === 'java' }">
          <input type="radio" v-model="cronType" value="java" @change="handleTypeChange" />
          <span class="type-icon">☕</span>
          <span class="type-label">Java Cron (6 欄位)</span>
          <span class="type-desc">@Scheduled / Spring Batch / XXL-Job</span>
        </label>
        <label class="type-option" :class="{ active: cronType === 'linux' }">
          <input type="radio" v-model="cronType" value="linux" @change="handleTypeChange" />
          <span class="type-icon">🐧</span>
          <span class="type-label">Linux Cron (5 欄位)</span>
          <span class="type-desc">crontab / systemd timer</span>
        </label>
      </div>

      <!-- Quick Templates -->
      <div class="templates-section">
        <label class="section-label">🎯 常用範本</label>
        <div class="template-buttons">
          <button 
            v-for="tpl in currentTemplates" 
            :key="tpl.label"
            class="template-btn"
            @click="applyTemplate(tpl)"
          >
            {{ tpl.label }}
          </button>
        </div>
      </div>

      <!-- Visual Builder -->
      <div class="builder-section">
        <label class="section-label">🔧 視覺化建構器</label>
        <div class="builder-grid">
          <div v-if="cronType === 'java'" class="field-group">
            <label>秒</label>
            <select v-model="fields.second" @change="buildExpression">
              <option value="*">每秒 (*)</option>
              <option value="0">0</option>
              <option v-for="n in 59" :key="n" :value="String(n)">{{ n }}</option>
              <option value="*/5">每 5 秒</option>
              <option value="*/10">每 10 秒</option>
              <option value="*/15">每 15 秒</option>
              <option value="*/30">每 30 秒</option>
            </select>
          </div>
          <div class="field-group">
            <label>分鐘</label>
            <select v-model="fields.minute" @change="buildExpression">
              <option value="*">每分鐘 (*)</option>
              <option value="0">0</option>
              <option v-for="n in 59" :key="n" :value="String(n)">{{ n }}</option>
              <option value="*/5">每 5 分鐘</option>
              <option value="*/10">每 10 分鐘</option>
              <option value="*/15">每 15 分鐘</option>
              <option value="*/30">每 30 分鐘</option>
            </select>
          </div>
          <div class="field-group">
            <label>小時</label>
            <select v-model="fields.hour" @change="buildExpression">
              <option value="*">每小時 (*)</option>
              <option v-for="n in 24" :key="n-1" :value="String(n-1)">{{ n - 1 }}:00</option>
              <option value="*/2">每 2 小時</option>
              <option value="*/4">每 4 小時</option>
              <option value="*/6">每 6 小時</option>
              <option value="9-17">工作時間 (9-17)</option>
            </select>
          </div>
          <div class="field-group">
            <label>日期</label>
            <select v-model="fields.dayOfMonth" @change="buildExpression">
              <option value="*">每天 (*)</option>
              <option value="?">不指定 (?)</option>
              <option v-for="n in 31" :key="n" :value="String(n)">{{ n }} 號</option>
              <option value="1,15">1 和 15 號</option>
              <option value="L">最後一天 (L)</option>
              <option value="LW">最後工作日 (LW)</option>
            </select>
          </div>
          <div class="field-group">
            <label>月份</label>
            <select v-model="fields.month" @change="buildExpression">
              <option value="*">每月 (*)</option>
              <option v-for="(name, idx) in months" :key="idx" :value="String(idx + 1)">{{ name }}</option>
              <option value="1-6">上半年 (1-6)</option>
              <option value="7-12">下半年 (7-12)</option>
            </select>
          </div>
          <div class="field-group">
            <label>星期</label>
            <select v-model="fields.dayOfWeek" @change="buildExpression">
              <option value="*">每天 (*)</option>
              <option value="?">不指定 (?)</option>
              <option value="MON-FRI">週一至週五</option>
              <option value="SAT,SUN">週六日</option>
              <option v-for="(name, idx) in weekdays" :key="idx" :value="weekdayValues[idx]">{{ name }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Expression Input -->
      <div class="expression-section">
        <label class="section-label">📝 Cron 表達式</label>
        <div class="expression-input-wrapper">
          <input 
            v-model="cronExpression"
            type="text"
            class="form-control expression-input"
            :placeholder="cronType === 'java' ? '秒 分 時 日 月 週 (例: 0 0 2 * * ?)' : '分 時 日 月 週 (例: 0 2 * * *)'"
            @input="parseExpression"
          />
          <button class="convert-btn" @click="toggleConvert">
            🔄 轉換
          </button>
        </div>
        <span v-if="errorMsg" class="error-msg">{{ errorMsg }}</span>
      </div>

      <!-- Human Readable -->
      <div v-if="humanReadable" class="readable-section">
        <label class="section-label">📖 人類可讀解釋</label>
        <div class="readable-text">{{ humanReadable }}</div>
      </div>

      <!-- Next Trigger Times -->
      <div v-if="nextTriggers.length > 0" class="triggers-section">
        <label class="section-label">🕐 接下來 {{ triggerCount }} 次觸發時間</label>
        <div class="trigger-controls">
          <button 
            v-for="count in [5, 10, 20]" 
            :key="count"
            class="trigger-count-btn"
            :class="{ active: triggerCount === count }"
            @click="setTriggerCount(count)"
          >
            {{ count }} 次
          </button>
        </div>
        <ul class="trigger-list">
          <li v-for="(trigger, idx) in nextTriggers" :key="idx" class="trigger-item">
            <span class="trigger-index">{{ idx + 1 }}.</span>
            <span class="trigger-datetime">{{ trigger.datetime }}</span>
            <span class="trigger-weekday">({{ trigger.weekday }})</span>
            <span class="trigger-relative">{{ trigger.relative }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="section-footer">
      <span class="status" :class="statusClass">{{ status }}</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from 'vue'
import { CronExpressionParser } from 'cron-parser'
import cronstrue from 'cronstrue/i18n'

const showToast = inject('showToast')

// State
const cronType = ref('java')
const cronExpression = ref('')
const errorMsg = ref('')
const status = ref('準備就緒')
const statusClass = ref('')
const nextTriggers = ref([])
const triggerCount = ref(10)
const humanReadable = ref('')

// Field values for visual builder
const fields = ref({
  second: '0',
  minute: '0',
  hour: '2',
  dayOfMonth: '*',
  month: '*',
  dayOfWeek: '?'
})

const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
const weekdayValues = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Templates
const javaTemplates = [
  { label: '每分鐘', value: '0 * * * * ?' },
  { label: '每小時', value: '0 0 * * * ?' },
  { label: '每天凌晨', value: '0 0 0 * * ?' },
  { label: '每天凌晨 2 點', value: '0 0 2 * * ?' },
  { label: '工作日 9 點', value: '0 0 9 ? * MON-FRI' },
  { label: '每週一', value: '0 0 0 ? * MON' },
  { label: '每月 1 號', value: '0 0 0 1 * ?' },
  { label: '每 30 分鐘', value: '0 */30 * * * ?' },
  { label: '每 10 秒', value: '*/10 * * * * ?' },
  { label: '每 5 分鐘', value: '0 */5 * * * ?' }
]

const linuxTemplates = [
  { label: '每分鐘', value: '* * * * *' },
  { label: '每小時', value: '0 * * * *' },
  { label: '每天凌晨', value: '0 0 * * *' },
  { label: '每天凌晨 2 點', value: '0 2 * * *' },
  { label: '工作日 9 點', value: '0 9 * * 1-5' },
  { label: '每週一', value: '0 0 * * 1' },
  { label: '每月 1 號', value: '0 0 1 * *' },
  { label: '每 30 分鐘', value: '*/30 * * * *' },
  { label: '每 5 分鐘', value: '*/5 * * * *' },
  { label: '每小時第 15 分', value: '15 * * * *' }
]

const currentTemplates = computed(() => cronType.value === 'java' ? javaTemplates : linuxTemplates)

// Methods
const handleTypeChange = () => {
  // Don't clear content, just update the mode and re-parse
  if (cronExpression.value.trim()) {
    parseExpression()
  }
  status.value = cronType.value === 'java' ? '已切換至 Java Cron 模式' : '已切換至 Linux Cron 模式'
}

const applyTemplate = (tpl) => {
  cronExpression.value = tpl.value
  parseExpression()
  showToast('success', `已套用: ${tpl.label}`)
}

const buildExpression = () => {
  if (cronType.value === 'java') {
    cronExpression.value = `${fields.value.second} ${fields.value.minute} ${fields.value.hour} ${fields.value.dayOfMonth} ${fields.value.month} ${fields.value.dayOfWeek}`
  } else {
    cronExpression.value = `${fields.value.minute} ${fields.value.hour} ${fields.value.dayOfMonth} ${fields.value.month} ${fields.value.dayOfWeek}`
  }
  parseExpression()
}

const parseExpression = () => {
  errorMsg.value = ''
  nextTriggers.value = []
  humanReadable.value = ''

  if (!cronExpression.value.trim()) {
    status.value = '等待輸入'
    return
  }

  try {
    // Convert to standard format for parsing
    let parseExpr = cronExpression.value.trim()
    
    // For Java cron (6 fields), remove seconds for cron-parser (it expects 5-6 fields differently)
    // cron-parser supports 5-field (standard) and 6-field (with seconds)
    const parts = parseExpr.split(/\s+/)
    
    if (cronType.value === 'java' && parts.length === 6) {
      // Java format: seconds minutes hours dayOfMonth month dayOfWeek
      // cron-parser format: seconds? minutes hours dayOfMonth month dayOfWeek
      // Replace ? with * for cron-parser
      parseExpr = parseExpr.replace(/\?/g, '*')
    } else if (cronType.value === 'linux' && parts.length === 5) {
      // Linux format: minutes hours dayOfMonth month dayOfWeek
      // Add seconds (0) for parsing
      parseExpr = '0 ' + parseExpr
    }

    // Validate and parse
    const interval = CronExpressionParser.parse(parseExpr, {
      currentDate: new Date()
    })

    // Generate next trigger times
    const triggers = []
    for (let i = 0; i < triggerCount.value; i++) {
      try {
        const date = interval.next()
        triggers.push({
          datetime: formatDateTime(date),
          weekday: weekdays[date.getDay()],
          relative: getRelativeTime(date)
        })
      } catch (e) {
        break
      }
    }
    nextTriggers.value = triggers

    // Generate human readable text
    try {
      // cronstrue needs 5-field format for standard cron
      let readableExpr = cronExpression.value.trim()
      if (cronType.value === 'java') {
        // For 6-field Java cron, cronstrue can handle it
        readableExpr = readableExpr.replace(/\?/g, '*')
      }
      humanReadable.value = cronstrue.toString(readableExpr, { locale: 'zh_TW' })
    } catch (e) {
      // Fallback to English
      try {
        let readableExpr = cronExpression.value.trim().replace(/\?/g, '*')
        humanReadable.value = cronstrue.toString(readableExpr)
      } catch (e2) {
        humanReadable.value = ''
      }
    }

    // Update field values from expression
    syncFieldsFromExpression()

    status.value = '解析成功'
    statusClass.value = 'success'
  } catch (err) {
    errorMsg.value = `無效的 Cron 表達式: ${err.message}`
    status.value = '解析錯誤'
    statusClass.value = 'error'
  }
}

const syncFieldsFromExpression = () => {
  const parts = cronExpression.value.trim().split(/\s+/)
  if (cronType.value === 'java' && parts.length === 6) {
    fields.value = {
      second: parts[0],
      minute: parts[1],
      hour: parts[2],
      dayOfMonth: parts[3],
      month: parts[4],
      dayOfWeek: parts[5]
    }
  } else if (cronType.value === 'linux' && parts.length === 5) {
    fields.value = {
      second: '0',
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4]
    }
  }
}

const toggleConvert = () => {
  if (!cronExpression.value.trim()) return

  const parts = cronExpression.value.trim().split(/\s+/)
  
  // Convert TO the selected mode
  if (cronType.value === 'java') {
    // User selected Java mode - convert to 6 fields if needed
    if (parts.length === 5) {
      cronExpression.value = '0 ' + parts.join(' ')
      showToast('success', '已轉換為 Java 格式 (6 欄位)')
      parseExpression()
    } else if (parts.length === 6) {
      showToast('info', '已經是 Java 格式 (6 欄位)')
    } else {
      showToast('error', '無效的 Cron 表達式欄位數')
    }
  } else if (cronType.value === 'linux') {
    // User selected Linux mode - convert to 5 fields if needed
    if (parts.length === 6) {
      cronExpression.value = parts.slice(1).join(' ').replace(/\?/g, '*')
      showToast('success', '已轉換為 Linux 格式 (5 欄位)')
      parseExpression()
    } else if (parts.length === 5) {
      showToast('info', '已經是 Linux 格式 (5 欄位)')
    } else {
      showToast('error', '無效的 Cron 表達式欄位數')
    }
  }
}

const formatDateTime = (date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

const getRelativeTime = (date) => {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days} 天 ${hours} 小時後`
  } else if (hours > 0) {
    return `${hours} 小時 ${minutes} 分鐘後`
  } else {
    return `${minutes} 分鐘後`
  }
}

const setTriggerCount = (count) => {
  triggerCount.value = count
  parseExpression()
}

const clearContent = () => {
  cronExpression.value = ''
  errorMsg.value = ''
  nextTriggers.value = []
  humanReadable.value = ''
  fields.value = {
    second: '0',
    minute: '0',
    hour: '2',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '?'
  }
  status.value = '已清除'
  statusClass.value = ''
}

onMounted(() => {
  // Set default expression
  cronExpression.value = '0 0 2 * * ?'
  parseExpression()
})
</script>

<style scoped>
.converter-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.section-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

/* Type Selector */
.type-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md);
  background: var(--bg-tertiary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.type-option:hover {
  border-color: var(--accent-blue);
}

.type-option.active {
  border-color: var(--accent-blue);
  background: rgba(88, 166, 255, 0.1);
}

.type-option input {
  display: none;
}

.type-icon {
  font-size: 2rem;
}

.type-label {
  font-weight: 600;
  color: var(--text-primary);
}

.type-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Templates */
.template-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.template-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}

.template-btn:hover {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
  color: white;
}

/* Builder */
.builder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-md);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.field-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.field-group select {
  padding: var(--space-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
}

.field-group select:focus {
  outline: none;
  border-color: var(--accent-blue);
}

/* Expression Input */
.expression-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.expression-input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
}

.expression-input:focus {
  outline: none;
  border-color: var(--accent-blue);
}

.convert-btn {
  width: 100px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: var(--accent-purple);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.convert-btn:hover {
  filter: brightness(1.1);
}

.error-msg {
  color: var(--error);
  font-size: 0.85rem;
  margin-top: var(--space-xs);
}

/* Human Readable */
.readable-section {
  padding: var(--space-md);
  background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(163, 113, 247, 0.1));
  border-radius: var(--radius-md);
  border: 1px solid var(--border-primary);
}

.readable-text {
  font-size: 1.1rem;
  color: var(--accent-blue);
  font-weight: 500;
}

/* Trigger Times */
.triggers-section {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.trigger-controls {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
}

.trigger-count-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.trigger-count-btn.active {
  background: var(--accent-blue);
  border-color: var(--accent-blue);
  color: white;
}

.trigger-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  max-height: 300px;
  overflow-y: auto;
}

.trigger-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.trigger-index {
  color: var(--text-muted);
  min-width: 24px;
}

.trigger-datetime {
  font-family: 'Consolas', monospace;
  color: var(--text-primary);
  font-weight: 500;
}

.trigger-weekday {
  color: var(--accent-green);
  font-size: 0.85rem;
}

.trigger-relative {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .type-selector {
    grid-template-columns: 1fr;
  }
  
  .builder-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .expression-input-wrapper {
    flex-direction: column;
  }
  
  .trigger-item {
    flex-wrap: wrap;
  }
}
</style>
