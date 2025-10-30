<template>
  <div class="timeline-container">
    <div class="timeline-header">
      <h3 class="timeline-title">人生时间轴</h3>
      <div class="timeline-controls">
        <a-button-group>
          <a-button 
            :type="viewMode === 'timeline' ? 'primary' : 'default'"
            @click="viewMode = 'timeline'"
          >
            时间轴视图
          </a-button>
          <a-button 
            :type="viewMode === 'grid' ? 'primary' : 'default'"
            @click="viewMode = 'grid'"
          >
            网格视图
          </a-button>
        </a-button-group>
        
        <a-button @click="addCustomEvent" type="dashed">
          <template #icon><PlusOutlined /></template>
          添加事件
        </a-button>
      </div>
    </div>

    <!-- 时间轴视图 -->
    <div v-if="viewMode === 'timeline'" class="timeline-view">
      <div class="timeline-line">
        <div 
          v-for="(event, index) in timelineEvents" 
          :key="event.id"
          class="timeline-item"
          :class="{ 'timeline-item-left': index % 2 === 0, 'timeline-item-right': index % 2 === 1 }"
        >
          <div class="timeline-marker" :style="{ backgroundColor: event.color }">
            <span class="timeline-icon">{{ event.icon }}</span>
          </div>
          
          <div class="timeline-content">
            <div class="event-card" @click="showEventDetail(event)">
              <div class="event-header">
                <h4 class="event-title">{{ event.title }}</h4>
                <span class="event-time">{{ event.timeDisplay }}</span>
              </div>
              <p class="event-description">{{ event.description }}</p>
              <div class="event-tags">
                <a-tag 
                  v-for="tag in event.tags" 
                  :key="tag" 
                  :color="getTagColor(tag)"
                  size="small"
                >
                  {{ tag }}
                </a-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 网格视图 -->
    <div v-if="viewMode === 'grid'" class="grid-view">
      <div class="stage-sections">
        <div 
          v-for="stage in stageGroups" 
          :key="stage.key"
          class="stage-section"
        >
          <div class="stage-header">
            <span class="stage-icon">{{ stage.icon }}</span>
            <h4 class="stage-title">{{ stage.title }}</h4>
            <span class="stage-count">({{ stage.events.length }} 个事件)</span>
          </div>
          
          <div class="stage-events">
            <div 
              v-for="event in stage.events" 
              :key="event.id"
              class="event-grid-item"
              @click="showEventDetail(event)"
            >
              <div class="event-grid-header">
                <span class="event-grid-icon">{{ event.icon }}</span>
                <span class="event-grid-time">{{ event.timeDisplay }}</span>
              </div>
              <h5 class="event-grid-title">{{ event.title }}</h5>
              <p class="event-grid-desc">{{ getShortDescription(event.description) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 事件详情模态框 -->
    <a-modal
      v-model:open="showEventModal"
      :title="selectedEvent?.title"
      width="70%"
      :footer="null"
      class="event-detail-modal"
    >
      <div class="event-detail" v-if="selectedEvent">
        <div class="event-detail-header">
          <div class="event-meta">
            <span class="event-icon-large">{{ selectedEvent.icon }}</span>
            <div class="event-info">
              <h3 class="event-title-large">{{ selectedEvent.title }}</h3>
              <p class="event-time-large">{{ selectedEvent.timeDisplay }}</p>
              <div class="event-stage">
                <a-tag :color="getStageColor(selectedEvent.stage)">
                  {{ getStageTitle(selectedEvent.stage) }}
                </a-tag>
              </div>
            </div>
          </div>
        </div>
        
        <div class="event-detail-content">
          <div class="event-description-full">
            <h5>详细描述:</h5>
            <p>{{ selectedEvent.description }}</p>
          </div>
          
          <div class="event-significance" v-if="selectedEvent.significance">
            <h5>重要意义:</h5>
            <p>{{ selectedEvent.significance }}</p>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- 添加事件模态框 -->
    <a-modal
      v-model:open="showAddEventModal"
      title="添加自定义事件"
      @ok="saveCustomEvent"
      @cancel="cancelAddEvent"
    >
      <a-form :model="newEvent" layout="vertical">
        <a-form-item label="事件标题" required>
          <a-input v-model:value="newEvent.title" placeholder="请输入事件标题" />
        </a-form-item>
        
        <a-form-item label="事件时间" required>
          <a-input v-model:value="newEvent.timeDisplay" placeholder="例如：2020年、25岁、大学时期" />
        </a-form-item>
        
        <a-form-item label="所属阶段" required>
          <a-select v-model:value="newEvent.stage" placeholder="选择人生阶段">
            <a-select-option 
              v-for="stage in INTERVIEW_STAGES" 
              :key="stage.key" 
              :value="stage.key"
            >
              {{ stage.icon }} {{ stage.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="事件描述">
          <a-textarea 
            v-model:value="newEvent.description" 
            placeholder="详细描述这个事件..."
            :rows="4"
          />
        </a-form-item>
        
        <a-form-item label="重要意义">
          <a-textarea 
            v-model:value="newEvent.significance" 
            placeholder="这个事件对你的意义..."
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { useInterviewStore } from '@/stores/interview';
import { INTERVIEW_STAGES } from '@/data/questions';
import type { InterviewStage } from '@/types/interview';

// 时间轴事件接口
interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  significance?: string;
  timeDisplay: string;
  timestamp: number;
  stage: InterviewStage;
  icon: string;
  color: string;
  tags: string[];
  isCustom?: boolean;
}

// Store
const interviewStore = useInterviewStore();

// 响应式数据
const viewMode = ref<'timeline' | 'grid'>('timeline');
const showEventModal = ref(false);
const showAddEventModal = ref(false);
const selectedEvent = ref<TimelineEvent | null>(null);
const timelineEvents = ref<TimelineEvent[]>([]);

// 新事件表单
const newEvent = ref({
  title: '',
  timeDisplay: '',
  stage: 'childhood' as InterviewStage,
  description: '',
  significance: ''
});

// 计算属性
const stageGroups = computed(() => {
  const groups = INTERVIEW_STAGES.map(stage => ({
    key: stage.key,
    title: stage.title,
    icon: stage.icon,
    events: timelineEvents.value.filter(event => event.stage === stage.key)
  }));
  
  return groups.filter(group => group.events.length > 0);
});

// 方法
const generateTimelineFromAnswers = () => {
  const answers = interviewStore.currentSession?.answers || [];
  const events: TimelineEvent[] = [];
  
  answers.forEach((answer, index) => {
    const questionId = answer.questionId;
    const stage = getStageFromQuestionId(questionId);
    
    const event: TimelineEvent = {
      id: `event_${index}`,
      title: extractEventTitle(answer.content),
      description: answer.content,
      timeDisplay: extractTimeFromContent(answer.content) || getDefaultTimeForStage(stage),
      timestamp: answer.timestamp,
      stage,
      icon: getStageIcon(stage),
      color: getStageColor(stage),
      tags: extractTags(answer.content),
      isCustom: false
    };
    
    events.push(event);
  });
  
  // 按阶段顺序排序
  const stageOrder = ['childhood', 'education', 'career', 'relationship', 'reflection'];
  events.sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage));
  
  timelineEvents.value = events;
};

const getStageFromQuestionId = (questionId: string): InterviewStage => {
  if (questionId.includes('childhood')) return 'childhood';
  if (questionId.includes('education')) return 'education';
  if (questionId.includes('career')) return 'career';
  if (questionId.includes('relationship')) return 'relationship';
  if (questionId.includes('reflection')) return 'reflection';
  return 'childhood';
};

const extractEventTitle = (content: string): string => {
  const firstSentence = content.split('。')[0];
  if (firstSentence.length > 30) {
    return firstSentence.substring(0, 30) + '...';
  }
  return firstSentence || '重要回忆';
};

const extractTimeFromContent = (content: string): string | null => {
  const timePatterns = [
    /(\d{4})年/,
    /(\d+)岁/,
    /(小时候|童年|青春期|大学时期|工作后|结婚后)/
  ];
  
  for (const pattern of timePatterns) {
    const match = content.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  return null;
};

const getDefaultTimeForStage = (stage: InterviewStage): string => {
  const defaults = {
    childhood: '童年时期',
    education: '求学时期',
    career: '工作时期',
    relationship: '情感时期',
    reflection: '现在'
  };
  return defaults[stage];
};

const getStageIcon = (stage: InterviewStage): string => {
  const stageInfo = INTERVIEW_STAGES.find(s => s.key === stage);
  return stageInfo?.icon || '📖';
};

const getStageColor = (stage: InterviewStage): string => {
  const stageInfo = INTERVIEW_STAGES.find(s => s.key === stage);
  return stageInfo?.color || '#1677ff';
};

const getStageTitle = (stage: InterviewStage): string => {
  const stageInfo = INTERVIEW_STAGES.find(s => s.key === stage);
  return stageInfo?.title || stage;
};

const extractTags = (content: string): string[] => {
  const tags: string[] = [];
  
  if (content.includes('第一次')) tags.push('第一次');
  if (content.includes('重要') || content.includes('关键')) tags.push('重要事件');
  if (content.includes('快乐') || content.includes('开心')) tags.push('快乐回忆');
  if (content.includes('困难') || content.includes('挫折')) tags.push('挑战');
  if (content.includes('成功') || content.includes('成就')) tags.push('成就');
  if (content.includes('家人') || content.includes('父母')) tags.push('家庭');
  if (content.includes('朋友') || content.includes('同学')) tags.push('友谊');
  if (content.includes('学习') || content.includes('学校')) tags.push('学习');
  if (content.includes('工作') || content.includes('职业')) tags.push('工作');
  
  return tags;
};

const getTagColor = (tag: string): string => {
  const colorMap: Record<string, string> = {
    '第一次': 'blue',
    '重要事件': 'red',
    '快乐回忆': 'green',
    '挑战': 'orange',
    '成就': 'purple',
    '家庭': 'pink',
    '友谊': 'cyan',
    '学习': 'geekblue',
    '工作': 'volcano'
  };
  return colorMap[tag] || 'default';
};

const getShortDescription = (description: string): string => {
  return description.length > 50 ? description.substring(0, 50) + '...' : description;
};

const showEventDetail = (event: TimelineEvent) => {
  selectedEvent.value = event;
  showEventModal.value = true;
};

const addCustomEvent = () => {
  newEvent.value = {
    title: '',
    timeDisplay: '',
    stage: 'childhood',
    description: '',
    significance: ''
  };
  showAddEventModal.value = true;
};

const saveCustomEvent = () => {
  if (!newEvent.value.title || !newEvent.value.timeDisplay) {
    message.warning('请填写事件标题和时间');
    return;
  }
  
  const customEvent: TimelineEvent = {
    id: `custom_${Date.now()}`,
    title: newEvent.value.title,
    description: newEvent.value.description,
    significance: newEvent.value.significance,
    timeDisplay: newEvent.value.timeDisplay,
    timestamp: Date.now(),
    stage: newEvent.value.stage,
    icon: getStageIcon(newEvent.value.stage),
    color: getStageColor(newEvent.value.stage),
    tags: ['自定义事件'],
    isCustom: true
  };
  
  timelineE.value.push(customEvent);
  showAddEventModal.value = false;
  message.success('自定义事件添加成功！');
};

condEvent = () => {
  showAddEventModal.value = false;
};

// 生命周期
onMounted(() => {
  generateTimelineFromAnswers();
});
</script>

<style lang="scss" scoped>
.timeline-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  
  .timeline-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  
  .timeline-controls {
    display: flex;
    gap: 16px;
    align-items: center;
  }
}

// 时间轴视图样式
.timeline-view {
  position: relative;
}

.timeline-line {
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #1677ff, #40a9ff);
    transform: translateX(-50%);
  }
}

.timeline-item {
  position: relative;
  margin-bottom: 40px;
  
  &.timeline-item-left {
    .timeline-content {
      margin-right: calc(50% + 40px);
      text-align: right;
    }
  }
  
  &.timeline-item-right {
    .timeline-content {
      margin-left: calc(50% + 40px);
      text-align: left;
    }
  }
}

.timeline-marker {
  position: absolute;
  left: 50%;
  top: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  .timeline-icon {
    font-size: 1.2rem;
  }
}

.timeline-content {
  .event-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
    }
  }
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  
  .event-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    flex: 1;
  }
  
  .event-time {
    font-size: 0.85rem;
    color: #666;
    white-space: nowrap;
    margin-left: 12px;
  }
}

.event-description {
  color: #555;
  line-height: 1.6;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

// 网格视图样式
.grid-view {
  .stage-sections {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
}

.stage-section {
  .stage-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    .stage-icon {
      font-size: 1.5rem;
      margin-right: 12px;
    }
    
    .stage-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }
    
    .stage-count {
      margin-left: 8px;
      color: #666;
      font-size: 0.9rem;
    }
  }
  
  .stage-events {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

.event-grid-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  }
}

.event-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .event-grid-icon {
    font-size: 1.2rem;
  }
  
  .event-grid-time {
    font-size: 0.8rem;
    color: #666;
  }
}

.event-grid-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.event-grid-desc {
  color: #555;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

// 模态框样式
.event-detail-modal {
  :deep(.ant-modal-body) {
    max-height: 70vh;
    overflow-y: auto;
  }
}

.event-detail {
  .event-detail-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .event-meta {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    
    .event-icon-large {
      font-size: 2.5rem;
    }
    
    .event-info {
      flex: 1;
      
      .event-title-large {
        font-size: 1.5rem;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 8px 0;
      }
      
      .event-time-large {
        color: #666;
        margin: 0 0 12px 0;
      }
    }
  }
  
  .event-detail-content {
    h5 {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }
    
    p {
      color: #555;
      line-height: 1.6;
      margin-bottom: 16px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .timeline-container {
    padding: 16px;
  }
  
  .timeline-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .timeline-line::before {
    left: 20px;
  }
  
  .timeline-item {
    &.timeline-item-left,
    &.timeline-item-right {
      .timeline-content {
        margin-left: 60px;
        margin-right: 0;
        text-align: left;
      }
    }
  }
  
  .timeline-marker {
    left: 20px;
  }
  
  .stage-events {
    grid-template-columns: 1fr;
  }
}
</style>