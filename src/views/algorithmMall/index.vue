<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">

            <el-form-item label="算法名称" prop="algorithmName">
                <el-input
                        v-model="queryParams.algorithmName"
                        placeholder="请输入算法名称"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="算法平台" prop="algorithmPlatform">
                <el-select v-model="queryParams.algorithmPlatform" placeholder="请选择算法平台" clearable>
                    <el-option
                            v-for="dict in algorithm_platform"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="算法文案" prop="algorithmCopywriting">
                <el-input
                        v-model="queryParams.algorithmCopywriting"
                        placeholder="请输入算法文案"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="告警等级" prop="alarmLevelId">
                <el-select v-model="queryParams.alarmLevelId" placeholder="请选择告警等级">
                    <el-option
                            v-for="item in alarmLevelOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                    />
                </el-select>
            </el-form-item>

            <el-form-item label="创建时间">
                <el-date-picker
                        style="width: 220px;"
                        v-model="daterangeCreateTime"
                        value-format="YYYY-MM-DD"
                        type="daterange"
                        range-separator="-"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                ></el-date-picker>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                        type="primary"
                        plain
                        icon="Plus"
                        @click="handleAdd"
                        v-hasPermi="['lab:algorithm:add']"
                >新增
                </el-button>
            </el-col>

            <!--      <el-col :span="1.5">-->
            <!--        <el-button-->
            <!--          type="success"-->
            <!--          plain-->
            <!--          icon="Edit"-->
            <!--          :disabled="single"-->
            <!--          @click="handleUpdate"-->
            <!--          v-hasPermi="['lab:algorithm:edit']"-->
            <!--        >修改</el-button>-->
            <!--      </el-col>-->

            <!--      <el-col :span="1.5">-->
            <!--        <el-button-->
            <!--          type="danger"-->
            <!--          plain-->
            <!--          icon="Delete"-->
            <!--          :disabled="multiple"-->
            <!--          @click="handleDelete"-->
            <!--          v-hasPermi="['lab:algorithm:remove']"-->
            <!--        >删除</el-button>-->
            <!--      </el-col>-->

            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['lab:algorithm:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

<!--        <el-table v-loading="loading" :data="algorithmList" @selection-change="handleSelectionChange">-->
<!--            <el-table-column type="selection" width="55" align="center"/>-->
<!--            <el-table-column label="算法ID" align="center" prop="algorithmId"/>-->
<!--            <el-table-column label="算法名称" align="center" prop="algorithmName"/>-->
<!--            <el-table-column label="算法平台" align="center" prop="algorithmPlatform">-->
<!--                <template #default="scope">-->
<!--                    <dict-tag :options="algorithm_platform" :value="scope.row.algorithmPlatform"/>-->
<!--                </template>-->
<!--            </el-table-column>-->
<!--            <el-table-column label="算法图片" align="center" prop="algorithmPicture" width="100">-->
<!--                <template #default="scope">-->
<!--                    <image-preview :src="scope.row.algorithmPicture" :width="50" :height="50"/>-->
<!--                </template>-->
<!--            </el-table-column>-->
<!--            <el-table-column label="算法文案" align="center" prop="algorithmCopywriting"/>-->
<!--            <el-table-column label="创建时间" align="center" prop="createTime" width="180">-->
<!--                <template #default="scope">-->
<!--                    <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>-->
<!--                </template>-->
<!--            </el-table-column>-->
<!--            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
<!--                <template #default="scope">-->
<!--                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"-->
<!--                               v-hasPermi="['lab:algorithm:edit']">修改-->
<!--                    </el-button>-->
<!--                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"-->
<!--                               v-hasPermi="['lab:algorithm:remove']">删除-->
<!--                    </el-button>-->
<!--                </template>-->
<!--            </el-table-column>-->
<!--        </el-table>-->

        <!-- 添加或修改算法对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="algorithmRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="算法名称" prop="algorithmName">
                    <el-input v-model="form.algorithmName" placeholder="请输入算法名称"/>
                </el-form-item>
                <el-form-item label="算法平台" prop="algorithmPlatform">
                    <el-select v-model="form.algorithmPlatform" placeholder="请选择算法平台">
                        <el-option
                                v-for="dict in algorithm_platform"
                                :key="dict.value"
                                :label="dict.label"
                                :value="parseInt(dict.value)"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="算法图片" prop="algorithmPicture">
                    <image-upload v-model="form.algorithmPicture" :limit="imageUploadParam.limit" :data="imageUploadParam.data"/>
                </el-form-item>
                <el-form-item label="算法文案" prop="algorithmCopywriting">
                    <el-input v-model="form.algorithmCopywriting" placeholder="请输入算法文案" type="textarea"/>
                </el-form-item>

                <el-form-item label="告警等级" prop="alarmLevelId">
                    <el-select v-model="form.alarmLevelId" placeholder="请选择告警等级">
                        <el-option
                                v-for="item in alarmLevelOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>

        <el-row style="margin-bottom: 10px;" :gutter="20">
            <el-col :span="6" v-for="algorithm in algorithmList" :key="algorithm.algorithmId"
                    style="margin-top: 10px;">

<!--                <image-preview :src="algorithm.algorithmPicture" style="width: calc(100% - 10px);"/>-->

<!--                <el-row style="margin-top: 10px;">-->
<!--                    <el-text style="font-weight: bold;">{{ algorithm.algorithmName }}</el-text>-->
<!--                </el-row>-->
<!--                <el-row style="margin-top: 10px;">-->
<!--                    <el-button type="primary" @click="handleUpdate(algorithm)" link icon="Edit">编辑卡片</el-button>-->
<!--                    <el-button type="primary" @click="handleDelete(algorithm)" link icon="Delete">删除卡片</el-button>-->
<!--                </el-row>-->
<!--                <el-row style="margin-top: 10px;">-->
<!--                    <el-text style="font-size: 12px;">{{ algorithm.algorithmCopywriting }}</el-text>-->
<!--                </el-row>-->

                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span style="font-weight: bold;">{{algorithm.algorithmName}}</span>
                        </div>
                    </template>

                    <image-preview :src="algorithm.algorithmPicture" style="width: 100%;max-height: 200px;"/>

                    <el-row style="margin-top: 10px;">
                        <el-tag><dict-tag :options="algorithm_platform" :value="algorithm.algorithmPlatform"/></el-tag>
                        <el-tag style="margin-left: 20px;">{{algorithm.alarmLevelName}}</el-tag>
                    </el-row>

                    <div style="font-size: 12px;min-height: 40px;margin-top: 10px;">{{ algorithm.algorithmCopywriting }}</div>

                    <template #footer>
                        <el-button type="primary" @click="handleExperience" link icon="Edit">在线体验</el-button>
                        <el-button type="primary" @click="handleUpdate(algorithm)" link icon="Edit">编辑算法</el-button>
                        <el-button type="primary" @click="handleDelete(algorithm)" link icon="Delete">删除算法</el-button>
                    </template>
                </el-card>

            </el-col>
        </el-row>
        <pagination
                v-show="total>0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
        />

        <!-- 在线体验对话框      -->
        <el-dialog
                fullscreen
                v-model="experienceDialogStatus"
                title="在线体验">

            <el-descriptions border direction="vertical">
                <el-descriptions-item label="基础准确率" align="center">
                    <el-tag>复用现有模型进行测试，可达到的识别准确率</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="场景优化准确率" align="center">
                    <el-tag>基于具体场景定制优化后，可支持的识别准确率</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="拍摄要求" align="center">
                    <el-tag>摄像头分辨率需要满足1920*1080，支持RTSP传输协议</el-tag>
                </el-descriptions-item>
            </el-descriptions>

            <el-row :gutter="20" style="margin-top: 20px;">
                <el-col :span="12">

                    <el-card>
                        <template #header>
                            <div class="card-header">
                                <span>原始数据</span>
                            </div>
                        </template>

                        <image-preview v-if="tempPicture" :src="tempPicture" style="width: 100%;height: 400px;" fit="contain"></image-preview>
                        <el-empty style="height: 400px;" v-else/>

                    </el-card>

                </el-col>

                <el-col :span="12">

                    <el-card>
                    <template #header>
                        <div class="card-header">
                            <span>算法识别结果</span>
                        </div>
                    </template>

                        <image-preview v-if="resultPicture" :src="resultPicture" style="width: 100%;height: 400px;" fit="contain"></image-preview>
                        <el-empty style="height: 400px;" v-else/>

                    </el-card>

                </el-col>
            </el-row>

            <image-upload style="margin-top: 20px;" :limit="tempUploadParam.limit" :data="tempUploadParam.data" v-model="tempPicture"/>

            <el-button type="primary" link style="margin-top: 20px;" icon="Switch" @click="handleIdentify">开始识别</el-button>

        </el-dialog>

    </div>
</template>

<script setup name="Algorithm">
import {listAlgorithm, getAlgorithm, delAlgorithm, addAlgorithm, updateAlgorithm} from "@/api/algorithm"
import {listAllLevel} from '@/api/alarm_level'
import ImageUpload from "@/components/ImageUpload/index.vue";
import ImagePreview from "@/components/ImagePreview/index.vue";

const {proxy} = getCurrentInstance()
const {algorithm_platform} = proxy.useDict('algorithm_platform')

const algorithmList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const daterangeCreateTime = ref([])

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 50,
        algorithmName: null,
        algorithmPlatform: null,
        algorithmPicture: null,
        algorithmCopywriting: null,
        createTime: null,
        alarmLevelId: null
    },
    rules: {
        algorithmName: [
            {required: true, message: "算法名称不能为空", trigger: "blur"}
        ],
        algorithmPlatform: [
            {required: true, message: "算法平台不能为空", trigger: "change"}
        ],
        algorithmPicture: [
            {required: true, message: "算法图片不能为空", trigger: "blur"}
        ],
        algorithmCopywriting: [
            {required: true, message: "算法文案不能为空", trigger: "blur"}
        ],
        alarmLevelId: [
            {required: true, message: "告警等级不能为空", trigger: "change"}
        ],
    }
})

const {queryParams, form, rules} = toRefs(data)

// 图片上传参数
let imageUploadParam = ref({
    data: {
        type: 'algorithm-mall-picture'
    },
    limit: 1
})

// 临时文件夹
let tempUploadParam = ref({
    data: {
        type: 'temp'
    },
    limit: 1
})

// 临时图片
let tempPicture = ref()
let resultPicture = ref()

// 告警等级列表
let alarmLevelOptions = ref([])

// 在线体验对话框
let experienceDialogStatus = ref(false)

/** 查询算法列表 */
function getList() {
    loading.value = true
    queryParams.value.params = {}
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }
    listAlgorithm(queryParams.value).then(response => {
        algorithmList.value = response.rows
        total.value = response.total
        loading.value = false
    })
}

// 取消按钮
function cancel() {
    open.value = false
    reset()
}

// 表单重置
function reset() {
    form.value = {
        algorithmId: null,
        algorithmName: null,
        algorithmPlatform: null,
        algorithmPicture: null,
        algorithmCopywriting: null,
        createTime: null
    }
    proxy.resetForm("algorithmRef")
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    daterangeCreateTime.value = []
    proxy.resetForm("queryRef")
    handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.algorithmId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加算法"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const _algorithmId = row.algorithmId || ids.value
    getAlgorithm(_algorithmId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改算法"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["algorithmRef"].validate(valid => {
        if (valid) {
            if (form.value.algorithmId != null) {
                updateAlgorithm(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addAlgorithm(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功")
                    open.value = false
                    getList()
                })
            }
        }
    })
}

/** 删除按钮操作 */
function handleDelete(row) {
    const _algorithmIds = row.algorithmId || ids.value
    proxy.$modal.confirm('是否确认删除算法？').then(function () {
        return delAlgorithm(_algorithmIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('lab/algorithm/export', {
        ...queryParams.value
    }, `algorithm_${new Date().getTime()}.xlsx`)
}

// 获取所有的告警等级列表
function getAllLevelList() {
    listAllLevel().then(response => {
        console.log(response)
        let data = response.data
        for (let i = 0;i < data.length;i ++ ) {
            let item = data[i]
            let value = item.alarmLevelId
            let label = item.alarmLevelName
            alarmLevelOptions.value.push({value: value, label: label})
        }
    })
}

// 开始识别
function handleIdentify() {
    resultPicture.value = tempPicture.value
}

// 在线体验
function handleExperience() {
    console.log('在线体验')
    tempPicture.value = null
    resultPicture.value = null
    experienceDialogStatus.value = true
}

getList()
getAllLevelList()
</script>

<style scoped lang="scss">
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