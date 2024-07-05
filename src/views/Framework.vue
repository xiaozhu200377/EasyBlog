<template>
    <div class="layout">
        <el-container>
            <el-header class="top-header">
                <div class="logo">EasyBlog</div>
                <div class="user-info">
                    <span>
                        欢迎回来，
                    </span>
                    <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            {{userInfo.nickName}}
                        </span>
                        <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item>
                                <router-link to="/setting/Myinfo">个人信息</router-link>
                            </el-dropdown-item>
                            <el-dropdown-item @click="logout">退出</el-dropdown-item>
                        </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <div class="avatar">
                        <img :src="userInfo.avatar" >
                    </div>
                </div>
            </el-header>
            <el-container  class="container">
                    <el-aside width="250px" class="left-aside">
                        <div>
                            <el-button color="#626aef" class="publish-btn" @click="creatHtml">发布</el-button>
                        </div>
                        <el-menu
                            default-active="/blog/list"
                            class="el-menu-vertical-demo"
                            router="true"
                        >
                            <el-sub-menu index="1">
                                <template #title>
                                    <span>博客</span>
                                </template>
                                    <el-menu-item index="/blog/list">博客管理</el-menu-item>
                                    <el-menu-item index="/blog/category">分类管理</el-menu-item>
                            </el-sub-menu>
                            <el-sub-menu index="2">
                                <template #title>
                                    <span>专题</span>
                                </template>
                                    <el-menu-item index="/special/SpecialList">专题管理</el-menu-item>
                            </el-sub-menu>
                            <el-sub-menu index="3">
                                <template #title>
                                    <span>设置</span>
                                </template>
                                    <el-menu-item index="/setting/Myinfo">个人信息设置</el-menu-item>
                                    <el-menu-item index="/setting/user">博客成员</el-menu-item>
                                    <el-menu-item index="/setting/sysSetting" v-if="userInfo.roleType==1">系统设置</el-menu-item>
                            </el-sub-menu>
                            <el-sub-menu index="4">
                                <template #title>
                                    <span>回收站</span>
                                </template>
                                    <el-menu-item index="/recovery/list">回收站</el-menu-item>
                            </el-sub-menu>
                        </el-menu>
                    </el-aside>
                    <el-main class="right-main">
                        <router-view></router-view>
                    </el-main>
            </el-container>
        </el-container>
        <Dialog v-if="progressDialog.show"
            :title="progressDialog.title"
            :buttons="progressDialog.buttons"
            @close="progressDialog.show =false"
            :show-close="false"
            :showCancel="false"
            width="400px">
        <div class="progress-container">
            <div class="progress-panel">
                <el-progress type="circle"
                    :percentage="progressInfo.progress"
                    :status="progressInfo.status"
                    :color="colors" />
            </div>
            <div class="error" v-if="progressInfo.result == 0">
                <div>生成页面出错了:{{progressInfo.errorMsg}}</div>
                <div class="info">具体错误，请查看服务器日志</div>
            </div>
            <div class="success" v-if="progressInfo.progress == 100 && progressInfo.result == 1">
                发布成功
            </div>
            <div class="btn-panel" v-if="progressInfo.progress ==100 || progressInfo.result == 0">
                <el-button class="btn" type="primary" @click="progressDialog.show =false">关闭</el-button>
            </div>
        </div>
    </Dialog>
    </div>
</template>
<script setup>
import { ref,getCurrentInstance,watch, reactive } from 'vue'
import { useStore } from 'vuex';
const store=useStore();
const {proxy}= getCurrentInstance();
const userInfo=ref(proxy.VueCookies.get('userInfo')||{});
const api = {
    "getUserInfo": "getUserInfo",
    "logout": "logout",
    "creatHtml": "createHtml",
    "checkProgress":"checkProgress"
}
const init =async () => {
    let result = await proxy.Request({
        url: api.getUserInfo,
    });
    if (!result) {
        return;
    }
    userInfo.value = result.data;
    userInfo.value.avatar = proxy.globalInfo.imageUrl + userInfo.value.avatar;
}
init();
const logout = (row) => {
  proxy.Comfirm(`确定要退出吗？`, async(index) => {
    let result = await proxy.Request({
      url: api.logout,
    })
    if (!result) {
      return;
    }
      proxy.Message.success('退出成功');
            window.location.reload();
      router.push('/login');
  });
}
// 监听用户信息变化,更新页面显示
watch(() => store.state.userInfo, (newVal, oldVal) => {
    const avatar = proxy.globalInfo.imageUrl + newVal.avatar;
    const nickName = newVal.nickName;
    userInfo.value = {
        avatar,
        nickName
    }
    console.log("userInfo", userInfo.value)
}, { immediate: true, deep: true });
//发布
const colors = [
    { color: "#f56c6c", percentage: 20 },
    { color: "#e6a23c", percentage: 40 },
    { color: "#5cb87a", percentage: 60 },
    { color: "#1989fa", percentage: 80 },
    { color: "#6f5ce6", percentage: 100 }
]
const progressDialog = reactive({
    show:false,//是否显示表单
  title: '发布',
  buttons: []
})
//获取进度
const progressInfo = reactive({
    progress: 0,
});
let checkTimer = null;
const creatHtml = async () => {
    progressDialog.show = true;
    progressInfo.progress = 0;
    progressInfo.status = undefined;
    let result = await proxy.Request({
        url: api.creatHtml,
    });
    if (!result) {
        return;
    }
    getProgress();
    checkTimer = setInterval(() => {
        getProgress();
    }, 100);//0.1秒获取一次进度
}
const getProgress = async () => {
    let result = await proxy.Request({
        url: api.checkProgress,
        showLoading: false,
    });
    if (!result) {
        return;
    }
    if (result.data.result == 0) {
        progressInfo.status = "exception";
        progressInfo.errorMsg = result.data.errorMsg;
    } else {
        progressInfo.progress = result.data.progress;
    }
    progressInfo.result = result.data.result;
    if ((result.data.progress == 100 || result.data.result == 0)&&checkTimer!=null) {
        clearInterval(checkTimer);
    }
}
</script>
<style lang="scss">
.layout{
    .top-header{
         height: 60px;
         background-color: #333;
         color: #fff;
         line-height: 60px;
         text-align: center;
         display: flex;
         justify-content: space-between;
         align-items: center;
         .logo{
             font-size: 24px;
         }
         .user-info{
            display:flex;
            align-items:center;
            .el-dropdown-link{
                cursor: pointer;
                color:rgb(136, 141, 238);
            }
            .avatar{
                width: 50px;
                height: 50px;
                border-radius: 50px;
                margin-left: 10px;
                background-color: #ffffffe8;
                overflow: hidden;
                img{
                    width:100%;
                    height:100%;
                    object-fit: cover;
                }
            }
         }
        
     }
     .container{
        background-color: rgb(244, 246, 246);
        height:calc(100vh - 60px);
        .left-aside{
             .publish-btn{
                height:40px;
                width: calc(100% - 20px);
                margin: 10px;
             }
            //  .el-menu{
            //     padding-left:12px;
            //  }
        }
        .right-main{
            background-color: #fff;
            position: relative;
        }
    }
}
.progress-container{
    .progress-panel{
        display: flex;
        justify-content: center;
    }
    .error{
        color: red;
        margin-top: 20px;
        .info{
            font-size: 13px;
        }
     }

    .success{
        color: green;
        margin-top: 20px;
        text-align: center;
        font-size: 16px;
     }
     .btn-panel{
        text-align: center;
        margin-top:20px;
        .btn{
            margin:0px auto;
        }
    }
}
</style>