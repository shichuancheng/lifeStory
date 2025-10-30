import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { createPinia } from 'pinia';

// 引入ant-design-vue及样式
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { ConfigProvider } from 'ant-design-vue';
import * as Icons from '@ant-design/icons-vue';
import router from './router'

const app = createApp(App);
app.use(createPinia());
// 全局注册Ant Design Vue所有icon组件
Object.keys(Icons).forEach(key => {
  app.component(key, (Icons as any)[key]);
});

app.use(Antd);
app.use(router);

app.mount('#app');
