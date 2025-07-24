<template>
  <div>

      <el-card style="margin: 20px;">
          <template #header>
              <div class="card-header">
                  <span>语音推送配置</span>
              </div>
          </template>

          <el-form label-width="auto" :rules="rules">

              <el-form-item label="是否推送语音通知" prop="a">

                  <el-select placeholder="是否启用">
                      <el-option label="启用" value="shanghai" />
                      <el-option label="不启用" value="beijing" />
                  </el-select>

              </el-form-item>

              <el-form-item label="AccessKey ID" prop="b">
                  <el-input placeholder="请输入AccessKey ID"/>
                  <el-tag style="margin-top: 10px;">请在阿里云平台点击您的头像进入【AccessKey管理】。首次需创建新的子用户AccessKey,获取并粘贴ID至此。</el-tag>
              </el-form-item>

              <el-form-item label="AccessKey Secret" prop="c">
                  <el-input placeholder="请输入AccessKey Secret"/>
                  <el-tag style="margin-top: 10px;">当您创建Acceesskey时会附带Secret信息，获取并粘贴Secret至此，请务必妥善保管此信息。</el-tag>
              </el-form-item>

              <el-form-item label="文本转语音模板ID" prop="d">
                  <el-input placeholder="请输入文本转语音模板ID"/>
                  <el-tag style="margin-top: 10px;">请前往【语音服务控制台】的语音消息-语音通知，创建并粘贴“文本转语音模板”下的模板ID。例如TTS_287395390</el-tag>
              </el-form-item>

              <el-form-item label="语音推送手机号码">
                  <el-button type="primary" link icon="Plus">新增手机号码</el-button>

                  <el-table :data="tableData" style="margin-top: 10px;">
                      <el-table-column prop="telephone" label="手机号码" fixed align="center"/>
                      <el-table-column label="关联告警等级" fixed align="center">
                          <el-tag>短信推送</el-tag>
                      </el-table-column>
                      <el-table-column label="操作" fixed align="center">
                          <el-button type="primary" link icon="Edit">编辑</el-button>
                          <el-button type="primary" link icon="Delete">删除</el-button>
                      </el-table-column>
                  </el-table>

                  <el-tag style="margin-top: 10px;">添加可正常收听语音的手机号，并关联已创建的语音推送方式。开通语音服务教程，请联系我们后获取。</el-tag>

              </el-form-item>

          </el-form>

          <template #footer>
              <el-button type="primary">确定</el-button>
          </template>

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
  {telephone:'18203674221'}
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