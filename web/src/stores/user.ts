import { defineStore } from 'pinia';
import type { User } from '@/types/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    token: '' as string,
  }),
  actions: {
    setUser(user: User, token: string) {
      this.user = user;
      this.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    clearUser() {
      this.user = null;
      this.token = '';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    loadUserFromStorage() {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        this.token = token;
        this.user = JSON.parse(userStr);
      }
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.user?.name || '',
  }
});
