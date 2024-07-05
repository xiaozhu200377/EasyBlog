import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import VueCookies from 'vue-cookies';
import 'element-plus/dist/index.css'
import "@/assets/icon/iconfont.css"
import Request from './utils/request'
import Message from '@/utils/message'
import Comfirm from '@/utils/comfirm'
import Table from '@/components/Table.vue'
import Cover from '@/components/Cover.vue'
import Dialog from '@/components/Dialog.vue'
import CoverUpload from './components/CoverUpload.vue'
import Window from '@/components/Window.vue'
import EditorMarkdown from '@/components/EditorMarkdown.vue'
import EditorHtml from '@/components/EditorHtml.vue'
import BlogDetail from '@/components/BlogDetail.vue'
import Verify from '@/utils/Verify'
const app = createApp(App)
app.use(router)
app.use(store)
app.use(ElementPlus)
app.config.globalProperties.Request = Request//将request挂载到全局函数Request上，这使得所有组件都可以直接使用Request
app.config.globalProperties.Message = Message//将message挂载到全局函数Message上，这使得所有组件都可以直接使用Message
app.config.globalProperties.Comfirm = Comfirm//将comfirm挂载到全局函数Comfirm上，这使得所有组件都可以直接使用Comfirm
app.config.globalProperties.Verify = Verify//将Table挂载到全局函数Table上，这使得所有组件都可以直接使用Table
app.config.globalProperties.VueCookies = VueCookies
app.config.globalProperties.globalInfo = {
    imageUrl:"/api/file/getImage/"
}
app.component("Table",Table).component("Cover",Cover).component("Dialog",Dialog).component("CoverUpload",CoverUpload).component("Window",Window).component("EditorMarkdown",EditorMarkdown) 
app.component("EditorHtml",EditorHtml).component("BlogDetail",BlogDetail)
app.mount('#app')
