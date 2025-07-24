<template>

    <div style="margin: 20px;">

        <el-card>
            <template #header>
                <div class="card-header">
                    <span>人脸检索</span>
                </div>
            </template>

            <image-upload :limit="imageUpload.limit" :data="imageUpload.data" v-model="facePicture"/>

            <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="12">
                    <el-card>
                        <template #header>
                            <div class="card-header">
                                <span>检索区域</span>
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
                                <span>检索结果(相似度从0到1，1表示相似度最高)</span>
                            </div>
                        </template>

                        <el-table v-if="faceList.length > 0" :data="faceList" style="width: 100%;height: 500px;overflow-y: auto;">
                            <el-table-column prop="index" label="区域" align="center" fixed/>
                            <el-table-column prop="status" label="检索状态" align="center" fixed/>
                            <el-table-column prop="studentName" label="姓名" align="center" fixed/>
                            <el-table-column prop="facePicture" label="匹配图片" align="center" fixed>
                                <template #default="scope">
                                    <image-preview v-if="scope.row.facePicture" :src="scope.row.facePicture" style="width: 50px;height: 50px;"/>
                                </template>
                            </el-table-column>
                            <el-table-column prop="similarity" label="相似度" align="center" fixed/>
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

<script setup>
import { ElMessage } from 'element-plus'
import ImageUpload from "@/components/ImageUpload/index.vue";
import ImagePreview from "@/components/ImagePreview/index.vue";
import {searchFace} from '@/api/face'
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
    searchFace(query).then(response => {
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
            let faceSearchResults = detectionInfo.faceInfo.faceSearchResults
            if (faceSearchResults.length > 0) {
                let faceSearchResult = faceSearchResults[0]
                let similarity = faceSearchResult.similarity
                let metadata = faceSearchResult.metadata
                metadata = JSON.parse(metadata)
                let facePicture = metadata.facePicture
                let faceId = metadata.faceId
                let studentName = metadata.studentName
                console.log(similarity, facePicture)
                faceList.value.push({faceId: faceId, index: i + 1, status: '成功', similarity: similarity, facePicture: facePicture, studentName: studentName})
            } else {
                faceList.value.push({index: i + 1, status: '失败'})
            }
        }
    })
}

</script>

<style scoped lang="scss">

</style>
