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
        <Dialog :title="dialogConfig.title" :buttons="dialogConfig.buttons" @close="dialogConfig.show=false" v-if="dialogConfig.show" width="800px">
            <el-form :model="formData" :rules="rules" ref="setFormDataRef" label-width="80px">
                <el-form-item label="博客分类" prop="categoryId">
                    <el-select clearable placeholder="请选择分类" v-model="formData.categoryId" :style="{width: '100%'}" >
                                <el-option :value="0" label="全部"></el-option>
                                <el-option v-for="item in categoryList" :key="item.id" :value="item.categoryId" :label="item.categoryName"></el-option>
                            </el-select>
                </el-form-item>
                <el-form-item label="封面" prop="cover">
                  <CoverUpload v-model="formData.cover"></CoverUpload>
                </el-form-item>
                <el-form-item label="博客类型" prop="type">
                    <el-radio-group v-model="formData.type">
                      <el-radio :value="0">原创</el-radio>
                       <el-radio :value="1">转载</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="原文地址" prop="reprintUrl" v-if="formData.type==1">
                    <el-input placeholder="请输入原文地址" v-model="formData.reprintUrl" ></el-input>
                </el-form-item>
                <el-form-item label="评论" prop="allowComment">
                  <el-radio-group v-model="formData.allowComment">
                       <el-radio :value="0">不允许</el-radio>
                       <el-radio :value="1">允许</el-radio>
                    </el-radio-group>                
                  </el-form-item>
                <el-form-item label="博客摘要" prop="summary">
                    <el-input placeholder="请输入摘要" v-model="formData.summary"  type="textarea" :autosize="{ minRows: 4, maxRows: 4 }"></el-input>
                </el-form-item>
                <el-form-item label="博客标签" prop="tag">
                  <div>
                    <el-tag v-for="(item,index) in formData.tag" :key="index"  @close="closeTag(index)" closable style="margin-right: 5px;">
                      {{ item }}
                    </el-tag>
                  </div>
                    <span style="color:#626aef;font-size:20px;cursor:pointer;" @click="showAddTag">+</span>
                      <el-input v-model="tagInputValue" style="width: 100px;margin-left:10px;" v-if="isShowTagAdd" placeholder="输入标签" @keyup.enter.native="addTag"></el-input>
                </el-form-item>
            </el-form>
        </Dialog>
    </Window>
  </div>
</template>

<script setup>
import { reactive, ref, getCurrentInstance, nextTick,onMounted } from 'vue';
import CoverUpload from './CoverUpload.vue';
const {proxy}=getCurrentInstance()
const windowConfig = reactive({
    show:false,//是否显示表单
    buttons: [
    {
      type: 'primary',
      text: '确定',
      click: () => {
        showSettingsDialog();
      }
    }
  ]
})
const formData = ref({tag:[]})
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
    { required: true, message: '请选择博客类型', trigger: 'blur' }
  ],
  reprintUrl: [
    { required: true, message: '请输入原文地址', trigger: 'blur' }
  ],
  allowComment: [
    { required: true, message: '请选择是否允许评论', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入博客摘要', trigger: 'blur' }
  ]
}
    
const api = {
  "saveBlog": "/blog/saveBlog",
  "getCategoryList": "/category/loadAllCategory4Blog",
  "getUserInfo": "getUserInfo",
  "getBlogDetail": "/blog/getBlogById",
  "autosaveBlog": "/blog/autoSaveBlog",
}
//自动保存
let timmer = ref(null)//定时器ID
const startTimer = () => {
  timmer.value = setInterval(() => {//timmer.value是定时器的ID
  autoSave()
}, 10000);
}
const stopTimer = () => {
  if (timmer.value) {
    clearInterval(timmer.value)
    timmer.value = null;
  }
}
const autoSave = async () => {
  if ((!formData.value.title &&!formData.value.markdownContent) || timmer.value == null||dialogConfig.show) {//若是未填内容，则不保存
    return;
  }
  const params = {};
  Object.assign(params, formData.value);
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
    formData.value = { tag: [] };
   if (type == 'add') {
      getUserInfo();//新增博客
    }
    else {
      modifyBlog(data.blogId);//修改博客
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
const formDataRef = ref(null)
//第一部提交 显示配置弹框
const showSettingsDialog = () => {
  formDataRef.value.validate(async (valid) => {
    console.log(formData.value.markdownContent)
    if (!valid) {
      return;
    }
    dialogConfig.show = true;
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
//博客设置
const dialogConfig = reactive({
  show:false,//是否显示表单
  title: '编辑设置',
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
//拉取博客分类列表
const categoryList = ref([])
const getCategoryList = async () => {
  let result = await proxy.Request({
    url: api.getCategoryList
  })
  if (!result) {
    return;
  }
  categoryList.value = result.data
}
getCategoryList()
//设置第二个表单数据
const setFormDataRef = ref(null)
const isShowTagAdd = ref(false)
const tagInputValue=ref(null)
const showAddTag = () => {
  isShowTagAdd.value=true
}
//添加标签
const addTag = (event) => {
  console.log("tag",formData.value.tag)
  formData.value.tag.push(tagInputValue.value)
  tagInputValue.value=null
}
//关闭标签
const closeTag = (index) => {
  formData.value.tag.splice(index,1)
}
//提交表单
const submitForm = () => {
  setFormDataRef.value.validate( async (valid) => {
    if (!valid) {
      return;
    }
    let params={}
    formData.value.tag = formData.value.tag.join('|')
    Object.assign(params, formData.value)
    console.log("params",params)
    let result = await proxy.Request({
      url: api.saveBlog,
      params
    }) 
    if (!result) {
      return;
    }
    proxy.Message.success('博客保存成功')
    dialogConfig.show = false;
    windowConfig.show = false;
    emit("callback");//触发父组件拉取表单数据
  })
}

//修改
const modifyBlog = async (blogId) => {
  let result = await proxy.Request({
    url: api.getBlogDetail,
    params: {
      blogId
    }
  })
  if (!result) {
    return;
  }
  formData.value = result.data
  if (formData.value.tag)
  {
    formData.value.tag = formData.value.tag.split('|')
  } else {
    formData.value.tag = []//判断有无tag，若无，则赋值为数组，否则调用push方法会报错
  }
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