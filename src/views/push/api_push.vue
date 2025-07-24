<template>
  <div>

      <el-card style="margin: 20px;">
          <template #header>
              <div class="card-header">
                  <span>接口推送配置</span>
              </div>
          </template>

          <el-form label-width="auto" :rules="rules">

              <el-form-item label="第三方接口地址" prop="a">
                  <el-input placeholder="请输入第三方接口地址"/>
                  <el-tag style="margin-top: 10px;">请填写第三方http接口地址，仅支持post方式；例如：http://domain.com:port/api/alarm_data</el-tag>
              </el-form-item>

              <el-form-item label="是否推送图片" prop="b">

                  <el-select placeholder="是否启用">
                      <el-option label="启用" value="shanghai" />
                      <el-option label="不启用" value="beijing" />
                  </el-select>

                  <el-tag style="margin-top: 10px;">注意，图片以base64字符串形式传递</el-tag>

              </el-form-item>

          </el-form>

          <template #footer>
              <el-button type="primary">确定</el-button>
          </template>

      </el-card>

      <el-card style="margin: 20px;">
          <template #header>
              <div class="card-header">
                  <span>推送数据范围</span>
              </div>
          </template>

          <el-table :data="tableData">
              <el-table-column prop="name" label="参数名称" fixed align="center"/>
              <el-table-column prop="describe" label="参数中文说明" fixed align="center"/>
              <el-table-column prop="type" label="参数类型" fixed align="center"/>
              <el-table-column prop="remark" label="备注" fixed align="center"/>
          </el-table>

      </el-card>

  </div>

</template>

<script setup lang="js">

let rules = ref({
    a: [{required: true, message: '请选择是否启用', trigger: 'blur'}],
    b: [{required: true, message: '请输入APP_KEY', trigger: 'blur'}],
    c: [{required: true, message: '请输入短信平台模板ID', trigger: 'blur'}],
    d: [{required: true, message: '请输入短信平台模板ID', trigger: 'blur'}]
})

let tableData = ref([
  {name: 'cmpn_cd', describe: '公司标识', type: 'string', remark: '固定值TLB'},
  {name: 'camera_id', describe: '摄像头id', type: 'string', remark: ''},
  {name: 'camera_name', describe: '摄像头名称', type: 'string', remark: ''},
  {name: 'algorithm_id', describe: '算法id', type: 'string', remark: ''},
  {name: 'algorithm_name', describe: '算法名称', type: 'string', remark: ''},
  {name: 'level', describe: '告警级别', type: 'string', remark: '固定值：F'},
  {name: 'img_path', describe: '图片路径', type: 'string', remark: ''},
  {name: 'img_ext', describe: '图片扩展名', type: 'string', remark: ''},
  {name: 'img_name', describe: '图片名称', type: 'string', remark: ''},
  {name: 'alarm_dt', describe: '告警时间', type: 'string', remark: 'Yyyy-mm-dd hh:mm:ss'},
  {name: 'report_id', describe: '告警id', type: 'string', remark: 'http://domain:port/report/stream?id=report_id 图片地址'},
  {name: 'params', describe: '告警位置坐标', type: 'string', remark: 'JSON字符串'}
])
</script>

<style scoped lang="scss">
.el-input {
    width: 100%;
}

.el-input-number {
    width: 100%;
}

.el-select {
    width: 100%;
}
</style>