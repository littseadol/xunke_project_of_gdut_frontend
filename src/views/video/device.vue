<template>
    <div class="app-container">
        <el-row :gutter="20">
            <splitpanes :horizontal="appStore.device === 'mobile'" class="default-theme">

                <!--分组数据-->
                <pane size="16">
                    <el-col>
                        <div class="head-container">
                            <el-input v-model="deptName" clearable placeholder="请输入分组名称" prefix-icon="Search"
                                      style="margin-bottom: 20px;width: 100%;"/>
                        </div>
                        <div class="head-container">
                            <el-tree ref="deptTreeRef" :data="groupList"
                                     :expand-on-click-node="false" :filter-node-method="filterNode" :props="{ label: 'label', children: 'children' }"
                                     default-expand-all highlight-current node-key="id" @node-click="handleNodeClick"/>
                        </div>
                    </el-col>
                </pane>

                <!-- 摄像头数据 -->
                <pane size="84">
                    <el-col>
                        <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams"
                                 label-width="auto">
                            <el-form-item label="摄像头名称" prop="deviceName">
                                <el-input v-model="queryParams.deviceName" clearable
                                          placeholder="请输入摄像头名称" @keyup.enter="handleQuery"/>
                            </el-form-item>
                            <el-form-item label="rtsp流地址" prop="rtspUrl">
                                <el-input v-model="queryParams.rtspUrl" clearable
                                          placeholder="请输入rtsp流地址" @keyup.enter="handleQuery"/>
                            </el-form-item>
                            <el-form-item label="识别间隔(秒)" prop="identifyInterval">
                                <el-input-number v-model="queryParams.identifyInterval"
                                                 clearable placeholder="请输入识别间隔" @keyup.enter="handleQuery"/>
                            </el-form-item>
                            <el-form-item label="报警间隔(秒)" prop="alarmInterval">
                                <el-input-number v-model="queryParams.alarmInterval"
                                                 clearable
                                                 placeholder="请输入报警间隔" @keyup.enter="handleQuery"/>
                            </el-form-item>

                            <el-form-item label="关联算法个数" prop="algorithmNumber">
                                <el-input-number v-model="queryParams.algorithmNumber"
                                                 clearable placeholder="请输入算法个数" @keyup.enter="handleQuery"/>
                            </el-form-item>

                            <el-form-item label="所属分组" prop="groupName">
                                <el-tree-select
                                        :data="groupList"
                                        v-model="queryParams.groupName"
                                        clearable
                                        placeholder="请选择所属分组"
                                        @keyup.enter="handleQuery"/>
                            </el-form-item>

                            <el-form-item label="创建时间">
                                <el-date-picker
                                        style="width: 220px;"
                                        v-model="daterangeCreateTime"
                                        end-placeholder="结束日期"
                                        range-separator="-"
                                        start-placeholder="开始日期"
                                        type="daterange"
                                        value-format="YYYY-MM-DD"
                                ></el-date-picker>
                            </el-form-item>

                            <el-form-item>
                                <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
                                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
                            </el-form-item>
                        </el-form>

                        <el-row :gutter="10" class="mb8">
                            <el-col :span="1.5">
                                <el-button v-hasPermi="['system:user:add']" icon="Plus" plain type="primary"
                                           @click="handleAdd">新增
                                </el-button>
                            </el-col>

                            <el-col :span="1.5">
                                <el-button
                                        v-hasPermi="['lab:building:edit']"
                                        :disabled="single"
                                        icon="Edit"
                                        plain
                                        type="success"
                                        @click="handleUpdate"
                                >修改
                                </el-button>
                            </el-col>

                            <el-col :span="1.5">
                                <el-button
                                        v-hasPermi="['lab:building:remove']"
                                        :disabled="multiple"
                                        icon="Delete"
                                        plain
                                        type="danger"
                                        @click="handleDelete"
                                >删除
                                </el-button>
                            </el-col>

                            <el-col :span="1.5">
                                <el-button
                                        v-hasPermi="['lab:building:export']"
                                        icon="Download"
                                        plain
                                        type="warning"
                                        @click="handleExport"
                                >导出
                                </el-button>
                            </el-col>

                            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
                        </el-row>

                        <el-table :data="deviceList" @selection-change="handleSelectionChange">

                            <el-table-column align="center" type="selection" width="55"/>

                            <el-table-column align="center" label="摄像头ID" prop="deviceId"/>
                            <el-table-column align="center" label="摄像头名称" prop="deviceName"/>

                            <el-table-column align="center" label="实况图">
                                <template #default="scope">
                                    <image-preview :height="50" :src="scope.row.snapshotUrl" :width="50"/>
                                </template>
                            </el-table-column>

                            <el-table-column align="center" label="所属分组" prop="groupName"/>
                            <el-table-column align="center" label="rtsp流地址" prop="rtspUrl"/>
                            <el-table-column align="center" label="识别间隔(秒)" prop="identifyInterval"/>
                            <el-table-column align="center" label="报警间隔(秒)" prop="alarmInterval"/>
                            <el-table-column align="center" label="关联算法个数" prop="algorithmNumber"/>

                            <el-table-column align="center" label="经纬度">
                                <template #default="scope">
                                    {{ scope.row.deviceLng }},{{ scope.row.deviceLat }}
                                </template>
                            </el-table-column>
                            <el-table-column align="center" label="创建时间" prop="createTime"/>

                            <el-table-column align="center" label="操作">
                                <template #default="scope">
                                    <el-button icon="Edit" link type="primary" @click="handleUpdate(scope.row)">
                                        修改
                                    </el-button>
                                    <el-button icon="Delete" link type="primary" @click="handleDelete(scope.row)">
                                        删除
                                    </el-button>
                                    <el-button icon="VideoPlay" link type="primary" @click="handlePlayVideo(scope.row)">
                                        播放
                                    </el-button>
                                    <el-button icon="Edit" link type="primary" @click="handleOpenMapDialog(scope.row)">
                                        坐标
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <pagination v-show="total > 0" v-model:limit="queryParams.pageSize" v-model:page="queryParams.pageNum"
                                    :total="total" @pagination="getList"/>
                    </el-col>
                </pane>
            </splitpanes>
        </el-row>

        <!-- 摄像头添加或者更新dialog -->
        <el-dialog v-model="open" :title="title" fullscreen>

            <el-row :gutter="gutter">
                <el-col :span="12">

                    <el-card style="height: 750px;">

                        <el-form ref="deviceRef" :model="form" :rules="rules" label-width="auto">

                            <el-form-item label="分组名称" prop="groupName">
                                <el-tree-select
                                        style="width: 100%;"
                                        v-model="form.groupName"
                                        :data="groupList"
                                        @node-click="clickNode"/>
                            </el-form-item>

                            <el-form-item label="摄像头名称" prop="deviceName">
                                <el-input v-model="form.deviceName" placeholder="请输入摄像头名称" style="width: 100%;"/>
                            </el-form-item>

                            <el-form-item label="RTSP流地址" prop="rtspUrl">
                                <el-input v-model="form.rtspUrl" placeholder="请输入RTSP流地址" style="width: 100%;"/>
                            </el-form-item>

                            <el-form-item label="快照" prop="snapshotUrl">

                                <el-button icon="picture" link style="margin-top: 5px;margin-bottom: 10px;" type="primary"
                                           @click="generateDeviceSnapshot">生成快照
                                </el-button>
                                <image-preview v-if="form.snapshotUrl" :src="form.snapshotUrl"
                                               style="width: 100%;height: 400px;"/>
                                <el-empty v-else style="width: 100%;height: 400px;"/>

                            </el-form-item>

                            <el-form-item label="识别间隔(秒)" prop="identifyInterval">
                                <el-input-number v-model="form.identifyInterval" placeholder="控制算法抽帧计算间隔"
                                                 style="width: 100%;"/>
                            </el-form-item>

                            <el-form-item label="告警间隔(秒)" prop="alarmInterval">
                                <el-input-number v-model="form.alarmInterval"
                                                 placeholder="控制您接收告警信息间隔，需大于等于识别间隔。" style="width: 100%;"/>
                            </el-form-item>

                        </el-form>

                    </el-card>

                </el-col>

                <el-col :span="12">

                    <el-card style="height: 750px;overflow-y: auto;">
                        <el-table :data="form.deviceAlgorithmList">

                            <el-table-column align="center" fixed label="算法名称" prop="algorithmName"/>

                            <el-table-column align="center" fixed label="开关">
                                <template #default="scope">
                                    <el-switch v-model="scope.row.status" :active-value="0" :inactive-value="1"/>
                                </template>
                            </el-table-column>

                            <el-table-column align="center" fixed label="灵敏度">
                                <template #default="scope">
                                    <el-slider v-model="scope.row.sensitivity" :max="max" :step="step"/>
                                </template>
                            </el-table-column>

                            <el-table-column align="center" fixed label="绘制快照">
                                <template #default="scope">
                                    <el-button icon="Picture" link type="primary"
                                               @click="showDeviceSnapshotDialog(scope.row)">绘制
                                    </el-button>
                                </template>
                            </el-table-column>

                            <el-table-column align="center" fixed label="设置时间">
                                <template #default="scope">
                                    <el-button icon="Setting" link type="primary"
                                               @click="showAlarmTimeDialog(scope.row)">
                                        设置
                                    </el-button>
                                </template>
                            </el-table-column>

                        </el-table>
                    </el-card>

                </el-col>

            </el-row>

            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 告警时段dialog -->
        <el-dialog v-model="timeDialogStatus" style="width: 500px;" title="告警时段">
            <el-row>
                <el-tag>告警通知仅在设定的时段内进行，且单个算法支持配置多个告警时段。</el-tag>
            </el-row>
            <div v-for="(alarmTime, index) in alarmTimes" style="margin-top: 10px;">
                <el-time-picker
                        :key="index"
                        v-model="alarmTime.value"
                        end-placeholder="结束时间"
                        format="HH:mm"
                        is-range
                        range-separator="至"
                        start-placeholder="开始时间"
                        value-format="HH:mm"/>
                <el-button icon="Delete" link style="margin-left: 10px;" type="primary" @click="deleteAlarmTime(index)">
                    删除
                </el-button>
            </div>

            <el-row style="margin-top: 10px;">
                <el-button icon="Plus" link type="primary" @click="addAlarmTime">新增时间段</el-button>
            </el-row>
        </el-dialog>

        <!-- 快照dialog -->
        <el-dialog v-model="deviceSnapshotDialogStatus" :width="canvasWidth" title="绘制快照">
            <canvas ref="canvas" width="1" @click="clickCanvas">
            </canvas>
            <el-row style="margin-top: 10px;">
                <el-tag v-for="(item, index) in pixels"
                        :key="index"
                        style="margin-right: 20px;cursor: pointer;"
                        @click="deletePixel(index)">
                    删除区域{{ index + 1 }}
                </el-tag>
            </el-row>

            <el-row style="margin-top: 10px;">
                <el-button icon="SetUp" link type="primary" @click="savePixel">保存区域</el-button>
            </el-row>
        </el-dialog>

        <el-dialog v-model="videoDialogStatus" title="视频播放">
            <RtspVideo 
            :rtspVideo="form.rtspUrl"
            :deviceId="form.deviceId"
            />
        </el-dialog>

        <!--  地图dialog      -->
        <el-dialog
                v-model="mapDialogStatus"
                fullscreen
                title="设置坐标">

            <div id="mapContainer" style="position: relative;">
                <div style="margin: 20px;width: 400px;position: absolute;z-index: 100;">
                    <el-card>
                        <template #header>
                            <div class="card-header">
                                搜索地点
                            </div>
                        </template>

                        <div>

                            <el-form ref="mapRef" :model="mapForm" :rules="mapRules" label-width="auto">
                                <el-form-item label="关键字">
                                    <el-input v-model="mapForm.mapKeyword" :prefix-icon="Search"
                                              placeholder="请输入关键字搜索地点"/>
                                </el-form-item>

                                <el-table :data="mapForm.tips" :show-header="showHeader">
                                    <el-table-column fixed label="地点" prop="name"/>
                                    <el-table-column fixed label="操作" width="100px;">
                                        <template #default="scope">
                                            <el-button icon="Edit" link type="primary"
                                                       @click="handleSelectCoordinate(scope.row)">选择
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>

                                <el-form-item label="经度" prop="deviceLng" style="margin-top: 10px;">
                                    <el-input v-model="mapForm.deviceLng" placeholder="请输入经度"/>
                                </el-form-item>

                                <el-form-item label="纬度" prop="deviceLat" style="margin-top: 10px;">
                                    <el-input v-model="mapForm.deviceLat" placeholder="请输入纬度"/>
                                </el-form-item>

                                <el-form-item>
                                    <el-button type="primary" @click="handleUpdateCoordinate">确定</el-button>
                                    <el-button @click="mapDialogStatus = false">取消</el-button>
                                </el-form-item>

                            </el-form>

                        </div>

                    </el-card>
                </div>
            </div>

        </el-dialog>

    </div>

</template>

<script setup>
import useAppStore from '@/store/modules/app'
import {listAllAlgorithm} from '@/api/algorithm'
import {
    addDevice,
    deleteDevice,
    getDeviceAlgorithmListByDeviceId,
    listDevice,
    updateCoordinate,
    updateDevice,
    uploadSnapshot
} from '@/api/device/index.js'
import {getGroupTree, listGroup} from '@/api/video/group.js'
import {Pane, Splitpanes} from "splitpanes"
import "splitpanes/dist/splitpanes.css"
import ImagePreview from "@/components/ImagePreview/index.vue";
import {Search} from "@element-plus/icons-vue";
import {onMounted, onUnmounted} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import RtspVideo from '@/components/rtspVideo/index.vue'

const currentDeviceId = ref() // 你的设备ID
const appStore = useAppStore()
const {proxy} = getCurrentInstance()

const open = ref(false)
const showSearch = ref(true)
const total = ref(0)
const title = ref("")
const deptName = ref("")
const deptOptions = ref(undefined)

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10
    },
    rules: {
        groupName: [{required: true, message: "分组名称不能为空", trigger: "blur"}],
        deviceName: [{required: true, message: "摄像头名称不能为空", trigger: "blur"}],
        rtspUrl: [{required: true, message: "rtsp流地址不能为空", trigger: "blur"}],
        snapshotUrl: [{required: true, message: "快照不能为空", trigger: "blur"}],
        identifyInterval: [{required: true, message: "识别间隔不能为空", trigger: "blur"}],
        alarmInterval: [{required: true, message: "告警间隔不能为空", trigger: "blur"}],
    }
})

const {queryParams, form, rules} = toRefs(data)

// 滑块显示内容
let max = ref(1)
let step = ref(0.01)

// 时间选择器
let timeDialogStatus = ref(false)

// 设备的算法列表
let deviceAlgorithmListDefault = []

// 标注
let deviceSnapshotDialogStatus = ref(false)

// 获取canvas元素
const canvas = ref()
let canvasWidth = ref(600)

// 用于暂时存放当前编辑的区域
let pixel = []

// 图像数据
let imageData = null

let pixels = ref()
let alarmTimes = []

// 设备列表
let deviceList = ref([])

// 视频dialog标识
let videoDialogStatus = ref(false)

// 选择的分组
let groupData = ref()
let groupList = ref()

// el-row gutter
let gutter = ref(20)

// 创建时间查询
const daterangeCreateTime = ref([])

// 多选操作
let ids = ref([])
let single = ref(true)
let multiple = ref(true)

// 地图dialog
let mapDialogStatus = ref(false)

let map = null; //地图
let autoComplete = null; // 搜索
let mapForm = ref({ // 地图表单
    mapKeyword: null, // 搜索关键字
    deviceLng: null, // 经度
    deviceLat: null, // 纬度
    tips: [] //搜索结果
})
let showHeader = ref(false) // 是否显示表头

// 地图表单规则
let mapRules = ref({
    deviceLng: [{required: true, message: "经度不能为空", trigger: "blur"}],
    deviceLat: [{required: true, message: "纬度不能为空", trigger: "blur"}],
})


// 新增告警时间
function addAlarmTime() {
    alarmTimes.push({value: ['08:00', '09:00']})
}

// 删除告警时间
function deleteAlarmTime(index) {
    alarmTimes.splice(index, 1)
}

// 显示告警时间弹出框
function showAlarmTimeDialog(row) {
    console.log(row)
    alarmTimes = row.alarmTimes
    timeDialogStatus.value = true
}

// 生成快照
function generateDeviceSnapshot() {
    if (form.value.rtspUrl == null) {
        proxy.$modal.msgError("rtsp流地址不能为空")
        return
    }
    changeFormListToString()
    uploadSnapshot(form.value).then((response) => {
        console.log(response)
        if (response.code === 200) {
            proxy.$modal.msgSuccess("快照上传成功")
            form.value.snapshotUrl = response.data
        } else {
            proxy.$modal.msgError("快照上传失败")
        }
    })
}

// 展示摄像头快照弹出框
function showDeviceSnapshotDialog(row) {
    console.log(form.value.snapshotUrl)
    if (form.value.snapshotUrl === null) {
        proxy.$modal.msgError("请生成快照")
        return
    }
    pixels.value = row.pixels
    deviceSnapshotDialogStatus.value = true

    // 注意canvas必须可视化之后才能被看到
    window.setTimeout(function () {
        initCanvas()
    }, 0.1)
}

// 初始化画布
function initCanvas() {
    let ctx = canvas.value.getContext('2d')
    if (imageData !== null) {
        // ctx.putImageData(device.value.imageData, 0, 0)
        pixel = []
        drawPixels()
    } else {
        // 创建图片对象
        const img = new Image();
        img.src = form.value.snapshotUrl

        // 解决getImageData跨域问题
        img.src = img.src + '?' + new Date().getTime();
        img.setAttribute('crossOrigin', '');

        // 确保图片加载完成后再绘制
        img.onload = function () {
            // 绘制图片到 Canvas 上

            // 在图片的宽度加上30px
            canvasWidth.value = img.naturalWidth + 30

            canvas.value.width = img.naturalWidth
            canvas.value.height = img.naturalHeight

            ctx.drawImage(img, 0, 0, canvas.value.width, canvas.value.height)

            // 保存图片数据
            imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height)

            pixel = []
            drawPixels()
        }
    }
}

// 绘制多个区域
function drawPixels() {
    let ctx = canvas.value.getContext('2d');
    ctx.putImageData(imageData, 0, 0) //加载图片数据

    // let pixels = deviceAlgorithm.pixels
    for (let i = 0; i < pixels.value.length; i++) {
        ctx.fillText(i + 1, pixels.value[i][0].x - 10, pixels.value[i][0].y);
        drawPixel(pixels.value[i])
    }
    drawPixel(pixel)
}

// 绘制一个区域
function drawPixel(pixel) {
    let ctx = canvas.value.getContext('2d');
    for (let i = 0; i < pixel.length; i++) {
        ctx.fillStyle = 'red'
        ctx.beginPath()
        ctx.arc(pixel[i].x, pixel[i].y, 3, 0, 2 * Math.PI);
        ctx.closePath()
        ctx.fill();
    }

    if (pixel.length < 2) {
        return
    }

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(pixel[0].x, pixel[0].y);

    for (let i = 1; i < pixel.length; i++) {
        ctx.lineTo(pixel[i].x, pixel[i].y);
    }

    ctx.closePath();
    ctx.stroke()
}

// 保存区域
function savePixel() {
    if (pixel.length < 3) {
        return
    }
    pixels.value.push(Object.assign([], pixel))
    pixel = []
    drawPixels()
}

// 删除区域
function deletePixel(index) {
    pixels.value.splice(index, 1)
    drawPixels()
}

// 点击canvas
function clickCanvas(event) {

    // 得到点击的像素点
    const rect = canvas.value.getBoundingClientRect();
    const scaleX = canvas.value.width / rect.width;
    const scaleY = canvas.value.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    pixel.push({x: x, y: y})
    drawPixels()
}

function changeFormListToString() {
    let deviceAlgorithmList = form.value.deviceAlgorithmList
    for (let i = 0; i < deviceAlgorithmList.length; i++) {
        let deviceAlgorithm = deviceAlgorithmList[i]
        if (Array.isArray(deviceAlgorithm.pixels)) {
            deviceAlgorithm.pixels = JSON.stringify(deviceAlgorithm.pixels)
        }
        if (Array.isArray(deviceAlgorithm.alarmTimes)) {
            deviceAlgorithm.alarmTimes = JSON.stringify(deviceAlgorithm.alarmTimes)
        }
    }
}

// 提交代码
function submitForm() {
    console.log('submit form')
    proxy.$refs["deviceRef"].validate(valid => {
        console.log(valid)

        if (valid) {

            changeFormListToString()

            if (form.value.deviceId != null) {
                updateDevice(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addDevice(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功")
                    open.value = false
                    getList()
                })
            }
        }
    })
}

// 获取算法列表
function getAllAlgorithmList() {
    listAllAlgorithm().then(response => {
        let data = response.data
        for (let i = 0; i < data.length; i++) {
            let item = {}
            item.algorithmId = data[i].algorithmId
            item.algorithmName = data[i].algorithmName
            item.status = 1
            item.sensitivity = 0.5
            item.pixels = []
            item.alarmTimes = []
            deviceAlgorithmListDefault.push(item)
        }
    })
}

// 获取设备列表
function getList() {
    console.log(queryParams.value)

    queryParams.value.params = {}
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }

    listDevice(queryParams.value).then(response => {
        console.log(response)
        deviceList.value = response.rows
        total.value = response.total
    })
}

// 展示视频dialog
function handlePlayVideo(row) {
    videoDialogStatus.value = true
    form.value = row
}

// 点击节点
function clickNode(node) {
    form.value.groupId = node.id
}

// 处理删除设备
function handleDelete(row) {
    let data = null;
    if (row.deviceId) {
        data = row.deviceId
    } else {
        data = ids.value
    }
    proxy.$modal.confirm('是否确认删除摄像头？').then(function () {
        deleteDevice(data).then(response => {
            console.log(response)
            let code = response.code
            if (code === 200) {
                proxy.$modal.msgSuccess("删除成功")
                handleQuery()
            } else {
                proxy.$modal.msgError("删除失败")
            }
        })
    }).catch(() => {

    })
}

// 处理更新设备
function handleUpdate(row) {
    title.value = '修改摄像头'

    if (row.deviceId) {
        form.value = row
    }

    getDeviceAlgorithmListByDeviceId(form.value).then(response => {
        form.value.deviceAlgorithmList = Object.assign([], response.data)

        // 字符串转数组
        for (let i = 0; i < form.value.deviceAlgorithmList.length; i++) {
            let deviceAlgorithm = form.value.deviceAlgorithmList[i]
            deviceAlgorithm.pixels = JSON.parse(deviceAlgorithm.pixels)
            deviceAlgorithm.alarmTimes = JSON.parse(deviceAlgorithm.alarmTimes)
        }
        open.value = true
    })
}

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
    if (!value) return true
    return data.label.indexOf(value) !== -1
}

/** 根据名称筛选分组树 */
watch(deptName, val => {
    proxy.$refs["deptTreeRef"].filter(val)
})

/** 节点单击事件 */
function handleNodeClick(node) {
    if (node.children && node.children.length) {
        return false
    }
    queryParams.value.groupId = node.id
    handleQuery()
}

/** 搜索按钮操作 */
function handleQuery() {
    // 搜索的时候重置为第1页
    queryParams.value.pageNum = 1
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    queryParams.value = {}
    queryParams.value.pageNum = 1
    queryParams.value.pageSize = 10
    getList()
}

/** 取消按钮 */
function cancel() {
    open.value = false
}

/** 新增按钮操作 */
function handleAdd() {
    title.value = "添加摄像头"
    open.value = true
    form.value = {
        groupId: null,
        groupName: null,
        deviceName: null,
        rtspUrl: null,
        snapshotUrl: null,
        identifyInterval: null,
        alarmInterval: null,
        deviceAlgorithmList: Object.assign([], deviceAlgorithmListDefault)
    }
}

// 多选框选中数据
function handleSelectionChange(selection) {
    if (selection.length > 0) {
        form.value = selection[0]
    }
    ids.value = selection.map(item => item.deviceId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/lab/device/export', {
        ...queryParams.value
    }, `设备_${new Date().getTime()}.xlsx`)
}

// 打开地图dialog
function handleOpenMapDialog(row) {
    mapForm.value = {}
    mapForm.value.deviceId = row.deviceId
    mapForm.value.mapKeyword = null
    mapForm.value.deviceLng = row.deviceLng
    mapForm.value.deviceLat = row.deviceLat
    mapForm.value.tips = []

    mapDialogStatus.value = true
    if (map == null) {
        initMap()
    }
}

// 初始化地图
function initMap() {
    window._AMapSecurityConfig = {
        securityJsCode: "30cd7975b0d3ced1a39a61801ac3729a",
    };
    AMapLoader.load({
        key: "73d774f61b59b68ad2ed8c6ddffbfb1e", // 申请好的Web端开发者Key，首次调用 load 时必填
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
            .then((AMap) => {
                map = new AMap.Map("mapContainer", {
                    // 设置地图容器id
                    // viewMode: "3D", // 是否为3D地图模式
                    zoom: 11, // 初始化地图级别
                    center: [113.4014, 23.043647], // 初始化地图中心点位置
                });

                initWidget()
                watchMapKeyword()

            })
            .catch((e) => {
                console.log(e);
            });
}

// 初始化控件
function initWidget() {
    //缩放控件
    AMap.plugin('AMap.ToolBar', function () {
        var toolbar = new AMap.ToolBar({position: 'RB', offset: [20, 60]}); //缩放工具条实例化
        map.addControl(toolbar); //添加控件
    });

    // 比例尺控件 AMap.Scale
    AMap.plugin('AMap.Scale', function () {
        var scale = new AMap.Scale(); //缩放工具条实例化
        map.addControl(scale); //添加控件
    });

    // 定位控件AMap.Geolocation
    AMap.plugin('AMap.Geolocation', function () {
        var geolocation = new AMap.Geolocation({position: 'RB', offset: [20, 20]}); //缩放工具条实例化
        map.addControl(geolocation); //添加控件
    });

    // 图层切换控件 AMap.MapType
    AMap.plugin('AMap.MapType', function () {
        var mapType = new AMap.MapType(); //缩放工具条实例化
        map.addControl(mapType); //添加控件
    });

    //异步加载 AutoComplete 插件
    AMap.plugin("AMap.AutoComplete", function () {
        var autoOptions = {
            //city 限定城市，默认全国
            city: "全国"
        };
        //实例化AutoComplete
        autoComplete = new AMap.AutoComplete(autoOptions);
    });
}

// 搜索
function searchMap(mapKeyword) {
    //根据关键字进行搜索 keyword 为搜索的关键词
    autoComplete.search(mapKeyword, function (status, result) {
        //搜索成功时，result 即是对应的匹配数据
        mapForm.value.tips = result.tips

    });
}

// 监听关键字变化
function watchMapKeyword() {
    watch(() => mapForm.value.mapKeyword, (newValue, oldValue) => {
        searchMap(mapForm.value.mapKeyword)
    })
}

// 选择坐标
function handleSelectCoordinate(row) {
    console.log('选择坐标')
    console.log(row)
    let location = row.location
    if (location === undefined) {
        proxy.$modal.msgError("查找不到坐标")
        return
    }
    mapForm.value.deviceLng = location.lng
    mapForm.value.deviceLat = location.lat
    console.log(mapForm.value)
}

// 更新坐标
function handleUpdateCoordinate() {
    console.log('更新坐标')
    proxy.$refs["mapRef"].validate(valid => {
        if (valid) {
            updateCoordinate(mapForm.value).then(response => {
                if (response.code === 200) {
                    proxy.$modal.msgSuccess("更新坐标成功")
                    mapDialogStatus.value = false
                    getList()
                } else {
                    proxy.$modal.msgError("更新坐标失败")
                }
            })
        }
    })
}

// 获得分组列表
function getGroupList() {
    listGroup().then(response => {
        console.log(response)
        let data = response.data
        for (let i = 0;i < data.length;i ++ ) {
            data[i].value = data[i].groupName
            data[i].label = data[i].groupName
            data[i].id = data[i].groupId
        }
        groupList.value = proxy.handleTree(data)
        console.log(groupList.value)
    })
}

onMounted(() => {
    getAllAlgorithmList() // 获取算法列表
    getList()
    getGroupList()
})

onUnmounted(() => {
    map?.destroy();
});
</script>

<style lang="scss" scoped>
#mapContainer {
    width: 100%;
    height: calc(100vh - 85px);
}

.el-input {
    width: 200px;
}

.el-select {
    width: 200px;
}

.el-input-number {
    width: 200px;
}
</style>