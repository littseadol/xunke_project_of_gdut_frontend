import request from '@/utils/request.js'

// 上传快照
export function uploadSnapshot(data) {
	return request({
		url: '/lab/device/upload-snapshot',
		method: 'post',
		data: data
	})
}

// 新增设备
export function addDevice(data) {
	return request({
		url: '/lab/device',
		method: 'post',
		data: data
	})
}

// 修改设备
export function updateDevice(data) {
	return request({
		url: '/lab/device',
		method: 'put',
		data: data
	})
}

// 获取设备列表
export function listDevice(query) {
	return request({
		url: '/lab/device/list',
		method: 'get',
		params: query
	})
}

// 获取所有的设备列表
export function listAllDevice(query) {
	return request({
		url: '/lab/device/list-all',
		method: 'get',
		params: query
	})
}

// 删除设备
export function deleteDevice(deviceIds) {
	return request({
		url: '/lab/device/' + deviceIds,
		method: 'delete'
	})
}

// 根据设备id获取算法列表
export function getDeviceAlgorithmListByDeviceId(data) {
	console.log('根据设备id获取算法列表')
	return request({
		url: '/lab/device/get-device-algorithm-list-by-device-id',
		method: 'post',
		data: data
	})
}

// 更新设备分屏状态
export function updateCheckStatus(data) {
	console.log('更新设备分屏状态')
	return request({
		url: '/lab/device/update-check-status',
		method: 'post',
		data: data
	})
}

// 获取分屏的设备列表
export function getCheckedDeviceList() {
	console.log('获取分屏的设备列表')
	return request({
		url: '/lab/device/get-checked-device-list',
		method: 'post'
	})
}

// 添加流代理
export function addStreamProxy(data) {
	console.log('添加流代理')
	return request({
		url: '/lab/device/add-stream-proxy',
		method: 'post',
		data: data
	})
}

// 更新坐标 update-coordinate
export function updateCoordinate(data) {
	console.log('更新坐标')
	return request({
		url: '/lab/device/update-coordinate',
		method: 'put',
		data: data
	})
}