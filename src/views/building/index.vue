<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">
            <el-form-item label="楼栋名称" prop="buildingName">
                <el-input
                        v-model="queryParams.buildingName"
                        placeholder="请输入楼栋名称"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="楼栋总楼层" prop="buildingTotalFloor">
                <el-input-number
                        v-model="queryParams.buildingTotalFloor"
                        placeholder="请输入楼栋总楼层"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="楼栋类型" prop="buildingType">
                <el-select v-model="queryParams.buildingType" placeholder="请选择楼栋类型" clearable>
                    <el-option
                            v-for="dict in building_type"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
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
                        v-hasPermi="['lab:building:add']"
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
                        v-hasPermi="['lab:building:edit']"
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
                        v-hasPermi="['lab:building:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['lab:building:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="buildingList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="楼栋ID" align="center" prop="buildingId"/>
            <el-table-column label="楼栋名称" align="center" prop="buildingName"/>
            <el-table-column label="楼栋总楼层" align="center" prop="buildingTotalFloor"/>
            <el-table-column label="楼栋类型" align="center" prop="buildingType">
                <template #default="scope">
                    <dict-tag :options="building_type" :value="scope.row.buildingType"/>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime"></el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['lab:building:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['lab:building:remove']">删除
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

        <!-- 添加或修改楼栋对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="buildingRef" :model="form" :rules="rules" label-width="auto">
                <el-form-item label="楼栋名称" prop="buildingName">
                    <el-input v-model="form.buildingName" placeholder="请输入楼栋名称"/>
                </el-form-item>
                <el-form-item label="楼栋总楼层" prop="buildingTotalFloor">
                    <el-input v-model="form.buildingTotalFloor" placeholder="请输入楼栋总楼层"/>
                </el-form-item>
                <el-form-item label="楼栋类型" prop="buildingType">
                    <el-select v-model="form.buildingType" placeholder="请选择楼栋类型">
                        <el-option
                                v-for="dict in building_type"
                                :key="dict.value"
                                :label="dict.label"
                                :value="parseInt(dict.value)"
                        ></el-option>
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
    </div>
</template>

<script setup name="Building">
import {listBuilding, getBuilding, delBuilding, addBuilding, updateBuilding} from "@/api/building"

const {proxy} = getCurrentInstance()
const {building_type} = proxy.useDict('building_type')

const buildingList = ref([])
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
        buildingName: null,
        buildingTotalFloor: null,
        buildingType: null,
        createTime: null
    },
    rules: {
        buildingName: [
            {required: true, message: "楼栋名称不能为空", trigger: "blur"}
        ],
        buildingTotalFloor: [
            {required: true, message: "楼栋总楼层不能为空", trigger: "blur"}
        ],
        buildingType: [
            {required: true, message: "楼栋类型不能为空", trigger: "change"}
        ],
    }
})

const {queryParams, form, rules} = toRefs(data)

/** 查询楼栋列表 */
function getList() {
    loading.value = true
    queryParams.value.params = {}
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }
    listBuilding(queryParams.value).then(response => {
        buildingList.value = response.rows
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
        buildingId: null,
        buildingName: null,
        buildingTotalFloor: null,
        buildingType: null,
        createTime: null
    }
    proxy.resetForm("buildingRef")
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
    ids.value = selection.map(item => item.buildingId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加楼栋"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const _buildingId = row.buildingId || ids.value
    getBuilding(_buildingId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改楼栋"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["buildingRef"].validate(valid => {
        if (valid) {
            if (form.value.buildingId != null) {
                updateBuilding(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addBuilding(form.value).then(response => {
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
    const _buildingIds = row.buildingId || ids.value
    proxy.$modal.confirm('是否确认删除楼栋编号为"' + _buildingIds + '"的数据项？').then(function () {
        return delBuilding(_buildingIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('lab/building/export', {
        ...queryParams.value
    }, `building_${new Date().getTime()}.xlsx`)
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
