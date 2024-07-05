<template>
  <div class="editor-html">
    <Toolbar style="border-bottom: 1px solid #ccc"
    :editor="editorRef"
    :defaultConfig="toolbarConfig"
    :mode="mode"/>
    <Editor
    :style="{ height: height + 'px','overflow-y': 'hidden'}"
        v-model="modelvalue"
        :defaultConfig="editorConfig"
        :mode="mode"   
        @onCreated="handleCreated" @onChange="handleChange"/>
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'// 引入 css
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    height: {
        type: String,
        default: 630
    },

});
const modelvalue=computed(()=>props.modelValue)
const mode = ref('default');
const editorRef=shallowRef()
const toolbarConfig ={}
const editorConfig = {
    placeholder: '请输入内容...', MENU_CONF: {
        uploadImage: {
            maxFileSize: 1024 * 1024 * 3, // 3MB
            server: "/api/file/uploadImage4WangEditor",
            customInsert(res, insertFn) {
                insertFn(res.data.url, "", "");
            }
        }
    }
}

const emit = defineEmits()
const handleChange = (editor) => {
        emit('update:modelValue', editor.getHtml());
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
    const editor =editorRef.value
    if (editor == null) return
    editor.destroy()
})
const handleCreated = (editor) => {
    editorRef.value = editor // 记录 editor 实例，重要!
}
</script>

<style lang="scss">
.editor-html{
    border:1px solid #ddd;
    width: 98.9%;
}
</style>