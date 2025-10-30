import axios from 'axios';
const request = axios.create({
  // baseURL 可切换真实后端
  baseURL: '/api',
  timeout: 8000
});

request.interceptors.request.use(config => {
  // 可预留token注入
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err)
);

// 新增：mock切换环境变量（从Vite导入）
const useMock = import.meta.env.VITE_USE_MOCK === 'true'

// 统一的mock API集合
const mockApiMap: Record<string, Function> = {
  '/user/login': async (data: any) => {
    return (await import('@/mock/data/userMockData')).mockLogin(data)
  },
  // 后续补充更多接口
};

async function wrappedRequest(config: any) {
  if(useMock && mockApiMap[config.url]) {
    // 使用mock
    return mockApiMap[config.url](config.data || config.params)
  } else {
    // 真实接口
    return request(config)
  }
}

// 默认导出：对外统一暴露wrappedRequest，业务层无感切换
export default wrappedRequest;
