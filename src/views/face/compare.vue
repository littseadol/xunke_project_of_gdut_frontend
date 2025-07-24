<template>

    <div style="margin: 20px;">

        <el-card>
            <template #header>
                <div class="card-header">
                    <span>人脸比对</span>
                </div>
            </template>

            <image-upload :limit="imageUpload.limit" :data="imageUpload.data" v-model="facePicture"/>

            <el-row style="margin-top: 10px;" :gutter="20">
                <el-col :span="24">
                    <el-card>
                        <template #header>
                            <div class="card-header">
                                <span>比对结果</span>
                            </div>
                        </template>

                        <el-row justify="center">
                            <BaseEcharts v-if="result" :option="baseEchartsOption" style="width: 100%;height: 300px;"/>
                            <el-empty v-else style="height: 300px;"></el-empty>
                        </el-row>

                    </el-card>
                </el-col>

<!--                <el-col :span="12">-->

<!--                    <el-card>-->
<!--                        <template #header>-->
<!--                            <div class="card-header">-->
<!--                                <span>结果代码</span>-->
<!--                            </div>-->
<!--                        </template>-->

<!--                        <el-row justify="center">-->
<!--                            <el-text v-if="code" style="height: 200px;">{{code}}</el-text>-->
<!--                            <el-empty v-else style="height: 200px;"></el-empty>-->
<!--                        </el-row>-->

<!--                    </el-card>-->

<!--                </el-col>-->
            </el-row>

            <template #footer>
                <el-button type="primary" @click="compare">确定</el-button>
            </template>

        </el-card>

    </div>

</template>

<script setup>
import { ElMessage } from 'element-plus'
import ImageUpload from "@/components/ImageUpload/index.vue";
import {compareFace} from '@/api/face'
import BaseEcharts from '@/components/BaseEcharts'
import { ElLoading } from 'element-plus'

let imageUpload = ref({
    data: {
        type: 'tmp'
    },
    limit: 2
})

let facePicture = ref('')
let result = ref(null)

let baseEchartsOption = ref()

let loadingInstance = null

// 默认比对图片
let picture01 = 'http://10.21.49.68:30923/ai-video-monitor-platform/tmp/94050f2e5fd94e08a252f05dae3eb7c6_1753102653748.png'
let picture02 = 'http://10.21.49.68:30923/ai-video-monitor-platform/tmp/9f76ec1eb659475da1f6adccae7488bf_1753102817757.png'
facePicture.value = picture01 + ',' + picture02

// 默认进行比对
compare()

function compare() {
    console.log(facePicture.value)
    if (facePicture.value === '') {
        ElMessage.error('请上传两张人脸！')
        return
    }
    let facePictures = facePicture.value.split(',')
    console.log(facePictures)

    if (facePictures.length < 2) {
        ElMessage.error('请上传两张人脸！')
        return
    }

    let query = {facePicture1: facePictures[0], facePicture2: facePictures[1]}

    loadingInstance = ElLoading.service({})

    compareFace(query).then(response => {
        console.log(response)

        nextTick(() => {
            // Loading should be closed asynchronously
            loadingInstance.close()
        })

        if (response.code === 200) {
            let data = response.data
            data *= 100
            data = data.toFixed(2)
            data = parseFloat(data)
            result.value = data

            let baseEchartsData = []
            baseEchartsData.push({value: data, name: '相同的概率'})
            baseEchartsData.push({value: (100 - data).toFixed(2), name: '不同的概率'})

            baseEchartsOption.value = {
                title: {
                    text: '两图同为一人的概率' + data + '%',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left'
                },
                series: [
                    {
                        type: 'pie',
                        data: baseEchartsData
                    }
                ]
            }

        } else {
            ElMessage.error('比对人脸失败')
        }
    })
}

</script>

<style scoped lang="scss">

</style>