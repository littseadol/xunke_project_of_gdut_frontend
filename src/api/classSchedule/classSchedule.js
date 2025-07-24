import request from '@/utils/request'

// 查询班级课信息列表
export function listClassSchedule(query) {
  return request({
    url: '/lab/classSchedule/list',
    method: 'get',
    params: query
  })
}

// 查询班级课信息详细
export function getClassSchedule(scheduleId) {
  return request({
    url: '/lab/classSchedule/' + scheduleId,
    method: 'get'
  })
}

// 新增班级课信息
export function addClassSchedule(data) {
  return request({
    url: '/lab/classSchedule',
    method: 'post',
    data: data
  })
}

// 修改班级课信息
export function updateClassSchedule(data) {
  return request({
    url: '/lab/classSchedule',
    method: 'put',
    data: data
  })
}

// 删除班级课信息
export function delClassSchedule(scheduleId) {
  return request({
    url: '/lab/classSchedule/' + scheduleId,
    method: 'delete'
  })
}
