<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">

            <el-form-item label="月报编号" prop="monthReportNumber">
                <el-input
                        v-model="queryParams.monthReportNumber"
                        placeholder="请输入月报编号"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="月报评分" prop="monthReportScore">
                <el-input-number
                        v-model="queryParams.monthReportScore"
                        placeholder="请输入月报评分"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="月报内容" prop="monthReportContent">
                <el-input
                        v-model="queryParams.monthReportContent"
                        placeholder="请输入月报内容"
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

            <el-form-item label="所属楼栋" prop="buildingName">
                <el-input
                        v-model="queryParams.buildingName"
                        placeholder="请输入所属楼栋"
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
                        v-hasPermi="['lab:monthReport:add']"
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
                        v-hasPermi="['lab:monthReport:edit']"
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
                        v-hasPermi="['lab:monthReport:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['lab:monthReport:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="monthReportList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>

            <el-table-column label="月报ID" align="center" prop="monthReportId"/>
            <el-table-column label="月报编号" align="center" prop="monthReportNumber"/>
            <el-table-column label="所属房间" align="center" prop="roomName"/>
            <el-table-column label="所属楼栋" align="center" prop="buildingName"/>
            <el-table-column label="所属楼层" align="center" prop="buildingFloor"/>
            <el-table-column label="所属团队" align="center" prop="teamName"/>

            <el-table-column label="月报评分" align="center" prop="monthReportScore"/>
            <el-table-column label="创建时间" align="center" prop="createTime"></el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">

                    <el-button link type="primary" icon="Aim" @click="handleView(scope.row)">查看</el-button>

                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['lab:monthReport:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['lab:monthReport:remove']">删除
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

        <!-- 添加或修改月报对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="monthReportRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="月报评分" prop="monthReportScore">
                    <el-input-number v-model="form.monthReportScore" placeholder="请输入月报评分" style="width: 100%;"/>
                </el-form-item>
                <el-form-item label="月报内容" prop="monthReportContent">
                    <el-input v-model="form.monthReportContent" placeholder="请输入月报内容" type="textarea" rows="10"/>
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
                v-model="markdownDialogStatus"
                title="月报内容"
                fullscreen>
            <div v-html="markdownResult"></div>
        </el-dialog>

    </div>
</template>

<script setup name="MonthReport">
import {listMonthReport, getMonthReport, delMonthReport, addMonthReport, updateMonthReport} from "@/api/monthReport"
import MarkdownIt from 'markdown-it'

const {proxy} = getCurrentInstance()

const monthReportList = ref([])
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
        monthReportScore: null,
        monthReportContent: null,
        createTime: null
    },
    rules: {
        monthReportScore: [
            {required: true, message: "月报评分不能为空", trigger: "blur"}
        ],
        monthReportContent: [
            {required: true, message: "月报内容不能为空", trigger: "blur"}
        ],
    }
})

const {queryParams, form, rules} = toRefs(data)

// dialog
let markdownDialogStatus = ref(false)
let markdownResult = ref()

/** 查询月报列表 */
function getList() {
    loading.value = true
    queryParams.value.params = {}
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }
    listMonthReport(queryParams.value).then(response => {
        console.log(response)

        monthReportList.value = response.rows
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
        monthReportId: null,
        monthReportScore: null,
        monthReportContent: null,
        createTime: null
    }
    proxy.resetForm("monthReportRef")
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
    ids.value = selection.map(item => item.monthReportId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加月报"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const _monthReportId = row.monthReportId || ids.value
    getMonthReport(_monthReportId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改月报"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["monthReportRef"].validate(valid => {
        if (valid) {
            if (form.value.monthReportId != null) {
                updateMonthReport(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addMonthReport(form.value).then(response => {
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
    const _monthReportIds = row.monthReportId || ids.value
    proxy.$modal.confirm('是否确认删除月报编号为"' + _monthReportIds + '"的数据项？').then(function () {
        return delMonthReport(_monthReportIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('lab/month-report/export', {
        ...queryParams.value
    }, `monthReport_${new Date().getTime()}.xlsx`)
}

// 查看
function handleView(row) {
    let monthReportContent = row.monthReportContent
    markdownDialogStatus.value = true

    const md = new MarkdownIt({
        html: true,       // 允许 HTML 标签
        linkify: true,    // 自动将 URL 转换为链接
        typographer: true // 启用排版优化
    })
    markdownResult.value = md.render(monthReportContent)
    console.log(markdownResult.value)
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
