import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const Login = () => import('@/views/user/login.vue');

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { 
    path: '/interview', 
    name: 'Interview', 
    component: () => import('@/views/interview/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/biography',
    name: 'Biography',
    component: () => import('@/views/biography/index.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/multimedia',
    name: 'Multimedia',
    component: () => import('@/views/multimedia/index.vue'),
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 这里可以检查用户登录状态
    // 暂时跳过认证检查，直接允许访问
    next();
  } else {
    next();
  }
});

export default router;
