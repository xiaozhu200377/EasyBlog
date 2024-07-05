<template>
  <div>
    <el-form :model="formData" :rules="rules" ref="formDataRef" :label-width="'400px'" :style="{width: '50%'}">
                  <el-form-item label="是否开启评论/留言板" prop="openCommentType">
                <el-radio-group v-model="formData.openCommentType">
                  <el-radio label="是" :value="1"></el-radio>
                  <el-radio label="否" :value="0"></el-radio>
                </el-radio-group>
            </el-form-item>
            <template v-if="formData.openCommentType === 1">
              <el-form-item label="畅言appId" prop="changyanAppId">
                <el-input v-model="formData.changyanAppId" :maxlength="50"></el-input>
              </el-form-item>
              <el-form-item label="畅言appKey" prop="changyanAppKey">
                <el-input v-model="formData.changyanAppKey" :maxlength="50"></el-input>
              </el-form-item>
            </template>
            <el-form-item label="是否开启Git Pages" prop="gitPagesType">
                <el-radio-group v-model="formData.gitPagesType">
                  <el-radio label="是" :value="1"></el-radio>
                  <el-radio label="否" :value="0"></el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="是否开启公安备案和ICP备案信息" prop="showIcp">
                <el-radio-group v-model="formData.showIcp">
                  <el-radio label="是" :value="1"></el-radio>
                  <el-radio label="否" :value="0"></el-radio>
                </el-radio-group>
            </el-form-item>
            <template v-if="formData.showIcp === 1">
              <el-form-item label="ICP备案域名" prop="icpDomain">
                <el-input v-model="formData.icpDomain" :maxlength="200"></el-input>
              </el-form-item>
              <el-form-item label="公安备案省份" prop="policeProvince">
                <el-select v-model="formData.policeProvince" clearable="true" showSearch placeholder="请选择省份">
                  <el-option v-for="(item, index) in provinceList" :key="index" :label="item" :value="item">

                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="公安备案号" prop="policeNo">
                <el-input v-model="formData.policeNo" :maxlength="100"></el-input>
              </el-form-item>
            </template>
            <el-form-item label="下载静态页面" prop="icp">
              <span @click="createZip" style="color: rgb(98,106,239);">点击下载</span>
            </el-form-item>
            <el-form-item>
              <el-button color="#626aef" @click="submitForm">保存</el-button>
            </el-form-item>
        </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance,nextTick } from 'vue'
import store from '../../store';
import { pa } from 'element-plus/es/locales.mjs';
const formDataRef = ref(null)
const formData = reactive({})
const { proxy } = getCurrentInstance();
const api = {
  "getSysSetting": "sysSetting/getSysSetting",
  "saveSysSetting": "sysSetting/saveSysSetting",
  "createZip":"sysSetting/createZip"
}
const provinceList=["京","津","冀","晋","蒙","辽","吉","黑","沪","苏","浙","皖","闽","赣","鲁","豫","鄂","湘","粤","桂","琼","川","贵","云","藏","陕","甘","青","宁","新","警","学","O"]
const rules = {
  openCommentType: [
    { required: true, message: '请选择是否开启评论/留言板', trigger: 'blur' }
  ],
  gitPagesType: [
    { required: true, message: '请选择是否开启Git Pages', trigger: 'blur' }
  ],
  showIcp: [
    { required: true, message: '请选择是否开启公安备案和ICP备案信息', trigger: 'blur' }
  ],
  changyanAppId: [
    { required: true, message: '请输入畅言appId', trigger: 'blur' },
  ],
  changyanAppKey: [
    { required: true, message: '请输入畅言appKey', trigger: 'blur' },
  ],
  icpDomain: [
    { required: true, message: '请输入ICP备案域名', trigger: 'blur' },
  ],
  icpNo: [
    { required: true, message: '请输入ICP备案号', trigger: 'blur' }
  ],
  policeProvince: [
    { required: true, message: '请选择公安备案省份', trigger: 'blur' }
  ],
  policeNo: [
    { required: true, message: '请输入公安备案号', trigger: 'blur' }
  ]
}
const getSysSetting = async () => {
  let result = await proxy.Request({
    url: api.getSysSetting,
  })
  if (!result) {
    return;
  }
  Object.assign(formData, result.data)
}
getSysSetting();
const submitForm =  () => {
  formDataRef.value.validate(async(valid) => {
    if (!valid) {
      return;
    }
      let result = await proxy.Request({
        url: api.saveSysSetting,
        params: formData
      })
      if (result) {
        proxy.Message.success('保存成功')
      }
  })
}
const createZip = async () => {
  let result = await proxy.Request({
    url: api.createZip,
  })
  if (!result) {
    return;
  }
  document.location.href ="/api/file/download/" +result.data+"/"+encodeURI("静态页面.zip");
}
</script>

<style lang="scss">

</style>