<template>
  <div class="app-container home">

      <el-row :gutter="20">
          <el-col :span="6">
              <el-card>

                  <el-row :gutter="20">
                      <el-col :span="12">
                          <ShoppingCart style="width: 50px;height: 50px;"/>
                      </el-col>
                      <el-col :span="12">
                          <el-row justify="center">算法商城</el-row>
                          <el-row justify="center" style="margin-top: 10px;">
                              <el-text type="primary" class="count-font-size">{{countData.algorithmCount}}</el-text>
                          </el-row>
                      </el-col>
                  </el-row>

              </el-card>
          </el-col>

          <el-col :span="6">

              <el-card>

                  <el-row :gutter="20">
                      <el-col :span="12">
                          <OfficeBuilding style="width: 50px;height: 50px;"/>
                      </el-col>
                      <el-col :span="12">
                          <el-row justify="center">楼栋</el-row>
                          <el-row justify="center" style="margin-top: 10px;">
                              <el-text type="primary" class="count-font-size">{{countData.buildingCount}}</el-text>
                          </el-row>
                      </el-col>
                  </el-row>

              </el-card>


          </el-col>

          <el-col :span="6">

              <el-card>

                  <el-row :gutter="20">
                      <el-col :span="12">
                          <House style="width: 50px;height: 50px;"/>
                      </el-col>
                      <el-col :span="12">
                          <el-row justify="center">房间</el-row>
                          <el-row justify="center" style="margin-top: 10px;">
                              <el-text type="primary" class="count-font-size">{{countData.roomCount}}</el-text>
                          </el-row>
                      </el-col>
                  </el-row>

              </el-card>

          </el-col>

          <el-col :span="6">

              <el-card>

                  <el-row :gutter="20">
                      <el-col :span="12">
                          <User style="width: 50px;height: 50px;"/>
                      </el-col>
                      <el-col :span="12">
                          <el-row justify="center">团队</el-row>
                          <el-row justify="center" style="margin-top: 10px;">
                              <el-text type="primary" class="count-font-size">{{countData.teamCount}}</el-text>
                          </el-row>
                      </el-col>
                  </el-row>

              </el-card>

          </el-col>

      </el-row>

      <el-row :gutter="20" style="margin-top: 10px;">
          <el-col :span="6">

              <el-card>

                  <el-row :gutter="20">
                      <el-col :span="12">
                          <VideoCamera style="width: 50px;height: 50px;"/>
                      </el-col>
                      <el-col :span="12">
                          <el-row justify="center">摄像头</el-row>
                          <el-row justify="center" style="margin-top: 10px;">
                              <el-text type="primary" class="count-font-size">{{countData.deviceCount}}</el-text>
                          </el-row>
                      </el-col>
                  </el-row>

              </el-card>

          </el-col>

          <el-col :span="6">

              <el-card>

                  <el-row :gutter="20">
                      <el-col :span="12">
                          <Warning style="width: 50px;height: 50px;"/>
                      </el-col>
                      <el-col :span="12">
                          <el-row justify="center">安全隐患</el-row>
                          <el-row justify="center" style="margin-top: 10px;">
                              <el-text type="primary" class="count-font-size">{{countData.eventCount}}</el-text>
                          </el-row>
                      </el-col>
                  </el-row>

              </el-card>

          </el-col>

          <el-col :span="6">

              <el-card>

                  <el-row :gutter="20">
                      <el-col :span="12">
                          <Document style="width: 50px;height: 50px;"/>
                      </el-col>
                      <el-col :span="12">
                          <el-row justify="center">安全报告</el-row>
                          <el-row justify="center" style="margin-top: 10px;">
                              <el-text type="primary" class="count-font-size">{{countData.reportCount}}</el-text>
                          </el-row>
                      </el-col>
                  </el-row>

              </el-card>

          </el-col>

          <el-col :span="6">

              <el-card>

                  <el-row :gutter="20">
                      <el-col :span="12">
                          <Avatar style="width: 50px;height: 50px;"/>
                      </el-col>
                      <el-col :span="12">
                          <el-row justify="center">人脸库</el-row>
                          <el-row justify="center" style="margin-top: 10px;">
                              <el-text type="primary" class="count-font-size">{{countData.faceCount}}</el-text>
                          </el-row>
                      </el-col>
                  </el-row>

              </el-card>

          </el-col>

      </el-row>

      <el-row :gutter="20" style="margin-top: 10px;">

          <el-col :span="12">

              <el-card>
                  <template #header>
                      <div class="card-header">
                          <span>服务器信息</span>
                      </div>
                  </template>

                  <el-descriptions border :column="column">
                      <el-descriptions-item label="服务器名称">{{serverInfo.sys.computerName}}</el-descriptions-item>
                      <el-descriptions-item label="操作系统">{{serverInfo.sys.osName}}</el-descriptions-item>
                      <el-descriptions-item label="服务器IP">{{serverInfo.sys.computerIp}}</el-descriptions-item>
                      <el-descriptions-item label="系统架构">{{serverInfo.sys.osArch}}</el-descriptions-item>
                  </el-descriptions>

              </el-card>

          </el-col>

          <el-col :span="12">

              <el-card>
                  <template #header>
                      <div class="card-header">
                          <span>通知公告</span>
                      </div>
                  </template>

                  <el-table :data="noticeList" :show-header="showHeader">
                      <el-table-column prop="createTime" label="公告时间" width="160"/>
                      <el-table-column prop="noticeTitle" label="公告标题">
                          <template #default="scope">
                              <el-text type="primary" style="cursor: pointer;" @click="openNoticeDialog(scope.row)">{{scope.row.noticeTitle}}</el-text>
                          </template>
                      </el-table-column>
                  </el-table>

                  <pagination
                          v-show="total>0"
                          :total="total"
                          v-model:page="queryParams.pageNum"
                          v-model:limit="queryParams.pageSize"
                          @pagination="getNoticeList"
                  />

              </el-card>

          </el-col>

      </el-row>


      <el-dialog
              v-model="noticeDialogStatus"
              title="公告详情"
              width="500">

          <el-text type="primary">{{notice.noticeContent}}</el-text>

      </el-dialog>

  </div>
</template>

<script setup name="Index">
import { getServer } from '@/api/monitor/server'
import {listNotice} from '@/api/system/notice'
import {listCount} from '@/api/common'

import {
    Avatar,
    Document,
    House,
    OfficeBuilding,
    ShoppingCart,
    User,
    VideoCamera, Warning
} from "@element-plus/icons-vue";

let column = 1
let serverInfo = ref({
    sys: {
        computerName: '',
        computerIp: '',
        osArch: '',
        osName: ''
    }
})
let queryParams = ref({
    pageNum: 1,
    pageSize: 10
})
let total = ref(0)
let noticeList = ref([])
let showHeader = ref(false)
let noticeDialogStatus = ref(false)
let notice = ref()
let countData = ref({
    algorithmCount: 0,
    buildingCount: 0,
    roomCount: 0,
    teamCount: 0,
    faceCount: 0,
    deviceCount: 0,
    eventCount: 0,
    reportCount: 0
})

// 获取服务器信息
function getServerInfo() {
    getServer().then(response => {
        console.log(response)
        serverInfo.value = response.data
    })
}

// 获取公告列表
function getNoticeList() {
    listNotice(queryParams.value).then(response => {
        console.log(response)
        total.value = response.total
        noticeList.value = response.rows
        console.log(noticeList.value)
    })
}

// 打开公告详情
function openNoticeDialog(row) {
    noticeDialogStatus.value = true
    notice.value = row
}

// 获取统计数据
function getCountList() {
    listCount().then(response => {
        console.log(response)
        countData.value = response.data
    })
}

getServerInfo()
getNoticeList()
getCountList()
</script>
<style scoped lang="scss">
.count-font-size {
    font-size: 25px;
    font-weight: bold;
}
</style>