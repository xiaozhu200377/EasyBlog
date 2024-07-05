<template>
  <div>
    <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="100px">
            <el-row :gutter="10">
                <el-col :span="8">
                  <el-form-item label="头像" prop="avatar">
                <CoverUpload v-model="formData.avatar" @callback="uploadSuccess"></CoverUpload>
            </el-form-item>
            <el-form-item label="昵称" prop="nickName">
                <el-input placeholder="请输入昵称" v-model="formData.nickName"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input placeholder="请输入手机号" v-model="formData.phone"></el-input>
            </el-form-item>
            <el-form-item label="密码">
                <el-button @click="setpsd" class="a-link">修改密码</el-button>
            </el-form-item>
            <el-form-item label="默认编辑器" prop="editorType">
                <el-radio-group v-model="formData.editorType">
                  <el-radio label="富文本编辑器" :value="0"></el-radio>
                  <el-radio label="markdown编辑器" :value="1"></el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="职业" prop="profession">
                <el-select placeholder="请输入职业" v-model="formData.profession" clearable>
                  <el-option label="后端开发工程师" value="后端开发工程师"></el-option>
                  <el-option label="前端开发工程师" value="前端开发工程师"></el-option>
                  <el-option label="测试员" value="测试员"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="">
                <el-button color="#626aef"  @click="saveMyInfo" >保存</el-button>
            </el-form-item>
                </el-col>
                <el-col :span="16">
                  <el-form-item label="简介" >
                <EditorHtml v-model="formData.introduction"></EditorHtml>
            </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <Dialog :title="dialogConfig.title" :buttons="dialogConfig.buttons" @close="closeDialog" v-if="dialogConfig.show">
          <el-form :model="pwdFormData" :rules="rules" ref="pwdFormDataRef" label-width="90px">
                <el-form-item label="密码" prop="password">
                    <el-input placeholder="请输入密码" v-model="pwdFormData.password" show-password></el-input>
                </el-form-item>
                <el-form-item label="重复密码" prop="rePassword">
                    <el-input placeholder="请再次输入密码" v-model="pwdFormData.rePassword" show-password></el-input>
                </el-form-item>
            </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance,nextTick } from 'vue'
import store from '../../store';
const formDataRef = ref(null)
const formData = ref({})
const { proxy } = getCurrentInstance();
const validateRePass = (rule, value, callback) => {
  if (value !== pwdFormData.value.password) {
    callback(new Error(rule.message))
  } else {
    callback()
  }
}
const rules = {
  nickName: [
    { required: true, message: '请输入昵称'}
  ],
  phone: [
    { required: true, message: '请输入手机号'},
    {
      validator: proxy.Verify.phone,
      message: '请输入正确的手机号',
    }
  ],
  editorType: [
    { required: true, message: '请选择编辑器类型', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    {
      validator: proxy.Verify.password,
      message: '密码至少8位，只能包含数字字母和特殊字符',
    }
  ],
  rePassword: [
    { required: true, message: '请确认密码' },
    {
      validator: validateRePass,
      message: '两次密码输入不一致',
    }
  ],
}

const api = {
  "getUserInfo": "getUserInfo",
  "saveMyInfo": "saveMyInfo",
  "setPassword": "updateMyPassword",
  "saveAvatar":"saveAvatar"
}
const getUserInfo =async () => {
  let result = await proxy.Request({
    url: api.getUserInfo,
  })
  if (!result) {
    return;
  }
  formData.value=result.data
}
getUserInfo();
//保存个人信息
const saveMyInfo =  () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.saveMyInfo,
      params: {
        nickName: formData.value.nickName,
        phone: formData.value.phone,
        editorType: formData.value.editorType,
        profession: formData.value.profession,
        introduction: formData.value.introduction,
        avatar: formData.value.avatar,
      }
    })
    if (!result) {
      return;
    }
    proxy.Message.success("保存成功")
    store.commit('updateUserInfo', {
      nickName: formData.value.nickName,
      avatar:formData.value.avatar,
  })
  })
}
//修改头像
const uploadSuccess = async (avatar) => {
  let result = await proxy.Request({
    url: api.saveAvatar,
    params: {
      avatar: avatar,
    }
  })
  if (!result) {
    return;
  }
  proxy.Message.success("头像保存成功")
  store.commit('updateUserInfo', {
    avatar: avatar,
    nickName: formData.value.nickName,
  })
}

//设置密码
const pwdFormData = ref({})
const pwdFormDataRef = ref(null)
const dialogConfig = reactive({
  show:false,//是否显示表单
  title: '修改密码',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: () => {
        submitpwdForm();
      }
    }
  ]
});
const submitpwdForm = async () => {
  pwdFormDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.setPassword,
      params: {
        password: pwdFormData.value.password,
      }
    })
    if (!result) {
      return;
    }
    proxy.Message.success("密码修改成功")
    dialogConfig.show = false;
  })
}
const setpsd = () => {//设置密码
  dialogConfig.show = true;
  nextTick(() => {
    pwdFormDataRef.value.resetFields();
    pwdFormData.value = {};
  });
}

const closeDialog = () => {
  dialogConfig.show = false;
}
</script>

<style lang="scss">
.a-link{
  color: rgb(98,106,239);
    border: none;
    background-color: transparent;
    padding: 5px 0;
    cursor: pointer;
}
</style>