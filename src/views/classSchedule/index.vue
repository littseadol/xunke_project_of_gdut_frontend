<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="学年学期" prop="academicYear">
        <el-input v-model="queryParams.academicYear" placeholder="请输入学年学期" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="周次" prop="weekNum">
        <el-input v-model="queryParams.weekNum" placeholder="请输入周次" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="院系名称" prop="collegeName">
        <el-input v-model="queryParams.collegeName" placeholder="请输入院系名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="专业名称" prop="majorName">
        <el-input v-model="queryParams.majorName" placeholder="请输入专业名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="年级" prop="grade">
        <el-input v-model="queryParams.grade" placeholder="请输入年级" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="班级名称" prop="className">
        <el-input v-model="queryParams.className" placeholder="请输入班级名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="课程名称" prop="courseName">
        <el-input v-model="queryParams.courseName" placeholder="请输入课程名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="教师名称" prop="teacherName">
        <el-input v-model="queryParams.teacherName" placeholder="请输入教师名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="星期(1-7)" prop="weekday">
        <el-input v-model="queryParams.weekday" placeholder="请输入星期(1-7)" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="节次" prop="section">
        <el-input v-model="queryParams.section" placeholder="请输入节次" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="上课地点" prop="location">
        <el-input v-model="queryParams.location" placeholder="请输入上课地点" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="排课日期" prop="scheduleDate">
        <el-date-picker clearable v-model="queryParams.scheduleDate" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择排课日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['lab:classSchedule:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['lab:classSchedule:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['lab:classSchedule:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['lab:classSchedule:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="classScheduleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="排课ID" align="center" prop="scheduleId" />
      <el-table-column label="学年学期" align="center" prop="academicYear" />
      <el-table-column label="周次" align="center" prop="weekNum" />
      <el-table-column label="院系名称" align="center" prop="collegeName" />
      <el-table-column label="专业名称" align="center" prop="majorName" />
      <el-table-column label="年级" align="center" prop="grade" />
      <el-table-column label="班级名称" align="center" prop="className" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="教师名称" align="center" prop="teacherName" />
      <el-table-column label="星期(1-7)" align="center" prop="weekday" />
      <el-table-column label="节次" align="center" prop="section" />
      <el-table-column label="上课地点" align="center" prop="location" />
      <el-table-column label="排课日期" align="center" prop="scheduleDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.scheduleDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="课序" align="center" prop="courseOrder" />
      <el-table-column label="课程类型" align="center" prop="courseType" />
      <el-table-column label="授课内容简介" align="center" prop="courseDesc" />
      <el-table-column label="学分" align="center" prop="credits" />
      <el-table-column label="学生人数" align="center" prop="studentCount" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.startTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.endTime || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['lab:classSchedule:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['lab:classSchedule:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改排课信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="classScheduleRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学年学期" prop="academicYear">
          <el-input v-model="form.academicYear" placeholder="请输入学年学期" />
        </el-form-item>
        <el-form-item label="周次" prop="weekNum">
          <el-input v-model="form.weekNum" placeholder="请输入周次" />
        </el-form-item>
        <el-form-item label="院系名称" prop="collegeName">
          <el-input v-model="form.collegeName" placeholder="请输入院系名称" />
        </el-form-item>
        <el-form-item label="专业名称" prop="majorName">
          <el-input v-model="form.majorName" placeholder="请输入专业名称" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input v-model="form.grade" placeholder="请输入年级" />
        </el-form-item>
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="form.className" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="课程名称" prop="courseName">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="教师名称" prop="teacherName">
          <el-input v-model="form.teacherName" placeholder="请输入教师名称" />
        </el-form-item>
        <el-form-item label="星期(1-7)" prop="weekday">
          <el-input v-model="form.weekday" placeholder="请输入星期(1-7)" />
        </el-form-item>
        <el-form-item label="节次" prop="section">
          <el-input v-model="form.section" placeholder="请输入节次" />
        </el-form-item>
        <el-form-item label="上课地点" prop="location">
          <el-input v-model="form.location" placeholder="请输入上课地点" />
        </el-form-item>
        <el-form-item label="排课日期" prop="scheduleDate">
          <el-date-picker clearable v-model="form.scheduleDate" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择排课日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="课序" prop="courseOrder">
          <el-input v-model="form.courseOrder" placeholder="请输入课序" />
        </el-form-item>
        <el-form-item label="授课内容简介" prop="courseDesc">
          <el-input v-model="form.courseDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="学分" prop="credits">
          <el-input v-model="form.credits" placeholder="请输入学分" />
        </el-form-item>
        <el-form-item label="学生人数" prop="studentCount">
          <el-input v-model="form.studentCount" placeholder="请输入学生人数" />
        </el-form-item>
        <el-form-item label="删除标志" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-time-picker clearable v-model="form.startTime" value-format="HH:mm:ss" placeholder="请选择开始时间">
          </el-time-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-time-picker clearable v-model="form.endTime" value-format="HH:mm:ss" placeholder="请选择结束时间">
          </el-time-picker>
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

<script setup name="ClassSchedule">
import { listClassSchedule, getClassSchedule, delClassSchedule, addClassSchedule, updateClassSchedule } from "@/api/classSchedule/classSchedule.js"

const { proxy } = getCurrentInstance()

const classScheduleList = ref([])
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
    academicYear: null,
    weekNum: null,
    collegeName: null,
    majorName: null,
    grade: null,
    className: null,
    courseName: null,
    teacherName: null,
    weekday: null,
    section: null,
    location: null,
    scheduleDate: null,
    startTime: null,
    endTime: null
  },
  rules: {
    academicYear: [
      { required: true, message: "学年学期不能为空", trigger: "blur" }
    ],
    weekNum: [
      { required: true, message: "周次不能为空", trigger: "blur" }
    ],
    collegeName: [
      { required: true, message: "院系名称不能为空", trigger: "blur" }
    ],
    majorName: [
      { required: true, message: "专业名称不能为空", trigger: "blur" }
    ],
    grade: [
      { required: true, message: "年级不能为空", trigger: "blur" }
    ],
    className: [
      { required: true, message: "班级名称不能为空", trigger: "blur" }
    ],
    courseName: [
      { required: true, message: "课程名称不能为空", trigger: "blur" }
    ],
    teacherName: [
      { required: true, message: "教师名称不能为空", trigger: "blur" }
    ],
    weekday: [
      { required: true, message: "星期(1-7)不能为空", trigger: "blur" }
    ],
    section: [
      { required: true, message: "节次不能为空", trigger: "blur" }
    ],
    location: [
      { required: true, message: "上课地点不能为空", trigger: "blur" }
    ],
    scheduleDate: [
      { required: true, message: "排课日期不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询排课信息列表 */
function getList() {
  loading.value = true
  listClassSchedule(queryParams.value).then(response => {
    classScheduleList.value = response.rows
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
    scheduleId: null,
    academicYear: null,
    weekNum: null,
    collegeName: null,
    majorName: null,
    grade: null,
    className: null,
    courseName: null,
    teacherName: null,
    weekday: null,
    section: null,
    location: null,
    scheduleDate: null,
    courseOrder: null,
    courseType: null,
    courseDesc: null,
    credits: null,
    studentCount: null,
    status: null,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    startTime: null,
    endTime: null
  }
  proxy.resetForm("classScheduleRef")
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
  ids.value = selection.map(item => item.scheduleId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加排课信息"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _scheduleId = row.scheduleId || ids.value
  getClassSchedule(_scheduleId).then(response => {
    form.value = response.data
    open.value = true
    title.value = "修改排课信息"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["classScheduleRef"].validate(valid => {
    if (valid) {
      if (form.value.scheduleId != null) {
        updateClassSchedule(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addClassSchedule(form.value).then(response => {
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
  const _scheduleIds = row.scheduleId || ids.value
  proxy.$modal.confirm('是否确认删除排课信息编号为"' + _scheduleIds + '"的数据项？').then(function () {
    return delClassSchedule(_scheduleIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => { })
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('lab/classSchedule/export', {
    ...queryParams.value
  }, `classSchedule_${new Date().getTime()}.xlsx`)
}

getList()
</script>
