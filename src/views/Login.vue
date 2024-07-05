<template>
    <div class="login-body">
       <div class="login-panel">
        <div class="login-title">
            登录
        </div>
        <el-form :model="formData" :rules="rules" ref="formDataRef">
            <el-form-item prop="account">
                <el-input placeholder="请输入账号"  v-model="formData.account">
                    <template #prefix>
                        <span class="iconfont icon-account"></span>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input placeholder="请输入密码" type="password" v-model="formData.password">
                    <template #prefix>
                        <span class="iconfont icon-password"></span>
                    </template>
                </el-input>
            </el-form-item>
            <el-form-item prop="checkcode">
                <div class="checkcode">
                    <el-input  class="checkcode-input" placeholder="请输入验证码"  v-model="formData.checkcode" @keyup.enter.native="login"></el-input>
                    <img :src="checkcodeUrl" alt="验证码" @click="refreshCaptcha" class="checkcode-img">
                </div>
            </el-form-item>
            <el-form-item label="">
                <el-checkbox  v-model="formData.rememberMe" :label="true">记住我</el-checkbox>
            </el-form-item>
            <el-form-item label="">
                <el-button type="primary" style="width: 100%" @click="login">登录</el-button>
            </el-form-item>
        </el-form>
       </div>
    </div>
</template>

<script setup>
import md5 from 'js-md5';
import { ref,reactive,getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
const {proxy} = getCurrentInstance();//获取当前根组件实例
//接口地址
const api={
    checkcode:'api/checkCode',
    login:'login',
}
const checkcodeUrl=ref(api.checkcode);//验证码地址
const refreshCaptcha=()=>{//刷新验证码
    checkcodeUrl.value=api.checkcode+'?'+new Date().getTime();
}
//配置表单选项
const formData=reactive({  });
const formDataRef=ref()
const rules={//表单验证规则
    account: [
        { required: true, message: '请输入账号'},
    ],
    password: [
        { required: true, message: '请输入密码'  },
    ],  
    checkcode: [
        { required: true, message: '请输入验证码' },
    ],
}
const init=()=>{//记住密码后自动填写登录信息
    const loginInfo=proxy.VueCookies.get('loginInfo');
    if(!loginInfo){
        return;
    }
    Object.assign(formData,loginInfo);
}
init();
const router=useRouter();
const login=()=>{
    formDataRef.value.validate(async (valid) => {//对表单内容进行校验，接受一个回调函数
        if (!valid) {//若校验失败
            console.log('error submit!!');
            return;
        }
        let cookiesLoginInfo=proxy.VueCookies.get('loginInfo');//拿到的是本account的cookie信息
        let cookiesPassword = cookiesLoginInfo == null ? null : cookiesLoginInfo.password;
        // console.log("cookiesLoginInfo",cookiesLoginInfo);
        if(formData.password!==cookiesPassword){//自动填入加密后的密码
            formData.password=md5(formData.password);
        }
        let params={
            account:formData.account,
            password:formData.password,
            checkCode:formData.checkcode,
        }
        let result=await proxy.Request({//promise对象,传参
            url:api.login,
            params:params,
            errorCallback:()=>{
                refreshCaptcha();//刷新验证码
                formData.checkcode="";
            },
        })
        // console.log("返回的结果",result);
        if(!result){
            return;
        }
        proxy.Message.success('登录成功');
        setTimeout(()=>{
            router.push("/");
        },1500);
        let loginInfo={
            account:params.account,
            password:params.password,
            rememberMe:formData.rememberMe,
        }
        proxy.VueCookies.set('userInfo', result.data, 0);//设置cookie
        let userInfo=proxy.VueCookies.get('userInfo');
        console.log("userInfo",userInfo);
        if(formData.rememberMe){//记住我
            proxy.VueCookies.set('loginInfo',loginInfo,"7d");
        }
    });
}
</script>

<style lang="scss">
.login-body{
    display: flex;
    justify-content: flex-end; /* 让表单靠右 */
    align-items: center; /* 垂直居中 */
    width: 100%;
    height: calc(100vh);/* 使用视口高度使表单垂直居中 */
    background-image: url(../assets/login-bg.jpg);
    background-size: cover;
    background-position: center;
    .login-panel {
        margin-right: 100px;
        height: 345px; 
        width:400px;
        padding: 20px;
        border-radius: 15px;
        background-color: rgba(0, 0, 0, 0.39);
        .el-input__wrapper{
            background-color:  rgba(0, 0, 0, 0.3);
            box-shadow: none;
            padding: 5px 13px;
        }
        .el-button--primary{
            background-color: rgb(101, 101, 249);
            border: none;
            height: 35px;
            border-radius: 20px;
        }
        // .checkcode-input{
        //     width: 100px;
        // }
        .login-title{
            color: #fff;
            font-size: 20px;
            text-align: center;
            margin-bottom: 10px;
        }
        .checkcode{
            display: flex;
            .checkcode-input{
                flex:1;
                margin-right: 5px;
            }
        }
        .el-input__inner{
            color:#fff;
        }
    }
}
</style>