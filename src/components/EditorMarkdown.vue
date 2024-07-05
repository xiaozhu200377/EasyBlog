<template>
  <div>
    <v-md-editor v-model="modelvalue" :disabled-menus="[]" :include-level="[1,2,3,4,5,6]" @upload-image="uploadImage" @change="change"></v-md-editor>
  </div>
</template>

<script setup>
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import hljs from 'highlight.js';
import { getCurrentInstance,computed } from 'vue';
const {proxy}=getCurrentInstance();
VMdEditor.use(githubTheme,{
    Hljs:hljs,
});
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});
const modelvalue = computed(() => props.modelValue);
const emit = defineEmits(['update:modelvalue','htmlContent']);
const change = (markdownContent, htmlContent)=>{
    emit('update:modelValue', markdownContent);
    emit('htmlContent', htmlContent);
}
const uploadImage =async (event, insertImage,files) => {
    let result = await proxy.Request({
        url: "file/uploadImage",
        dataType: 'file',
        params: {
            file: files[0],
            type:1
        },
    });
    if (!result) {
        return;
    }
    console.log(result);
    const url = proxy.globalInfo.imageUrl + result.data.fileName;
    insertImage({
        url: url,
        desc:"图片"
    })
}
</script>

<style lang="scss">
.v-md-editor{
    width: calc(100vw - 300px);
    height: calc(100vh - 240px);
}
</style>