import request from '@/utils/request'

// 获取counts
export function listCount() {
    return request({
        url: '/lab/common/list-count',
        method: 'get'
    })
}