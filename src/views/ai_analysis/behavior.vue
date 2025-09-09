<template>
  <div style="margin: 20px;">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>学生行为分析</span>
          <el-tag type="info" style="margin-left: 10px;">分析视频中学生行为</el-tag>
        </div>
      </template>

      <!-- 视频上传区域 -->
      <video-upload :limit="1" :file-size="500" :file-type="['mp4', 'avi', 'mov']" v-model="videoUrl"
          @update:file="handleFileUpdate" />

      <!-- 操作按钮区域 -->
      <div class="action-area">
        <el-button type="primary" :loading="isAnalyzing" :disabled="!videoFile" @click="startAnalysis" size="large">
          <el-icon>
            <search />
          </el-icon>
          {{ isAnalyzing ? '分析中...' : '开始分析' }}
        </el-button>

        <el-button v-if="analysisResult" @click="clearAll" size="large">
          <el-icon>
            <refresh />
          </el-icon>
          清空重试
        </el-button>

        <!-- 测试数据按钮 -->
        <el-button type="warning" @click="loadTestData" size="large">
          <el-icon>
            <magic-stick />
          </el-icon>
          加载测试数据
        </el-button>
      </div>

      <!-- 视频预览区域 -->
      <div v-if="videoUrl" class="video-preview">
        <video :src="videoUrl" controls style="width: 100%; max-height: 400px;"></video>
      </div>

      <!-- 分析结果展示区域 -->
      <el-row style="margin-top: 20px;" :gutter="20">
        <el-col :span="24">
          <el-card class="result-card">
            <template #header>
              <div class="card-header">
                <span>行为分析结果</span>
                <el-tag v-if="analysisResult" type="success">
                  共检测到 {{ totalBehaviors }} 次行为
                </el-tag>
              </div>
            </template>

            <div v-if="analysisResult" class="result-content">
              <!-- 环状图展示 -->
              <div class="chart-container">
                <div ref="chartRef" style="width: 100%; height: 400px;"></div>
              </div>

              <!-- 详细行为统计表格 -->
              <el-table :data="behaviorTableData" border style="width: 100%; margin-top: 20px;">
                <el-table-column prop="behavior" label="行为类型" width="180" />
                <el-table-column prop="count" label="出现次数" width="120" />
                <el-table-column prop="percentage" label="占比" width="120">
                  <template #default="{row}">
                    {{ row.percentage }}%
                  </template>
                </el-table-column>
                <el-table-column label="时间点">
                  <template #default="{row}">
                    <el-tag v-for="(time, index) in row.timestamps" :key="index" style="margin-right: 5px;">
                      {{ formatTime(time) }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>

              <div class="result-actions">
                <el-button type="success" @click="exportToExcel" size="small">
                  <el-icon><document /></el-icon>
                  导出Excel
                </el-button>

                <el-button type="info" @click="showRawData = !showRawData" size="small">
                  <el-icon>
                    <view />
                  </el-icon>
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

            <el-empty v-else description="暂无分析结果" :image-size="100">
              <template #image>
                <el-icon :size="50">
                  <promotion />
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import VideoUpload from '@/components/VideoUpload/index.vue'

// 响应式数据
const videoUrl = ref('')
const videoFile = ref(null)
const analysisResult = ref(null)
const rawResponse = ref(null)
const showRawData = ref(false)
const isAnalyzing = ref(false)
const chartRef = ref(null)
let chartInstance = null

// 行为类型定义
const behaviorTypes = [
  { name: 'Mobile-Phone', label: '使用手机', color: '#FF9F43' },
  { name: 'No-Helmet', label: '未佩戴头盔', color: '#FF6384' },
  { name: 'Sleeping', label: '睡觉', color: '#36A2EB' },
  { name: 'Triples', label: '三人组行为', color: '#4BC0C0' },
  { name: 'Violence', label: '暴力行为', color: '#9966FF' }
]

// 生成随机测试数据
const generateTestData = () => {
  const testData = {}
  
  behaviorTypes.forEach(type => {
    const count = Math.floor(Math.random() * 10) + 1
    const timestamps = []
    
    for (let i = 0; i < count; i++) {
      timestamps.push(Math.random() * 300) // 随机生成0-300秒的时间点
    }
    
    timestamps.sort((a, b) => a - b) // 按时间排序
    
    testData[type.name] = {
      count,
      timestamps
    }
  })
  
  return testData
}

// 计算总行为次数
const totalBehaviors = computed(() => {
  if (!analysisResult.value) return 0
  return behaviorTypes.reduce((total, type) => {
    return total + (analysisResult.value[type.name]?.count || 0)
  }, 0)
})

// 格式化表格数据
const behaviorTableData = computed(() => {
  if (!analysisResult.value) return []
  
  return behaviorTypes.map(type => {
    const behaviorData = analysisResult.value[type.name] || { count: 0, timestamps: [] }
    const percentage = totalBehaviors.value > 0 
      ? ((behaviorData.count / totalBehaviors.value) * 100).toFixed(1)
      : '0.0'
    
    return {
      behavior: type.label,
      count: behaviorData.count,
      percentage,
      timestamps: behaviorData.timestamps || []
    }
  })
})

// 初始化图表
const initChart = () => {
  if (!chartRef.value || !analysisResult.value) return
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    title: {
      text: '行为分布统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: behaviorTypes.map(type => type.label)
    },
    series: [
      {
        name: '行为分布',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: behaviorTypes.map(type => {
          const count = analysisResult.value[type.name]?.count || 0
          return {
            value: count,
            name: type.label,
            itemStyle: { color: type.color }
          }
        })
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 处理文件更新
const handleFileUpdate = (file) => {
  videoFile.value = file
}

// 开始分析
const startAnalysis = async () => {
  try {
    isAnalyzing.value = true
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 使用测试数据
    const testData = generateTestData()
    rawResponse.value = testData
    analysisResult.value = testData
    
    ElMessage.success('分析完成 (测试数据)')
    
    // 初始化图表
    nextTick(() => {
      initChart()
    })
    
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败: ' + (error.message || '未知错误'))
  } finally {
    isAnalyzing.value = false
  }
}

// 加载测试数据
const loadTestData = () => {
  const testData = generateTestData()
  rawResponse.value = testData
  analysisResult.value = testData
  ElMessage.success('已加载测试数据')
  
  nextTick(() => {
    initChart()
  })
}

// 格式化时间显示
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 导出Excel
const exportToExcel = () => {
  ElMessage.success('导出功能待实现')
}

// 清空所有内容
const clearAll = () => {
  videoUrl.value = ''
  videoFile.value = null
  analysisResult.value = null
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

// 组件挂载和卸载时处理图表实例
onMounted(() => {
  if (analysisResult.value) {
    initChart()
  }
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})
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

.action-area {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.video-preview {
  margin-top: 20px;

  video {
    border-radius: 4px;
    background-color: #000;
  }
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

.chart-container {
  width: 100%;
  height: 400px;
  margin: 20px 0;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--el-border-color-light);
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