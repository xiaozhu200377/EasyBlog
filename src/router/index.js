import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from 'vue-cookies';
const routes = [
    {
        path: '/login',
        name: '登录',
        component:()=>  import('@/views/Login.vue')
    },
    {
        path: "/test",
        name: "测试",
        component: () => import('@/views/test.vue')
        
    },
    {
        path: '/',
        name: '框架页',
        component: () => import('@/views/Framework.vue'),
        redirect: '/blog/list',
        children: [
            {
                path: "/blog/list",
                name: "博客管理",
                component:()=>  import('@/views/blog/Blog.vue')
            },
            {
                path: "/blog/category",
                name: "分类管理",
                component:()=>  import('@/views/blog/category.vue')
            },
            {
                path: "/special/SpecialList",
                name: "专题管理",
                component:()=>import('@/views/special/SpecialList.vue')
            },
            {
                path: "/setting/Myinfo",
                name: "个人信息设置",
                component:()=>import('@/views/setting/Myinfo.vue')
            }, {
                path: "/setting/user",
                name: "博客成员",
                component:()=>import('@/views/setting/user.vue')
            },
            {
                path: "/setting/sysSetting",
                name: "系统设置",
                component:()=>import('@/views/setting/sysSetting.vue')
            }, {
                path: "/recovery/list",
                name: "回收站",
                component:()=>import('@/views/recovery/list.vue')
            }
        ]
    },
    
];

//这里不是通过new来创建，通过createRouter 方法创建，使用的模式不是通过mode来定义
const router = createRouter({
    routes,
    history: createWebHistory(),
})
router.beforeEach((to, from, next) => {//设置导航守卫，当外部人员直接通过链接进来时，进行判断是否需要登录
    const userInfo = VueCookies.get('userInfo');
    if(!userInfo && to.path!== '/login'){
        router.push('/login');
    }
    next();
})

export default router