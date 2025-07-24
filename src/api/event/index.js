import request from '@/utils/request'

// 查询event列表
export function listEvent(query) {
  return request({
    url: '/lab/event/list',
    method: 'get',
    params: query
  })
}

// 查询event详细
export function getEvent(eventId) {
  return request({
    url: '/lab/event/' + eventId,
    method: 'get'
  })
}

// 新增event
export function addEvent(data) {
  return request({
    url: '/lab/event',
    method: 'post',
    data: data
  })
}

// 修改event
export function updateEvent(data) {
  return request({
    url: '/lab/event',
    method: 'put',
    data: data
  })
}

// 删除event
export function delEvent(eventId) {
  return request({
    url: '/lab/event/' + eventId,
    method: 'delete'
  })
}
