<template>
  <div class="app-layout">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">忆述</h1>
          <span class="app-subtitle">AI传记生成器</span>
        </div>
        
        <nav class="main-nav">
          <router-link 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: $route.path === item.path }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.title }}</span>
          </router-link>
        </nav>
        
        <div class="user-section">
          <a-dropdown>
            <a-button type="text" class="user-button">
              <span class="user-avatar">👤</span>
              <span class="user-name">{{ userInfo?.name || '用户' }}</span>
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="showSettings">
                  <SettingOutlined />
                  设置
                </a-menu-item>
                <a-menu-item @click="showHelp">
                  <QuestionCircleOutlined />
                  帮助
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item @click="logout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 底部信息栏 -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="progress-info" v-if="showProgress">
          <span class="progress-label">访谈进度:</span>
          <a-progress 
            :percent="overallProgress" 
            size="small"
            :show-info="false"
            class="progress-bar"
          />
          <span class="progress-text">{{ overallProgress }}%</span>
        </div>
        
        <div class="auto-save-status">
          <span class="save-icon" :class="{ saving: isSaving }">💾</span>
          <span class="save-text">{{ saveStatusText }}</span>
        </div>
      </div>
    </footer>

    <!-- 设置模态框 -->
    <a-modal
      v-model:open="showSettingsModal"
      title="设置"
      :footer="null"
      width="600px"
    >
      <div class="settings-content">
        <div class="setting-group">
          <h4>界面设置</h4>
          <div class="setting-item">
            <span class="setting-label">主题模式:</span>
            <a-radio-group v-model:value="themeMode">
              <a-radio value="light">浅色</a-radio>
              <a-radio value="dark">深色</a-radio>
              <a-radio value="auto">跟随系统</a-radio>
            </a-radio-group>
          </div>
          <div class="setting-item">
            <span class="setting-label">字体大小:</span>
            <a-slider 
              v-model:value="fontSize" 
              :min="12" 
              :max="20" 
              :marks="{ 12: '小', 16: '中', 20: '大' }"
            />
          </div>
        </div>
        
        <div class="setting-group">
          <h4>访谈设置</h4>
          <div class="setting-item">
            <span class="setting-label">自动保存:</span>
            <a-switch v-model:checked="autoSave" />
          </div>
          <div class="setting-item">
            <span class="setting-label">语音提示:</span>
            <a-switch v-model:checked="voicePrompts" />
          </div>
          <div class="setting-item">
            <span class="setting-label">智能追问:</span>
            <a-switch v-model:checked="smartFollowUp" />
          </div>
        </div>
        
        <div class="setting-group">
          <h4>数据管理</h4>
          <div class="setting-item">
            <a-button @click="exportData" type="primary" ghost>
              <template #icon><DownloadOutlined /></template>
              导出数据
            </a-button>
            <a-button @click="ia" style="margin-left: 12px;">
              <template #icon><UploadOutlined /></template>
              导入数据
            </a-button>
          </div>
          <div class="setting-item">
            <a-button @click="clearAllData" danger>
              <template #icon><DeleteOutlined /></template>
              清除所有数据
            </a-button>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 帮助模态框 -->
    <a-modal
      v-model:open="showHelpModal"
      title="使用帮助"
      :footer="null"
      width="700px"
    >
      <div class="help-content">
        <div class="help-section">
          <h4>🎯 如何开始</h4>
          <ol>
            <li>点击"开始访谈"进入智能访谈系统</li>
            <li>按照提示回答各个阶段的问题</li>
            <li>系统会自动保存您的回答</li>
            <li>完成访谈后可以生成传记预览</li>
          </ol>
        </div>
        
        <div class="help-section">
          <h4>💡 使用技巧</h4>
          <ul>
            <li>回答问题时尽量详细，这样生成的传记会更丰富</li>
            <li>可以使用语音录制功能，系统会自动转换为文字</li>
            <li>支持随时暂停和继续访谈</li>
            <li>可以在时间轴中添加自定义事件</li>
          </ul>
        </div>
        
        <div class="help-section">
          <h4>📋 功能说明</h4>
          <ul>
            <li><strong>智能访谈:</strong> AI引导的分阶段访谈系统</li>
            <li><strong>传记生成:</strong> 基于访谈内容自动生成传记</li>
            <li><strong>时间轴:</strong> 可视化展示人生重要事件</li>
            <li><strong>多格式导出:</strong> 支持PDF、Word、HTML格式</li>
          </ul>
        </div>
        
        <div class="help-section">
          <h4>❓ 常见问题</h4>
          <div class="faq-item">
            <strong>Q: 数据会丢失吗？</strong>
            <p>A: 系统会自动保存到本地存储，建议定期导出备份。</p>
          </div>
          <div class="faq-item">
            <strong>Q: 可以修改已回答的问题吗？</strong>
            <p>A: 可以，随时可以返回修改之前的回答。</p>
          </div>
          <div class="faq-item">
            <strong>Q: 支持多人协作吗？</strong>
            <p>A: 目前版本为单用户使用，后续会支持家庭共享功能。</p>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  DownOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import { useInterviewStore } from '@/stores/interview';
import { useUserStore } from '@/stores/user';

// Store
const interviewStore = useInterviewStore();
const userStore = useUserStore();
const router = useRouter();

// 响应式数据
const showSettingsModal = ref(false);
const showHelpModal = ref(false);
const isSaving = ref(false);
const lastSaveTime = ref<number>(0);

// 设置项
const themeMode = ref('light');
const fontSize = ref(16);
const autoSave = ref(true);
const voicePrompts = ref(true);
const smartFollowUp = ref(true);

// 导航项
const navItems = [
  { path: '/interview', title: '智能访谈', icon: '🎤' },
  { path: '/biography', title: '传记生成', icon: '📖' },
  { path: '/multimedia', title: '时间轴', icon: '📅' }
];

// 计算属性
const userInfo = computed(() => userStore.userInfo);
const overallProgress = computed(() => interviewStore.overallProgress);
const showProgress = computed(() => interviewStore.isInterviewActive);

const saveStatusText = computed(() => {
  if (isSaving.value) return '保存中...';
  if (lastSaveTime.value === 0) return '未保存';
  
  const now = Date.now();
  const diff = now - lastSaveTime.value;
  
  if (diff < 60000) return '刚刚保存';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前保存`;
  return `${Math.floor(diff / 3600000)}小时前保存`;
});

// 方法
const showSettings = () => {
  showSettingsModal.value = true;
};

const showHelp = () => {
  showHelpModal.value = true;
};

const logout = () => {
  userStore.logout();
  router.push('/login');
  message.success('已退出登录');
};

const exportData = () => {
  try {
    const data = {
      session: interviewStore.currentSession,
      progress: interviewStore.progress,
      settings: {
        themeMode: themeMode.value,
        fontSize: fontSize.value,
        autoSave: autoSave.value,
        voicePrompts: voicePrompts.value,
        smartFollowUp: smartFollowUp.value
      },
      exportTime: Date.now()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `忆述数据备份_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    message.success('数据导出成功！');
  } catch (error) {
    message.error('数据导出失败');
  }
};

const importData = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // 恢复访谈数据
        if (data.session) {
          interviewStore.resumeInterview(data.session);
        }
        
        // 恢复设置
        if (data.settings) {
          themeMode.value = data.settings.themeMode || 'light';
          fontSize.value = data.settings.fontSize || 16;
          autoSave.value = data.settings.autoSave !== false;
          voicePrompts.value = data.settings.voicePrompts !== false;
          smartFollowUp.value = data.settings.smartFollowUp !== false;
        }
        
        message.success('数据导入成功！');
      } catch (error) {
        message.error('数据格式错误，导入失败');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
};

const clearAllData = () => {
  // 显示确认对话框
  const confirmed = confirm('确定要清除所有数据吗？此操作不可恢复！');
  if (confirmed) {
    interviewStore.clearInterview();
    localStorage.clear();
    message.success('所有数据已清除');
  }
};

// 自动保存功能
const performAutoSave = () => {
  if (!autoSave.value) return;
  
  isSaving.value = true;
  
  setTimeout(() => {
    interviewStore.saveToLocalStorage();
    lastSaveTime.value = Date.now();
    isSaving.value = false;
  }, 500);
};

// 监听数据变化，触发自动保存
watch(
  () => interviewStore.currentSession?.answers.length,
  () => {
    if (autoSave.value) {
      performAutoSave();
    }
  }
);

// 应用设置
watch(fontSize, (newSize) => {
  document.documentElement.style.setProperty('--base-font-size', `${newSize}px`);
});

watch(themeMode, (newMode) => {
  document.documentElement.setAttribute('data-theme', newMode);
});

// 生命周期
onMounted(() => {
  // 加载保存的设置
  const savedSettings = localStorage.getItem('app_settings');
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      themeMode.value = settings.themeMode || 'light';
      fontSize.value = settings.fontSize || 16;
      autoSave.value = settings.autoSave !== false;
      voicePrompts.value = settings.voicePrompts !== false;
      smartFollowUp.value = settings.smartFollowUp !== false;
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }
  
  // 应用初始设置
  document.documentElement.style.setProperty('--base-font-size', `${fontSize.value}px`);
  document.documentElement.setAttribute('data-theme', themeMode.value);
});

// 保存设置到本地存储
watch(
  [themeMode, fontSize, autoSave, voicePrompts, smartFollowUp],
  () => {
    const settings = {
      themeMode: themeMode.value,
      fontSize: fontSize.value,
      autoSave: autoSave.value,
      voicePrompts: voicePrompts.value,
      smartFollowUp: smartFollowUp.value
    };
    localStorage.setItem('app_settings', JSON.stringify(settings));
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.app-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  height: 64px;
}

.logo-section {
  display: flex;
  align-items: baseline;
  margin-right: 48px;
  
  .app-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1677ff;
    margin: 0 8px 0 0;
  }
  
  .app-subtitle {
    font-size: 0.8rem;
    color: #666;
  }
}

.main-nav {
  display: flex;
  gap: 8px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #666;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f7ff;
    color: #1677ff;
  }
  
  &.active {
    background: #1677ff;
    color: white;
  }
  
  .nav-icon {
    margin-right: 8px;
    font-size: 1.1rem;
  }
  
  .nav-text {
    font-weight: 500;
  }
}

.user-section {
  .user-button {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 12px;
    
    .user-avatar {
      font-size: 1.2rem;
    }
    
    .user-name {
      font-weight: 500;
    }
  }
}

.app-main {
  flex: 1;
  min-height: 0;
}

.app-footer {
  background: white;
  border-top: 1px solid #f0f0f0;
  padding: 12px 0;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .progress-label {
    font-size: 0.9rem;
    color: #666;
  }
  
  .progress-bar {
    width: 120px;
  }
  
  .progress-text {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1677ff;
  }
}

.auto-save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  
  .save-icon {
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &.saving {
      animation: pulse 1s infinite;
    }
  }
  
  .save-text {
    font-size: 0.85rem;
    color: #666;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// 设置模态框样式
.settings-content {
  .setting-group {
    margin-bottom: 24px;
    
    h4 {
      color: #1a1a1a;
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      
      .setting-label {
        font-weight: 500;
        color: #333;
        min-width: 100px;
      }
    }
  }
}

// 帮助模态框样式
.help-content {
  .help-section {
    margin-bottom: 24px;
    
    h4 {
      color: #1a1a1a;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    ol, ul {
      margin-left: 20px;
      
      li {
        margin-bottom: 8px;
        line-height: 1.6;
        color: #555;
      }
    }
    
    .faq-item {
      margin-bottom: 16px;
      
      strong {
        color: #1a1a1a;
        display: block;
        margin-bottom: 4px;
      }
      
      p {
        color: #666;
        margin: 0;
        padding-left: 16px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }
  
  .logo-section {
    margin-right: 16px;
    
    .app-title {
      font-size: 1.25rem;
    }
    
    .app-subtitle {
      display: none;
    }
  }
  
  .main-nav {
    gap: 4px;
  }
  
  .nav-item {
    padding: 6px 12px;
    
    .nav-text {
      display: none;
    }
    
    .nav-icon {
      margin-right: 0;
    }
  }
  
  .footer-content {
    padding: 0 16px;
    flex-direction: column;
    gap: 8px;
  }
  
  .progress-info {
    order: 2;
  }
  
  .auto-save-status {
    order: 1;
  }
}
</style>