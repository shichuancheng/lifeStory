<template>
  <div class="biography-preview">
    <!-- 生成控制面板 -->
    <div class="control-panel">
      <div class="panel-header">
        <h3>传记生成</h3>
        <div class="stats">
          <span class="stat-item">
            <span class="stat-label">已回答问题:</span>
            <span class="stat-value">{{ answeredCount }}</span>
          </span>
          <span class="stat-item">
            <span class="stat-label">预计字数:</span>
            <span class="stat-value">{{ estimatedWordCount }}</span>
          </span>
        </div>
      </div>

      <div class="generation-options">
        <div class="option-group">
          <label class="option-label">传记风格:</label>
          <a-select 
            v-model:value="selectedStyle" 
            class="style-selector"
            @change="handleStyleChange"
          >
            <a-select-option 
              v-for="style in availableStyles" 
              :key="style.key" 
              :value="style.key"
            >
              {{ style.name }}
            </a-select-option>
          </a-select>
        </div>

        <div class="option-group">
          <label class="option-label">主人公姓名:</label>
          <a-input 
            v-model:value="userName" 
            placeholder="请输入姓名"
            class="name-input"
          />
        </div>

        <div class="action-buttons">
          <a-button 
            type="primary" 
            :loading="isGenerating"
            @click="generatePreview"
            :disabled="answeredCount === 0"
            size="large"
          >
            <template #icon><FileTextOutlined /></template>
            {{ isGenerating ? '生成中...' : '生成传记预览' }}
          </a-button>
          
          <a-button 
            v-if="biographyPreview"
            @click="showFullPreview = true"
            size="large"
          >
            <template #icon><EyeOutlined /></template>
            查看完整预览
          </a-button>
        </div>
      </div>
    </div>

    <!-- 章节预览卡片 -->
    <div class="chapters-preview" v-if="biographyPreview">
      <h4 class="preview-title">章节预览</h4>
      <div class="chapters-grid">
        <div 
          v-for="chapter in biographyPreview.chapters" 
          :key="chapter.id"
          class="chapter-card"
          @click="showChapterDetail(chapter)"
        >
          <div class="chapter-header">
            <span class="chapter-icon">{{ getStageIcon(chapter.stage) }}</span>
            <h5 class="chapter-title">{{ chapter.title }}</h5>
          </div>
          <div class="chapter-info">
            <span class="word-count">{{ chapter.wordCount }} 字</span>
            <span class="event-count">{{ chapter.keyEvents.length }} 个关键事件</span>
          </div>
          <div class="chapter-preview">
            {{ getChapterPreview(chapter.content) }}
          </div>
          <div class="chapter-events">
            <a-tag 
              v-for="event in chapter.keyEvents.slice(0, 3)" 
              :key="event"
              size="small"
              color="blue"
            >
              {{ event }}
            </a-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 传记统计 -->
    <div class="biography-stats" v-if="biographyPreview">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-content">
            <div class="stat-number">{{ biographyPreview.wordCount }}</div>
            <div class="stat-label">总字数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📚</div>
          <div class="stat-content">
            <div class="stat-number">{{ biographyPreview.chapters.length }}</div>
            <div class="stat-label">章节数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-number">{{ estimatedReadingTime }}</div>
            <div class="stat-label">阅读时间(分钟)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-number">{{ totalKeyEvents }}</div>
            <div class="stat-label">关键事件</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完整预览模态框 -->
    <a-modal
      v-model:open="showFullPreview"
      title="传记完整预览"
      width="80%"
      :footer="null"
      class="full-preview-modal"
    >
      <div class="full-preview-content" v-if="biographyPreview">
        <div class="preview-header">
          <h2 class="biography-title">{{ biographyPreview.title }}</h2>
          <div class="preview-meta">
            <span>生成时间: {{ formatDate(biographyPreview.lastGenerated) }}</span>
            <span>总字数: {{ biographyPreview.wordCount }}</span>
          </div>
        </div>
        
        <div class="preview-content">
          <div class="content-text" v-html="formatContent(biographyPreview.content)"></div>
        </div>
        
        <div class="preview-actions">
          <a-button type="primary" @click="exportToPDF">
            <template #icon><DownloadOutlined /></template>
            导出PDF
          </a-button>
          <a-button @click="exportToWord">
            <template #icon><FileWordOutlined /></template>
            导出Word
          </a-button>
          <a-button @click="sharePreview">
            <template #icon><ShareAltOutlined /></template>
            分享预览
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 章节详情模态框 -->
    <a-modal
      v-model:open="showChapterModal"
      :title="selectedChapter?.title"
      width="70%"
      :footer="null"
      class="chapter-detail-modal"
    >
      <div class="chapter-detail" v-if="selectedChapter">
        <div class="chapter-meta">
          <span class="chapter-stage">{{ getStageTitle(selectedChapter.stage) }}</span>
          <span class="chapter-words">{{ selectedChapter.wordCount }} 字</span>
        </div>
        
        <div class="chapter-events">
          <h5>关键事件:</h5>
          <div class="events-list">
            <a-tag 
              v-for="event in selectedChapter.keyEvents" 
              :key="event"
              color="blue"
            >
              {{ event }}
            </a-tag>
          </div>
        </div>
        
        <div class="chapter-content">
          <div class="content-text" v-html="formatContent(selectedChapter.content)"></div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  FileWordOutlined,
  ShareAltOutlined
} from '@ant-design/icons-vue';
import { useInterviewStore } from '@/stores/interview';
import { biographyGenerator } from '@/utils/biographyGenerator';
import { INTERVIEW_STAGES } from '@/data/questions';
import type { BiographyPreview, BiographyChapter, InterviewStage } from '@/types/interview';

// Store
const interviewStore = useInterviewStore();

// 响应式数据
const selectedStyle = ref('classic');
const userName = ref('');
const isGenerating = ref(false);
const biographyPreview = ref<BiographyPreview | null>(null);
const showFullPreview = ref(false);
const showChapterModal = ref(false);
const selectedChapter = ref<BiographyChapter | null>(null);
const availableStyles = ref(biographyGenerator.getAvailableStyles());

// 计算属性
const answeredCount = computed(() => {
  return interviewStore.currentSession?.answers.length || 0;
});

const estimatedWordCount = computed(() => {
  // 根据已回答问题数估算字数
  return answeredCount.value * 200; // 平均每个问题200字
});

const estimatedReadingTime = computed(() => {
  if (!biographyPreview.value) return 0;
  // 按照每分钟300字的阅读速度计算
  return Math.ceil(biographyPreview.value.wordCount / 300);
});

const totalKeyEvents = computed(() => {
  if (!biographyPreview.value) return 0;
  return biographyPreview.value.chapters.reduce((total, chapter) => {
    return total + chapter.keyEvents.length;
  }, 0);
});

// 方法
const handleStyleChange = (style: string) => {
  selectedStyle.value = style;
  if (biographyPreview.value) {
    // 重新生成预览
    generatePreview();
  }
};

const generatePreview = async () => {
  if (!interviewStore.currentSession?.answers.length) {
    message.warning('请先回答一些问题再生成传记预览');
    return;
  }

  isGenerating.value = true;
  
  try {
    const answers = interviewStore.currentSession.answers;
    const name = userName.value || '主人公';
    
    biographyPreview.value = await biographyGenerator.generateBiographyPreview(
      answers,
      selectedStyle.value,
      name
    );
    
    message.success('传记预览生成成功！');
  } catch (error) {
    console.error('生成传记预览失败:', error);
    message.error('生成传记预览失败，请稍后重试');
  } finally {
    isGenerating.value = false;
  }
};

const showChapterDetail = (chapter: BiographyChapter) => {
  selectedChapter.value = chapter;
  showChapterModal.value = true;
};

const getStageIcon = (stage: InterviewStage): string => {
  const stageInfo = INTERVIEW_STAGES.find(s => s.key === stage);
  return stageInfo?.icon || '📖';
};

const getStageTitle = (stage: InterviewStage): string => {
  const stageInfo = INTERVIEW_STAGES.find(s => s.key === stage);
  return stageInfo?.title || stage;
};

const getChapterPreview = (content: string): string => {
  // 获取章节内容的前100个字符作为预览
  return content.length > 100 ? content.substring(0, 100) + '...' : content;
};

const formatContent = (content: string): string => {
  // 将文本内容格式化为HTML，保持段落结构
  return content
    .split('\n\n')
    .map(paragraph => `<p>${paragraph.trim()}</p>`)
    .join('');
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

const exportToPDF = async () => {
  if (!biographyPreview.value) return;
  
  try {
    const { pdfExporter } = await import('@/utils/exportTools');
    await pdfExporter.exportBiographyToPDF(
      biographyPreview.value.title,
      biographyPreview.value.content
    );
    message.success('PDF导出成功！');
  } catch (error) {
    message.error('PDF导出失败：' + (error as Error).message);
  }
};

const exportToWord = async () => {
  if (!biographyPreview.value) return;
  
  try {
    const { wordExporter } = await import('@/utils/exportTools');
    await wordExporter.exportBiographyToWord(
      biographyPreview.value.title,
      biographyPreview.value.content
    );
    message.success('Word导出成功！');
  } catch (error) {
    message.error('Word导出失败：' + (error as Error).message);
  }
};

const sharePreview = async () => {
  if (!biographyPreview.value) return;
  
  try {
    const { shareManager } = await import('@/utils/exportTools');
    await shareManager.sharePreview(
      biographyPreview.value.title,
      biographyPreview.value.content
    );
    message.success('分享成功！');
  } catch (error) {
    message.info((error as Error).message);
  }
};

// 生命周期
onMounted(() => {
  // 如果有用户信息，自动填入姓名
  if (interviewStore.currentSession?.userId) {
    userName.value = '我'; // 可以从用户store获取真实姓名
  }
});
</script>

<style lang="scss" scoped>
.biography-preview {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.control-panel {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    margin: 0;
    color: #1a1a1a;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .stats {
    display: flex;
    gap: 24px;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .stat-label {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1677ff;
      }
    }
  }
}

.generation-options {
  .option-group {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .option-label {
      width: 120px;
      font-weight: 500;
      color: #333;
    }
    
    .style-selector, .name-input {
      flex: 1;
      max-width: 300px;
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
}

.chapters-preview {
  margin-bottom: 24px;
  
  .preview-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 16px;
  }
}

.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.chapter-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
}

.chapter-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  .chapter-icon {
    font-size: 1.5rem;
    margin-right: 12px;
  }
  
  .chapter-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a1a;
  }
}

.chapter-info {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 0.85rem;
  color: #666;
}

.chapter-preview {
  color: #555;
  line-height: 1.6;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.chapter-events {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.biography-stats {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8f0ff 100%);
  border-radius: 12px;
  
  .stat-icon {
    font-size: 2rem;
    margin-right: 16px;
  }
  
  .stat-content {
    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1677ff;
      line-height: 1;
    }
    
    .stat-label {
      font-size: 0.9rem;
      color: #666;
      margin-top: 4px;
    }
  }
}

.full-preview-modal {
  :deep(.ant-modal-body) {
    max-height: 70vh;
    overflow-y: auto;
  }
}

.full-preview-content {
  .preview-header {
    text-align: center;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
    
    .biography-title {
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
    }
    
    .preview-meta {
      display: flex;
      justify-content: center;
      gap: 24px;
      color: #666;
      font-size: 0.9rem;
    }
  }
  
  .preview-content {
    .content-text {
      line-height: 1.8;
      font-size: 1rem;
      color: #333;
      
      :deep(p) {
        margin-bottom: 16px;
        text-indent: 2em;
      }
    }
  }
  
  .preview-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
  }
}

.chapter-detail-modal {
  :deep(.ant-modal-body) {
    max-height: 60vh;
    overflow-y: auto;
  }
}

.chapter-detail {
  .chapter-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    .chapter-stage {
      color: #1677ff;
      font-weight: 600;
    }
    
    .chapter-words {
      color: #666;
      font-size: 0.9rem;
    }
  }
  
  .chapter-events {
    margin-bottom: 20px;
    
    h5 {
      margin-bottom: 8px;
      color: #333;
    }
    
    .events-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
  
  .chapter-content {
    .content-text {
      line-height: 1.8;
      color: #333;
      
      :deep(p) {
        margin-bottom: 16px;
        text-indent: 2em;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .biography-preview {
    padding: 16px;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats {
    width: 100%;
    justify-content: space-around;
  }
  
  .chapters-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .option-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    
    .option-label {
      width: auto;
    }
    
    .style-selector, .name-input {
      width: 100%;
      max-width: none;
    }
  }
}
</style>