<template>
  <div>

      <el-card style="margin: 20px;">
          <template #header>
              <div class="card-header">
                  <span>短信推送设置</span>
              </div>
          </template>

          <el-form :model="form" label-width="auto" :rules="rules">

              <el-form-item label="是否推送短信通知" prop="enable">

                  <el-select v-model="form.enable" placeholder="是否启用">
                      <el-option label="启用" value="shanghai" />
                      <el-option label="不启用" value="beijing" />
                  </el-select>

              </el-form-item>

              <el-form-item label="短信平台APP_KEY" prop="appKey">
                  <el-input placeholder="请输入短信平台APP_KEY" v-model="form.appKey"></el-input>
                  <el-tag style="margin-top: 10px;">当前仅支持云片网，请先在云片网进行注册以获取APP_KEY</el-tag>
              </el-form-item>

              <el-form-item label="短信平台模板ID" prop="smsTemplateId">
                  <el-input placeholder="请输入短信平台模板ID" v-model="form.smsTemplateId"></el-input>
                  <el-tag style="margin-top: 10px;">当前仅支持云片网，请先在云片网申请短信模板，然后获取模板ID</el-tag>
              </el-form-item>

              <el-form-item label="短信推送手机号码">
                  <el-input placeholder="请输入短信推送手机号码"></el-input>
                  <el-button type="primary" link icon="Plus" style="margin-top: 10px;">新增手机号码</el-button>

                  <el-table :data="tableData" style="margin-top: 10px;">
                      <el-table-column prop="telephone" label="手机号码" fixed align="center"/>
                      <el-table-column label="操作" fixed align="center">
                          <el-button type="primary" link icon="Delete">删除</el-button>
                      </el-table-column>
                  </el-table>
              </el-form-item>
          </el-form>

          <template #footer>
              <el-button type="primary" style="margin-top: 10px;">确定</el-button>
          </template>

      </el-card>


  </div>
</template>

<script setup lang="js">
let form = ref({
    region: null
})

let rules = ref({
    enable: [{required: true, message: '请选择是否启用', trigger: 'blur'}],
    appKey: [{required: true, message: '请输入APP_KEY', trigger: 'blur'}],
    smsTemplateId: [{required: true, message: '请输入短信平台模板ID', trigger: 'blur'}]
})
let tableData = ref([{telephone: '13454323456'}, {telephone: '13454323456'}, {telephone: '13454323456'}])

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