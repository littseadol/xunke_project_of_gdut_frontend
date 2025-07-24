<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">

            <el-form-item label="摄像头名称" prop="deviceId">
                <el-input
                        v-model="queryParams.deviceId"
                        placeholder="请输入摄像头名称"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="处理意见" prop="handleOpinion">
                <el-input
                        v-model="queryParams.handleOpinion"
                        placeholder="请输入处理意见"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="处理时间">
                <el-date-picker
                        style="width: 220px;"
                        v-model="daterangeHandleTime"
                        value-format="YYYY-MM-DD"
                        type="daterange"
                        range-separator="-"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                ></el-date-picker>
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
                        v-hasPermi="['lab:event:add']"
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
                        v-hasPermi="['lab:event:edit']"
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
                        v-hasPermi="['lab:event:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['lab:event:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="eventList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>

            <el-table-column label="告警ID" align="center" prop="eventId"/>
            <el-table-column label="告警图片" align="center" prop="alarmPicture"/>
            <el-table-column label="摄像头名称" align="center" prop="deviceId"/>
            <el-table-column label="事件类型" align="center" prop="eventType"/>
            <el-table-column label="事件级别" align="center" prop="eventLevel"/>
            <el-table-column label="事件状态" align="center" prop="eventStatus"/>
            <el-table-column label="处理意见" align="center" prop="handleOpinion"/>

            <el-table-column label="处理时间" align="center" prop="handleTime"></el-table-column>

            <el-table-column label="创建时间" align="center" prop="createTime"></el-table-column>

            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['lab:event:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['lab:event:remove']">删除
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

        <!-- 添加或修改event对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="eventRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="告警图片" prop="alarmPicture">
                    <el-input v-model="form.alarmPicture" placeholder="请输入告警图片"/>
                </el-form-item>
                <el-form-item label="告警短视频" prop="alarmVideo">
                    <el-input v-model="form.alarmVideo" placeholder="请输入告警短视频"/>
                </el-form-item>
                <el-form-item label="设备ID" prop="deviceId">
                    <el-input v-model="form.deviceId" placeholder="请输入设备ID"/>
                </el-form-item>
                <el-form-item label="处理时间" prop="handleTime">
                    <el-date-picker clearable
                                    v-model="form.handleTime"
                                    type="date"
                                    value-format="YYYY-MM-DD"
                                    placeholder="请选择处理时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="处理意见" prop="handleOpinion">
                    <el-input v-model="form.handleOpinion" placeholder="请输入处理意见"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Event">
import {listEvent, getEvent, delEvent, addEvent, updateEvent} from "@/api/event"

const {proxy} = getCurrentInstance()

const eventList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const daterangeHandleTime = ref([])
const daterangeCreateTime = ref([])

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        alarmPicture: null,
        alarmVideo: null,
        deviceId: null,
        eventType: null,
        eventLevel: null,
        eventStatus: null,
        handleTime: null,
        handleOpinion: null,
        createTime: null
    },
    rules: {}
})

const {queryParams, form, rules} = toRefs(data)

/** 查询event列表 */
function getList() {
    loading.value = true
    queryParams.value.params = {}
    if (null != daterangeHandleTime && '' != daterangeHandleTime) {
        queryParams.value.params["beginHandleTime"] = daterangeHandleTime.value[0]
        queryParams.value.params["endHandleTime"] = daterangeHandleTime.value[1]
    }
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }
    listEvent(queryParams.value).then(response => {
        eventList.value = response.rows
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
        eventId: null,
        alarmPicture: null,
        alarmVideo: null,
        deviceId: null,
        eventType: null,
        eventLevel: null,
        eventStatus: null,
        handleTime: null,
        handleOpinion: null,
        createTime: null
    }
    proxy.resetForm("eventRef")
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    daterangeHandleTime.value = []
    daterangeCreateTime.value = []
    proxy.resetForm("queryRef")
    handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.eventId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加event"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const _eventId = row.eventId || ids.value
    getEvent(_eventId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改event"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["eventRef"].validate(valid => {
        if (valid) {
            if (form.value.eventId != null) {
                updateEvent(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addEvent(form.value).then(response => {
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
    const _eventIds = row.eventId || ids.value
    proxy.$modal.confirm('是否确认删除event编号为"' + _eventIds + '"的数据项？').then(function () {
        return delEvent(_eventIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('lab/event/export', {
        ...queryParams.value
    }, `event_${new Date().getTime()}.xlsx`)
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
