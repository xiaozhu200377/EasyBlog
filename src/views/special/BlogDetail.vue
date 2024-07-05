<template>
  <div>
    <Window :show="windowConfig.show"  :buttons="windowConfig.buttons" @close="() => { windowConfig.show = false }" :showCancel="false" >
        <el-row :gutter="10">
          <el-col :span="10">
              <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>专题文章</span>
            </div>
          </template>
          <div class="special-blogh-tree">
          <el-tree class="tree-panel"
                  ref="refTree"
                  :data="blogList"
                  default-expand-all="true"
                  :expand-on-click-node="false"
                  :highlight-current="true"
                    >
              <template #default="{ node,data }" >
                <span class="custom-node-style" >
                  <span class="node-title" @click="selectBlog(data)" :class="{ active: currentBlogId === data.blogId }">{{ data.title }}</span>
                </span>
              </template>
          </el-tree>
        </div>
        </el-card>
          </el-col>
          <el-col :span="14">
            <el-card>
              <template #header>
            <div class="card-header">
              <span>文章详情</span>
            </div>
          </template>
              <div class="blog-title">{{ blog.title }}</div>
              <div v-html="blog.content" class="content"></div>
            </el-card>
          </el-col>
        </el-row>
    </Window>
  </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
const blog = ref({})
const { proxy } = getCurrentInstance();
const api = {
  "getBlogDetail": "/blog/getBlogById",
      "getSpecialInfo": "/blog/getSpecialInfo",
}
const windowConfig = reactive({
    show: false,
    buttons: [
    {
      type: 'primary',  
      text: '确定',
      click: () => {
        windowConfig.show = false;
      }
    }
  ]
})
const init = async (data) => {
  windowConfig.show = true;
    let result = await proxy.Request({
        url: api.getBlogDetail,
        params: {
          blogId: data.blogId,
        }
    })
    if (!result) {
        return;
    }
  blog.value = result.data
  nextTick(() => {
  let blocks = document.querySelectorAll("pre code");
  if (blocks.length > 0) {
    blocks.forEach((block) => {
      hljs.highlightBlock(block);
    });
  }
  loadBlogList(data);
  currentBlogId.value = data.blogId;
})
}
defineExpose({
    init
})
const blogList = ref([]);//博客列表
const currentBlogId = ref(null);
//加载博客列表
const loadBlogList = async (data) => {
  let result = await proxy.Request({
    url: api.getSpecialInfo,
    params: {
      categoryId: data.categoryId,
      showType:"1"
    }
  })
  if (!result) {
    return;
  }
  blogList.value = result.data;
}
const selectBlog = (data) => {
  currentBlogId.value = data.blogId;
  init({
    blogId: data.blogId,
    categoryId: data.categoryId
  });
}
</script>

<style lang="scss">
  .blog-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}
.content{
  code{
    padding:5px;
    margin: 10px 0;
    background-color:rgb(231, 231, 231);
    border-radius:5px;
    font-size:17px;
  }
  blockquote {
    padding:10px 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    background-color: rbg(231, 231, 231);
}
}
.active{
  color: rgb(98,106,239);
  font-size: large;
}
</style>