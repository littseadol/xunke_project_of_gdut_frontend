<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="评分" prop="score">
        <el-input
          v-model="queryParams.score"
          placeholder="请输入评分"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课程名称" prop="courseName">
        <el-input
          v-model="queryParams.courseName"
          placeholder="请输入课程名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="教师名称" prop="teacherName">
        <el-input
          v-model="queryParams.teacherName"
          placeholder="请输入教师名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="截图路径" prop="snapshotPath">
        <el-input
          v-model="queryParams.snapshotPath"
          placeholder="请输入截图路径"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="截图时间" prop="snapshotTime">
        <el-date-picker clearable
          v-model="queryParams.snapshotTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择截图时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="视频时间" prop="videoTime">
        <el-date-picker clearable
          v-model="queryParams.videoTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择视频时间">
        </el-date-picker>
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
          v-hasPermi="['lab:evaluation:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['lab:evaluation:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['lab:evaluation:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['lab:evaluation:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="evaluationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="评价ID" align="center" prop="id" />
      <el-table-column label="评分" align="center" prop="score" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="教师名称" align="center" prop="teacherName" />
      <el-table-column label="评价内容" align="center" prop="content" />
      <el-table-column label="改进建议" align="center" prop="suggestion" />
      <el-table-column label="截图" align="center" prop="snapshotPath" width="180">
        <template #default="scope">
          <el-image 
            v-if="scope.row.snapshotPath"
            style="width: 100px; height: 60px"
            :src="scope.row.snapshotPath"
            :preview-src-list="[scope.row.snapshotPath]"
            fit="cover"
            hide-on-click-modal
          />
          <span v-else>无截图</span>
        </template>
      </el-table-column>
      <el-table-column label="截图时间" align="center" prop="snapshotTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.snapshotTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="视频时间" align="center" prop="videoTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.videoTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['lab:evaluation:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['lab:evaluation:remove']">删除</el-button>
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

    <!-- 添加或修改评价信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="evaluationRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="摄像头ID" prop="deviceId">
          <el-input v-model="form.deviceId" placeholder="请输入摄像头ID" />
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="教师名称" prop="teacherName">
          <el-input v-model="form.teacherName" placeholder="请输入教师名称" />
        </el-form-item>
        <el-form-item label="评分" prop="score">
          <el-input v-model="form.score" placeholder="请输入评分" />
        </el-form-item>
        <el-form-item label="评价内容">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="改进建议" prop="suggestion">
          <el-input v-model="form.suggestion" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="截图路径" prop="snapshotPath">
          <el-input v-model="form.snapshotPath" placeholder="请输入截图路径" />
        </el-form-item>
        <el-form-item label="截图时间" prop="snapshotTime">
          <el-date-picker clearable
            v-model="form.snapshotTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择截图时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="视频时间" prop="videoTime">
          <el-date-picker clearable
            v-model="form.videoTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择视频时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="排课ID" prop="scheduleId">
          <el-input v-model="form.scheduleId" placeholder="请输入排课ID" />
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

<script setup name="Evaluation">
import { listEvaluation, getEvaluation, delEvaluation, addEvaluation, updateEvaluation } from "@/api/video/evaluation.js"

const { proxy } = getCurrentInstance()

const evaluationList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    score: null,
    courseName: null,
    teacherName: null,
    content: null,
    suggestion: null,
    snapshotPath: null,
    snapshotTime: null,
    videoTime: null,
  },
  rules: {
    deviceId: [
      { required: true, message: "摄像头ID不能为空", trigger: "blur" }
    ],
    courseName: [
      { required: true, message: "课程名称不能为空", trigger: "blur" }
    ],
    teacherName: [
      { required: true, message: "教师名称不能为空", trigger: "blur" }
    ],
    score: [
      { required: true, message: "评分不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "评价内容不能为空", trigger: "blur" }
    ],
    snapshotPath: [
      { required: true, message: "截图路径不能为空", trigger: "blur" }
    ],
    snapshotTime: [
      { required: true, message: "截图时间不能为空", trigger: "blur" }
    ],
    videoTime: [
      { required: true, message: "视频时间不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询评价信息列表 */
function getList() {
  loading.value = true
  listEvaluation(queryParams.value).then(response => {
    evaluationList.value = response.rows
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
    id: null,
    deviceId: null,
    courseName: null,
    teacherName: null,
    score: null,
    content: null,
    suggestion: null,
    snapshotPath: null,
    snapshotTime: null,
    videoTime: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    scheduleId: null
  }
  proxy.resetForm("evaluationRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef")
  handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加评价信息"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _id = row.id || ids.value
  getEvaluation(_id).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改评价信息"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["evaluationRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateEvaluation(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addEvaluation(form.value).then(response => {
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
  const _ids = row.id || ids.value
  proxy.$modal.confirm('是否确认删除评价信息编号为"' + _ids + '"的数据项？').then(function() {
    return delEvaluation(_ids)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('lab/evaluation/export', {
    ...queryParams.value
  }, `evaluation_${new Date().getTime()}.xlsx`)
}

getList()
</script>