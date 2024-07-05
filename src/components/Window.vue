<template>
    <div>
        <div class="window" v-if="show">
            <div class="title">
                <div class="iconfont icon-i-back" @click="close"></div>
            </div>
            <div class="body">
                <slot></slot>
            </div>
            <div class="footer">
                <template v-if="buttons&&buttons.length>0|| showCancel">
                    <div class="dialog-footer">
                    <el-button type="cancel" @click="close" v-show="showCancel">取消</el-button>
                    <el-button v-for="button in buttons" :key="button.text" :type="button.type" @click="button.click">{{button.text}}</el-button>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    buttons: {
        type: Array,
    },
    showCancel: {
        type: Boolean,
        default: true
    }
})
const emit= defineEmits(['close'])
const close = () => {
    emit('close')
}
</script>

<style lang="scss">
.window {
    position: absolute;
    top: 0;
    left: 0;
    width: 98.7%;
    height: calc(100vh - 90px);
    background-color: #fff;
    z-index:3;
    .title {
        height: 30px;
        display: flex;
        align-items: center;
        padding-left: 10px;
        .icon-i-back{
            font-size: 20px;
            cursor: pointer;
        }
    }
    .body {
        height: calc(100% - 80px);
        width: 100%;
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
        margin-left: 20px;
    }
    .footer{
        border-top: 1px solid #ddd;
        padding-top: 10px;
        text-align: center;
        line-height: 30px;
    }
}
</style>