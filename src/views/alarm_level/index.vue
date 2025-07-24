<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">

            <el-form-item label="告警等级名称" prop="alarmLevelName">
                <el-input
                        v-model="queryParams.alarmLevelName"
                        placeholder="请输入告警等级名称"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="告警等级颜色" prop="alarmLevelColor">
                <el-input
                        v-model="queryParams.alarmLevelColor"
                        placeholder="请输入告警等级颜色"
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
                        v-hasPermi="['lab:level:add']"
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
                        v-hasPermi="['lab:level:edit']"
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
                        v-hasPermi="['lab:level:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['lab:level:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="levelList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="告警等级ID" align="center" prop="alarmLevelId"/>
            <el-table-column label="告警等级名称" align="center" prop="alarmLevelName"/>
            <el-table-column label="告警等级颜色" align="center" prop="alarmLevelColor">
                <template #default="scope">
                    <el-text :style="{ backgroundColor: scope.row.alarmLevelColor, width: '100px', padding: '5px' }">告警等级颜色</el-text>
                </template>
            </el-table-column>
            <el-table-column label="告警等级展示方式" align="center" prop="alarmLevelDemonstrations">
                <template #default="scope">
                    <dict-tag :options="alarm_level"
                              :value="scope.row.alarmLevelDemonstrations ? scope.row.alarmLevelDemonstrations.split(',') : []"/>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime"></el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['lab:level:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['lab:level:remove']">删除
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

        <!-- 添加或修改level对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="levelRef" :model="form" :rules="rules" label-width="auto">
                <el-form-item label="告警等级名称" prop="alarmLevelName">
                    <el-input v-model="form.alarmLevelName" placeholder="请输入告警等级名称"/>
                </el-form-item>
                <el-form-item label="告警等级颜色" prop="alarmLevelColor">
                    <el-color-picker v-model="form.alarmLevelColor"/>
                </el-form-item>
                <el-form-item label="告警等级展示方式" prop="alarmLevelDemonstrations">
                    <el-checkbox-group v-model="form.alarmLevelDemonstrations">
                        <el-checkbox
                                v-for="dict in alarm_level"
                                :key="dict.value"
                                :label="dict.value">
                            {{ dict.label }}
                        </el-checkbox>
                    </el-checkbox-group>
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

<script setup name="Level">
import {listLevel, getLevel, delLevel, addLevel, updateLevel} from "@/api/alarm_level"

const {proxy} = getCurrentInstance()
const {alarm_level} = proxy.useDict('alarm_level')

const levelList = ref([])
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
        alarmLevelName: null,
        alarmLevelColor: null,
        alarmLevelDemonstrations: null,
        createTime: null
    },
    rules: {
        alarmLevelName: [
            {required: true, message: "告警等级名称不能为空", trigger: "blur"}
        ],
        alarmLevelColor: [
            {required: true, message: "告警等级颜色不能为空", trigger: "blur"}
        ],
        alarmLevelDemonstrations: [
            {required: true, message: "告警等级展示方式不能为空", trigger: "blur"}
        ],
    }
})

const {queryParams, form, rules} = toRefs(data)

/** 查询level列表 */
function getList() {
    loading.value = true
    queryParams.value.params = {}
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }
    listLevel(queryParams.value).then(response => {
        levelList.value = response.rows
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
        alarmLevelId: null,
        alarmLevelName: null,
        alarmLevelColor: null,
        alarmLevelDemonstrations: [],
        createTime: null
    }
    proxy.resetForm("levelRef")
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
    ids.value = selection.map(item => item.alarmLevelId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加告警等级"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const _alarmLevelId = row.alarmLevelId || ids.value
    getLevel(_alarmLevelId).then(response => {
        form.value = response.data
        form.value.alarmLevelDemonstrations = form.value.alarmLevelDemonstrations.split(",")
        open.value = true
        title.value = "修改告警等级"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["levelRef"].validate(valid => {
        if (valid) {
            form.value.alarmLevelDemonstrations = form.value.alarmLevelDemonstrations.join(",")
            if (form.value.alarmLevelId != null) {
                updateLevel(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addLevel(form.value).then(response => {
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
    const _alarmLevelIds = row.alarmLevelId || ids.value
    proxy.$modal.confirm('是否确认删除level编号为"' + _alarmLevelIds + '"的数据项？').then(function () {
        return delLevel(_alarmLevelIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/lab/alarm-level/export', {
        ...queryParams.value
    }, `level_${new Date().getTime()}.xlsx`)
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
