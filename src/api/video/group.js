import request from '@/utils/request'

// 查询分组列表
export function listGroup(query) {
  return request({
    url: '/lab/group/list',
    method: 'get',
    params: query
  })
}

// 查询分组列表（排除节点）
export function listGroupExcludeChild(groupId) {
  return request({
    url: '/lab/group/list/exclude/' + groupId,
    method: 'get'
  })
}

// 查询分组详细
export function getGroup(groupId) {
  return request({
    url: '/lab/group/' + groupId,
    method: 'get'
  })
}

// 新增分组
export function addGroup(data) {
  return request({
    url: '/lab/group',
    method: 'post',
    data: data
  })
}

// 修改分组
export function updateGroup(data) {
  return request({
    url: '/lab/group',
    method: 'put',
    data: data
  })
}

// 删除分组
export function delGroup(groupId) {
  return request({
    url: '/lab/group/' + groupId,
    method: 'delete'
  })
}

// 查询分组下拉树结构
export function getGroupTree() {
  return request({
    url: '/lab/group/get-group-tree',
    method: 'get'
  })
}

// 查询分组下拉树结构(包含设备)
export function getGroupDeviceTree() {
  return request({
    url: '/lab/group/get-group-device-tree',
    method: 'get'
  })
}