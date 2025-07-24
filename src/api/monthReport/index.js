import request from '@/utils/request'

// 查询月报列表
export function listMonthReport(query) {
  return request({
    url: '/lab/month-report/list',
    method: 'get',
    params: query
  })
}

// 查询月报详细
export function getMonthReport(monthReportId) {
  return request({
    url: '/lab/month-report/' + monthReportId,
    method: 'get'
  })
}

// 新增月报
export function addMonthReport(data) {
  return request({
    url: '/lab/month-report',
    method: 'post',
    data: data
  })
}

// 修改月报
export function updateMonthReport(data) {
  return request({
    url: '/lab/month-report',
    method: 'put',
    data: data
  })
}

// 删除月报
export function delMonthReport(monthReportId) {
  return request({
    url: '/lab/month-report/' + monthReportId,
    method: 'delete'
  })
}
