import request from '@/utils/request'

// 查询团队列表
export function listTeam(query) {
  return request({
    url: '/lab/team/list',
    method: 'get',
    params: query
  })
}

// 查询所有的团队列表
export function listAllTeam(query) {
  return request({
    url: '/lab/team/list-all',
    method: 'get',
    params: query
  })
}

// 查询团队详细
export function getTeam(teamId) {
  return request({
    url: '/lab/team/' + teamId,
    method: 'get'
  })
}

// 新增团队
export function addTeam(data) {
  return request({
    url: '/lab/team',
    method: 'post',
    data: data
  })
}

// 修改团队
export function updateTeam(data) {
  return request({
    url: '/lab/team',
    method: 'put',
    data: data
  })
}

// 删除团队
export function delTeam(teamId) {
  return request({
    url: '/lab/team/' + teamId,
    method: 'delete'
  })
}
