<template>
  <div class="container">
    <h1>视频上传与语音转录</h1>
    
    <!-- 视频上传区域 -->
    <div class="upload-section">
      <el-upload
        class="upload-demo"
        drag
        action="/api/upload"  <!-- 替换为你的上传接口 -->
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :show-file-list="false"
        accept="video/*"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽视频文件到此处或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持上传MP4、AVI等常见视频格式，大小不超过500MB
          </div>
        </template>
      </el-upload>
      
      <!-- 视频预览 -->
      <div v-if="videoUrl" class="video-preview">
        <video :src="videoUrl" controls class="video-player"></video>
        <div class="video-info">
          <p>文件名: {{ fileName }}</p>
          <p>大小: {{ fileSize }} MB</p>
          <p>上传时间: {{ uploadTime }}</p>
        </div>
      </div>
    </div>
    
    <!-- 语音转录区域 -->
    <div class="transcription-section">
      <el-button 
        type="primary" 
        :loading="isTranscribing"
        :disabled="!videoUrl"
        @click="startTranscription"
        class="transcribe-btn"
      >
        <el-icon><microphone /></el-icon>
        开始语音转录
      </el-button>
      
      <div class="transcription-result">
        <el-input
          v-model="transcriptionText"
          :autosize="{ minRows: 6, maxRows: 10 }"
          type="textarea"
          placeholder="转录文本将显示在这里..."
          readonly
          class="result-textarea"
        />
        
        <div class="action-buttons">
          <el-button 
            type="success" 
            :disabled="!transcriptionText"
            @click="copyToClipboard"
          >
            <el-icon><document-copy /></el-icon>
            复制文本
          </el-button>
          
          <el-button 
            type="info" 
            :disabled="!transcriptionText"
            @click="clearTranscription"
          >
            <el-icon><delete /></el-icon>
            清空文本
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UploadFilled,
  Microphone,
  DocumentCopy,
  Delete
} from '@element-plus/icons-vue'

// 响应式数据
const videoUrl = ref('')
const fileName = ref('')
const fileSize = ref(0)
const uploadTime = ref('')
const transcriptionText = ref('')
const isTranscribing = ref(false)

// 上传前校验
const beforeUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt500M = file.size / 1024 / 1024 < 500

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过500MB!')
    return false
  }
  
  return true
}

// 上传成功处理
const handleUploadSuccess = (response, file) => {
  videoUrl.value = URL.createObjectURL(file.raw)
  fileName.value = file.name
  fileSize.value = (file.size / 1024 / 1024).toFixed(2)
  uploadTime.value = new Date().toLocaleString()
  
  ElMessage.success('视频上传成功!')
  transcriptionText.value = '' // 清空之前的转录结果
}

// 上传失败处理
const handleUploadError = (error, file) => {
  console.error('上传失败:', error)
  ElMessage.error('视频上传失败!')
}

// 开始语音转录
const startTranscription = async () => {
  if (!videoUrl.value) {
    ElMessage.warning('请先上传视频文件')
    return
  }
  
  isTranscribing.value = true
  transcriptionText.value = '正在转录中，请稍候...'
  
  try {
    // 调用你的后台转录接口
    // 这里假设你的接口是 POST /api/transcribe
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoUrl: videoUrl.value,
        fileName: fileName.value
      })
    })
    
    if (!response.ok) throw new Error('转录失败')
    
    const result = await response.json()
    transcriptionText.value = result.text || '转录成功，但返回内容为空'
    ElMessage.success('语音转录完成!')
    
  } catch (error) {
    console.error('转录错误:', error)
    transcriptionText.value = '语音转录失败: ' + error.message
    ElMessage.error('语音转录失败!')
  } finally {
    isTranscribing.value = false
  }
}

// 复制文本到剪贴板
const copyToClipboard = () => {
  navigator.clipboard.writeText(transcriptionText.value)
    .then(() => ElMessage.success('已复制到剪贴板'))
    .catch(err => ElMessage.error('复制失败: ' + err))
}

// 清空转录文本
const clearTranscription = () => {
  transcriptionText.value = ''
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.upload-section {
  margin-bottom: 30px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  background-color: #fafafa;
}

.video-preview {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.video-player {
  max-width: 100%;
  max-height: 400px;
  background-color: #000;
  border-radius: 4px;
}

.video-info {
  margin-top: 10px;
  text-align: center;
  color: #666;
}

.video-info p {
  margin: 5px 0;
}

.transcription-section {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  background-color: #fafafa;
}

.transcribe-btn {
  margin-bottom: 20px;
  width: 100%;
}

.transcription-result {
  margin-top: 20px;
}

.result-textarea {
  width: 100%;
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-icon {
  margin-right: 5px;
}
</style>