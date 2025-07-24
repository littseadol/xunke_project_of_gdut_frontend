import request from '@/utils/request'

// 查询楼栋列表
export function listBuilding(query) {
  return request({
    url: '/lab/building/list',
    method: 'get',
    params: query
  })
}

// 查询楼栋列表
export function listAllBuilding(query) {
  return request({
    url: '/lab/building/list-all',
    method: 'get',
    params: query
  })
}

// 查询楼栋详细
export function getBuilding(buildingId) {
  return request({
    url: '/lab/building/' + buildingId,
    method: 'get'
  })
}

// 新增楼栋
export function addBuilding(data) {
  return request({
    url: '/lab/building',
    method: 'post',
    data: data
  })
}

// 修改楼栋
export function updateBuilding(data) {
  return request({
    url: '/lab/building',
    method: 'put',
    data: data
  })
}

// 删除楼栋
export function delBuilding(buildingId) {
  return request({
    url: '/lab/building/' + buildingId,
    method: 'delete'
  })
}