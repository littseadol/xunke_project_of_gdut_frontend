<template>
    <div class="app-container">
        <el-row :gutter="20">
            <splitpanes :horizontal="appStore.device === 'mobile'" class="default-theme">

                <!--分组数据-->
                <pane size="25">
                    <el-col>
                        <div class="head-container">
                            <el-input v-model="groupName" placeholder="请输入关键字" clearable prefix-icon="Search"
                                      style="margin-bottom: 20px;width: 100%;"/>
                        </div>
                        <div class="head-container">
                            <el-tree
                                    style="height: 600px;overflow-y: auto;"
                                    :data="groupDeviceList"
                                    node-key="id"
                                    ref="treeRef"
                                    :filter-node-method="handleFilterMethod"
                                    default-expand-all
                                    @check-change="handleCheckChange"
                                    :default-checked-keys="defaultCheckedKeys"
                                    show-checkbox/>
                        </div>
                    </el-col>
                </pane>

                <!-- 摄像头数据 -->
                <pane size="75">
                    <el-card>
                        <template #header>
                            <div class="flex">
                                分屏:
                                <svg-icon :class="['flex-icon', { active: model === 1 }]"
                                          icon-class="splitOne" @click="spiltIndex(1)" class="flex-icon"/>
                                <svg-icon :class="['flex-icon', { active: model === 4 }]"
                                          icon-class="splitFour" @click="spiltIndex(4)" class="flex-icon"/>
                                <svg-icon :class="['flex-icon', { active: model === 6 }]"
                                          icon-class="splitSix" @click="spiltIndex(6)" class="flex-icon"/>
                                <svg-icon :class="['flex-icon', { active: model === 9 }]"
                                          icon-class="splitNine" @click="spiltIndex(9)" class="flex-icon"/>
                            </div>
                        </template>
                        <div style="display: flex; flex-wrap: wrap;position: relative">
                            <div
                                    :id="'video' + index"
                                    v-for="(item, index) in splitLayouts[splitShow]"
                                    :key="index"
                                    :style="getCellStyle(splitShow)"
                                    style="border: 3px solid #409EFF;margin: 1px;">

                                <RtspVideo :rtspVideo="item.src" v-if="item.src" style="width: 100%;height: 100%;"/>

                            </div>
                        </div>

                    </el-card>
                </pane>
            </splitpanes>
        </el-row>
    </div>
</template>

<script setup>
import {Splitpanes, Pane} from "splitpanes"
import "splitpanes/dist/splitpanes.css"
import useAppStore from '@/store/modules/app'
import {listGroup} from "@/api/video/group.js";
import {updateCheckStatus, getCheckedDeviceList, listAllDevice} from '@/api/device'
import layouts from "./layouts.js";
import {ElMessage} from 'element-plus'
import RtspVideo from '@/components/rtspVideo/index.vue';

const appStore = useAppStore()
const {proxy} = getCurrentInstance()
const groupName = ref("")
const treeRef = ref()
const liveUrlList = ref([])

// 变量定义
const model = ref(1);
let splitLayouts = ref(Object.assign({}, layouts));
const splitShow = ref(1)

let groupList = ref()
let deviceList = ref()
let groupDeviceList = ref()
let checkedDeviceList = ref([])
let defaultCheckedKeys = ref([])

// 获取分屏的设备列表
function getCheckedDeviceListFromApi() {
    getCheckedDeviceList().then(response => {
        checkedDeviceList.value = response.data
        console.log('返回选择的设备列表')
        console.log(response)
        let data = response.data
        let deviceIdList = []
        liveUrlList.value = []
        for (let i = 0; i < data.length; i++) {
            let device = data[i];
            deviceIdList.push(device.deviceId)
            liveUrlList.value.push(device.rtspUrl)
        }
        console.log(liveUrlList.value)
        defaultCheckedKeys.value = deviceIdList
        initSrc()
    })
}

// 监听分组名称变化
watch(groupName, (val) => {
    proxy.$refs["treeRef"].filter(val)
})

// 过滤节点
const handleFilterMethod = (value, data) => {
    if (!value) return true
    return data.label.indexOf(value) !== -1
}

function handleCheckChange(data, checkStatus) {
    if (data.type === 'device') {
        console.log(data.id, data, checkStatus)
        if (checkStatus === true) {
            checkStatus = 0
        } else {
            checkStatus = 1
        }
        let device = {deviceId: data.id, checkStatus: checkStatus}

        console.log('更新设备选中状态', device)
        updateCheckStatus(device).then(response => {
            console.log(response)
            getCheckedDeviceListFromApi()
        })
    }
}

function getCellStyle(splitMode) {
    model.value = splitMode;
    const style = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
        boxSizing: "border-box",
    };

    if (splitMode === 1) {
        style.width = "100%";
        style.height = "600px";
    } else if (splitMode === 4) {
        style.width = "49.5%";
        style.height = "400px";
        style.margin = "-2px";
    } else if (splitMode === 6) {
        style.width = "49.5%";
        style.height = "300px";
        style.margin = "-2px";
    } else if (splitMode === 9) {
        style.width = "33%";
        style.height = "280px";
        style.margin = "-2px";
    }

    return style;
}

function spiltIndex(index) {
    splitShow.value = index
}

function emptySrc() {
    for (let key in splitLayouts.value) {
        let items = splitLayouts.value[key]
        for (let i = 0; i < items.length; i++) {
            items[i].src = null
        }
    }
}

function initSrc() {
    emptySrc()
    for (let key in splitLayouts.value) {
        let items = splitLayouts.value[key]
        for (let i = 0; i < liveUrlList.value.length && i < items.length; i++) {
            items[i].src = liveUrlList.value[i]
        }
    }
    console.log(splitLayouts.value)
}

function getGroupList() {
    listGroup().then(response => {
        groupList.value = response.data
        console.log('分组列表')
        console.log(groupList.value)
        getAllDeviceList()
    })
}

function getAllDeviceList() {
    listAllDevice().then(response => {
        deviceList.value = response.data
        console.log('设备列表')
        console.log(deviceList.value)

        // 分组生成树形结构
        for (let i = 0; i < groupList.value.length; i++) {
            let group = groupList.value[i]
            group.id = group.groupId
            group.label = group.groupName
            group.value = group.groupId
            group.disabled = true
            group.type = 'group'
        }

        for (let i = 0; i < deviceList.value.length; i++) {
            let device = deviceList.value[i]
            device.id = device.deviceId
            device.parentId = device.groupId
            device.label = device.deviceName
            device.value = device.deviceId
            device.disabled = false
            device.type = 'device'
            groupList.value.push(device)
        }
        groupDeviceList.value = proxy.handleTree(groupList.value)
    })
}

onMounted(() => {
    getGroupList()
    getCheckedDeviceListFromApi()
})
</script>

<style scoped lang="scss">
.top {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.flex {
    width: 100%;
    display: flex;
    align-items: center;
}

.player-cell {
    position: relative;
    transition: border-color 0.3s ease;
}

.player-cell:hover {
    cursor: pointer;
}

.player-cell.active {
    border-color: #67C23A !important;
}

.flex-icon {
    margin-left: 10px;
}

.flex-icon {
    margin-left: 10px;
    cursor: pointer;
    font-size: 20px;
    transition: color 0.3s ease, transform 0.3s ease;
}

.flex-icon.active {
    color: #409EFF;
    transform: scale(1.2);
}

.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
</style>