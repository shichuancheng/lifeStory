import type { LoginForm, LoginResponse, User } from '@/types/user';

const MOCK_USER: User = {
  id: 'u12345',
  name: '测试用户',
  token: 'mocktoken123',
};

export function mockLogin(form: LoginForm): Promise<LoginResponse> {
  return new Promise(resolve => {
    setTimeout(() => {
      if(form.account === 'admin' && form.password === '123456') {
        resolve({ success: true, message: '登录成功', token: MOCK_USER.token, user: MOCK_USER });
      } else {
        resolve({ success: false, message: '账号或密码错误' });
      }
    }, 600);
  });
}
