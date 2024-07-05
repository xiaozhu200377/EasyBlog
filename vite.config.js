import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',  // 将@映射到src目录
      // 如果有其他的别名需求，也可以添加在这里
    }
  },
  server: {
    hmr:true,//实现在应用程序运行时进行模块的热更新。这样在修改代码后，不需要刷新整个页面就能看到最新效果。
    port: 3001,
    proxy: {
      '/api': {//配置了一个代理，将所有以 '/api' 开头的请求代理到目标地址 "http://localhost:8081/" 上。这通常用于前端开发时需要调用后端接口，但遇到了跨域访问的限制。
        target:"http://localhost:8081/", // 目标代理接口地址
        secure: false,
        changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
        // ws: true, // 是否启用websockets
        pathRewrite: {
          '^/api': '/api',
        },
      },
    },
  },
})
