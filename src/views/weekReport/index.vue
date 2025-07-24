<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">

            <el-form-item label="周报编号" prop="weekReportNumber">
                <el-input
                        v-model="queryParams.weekReportNumber"
                        placeholder="请输入周报编号"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="周报评分" prop="weekReportScore">
                <el-input-number
                        v-model="queryParams.weekReportScore"
                        placeholder="请输入周报评分"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="周报内容" prop="weekReportContent">
                <el-input
                        v-model="queryParams.weekReportContent"
                        placeholder="请输入周报内容"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="所属房间" prop="roomName">
                <el-input
                        v-model="queryParams.roomName"
                        placeholder="请输入所属房间"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="所属楼层" prop="buildingFloor">
                <el-input-number
                        v-model="queryParams.buildingFloor"
                        placeholder="请输入所属楼层"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="所属楼栋" prop="buildingName">
                <el-input
                        v-model="queryParams.buildingName"
                        placeholder="请输入所属楼栋"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="所属团队" prop="teamName">
                <el-input
                        v-model="queryParams.teamName"
                        placeholder="请输入所属团队"
                        clearable
                        @keyup.enter="handleQuery"
                />
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
                        v-hasPermi="['lab:report:add']"
                >新增
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="success"
                        plain
                        icon="Edit"
                        :disabled="single"
                        @click="handleUpdate"
                        v-hasPermi="['lab:report:edit']"
                >修改
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="danger"
                        plain
                        icon="Delete"
                        :disabled="multiple"
                        @click="handleDelete"
                        v-hasPermi="['lab:report:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['lab:report:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="reportList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>

            <el-table-column label="周报ID" align="center" prop="weekReportId"/>
            <el-table-column label="周报编号" align="center" prop="weekReportNumber"/>
            <el-table-column label="所属房间" align="center" prop="roomName"/>
            <el-table-column label="所属楼层" align="center" prop="buildingFloor"/>
            <el-table-column label="所属楼栋" align="center" prop="buildingName"/>
            <el-table-column label="所属团队" align="center" prop="teamName"/>
            <el-table-column label="周报评分" align="center" prop="weekReportScore"/>
            <el-table-column label="创建时间" align="center" prop="createTime"></el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Aim" @click="handleView(scope.row)">查看</el-button>
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['lab:report:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['lab:report:remove']">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination
                v-show="total>0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
        />

        <!-- 添加或修改周报对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="reportRef" :model="form" :rules="rules" label-width="auto">
                <el-form-item label="周报评分" prop="weekReportScore">
                    <el-input-number v-model="form.weekReportScore" placeholder="请输入周报评分" style="width: 100%;"/>
                </el-form-item>
                <el-form-item label="周报内容" prop="weekReportContent">
                    <el-input v-model="form.weekReportContent" type="textarea" rows="10" placeholder="请输入周报内容"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog
                v-model="mdDialogStatus"
                title="周报内容"
                fullscreen="fullscreen">
            <div v-html="mdResult"></div>
        </el-dialog>

    </div>
</template>

<script setup name="Report">
import {listReport, getReport, delReport, addReport, updateReport} from "@/api/weekReport"
import MarkdownIt from 'markdown-it'

const {proxy} = getCurrentInstance()

const reportList = ref([])
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
        pageSize: 10,
        weekReportScore: null,
        weekReportContent: null,
        createTime: null
    },
    rules: {
        weekReportScore: [
            {required: true, message: "周报评分不能为空", trigger: "blur"}
        ],
        weekReportContent: [
            {required: true, message: "周报内容不能为空", trigger: "blur"}
        ],
    }
})

const {queryParams, form, rules} = toRefs(data)

// markdown dialog
let mdDialogStatus = ref(false)

// md处理结果
let mdResult = ref()

/** 查询周报列表 */
function getList() {
    loading.value = true
    queryParams.value.params = {}
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }
    listReport(queryParams.value).then(response => {
        reportList.value = response.rows
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
        weekReportId: null,
        weekReportScore: null,
        weekReportContent: '',
        createTime: null
    }
    proxy.resetForm("reportRef")
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
    ids.value = selection.map(item => item.weekReportId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加周报"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const _weekReportId = row.weekReportId || ids.value
    getReport(_weekReportId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改周报"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["reportRef"].validate(valid => {
        if (valid) {
            if (form.value.weekReportId != null) {
                updateReport(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addReport(form.value).then(response => {
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
    const _weekReportIds = row.weekReportId || ids.value
    proxy.$modal.confirm('是否确认删除周报？').then(function () {
        return delReport(_weekReportIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/lab/week-report/export', {
        ...queryParams.value
    }, `report_${new Date().getTime()}.xlsx`)
}

// 查看周报
function handleView(row) {
    mdDialogStatus.value = true
    console.log('查看周报')
    console.log(row)

    const md = new MarkdownIt({
        html: true,       // 允许 HTML 标签
        linkify: true,    // 自动将 URL 转换为链接
        typographer: true // 启用排版优化
    })
    mdResult.value = md.render(row.weekReportContent)
}

getList()
</script>

<style scoped lang="scss">
.el-input {
    width: 200px;
}

.el-input-number {
    width: 200px;
}

.el-select {
    width: 200px;
}
</style>
