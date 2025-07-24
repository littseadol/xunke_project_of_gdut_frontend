import request from '@/utils/request'

// 查询人脸列表
export function listFace(query) {
  return request({
    url: '/lab/face/list',
    method: 'get',
    params: query
  })
}

// 查询人脸详细
export function getFace(faceId) {
  return request({
    url: '/lab/face/' + faceId,
    method: 'get'
  })
}

// 比对人脸
export function compareFace(query) {
  return request({
    url: '/lab/face/compare',
    method: 'get',
    params: query
  })
}

// 搜索人脸
export function searchFace(query) {
  return request({
    url: '/lab/face/search',
    method: 'get',
    params: query
  })
}

// 检测表情
export function detectExpression(query) {
  return request({
    url: '/lab/face/detect-expression',
    method: 'get',
    params: query
  })
}

// 检测属性
export function detectAttribute(query) {
  return request({
    url: '/lab/face/detect-attribute',
    method: 'get',
    params: query
  })
}

// 新增人脸
export function addFace(data) {
  return request({
    url: '/lab/face',
    method: 'post',
    data: data
  })
}

// 修改人脸
export function updateFace(data) {
  return request({
    url: '/lab/face',
    method: 'put',
    data: data
  })
}

// 删除人脸
export function delFace(faceId) {
  return request({
    url: '/lab/face/' + faceId,
    method: 'delete'
  })
}
