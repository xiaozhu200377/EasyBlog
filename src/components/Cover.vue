<template>
  <div class="cover">
        <img :src="proxy.globalInfo.imageUrl + cover" alt="" v-if="cover">
        <img src="../assets/login-bg.jpg" alt="" v-else>
    </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();
const props = defineProps({//定义从父组件接受的参数名
  cover: {
    type: String,
  },top: {
    type: Boolean,
    default: true
  }
})
</script>

<style lang="scss">
.cover{
  background-color: #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 60px;
  overflow: hidden;
  img {
    width:100%;
  }
}
</style>