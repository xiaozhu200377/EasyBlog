import { ElMessageBox } from 'element-plus';
const comfirm = (msg, ok) => {
    ElMessageBox.confirm(msg,'提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        ok();
    }).catch(() => {})
};
export default comfirm;