<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">
            <el-form-item label="团队名称" prop="teamName">
                <el-input
                        v-model="queryParams.teamName"
                        placeholder="请输入团队名称"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="负责人姓名" prop="chargeName">
                <el-input
                        v-model="queryParams.chargeName"
                        placeholder="请输入负责人姓名"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="负责人工号" prop="chargeWorkNumber">
                <el-input
                        v-model="queryParams.chargeWorkNumber"
                        placeholder="请输入负责人工号"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="负责人联系方式" prop="chargePhone">
                <el-input
                        v-model="queryParams.chargePhone"
                        placeholder="请输入负责人联系方式"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="管理员姓名" prop="adminName">
                <el-input
                        v-model="queryParams.adminName"
                        placeholder="请输入管理员姓名"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="管理员工号" prop="adminWorkNumber">
                <el-input
                        v-model="queryParams.adminWorkNumber"
                        placeholder="请输入管理员工号"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="管理员联系方式" prop="adminPhone">
                <el-input
                        v-model="queryParams.adminPhone"
                        placeholder="请输入管理员联系方式"
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
                        v-hasPermi="['lab:team:add']"
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
                        v-hasPermi="['lab:team:edit']"
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
                        v-hasPermi="['lab:team:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['lab:team:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="teamList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="团队ID" align="center" prop="teamId"/>
            <el-table-column label="团队名称" align="center" prop="teamName"/>
            <el-table-column label="负责人姓名" align="center" prop="chargeName"/>
            <el-table-column label="负责人工号" align="center" prop="chargeWorkNumber"/>
            <el-table-column label="负责人联系方式" align="center" prop="chargePhone"/>
            <el-table-column label="管理员姓名" align="center" prop="adminName"/>
            <el-table-column label="管理员工号" align="center" prop="adminWorkNumber"/>
            <el-table-column label="管理员联系方式" align="center" prop="adminPhone"/>
            <el-table-column label="创建时间" align="center" prop="createTime"></el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['lab:team:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['lab:team:remove']">删除
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

        <!-- 添加或修改团队对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="teamRef" :model="form" :rules="rules" label-width="auto">
                <el-form-item label="团队名称" prop="teamName">
                    <el-input v-model="form.teamName" placeholder="请输入团队名称"/>
                </el-form-item>

                <el-form-item label="负责人姓名" prop="chargeName">
                    <el-input v-model="form.chargeName" placeholder="请输入负责人姓名"/>
                </el-form-item>

                <el-form-item label="负责人工号" prop="chargeWorkNumber">
                    <el-input v-model="form.chargeWorkNumber" placeholder="请输入负责人工号"/>
                </el-form-item>

                <el-form-item label="负责人联系方式" prop="chargePhone">
                    <el-input v-model="form.chargePhone" placeholder="请输入负责人联系方式"/>
                </el-form-item>
                <el-form-item label="管理员姓名" prop="adminName">
                    <el-input v-model="form.adminName" placeholder="请输入管理员姓名"/>
                </el-form-item>
                <el-form-item label="管理员工号" prop="adminWorkNumber">
                    <el-input v-model="form.adminWorkNumber" placeholder="请输入管理员工号"/>
                </el-form-item>
                <el-form-item label="管理员联系方式" prop="adminPhone">
                    <el-input v-model="form.adminPhone" placeholder="请输入管理员联系方式"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>

        <!--  添加房间    -->
        <el-dialog
                v-model="dialogVisible"
                title="Tips"
                width="500"
                :before-close="handleClose"
        >
            <span>This is a message</span>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">Cancel</el-button>
                    <el-button type="primary" @click="dialogVisible = false">
                        Confirm
                    </el-button>
                </div>
            </template>
        </el-dialog>

    </div>
</template>

<script setup name="Team">
import {listTeam, getTeam, delTeam, addTeam, updateTeam} from "@/api/team"

const {proxy} = getCurrentInstance()

const teamList = ref([])
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
        teamName: null,
        chargeName: null,
        chargePhone: null,
        adminName: null,
        adminWorkNumber: null,
        adminPhone: null,
        createTime: null
    },
    rules: {
        teamName: [
            {required: true, message: "团队名称不能为空", trigger: "blur"}
        ],
        chargeName: [
            {required: true, message: "负责人姓名不能为空", trigger: "blur"}
        ],
        chargeWorkNumber: [
            {required: true, message: "负责人工号不能为空", trigger: "blur"}
        ],
        chargePhone: [
            {required: true, message: "负责人联系方式不能为空", trigger: "blur"}
        ],
        adminName: [
            {required: true, message: "管理员姓名不能为空", trigger: "blur"}
        ],
        adminWorkNumber: [
            {required: true, message: "管理员工号不能为空", trigger: "blur"}
        ],
        adminPhone: [
            {required: true, message: "管理员联系方式不能为空", trigger: "blur"}
        ],
    }
})

const {queryParams, form, rules} = toRefs(data)

/** 查询团队列表 */
function getList() {
    loading.value = true
    queryParams.value.params = {}
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }
    listTeam(queryParams.value).then(response => {
        teamList.value = response.rows
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
        teamId: null,
        teamName: null,
        chargeName: null,
        chargePhone: null,
        adminName: null,
        adminWorkNumber: null,
        adminPhone: null,
        createTime: null
    }
    proxy.resetForm("teamRef")
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
    ids.value = selection.map(item => item.teamId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加团队"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const _teamId = row.teamId || ids.value
    getTeam(_teamId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改团队"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["teamRef"].validate(valid => {
        if (valid) {
            if (form.value.teamId != null) {
                updateTeam(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addTeam(form.value).then(response => {
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
    const _teamIds = row.teamId || ids.value
    proxy.$modal.confirm('是否确认删除团队编号为"' + _teamIds + '"的数据项？').then(function () {
        return delTeam(_teamIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('lab/team/export', {
        ...queryParams.value
    }, `team_${new Date().getTime()}.xlsx`)
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