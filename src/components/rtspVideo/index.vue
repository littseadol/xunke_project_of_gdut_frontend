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
    
    <!-- 评课表单对话框 -->
    <el-dialog 
      title="课程评价" 
      v-model="showEvaluateForm" 
      width="60%"
      :before-close="handleClose"
    >
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
        
        <el-form-item label="课程评分" prop="score">
          <el-rate v-model="evaluateForm.score" show-score />
        </el-form-item>
        
        <el-form-item label="评价内容" prop="content">
          <el-input 
            v-model="evaluateForm.content" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入课程评价内容"
          />
        </el-form-item>
        
        <el-form-item label="建议" prop="suggestion">
          <el-input 
            v-model="evaluateForm.suggestion" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入改进建议"
          />
        </el-form-item>
      </el-form>
      
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

console.log("props数据展示",props.deviceId)
console.log("props数据展示",props.rtspVideo)


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
  score: 5,
  content: '',
  suggestion: ''
})



const evaluateRules = {
  score: [{ required: true, message: '请选择评分', trigger: 'change' }],
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
// timeEl 传递过来具体的数值：年月日时分秒
// total 字符串总长度 默认值为2
// str 补充元素 默认值为"0"
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
    formData.append('score', evaluateForm.value.score)
    formData.append('content', evaluateForm.value.content)
    formData.append('suggestion', evaluateForm.value.suggestion || '')
    formData.append('snapshotTime', evaluateForm.value.snapshotTime)
    formData.append('videoTime', evaluateForm.value.videoTime)
    formData.append('snapshotUrl', snapshotUrl)

    console.log(evaluateForm.value)
    console.log("表单数据",formData)
    
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
    score: 5,
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
</style>