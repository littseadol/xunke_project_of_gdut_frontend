<template>
  <div class="component-upload-video">
    <el-upload
      multiple
      :disabled="disabled"
      :action="uploadVideoUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :data="uploadData"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="videoUpload"
      :before-remove="handleDelete"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handleVideoPreview"
      :on-change="handleFileChange"
      :class="{ hide: fileList.length >= limit }"
    >
      <el-icon class="avatar-uploader-icon">
        <plus />
      </el-icon>
    </el-upload>

    <!-- 上传提示 -->
    <div class="el-upload__tip" v-if="showTip && !disabled">
      请上传
      <template v-if="fileSize">
        大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
      </template>
      的视频文件
    </div>

    <el-dialog v-model="dialogVisible" title="视频预览" width="800px" append-to-body>
      <video
        :src="dialogVideoUrl"
        controls
        style="display: block; max-width: 100%; margin: 0 auto"
      ></video>
    </el-dialog>
  </div>
</template>

<script setup>
import { getToken } from "@/utils/auth"
import { isExternal } from "@/utils/validate"
import Sortable from 'sortablejs'
import { computed, ref, watch, getCurrentInstance, nextTick, onMounted } from 'vue'

const props = defineProps({
  modelValue: [String, Object, Array],
  action: {
    type: String,
    default: "/common/upload"
  },
  data: {
    type: Object,
    default: () => ({})
  },
  limit: {
    type: Number,
    default: 5
  },
  fileSize: {
    type: Number,
    default: 500
  },
  fileType: {
    type: Array,
    default: () => ["mp4", "avi", "mov", "mkv", "flv"]
  },
  isShowTip: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  drag: {
    type: Boolean,
    default: true
  },
  uploadType: {
    type: String,
    default: "transcibe"
  }
})

const emit = defineEmits(['update:modelValue', 'update:file'])

const { proxy } = getCurrentInstance()
const number = ref(0)
const uploadList = ref([])
const dialogVideoUrl = ref("")
const dialogVisible = ref(false)
const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadVideoUrl = ref(import.meta.env.VITE_APP_BASE_API + props.action)
const headers = ref({ Authorization: "Bearer " + getToken() })
const fileList = ref([])
const fileObjects = ref([]) // 新增：存储原始文件对象

// 合并上传参数，确保包含type字段
const uploadData = computed(() => ({
  ...props.data,
  type: props.uploadType
}))

const showTip = computed(
  () => props.isShowTip && (props.fileType || props.fileSize)
)

// 处理文件变化
const handleFileChange = (file, files) => {
  if (file.status === 'ready') {
    const fileObj = {
      ...file,
      url: URL.createObjectURL(file.raw),
      rawFile: file.raw // 存储原始文件对象
    }
    fileObjects.value = [...fileObjects.value, fileObj]
    emit('update:file', file.raw) // 触发文件更新
  }
}

watch(() => props.modelValue, val => {
  if (val) {
    const list = Array.isArray(val) ? val : props.modelValue.split(",")
    fileList.value = list.map(item => {
      if (typeof item === "string") {
        if (item.indexOf(baseUrl) === -1 && !isExternal(item)) {
          item = { name: baseUrl + item, url: baseUrl + item }
        } else {
          item = { name: item, url: item }
        }
      }
      return item
    })
  } else {
    fileList.value = []
    fileObjects.value = []
    emit('update:file', null)
  }
}, { deep: true, immediate: true })

function handleBeforeUpload(file) {
  let isVideo = false
  if (props.fileType.length) {
    let fileExtension = ""
    if (file.name.lastIndexOf(".") > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1)
    }
    isVideo = props.fileType.some(type => {
      if (file.type.indexOf(type) > -1) return true
      if (fileExtension && fileExtension.indexOf(type) > -1) return true
      return false
    })
  } else {
    isVideo = file.type.indexOf("video") > -1
  }
  
  if (!isVideo) {
    proxy.$modal.msgError(`文件格式不正确，请上传${props.fileType.join("/")}视频格式文件!`)
    return false
  }
  
  if (file.name.includes(',')) {
    proxy.$modal.msgError('文件名不正确，不能包含英文逗号!')
    return false
  }
  
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`上传视频大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  
  proxy.$modal.loading("正在上传视频，请稍候...")
  number.value++
}

function handleExceed() {
  proxy.$modal.msgError(`上传视频数量不能超过 ${props.limit} 个!`)
}

function handleUploadSuccess(res, file) {
  if (res.code === 200) {
    uploadList.value.push({ name: res.fileName, url: res.url })
    uploadedSuccessfully()
  } else {
    number.value--
    proxy.$modal.closeLoading()
    proxy.$modal.msgError(res.msg)
    proxy.$refs.videoUpload.handleRemove(file)
    uploadedSuccessfully()
  }
}

function handleDelete(file) {
  const findex = fileList.value.map(f => f.name).indexOf(file.name)
  const objIndex = fileObjects.value.findIndex(f => f.name === file.name)
  
  if (findex > -1) {
    // 释放URL对象
    if (fileList.value[findex].url.startsWith('blob:')) {
      URL.revokeObjectURL(fileList.value[findex].url)
    }
    
    fileList.value.splice(findex, 1)
    if (objIndex > -1) {
      fileObjects.value.splice(objIndex, 1)
    }
    
    emit("update:modelValue", listToString(fileList.value))
    emit('update:file', fileObjects.value[0]?.rawFile || null)
    return false
  }
}

function uploadedSuccessfully() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter(f => f.url !== undefined).concat(uploadList.value)
    uploadList.value = []
    number.value = 0
    emit("update:modelValue", listToString(fileList.value))
    proxy.$modal.closeLoading()
  }
}

function handleUploadError() {
  proxy.$modal.msgError("上传视频失败")
  proxy.$modal.closeLoading()
}

function handleVideoPreview(file) {
  dialogVideoUrl.value = file.url
  dialogVisible.value = true
}

function listToString(list, separator) {
  let strs = ""
  separator = separator || ","
  for (let i in list) {
    if (undefined !== list[i].url && list[i].url.indexOf("blob:") !== 0) {
      strs += list[i].url.replace(baseUrl, "") + separator
    }
  }
  return strs != "" ? strs.substr(0, strs.length - 1) : ""
}

onMounted(() => {
  if (props.drag && !props.disabled) {
    nextTick(() => {
      const element = proxy.$refs.videoUpload?.$el?.querySelector('.el-upload-list')
      Sortable.create(element, {
        onEnd: (evt) => {
          const movedItem = fileList.value.splice(evt.oldIndex, 1)[0]
          fileList.value.splice(evt.newIndex, 0, movedItem)
          emit('update:modelValue', listToString(fileList.value))
        }
      })
    })
  }
})
</script>

<style scoped lang="scss">
:deep(.hide .el-upload--picture-card) {
  display: none;
}

:deep(.el-upload.el-upload--picture-card.is-disabled) {
  display: none !important;
}

.component-upload-video {
  :deep(.el-upload-list__item-thumbnail) {
    position: relative;
    
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    &::after {
      content: "▶";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 24px;
    }
  }
}
</style>