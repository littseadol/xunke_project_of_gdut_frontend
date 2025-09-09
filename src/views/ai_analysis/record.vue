<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备ID" prop="deviceId">
        <el-input
          v-model="queryParams.deviceId"
          placeholder="请输入关联设备ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="录像名称" prop="recordName">
        <el-input
          v-model="queryParams.recordName"
          placeholder="请输入录像名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker clearable
          v-model="queryParams.startTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择录像开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker clearable
          v-model="queryParams.endTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择录像结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="录像时长" prop="duration">
        <el-input
          v-model="queryParams.duration"
          placeholder="请输入录像时长(秒)"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['record:record:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['record:record:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['record:record:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['record:record:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="录像ID" align="center" prop="recordId" />
      <el-table-column label="关联设备ID" align="center" prop="deviceId" />
      <el-table-column label="录像名称" align="center" prop="recordName" />
      <el-table-column label="录像存储路径" align="center" prop="recordPath" />
      <el-table-column label="录像访问URL" align="center" prop="recordUrl" />
      <el-table-column label="录像开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="录像结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="录像时长(秒)" align="center" prop="duration" />
      <el-table-column label="文件大小(字节)" align="center" prop="fileSize" />
      <el-table-column label="分辨率" align="center" prop="resolution" />
      <el-table-column label="录像类型" align="center" prop="recordType" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['record:record:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['record:record:remove']">删除</el-button>
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

    <!-- 添加或修改录像管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="recordRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联设备ID" prop="deviceId">
          <el-input v-model="form.deviceId" placeholder="请输入关联设备ID" />
        </el-form-item>
        <el-form-item label="录像名称" prop="recordName">
          <el-input v-model="form.recordName" placeholder="请输入录像名称" />
        </el-form-item>
        <el-form-item label="录像存储路径" prop="recordPath">
          <el-input v-model="form.recordPath" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="录像访问URL" prop="recordUrl">
          <el-input v-model="form.recordUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="录像开始时间" prop="startTime">
          <el-date-picker clearable
            v-model="form.startTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择录像开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="录像结束时间" prop="endTime">
          <el-date-picker clearable
            v-model="form.endTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择录像结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="录像时长(秒)" prop="duration">
          <el-input v-model="form.duration" placeholder="请输入录像时长(秒)" />
        </el-form-item>
        <el-form-item label="文件大小(字节)" prop="fileSize">
          <el-input v-model="form.fileSize" placeholder="请输入文件大小(字节)" />
        </el-form-item>
        <el-form-item label="分辨率(如1920x1080)" prop="resolution">
          <el-input v-model="form.resolution" placeholder="请输入分辨率(如1920x1080)" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-divider content-position="center">${subTable.functionName}信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddAiDevice">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteAiDevice">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="aiDeviceList" :row-class-name="rowAiDeviceIndex" @selection-change="handleAiDeviceSelectionChange" ref="aiDevice">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50"/>
          <el-table-column label="$comment" prop="deviceName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.deviceName" placeholder="请输入$comment" />
            </template>
          </el-table-column>
          <el-table-column label="$comment" prop="rtspUrl" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.rtspUrl" placeholder="请输入$comment" />
            </template>
          </el-table-column>
          <el-table-column label="$comment" prop="snapshotUrl" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.snapshotUrl" placeholder="请输入$comment" />
            </template>
          </el-table-column>
          <el-table-column label="$comment" prop="identifyInterval" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.identifyInterval" placeholder="请输入$comment" />
            </template>
          </el-table-column>
          <el-table-column label="$comment" prop="alarmInterval" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.alarmInterval" placeholder="请输入$comment" />
            </template>
          </el-table-column>
          <el-table-column label="0表示在分屏显示，1表示在分屏不显示" prop="checkStatus" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.checkStatus" placeholder="请选择0表示在分屏显示，1表示在分屏不显示">
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="设备经度" prop="deviceLng" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.deviceLng" placeholder="请输入设备经度" />
            </template>
          </el-table-column>
          <el-table-column label="设备纬度" prop="deviceLat" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.deviceLat" placeholder="请输入设备纬度" />
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="Record">
import { listRecord, getRecord, delRecord, addRecord, updateRecord } from "@/api/ai_analysis/record.js"

const { proxy } = getCurrentInstance()

const recordList = ref([])
const aiDeviceList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const checkedAiDevice = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    deviceId: null,
    recordName: null,
    recordPath: null,
    recordUrl: null,
    startTime: null,
    endTime: null,
    duration: null,
    fileSize: null,
    resolution: null,
    recordType: null,
    status: null,
  },
  rules: {
    deviceId: [
      { required: true, message: "关联设备ID不能为空", trigger: "blur" }
    ],
    recordName: [
      { required: true, message: "录像名称不能为空", trigger: "blur" }
    ],
    recordPath: [
      { required: true, message: "录像存储路径不能为空", trigger: "blur" }
    ],
    startTime: [
      { required: true, message: "录像开始时间不能为空", trigger: "blur" }
    ],
    endTime: [
      { required: true, message: "录像结束时间不能为空", trigger: "blur" }
    ],
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询录像管理列表 */
function getList() {
  loading.value = true
  listRecord(queryParams.value).then(response => {
    recordList.value = response.rows
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
    recordId: null,
    deviceId: null,
    recordName: null,
    recordPath: null,
    recordUrl: null,
    startTime: null,
    endTime: null,
    duration: null,
    fileSize: null,
    resolution: null,
    recordType: null,
    status: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
    remark: null
  }
  aiDeviceList.value = []
  proxy.resetForm("recordRef")
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
  ids.value = selection.map(item => item.recordId)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加录像管理"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const _recordId = row.recordId || ids.value
  getRecord(_recordId).then(response => {
    form.value = response.data
    aiDeviceList.value = response.data.aiDeviceList
    open.value = true
    title.value = "修改录像管理"
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["recordRef"].validate(valid => {
    if (valid) {
      form.value.aiDeviceList = aiDeviceList.value
      if (form.value.recordId != null) {
        updateRecord(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功")
          open.value = false
          getList()
        })
      } else {
        addRecord(form.value).then(response => {
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
  const _recordIds = row.recordId || ids.value
  proxy.$modal.confirm('是否确认删除录像管理编号为"' + _recordIds + '"的数据项？').then(function() {
    return delRecord(_recordIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess("删除成功")
  }).catch(() => {})
}

/** ${subTable.functionName}序号 */
function rowAiDeviceIndex({ row, rowIndex }) {
  row.index = rowIndex + 1
}

/** ${subTable.functionName}添加按钮操作 */
function handleAddAiDevice() {
  let obj = {}
  obj.deviceName = ""
  obj.rtspUrl = ""
  obj.snapshotUrl = ""
  obj.identifyInterval = ""
  obj.alarmInterval = ""
  obj.checkStatus = ""
  obj.deviceLng = ""
  obj.deviceLat = ""
  aiDeviceList.value.push(obj)
}

/** ${subTable.functionName}删除按钮操作 */
function handleDeleteAiDevice() {
  if (checkedAiDevice.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的${subTable.functionName}数据")
  } else {
    const aiDevices = aiDeviceList.value
    const checkedAiDevices = checkedAiDevice.value
    aiDeviceList.value = aiDevices.filter(function(item) {
      return checkedAiDevices.indexOf(item.index) == -1
    })
  }
}

/** 复选框选中数据 */
function handleAiDeviceSelectionChange(selection) {
  checkedAiDevice.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('record/record/export', {
    ...queryParams.value
  }, `record_${new Date().getTime()}.xlsx`)
}

getList()
</script>
