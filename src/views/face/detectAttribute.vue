<template>

    <div style="margin: 20px;">

        <el-card>
            <template #header>
                <div class="card-header">
                    <span>表情属性检测</span>
                </div>
            </template>

            <image-upload :limit="imageUpload.limit" :data="imageUpload.data" v-model="facePicture"/>

            <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="12">
                    <el-card>
                        <template #header>
                            <div class="card-header">
                                <span>检测区域</span>
                            </div>
                        </template>

                        <el-row v-if="drawRectUrl" style="height: 500px;overflow-y: auto;">
                            <image-preview :src="drawRectUrl" style="height: 500px;width: 100%;"/>
                        </el-row>
                        <el-empty v-else style="height: 500px;"></el-empty>

                    </el-card>
                </el-col>

                <el-col :span="12">
                    <el-card>
                        <template #header>
                            <div class="card-header">
                                <span>检测结果</span>
                            </div>
                        </template>

                        <el-table v-if="faceList.length > 0" :data="faceList" style="width: 100%;height: 500px;overflow-y: auto;">
                            <el-table-column prop="index" label="区域" align="center" fixed/>
                            <el-table-column prop="genderType" label="性别" align="center" fixed/>
                            <el-table-column prop="age" label="年龄" align="center" fixed/>
<!--                            leftEyeStatus-->
                            <el-table-column prop="leftEyeStatus" label="左眼状态" align="center" fixed/>
<!--                            rightEyeStatus-->
                            <el-table-column prop="rightEyeStatus" label="右眼状态" align="center" fixed/>
<!--                            wearingMask-->
                            <el-table-column prop="wearingMask" label="是否佩戴口罩" align="center" fixed/>
<!--                            headPose-->
                            <el-table-column prop="pitch" label="俯仰角" align="center" fixed/>
<!--                            偏航角-->
                            <el-table-column prop="roll" label="偏航角" align="center" fixed/>
                            <el-table-column prop="yaw" label="翻滚角" align="center" fixed/>
                        </el-table>

                        <el-empty v-else style="height: 500px;"></el-empty>

                    </el-card>
                </el-col>
            </el-row>

            <template #footer>
                <el-button type="primary" @click="compare">确定</el-button>
            </template>
        </el-card>
    </div>

</template>

<script setup lang="js">
import { ElMessage } from 'element-plus'
import ImageUpload from "@/components/ImageUpload/index.vue";
import ImagePreview from "@/components/ImagePreview/index.vue";
import {detectAttribute} from '@/api/face'
import { ElLoading } from 'element-plus'

let imageUpload = ref({
    data: {
        type: 'tmp'
    },
    limit: 1
})

let facePicture = ref('')
let faceList = ref([])
let drawRectUrl = ref()

// 默认检索图片
let defaultPicture = 'http://10.21.49.68:30923/ai-video-monitor-platform/tmp/ae6a4334ed614a2d96a4862e50d22247_1753103083878.jpg'
facePicture.value = defaultPicture
compare()

function compare() {
    if (facePicture.value === '') {
        ElMessage.error('请上传人脸图片')
        return
    }

    let query = {facePicture: facePicture.value}

    const loadingInstance = ElLoading.service({})
    detectAttribute(query).then(response => {
        loadingInstance.close()
        console.log(response)

        drawRectUrl.value = response.data.drawRectUrl

        if (response.code !== 200) {
            ElMessage.error('检索失败')
            return
        }

        let detectionInfoList = response.data.detectionInfoList
        faceList.value = []
        for (let i = 0;i < detectionInfoList.length;i ++ ) {
            let detectionInfo = detectionInfoList[i]
            let faceAttribute = detectionInfo.faceInfo.faceAttribute
            console.log(faceAttribute)
            let genderType = faceAttribute.genderType
            if (genderType === "FEMALE") {
                genderType = '女'
            } else {
                genderType = "男"
            }

            let age = faceAttribute.age
            let leftEyeStatus = faceAttribute.leftEyeStatus
            if (leftEyeStatus === "OPEN") {
                leftEyeStatus = "开"
            } else {
                leftEyeStatus = "闭"
            }

            let rightEyeStatus = faceAttribute.rightEyeStatus
            if (rightEyeStatus === "OPEN") {
                rightEyeStatus = "开"
            } else {
                rightEyeStatus = "闭"
            }

            let wearingMask = faceAttribute.wearingMask
            if (wearingMask === false) {
                wearingMask = "否"
            } else {
                wearingMask = "是"
            }

            let headPose = faceAttribute.headPose
            let pitch = headPose.pitch
            let roll = headPose.roll
            let yaw = headPose.yaw

            faceList.value.push({index: i + 1, genderType: genderType, age: age, leftEyeStatus: leftEyeStatus, rightEyeStatus: rightEyeStatus, wearingMask: wearingMask, pitch: pitch, roll: roll, yaw: yaw, headPose: headPose})
        }
    })
}

</script>

<style scoped lang="scss">

</style>
