<template>
  <div>
        <div class="search-box">
          <el-form :model="searchFormData"  label-width="80px">
                <el-row>
                    <el-col :span="5">
                        <el-form-item label="昵称" prop="nickName">
                            <el-input placeholder="请输入昵称" v-model="searchFormData.nickNameFuzzy" @keyup.enter.native="loadDataList" clearable="true"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item label="手机号" prop="phone">
                            <el-input placeholder="请输入手机号" v-model="searchFormData.phoneFuzzy" @keyup.enter.native="loadDataList" clearable="true"> </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="3" style="display: flex; justify-content: flex-end;">
                        <el-button color="#626aef" plain @click="loadDataList" >搜索</el-button>
                        <el-button color="#626aef" @click="showEdit('add',row)" v-if="userInfo.roleType == 1">新增成员</el-button>
                    </el-col>
                    
                </el-row>
        </el-form>
        </div>
        <div class="blog-list">
            <Table :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadDataList" :options="tableOptions">
                <!-- 头像 -->
                <template #avatar="{ index, row }">
                    <Cover :cover="row.avatar"></Cover>
                </template>
                <!-- 用户信息 -->
                <template #userInfo="{ index, row }">
                    <div>昵&nbsp;&nbsp;&nbsp;&nbsp;称：{{row.nickName}}</div>
                    <div>手机号：{{row.phone}}</div>
                    <div>职&nbsp;&nbsp;&nbsp;&nbsp;业：{{row.profession}}</div>
                </template>
                <!-- 角色 -->
                <template #roleInfo="{ index, row }">
                    <div>{{ row.roleTypeName }}</div>
                </template>
                <!-- 状态 --> 
                <template #statusInfo="{ index, row }">
                    <div :style="{ color: row.status == 1 ? '#67c23a' : '#f56c6c'}">{{ row.statusName }}</div>
                </template>
                <!-- 时间 -->
                <template #timeInfo="{ index, row }">
                    <div>创建时间：{{ row.createTime }}</div>
                    <div>最后登录时间：{{ row.lastLoginTime }}</div>
                </template>
                <template #operation="{ index, row }">
                    <span v-if="userInfo.roleType == 1">
                      <el-button class="a-link" @click="showEdit('edit',row)">修改</el-button>
                      <el-divider direction="vertical"></el-divider>
                    <el-button class="a-link" @click="changeAccountStatus(row)">{{ row.status == 0 ? '启用' : '禁用' }}</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button class="a-link" @click="delUser(row)">删除</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button class="a-link" @click="showEdit4Pass(row)">修改密码</el-button>
                    </span>
                    <span v-else>---</span>
                </template>
            </Table>
        </div>
        <Dialog :title="dialogConfig.title" :buttons="dialogConfig.buttons" @close="dialogConfig.show=false" v-if="dialogConfig.show" :width="'50%'">
          <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="100px">
                  <el-form-item label="头像" prop="avatar">
                    <CoverUpload v-model="formData.avatar" @callback="uploadSuccess"></CoverUpload>
                  </el-form-item>
                  <el-form-item label="昵称" prop="nickName">
                      <el-input placeholder="请输入昵称" v-model="formData.nickName"></el-input>
                  </el-form-item>
                  <el-form-item label="手机号" prop="phone">
                      <el-input placeholder="请输入手机号" v-model="formData.phone"></el-input>
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
                        <el-form-item label="简介" >
                      <EditorHtml v-model="formData.introduction" :height="200"></EditorHtml>
                  </el-form-item>
        </el-form>
    </Dialog>
    <Dialog :title="editDialogConfig.title" :buttons="editDialogConfig.buttons" @close="closeDialog" v-if="editDialogConfig.show">
          <el-form :model="formData" :rules="rules" ref="pwdFormDataRef" label-width="90px">
                <el-form-item label="密码" prop="password">
                    <el-input placeholder="请输入密码" v-model="formData.password" show-password></el-input>
                </el-form-item>
                <el-form-item label="重复密码" prop="rePassword">
                    <el-input placeholder="请再次输入密码" v-model="formData.rePassword" show-password></el-input>
                </el-form-item>
            </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
import md5 from 'js-md5';
import VueCookies from 'vue-cookies';
const { proxy } = getCurrentInstance()
const userInfo=ref(proxy.VueCookies.get('userInfo')||{});
const searchFormData = reactive({})
const categoryList = ref([])
const tableData = ref([])
const api = {
  "loadUser": "/setting/loadUser",
  "saveTeamer": "setting/saveTeamUser",
  "updateStatus": "setting/updateStatus",
  "delUser": "setting/delUser",
 "updatePassword":"setting/updatePassword"
}

const columns = [// 定义表格的列
  {
    label: '头像',
    prop: 'avatar',
    width: 100,
    scopedslots:"avatar"
  },
{
    label: '用户信息',
    prop: 'nickName',
    scopedslots:"userInfo"
  },{
    label: '默认编辑器',
    prop: 'editorTypeName',
    width: 200,
  },{
    label: '角色',
    prop: 'roleTypeName',
    width: 150,
    scopedslots:"roleInfo"
  },
 {
    label: '状态',
    prop: 'statusInfo',
   width: 150,
    scopedslots:"statusInfo"
    },
    {
        label: '时间',
        prop: 'createTime',
        width: 300,
        scopedslots:"timeInfo"
    },
    {
        label: '操作',
        prop: 'operation',
        width: 230,
        scopedslots:"operation"
    }
]
const tableOptions = {
  extHeight: 50,
};
const loadDataList = async () => {
  let result = await proxy.Request({
    url: api.loadUser,
    params: {
      pageNo:tableData.pageNo,
      pageSize:tableData.pageSize,
      nickNameFuzzy:searchFormData.nickNameFuzzy,
      phoneFuzzy:searchFormData.phoneFuzzy
    }
  })
  if (!result) {
    return;
  }
  tableData.value.list = result.data.list
  tableData.value.totalCount = result.data.totalCount
  proxy.VueCookies.set('loginInfo', tableData.value, "7d")
  let uu=proxy.VueCookies.get('loginInfo')
  console.log("222",uu)
}
loadDataList();
const showEdit = (type, row) => {
  dialogConfig.show = true
  nextTick(async () => {
    formDataRef.value.resetFields()
    if (type === 'add') {
      dialogConfig.title = '新增账号'
      dialogConfig.edit = false
      formData.value = {introduction:""}
    } else {
      dialogConfig.title = '编辑账号'
      dialogConfig.edit = true
      formData.value = row
    }
  });
}
// 新增/编辑用户
const formData = ref({})
const formDataRef = ref(null)
const dialogConfig = reactive({
  show:false,//是否显示表单
  title: '标题',
  buttons: [
    {
      type: 'primary',
      text: '确定',
      click: () => {
        submitForm();
      }
    }
  ]
});
const validateRePass = (rule, value, callback) => {
  if (value !== formData.value.password) {
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
const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = {roleType:1};
    console.log(formData.value)
    Object.assign(params, formData.value)
    delete params.createTime
    delete params.lastLoginTime
    let result =await proxy.Request({
      url: api.saveTeamer,
      params,
    })
    if (!result) {
      return;
    }
    dialogConfig.show = false
    proxy.Message.success('操作成功')
    loadDataList()
  })
}
// 修改用户状态
const changeAccountStatus = (row) => {
  let status = row.status == 0 ? 1 : 0
  let statusName = status == 1 ? '启用' : '禁用'
  proxy.Comfirm(`确定要【${statusName}】${row.nickName}吗？`, async (index) => {
    let result = proxy.Request({
      url: api.updateStatus,
      params: {
        userId: row.userId,
        status
      }
    })
    if (!result) {
      return;
    }
    proxy.Message.success('操作成功')
    loadDataList()
  })
}
// 删除用户
const delUser = (row) => {
  proxy.Comfirm(`确定要删除【${row.nickName}】吗？`, async (index) => {
    let result = proxy.Request({
      url: api.delUser,
      params: {
        userId: row.userId,
      }
    })
    if (!result) {
      return;
    }
    loadDataList()
  })
}
// 修改密码
const pwdFormDataRef = ref(null)
const editDialogConfig = reactive({
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
    // let password = md5(formData.value.password)
    let result = await proxy.Request({
      url: api.updatePassword,
      params: {
        userId: formData.value.userId,
        password: formData.value.password,
        // password: password,
      }
    })
    if (!result) {
      return;
    }
    let loginInfo = {
      account: formData.value.phone,
      password: md5(formData.value.password),
      rememberMe: true,
      userId: formData.value.userId
    }
    VueCookies.set('loginInfo', loginInfo, "7d")
    proxy.Message.success("密码修改成功")
    editDialogConfig.show = false;
  })
}
const showEdit4Pass = (row) => {//设置密码
  editDialogConfig.show = true;
  nextTick(() => {
    pwdFormDataRef.value.resetFields();
    formData.value = {userId: row.userId,phone:row.phone};
  });
}

const closeDialog = () => {
  editDialogConfig.show = false;
}
</script>

<style lang="scss">
.a-link{
  color: rgb(98,106,239);
    border: none;
    background-color: transparent;
    padding: 5px 0;
}
</style>