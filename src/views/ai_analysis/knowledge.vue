<template>
  <div class="knowledge-container">
    <el-card class="full-screen-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">知识点提取</span>
          <el-tag type="info" class="card-subtitle">从讲课内容中提取关键知识点</el-tag>
        </div>
      </template>

      <!-- 文本输入区域 -->
      <div class="input-section">
        <el-form-item label="讲课内容">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="10"
            placeholder="请输入教师讲课的文本内容..."
            resize="none"
            class="input-textarea"
            show-word-limit
            maxlength="10000"
          />
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button 
          type="primary" 
          :loading="isExtracting" 
          :disabled="!inputText" 
          @click="startExtraction"
          size="large"
          class="action-btn"
        >
          <el-icon><magic-stick /></el-icon>
          提取知识点
        </el-button>

        <el-button 
          @click="insertSampleText" 
          size="large"
          class="action-btn"
        >
          <el-icon><document /></el-icon>
          插入示例文本
        </el-button>
      </div>

      <!-- 结果展示 -->
      <div v-if="extractionResult.length > 0" class="result-section">
        <el-divider class="result-divider" />
        <h3 class="result-title">提取的知识点 ({{ extractionResult.length }}个)</h3>
        
        <el-card class="keyword-card" shadow="never">
          <div class="keyword-grid">
            <div 
              v-for="(keyword, index) in extractionResult" 
              :key="index"
              class="keyword-item"
            >
              <el-tag 
                type="success"
                size="large"
                class="keyword-tag"
                effect="dark"
                @click="copyKeyword(keyword)"
              >
                {{ keyword }}
                <el-icon class="copy-icon"><document-copy /></el-icon>
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="result-actions">
          <el-button 
            @click="copyAllKeywords" 
            type="primary"
            class="result-btn"
          >
            <el-icon><document-copy /></el-icon>
            复制全部
          </el-button>
          
          <el-button 
            @click="exportKeywords" 
            type="success"
            class="result-btn"
          >
            <el-icon><download /></el-icon>
            导出为文档
          </el-button>
        </div>
      </div>

      <el-empty 
        v-else-if="extractionDone" 
        description="暂无提取结果" 
        :image-size="100"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { extractKeywords } from '@/api/ai_analysis/knowledge.js'

const inputText = ref('')
const isExtracting = ref(false)
const extractionResult = ref([])
const extractionDone = ref(false)

// 插入示例讲课文本
const insertSampleText = () => {
  inputText.value = `同学们好，今天我们讲解机器学习的基础概念。机器学习分为监督学习、无监督学习和强化学习三大类型。

监督学习需要标注数据，常见算法包括线性回归、逻辑回归、支持向量机和决策树。线性回归用于预测连续值，逻辑回归用于分类问题。

无监督学习让算法自主发现模式，包括聚类算法如K均值，降维技术如主成分分析PCA。

机器学习流程包含数据收集、特征工程、模型训练、评估和部署。特征工程是关键环节，直接影响模型效果。

深度学习使用神经网络处理复杂问题，CNN用于图像识别，RNN处理序列数据，LSTM解决长序列依赖问题。

机器学习已应用于医疗诊断、金融风控、推荐系统等领域，但需注意算法偏见和数据隐私问题。`
}

const startExtraction = async () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入讲课内容')
    return
  }

  isExtracting.value = true
  extractionResult.value = []
  extractionDone.value = false
  
  try {
    // 调用无topN参数的API
    const response = await extractKeywords({
      text: inputText.value
    })
    extractionResult.value = response.data || []
    extractionDone.value = true
    
    if (extractionResult.value.length > 0) {
      ElMessage.success(`成功提取 ${extractionResult.value.length} 个知识点`)
    } else {
      ElMessage.warning('未提取到有效知识点')
    }
  } catch (error) {
    ElMessage.error('提取失败: ' + error.message)
  } finally {
    isExtracting.value = false
  }
}

// 复制单个关键词
const copyKeyword = (text) => {
  navigator.clipboard.writeText(text)
  ElMessage.success(`已复制: ${text}`)
}

// 复制全部关键词
const copyAllKeywords = () => {
  const text = extractionResult.value.join('、')
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制全部知识点')
}

// 导出为文本文件
const exportKeywords = () => {
  const content = `知识点提取结果：\n${extractionResult.value.join('\n')}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `知识点提取_${new Date().toLocaleString()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.knowledge-container {
  height: calc(100vh - 40px);
  padding: 20px;
  box-sizing: border-box;
}

.full-screen-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
}

.input-section {
  padding: 0 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.input-textarea {
  flex: 1;
}

.input-textarea :deep(.el-textarea__inner) {
  height: 100%;
  resize: none;
}

.action-section {
  padding: 0 20px;
  margin: 20px 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.action-btn {
  width: 180px;
}

.result-section {
  padding: 0 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-title {
  margin: 16px 0;
  font-size: 16px;
}

.keyword-card {
  flex: 1;
  overflow: auto;
  border: none;
}

.keyword-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  padding: 8px;
}

.keyword-item {
  display: flex;
  justify-content: center;
}

.keyword-tag {
  width: 100%;
  justify-content: center;
  padding: 10px 16px;
  cursor: pointer;
  position: relative;
}

.copy-icon {
  margin-left: 6px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.keyword-tag:hover .copy-icon {
  opacity: 1;
}

.result-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.result-btn {
  width: 180px;
}
</style>