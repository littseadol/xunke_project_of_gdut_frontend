import request from '@/utils/request'

// 查询算法列表
export function listAlgorithm(query) {
  return request({
    url: '/lab/algorithm/list',
    method: 'get',
    params: query
  })
}

// 查询所有的算法列表
export function listAllAlgorithm() {
  return request({
    url: '/lab/algorithm/list-all',
    method: 'get'
  })
}

// 查询算法详细
export function getAlgorithm(algorithmId) {
  return request({
    url: '/lab/algorithm/' + algorithmId,
    method: 'get'
  })
}

// 新增算法
export function addAlgorithm(data) {
  return request({
    url: '/lab/algorithm',
    method: 'post',
    data: data
  })
}

// 修改算法
export function updateAlgorithm(data) {
  return request({
    url: '/lab/algorithm',
    method: 'put',
    data: data
  })
}

// 删除算法
export function delAlgorithm(algorithmId) {
  return request({
    url: '/lab/algorithm/' + algorithmId,
    method: 'delete'
  })
}
