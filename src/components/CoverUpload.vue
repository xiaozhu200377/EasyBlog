<template>
  <div>
    <el-upload name="file" :show-file-list="false" accept=".png,.jpg,.jpeg" :multiple="false" :http-request="uploadImage">
      <div class="cover-upload-btn">
        <template v-if="modelValue">
          <img :src="proxy.globalInfo.imageUrl + modelValue"/>
        </template>
        <span v-else>
          <el-icon style="font-size: 50px;color: rgb(164,164,164);">+</el-icon>
        </span>
      </div>
    </el-upload>
  </div>
</template>


<script setup>
import { ref, getCurrentInstance, computed } from 'vue'
const { proxy } = getCurrentInstance();
const props = defineProps({
  modelValue: {
    type: String,
    ddefault: null
  }
})
const api = {
  uploadUrl:"file/uploadImage"
}
const emit = defineEmits()
const uploadImage = async (file) => {
  let result = await proxy.Request({
    url: api.uploadUrl,
    dataType: "file",
    params: {
      file: file.file,
      type:0,
    }
  })
  const fileName = result.data.fileName
  emit('update:modelValue', fileName);//触发更新modelValue
  emit('callback', fileName)
}
</script>

<style lang="scss">
.cover-upload-btn {
  background-color: #f8f5f5;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  border:2px dashed #ddd;
  img{
    width: 100%;
  }
}
</style>