<template>
  <div class="auth-container">
    <h2 class="brand-welcome">欢迎来到忆述 · MemoryWeaver</h2>
    <a-tabs v-model:active-key="activeKey" centered class="auth-tabs">
      <a-tab-pane key="login" tab="登录">
        <a-form :model="loginForm" :rules="loginRules" ref="loginFormRef" @finish="onLogin">
          <a-form-item name="account" label="账号">
            <a-input v-model:value="loginForm.account" placeholder="请输入邮箱或手机号" allow-clear />
          </a-form-item>
          <a-form-item name="password" label="密码">
            <a-input-password v-model:value="loginForm.password" placeholder="请输入密码" allow-clear />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loginLoading" block>
              登录
            </a-button>
          </a-form-item>
          <a-form-item style="margin-bottom:0;text-align:right;">
            <a href="#" @click.prevent="activeKey = 'register'">还没有账号？注册</a>
          </a-form-item>
        </a-form>
      </a-tab-pane>
      <a-tab-pane key="register" tab="注册">
        <a-form :model="registerForm" :rules="registerRules" ref="registerFormRef" @finish="onRegister">
          <a-form-item name="account" label="账号">
            <a-input v-model:value="registerForm.account" placeholder="请输入邮箱或手机号" allow-clear />
          </a-form-item>
          <a-form-item name="password" label="密码">
            <a-input-password v-model:value="registerForm.password" placeholder="请输入密码" allow-clear />
          </a-form-item>
          <a-form-item name="confirmPassword" label="确认密码">
            <a-input-password v-model:value="registerForm.confirmPassword" placeholder="请再次输入密码" allow-clear />
          </a-form-item>
          <a-form-item name="agreement">
            <a-checkbox v-model:checked="registerForm.agreement">
              我已阅读并同意 <a href="#" @click.prevent>《服务协议》</a>
            </a-checkbox>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="registerLoading" block>
              注册
            </a-button>
          </a-form-item>
          <a-form-item style="margin-bottom:0;text-align:right;">
            <a href="#" @click.prevent="activeKey = 'login'">已有账号？登录</a>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { useUserStore } from '../../stores/user';
import useLogin from '../../hooks/useLogin';

const activeKey = ref<'login' | 'register'>('login');

interface LoginForm {
  account: string;
  password: string;
}
interface RegisterForm {
  account: string;
  password: string;
  confirmPassword: string;
  agreement: boolean;
}
const loginForm = ref<LoginForm>({ account: '', password: '' });
const loginRules = {
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};
const loginLoading = ref(false);
const loginFormRef = ref();
const { login } = useLogin();
const onLogin = async () => {
  loginLoading.value = true;
  const res = await login(loginForm.value.account, loginForm.value.password);
  loginLoading.value = false;
  if (res === true) {
    message.success('登录成功！');
    // 跳转到访谈页面
    window.location.href = '/interview';
  } else {
    message.error(res as string);
  }
};

const registerForm = ref<RegisterForm>({ account: '', password: '', confirmPassword: '', agreement: false });
const registerRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    {
      validator(_: any, value: string) {
        if (!value) {
          return Promise.reject('请确认密码');
        }
        if (value !== registerForm.value.password) {
          return Promise.reject('两次输入的密码不一致');
        }
        return Promise.resolve();
      },
      trigger: 'blur',
    },
  ],
  agreement: [{ validator: (_: any, value: boolean) => {
      if (!value) return Promise.reject('请勾选同意协议');
      return Promise.resolve();
    }, trigger: 'change' }],
};
const registerLoading = ref(false);
const mockRegisterApi = async (account: string, password: string) => {
  await new Promise(r => setTimeout(r, 800));
  if (account === 'test') {
    return { success: false, message: '账号已存在' };
  }
  return { success: true };
};
const onRegister = async () => {
  registerLoading.value = true;
  const res = await mockRegisterApi(registerForm.value.account, registerForm.value.password);
  registerLoading.value = false;
  if (res.success) {
    message.success('注册成功！请登录');
    activeKey.value = 'login';
    // 清空注册表单
    registerForm.value.account = '';
    registerForm.value.password = '';
    registerForm.value.confirmPassword = '';
    registerForm.value.agreement = false;
  } else {
    message.error(res.message || '注册失败');
  }
};
</script>

<style lang="scss" scoped>
.auth-container {
  max-width: 375px;
  margin: 70px auto 0 auto;
  padding: 32px 28px 24px 28px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 6px 32px #ddd;
  @media (max-width:480px) {
    margin: 20px auto;
    padding: 18px 8px 12px 8px;
  }
}
.brand-welcome {
  font-weight: 600;
  font-size: 1.3rem;
  margin-bottom: 32px;
  color: #646cff;
  text-align: center;
}
.auth-tabs {
  :deep(.ant-tabs-nav) {
    margin-bottom: 24px;
    .ant-tabs-tab {
      font-weight: 500;
      letter-spacing: .5px;
      border-radius: 8px 8px 0 0;
      color: #646cff;
    }
    .ant-tabs-ink-bar {
      background: #646cff;
    }
  }
  :deep(.ant-form-item-label > label) {
    font-weight: 500;
  }
}
:deep(.ant-input), :deep(.ant-input-password), :deep(.ant-btn) {
  border-radius: 8px;
}
:deep(.ant-btn-primary) {
  background: #646cff;
  border-color: #646cff;
  &:hover, &:focus {
    background: #535bf2;
    border-color: #535bf2;
  }
}
:deep(.ant-btn) {
  font-weight: 500;
}
</style>
