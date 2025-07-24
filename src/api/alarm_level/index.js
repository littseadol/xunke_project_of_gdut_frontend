import request from '@/utils/request'

// 查询level列表
export function listLevel(query) {
  return request({
    url: '/lab/alarm-level/list',
    method: 'get',
    params: query
  })
}

// 查询所有level列表
export function listAllLevel() {
  return request({
    url: '/lab/alarm-level/list-all',
    method: 'get'
  })
}

// 查询level详细
export function getLevel(alarmLevelId) {
  return request({
    url: '/lab/alarm-level/' + alarmLevelId,
    method: 'get'
  })
}

// 新增level
export function addLevel(data) {
  return request({
    url: '/lab/alarm-level',
    method: 'post',
    data: data
  })
}

// 修改level
export function updateLevel(data) {
  return request({
    url: '/lab/alarm-level',
    method: 'put',
    data: data
  })
}

// 删除level
export function delLevel(alarmLevelId) {
  return request({
    url: '/lab/alarm-level/' + alarmLevelId,
    method: 'delete'
  })
}
