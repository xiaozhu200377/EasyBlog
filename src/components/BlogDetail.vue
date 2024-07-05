<template>
  <div>
    <Window :show="windowConfig.show"  :buttons="windowConfig.buttons" @close="() => { windowConfig.show = false }" :showCancel="false" >
        <div class="blog-title">{{ blog.title }}</div>
        <div v-html="blog.content" class="content"></div>
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
            blogId:data.blogId
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
  } else {
    console.log("没有找到代码块");
  }
})
}
defineExpose({
    init
})

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

</style>