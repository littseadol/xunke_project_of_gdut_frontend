import request from '@/utils/request'

// 单文本关键词提取
export function extractKeywords(data) {
  return request({
    url: '/lab/knowledge/extractKeywords',
    method: 'post',
    data: data
  })
}


// 文件上传解析
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/lab/knowledge/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}