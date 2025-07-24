import request from '@/utils/request'

// 查询房间列表
export function listRoom(query) {
  return request({
    url: '/lab/room/list',
    method: 'get',
    params: query
  })
}

// 查询所有房间列表
export function listAllRoom() {
  return request({
    url: '/lab/room/list-all',
    method: 'get'
  })
}

// 查询所有未关联的房间
export function listAllUnrelatedRoom() {
  return request({
    url: '/lab/room/list-all-unrelated',
    method: 'get'
  })
}

// 查询房间详细
export function getRoom(roomId) {
  return request({
    url: '/lab/room/' + roomId,
    method: 'get'
  })
}

// 新增房间
export function addRoom(data) {
  return request({
    url: '/lab/room',
    method: 'post',
    data: data
  })
}

// 绑定团队
export function bindTeam(data) {
  return request({
    url: '/lab/room/bind-team',
    method: 'post',
    data: data
  })
}

// 修改房间
export function updateRoom(data) {
  return request({
    url: '/lab/room',
    method: 'put',
    data: data
  })
}

// 删除房间
export function delRoom(roomId) {
  return request({
    url: '/lab/room/' + roomId,
    method: 'delete'
  })
}
