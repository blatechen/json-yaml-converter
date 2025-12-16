<template>
  <section class="tool-section pojo-section">
    <div class="section-header">
      <div class="section-title">
        <span class="section-icon" style="color: var(--accent-purple);">☕</span>
        <h2>JSON 轉 Java POJO</h2>
      </div>
      <div class="section-actions">
        <label class="btn">
          <input type="file" accept=".json" hidden @change="handleFileUpload">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          上傳 JSON
        </label>
        <button class="btn" @click="pasteFromClipboard" title="貼上">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          貼上
        </button>
        <button class="btn primary" @click="convertToPojo">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          轉換
        </button>
        <button class="btn" @click="clearAll" title="清除">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="converter-layout">
      <!-- Input Panel -->
      <div class="input-panel">
        <div class="panel-header">
          <span class="format-badge json">JSON</span>
          <div class="options-row">
            <div class="class-name-input">
              <label>Class:</label>
              <input type="text" v-model="className" placeholder="MyClass" />
            </div>
            <div class="style-select">
              <label>Style:</label>
              <select v-model="codeStyle">
                <option value="traditional">Getter/Setter</option>
                <option value="lombok">Lombok</option>
                <option value="lombok-builder">Lombok + Builder</option>
              </select>
            </div>
          </div>
        </div>
        <div class="editor-wrapper">
          <div class="editor-container">
            <textarea 
              v-model="jsonInput"
              class="editor" 
              placeholder='輸入 JSON 資料，例如：
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "active": true,
  "score": 95.5
}'
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Output Panel -->
      <div class="output-panel">
        <div class="panel-header">
          <span class="format-badge java">Java POJO</span>
          <div class="panel-actions">
            <button class="icon-btn" @click="copyOutput" title="複製">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
        <div class="editor-wrapper">
          <div class="editor-container">
            <pre class="editor output-code">{{ pojoOutput || '// Java POJO 將會顯示在這裡' }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div class="section-footer">
      <span class="status" :class="statusClass">{{ status }}</span>
    </div>
  </section>
</template>

<script setup>
import { ref, inject } from 'vue'

const showToast = inject('showToast')

const jsonInput = ref('')
const pojoOutput = ref('')
const className = ref('MyClass')
const codeStyle = ref('traditional')
const status = ref('準備就緒')
const statusClass = ref('')

const convertToPojo = () => {
  if (!jsonInput.value.trim()) {
    showToast('error', '請輸入 JSON 內容')
    return
  }

  try {
    // Normalize JSON (handle trailing commas and unquoted keys)
    let normalizedJson = jsonInput.value
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
      .replace(/,(\s*[}\]])/g, '$1')
    
    const json = JSON.parse(normalizedJson)
    const classes = []
    
    generatePojo(json, className.value || 'MyClass', classes)
    
    pojoOutput.value = classes.join('\n\n')
    status.value = '轉換成功'
    statusClass.value = 'success'
    showToast('success', 'POJO 生成完成')
  } catch (e) {
    status.value = '轉換失敗：' + e.message
    statusClass.value = 'error'
    showToast('error', 'JSON 格式錯誤')
  }
}

const generatePojo = (obj, name, classes) => {
  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
      generatePojo(obj[0], name, classes)
    }
    return
  }

  const fields = []
  const nestedClasses = []
  
  for (const [key, value] of Object.entries(obj)) {
    const fieldName = toCamelCase(key)
    const capitalizedKey = capitalize(key)
    let javaType = getJavaType(value, capitalizedKey, nestedClasses, classes)
    
    fields.push({
      name: fieldName,
      originalName: key,
      type: javaType
    })
  }

  // Generate class based on style
  let classCode = ''
  
  if (codeStyle.value === 'lombok') {
    classCode = generateLombokClass(name, fields)
  } else if (codeStyle.value === 'lombok-builder') {
    classCode = generateLombokBuilderClass(name, fields)
  } else {
    classCode = generateTraditionalClass(name, fields)
  }
  
  classes.push(classCode)
  
  // Add nested classes
  for (const nested of nestedClasses) {
    generatePojo(nested.obj, nested.name, classes)
  }
}

const generateTraditionalClass = (name, fields) => {
  let code = `public class ${name} {\n`
  
  // Fields
  for (const field of fields) {
    if (field.name !== field.originalName) {
      code += `    @JsonProperty("${field.originalName}")\n`
    }
    code += `    private ${field.type} ${field.name};\n`
  }
  
  code += '\n    // Constructors\n'
  code += `    public ${name}() {}\n`
  
  // Getters and Setters
  code += '\n    // Getters and Setters\n'
  for (const field of fields) {
    const capitalizedName = capitalize(field.name)
    // Getter
    code += `    public ${field.type} get${capitalizedName}() {\n`
    code += `        return ${field.name};\n`
    code += `    }\n\n`
    // Setter
    code += `    public void set${capitalizedName}(${field.type} ${field.name}) {\n`
    code += `        this.${field.name} = ${field.name};\n`
    code += `    }\n\n`
  }
  
  code += '}'
  return code
}

const generateLombokClass = (name, fields) => {
  let code = `import lombok.Data;\n`
  code += `import lombok.NoArgsConstructor;\n`
  code += `import lombok.AllArgsConstructor;\n\n`
  code += `@Data\n`
  code += `@NoArgsConstructor\n`
  code += `@AllArgsConstructor\n`
  code += `public class ${name} {\n`
  
  // Fields only
  for (const field of fields) {
    if (field.name !== field.originalName) {
      code += `    @JsonProperty("${field.originalName}")\n`
    }
    code += `    private ${field.type} ${field.name};\n`
  }
  
  code += '}'
  return code
}

const generateLombokBuilderClass = (name, fields) => {
  let code = `import lombok.Data;\n`
  code += `import lombok.Builder;\n`
  code += `import lombok.NoArgsConstructor;\n`
  code += `import lombok.AllArgsConstructor;\n\n`
  code += `@Data\n`
  code += `@Builder\n`
  code += `@NoArgsConstructor\n`
  code += `@AllArgsConstructor\n`
  code += `public class ${name} {\n`
  
  // Fields only
  for (const field of fields) {
    if (field.name !== field.originalName) {
      code += `    @JsonProperty("${field.originalName}")\n`
    }
    code += `    private ${field.type} ${field.name};\n`
  }
  
  code += '}'
  return code
}

const getJavaType = (value, suggestedName, nestedClasses, allClasses) => {
  if (value === null) return 'Object'
  
  const type = typeof value
  
  switch (type) {
    case 'string':
      return 'String'
    case 'number':
      return Number.isInteger(value) ? 'Integer' : 'Double'
    case 'boolean':
      return 'Boolean'
    case 'object':
      if (Array.isArray(value)) {
        if (value.length === 0) return 'List<Object>'
        const itemType = getJavaType(value[0], suggestedName, nestedClasses, allClasses)
        if (typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])) {
          nestedClasses.push({ obj: value[0], name: suggestedName })
        }
        return `List<${itemType}>`
      } else {
        nestedClasses.push({ obj: value, name: suggestedName })
        return suggestedName
      }
    default:
      return 'Object'
  }
}

const toCamelCase = (str) => {
  return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase())
}

const capitalize = (str) => {
  const camel = toCamelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

const handleFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    jsonInput.value = event.target.result
    showToast('success', `已載入 ${file.name}`)
  }
  reader.readAsText(file)
  e.target.value = ''
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    jsonInput.value = text
    showToast('success', '已貼上剪貼簿內容')
  } catch (e) {
    showToast('error', '無法讀取剪貼簿')
  }
}

const copyOutput = async () => {
  if (!pojoOutput.value) {
    showToast('error', '沒有內容可複製')
    return
  }

  try {
    await navigator.clipboard.writeText(pojoOutput.value)
    showToast('success', '已複製到剪貼簿')
  } catch (e) {
    showToast('error', '複製失敗')
  }
}

const clearAll = () => {
  jsonInput.value = ''
  pojoOutput.value = ''
  status.value = '準備就緒'
  statusClass.value = ''
  showToast('success', '已清除')
}
</script>

<style scoped>
.pojo-section {
  border-color: rgba(163, 113, 247, 0.3);
}

.converter-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border-primary);
}

.input-panel,
.output-panel {
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-primary);
  gap: var(--space-md);
  flex-wrap: wrap;
}

.format-badge {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
}

.format-badge.json {
  background: rgba(210, 153, 34, 0.2);
  color: var(--accent-yellow);
}

.format-badge.java {
  background: rgba(163, 113, 247, 0.2);
  color: var(--accent-purple);
}

.options-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.class-name-input,
.style-select {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.class-name-input input,
.style-select select {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.class-name-input input {
  width: 100px;
}

.style-select select {
  cursor: pointer;
}

.class-name-input input:focus,
.style-select select:focus {
  outline: none;
  border-color: var(--accent-blue);
}

.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor {
  flex: 1;
  padding: var(--space-md);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: none;
  resize: none;
  outline: none;
  overflow: auto;
  tab-size: 2;
  white-space: pre;
}

.editor::placeholder {
  color: var(--text-muted);
}

.output-code {
  margin: 0;
  color: var(--text-secondary);
}

@media (max-width: 900px) {
  .converter-layout {
    grid-template-columns: 1fr;
  }
}
</style>
