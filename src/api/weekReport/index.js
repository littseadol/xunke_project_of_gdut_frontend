import request from '@/utils/request'

// 查询周报列表
export function listReport(query) {
  return request({
    url: '/lab/week-report/list',
    method: 'get',
    params: query
  })
}

// 查询周报详细
export function getReport(weekReportId) {
  return request({
    url: '/lab/week-report/' + weekReportId,
    method: 'get'
  })
}

// 新增周报
export function addReport(data) {
  return request({
    url: '/lab/week-report',
    method: 'post',
    data: data
  })
}

// 修改周报
export function updateReport(data) {
  return request({
    url: '/lab/week-report',
    method: 'put',
    data: data
  })
}

// 删除周报
export function delReport(weekReportId) {
  return request({
    url: '/lab/week-report/' + weekReportId,
    method: 'delete'
  })
}
