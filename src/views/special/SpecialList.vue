<template>
  <div>
    <el-button color="#626aef" class="publish-btn" @click="showEdit('add')">新增专题</el-button>
    <el-row :gutter="10" :style="{'margin-top':'10px'}">
      <el-col :span="14">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>专题</span>
            </div>
          </template>
          <Table :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadDataList" :options="tableOptions" @rowClick="rowClick" ref="dataTableRef">
            <template #cover="{ index, row }">
              <Cover :cover="row.cover"></Cover>
            </template>
            <template #categoryName="{ index, row }">
              <div>{{row.categoryName}}</div>
              <div>作者：{{row.nickName}}</div>
            </template>
            <template #operation="{ index, row }">
              <span v-if="userInfo.userId==row.userId">
                <el-button class="a-link" @click="showEdit('update',row)" >修改</el-button>
              <el-divider direction="vertical"></el-divider>
              <el-button class="a-link" @click="del(row)">删除</el-button>
              </span>
              <span v-else>---</span>
            </template>
        </Table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>专题详情</span>
            </div>
          </template>
          <div class="special-blogh-tree">
          <el-tree class="tree-panel"
                  ref="refTree"
                  :data="blogList"
                  default-expand-all="true"
                  node-key="blogId"
                  :expand-on-click-node="false"
                  :props="treeProps"
                  :highlight-current="true"
                    >
              <template #default="{ node,data }">
                <span class="custom-node-style">
                  <span class="node-title">{{ data.title }}</span>
                  <span class="node-op">
                    <template v-if="data.blogId==='0'">
                      <button class="a-link" @click="editBlog('add',data)" >新增文章</button>
                    </template>
                    <template v-else>
                      <button class="a-link" @click="showDetail(data)">预览</button>
                                    <el-divider direction="vertical"></el-divider>
                      <button class="a-link" @click="editBlog('edit',data)" v-if="userInfo.userId==data.userId">修改</button>
                      <span v-else>---</span>
                                    <el-divider direction="vertical"></el-divider>
                      <button class="a-link" @click="delBlog(data)" v-if="userInfo.userId==data.userId">删除</button>
                      <span v-else>---</span>
                                    <el-divider direction="vertical"></el-divider>
                                      <button class="a-link" @click="editBlog('add',data)">新增下级文章</button>
                    </template>
                  </span>
                </span>
              </template>
          </el-tree>

        </div>
        </el-card>
      </el-col>
    </el-row>
    <Dialog :title="dialogConfig.title" :buttons="dialogConfig.buttons" @close="dialogConfig.show=false" v-if="dialogConfig.show">
      <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="60px">
            <el-form-item label="名称" prop="categoryName">
                <el-input placeholder="请输入名称" v-model="formData.categoryName"></el-input>
            </el-form-item>
            <el-form-item label="封面" prop="cover">
                <CoverUpload v-model="formData.cover"></CoverUpload>
            </el-form-item>
            <el-form-item label="简介" prop="categoryDesc">
                <el-input placeholder="请输入简介" v-model="formData.categoryDesc"  type="textarea" :autosize="{ minRows: 4, maxRows: 4 }"></el-input>
            </el-form-item>
        </el-form>
    </Dialog>
    <BlogEdit ref="blogEditRef" @callback="saveBlog"></BlogEdit>
    <BlogDetail ref="blogDetailRef"></BlogDetail>
  </div>
</template>

<script setup>
import BlogEdit from './BlogEdit.vue';
import BlogDetail from './BlogDetail.vue';
import { getCurrentInstance, nextTick, reactive,ref } from 'vue';
const { proxy } = getCurrentInstance();
const userInfo=ref(proxy.VueCookies.get('userInfo')||{});
const api = {
  "loadDataList": "/category/loadCategory4Special",
  "saveCategory": "/category/saveCategory4Special",
  "delCategory": "/category/delCategory4Special",
  "delBlog":"/blog/recoveryBlog",
  "getSpecialInfo": "/blog/getSpecialInfo",
  "autoSave":"/blog/autoSaveBlog4Special"
}
const columns = [// 定义表格的列
  {
    label: '封面',
    prop: 'cover',
    width: 100,
    scopedslots:"cover"
  },
{
    label: '名称',
    prop: 'categoryName',
    width: 150,
    scopedslots:"categoryName"
  },{
    label: '简介',
    prop: 'categoryDesc',
  },{
    label: '博客数量',
    prop: 'blogCount',
    width:120
  },
  {
    label: '操作',
    prop: 'op',
    width: 120,
    scopedslots:'operation'
  }]
const tableData = reactive({});
const tableOptions = {
  extHeight: 170,
};
const categoryCurrent = ref(null);//当前分类
const dataTableRef = ref(null);
const loadDataList = async (type) => {
  let params = {
        pageNo: tableData.pageNo,
        pageSize: tableData.pageSize,
    }
  let result = await proxy.Request({
    url: api.loadDataList,
    params: params
  })
  if (!result) { return };
  if (type == "add") {//若为新增，则将新增的分类添加到列表中
    tableData.list.push(formData);
  }
  else {
    Object.assign(tableData, result.data);//若为修改，则把后端返回的数据放到列表中
  }
  if (categoryCurrent.value == null && result.data.list.length > 0) {
    categoryCurrent.value = result.data.list[0].categoryId;//默认选中第一个分类
    loadBlogList();
  }
  nextTick(() => {
    dataTableRef.value.setCurrentRow("categoryId",categoryCurrent.value);
  });
}
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

const formData = reactive({});
const formDataRef = ref(null);
const rules = {
  categoryName: [
    { required: true, message: '请输入名称'}
  ],
}
const sharedType = ref('');//区分新增和修改
//新增专题
const showEdit = (type,data) => {
  dialogConfig.show = true;
  sharedType.value = type;
  if (sharedType.value === 'add') {
    dialogConfig.title = '新增分类';
    formData.categoryName = '';
    formData.categoryDesc = '';
    formData.cover = '';
  } else if (sharedType.value === 'update') {
    dialogConfig.title = '修改分类';
    // console.log(data);
    Object.assign(formData,data);
  }
}
const submitForm = () => {//提交表单
  formDataRef.value.validate(async (valid) => {//表单校验
    if (!valid) {
      return;
    }
      let result=await proxy.Request({
        url: api.saveCategory,
        params:formData,
      })
      if (!result) {
        return;
      }
      dialogConfig.show = false;
      proxy.Message.success('操作成功');
      loadDataList(sharedType);//刷新列表
  })
}
//删除专题
const del = (row) => {
  proxy.Comfirm(`确定要删除${row.categoryName}分类吗？`, async(index) => {
    let result = await proxy.Request({
      url: api.delCategory,
      params: {
        categoryId: row.categoryId
      }
    })
    if (!result) {
      return;
    }
    proxy.Message.success('删除成功');
    loadDataList('del');
    categoryCurrent.value = null;
  });
}
const blogList = ref([]);//博客列表
const rowClick = (row) => {
  categoryCurrent.value = row.categoryId;
  loadBlogList();
}
//加载博客列表
const loadBlogList = async () => {
  let result = await proxy.Request({
    url: api.getSpecialInfo,
    params: {
      categoryId: categoryCurrent.value,
      showType:"1"
    }
  })
  if (!result) {
    return;
  }
  // console.log("blogList",result.data);
  blogList.value = result.data;
}
const blogEditRef = ref(null);
const editBlog = (type,data) => {
  blogEditRef.value.init(type,data)
}
//删除博客
const delBlog = (data) => {
  proxy.Comfirm(`确定要删除${data.title}吗？`, async(index) => {
    let result = await proxy.Request({
      url: api.delBlog,
      params: {
        blogId: data.blogId
      }
    })
    if (!result) {
      return;
    }
    proxy.Message.success('删除成功');
    loadBlogList();
  });
}
//保存博客
const saveBlog = (data) => {
  loadBlogList();
}

//预览博客
const blogDetailRef = ref(null);
const showDetail = (data) => {
  blogDetailRef.value.init(data)
}
</script>

<style lang="scss">
.box-card{
  height: calc(100vh - 183px);
  overflow: hidden;
}
.a-link{
  color: rgb(98,106,239);
    border: none;
    background-color: transparent;
    padding: 5px 0;
}
.custom-node-style{
  display:flex;
  flex:1;
  align-items: center;
  justify-content: space-between;
}
</style>