<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">
            <el-form-item label="房间名字" prop="roomName">
                <el-input
                        v-model="queryParams.roomName"
                        placeholder="请输入房间名字"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="房间类型" prop="roomType">
                <el-select v-model="queryParams.roomType" placeholder="请选择房间类型" clearable>
                    <el-option
                            v-for="dict in room_type"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="负责人姓名" prop="chargeName">
                <el-input
                        v-model="queryParams.chargeName"
                        placeholder="请输入负责人姓名"
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
            <el-form-item label="负责人工号" prop="chargeWorkNumber">
                <el-input
                        v-model="queryParams.chargeWorkNumber"
                        placeholder="请输入负责人工号"
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

            <el-form-item label="所在楼层" prop="buildingFloor">
                <el-input-number
                        v-model="queryParams.buildingFloor"
                        placeholder="请输入所在楼层"
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
                        v-hasPermi="['lab:room:add']"
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
                        v-hasPermi="['lab:room:edit']"
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
                        v-hasPermi="['lab:room:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['lab:room:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="roomList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="房间ID" align="center" prop="roomId"/>
            <el-table-column label="房间名字" align="center" prop="roomName"/>
            <el-table-column label="房间类型" align="center" prop="roomType">
                <template #default="scope">
                    <dict-tag :options="room_type" :value="scope.row.roomType"/>
                </template>
            </el-table-column>

            <el-table-column label="所属楼栋" align="center" prop="buildingName"/>
            <el-table-column label="所在楼层" align="center" prop="buildingFloor"/>

            <el-table-column label="所属团队" align="center" prop="teamName"/>

            <el-table-column label="负责人姓名" align="center" prop="chargeName"/>
            <el-table-column label="负责人联系方式" align="center" prop="chargePhone"/>
            <el-table-column label="负责人工号" align="center" prop="chargeWorkNumber"/>
            <el-table-column label="创建时间" align="center" prop="createTime"></el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Coin" @click="openTeamDialog(scope.row)"
                               v-hasPermi="['lab:room:edit']">绑定团队
                    </el-button>
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['lab:room:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['lab:room:remove']">删除
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

        <!-- 添加或修改房间对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="roomRef" :model="form" :rules="rules" label-width="auto">

                <el-form-item label="所属楼栋" prop="buildingId">
                    <el-select v-model="form.buildingId" placeholder="请选择所属楼栋">
                        <el-option
                                v-for="dict in buildingOptions"
                                :key="dict.value"
                                :label="dict.label"
                                :value="parseInt(dict.value)"
                        ></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="所在楼层" prop="buildingFloor">
                    <el-input-number v-model="form.buildingFloor" placeholder="请输入所在楼层" style="width: 100%;"/>
                </el-form-item>

                <el-form-item label="房间名字" prop="roomName">
                    <el-input v-model="form.roomName" placeholder="请输入房间名字"/>
                </el-form-item>

                <el-form-item label="房间类型" prop="roomType">
                    <el-select v-model="form.roomType" placeholder="请选择房间类型">
                        <el-option
                                v-for="dict in room_type"
                                :key="dict.value"
                                :label="dict.label"
                                :value="parseInt(dict.value)"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="负责人姓名" prop="chargeName">
                    <el-input v-model="form.chargeName" placeholder="请输入负责人姓名"/>
                </el-form-item>
                <el-form-item label="负责人联系方式" prop="chargePhone">
                    <el-input v-model="form.chargePhone" placeholder="请输入负责人联系方式"/>
                </el-form-item>
                <el-form-item label="负责人工号" prop="chargeWorkNumber">
                    <el-input v-model="form.chargeWorkNumber" placeholder="请输入负责人工号"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="submitForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </template>
        </el-dialog>

        <!--  绑定团队      -->
        <el-dialog
                v-model="teamDialogStatus"
                title="绑定团队" width="600">

            <el-input
                    @keyup.enter="handleSearchTeam"
                    v-model="teamNameKeyword"
                    placeholder="请输入团队名称进行搜索，回车确认"
                    :prefix-icon="Search"
            />

            <el-table :data="teamList" style="margin-top: 10px;">
                <el-table-column prop="teamName" label="团队名称" align="center"/>
                <el-table-column label="操作" align="center">
                    <template #default="scope">
                        <el-button type="primary" link icon="Coin" @click="handleBindTeam(scope.row)">绑定</el-button>
                    </template>
                </el-table-column>
            </el-table>

        </el-dialog>
    </div>
</template>

<script setup name="Room">
import {listRoom, getRoom, delRoom, addRoom, updateRoom, bindTeam} from "@/api/room"
import {listAllBuilding} from '@/api/building'
import {listAllTeam} from '@/api/team'
import {Search} from "@element-plus/icons-vue";

const {proxy} = getCurrentInstance()
const {room_type} = proxy.useDict('room_type')

const roomList = ref([])
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
        roomName: null,
        roomType: null,
        chargeName: null,
        chargePhone: null,
        chargeWorkNumber: null,
        createTime: null
    },
    rules: {
        buildingId: [
            {required: true, message: "所属楼栋不能为空", trigger: "blur"}
        ],
        buildingFloor: [
            {required: true, message: "所属楼层不能为空", trigger: "blur"}
        ],
        roomName: [
            {required: true, message: "房间名字不能为空", trigger: "blur"}
        ],
        roomType: [
            {required: true, message: "房间类型不能为空", trigger: "change"}
        ],
        chargeName: [
            {required: true, message: "负责人姓名不能为空", trigger: "blur"}
        ],
        chargePhone: [
            {required: true, message: "负责人联系方式不能为空", trigger: "blur"}
        ],
        chargeWorkNumber: [
            {required: true, message: "负责人工号不能为空", trigger: "blur"}
        ],
    }
})

const {queryParams, form, rules} = toRefs(data)

// 楼栋列表
let buildingOptions = ref([])

// 绑定团队dialog
let teamDialogStatus = ref(false)

// 团队列表
let defaultTeamList = []
let teamList = ref([])

// 团队名称关键字
let teamNameKeyword = ref('')

/** 查询房间列表 */
function getList() {
    loading.value = true
    queryParams.value.params = {}
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }
    listRoom(queryParams.value).then(response => {
        roomList.value = response.rows
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
        roomId: null,
        roomName: null,
        roomType: null,
        chargeName: null,
        chargePhone: null,
        chargeWorkNumber: null,
        createTime: null
    }
    proxy.resetForm("roomRef")
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
    ids.value = selection.map(item => item.roomId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加房间"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const _roomId = row.roomId || ids.value
    getRoom(_roomId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改房间"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["roomRef"].validate(valid => {
        if (valid) {
            if (form.value.roomId != null) {
                updateRoom(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addRoom(form.value).then(response => {
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
    const _roomIds = row.roomId || ids.value
    proxy.$modal.confirm('是否确认删除房间？').then(function () {
        return delRoom(_roomIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/lab/room/export', {
        ...queryParams.value
    }, `room_${new Date().getTime()}.xlsx`)
}

// 获取所有楼栋
function getAllBuildingList() {
    listAllBuilding().then(response => {
        console.log(response)
        let data = response.data
        for (let i = 0;i < data.length;i ++ ) {
            let item = data[i]
            let value = item.buildingId
            let label = item.buildingName
            buildingOptions.value.push({value: value, label: label})
        }
    })
}

// 绑定团队
function openTeamDialog(row) {
    form.value.roomId = row.roomId
    console.log('绑定团队')
    teamDialogStatus.value = true
    getAllTeamList()
}

// 获取所有的团队列表
function getAllTeamList() {
    listAllTeam().then(response => {
        console.log(response)
        defaultTeamList = response.data
        teamList.value = Object.assign([], defaultTeamList)
    })
}

// 绑定团队
function handleBindTeam(row) {
    form.value.teamId = row.teamId
    bindTeam(form.value).then(response => {
        console.log(response)
        proxy.$modal.msgSuccess("绑定成功")
        teamDialogStatus.value = false
        getList()
    })
}

// 搜索团队
function handleSearchTeam() {
    console.log('搜索团队')
    teamList.value = defaultTeamList.filter(team => team.teamName.includes(teamNameKeyword.value))
}

getList()
getAllBuildingList()
getAllTeamList()
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