<template>
    <div>
        <div id="mapContainer" style="position: relative;">
            <div style="margin-left: 80px;margin-top: 20px;width: 400px;position: absolute;z-index: 100;">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            摄像头数量：{{deviceList.length}}
                        </div>
                    </template>

                    <div>

                        <el-form label-width="auto" v-model="form">
                            <el-form-item label="关键字">
                                <el-input placeholder="请输入关键字搜索摄像头" v-model="form.keyword"
                                          :prefix-icon="Search"
                                          style="width: 100%;"/>
                            </el-form-item>

                            <el-table :data="deviceList" :show-header="form.showHeader"
                                      style="height: 500px;overflow-y: auto;">


                                <el-table-column fixed align="right" width="80px;">
                                    <template #default="scope">
                                        <VideoCamera style="width: 25px;margin-right: 10px;margin-top: 5px;"/>
                                    </template>
                                </el-table-column>

                                <el-table-column label="地点" fixed align="left">
                                    <template #default="scope">
                                        {{ scope.row.deviceName }}
                                    </template>
                                </el-table-column>

                                <el-table-column label="操作" fixed width="100px;" align="center">
                                    <template #default="scope">
                                        <el-button type="primary" link icon="Edit"
                                                   @click="handleSelectDevice(scope.row)">选择
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-form>

                    </div>

                </el-card>

                <el-dialog v-model="videoDialogStatus" :title="videoDialogTitle">
                    <RtspVideo :rtspVideo="liveUrl"/>
                </el-dialog>
            </div>
        </div>

    </div>
</template>

<script setup>
import {onMounted, onUnmounted} from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import {Search, VideoCamera} from "@element-plus/icons-vue";
import {listAllDevice} from '@/api/device'
import RtspVideo from '@/components/rtspVideo/index.vue';

const {proxy} = getCurrentInstance()
let map = null;
let form = ref({
    keyword: null,
    showHeader: false
})
let defaultDeviceList = []
let deviceList = ref([])
let liveUrl = ref()

let videoDialogStatus = ref(false)
let videoDialogTitle = ref('播放视频')

// 初始化地图
function initMap() {
    window._AMapSecurityConfig = {
        securityJsCode: "30cd7975b0d3ced1a39a61801ac3729a",
    };
    AMapLoader.load({
        key: "73d774f61b59b68ad2ed8c6ddffbfb1e", // 申请好的Web端开发者Key，首次调用 load 时必填
        // version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
            .then((AMap) => {
                map = new AMap.Map("mapContainer", {
                    // 设置地图容器id
                    // viewMode: "2D", // 是否为3D地图模式
                    // zoom: 11, // 初始化地图级别
                    center: [113.4014, 23.043647], // 初始化地图中心点位置
                });

                initWidget()
                watchKeyword()
                getAllDeviceList()

            })
            .catch((e) => {
                console.log(e);
            });
}

// 初始化控件
function initWidget() {
    //缩放控件
    AMap.plugin('AMap.ToolBar', function () {
        var toolbar = new AMap.ToolBar(); //缩放工具条实例化
        map.addControl(toolbar); //添加控件
    });

    // 比例尺控件 AMap.Scale
    AMap.plugin('AMap.Scale', function () {
        var scale = new AMap.Scale(); //缩放工具条实例化
        map.addControl(scale); //添加控件
    });

    // 图层切换控件 AMap.MapType
    AMap.plugin('AMap.MapType', function () {
        var mapType = new AMap.MapType(); //缩放工具条实例化
        map.addControl(mapType); //添加控件
    });
}

// 监听关键字变化
function watchKeyword() {
    watch(() => form.value.keyword, (newValue, oldValue) => {
        console.log(`count从${oldValue}变为${newValue}`)
        deviceList.value = defaultDeviceList.filter((item) => item.deviceName.includes(newValue));
    })
}

// 选择坐标
function handleSelectDevice(row) {
    console.log('选择设备')
    console.log(row)
    let device = row
    if (device.deviceLng == null) {
        proxy.$modal.msgError("当前设备未设置坐标")
        return
    }
    map.panTo([device.deviceLng, device.deviceLat])
}

// 获取所有的设备列表
function getAllDeviceList() {
    listAllDevice().then(response => {
        console.log(response)
        deviceList.value = response.data
        defaultDeviceList = response.data
        initMarker()
    })
}

// 初始化marker
function initMarker() {
    initLabelMarker()
}

function initLabelMarker() {
    const labelsLayer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: true, //该层内标注是否避让
        allowCollision: true, //不同标注层之间是否避让
    });

    //设置一个图标对象
    const icon = {
        type: "image", //图标类型，现阶段只支持 image 类型
        image: "http://10.21.49.68:30923/ai-video-monitor-platform/icon/camera.png?", //可访问的图片 URL
        size: [32, 32], //图片尺寸
        anchor: "center", //图片相对 position 的锚点，默认为 bottom-center
    };

    //设置文字对象
    const text = {
        content: "中邮速递易", //要展示的文字内容
        direction: "right", //文字方向，有 icon 时为围绕文字的方向，没有 icon 时，则为相对 position 的位置
        offset: [0, 0], //在 direction 基础上的偏移量
        //文字样式
        style: {
            fontSize: 20, //字体大小
            fillColor: "blue", //字体颜色
            strokeColor: "#fff", //描边颜色
            strokeWidth: 10, //描边宽度
        },
    };

    for (let i = 0; i < deviceList.value.length; i++) {
        let device = deviceList.value[i]

        text.content = device.deviceName

        //创建 LabelMarker
        const labelMarker = new AMap.LabelMarker({
            name: "标注", //此属性非绘制文字内容，仅为标识使用
            position: [device.deviceLng, device.deviceLat],
            zIndex: 16,
            rank: 1, //避让优先级
            icon: icon, //标注图标，将 icon 对象传给 icon 属性
            text: text, //标注文本，将 text 对象传给 text 属性
            extData: device
        });

        labelMarker.on('click', function (e) {
            const device = e.target.getExtData(); // 获取存储的数据
            console.log(device)
            videoDialogTitle.value = device.deviceName

            videoDialogStatus.value = true
            liveUrl.value = device.rtspUrl
        })

        //添加一个 labelMarker
        labelsLayer.add(labelMarker);
    }

    map.add(labelsLayer);
}

onMounted(() => {
    initMap()
});

onUnmounted(() => {
    map?.destroy();
});

</script>

<style scoped lang="scss">
#mapContainer {
    width: 100%;
    height: calc(100vh - 85px);
}
</style>