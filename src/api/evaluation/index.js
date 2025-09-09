import request from '@/utils/request'

// 查询评价信息列表
export function listEvaluation(query) {
  return request({
    url: '/lab/evaluation/list',
    method: 'get',
    params: query
  })
}

// 查询评价信息详细
export function getEvaluation(id) {
  return request({
    url: '/lab/evaluation/' + id,
    method: 'get'
  })
}

// 新增评价信息
export function addEvaluation(data) {
  return request({
    url: '/lab/evaluation',
    method: 'post',
    data: data
  })
}

// 修改评价信息
export function updateEvaluation(data) {
  return request({
    url: '/lab/evaluation',
    method: 'put',
    data: data
  })
}

// 删除评价信息
export function delEvaluation(id) {
  return request({
    url: '/lab/evaluation/' + id,
    method: 'delete'
  })
}
