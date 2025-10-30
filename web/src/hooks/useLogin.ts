import { useUserStore } from '@/stores/user';
import request from '@/util/request';
import type { LoginForm } from '@/types/user';

export default function useLogin() {
  const store = useUserStore();
  async function login(account: string, password: string) {
    // 通过统一request调用
    const res = await request({ url: '/user/login', data: { account, password } });
    if(res.success && res.user && res.token) {
      store.setUser(res.user, res.token);
      return true;
    } else {
      return res.message || '登录失败';
    }
  }
  return { login };
}
