/**
 * Format Tools - JSON Formatter & Properties ⟷ YAML Converter & Image Tools
 */
(function () {
    const jsyaml = window.jsyaml;
    const Tesseract = window.Tesseract;
    class FormatTools {
        constructor() {
            this.foldState = {};
            this.base64Images = [];
            this.ocrImages = [];
            this.ocrWorker = null;
            this.init();
        }

        init() {
            // JSON Section
            this.jsonInput = document.getElementById('json-input');
            this.jsonLineNumbers = document.getElementById('json-line-numbers');
            this.jsonFoldGutter = document.getElementById('json-fold-gutter');
            this.jsonError = document.getElementById('json-error');
            this.jsonErrorLine = document.getElementById('json-error-line');
            this.jsonErrorMessage = document.getElementById('json-error-message');
            this.jsonStatus = document.getElementById('json-status');
            this.jsonLineCount = document.getElementById('json-line-count');

            // Properties/YAML Section
            this.propsInput = document.getElementById('properties-input');
            this.propsLineNumbers = document.getElementById('properties-line-numbers');
            this.propsError = document.getElementById('properties-error');
            this.propsErrorLine = document.getElementById('properties-error-line');
            this.propsErrorMessage = document.getElementById('properties-error-message');
            this.propsStatus = document.getElementById('properties-status');
            this.propsLineCount = document.getElementById('properties-line-count');

            this.yamlInput = document.getElementById('yaml-input');
            this.yamlLineNumbers = document.getElementById('yaml-line-numbers');
            this.yamlError = document.getElementById('yaml-error');
            this.yamlErrorLine = document.getElementById('yaml-error-line');
            this.yamlErrorMessage = document.getElementById('yaml-error-message');
            this.yamlStatus = document.getElementById('yaml-status');
            this.yamlLineCount = document.getElementById('yaml-line-count');

            // Base64 Section
            this.base64DropZone = document.getElementById('base64-drop-zone');
            this.base64FileInput = document.getElementById('base64-file-input');
            this.base64PreviewList = document.getElementById('base64-preview-list');
            this.base64Status = document.getElementById('base64-status');
            this.base64Count = document.getElementById('base64-count');

            // OCR Section
            this.ocrDropZone = document.getElementById('ocr-drop-zone');
            this.ocrFileInput = document.getElementById('ocr-file-input');
            this.ocrLang = document.getElementById('ocr-lang');
            this.ocrPreviewList = document.getElementById('ocr-preview-list');
            this.ocrProgressContainer = document.getElementById('ocr-progress-container');
            this.ocrProgressBar = document.getElementById('ocr-progress-bar');
            this.ocrProgressText = document.getElementById('ocr-progress-text');
            this.ocrStatus = document.getElementById('ocr-status');
            this.ocrCount = document.getElementById('ocr-count');

            this.toast = document.getElementById('toast');
            this.bindEvents();
            this.updateAllLineNumbers();
        }


        bindEvents() {
            // JSON events
            this.jsonInput.addEventListener('input', () => this.onJsonInput());
            this.jsonInput.addEventListener('scroll', () => this.syncScroll('json'));
            document.getElementById('json-file-input').addEventListener('change', (e) => this.uploadFile(e, 'json'));
            document.getElementById('json-paste-btn').addEventListener('click', () => this.paste('json'));
            document.getElementById('json-format-btn').addEventListener('click', () => this.formatJson());
            document.getElementById('json-collapse-btn').addEventListener('click', () => this.toggleCollapseAll());
            document.getElementById('json-copy-btn').addEventListener('click', () => this.copy('json'));
            document.getElementById('json-clear-btn').addEventListener('click', () => this.clear('json'));

            // Properties events
            this.propsInput.addEventListener('input', () => this.updateLineNumbers('properties'));
            this.propsInput.addEventListener('scroll', () => this.syncScroll('properties'));

            // YAML events
            this.yamlInput.addEventListener('input', () => this.updateLineNumbers('yaml'));
            this.yamlInput.addEventListener('scroll', () => this.syncScroll('yaml'));

            // Convert buttons
            document.getElementById('props-to-yaml-btn').addEventListener('click', () => this.propsToYaml());
            document.getElementById('yaml-to-props-btn').addEventListener('click', () => this.yamlToProps());

            // Generic buttons
            document.querySelectorAll('.file-input').forEach(input => {
                input.addEventListener('change', (e) => this.uploadFile(e, e.target.dataset.target));
            });
            document.querySelectorAll('.paste-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.paste(e.currentTarget.dataset.target));
            });
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.copy(e.currentTarget.dataset.target));
            });
            document.querySelectorAll('.clear-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.clear(e.currentTarget.dataset.target));
            });

            // Base64 events
            this.base64FileInput.addEventListener('change', (e) => this.handleBase64Upload(e.target.files));
            this.setupDropZone(this.base64DropZone, (files) => this.handleBase64Upload(files));
            document.getElementById('base64-copy-all-btn').addEventListener('click', () => this.copyAllBase64());
            document.getElementById('base64-clear-btn').addEventListener('click', () => this.clearBase64());

            // OCR events
            this.ocrFileInput.addEventListener('change', (e) => this.handleOcrUpload(e.target.files));
            this.setupDropZone(this.ocrDropZone, (files) => this.handleOcrUpload(files));
            document.getElementById('ocr-copy-all-btn').addEventListener('click', () => this.copyAllOcr());
            document.getElementById('ocr-clear-btn').addEventListener('click', () => this.clearOcr());

            // Base64 Previews Delegation
            this.base64PreviewList.addEventListener('click', (e) => {
                const btn = e.target.closest('.icon-btn, .output-copy-btn');
                if (!btn || !btn.dataset.action) return;

                const item = btn.closest('.image-preview-item');
                if (!item) return;
                const index = parseInt(item.dataset.index);
                const action = btn.dataset.action;

                if (action === 'remove') this.removeBase64(index);
                if (action === 'copy-raw') this.copyBase64(index, 'raw');
                if (action === 'copy-dataurl') this.copyBase64(index, 'dataUrl');
            });

            // OCR Previews Delegation
            this.ocrPreviewList.addEventListener('click', (e) => {
                const btn = e.target.closest('.icon-btn');
                if (!btn || !btn.dataset.action) return;

                const item = btn.closest('.image-preview-item');
                if (!item) return;
                const index = parseInt(item.dataset.index);
                const action = btn.dataset.action;

                if (action === 'ocr-remove') this.removeOcr(index);
                if (action === 'ocr-copy') this.copyOcrText(index);
            });
        }

        // JSON Functions
        onJsonInput() {
            this.updateLineNumbers('json');
            this.updateFoldGutter();
            this.validateJson();
        }

        formatJson() {
            const content = this.jsonInput.value.trim();
            if (!content) { this.showToast('error', '請先輸入 JSON 內容'); return; }

            try {
                const parsed = JSON.parse(content);
                this.jsonInput.value = JSON.stringify(parsed, null, 2);
                this.hideError('json');
                this.jsonStatus.className = 'status success';
                this.jsonStatus.textContent = '格式化成功';
                this.onJsonInput();
                this.showToast('success', 'JSON 格式化完成');
            } catch (e) {
                this.showJsonError(e);
                this.showToast('error', 'JSON 格式錯誤');
            }
        }

        validateJson() {
            const content = this.jsonInput.value.trim();
            if (!content) { this.hideError('json'); this.jsonStatus.textContent = '準備就緒'; return; }

            try {
                JSON.parse(content);
                this.hideError('json');
                this.jsonStatus.className = 'status success';
                this.jsonStatus.textContent = '格式正確';
            } catch (e) {
                this.showJsonError(e);
            }
        }

        showJsonError(e) {
            const lineMatch = e.message.match(/position (\d+)/);
            let errorLine = '-';
            if (lineMatch) {
                const pos = parseInt(lineMatch[1]);
                const beforeError = this.jsonInput.value.substring(0, pos);
                errorLine = (beforeError.match(/\n/g) || []).length + 1;
            }
            this.jsonErrorLine.textContent = errorLine;
            this.jsonErrorMessage.textContent = e.message;
            this.jsonError.classList.add('show');
            this.jsonStatus.className = 'status error';
            this.jsonStatus.textContent = '格式錯誤';
            this.highlightErrorLine('json', errorLine);
        }

        highlightErrorLine(target, lineNum) {
            const lineNumbers = target === 'json' ? this.jsonLineNumbers :
                target === 'properties' ? this.propsLineNumbers : this.yamlLineNumbers;
            lineNumbers.querySelectorAll('span').forEach((span, i) => {
                span.classList.toggle('error-line', i + 1 === lineNum);
            });
        }

        updateFoldGutter() {
            const lines = this.jsonInput.value.split('\n');
            const foldable = new Set();
            for (let i = 0; i < lines.length; i++) {
                const t = lines[i].trimEnd();
                if (t.endsWith('{') || t.endsWith('[')) foldable.add(i);
            }
            let html = '';
            for (let i = 0; i < lines.length; i++) {
                if (foldable.has(i)) {
                    const collapsed = this.foldState[i] || false;
                    html += `<div class="fold-btn ${collapsed ? 'collapsed' : ''}" data-line="${i}"></div>`;
                } else {
                    html += `<div style="height:1.5em"></div>`;
                }
            }
            this.jsonFoldGutter.innerHTML = html;
            this.jsonFoldGutter.querySelectorAll('.fold-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.toggleFold(parseInt(e.target.dataset.line)));
            });
        }

        toggleFold(lineIndex) {
            this.foldState[lineIndex] = !this.foldState[lineIndex];
            const lines = this.jsonInput.value.split('\n');
            const endLine = this.findFoldEnd(lines, lineIndex);

            if (this.foldState[lineIndex]) {
                const content = lines.slice(lineIndex + 1, endLine + 1);
                this.foldState[`${lineIndex}_content`] = content;
                lines.splice(lineIndex + 1, content.length, `  /* ...${content.length} 行已折疊... */`);
            } else {
                const original = this.foldState[`${lineIndex}_content`];
                if (original) {
                    lines.splice(lineIndex + 1, 1, ...original);
                    delete this.foldState[`${lineIndex}_content`];
                }
            }
            this.jsonInput.value = lines.join('\n');
            this.onJsonInput();
        }

        findFoldEnd(lines, start) {
            const open = lines[start].includes('{') ? '{' : '[';
            const close = open === '{' ? '}' : ']';
            let depth = 1;
            for (let i = start + 1; i < lines.length; i++) {
                for (const c of lines[i]) {
                    if (c === open) depth++;
                    if (c === close) depth--;
                    if (depth === 0) return i;
                }
            }
            return lines.length - 1;
        }

        toggleCollapseAll() {
            const lines = this.jsonInput.value.split('\n');
            const foldable = [];
            for (let i = 0; i < lines.length; i++) {
                const t = lines[i].trimEnd();
                if (t.endsWith('{') || t.endsWith('[')) foldable.push(i);
            }
            const anyExpanded = foldable.some(i => !this.foldState[i]);
            if (anyExpanded) {
                foldable.reverse().forEach(i => { if (!this.foldState[i]) this.toggleFold(i); });
                this.showToast('success', '已全部折疊');
            } else {
                foldable.forEach(i => { if (this.foldState[i]) this.toggleFold(i); });
                this.showToast('success', '已全部展開');
            }
        }

        // Properties ⟷ YAML
        propsToYaml() {
            const content = this.propsInput.value.trim();
            if (!content) { this.showToast('error', '請先輸入 Properties'); return; }

            try {
                const obj = this.parseProperties(content);
                const yaml = jsyaml.dump(obj, { indent: 2, lineWidth: -1 });
                this.yamlInput.value = yaml;
                this.hideError('properties');
                this.hideError('yaml');
                this.propsStatus.className = 'status success';
                this.propsStatus.textContent = '格式正確';
                this.yamlStatus.className = 'status success';
                this.yamlStatus.textContent = '轉換成功';
                this.updateLineNumbers('yaml');
                this.showToast('success', 'Properties → YAML 成功');
            } catch (e) {
                this.propsErrorLine.textContent = e.line || '-';
                this.propsErrorMessage.textContent = e.message;
                this.propsError.classList.add('show');
                this.propsStatus.className = 'status error';
                this.propsStatus.textContent = '格式錯誤';
                if (e.line) this.highlightErrorLine('properties', e.line);
                this.showToast('error', 'Properties 格式錯誤');
            }
        }

        yamlToProps() {
            const content = this.yamlInput.value.trim();
            if (!content) { this.showToast('error', '請先輸入 YAML'); return; }

            try {
                const obj = jsyaml.load(content);
                const props = this.objectToProperties(obj);
                this.propsInput.value = props;
                this.hideError('yaml');
                this.hideError('properties');
                this.yamlStatus.className = 'status success';
                this.yamlStatus.textContent = '格式正確';
                this.propsStatus.className = 'status success';
                this.propsStatus.textContent = '轉換成功';
                this.updateLineNumbers('properties');
                this.showToast('success', 'YAML → Properties 成功');
            } catch (e) {
                const lineMatch = e.mark ? e.mark.line + 1 : '-';
                this.yamlErrorLine.textContent = lineMatch;
                this.yamlErrorMessage.textContent = e.message;
                this.yamlError.classList.add('show');
                this.yamlStatus.className = 'status error';
                this.yamlStatus.textContent = '格式錯誤';
                if (lineMatch !== '-') this.highlightErrorLine('yaml', lineMatch);
                this.showToast('error', 'YAML 格式錯誤');
            }
        }

        parseProperties(str) {
            const result = {};
            const lines = str.split('\n');
            lines.forEach((line, idx) => {
                line = line.trim();
                if (!line || line.startsWith('#')) return;
                const eqIdx = line.indexOf('=');
                if (eqIdx === -1) throw { message: '缺少 = 符號', line: idx + 1 };
                const key = line.substring(0, eqIdx).trim();
                const value = line.substring(eqIdx + 1).trim();
                this.setNestedValue(result, key, this.parseValue(value));
            });
            return result;
        }

        setNestedValue(obj, path, value) {
            const parts = path.split('.');
            let current = obj;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        }

        parseValue(v) {
            if (v === 'true') return true;
            if (v === 'false') return false;
            if (v === '') return '';
            if (!isNaN(v) && v !== '') return Number(v);
            // 處理跳脫序列：將 \\n 還原為換行符號
            return v.replace(/\\n/g, '\n');
        }

        objectToProperties(obj, prefix = '') {
            let result = [];
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    result.push(this.objectToProperties(value, fullKey));
                } else if (Array.isArray(value)) {
                    // 陣列轉換為逗號分隔的字串
                    result.push(`${fullKey}=${value.join(',')}`);
                } else {
                    // 處理多行字串：將換行轉換為 \\n 跳脫序列
                    let strValue = String(value);
                    strValue = strValue.replace(/\r?\n/g, '\\n');
                    result.push(`${fullKey}=${strValue}`);
                }
            }
            return result.join('\n');
        }

        // Utilities
        updateAllLineNumbers() {
            ['json', 'properties', 'yaml'].forEach(t => this.updateLineNumbers(t));
        }

        updateLineNumbers(target) {
            const input = target === 'json' ? this.jsonInput : target === 'properties' ? this.propsInput : this.yamlInput;
            const lineNumbers = target === 'json' ? this.jsonLineNumbers : target === 'properties' ? this.propsLineNumbers : this.yamlLineNumbers;
            const lineCount = target === 'json' ? this.jsonLineCount : target === 'properties' ? this.propsLineCount : this.yamlLineCount;

            const count = input.value.split('\n').length;
            let html = '';
            for (let i = 1; i <= count; i++) html += `<span>${i}</span>`;
            lineNumbers.innerHTML = html;
            lineCount.textContent = `${count} 行`;
        }

        syncScroll(target) {
            const input = target === 'json' ? this.jsonInput : target === 'properties' ? this.propsInput : this.yamlInput;
            const lineNumbers = target === 'json' ? this.jsonLineNumbers : target === 'properties' ? this.propsLineNumbers : this.yamlLineNumbers;
            lineNumbers.scrollTop = input.scrollTop;
            if (target === 'json') this.jsonFoldGutter.scrollTop = input.scrollTop;
        }

        async uploadFile(e, target) {
            const file = e.target.files[0];
            if (!file) return;
            const content = await file.text();
            const input = target === 'json' ? this.jsonInput : target === 'properties' ? this.propsInput : this.yamlInput;
            input.value = content;
            if (target === 'json') this.onJsonInput();
            else this.updateLineNumbers(target);
            this.showToast('success', `已載入: ${file.name}`);
            e.target.value = '';
        }

        async paste(target) {
            try {
                const text = await navigator.clipboard.readText();
                const input = target === 'json' ? this.jsonInput : target === 'properties' ? this.propsInput : this.yamlInput;
                input.value = text;
                if (target === 'json') this.onJsonInput();
                else this.updateLineNumbers(target);
                this.showToast('success', '貼上成功');
            } catch { this.showToast('error', '無法存取剪貼簿'); }
        }

        async copy(target) {
            const input = target === 'json' ? this.jsonInput : target === 'properties' ? this.propsInput : this.yamlInput;
            if (!input.value) { this.showToast('error', '沒有可複製的內容'); return; }
            try {
                await navigator.clipboard.writeText(input.value);
                this.showToast('success', '已複製');
            } catch { this.showToast('error', '複製失敗'); }
        }

        clear(target) {
            const input = target === 'json' ? this.jsonInput : target === 'properties' ? this.propsInput : this.yamlInput;
            const status = target === 'json' ? this.jsonStatus : target === 'properties' ? this.propsStatus : this.yamlStatus;
            input.value = '';
            this.hideError(target);
            status.className = 'status';
            status.textContent = '準備就緒';
            if (target === 'json') { this.foldState = {}; this.onJsonInput(); }
            else this.updateLineNumbers(target);
            this.showToast('success', '已清除');
        }

        hideError(target) {
            const error = target === 'json' ? this.jsonError : target === 'properties' ? this.propsError : this.yamlError;
            error.classList.remove('show');
            const lineNumbers = target === 'json' ? this.jsonLineNumbers : target === 'properties' ? this.propsLineNumbers : this.yamlLineNumbers;
            lineNumbers.querySelectorAll('.error-line').forEach(el => el.classList.remove('error-line'));
        }

        showToast(type, msg) {
            this.toast.className = `toast ${type} show`;
            this.toast.querySelector('.toast-message').textContent = msg;
            setTimeout(() => this.toast.classList.remove('show'), 2500);
        }

        // ===== Image Tools =====

        setupDropZone(dropZone, onDrop) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
                dropZone.addEventListener(event, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            ['dragenter', 'dragover'].forEach(event => {
                dropZone.addEventListener(event, () => dropZone.classList.add('drag-over'));
            });

            ['dragleave', 'drop'].forEach(event => {
                dropZone.addEventListener(event, () => dropZone.classList.remove('drag-over'));
            });

            dropZone.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                if (files.length) onDrop(files);
            });

            dropZone.addEventListener('click', () => {
                const input = dropZone.id === 'base64-drop-zone' ? this.base64FileInput : this.ocrFileInput;
                input.click();
            });
        }

        // Base64 Functions
        async handleBase64Upload(files) {
            const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
            if (!imageFiles.length) {
                this.showToast('error', '請選擇圖片檔案');
                return;
            }

            this.base64Status.className = 'status';
            this.base64Status.textContent = '處理中...';

            for (const file of imageFiles) {
                try {
                    const base64 = await this.fileToBase64(file);
                    this.base64Images.push({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        base64: base64,
                        dataUrl: `data:${file.type};base64,${base64}`
                    });
                } catch (e) {
                    this.showToast('error', `${file.name} 轉換失敗`);
                }
            }

            this.renderBase64Previews();
            this.base64Status.className = 'status success';
            this.base64Status.textContent = '轉換完成';
            this.base64FileInput.value = '';
            this.showToast('success', `已轉換 ${imageFiles.length} 張圖片`);
        }

        fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }

        renderBase64Previews() {
            this.base64PreviewList.innerHTML = this.base64Images.map((img, i) => `
            <div class="image-preview-item" data-index="${i}">
                <img src="${img.dataUrl}" alt="${img.name}" class="preview-image">
                <div class="preview-content">
                    <div class="preview-header">
                        <span class="preview-filename">${img.name}</span>
                        <span class="preview-size">${this.formatFileSize(img.size)}</span>
                        <div class="preview-actions">
                            <button class="icon-btn" data-action="remove" title="移除">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div class="preview-output-group">
                        <div class="output-row">
                            <label class="output-label">Base64</label>
                            <div class="output-content">
                                <input type="text" class="output-text" value="${img.base64}" readonly onclick="this.select()">
                                <button class="output-copy-btn" data-action="copy-raw" title="複製 Base64">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="output-row">
                            <label class="output-label">Data URL</label>
                            <div class="output-content">
                                <input type="text" class="output-text" value="${img.dataUrl}" readonly onclick="this.select()">
                                <button class="output-copy-btn" data-action="copy-dataurl" title="複製 Data URL">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="9" y="9" width="13" height="13" rx="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
            this.base64Count.textContent = `${this.base64Images.length} 張圖片`;
        }

        async copyBase64(index, type = 'raw') {
            try {
                const content = type === 'dataUrl' ? this.base64Images[index].dataUrl : this.base64Images[index].base64;
                await navigator.clipboard.writeText(content);
                this.showToast('success', `已複製 ${type === 'dataUrl' ? 'Data URL' : 'Base64'}`);
            } catch { this.showToast('error', '複製失敗'); }
        }

        async copyAllBase64() {
            if (!this.base64Images.length) {
                this.showToast('error', '沒有可複製的內容');
                return;
            }
            try {
                const allBase64 = this.base64Images.map(img => img.base64).join('\n\n');
                await navigator.clipboard.writeText(allBase64);
                this.showToast('success', '已複製全部 Base64');
            } catch { this.showToast('error', '複製失敗'); }
        }

        removeBase64(index) {
            this.base64Images.splice(index, 1);
            this.renderBase64Previews();
            this.showToast('success', '已移除');
        }

        clearBase64() {
            this.base64Images = [];
            this.base64PreviewList.innerHTML = '';
            this.base64Count.textContent = '0 張圖片';
            this.base64Status.className = 'status';
            this.base64Status.textContent = '準備就緒';
            this.showToast('success', '已清除');
        }

        // OCR Functions
        async handleOcrUpload(files) {
            const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
            if (!imageFiles.length) {
                this.showToast('error', '請選擇圖片檔案');
                return;
            }

            const lang = this.ocrLang.value;
            this.ocrProgressContainer.classList.add('show');
            this.ocrStatus.className = 'status';
            this.ocrStatus.textContent = '辨識中...';

            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                this.updateOcrProgress(0, `處理第 ${i + 1}/${imageFiles.length} 張...`);

                try {
                    const dataUrl = await this.fileToDataUrl(file);
                    // 預處理：如果圖片是深色背景，自動反轉顏色
                    const processedDataUrl = await this.preprocessImage(dataUrl);

                    const text = await this.recognizeText(processedDataUrl, lang, (progress) => {
                        this.updateOcrProgress(progress, `辨識中 ${Math.round(progress * 100)}%`);
                    });

                    this.ocrImages.push({
                        name: file.name,
                        size: file.size,
                        dataUrl: dataUrl, // 顯示原圖
                        text: text
                    });
                } catch (e) {
                    console.error(e);
                    this.showToast('error', `${file.name} 辨識失敗`);
                }
            }

            this.renderOcrPreviews();
            this.ocrProgressContainer.classList.remove('show');
            this.ocrStatus.className = 'status success';
            this.ocrStatus.textContent = '辨識完成';
            this.ocrFileInput.value = '';
            this.showToast('success', `已辨識 ${imageFiles.length} 張圖片`);
        }

        fileToImage(dataUrl) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = dataUrl;
            });
        }

        async preprocessImage(dataUrl) {
            try {
                const img = await this.fileToImage(dataUrl);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let totalBrightness = 0;

                // 取樣計算平均亮度 (每 10 個像素取一個)
                for (let i = 0; i < data.length; i += 40) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    totalBrightness += (r * 0.299 + g * 0.587 + b * 0.114);
                }

                const avgBrightness = totalBrightness / (data.length / 40);

                // 如果平均亮度低於 100 (深色背景)，則反轉顏色
                if (avgBrightness < 100) {
                    this.updateOcrProgress(0, '偵測到深色背景，自動反白...');
                    for (let i = 0; i < data.length; i += 4) {
                        data[i] = 255 - data[i];     // R
                        data[i + 1] = 255 - data[i + 1]; // G
                        data[i + 2] = 255 - data[i + 2]; // B
                    }
                    ctx.putImageData(imageData, 0, 0);
                    return canvas.toDataURL(); // 返回處理後的圖片
                }

                return dataUrl; // 不需要處理
            } catch (e) {
                console.error('Preprocessing failed:', e);
                return dataUrl; // 處理失敗則使用原圖
            }
        }

        fileToDataUrl(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        async recognizeText(imageData, lang, onProgress) {
            const worker = await Tesseract.createWorker(lang, 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text' && onProgress) {
                        onProgress(m.progress);
                    }
                }
            });
            const { data: { text } } = await worker.recognize(imageData);
            await worker.terminate();
            return text.trim();
        }

        updateOcrProgress(progress, text) {
            this.ocrProgressBar.style.setProperty('--progress', `${progress * 100}%`);
            this.ocrProgressText.textContent = text;
        }

        renderOcrPreviews() {
            this.ocrPreviewList.innerHTML = this.ocrImages.map((img, i) => `
            <div class="image-preview-item" data-index="${i}">
                <img src="${img.dataUrl}" alt="${img.name}" class="preview-image">
                <div class="preview-content">
                    <div class="preview-header">
                        <span class="preview-filename">${img.name}</span>
                        <span class="preview-size">${this.formatFileSize(img.size)}</span>
                        <div class="preview-actions">
                            <button class="icon-btn" data-action="ocr-copy" title="複製文字">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                            </button>
                            <button class="icon-btn" data-action="ocr-remove" title="移除">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="preview-output">${(img.text || '(無法辨識文字)').substring(0, 200)}${img.text && img.text.length > 200 ? '...' : ''}</div>
                </div>
            </div>
        `).join('');
            this.ocrCount.textContent = `${this.ocrImages.length} 張圖片`;
        }

        async copyOcrText(index) {
            try {
                await navigator.clipboard.writeText(this.ocrImages[index].text);
                this.showToast('success', '已複製文字');
            } catch { this.showToast('error', '複製失敗'); }
        }

        async copyAllOcr() {
            if (!this.ocrImages.length) {
                this.showToast('error', '沒有可複製的內容');
                return;
            }
            try {
                const allText = this.ocrImages.map(img => img.text).join('\n\n---\n\n');
                await navigator.clipboard.writeText(allText);
                this.showToast('success', '已複製全部文字');
            } catch { this.showToast('error', '複製失敗'); }
        }

        removeOcr(index) {
            this.ocrImages.splice(index, 1);
            this.renderOcrPreviews();
            this.showToast('success', '已移除');
        }

        clearOcr() {
            this.ocrImages = [];
            this.ocrPreviewList.innerHTML = '';
            this.ocrCount.textContent = '0 張圖片';
            this.ocrStatus.className = 'status';
            this.ocrStatus.textContent = '準備就緒';
            this.showToast('success', '已清除');
        }
    }

    let formatTools;
    document.addEventListener('DOMContentLoaded', () => {
        formatTools = new FormatTools();
    });
})();
