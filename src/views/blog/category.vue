<template>
  <div>
    <el-button color="#626aef" class="publish-btn" @click="showEdit('add')" v-if="userInfo.roleType==1">新增分类</el-button>
    <Table :columns="columns" :showPagination="false" :dataSource="tableData" :fetch="loadDataList" :options="tableOptions">
      <template #cover="{ index, row }">
        <Cover :cover="row.cover"></Cover>
      </template>
      <template #operation="{ index, row }" v-if="userInfo.roleType==1">
        <el-button class="a-link" @click="showEdit('update',row)">修改</el-button>
        <el-divider direction="vertical"></el-divider>
        <el-button class="a-link" @click="del(row)">删除</el-button>
        <el-divider direction="vertical"></el-divider>
        <el-button class="a-link" :disabled='index == 0' @click="changeSort(index,'up')">上移</el-button>
        <el-divider direction="vertical"></el-divider>
        <el-button class="a-link" :disabled='index == tableData.list.length-1' @click="changeSort(index,'down')">下移</el-button>
      </template>
    </Table>
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
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive,ref } from 'vue';
const { proxy } = getCurrentInstance();
const userInfo=ref(proxy.VueCookies.get('userInfo')||{});
const api = {
  "loadDataList": "/category/loadAllCategory4Blog",
  "saveCategory": "/category/saveCategory4Blog",
  "delCategory": "/category/delCategory4Blog",
  "sortCategory":"/category/changeCategorySort4Blog"
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
    width:200
  },{
    label: '简介',
    prop: 'categoryDesc',
  },{
    label: '博客数量',
    prop: 'blogCount',
    width:80
  },
{
    label: '操作',
    prop: 'op',
width: 200,
scopedslots:'operation'
  }]
const tableData = reactive({});
const tableOptions = {
  extHeight: 10,
};
const loadDataList =async (type) => {
  let result = await proxy.Request({
    url: api.loadDataList,
  })
  if (!result) { return };
  if (type == "add") {//若为新增，则将新增的分类添加到列表中
    tableData.list.push(formData);
  }
  else {
    tableData.list = result.data;//若为修改，则把后端返回的数据放到列表中
  }
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
const sharedType=ref('');//区分新增和修改
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
    Object.assign(formData,data);
  }
}
const submitForm = () => {//提交表单
  formDataRef.value.validate(async (valid) => {//表单校验
    if (!valid) {
      return;
    }
      console.log("initcover",formData);
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


//删除
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
  });
}

//排序
const changeSort =async (index, type) => {
  let List = tableData.list;
  let temp = List[index];
  let number = type == 'up' ? -1 : 1;
  List.splice(index, 1);
  List.splice(index + number, 0, temp);
  console.log("列表",List);
  let result = await proxy.Request({
    url: api.sortCategory,
    dataType: 'json',
    params: List
  })
  if (!result) {
    return;
  }
  proxy.Message.success('排序成功');
  loadDataList('sort');
}

const handleCoverChange = () => {
  console.log("cover change", formData.cover);
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