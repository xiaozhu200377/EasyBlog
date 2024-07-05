<template>
  <div>
    <Window :buttons="windowConfig.buttons"  @close="closeWindow" :show="windowConfig.show">
        <el-form :model="formData" :rules="rules" ref="formDataRef" class="form-style">
            <el-form-item  prop="title">
                <div class="title-input">
                    <el-input placeholder="请输入标题" v-model="formData.title"></el-input>
                </div>
            </el-form-item>
            <el-form-item prop="markdownContent">
            <div :style="{'width':'100%'}">
                <EditorHtml v-model="formData.markdownContent" v-if="formData.editorType==0" @htmlContent="setHtmlContent"></EditorHtml>
                <EditorMarkdown v-model="formData.markdownContent" @htmlContent="setHtmlContent"  v-else></EditorMarkdown>
                </div>
        </el-form-item>
        </el-form>
    </Window>
  </div>
</template>

<script setup>
import { reactive, ref, getCurrentInstance, nextTick,onMounted } from 'vue';
const {proxy}=getCurrentInstance()
const windowConfig = reactive({
    show:false,//是否显示表单
    buttons: [
    {
      type: 'primary',
      text: '确定',
      click: () => {
        submitBlog();
      }
    }
  ]
})
const formData = ref({  })
const formDataRef = ref(null)
const rules = {
  title: [
       { required: true, message: '请输入标题', trigger: 'blur' }
  ],
  markdownContent: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择博客分类', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择博客类型',trigger: 'change' }
  ],
  reprintUrl: [
    { required: true, message: '请输入原文地址', trigger: 'blur' }
  ],
  allowComment: [
    { required: true, message: '请选择是否允许评论',trigger: 'change' }
  ],
  summary: [
    { required: true, message: '请输入博客摘要', trigger: 'blur' }
  ]
}
    
const api = {
  "saveBlog": "/blog/saveBlog4Special",
  "getUserInfo": "getUserInfo",
  "getBlogDetail": "/blog/getBlogById",
  "autosaveBlog": "/blog/autoSaveBlog4Special",

}
//自动保存
let timmer = ref(null)//定时器ID
const startTimer = () => {
  timmer.value = setInterval(() => {//timmer.value是定时器的ID
  autoSave()
}, 5000);
}
const stopTimer = () => {
  if (timmer.value) {
    clearInterval(timmer.value)
    timmer.value = null;
  }
}
const autoSave = async () => {
  if ((!formData.value.title &&!formData.value.markdownContent) || timmer.value == null) {//若是未填内容，则不保存
    return;
  }
  let params = Object.assign({}, formData.value);
  console.log("自动保存",params)
  let result = await proxy.Request({
    url: api.autosaveBlog,
    params,
    showLoading: false
  })
  if(!result){
    return;
  }
  formData.value.blogId = result.data
    console.log("自动保存成功",result)
}
onMounted(() => {
    stopTimer();
});
const init = (type, data) => {
  startTimer();//启动自动保存
  windowConfig.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = { categoryId:data.categoryId,pBlogId:data.blogId};
   if (type == 'add') {
      getUserInfo();//新增博客
    }
    else {
      modifyBlog(data);//修改博客
    }
 })
}
//暴露给父组件调用
defineExpose({
  init
})
const getUserInfo =async () => {//获取编辑器的类型
  let result =await proxy.Request({
    url: api.getUserInfo
  })
  if (!result) {
    return;
  }
  formData.value.editorType = result.data.editorType
}
//第一部提交 显示配置弹框
const submitBlog = () => {
  formDataRef.value.validate(async (valid) => {
    console.log(formData.value.markdownContent)
    if (!valid) {
      return;
    }
    let params = {};
    Object.assign(params, formData.value);
    let result = await proxy.Request({
      url: api.saveBlog,
      params,
    })
    if (!result) {
      return;
    }
    proxy.Message.success("保存成功");
    closeWindow();
  })
  
}
//正文设置
const setHtmlContent = (htmlContent) => {
  formData.value.content = htmlContent
}
const emit=defineEmits(['callback'])
const closeWindow = () => {
    emit("callback");
  windowConfig.show = false;
    if (timmer.value) {//清除定时器
    stopTimer();
  }
}

//修改博客
const modifyBlog = async (data) => {
  let result = await proxy.Request({
    url: api.getBlogDetail,
    params: {
      blogId: data.blogId
    }
  })
  if (!result) {
    return;
  }
  formData.value = result.data;
}
</script>

<style lang="scss">
.form-style{
    padding-left:10px ;
}
.title-input{
    .el-input__wrapper{
    box-shadow: none;
    }
    border: none;
    border-bottom: 1px solid #ddd;
    width:calc(100% - 10px);
}
</style>