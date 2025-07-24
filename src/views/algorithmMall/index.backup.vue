<template>
    <div>

        <div v-if="algorithm_list_visible">
            <el-row justify="center" style="margin-top: 20px;">
                <el-input v-model="keywords" placeholder="请输入场景关键字" style="width: 300px;" prefix-icon="Search"
                          @keyup.enter="search"></el-input>
                <!--        <el-button type="primary" @click="search" plain icon="Search">搜索</el-button>-->
            </el-row>

            <el-row style="margin-top: 20px;">
                <el-button @click="open_dialog" type="primary" style="margin-left: 10px;" plain icon="Plus">新增卡片
                </el-button>
            </el-row>

            <el-row style="margin-bottom: 20px;">
                <el-col :span="6" v-for="algorithm in algorithm_list" :key="algorithm.algorithmId"
                        style="padding-left: 10px;margin-top: 10px;">
                    <el-image :src="algorithm.picture_url" style="width: calc(100% - 10px);cursor: pointer;"
                              @click="show_algorithm_detail(algorithm)"></el-image>
                    <el-row style="margin-top: 10px;">
                        <el-text style="font-weight: bold;">{{ algorithm.algorithmName }}</el-text>
<!--                        <el-tag style="margin-right: 10px;">{{ algorithm.platform }}</el-tag>-->
                        <!--            <el-tag :style="{color: algorithm.alarm_level_color}" type="info">{{algorithm.alarm_level_name}}</el-tag>-->
<!--                        <el-tag>{{ algorithm.alarm_level_name }}</el-tag>-->
                    </el-row>
                    <el-row style="margin-top: 10px;">
                        <el-button type="primary" @click="update_algorithm_method(algorithm)" plain icon="Edit">
                            编辑卡片
                        </el-button>
                        <el-button type="primary" @click="delete_algorithm_method(algorithm)" plain icon="Delete">
                            删除卡片
                        </el-button>
                    </el-row>
                    <el-row style="margin-top: 10px;">
<!--                        <el-tag type="info" hit="hit">-->
<!--                            {{ algorithm.copywriting }}-->
<!--                        </el-tag>-->
                        <el-text style="font-size: 12px;">{{ algorithm.copywriting }}</el-text>
                    </el-row>
                </el-col>
            </el-row>

            <!-- 新增算法dialog -->
            <el-dialog title="卡片信息" v-model="dialog_visible" style="width: 500px;">
                <el-form :model="algorithm">
                    <el-form-item label="算法名称">
                        <el-input v-model="algorithm.name" placeholder="必选"></el-input>
                    </el-form-item>
                    <el-form-item label="算法英文">
                        <el-input v-model="algorithm.english_name" placeholder="必选"></el-input>
                    </el-form-item>
                    <el-form-item label="所属平台">
                        <el-select v-model="algorithm.platform" placeholder="请选择所属平台">
                            <el-option label="英伟达" value="英伟达"></el-option>
                            <el-option label="昇腾" value="昇腾"></el-option>
                            <el-option label="算能" value="算能"></el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="告警等级">
                        <el-select v-model="algorithm.alarm_level_id">
                            <el-option v-for="alarm_level in alarm_level_list" :key="alarm_level.id"
                                       :label="alarm_level.name" :value="alarm_level.id"
                            />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="卡片图片">
                        <el-upload
                                v-model:file-list="algorithm.fileList"
                                action="/dev-api/algorithm-mall/upload-picture"
                                :headers="headers"
                                :on-success="uploadSuccess"
                        >
                            <el-button type="primary" size="small">点击上传</el-button>
                            <template #tip>
                                <div class="el-upload__tip">
                                    图片为PNG格式，分辨率为325*180，大小不超过1m
                                </div>
                            </template>
                        </el-upload>
                        <el-image :src="algorithm.fileList[0].url"/>
                    </el-form-item>

                    <el-form-item label="文案内容">
                        <el-input v-model="algorithm.copywriting" type="textarea" placeholder="建议字数不超过30字"
                                  :rows="3"></el-input>
                    </el-form-item>

                    <el-row justify="center">
                        <el-button @click="dialog_visible = false" size="small">取消</el-button>
                        <el-button type="primary" size="small" @click="add_algorithm_method">提交</el-button>
                    </el-row>
                </el-form>

            </el-dialog>
        </div>

        <div v-if="algorithm_detail_visible">
            <div style="width: 100%;color: white;padding: 10px;">
                <div style="background: linear-gradient(to right, #6F87D7, #49C5EE);border-radius: 10px;padding: 20px;">
                    <div @click="back" style="cursor: pointer;"><- 返回</div>
                    <div style="margin-top: 10px;">基础准确率：复用现有模型进行测试，可达到的识别准确率</div>
                    <div>场景优化准确率：基于具体场景定制优化后，可支持的识别准确率</div>

                    <div style="font-weight: bold;font-size: 30px;margin-top: 20px;">{{ algorithm.name }}</div>
                    <div>{{ algorithm.copywriting }}</div>

                </div>
            </div>

            <div style="width: 100%;padding: 10px;">
                <div style="background-color: #F5F7FA;border-radius: 10px;padding: 20px;">
                    <div style="font-size: 30px;">在线体验</div>

                    <el-row>
                        <el-col :span="12" style="padding: 10px;">
                            <div style="background-color: white;padding: 20px;">
                                <div>
                                    <span style="font-weight: bold;">原始数据</span>
                                    <span style="margin-left: 10px;">支持自定义上传</span>
                                </div>

                                <video width="100%" controls style="margin-top: 10px;" v-if="if_video">
                                    <source :src="test_video_url" type="video/mp4">
                                </video>

                                <el-image style="width: 100%;margin-top: 10px;" :src="img_url"
                                          v-if="if_video == false"/>

                                <div style="font-size: 14px;margin-top: 10px;">
                                    请参考【算法边界】的描述上传符合此场景的图片或视频，支持上传多个文件；
                                </div>
                                <div style="font-size: 14px;">图片：支持PNG、JPG、JPEG格式, 图片大小不超过4m;
                                    视频：类型仅支持mp4格式, 大小不超过30Mb。
                                </div>

                                <div style="margin-top: 10px;">
                                    <el-button type="primary" size="small">点击上传图片、视频</el-button>
                                </div>

                                <el-row style="margin-top: 10px;">
                                    <el-col :span="8" style="padding: 5px;">
                                        <el-image :src="test_img_01_url" style="width: 100%;cursor: pointer;"
                                                  @click="change_media_type('video')"/>
                                    </el-col>
                                    <el-col :span="8" style="padding: 5px;">
                                        <el-image :src="test_img_02_url" style="width: 100%;cursor: pointer;"
                                                  @click="change_media_type('img', 2)"/>
                                    </el-col>
                                    <el-col :span="8" style="padding: 5px;">
                                        <el-image :src="test_img_03_url" style="width: 100%;cursor: pointer;"
                                                  @click="change_media_type('img', 3)"/>
                                    </el-col>
                                </el-row>

                            </div>

                        </el-col>

                        <el-col :span="12" style="padding: 10px;">
                            <div style="background-color: white;padding: 20px;">
                                <div>
                                    <span style="font-weight: bold;">算法识别结果</span>
                                    <span style="margin-left: 10px;">支持指定扫描区域绘制</span>
                                </div>

                                <video width="100%" controls style="margin-top: 10px;" v-if="if_video">
                                    <source :src="test_video_url" type="video/mp4">
                                </video>

                                <el-image style="width: 100%;margin-top: 10px;" :src="img_url"
                                          v-if="if_video == false"/>

                                <div style="margin-top: 10px;" v-if="if_video">
                                    <el-button type="primary" size="small">下载AI判断视频</el-button>
                                </div>

                                <div v-if="if_video == false" style="margin-top: 10px;">
                                    <el-row>
                                        <span>指定识别区域</span>
                                        <el-button type="primary" size="small" style="margin-left: 10px;">重置区域
                                        </el-button>
                                        <el-input type="textarea" :rows="4" style="margin-top: 10px;"/>
                                        <div style="margin-top: 10px;">
                                            <el-button type="primary" size="small">开始识别</el-button>
                                            <el-button type="primary" size="small">重置</el-button>
                                        </div>
                                    </el-row>
                                </div>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <div style="width: 100%;padding: 10px;">
                <div style="background-color: #F5F7FA;border-radius: 10px;padding: 20px;">
                    <div style="font-size: 30px;">算法边界</div>

                    <el-row>
                        <el-col :span="12" style="padding: 10px;">
                            <div style="background-color: white;padding: 20px;">
                                <span style="font-weight: bold;">有效的拍摄方式</span>
                                <span style="margin-left: 10px;">摄像头分辨率需要满足1920*1080，支持RTSP传输协议</span>
                            </div>
                        </el-col>

                        <el-col :span="12" style="padding: 10px;">
                            <div style="background-color: white;padding: 20px;">
                                <span style="font-weight: bold;">无效的拍摄方式</span>
                            </div>
                        </el-col>
                    </el-row>
                </div>
            </div>

        </div>

    </div>

</template>

<script setup lang="js">
console.log('算法商城')
import {getToken} from '@/utils/auth.js'
import {get_alarm_level_list} from '@/api/alarm_level/index.js'
import {add_algorithm, get_algorithm_list, delete_algorithm} from '@/api/algorithm_mall/index.js'
import {ElMessage, ElMessageBox} from 'element-plus'

// 从环境变量读取配置信息
let endpoint = import.meta.env.VITE_APP_MINIO_ENDPOINT
let bucket_name = import.meta.env.VITE_APP_BUCKET_NAME
let algorithm_mall_picture = import.meta.env.VITE_APP_ALGORITHM_MALL_PICTURE
let url_prefix = endpoint + '/' + bucket_name + '/' + algorithm_mall_picture + '/'
let default_picture_url = url_prefix + 'default.png'
console.log('default_picture_url', default_picture_url)
let test_video_url = url_prefix + 'test_video.mp4'
let test_img_01_url = url_prefix + 'test_img_01.png'
let test_img_02_url = url_prefix + 'test_img_02.png'
let test_img_03_url = url_prefix + 'test_img_03.png'
console.log('test_video_url', test_video_url)
console.log('test_img_01_url', test_img_01_url)
console.log('test_img_02_url', test_img_02_url)
console.log('test_img_03_url', test_img_03_url)

// 数据定义
let keywords = ref('') // 搜索关键字
let dialog_visible = ref(false) // 对话框显示标识
let algorithm_list_visible = ref(true) // 算法列表展示
let algorithm_detail_visible = ref(false) // 算法详情展示
let algorithm = ref({})
let token = getToken()
let headers = {Authorization: 'Bearer ' + token}
let alarm_level_list = ref([])
let algorithm_init = {}
let algorithm_list = ref([])
let backup_algorithm_list = []
let if_video = ref('true')
let img_url = ref('')

// 通过接口获取告警级别列表
function get_alarm_level_list_method() {
    get_alarm_level_list().then(res => {
        console.log(res)
        alarm_level_list.value = res.data

        algorithm_init = {
            name: '算法名称示例',
            english_name: 'algorithm_name_example',
            platform: '英伟达',
            alarm_level_id: alarm_level_list.value[0].id,
            copywriting: '文案示例',
            fileList: [{name: '默认图片.png', url: default_picture_url}]
        }
        algorithm.value = Object.assign({}, algorithm_init)
    })
}

get_alarm_level_list_method()

// 通过接口获取算法列表
function get_algorithm_list_method() {
    get_algorithm_list().then(res => {
        console.log(res)
        algorithm_list.value = res.data
        backup_algorithm_list = res.data
    })
}

get_algorithm_list_method()

// 事件定义

// 打开对话框
function open_dialog() {
    console.log('打开对话框')
    algorithm.value = Object.assign({}, algorithm_init); // 恢复默认设置
    dialog_visible.value = true;
}

// 图片上传成功
function uploadSuccess(response) {
    let data = response.data
    console.log(data.name)
    console.log(data.url)
    algorithm.value.fileList = [data]
}

// 新增算法
function add_algorithm_method() {
    console.log('add algorithm method')

    if (algorithm.value.name.trim() === '' || algorithm.value.english_name.trim() === '' || algorithm.value.copywriting === '') {
        ElMessage.error('请输入完整数据')
        return false
    }

    // 数据转换
    let data = Object.assign({}, algorithm.value)
    let file = data.fileList[0]
    data.picture_name = file.name
    data.picture_url = file.url
    console.log(data)

    add_algorithm(data).then(res => {
        console.log(res)
        let code = res.code
        if (code === 0) {
            ElMessage.success('提交成功')
            dialog_visible.value = false
            get_algorithm_list_method() // 重新获取列表
        } else {
            ElMessage.success('提交失败')
        }
    })
}

// 搜索
function search() {
    console.log('搜索')
    keywords.value = keywords.value.trim()
    if (keywords.value === '') {
        algorithm_list.value = Object.assign({}, backup_algorithm_list)
        return false
    }

    let result = []
    for (let i = 0; i < backup_algorithm_list.length; i++) {
        if (backup_algorithm_list[i].name.includes(keywords.value) || backup_algorithm_list[i].copywriting.includes(keywords.value)) {
            result.push(Object.assign({}, backup_algorithm_list[i]))
        }
    }
    console.log(result)
    algorithm_list.value = result
}

// 删除卡片
function delete_algorithm_method(algorithm) {
    console.log('删除卡片')
    ElMessageBox.confirm('确定要删除卡片吗?', '系统提示', {
        confirmButtonText: '确定'
    }).then(() => {
        delete_algorithm(algorithm).then((res) => {
            let code = res.code
            if (code === 0) {
                ElMessage.success('删除卡片成功')
                get_algorithm_list_method()
            } else {
                ElMessage.success('删除卡片失败')
            }
        })
    })
}

// 更新卡片信息
function update_algorithm_method(data) {
    console.log('更新卡片信息')
    console.log(data)

    data = Object.assign({}, data)

    // 数据转换
    let fileList = []
    let file = {name: data.picture_name, url: data.picture_url}
    fileList.push(file)
    data.fileList = fileList

    algorithm.value = data
    dialog_visible.value = true
}

// 显示算法详情
function show_algorithm_detail(data) {
    algorithm.value = Object.assign({}, data)
    algorithm_list_visible.value = false
    algorithm_detail_visible.value = true
}

// 返回
function back() {
    algorithm_detail_visible.value = false
    algorithm_list_visible.value = true
}

// 改变媒体类型
function change_media_type(media_type, number) {
    if (media_type === 'video') {
        if_video.value = true
    } else {
        img_url.value = url_prefix + 'test_img_0' + number + '.png'

        if_video.value = false
    }
}

</script>

<style scoped lang="scss">
.margin-top {
    margin-top: 10px;
}
.el-tag {
    white-space: normal;  /* 允许换行 */
    height: auto;         /* 高度自适应 */
    padding: 5px 5px;     /* 调整内边距 */
    display: inline-block;
}
</style>