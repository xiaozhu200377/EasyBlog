<template>
  <div>
    <div class="top-panel">
            <el-form :model="formData"  label-width="80px">
                <el-row>
                    <el-col :span="5">
                        <el-form-item label="标题" prop="titleFuzzy">
                            <el-input placeholder="请输入名称" v-model="formData.titleFuzzy" @keyup.enter.native="loadDataList"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="1" style="display: flex; justify-content: flex-end;">
                        <el-button color="#626aef"  @click="loadDataList" >搜索</el-button>
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
                <template #operation="{ index, row }" >
                    <span v-if="userInfo.userId==row.userId">
                      <el-button class="a-link" @click="recover(row)">还原</el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button class="a-link" @click="del(row)">删除</el-button>
                    </span>
                    <span v-else>---</span>
                </template>
            </Table>
        </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance,nextTick } from 'vue'
import store from '../../store';
import { pa } from 'element-plus/es/locales.mjs';
const formData = reactive({})
const { proxy } = getCurrentInstance();
const userInfo=ref(proxy.VueCookies.get('userInfo')||{});
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
const tableData = reactive([])
const tableOptions = {
  extHeight: 50,
};
const api = {
  "list": "/blog/loadRecoveryList",
  "recover": "/blog/reductionBlog",
  "del": "/blog/delBlog"
}
const loadDataList = async () => {
  let params = {
    pageNo:tableData.pageNo,
    pageSize:tableData.pageSize
  }
  Object.assign(params, formData)
  let result =await proxy.Request({
    url: api.list,
    params
  })
  if (!result) {
    return;
  }
  // console.log(result)
  tableData.list = result.data.list;
  tableData.totalCount = result.data.totalCount;
  formData.titleFuzzy = '';
}
const recover = (row) => {
  proxy.Comfirm(`确定要还原(${row.title})吗？`, async(index) => {
    let result = await proxy.Request({
      url: api.recover,
      params: {
        blogId: row.blogId,
      }
    })
    if (!result) {
      return;
    }
    proxy.Message.success('还原成功');
    loadDataList();
  });
}
const del =async (row) => {
  proxy.Comfirm(`确定要彻底删除(${row.title})吗？`, async(index) => {
    let result = await proxy.Request({
      url: api.del,
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
</script>

<style>
.a-link{
  color: rgb(98,106,239);
    border: none;
    background-color: transparent;
    padding: 5px 0;
}
</style>