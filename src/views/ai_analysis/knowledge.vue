<template>
  <div style="margin: 20px;">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>知识提取</span>
          <el-tag type="info" style="margin-left: 10px;">从文本中提取结构化知识</el-tag>
        </div>
      </template>

      <!-- 文本输入区域 -->
      <div class="input-area">
        <el-form>
          <el-form-item label="输入文本">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="8"
              placeholder="请输入要提取知识的文本内容"
              show-word-limit
              maxlength="5000"
            />
          </el-form-item>
          
          <el-form-item label="上传文本文件">
            <el-upload
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleFileUpload"
              accept=".txt,.pdf,.docx"
            >
              <el-button type="primary">
                <el-icon><upload /></el-icon>
                选择文件
              </el-button>
              <span style="margin-left: 10px; color: #999;">支持.txt, .pdf, .docx格式</span>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作按钮区域 -->
      <div class="action-area">
        <el-button 
          type="primary" 
          :loading="isExtracting" 
          :disabled="!inputText" 
          @click="startExtraction"
          size="large"
        >
          <el-icon><magic-stick /></el-icon>
          {{ isExtracting ? '提取中...' : '开始提取' }}
        </el-button>

        <el-button 
          v-if="extractionResult" 
          @click="clearAll" 
          size="large"
        >
          <el-icon><refresh /></el-icon>
          清空重试
        </el-button>
      </div>

      <!-- 参数配置对话框 -->
      <el-dialog 
        v-model="paramDialogVisible" 
        title="提取参数配置" 
        width="600px" 
        :before-close="handleParamDialogClose"
      >
        <el-form :model="extractParams" label-width="120px">
          <el-form-item label="提取类型">
            <el-checkbox-group v-model="extractParams.types">
              <el-checkbox-button label="entities">实体</el-checkbox-button>
              <el-checkbox-button label="relations">关系</el-checkbox-button>
              <el-checkbox-button label="events">事件</el-checkbox-button>
              <el-checkbox-button label="concepts">概念</el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="语言">
            <el-select v-model="extractParams.language" placeholder="请选择语言" style="width: 100%">
              <el-option label="自动检测" value="auto" />
              <el-option label="中文" value="zh" />
              <el-option label="英文" value="en" />
            </el-select>
          </el-form-item>

          <el-form-item label="输出格式">
            <el-select v-model="extractParams.format" placeholder="请选择输出格式" style="width: 100%">
              <el-option label="结构化JSON" value="json" />
              <el-option label="表格形式" value="table" />
              <el-option label="知识图谱" value="graph" />
            </el-select>
          </el-form-item>

          <el-form-item label="高级选项">
            <el-switch v-model="extractParams.advanced" active-text="启用" inactive-text="禁用" />
          </el-form-item>

          <el-form-item v-if="extractParams.advanced" label="领域模型">
            <el-select v-model="extractParams.domain" placeholder="请选择领域" style="width: 100%">
              <el-option label="通用" value="general" />
              <el-option label="医疗" value="medical" />
              <el-option label="金融" value="financial" />
              <el-option label="法律" value="legal" />
              <el-option label="科技" value="technology" />
            </el-select>
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="paramDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExtraction">开始提取</el-button>
        </template>
      </el-dialog>

      <!-- 结果展示区域 -->
      <el-row style="margin-top: 20px;" :gutter="20">
        <el-col :span="24">
          <el-card class="result-card">
            <template #header>
              <div class="card-header">
                <span>提取结果</span>
                <el-tag v-if="extractionResult" type="success">
                  共 {{ extractedItemsCount }} 项知识
                </el-tag>
              </div>
            </template>

            <div v-if="extractionResult" class="result-content">
              <!-- 根据选择的格式展示不同结果 -->
              <div v-if="extractParams.format === 'json'">
                <el-input
                  v-model="formattedResult"
                  type="textarea"
                  :rows="10"
                  readonly
                  resize="none"
                  class="result-text"
                />
              </div>

              <div v-if="extractParams.format === 'table'">
                <el-table :data="tableData" border style="width: 100%">
                  <el-table-column prop="type" label="类型" width="120" />
                  <el-table-column prop="content" label="内容" />
                  <el-table-column prop="confidence" label="置信度" width="100">
                    <template #default="{row}">
                      <el-progress 
                        :percentage="row.confidence" 
                        :stroke-width="15" 
                        :format="() => row.confidence + '%'"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div v-if="extractParams.format === 'graph'" class="graph-container">
                <!-- 这里可以放置知识图谱可视化组件 -->
                <div class="graph-placeholder">
                  <el-icon :size="50"><pie-chart /></el-icon>
                  <p>知识图谱可视化展示区域</p>
                </div>
              </div>

              <div class="result-actions">
                <el-button type="success" @click="copyToClipboard" size="small">
                  <el-icon><document-copy /></el-icon>
                  复制结果
                </el-button>

                <el-button type="info" @click="exportResult" size="small">
                  <el-icon><download /></el-icon>
                  导出结果
                </el-button>

                <el-button type="warning" @click="showRawData = !showRawData" size="small">
                  <el-icon><view /></el-icon>
                  {{ showRawData ? '隐藏原始数据' : '显示原始数据' }}
                </el-button>
              </div>

              <!-- 原始JSON数据显示区域 -->
              <div v-if="showRawData" class="raw-data">
                <el-divider />
                <h4>原始响应数据：</h4>
                <pre>{{ rawResponse }}</pre>
              </div>
            </div>

            <el-empty v-else description="暂无提取结果" :image-size="100">
              <template #image>
                <el-icon :size="50">
                  <data-analysis />
                </el-icon>
              </template>
            </el-empty>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 数据定义
const inputText = ref('')
const isExtracting = ref(false)
const extractionResult = ref(null)
const rawResponse = ref(null)
const showRawData = ref(false)
const paramDialogVisible = ref(false)

// 提取参数
const extractParams = ref({
  types: ['entities', 'relations'],
  language: 'auto',
  format: 'json',
  advanced: false,
  domain: 'general'
})

// 计算属性
const extractedItemsCount = computed(() => {
  if (!extractionResult.value) return 0
  return extractionResult.value.entities?.length || 0 + 
         extractionResult.value.relations?.length || 0 +
         extractionResult.value.events?.length || 0
})

const formattedResult = computed(() => {
  return JSON.stringify(extractionResult.value, null, 2)
})

const tableData = computed(() => {
  if (!extractionResult.value) return []
  
  const data = []
  if (extractionResult.value.entities) {
    extractionResult.value.entities.forEach(entity => {
      data.push({
        type: '实体',
        content: `${entity.text} (${entity.type})`,
        confidence: entity.confidence * 100
      })
    })
  }
  
  if (extractionResult.value.relations) {
    extractionResult.value.relations.forEach(relation => {
      data.push({
        type: '关系',
        content: `${relation.source} → ${relation.target} (${relation.type})`,
        confidence: relation.confidence * 100
      })
    })
  }
  
  return data
})

// 方法定义
const startExtraction = () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入要提取的文本内容')
    return
  }
  paramDialogVisible.value = true
}

const confirmExtraction = async () => {
  paramDialogVisible.value = false
  isExtracting.value = true
  
  try {
    // 调用API进行知识提取
    const response = await fetchKnowledge(inputText.value, extractParams.value)
    extractionResult.value = response.data
    rawResponse.value = response
    
    ElMessage.success('知识提取成功')
  } catch (error) {
    ElMessage.error('知识提取失败: ' + error.message)
  } finally {
    isExtracting.value = false
  }
}

const fetchKnowledge = async (text, params) => {
  // 这里替换为实际API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟API响应
      const mockData = {
        entities: [
          { text: '人工智能', type: '技术', confidence: 0.95 },
          { text: '深度学习', type: '技术', confidence: 0.92 },
          { text: 'Google', type: '公司', confidence: 0.98 }
        ],
        relations: [
          { source: '人工智能', target: '深度学习', type: '包含', confidence: 0.88 },
          { source: 'Google', target: '人工智能', type: '研究', confidence: 0.85 }
        ],
        language: 'zh'
      }
      resolve({ data: mockData })
    }, 1500)
  })
}

const handleFileUpload = (file) => {
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过50MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    inputText.value = e.target.result
  }
  reader.readAsText(file.raw)
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(formattedResult.value)
  ElMessage.success('已复制到剪贴板')
}

const exportResult = () => {
  let content = ''
  if (extractParams.value.format === 'json') {
    content = formattedResult.value
  } else {
    content = tableData.value.map(item => 
      `${item.type}\t${item.content}\t${item.confidence}%`
    ).join('\n')
  }
  
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `知识提取结果_${new Date().toISOString().slice(0, 10)}.${extractParams.value.format === 'json' ? 'json' : 'txt'}`
  a.click()
  URL.revokeObjectURL(url)
}

const clearAll = () => {
  inputText.value = ''
  extractionResult.value = null
  rawResponse.value = null
  showRawData.value = false
}

const handleParamDialogClose = (done) => {
  done()
}
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;

  span {
    font-size: 18px;
  }
}

.input-area {
  margin-bottom: 20px;
}

.action-area {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.result-card {
  min-height: 300px;

  .card-header {
    padding-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-light);
  }
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-text {
  font-size: 14px;
  line-height: 1.6;

  :deep(.el-textarea__inner) {
    background-color: #f8f8f8;
    border: 1px solid #e4e7ed;
    color: #606266;
    font-family: monospace;
  }
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--el-border-color-light);
}

.graph-container {
  height: 400px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9f9f9;
  
  .graph-placeholder {
    text-align: center;
    color: #999;
    
    p {
      margin-top: 10px;
    }
  }
}

.raw-data {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;

  h4 {
    margin-bottom: 10px;
    color: #666;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>