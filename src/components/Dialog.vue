<template>
  <div>
    <el-dialog
    :show-close="show"
      :draggable="true"
      model-value="show"
      :close-on-click-modal="false"
      :title="title"
      class="cust-dialog"
      :top="top"
      :width="width"
      :showCancel="showCancel"
    >
    <div class="dialog-body">
        <slot></slot>
    </div>
    <template v-if="buttons&&buttons.length>0|| showCancel">
        <div class="dialog-footer">
        <el-button color="#626aef" @click="close">取消</el-button>
        <el-button v-for="button in buttons" :key="button.text" :type="button.type" @click="button.click">{{button.text}}</el-button>
        </div>
    </template>
    </el-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    top: {
        type: String,
        default: '50px'
    },
    width: {
        type: String,
        default: '30%'
    },
    title: {
        type: String,
        default: 'Dialog Title'
    },
    buttons: {
        type: Array,
        default: () => []
    },
    showCancel: {
        type: Boolean,
        default: true
    }
});
const emit = defineEmits(['close']);
const close = () => {
    emit('close');
};
</script>

<style lang="scss">
.cust-dialog {
    .el-dialog__header{
        padding-bottom:5px;
    }
    .el-dialog__body {
        padding:0;
    }
    .dialog-body {
         border-top:1px solid #ddd;
        padding: 10px 10px 10px 0;
        min-height: 100px;
    }
    .dialog-footer {
        text-align: right;
    }   
}

</style>