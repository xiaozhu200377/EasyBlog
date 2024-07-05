import { ElMessage } from "element-plus";
import { warn } from "vue";
const Message = {
    error:(msg) => {
        ElMessage({
            message:msg,
            type: 'error',
            duration: 5 * 1000
        })
    },
    success:(msg) => {
        ElMessage({
            message:msg,
            type:'success',
            duration: 5 * 1000
        })
    },
    warning:(msg) => {
        ElMessage({
            message:msg,
            type: 'warning',
            duration: 5 * 1000
        })
    }
};
export default Message;