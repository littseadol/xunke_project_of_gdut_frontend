import request from '@/utils/request'

/**
 * 提交视频评价
 * @param {FormData} formData 评价表单数据
 * @returns {Promise}
 */
export function evaluateVideo(formData) {
  return request({
    url: '/lab/evaluation',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取视频评价列表
 * @param {Object} params 查询参数
 * @param {string} [params.cameraId] 摄像头ID
 * @param {string} [params.startTime] 开始时间
 * @param {string} [params.endTime] 结束时间
 * @param {number} [params.page] 页码
 * @param {number} [params.size] 每页数量
 * @returns {Promise}
 */
export function getVideoEvaluations(params) {
  return request({
    url: '/api/video/evaluations',
    method: 'get',
    params: params
  })
}

/**
 * 获取评价详情
 * @param {number} id 评价ID
 * @returns {Promise}
 */
export function getEvaluationDetail(id) {
  return request({
    url: `/api/video/evaluations/${id}`,
    method: 'get'
  })
}

/**
 * 删除评价
 * @param {number} id 评价ID
 * @returns {Promise}
 */
export function deleteEvaluation(id) {
  return request({
    url: `/api/video/evaluations/${id}`,
    method: 'delete'
  })
}


/**
 * 上传文件
 * @param {FormData} formData 文件数据
 * @param {string} type 文件类型
 * @returns {Promise}
 */
export function uploadFile(formData, type = 'evaluation') {
  return request({
    url: '/common/upload',
    method: 'post',
    data: formData,
    params: { type }, // 确保传递type参数
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}