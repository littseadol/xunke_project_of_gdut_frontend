<template>
  <div>
      <el-card style="margin: 20px;">
          <template #header>
              <div class="card-header">
                  <span>办公推送配置</span>
              </div>
          </template>

          <el-form label-width="auto" v-model="form" :rules="rules">

              <el-form-item label="推送到企业微信群" prop="a">

                  <el-select v-model="form.region" placeholder="是否启用">
                      <el-option label="启用" value="shanghai" />
                      <el-option label="不启用" value="beijing" />
                  </el-select>

              </el-form-item>

              <el-form-item label="企业微信群Webhook地址" prop="b">
                  <el-input placeholder="请输入企业微信群Webhook地址"></el-input>
                  <el-tag style="margin-top: 10px;">请先开通企业微信群机器人，并粘贴 Webhook 地址至此。例如：https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=1111111-2222-3333-4444444</el-tag>
              </el-form-item>

              <el-form-item label="推送到钉钉群" prop="c">

                  <el-select v-model="form.region" placeholder="是否启用">
                      <el-option label="启用" value="shanghai" />
                      <el-option label="不启用" value="beijing" />
                  </el-select>

              </el-form-item>

              <el-form-item label="钉钉群Webhook地址" prop="d">
                  <el-input placeholder="请输入钉钉群Webhook地址"></el-input>
                  <el-tag style="margin-top: 10px;">必填，请先开通钉钉群“自定义机器人”，并粘贴 Webhook 地址至此。</el-tag>
              </el-form-item>

              <el-form-item label="加签（选填）">
                  <el-input placeholder="请输入加签"></el-input>
                  <el-tag style="margin-top: 10px;">签名加密用于双向安全验证，需粘贴自定义机器人的“加签地址“至此。</el-tag>
              </el-form-item>

          </el-form>

          <template #footer>
              <el-button type="primary">确定</el-button>
          </template>

      </el-card>

  </div>
</template>

<script setup lang="js">
let form = ref({
    region: null
})

let rules = ref({
    a: [{required: true, message: '请选择是否启用', trigger: 'blur'}],
    b: [{required: true, message: '请输入APP_KEY', trigger: 'blur'}],
    c: [{required: true, message: '请输入短信平台模板ID', trigger: 'blur'}],
    d: [{required: true, message: '请输入短信平台模板ID', trigger: 'blur'}]
})

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