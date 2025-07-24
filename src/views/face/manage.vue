<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="auto">
            <el-form-item label="姓名" prop="studentName">
                <el-input
                        v-model="queryParams.studentName"
                        placeholder="请输入姓名"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="学号" prop="sutdentId">
                <el-input
                        v-model="queryParams.sutdentId"
                        placeholder="请输入学号"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="专业" prop="studentMajor">

                <el-select v-model="queryParams.studentMajor" placeholder="请选择专业" clearable>
                    <el-option
                            v-for="dict in student_major"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                </el-select>

            </el-form-item>

            <el-form-item label="年级" prop="studentGrade">

                <el-select v-model="queryParams.studentGrade" placeholder="请选择年级" clearable>
                    <el-option
                            v-for="dict in student_grade"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                </el-select>

            </el-form-item>

            <el-form-item label="班级" prop="studentClass">

                <el-select v-model="queryParams.studentClass" placeholder="请选择班级" clearable>
                    <el-option
                            v-for="dict in student_class"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                    />
                </el-select>

            </el-form-item>

            <el-form-item label="手机号" prop="studentPhone">
                <el-input
                        v-model="queryParams.studentPhone"
                        placeholder="请输入手机号"
                        clearable
                        @keyup.enter="handleQuery"
                />
            </el-form-item>

            <el-form-item label="人脸分组" prop="faceGroup">
                <el-select v-model="queryParams.faceGroup" placeholder="请选择人脸分组" clearable>
                    <el-option
                            v-for="dict in lab_face_group"
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
                        v-hasPermi="['face:face:add']"
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
                        v-hasPermi="['face:face:edit']"
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
                        v-hasPermi="['face:face:remove']"
                >删除
                </el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                        type="warning"
                        plain
                        icon="Download"
                        @click="handleExport"
                        v-hasPermi="['face:face:export']"
                >导出
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="faceList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>

            <el-table-column label="人脸ID" align="center" prop="faceId"/>

            <el-table-column label="头像" align="center" prop="facePicture" width="100">
                <template #default="scope">
                    <image-preview :src="scope.row.facePicture" :width="50" :height="50"/>
                </template>
            </el-table-column>
            <el-table-column label="姓名" align="center" prop="studentName"/>
            <el-table-column label="学号" align="center" prop="sutdentId"/>

            <el-table-column label="专业" align="center" prop="studentMajor">
                <template #default="scope">
                    <dict-tag :options="student_major" :value="scope.row.studentMajor"/>
                </template>
            </el-table-column>


            <el-table-column label="年级" align="center" prop="studentGrade">
                <template #default="scope">
                    <dict-tag :options="student_grade" :value="scope.row.studentGrade"/>
                </template>
            </el-table-column>

            <el-table-column label="班级" align="center" prop="studentClass">
                <template #default="scope">
                    <dict-tag :options="student_class" :value="scope.row.studentClass"/>
                </template>
            </el-table-column>

            <el-table-column label="手机号" align="center" prop="studentPhone"/>

            <el-table-column label="人脸分组" align="center" prop="faceGroup">
                <template #default="scope">
                    <dict-tag :options="lab_face_group" :value="scope.row.faceGroup"/>
                </template>
            </el-table-column>

            <el-table-column label="创建时间" align="center" prop="createTime"></el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                               v-hasPermi="['face:face:edit']">修改
                    </el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                               v-hasPermi="['face:face:remove']">删除
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

        <!-- 添加或修改人脸对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="faceRef" :model="form" :rules="rules" label-width="auto">

                <el-form-item label="头像" prop="facePicture">
                    <image-upload v-model="form.facePicture" :data="imageUploadData" :limit="1"/>
                </el-form-item>

                <el-form-item label="姓名" prop="studentName">
                    <el-input v-model="form.studentName" placeholder="请输入姓名" style="width: 100%;"/>
                </el-form-item>

                <el-form-item label="学号" prop="sutdentId">
                    <el-input v-model="form.sutdentId" placeholder="请输入学号" style="width: 100%;"/>
                </el-form-item>

                <el-form-item label="专业" prop="studentMajor">
                    <el-select v-model="form.studentMajor" placeholder="请选择专业" style="width: 100%;">
                        <el-option
                                v-for="dict in student_major"
                                :key="dict.value"
                                :label="dict.label"
                                :value="parseInt(dict.value)"
                        ></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="年级" prop="studentGrade">

                    <el-select v-model="form.studentGrade" placeholder="请选择年级" style="width: 100%;">
                        <el-option
                                v-for="dict in student_grade"
                                :key="dict.value"
                                :label="dict.label"
                                :value="parseInt(dict.value)"
                        ></el-option>
                    </el-select>

                </el-form-item>

                <el-form-item label="班级" prop="studentClass">
                    <el-select v-model="form.studentClass" placeholder="请选择班级" style="width: 100%;">
                        <el-option
                                v-for="dict in student_class"
                                :key="dict.value"
                                :label="dict.label"
                                :value="parseInt(dict.value)"
                        ></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="手机号" prop="studentPhone">
                    <el-input v-model="form.studentPhone" placeholder="请输入手机号" style="width: 100%;"/>
                </el-form-item>
                <el-form-item label="人脸分组" prop="faceGroup">
                    <el-select v-model="form.faceGroup" placeholder="请选择人脸分组" style="width: 100%;">
                        <el-option
                                v-for="dict in lab_face_group"
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

<script setup name="Face">
import {listFace, getFace, delFace, addFace, updateFace} from "@/api/face"
import { ElLoading } from 'element-plus'

const {proxy} = getCurrentInstance()
const {lab_face_group} = proxy.useDict('lab_face_group')
const {student_major} = proxy.useDict('student_major')
const {student_grade} = proxy.useDict('student_grade')
const {student_class} = proxy.useDict('student_class')

const faceList = ref([])
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
        studentName: null,
        sutdentId: null,
        studentMajor: null,
        studentGrade: null,
        studentClass: null,
        studentPhone: null,
        faceGroup: null,
        createTime: null
    },
    rules: {
        facePicture: [{required: true, message: "头像不能为空", trigger: "blur"}],
        studentName: [{required: true, message: "学生姓名不能为空", trigger: "blur"}],
        sutdentId: [{required: true, message: "学生学号不能为空", trigger: "blur"}],
        studentMajor: [{required: true, message: "学生专业不能为空", trigger: "blur"}],
        studentGrade: [{required: true, message: "学生年级不能为空", trigger: "blur"}],
        studentClass: [{required: true, message: "学生班级不能为空", trigger: "blur"}],
        studentPhone: [{required: true, message: "学生联系方式不能为空", trigger: "blur"}],
        faceGroup: [{required: true, message: "人脸分组不能为空", trigger: "blur"}],
    }
})

const {queryParams, form, rules} = toRefs(data)

// 图片上传参数
let imageUploadData = {'type': 'face'}

// 加载
let loadingInstance = null

/** 查询人脸列表 */
function getList() {
    loading.value = true
    queryParams.value.params = {}
    if (null != daterangeCreateTime && '' != daterangeCreateTime) {
        queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0]
        queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1]
    }
    listFace(queryParams.value).then(response => {
        faceList.value = response.rows
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
        faceId: null,
        facePicture: null,
        studentName: null,
        sutdentId: null,
        studentMajor: null,
        studentGrade: null,
        studentClass: null,
        studentPhone: null,
        faceGroup: null,
        createTime: null
    }
    proxy.resetForm("faceRef")
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
    ids.value = selection.map(item => item.faceId)
    single.value = selection.length != 1
    multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加人脸"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const _faceId = row.faceId || ids.value
    getFace(_faceId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改人脸"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["faceRef"].validate(valid => {
        if (valid) {
            if (form.value.faceId != null) {
                loadingInstance = ElLoading.service({})
                updateFace(form.value).then(response => {
                    loadingInstance.close()
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                loadingInstance = ElLoading.service({})
                addFace(form.value).then(response => {
                    loadingInstance.close()
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
    const _faceIds = row.faceId || ids.value
    proxy.$modal.confirm('是否确认删除人脸编号为"' + _faceIds + '"的数据项？').then(function () {
        loadingInstance = ElLoading.service({})
        return delFace(_faceIds).then(response => {
            console.log(response)
            loadingInstance.close()
        })
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('/lab/face/export', {
        ...queryParams.value
    }, `face_${new Date().getTime()}.xlsx`)
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
