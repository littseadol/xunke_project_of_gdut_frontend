import request from '@/utils/request'

// 查询录像管理列表
export function listRecord(query) {
  return request({
    url: '/record/record/list',
    method: 'get',
    params: query
  })
}

// 查询录像管理详细
export function getRecord(recordId) {
  return request({
    url: '/record/record/' + recordId,
    method: 'get'
  })
}

// 新增录像管理
export function addRecord(data) {
  return request({
    url: '/record/record',
    method: 'post',
    data: data
  })
}

// 修改录像管理
export function updateRecord(data) {
  return request({
    url: '/record/record',
    method: 'put',
    data: data
  })
}

// 删除录像管理
export function delRecord(recordId) {
  return request({
    url: '/record/record/' + recordId,
    method: 'delete'
  })
}
