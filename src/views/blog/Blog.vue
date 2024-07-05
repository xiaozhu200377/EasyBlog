<template>
    <div>
        <div class="top-panel">
            <el-form :model="searchFormData"  label-width="80px">
                <el-row>
                    <el-col :span="5">
                        <el-form-item label="标题" prop="titleFuzzy">
                            <el-input placeholder="请输入名称" v-model="searchFormData.titleFuzzy" @keyup.enter.native="loadDataList"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item label="状态" prop="status">
                            <el-select clearable placeholder="请选择状态" v-model="searchFormData.status" :style="{width: '100%'}">
                                <el-option :value="0" label="草稿"></el-option>
                                <el-option :value="1" label="已发布"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item label="分类" prop="categoryId">
                            <el-select clearable placeholder="请选择分类" v-model="searchFormData.categoryId" :style="{width: '100%'}" >
                                <el-option v-for="item in categoryList" :key="item.id" :value="item.categoryId" :label="item.categoryName"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="3" style="display: flex; justify-content: flex-end;">
                        <el-button color="#626aef" plain @click="loadDataList" >搜索</el-button>
                        <el-button color="#626aef" @click="showEdit('add',row)">新增博客</el-button>
                    </el-col>
                    
                </el-row>
        </el-form>
        </div>
        <div class="blog-list">
            <Table :columns="columns" :showPagination="true" :dataSource="tableData" :fetch="loadDataList" :options="tableOptions">
                <!-- 封面 -->
                <template #cover="{ index, row }">
                    <Cover :cover="row.cover"></Cover>
                </template>
                <!-- 文章信息 -->
                <template #blogInfo="{ index, row }">
                    <div>标题：{{row.title}}</div>
                    <div>分类：{{row.categoryName}}</div>
                    <div>作者：{{row.nickName}}</div>
                </template>
                <!-- 类型 -->
                <template #typeName="{ index, row }">
                    <div>类型：{{ row.type==0?'原创':'转载' }}</div>
                    <div v-if="row.type==1">转载地址：{{ row.reprintUrl }}</div>
                </template>
                <!-- 时间 -->
                <template #time="{ index, row }">
                    <div>创建时间：{{ row.createTime }}</div>
                    <div>更新时间：{{ row.lastUpdateTime }}</div>
                </template>
                <template #operation="{ index, row }">
                    <span v-if="userInfo.userId==row.userId">
                        <el-button class="a-link" @click="showEdit('edit',row)" >修改</el-button>
                        <el-divider direction="vertical"></el-divider>
                        <el-button class="a-link" @click="del(row)">删除</el-button>
                        <el-divider direction="vertical"></el-divider>
                    </span>
                    <el-button class="a-link" @click="preview(row)">预览</el-button>
                </template>
            </Table>
            <BlogEdit ref="blogEditRef" @callback="loadDataList"></BlogEdit>
            <BlogDetail ref="blogDetailRef" ></BlogDetail>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
import BlogEdit from '@/components/BlogEdit.vue';
const searchFormData = reactive({});
const categoryList = ref([]);
const { proxy } = getCurrentInstance();
const userInfo=ref(proxy.VueCookies.get('userInfo')||{});
const api = {
    "loadCategoryList": "/category/loadAllCategory4Blog",//拉取分类
    "loadDataList": "/blog/loadBlog",
    "delBlog":"/blog/recoveryBlog"
}
const loadCategoryList =async () => {//获取分类
    let result = await proxy.Request({
        url: api.loadCategoryList,
    });
    if (!result) {
        return;
    }
    categoryList.value = result.data;
}
loadCategoryList();//一加载页面就加载分类列表

const columns = [// 定义表格的列
  {
    label: '封面',
    prop: 'cover',
    width: 100,
    scopedslots:"cover"
  },
{
    label: '文章信息',
    prop: 'blogInfo',
    scopedslots:"blogInfo"
  },{
    label: '编辑器',
    prop: 'editorTypeName',
    width: 200,
  },{
    label: '类型',
    prop: 'typeName',
    width: 150,
    scopedslots:"typeName"
  },
{
    label: '评论',
    prop: 'allowCommentTypeName',
    width: 150,
    }, {
    label: '状态',
    prop: 'statusName',
    width: 150,
    },
    {
        label: '时间',
        prop: 'time',
        width: 250,
        scopedslots:"time"
    },
    {
        label: '操作',
        prop: 'op',
        width: 200,
        scopedslots:"operation"
    }
]

const tableData = reactive({});
const tableOptions = {
  extHeight: 50,
};
const loadDataList = async () => {
    let params = {
        pageNo: tableData.pageNo,
        pageSize: tableData.pageSize,
    }
    Object.assign(params, searchFormData);//将搜索条件合并到请求参数中
    // console.log("params", params);
    let result = await proxy.Request({
      url: api.loadDataList,
        params,
  })
    if (!result) { return };
    tableData.list = result.data.list;
    tableData.totalCount = result.data.totalCount;//获取分页器
    searchFormData.titleFuzzy = '';//清空搜索条件
}
const blogEditRef = ref(null);
const showEdit = (type, data) => {
    blogEditRef.value.init(type,data);//调用子组件的init方法初始化编辑器
}
const del = async (row) => {
     proxy.Comfirm(`确定要删除(${row.title})吗？`, async(index) => {
    let result = await proxy.Request({
      url: api.delBlog,
      params: {
        blogId: row.blogId,
      }
    })
    if (!result) {
      return;
    }
    proxy.Message.success('删除成功');
    loadDataList();
  });
}
const blogDetailRef = ref(null);
//预览
const preview = (row) => {
    blogDetailRef.value.init(row);//调用子组件的init方法初始化编辑器
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