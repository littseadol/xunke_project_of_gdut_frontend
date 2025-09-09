<template>
    <div style="margin: 20px;">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>视频转录</span>
                    <el-tag type="info" style="margin-left: 10px;">将视频中的语音转换为文字</el-tag>
                </div>
            </template>

            <!-- 视频上传区域 -->
            <video-upload :limit="1" :file-size="500" :file-type="['mp4', 'avi', 'mov']" v-model="videoUrl"
                @update:file="handleFileUpdate" />

            <!-- 操作按钮区域 -->
            <div class="action-area">
                <el-button type="primary" :loading="isTranscribing" :disabled="!videoFile" @click="showParamDialog"
                    size="large">
                    <el-icon>
                        <microphone />
                    </el-icon>
                    {{ isTranscribing ? '转录中...' : '开始转录' }}
                </el-button>

                <el-button v-if="transcriptionText" @click="clearAll" size="large">
                    <el-icon>
                        <refresh />
                    </el-icon>
                    清空重试
                </el-button>
            </div>

            <!-- 参数配置对话框 -->
            <el-dialog v-model="paramDialogVisible" title="转录参数配置" width="600px" :before-close="handleParamDialogClose">
                <el-form :model="transcribeParams" label-width="120px">
                    <el-form-item label="任务类型">
                        <el-radio-group v-model="transcribeParams.task">
                            <el-radio-button label="transcribe">转录</el-radio-button>
                            <el-radio-button label="translate">翻译</el-radio-button>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item label="语言">
                        <el-select v-model="transcribeParams.language" placeholder="请选择语言" style="width: 100%">
                            <el-option label="中文" value="zh" />
                            <el-option label="英文" value="en" />
                            <el-option label="日语" value="ja" />
                            <el-option label="韩语" value="ko" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="输出格式">
                        <el-select v-model="transcribeParams.output" placeholder="请选择输出格式" style="width: 100%">
                            <el-option label="纯文本 (.txt)" value="txt" />
                            <el-option label="JSON格式 (.json)" value="json" />
                            <el-option label="字幕文件 (.srt)" value="srt" />
                            <el-option label="WebVTT (.vtt)" value="vtt" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="初始提示词">
                        <el-input v-model="transcribeParams.initialPrompt" type="textarea" :rows="3"
                            placeholder="可输入专业术语或上下文提示，提高识别准确率" show-word-limit maxlength="200" />
                    </el-form-item>

                    <el-form-item label="音频编码">
                        <el-switch v-model="transcribeParams.encode" active-text="启用" inactive-text="禁用" />
                    </el-form-item>
                </el-form>

                <template #footer>
                    <el-button @click="paramDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="startTranscription">开始转录</el-button>
                </template>
            </el-dialog>

            <!-- 视频预览区域 -->
            <div v-if="videoUrl" class="video-preview">
                <video :src="videoUrl" controls style="width: 100%; max-height: 400px;"></video>
            </div>

            <!-- 结果展示区域 -->
            <el-row style="margin-top: 20px;" :gutter="20">
                <el-col :span="24">
                    <el-card class="result-card">
                        <template #header>
                            <div class="card-header">
                                <span>转录结果</span>
                                <el-tag v-if="transcriptionText" type="success">
                                    共 {{ wordCount }} 字
                                </el-tag>
                            </div>
                        </template>

                        <div v-if="transcriptionText" class="result-content">
                            <el-input v-model="displayText" type="textarea" :rows="10" readonly resize="none"
                                class="transcription-text" />

                            <div class="result-actions">
                                <el-button type="success" @click="copyToClipboard" size="small">
                                    <el-icon><document-copy /></el-icon>
                                    复制文本
                                </el-button>

                                <el-button type="info" @click="exportToTxt" size="small">
                                    <el-icon>
                                        <download />
                                    </el-icon>
                                    导出TXT
                                </el-button>

                                <el-button type="warning" @click="showRawData = !showRawData" size="small">
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

                        <el-empty v-else description="暂无转录结果" :image-size="100">
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
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import VideoUpload from '@/components/VideoUpload/index.vue'
import { transcribeVideo } from '@/api/ai_analysis'

// 响应式数据
const videoUrl = ref('')
const videoFile = ref(null)
const transcriptionText = ref('')
const rawResponse = ref(null) // 新增：存储原始响应数据
const showRawData = ref(false) // 新增：控制是否显示原始数据
const isTranscribing = ref(false)
const paramDialogVisible = ref(false)

// 转录参数
const transcribeParams = ref({
    task: 'transcribe',
    language: 'zh',
    output: 'txt',
    initialPrompt: '',
    encode: true
})


// Json格式展示
// 计算显示文本（从JSON中提取text字段）
const displayText = computed(() => {
    if (!transcriptionText.value) return ''

    if (!transcriptionText.value) return '转录内容为空'

    try {
        // 如果已经是字符串，直接返回
        if (typeof transcriptionText.value === 'string') {
            return transcriptionText.value
        }

        // 如果是JSON对象，尝试提取text字段
        if (typeof transcriptionText.value === 'object') {
            return transcriptionText.value.text || JSON.stringify(transcriptionText.value, null, 2)
        }

        // 其他情况尝试解析为JSON
        const parsed = JSON.parse(transcriptionText.value)
        return parsed.text || parsed.data?.text || transcriptionText.value
    } catch (e) {
        // 不是JSON格式，直接返回
        return transcriptionText.value
    }
})

// 计算字数
const wordCount = computed(() => {
    return transcriptionText.value ? transcriptionText.value.length : 0
})

// 处理文件更新
const handleFileUpdate = (file) => {
    videoFile.value = file
}

// 显示参数配置对话框
const showParamDialog = () => {
    if (!videoFile.value) {
        ElMessage.warning('请先上传视频文件')
        return
    }
    paramDialogVisible.value = true
}

// 开始转录
const startTranscription = async () => {
    try {
        paramDialogVisible.value = false
        isTranscribing.value = true

        // 构建请求数据
        const requestData = {
            audio_file: videoFile.value,
            task: transcribeParams.value.task,
            language: transcribeParams.value.language,
            output: transcribeParams.value.output,
            encode: transcribeParams.value.encode,
            initialPrompt: transcribeParams.value.initialPrompt
        }

        // 调用API
        const response = await transcribeVideo(requestData)
        console.log('转录响应:', response)

        // 存储原始响应
        rawResponse.value = response.data

        // 处理响应数据
        if (response.data) {
            if (response.data.text) {
                // 如果响应中有text字段，直接使用
                transcriptionText.value = response.data
            } else if (typeof response.data === 'string') {
                // 如果是字符串，尝试解析JSON
                try {
                    transcriptionText.value = JSON.parse(response.data)
                } catch {
                    transcriptionText.value = response.data
                }
            } else {
                // 其他情况直接存储
                transcriptionText.value = response.data
            }
        }

        ElMessage.success('转录完成')
        console.log('转录文本内容展示:', transcriptionText.value)

    } catch (error) {
        console.error('转录失败:', error)
        transcriptionText.value = '转录失败: ' + (error.message || '未知错误')
        ElMessage.error('转录失败')
    } finally {
        isTranscribing.value = false
    }
}
// 音频压缩函数（需引入 FFmpeg.wasm）
async function compressAudio(file) {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    await ffmpeg.writeFile('input.mp3', await file.arrayBuffer());
    await ffmpeg.exec(['-i', 'input.mp3', '-b:a', '64k', 'output.mp3']);
    const compressedData = await ffmpeg.readFile('output.mp3');
    return new File([compressedData], `compressed_${file.name}`, { type: 'audio/mp3' });
}

// 复制到剪贴板
const copyToClipboard = () => {
    navigator.clipboard.writeText(transcriptionText.value)
        .then(() => ElMessage.success('已复制到剪贴板'))
        .catch(err => ElMessage.error('复制失败: ' + err))
}

// 导出为TXT文件
const exportToTxt = () => {
    const blob = new Blob([transcriptionText.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '转录结果.txt'
    a.click()
    URL.revokeObjectURL(url)
}

// 清空所有内容
const clearAll = () => {
    videoUrl.value = ''
    videoFile.value = null
    transcriptionText.value = ''
}

// 对话框关闭处理
const handleParamDialogClose = (done) => {
    if (isTranscribing.value) {
        ElMessage.warning('转录进行中，请稍候再关闭')
        return false
    }
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

.transcription-text {
    font-size: 14px;
    line-height: 1.6;

    :deep(.el-textarea__inner) {
        background-color: #f8f8f8;
        border: 1px solid #e4e7ed;
        color: #606266;
    }
}

.result-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--el-border-color-light);
}

/* 新增样式 */
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
