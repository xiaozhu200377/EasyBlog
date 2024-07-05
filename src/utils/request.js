import axios from 'axios';
import { ElLoading } from 'element-plus'
import message from "@/utils/message"
import router from "@/router";
const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8";
const contentTypeJson ="application/json";
const contentTypeFile="multipart/form-data";
const request = (config)=>{
    let {url,params,dataType='form',showLoading='true'} = config;
    let contentType=contentTypeForm;
    if(dataType==='json'){
        contentType = contentTypeJson;
    }else if(dataType==='file'){
        contentType=contentTypeFile;
        let param=new FormData();
        for(let key in params){
            param.append(key,params[key]);
        }
        params=param;
    }
    const instance = axios.create({//创建axios实例
        baseURL: '/api',
        timeout: 10*1000,
        headers: {
            'Content-Type':contentType,
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
    // console.log("创建axios实例");
    let loading=null;
    instance.interceptors.request.use(
        //发送请求前做什么
        (config) => {
            if(showLoading){
                //显示loading
                loading = ElLoading.service({
                    lock: true,
                    text: 'Loading',     //loading文字
                    background: 'rgba(0, 0, 0, 0.7)'   //背景色
                });
            } 
            return config;
        },
        //请求错误时做什么
        (error) => {
            if(showLoading&&loading){
                //关闭loading
                loading.close();
            }
            message.error("发送请求失败");
            return Promise.reject("发送请求失败");//将失败的错误信息返回给调用该函数的部分
    });
    instance.interceptors.response.use(
        //请求成功时做什么
        (response) => {
            if(showLoading&&loading){
                //关闭loading
                loading.close();
            }
            //debugger;//测试用
            const responseData=response.data;
            if (responseData.status === "error") {
                if (config.errorCallback) {
                    config.errorCallback();//刷新验证码
                }
                if (responseData.code == 901) {
                    setTimeout(() => {
                        router.push('/login');   //跳转到登录页面
                    }, 1000);
                }
                return Promise.reject(responseData.info);//将失败的错误信息返回给调用该函数的部分
            } else{
                if(responseData.code==200){
                    return responseData;
                }else if(responseData.code==901){
                    setTimeout(()=>{
                        router.push('/login');   //跳转到登录页面
                    },1000);
                    return Promise.reject("登录超时，请重新登录");
                }
            }
        },(error)=>{//响应错误该做的事情
            if(showLoading&&loading){
                //关闭loading
                loading.close();
            }
            return Promise.reject("error");//将失败的错误信息返回给调用该函数的部分
    });
     return instance.post(url,params).catch(error => {
       message.error(error);//在页面显示错误信息
          return null;//将失败的错误信息返回给调用该函数的部分
    });
}
export default request;