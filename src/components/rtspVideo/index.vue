<template>
  <div style="width: 100%;height: 100%;position: relative;">
    <video ref="videoElement" muted autoplay playsinline style="width: 100%;height: 100%;"></video>
    
    <!-- 评课按钮 -->
    <el-button 
      type="success" 
      @click="captureAndShowForm"
      style="position: absolute; bottom: 20px; right: 20px;"
      :disabled="!isVideoReady"
    >
      评课
    </el-button>
    
    <!-- 评课表单对话框 - 已更新为量表评价风格 -->
    <el-dialog 
      title="量表评价" 
      v-model="showEvaluateForm" 
      width="90%"
      :before-close="handleClose"
    >
      <div class="evaluation-container">
        <div class="evaluation-header">
          <h2>量表评价</h2>
          <p>第二巡课组</p>
        </div>

        <el-form :model="evaluateForm" :rules="evaluateRules" ref="evaluateFormRef">
          <!-- 截图预览和时间显示 -->
          <el-form-item label="评价截图">
            <div style="display: flex; align-items: center; gap: 20px;">
              <img 
                :src="evaluateForm.snapshot" 
                style="max-width: 300px; max-height: 200px; border: 1px solid #ddd;"
                v-if="evaluateForm.snapshot"
              />
              <div>
                <p>截图时间: {{ evaluateForm.snapshotTime }}</p>
                <p>当前视频时间: {{ currentVideoTime }}</p>
              </div>
            </div>
          </el-form-item>

          <!-- 教学目标 -->
          <div class="evaluation-section">
            <h3>1. 教学目标</h3>
            
            <el-form-item label="1、紧扣教学大纲，教学目标明确，注重因材施教" prop="teachingObjectiveScore1">
              <el-rate
                v-model="evaluateForm.teachingObjectiveScore1"
                :max="10"
                :texts="['1分', '2分', '3分', '4分', '5分', '6分', '7分', '8分', '9分', '10分']"
                show-text
              />
            </el-form-item>

            <el-form-item label="2、立德树人，重视教学过程对学生的德育培养和价值引导" prop="teachingObjectiveScore2">
              <el-rate
                v-model="evaluateForm.teachingObjectiveScore2"
                :max="10"
                :texts="['极差', '较差', '一般', '良好', '优秀', '6分', '7分', '8分', '9分', '极好']"
                show-text
              />
            </el-form-item>
          </div>

          <!-- 教学内容 -->
          <div class="evaluation-section">
            <h3>2. 教学内容</h3>
            
            <el-form-item label="1、内容饱满，材料丰富，融入学科前沿知识或者最新成果" prop="contentScore1">
              <el-rate
                v-model="evaluateForm.contentScore1"
                :max="10"
                show-text
              />
            </el-form-item>

            <el-form-item label="2、重点突出，条理清晰，循序渐进，注重理论联系实际" prop="contentScore2">
              <el-rate
                v-model="evaluateForm.contentScore2"
                :max="10"
                show-text
              />
            </el-form-item>
          </div>

          <!-- 教学方法 -->
          <div class="evaluation-section">
            <h3>3. 教学方法</h3>
            
            <el-form-item label="1、引入合适的教学形式，注重学生创新意识和实践能力的培养" prop="methodScore1">
              <el-rate
                v-model="evaluateForm.methodScore1"
                :max="10"
                show-text
              />
            </el-form-item>

            <el-form-item label="2、善于启发引导，积极互动，有效调动学生思考和学习主动性" prop="methodScore2">
              <el-rate
                v-model="evaluateForm.methodScore2"
                :max="10"
                show-text
              />
            </el-form-item>
          </div>

          <!-- 教学态度 -->
          <div class="evaluation-section">
            <h3>4. 教学态度</h3>
            
            <el-form-item label="1、备课充分，课程内容娴熟，教态自然" prop="attitudeScore1">
              <el-rate
                v-model="evaluateForm.attitudeScore1"
                :max="10"
                show-text
              />
            </el-form-item>
          </div>

          <!-- 评价内容和建议 -->
          <div class="evaluation-section">
            <h3>5. 文字评价</h3>
            
            <el-form-item label="评价内容" prop="content">
              <el-input 
                v-model="evaluateForm.content" 
                type="textarea" 
                :rows="4" 
                placeholder="请输入课程评价内容"
              />
            </el-form-item>
            
            <el-form-item label="改进建议" prop="suggestion">
              <el-input 
                v-model="evaluateForm.suggestion" 
                type="textarea" 
                :rows="2" 
                placeholder="请输入改进建议"
              />
            </el-form-item>
          </div>

          <!-- 总分显示 -->
          <div class="total-score-section">
            <el-form-item label="总分">
              <el-progress 
                :percentage="calculateTotalScore()" 
                :format="formatTotalScore" 
                status="success" 
              />
              <span class="score-text">{{ calculateTotalScore() }}/100分</span>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showEvaluateForm = false">取消</el-button>
        <el-button type="primary" @click="submitEvaluate">提交评价</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { WebRtcStreamer } from '/public/hikvision/webrtcstreamer.js'
import { evaluateVideo, uploadFile } from '@/api/evaluation/index.js'

const props = defineProps({
  rtspVideo: {
    type: String,
    required: true,
    default: ''
  },
  deviceId: {
    type: String,
    required: true
  }
})


// 视频相关
const videoElement = ref(null)
const webRtcServer = ref(null)
const currentVideoTime = ref('')
const isVideoReady = ref(false)

// 评课相关
const showEvaluateForm = ref(false)
const evaluateFormRef = ref(null)
const evaluateForm = ref({
  deviceId: props.deviceId,
  snapshot: '',
  snapshotTime: '',
  videoTime: '',
  // 多维度评分字段
  teachingObjectiveScore1: 5,
  teachingObjectiveScore2: 5,
  contentScore1: 5,
  contentScore2: 5,
  methodScore1: 5,
  methodScore2: 5,
  attitudeScore1: 5,
  content: '',
  suggestion: ''
})

// 表单验证规则
const evaluateRules = {
  teachingObjectiveScore1: [{ required: true, message: '请选择教学质量评分', trigger: 'change' }],
  teachingObjectiveScore2: [{ required: true, message: '请选择立德树人评分', trigger: 'change' }],
  contentScore1: [{ required: true, message: '请选择内容饱满度评分', trigger: 'change' }],
  contentScore2: [{ required: true, message: '请选择重点突出评分', trigger: 'change' }],
  methodScore1: [{ required: true, message: '请选择教学形式评分', trigger: 'change' }],
  methodScore2: [{ required: true, message: '请选择启发引导评分', trigger: 'change' }],
  attitudeScore1: [{ required: true, message: '请选择备课充分评分', trigger: 'change' }],
  content: [{ required: true, message: '请输入评价内容', trigger: 'blur' }]
}

// 初始化WebRTC
const initWebRtcServer = async () => {
  nextTick(() => {
    try {
      videoElement.value = document.querySelector('video')

      webRtcServer.value = new WebRtcStreamer(videoElement.value, 'http://10.21.49.68:8000')

      webRtcServer.value.connect(props.rtspVideo)

      // 监听视频状态
      videoElement.value.onloadedmetadata = () => {
        isVideoReady.value = true
        updateCurrentTime()
      }
      
      videoElement.value.onerror = () => {
        ElMessage.error('视频加载失败')
      }
    } catch (error) {
      console.log("程序到这了222")
      ElMessage.error('视频初始化失败: ' + error.message)
    }
  })
}
    
// 定义格式化封装函数
function formaData() {
  let timer = new Date()
  const year = timer.getFullYear()
  const month = timer.getMonth() + 1 // 由于月份从0开始，因此需加1
  const day = timer.getDate()
  const hour = timer.getHours()
  const minute = timer.getMinutes()
  const second = timer.getSeconds()
  let data= `${pad(year, 4)}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`
  console.log(data)
  return data
}

// 定义具体处理标准
function pad(timeEl, total = 2, str = '0') {
  return timeEl.toString().padStart(total, str)
}

// 更新当前时间
const updateCurrentTime = () => {
  const formatTime = () => {
    const now = new Date()
    currentVideoTime.value = formaData()
  }
  formatTime()
  setInterval(formatTime, 1000)
}

// 捕获截图并显示表单
const captureAndShowForm = () => {
  try {
    if (!isVideoReady.value) {
      ElMessage.warning('视频尚未准备好，请稍后再试')
      return
    }
    
    const video = videoElement.value
    if (!video || video.readyState < HTMLMediaElement.HAVE_METADATA) {
      ElMessage.warning('视频未加载完成，请稍后再试')
      return
    }
    
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      ElMessage.warning('视频尺寸无效，无法截图')
      return
    }
    
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    evaluateForm.value.snapshot = canvas.toDataURL('image/png')
    evaluateForm.value.snapshotTime = currentVideoTime.value
    evaluateForm.value.videoTime = currentVideoTime.value
    
    showEvaluateForm.value = true
  } catch (error) {
    console.error('截图失败:', error)
    ElMessage.error('截图失败: ' + error.message)
  }
}

// 评分计算逻辑
const calculateTotalScore = () => {
  const weights = {
    teachingObjectiveScore1: 0.15,
    teachingObjectiveScore2: 0.15,
    contentScore1: 0.15,
    contentScore2: 0.10,
    methodScore1: 0.15,
    methodScore2: 0.15,
    attitudeScore1: 0.15
  };

  let total = 0;
  for (const [key, weight] of Object.entries(weights)) {
    total += (evaluateForm.value[key] || 0) * weight * 10;
  }
  
  return Math.round(total);
};

const formatTotalScore = () => {
  return `${calculateTotalScore()}分`;
};

// 修改上传文件方法，确保传递type参数
const uploadEvaluationFile = async (blob) => {
  const formData = new FormData()
  formData.append('file', blob, 'snapshot.png')
  console.log(formData)
  
  try {
    const response = await uploadFile(formData, 'evaluation')
    console.log(response)
    if (!response.url) {
      console.log("nodata")
      throw new Error('文件上传失败')
    }
    return response.url
  } catch (error) {
    console.log("dataerror")
    console.error('文件上传失败:', error)
    throw error
  }
}

const submitEvaluate = async () => {
  try {
    // 1. 验证表单
    await evaluateFormRef.value.validate()
    
    // 2. 转换Base64为Blob
    const blob = await fetch(evaluateForm.value.snapshot)
      .then(res => res.blob())
    
    // 3. 上传截图
    const snapshotUrl = await uploadEvaluationFile(blob)
    
    // 4. 准备评价数据
    const formData = new FormData()
    formData.append('deviceId', evaluateForm.value.deviceId)
    // 添加多维度评分
    formData.append('teachingObjectiveScore1', evaluateForm.value.teachingObjectiveScore1)
    formData.append('teachingObjectiveScore2', evaluateForm.value.teachingObjectiveScore2)
    formData.append('contentScore1', evaluateForm.value.contentScore1)
    formData.append('contentScore2', evaluateForm.value.contentScore2)
    formData.append('methodScore1', evaluateForm.value.methodScore1)
    formData.append('methodScore2', evaluateForm.value.methodScore2)
    formData.append('attitudeScore1', evaluateForm.value.attitudeScore1)
    formData.append('score', calculateTotalScore())
    formData.append('content', evaluateForm.value.content)
    formData.append('suggestion', evaluateForm.value.suggestion || '')
    formData.append('snapshotTime', evaluateForm.value.snapshotTime)
    formData.append('videoTime', evaluateForm.value.videoTime)
    formData.append('snapshotUrl', snapshotUrl)

       // 调试：遍历并打印 FormData 的所有内容
    console.log('=== FormData 内容 ===')
    for (let [key, value] of formData.entries()) {
      console.log(key + ': ' + value)
    }
    console.log('=====================')
    
    // 5. 提交评价
    await evaluateVideo(formData)
    
    ElMessage.success('评价提交成功')
    showEvaluateForm.value = false
    resetEvaluateForm()
  } catch (error) {
    console.error('评价提交失败:', error)
    ElMessage.error('评价提交失败: ' + (error.message || '未知错误'))
  }
}

// 重置表单
const resetEvaluateForm = () => {
  evaluateForm.value = {
    deviceId: props.deviceId,
    snapshot: '',
    snapshotTime: '',
    videoTime: '',
    teachingObjectiveScore1: 5,
    teachingObjectiveScore2: 5,
    contentScore1: 5,
    contentScore2: 5,
    methodScore1: 5,
    methodScore2: 5,
    attitudeScore1: 5,
    content: '',
    suggestion: ''
  }
}

// 对话框关闭前的处理
const handleClose = (done) => {
  done()
}

// 初始化
onMounted(() => {
  initWebRtcServer()
})

onUnmounted(() => {
  if (webRtcServer.value) {
    webRtcServer.value.disconnect()
    webRtcServer.value = null
  }
})
</script>

<style scoped>
.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.evaluation-container {
  padding: 12px;
  max-height: 70vh;
  overflow-y: auto;
}

.evaluation-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.evaluation-header h2 {
  color: #1890ff;
  margin-bottom: 6px;
  font-size: 18px;
  font-weight: 600;
}

.evaluation-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.evaluation-section {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fafafa;
}

.evaluation-section h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  padding-bottom: 6px;
  border-bottom: 1px dashed #e8e8e8;
}

/* 评分项样式 */
:deep(.el-form-item) {
  margin-bottom: 12px;
}

:deep(.el-form-item__label) {
  font-size: 13px;
  color: #555;
  line-height: 1.4;
  padding-bottom: 6px;
}

:deep(.el-rate) {
  display: flex;
  align-items: center;
}

:deep(.el-rate__item) {
  margin-right: 4px;
}

:deep(.el-rate__text) {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.total-score-section {
  margin: 16px 0;
  padding: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8f4ff 100%);
  border-radius: 6px;
  border: 1px solid #d9e7fd;
}

.total-score-section :deep(.el-form-item__label) {
  font-weight: 600;
  color: #333;
}

.score-text {
  margin-left: 12px;
  font-size: 15px;
  font-weight: bold;
  color: #1890ff;
}

/* 进度条样式 */
:deep(.el-progress-bar) {
  padding-right: 60px;
}

:deep(.el-progress__text) {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.action-buttons {
  margin-top: 16px;
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.action-buttons .el-button {
  margin: 0 8px;
  padding: 8px 16px;
}

/* 截图预览区域 */
:deep(.el-form-item__content) {
  line-height: 1.4;
}

.snapshot-preview {
  max-width: 280px;
  max-height: 180px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.time-info {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

/* 文字评价区域 */
.text-evaluation {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
}

.text-evaluation h3 {
  background: #f5f7fa;
  padding: 8px 12px;
  margin: 0;
  border-radius: 6px 6px 0 0;
  border-bottom: 1px solid #e8e8e8;
}

.text-evaluation :deep(.el-form-item) {
  padding: 0 12px 12px;
  margin-bottom: 0;
}

.text-evaluation :deep(.el-form-item__label) {
  padding-top: 12px;
}

/* 对话框头部样式 */
:deep(.el-dialog__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  background: #f5f7fa;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

:deep(.el-dialog__body) {
  padding: 16px;
}

:deep(.el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid #e8e8e8;
}
</style>