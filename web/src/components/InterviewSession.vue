<template>
  <div class="interview-container">
    <!-- 访谈进度头部 -->
    <div class="interview-header">
      <div class="progress-section">
        <div class="stage-info">
          <span class="stage-icon">{{ currentStageInfo?.icon }}</span>
          <div class="stage-details">
            <h3 class="stage-title">{{ currentStageInfo?.title }}</h3>
            <p class="stage-description">{{ currentStageInfo?.description }}</p>
          </div>
        </div>
        
        <div class="progress-bars">
          <!-- 当前阶段进度 -->
          <div class="stage-progress">
            <div class="progress-label">
              <span>当前阶段进度</span>
              <span class="progress-text">{{ currentStageProgress }}%</span>
            </div>
            <a-progress 
              :percent="currentStageProgress" 
              :stroke-color="currentStageInfo?.color"
              :show-info="false"
            />
          </div>
          
          <!-- 总体进度 -->
          <div class="overall-progress">
            <div class="progress-label">
              <span>总体进度</span>
              <span class="progress-text">{{ overallProgress }}%</span>
            </div>
            <a-progress 
              :percent="overallProgress" 
              stroke-color="#1677ff"
              :show-info="false"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 问题卡片 -->
    <div class="question-card" v-if="currentQuestion">
      <div class="question-header">
        <div class="question-number">
          问题 {{ currentQuestionIndex + 1 }} / {{ currentQuestions.length }}
        </div>
        <div class="question-required" v-if="currentQuestion.required">
          <a-tag color="red">必答</a-tag>
        </div>
      </div>
      
      <div class="question-content">
        <h4 class="question-text">{{ currentQuestion.text }}</h4>
        
        <!-- 答案输入区域 -->
        <div class="answer-section">
          <a-textarea
            v-model:value="currentAnswer"
            :placeholder="currentQuestion.placeholder"
            :rows="6"
            :maxlength="2000"
            show-count
            @change="handleAnswerChange"
          />
          
          <!-- 语音录制按钮 -->
          <div class="voice-controls" v-if="showVoiceControls">
            <a-button 
              :type="isRecording ? 'primary' : 'default'"
              :danger="isRecording"
              @click="toggleRecording"
            >
              <template #icon>
                <PauseCircleOutlined v-if="isRecording" />
                <AudioOutlined v-else />
              </template>
              {{ isRecording ? '停止录音' : '语音回答' }}
            </a-button>
            <span v-if="isRecording" class="recording-time">{{ recordingTime }}s</span>
          </div>
        </div>

        <!-- 追问提示 -->
        <div class="follow-up-hints" v-if="currentQuestion.followUpQuestions?.length">
          <div class="hints-title">💡 可以考虑的角度：</div>
          <ul class="hints-list">
            <li v-for="hint in currentQuestion.followUpQuestions" :key="hint">
              {{ hint }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 导航按钮 -->
    <div class="navigation-controls">
      <div class="nav-left">
        <a-button 
          @click="handlePrevious"
          :disabled="!canGoPrevious"
          size="large"
        >
          <template #icon><LeftOutlined /></template>
          上一题
        </a-button>
      </div>
      
      <div class="nav-center">
        <a-button 
          type="text" 
          @click="handlePause"
          class="pause-btn"
        >
          <template #icon><PauseOutlined /></template>
          暂停访谈
        </a-button>
      </div>
      
      <div class="nav-right">
        <a-button 
          type="primary"
          @click="handleNext"
          :disabled="!canGoNext"
          size="large"
        >
          {{ isLastQuestionInStage ? '下一阶段' : '下一题' }}
          <template #icon>
            <RightOutlined v-if="!isLastQuestionInStage" />
            <ArrowRightOutlined v-else />
          </template>
        </a-button>
      </div>
    </div>

    <!-- 阶段完成提示 -->
    <a-modal
      v-model:open="showStageCompleteModal"
      title="阶段完成"
      :footer="null"
      centered
    >
      <div class="stage-complete-content">
        <div class="complete-icon">🎉</div>
        <h3>恭喜完成「{{ currentStageInfo?.title }}」阶段！</h3>
        <p>您已经完成了这个阶段的所有必答问题。</p>
        <p>是否继续下一个阶段的访谈？</p>
        
        <div class="modal-actions">
          <a-button @click="handleStayInStage" style="margin-right: 12px;">
            继续完善当前阶段
          </a-button>
          <a-button type="primary" @click="handleNextStage">
            进入下一阶段
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { 
  LeftOutlined, 
  RightOutlined, 
  ArrowRightOutlined,
  PauseOutlined,
  AudioOutlined,
  PauseCircleOutlined
} from '@ant-design/icons-vue';
import { useInterviewStore } from '@/stores/interview';
import { useUserStore } from '@/stores/user';

// Store
const interviewStore = useInterviewStore();
const userStore = useUserStore();

// 响应式数据
const currentAnswer = ref('');
const showStageCompleteModal = ref(false);
const isRecording = ref(false);
const recordingTime = ref(0);
const showVoiceControls = ref(true);
let recordingTimer: number | null = null;

// 计算属性
const currentQuestion = computed(() => interviewStore.currentQuestion);
const currentQuestions = computed(() => interviewStore.currentQuestions);
const currentQuestionIndex = computed(() => interviewStore.currentSession?.currentQuestionIndex || 0);
const currentStageInfo = computed(() => interviewStore.currentStageInfo);
const currentStageProgress = computed(() => interviewStore.currentStageProgress);
const overallProgress = computed(() => interviewStore.overallProgress);
const isCurrentStageCompleted = computed(() => interviewStore.isCurrentStageCompleted);

const canGoPrevious = computed(() => {
  return currentQuestionIndex.value > 0;
});

const canGoNext = computed(() => {
  if (!currentQuestion.value) return false;
  
  // 如果是必填问题，必须有答案
  if (currentQuestion.value.required) {
    const existingAnswer = interviewStore.getAnswer(currentQuestion.value.id);
    return existingAnswer?.content.trim().length > 0 || currentAnswer.value.trim().length > 0;
  }
  
  return true;
});

const isLastQuestionInStage = computed(() => {
  return currentQuestionIndex.value === currentQuestions.value.length - 1;
});

// 方法
const handleAnswerChange = () => {
  if (currentQuestion.value && currentAnswer.value.trim()) {
    interviewStore.saveAnswer(currentQuestion.value.id, currentAnswer.value.trim());
  }
};

const handlePrevious = () => {
  // 保存当前答案
  if (currentQuestion.value && currentAnswer.value.trim()) {
    interviewStore.saveAnswer(currentQuestion.value.id, currentAnswer.value.trim());
  }
  
  if (interviewStore.previousQuestion()) {
    loadCurrentAnswer();
  }
};

const handleNext = () => {
  if (!canGoNext.value) {
    message.warning('请先回答当前问题');
    return;
  }
  
  // 保存当前答案
  if (currentQuestion.value && currentAnswer.value.trim()) {
    interviewStore.saveAnswer(currentQuestion.value.id, currentAnswer.value.trim());
  }
  
  if (isLastQuestionInStage.value) {
    // 检查是否完成当前阶段
    if (isCurrentStageCompleted.value) {
      showStageCompleteModal.value = true;
    } else {
      message.warning('请完成当前阶段的所有必答问题');
    }
  } else {
    if (interviewStore.nextQuestion()) {
      loadCurrentAnswer();
    }
  }
};

const handleNextStage = () => {
  showStageCompleteModal.value = false;
  
  if (interviewStore.nextStage()) {
    loadCurrentAnswer();
    message.success(`进入「${currentStageInfo.value?.title}」阶段`);
  } else {
    // 访谈完成
    message.success('恭喜完成所有访谈！');
    // 这里可以跳转到传记生成页面
  }
};

const handleStayInStage = () => {
  showStageCompleteModal.value = false;
  // 可以跳转到当前阶段的第一个未完成问题
};

const handlePause = () => {
  interviewStore.pauseInterview();
  message.info('访谈已暂停，您可以随时回来继续');
  // 这里可以跳转到主页或访谈列表
};

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

const startRecording = () => {
  isRecording.value = true;
  recordingTime.value = 0;
  
  recordingTimer = setInterval(() => {
    recordingTime.value++;
  }, 1000);
  
  // 这里可以集成实际的语音录制功能
  message.info('开始录音...');
};

const stopRecording = () => {
  isRecording.value = false;
  
  if (recordingTimer) {
    clearInterval(recordingTimer);
    recordingTimer = null;
  }
  
  // 这里可以处理录音结果
  message.success(`录音完成，时长 ${recordingTime.value} 秒`);
};

const loadCurrentAnswer = () => {
  if (currentQuestion.value) {
    const existingAnswer = interviewStore.getAnswer(currentQuestion.value.id);
    currentAnswer.value = existingAnswer?.content || '';
  }
};

// 生命周期
onMounted(() => {
  // 如果没有活跃的访谈会话，尝试从本地存储恢复
  if (!interviewStore.currentSession) {
    interviewStore.loadFromLocalStorage();
  }
  
  // 如果仍然没有会话，开始新的访谈
  if (!interviewStore.currentSession) {
    const userId = userStore.userInfo?.id || 'demo_user';
    interviewStore.startInterview(userId);
  }
  
  // 加载当前问题的答案
  loadCurrentAnswer();
});

onUnmounted(() => {
  // 清理录音定时器
  if (recordingTimer) {
    clearInterval(recordingTimer);
  }
  
  // 保存当前答案
  if (currentQuestion.value && currentAnswer.value.trim()) {
    interviewStore.saveAnswer(currentQuestion.value.id, currentAnswer.value.trim());
  }
});
</script>

<style lang="scss" scoped>
.interview-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.interview-header {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.progress-section {
  .stage-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    .stage-icon {
      font-size: 2.5rem;
      margin-right: 16px;
    }
    
    .stage-details {
      flex: 1;
      
      .stage-title {
        margin: 0 0 4px 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #1a1a1a;
      }
      
      .stage-description {
        margin: 0;
        color: #666;
        font-size: 0.95rem;
      }
    }
  }
  
  .progress-bars {
    .stage-progress, .overall-progress {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .progress-label {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 0.9rem;
        
        .progress-text {
          font-weight: 600;
          color: #1677ff;
        }
      }
    }
  }
}

.question-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .question-number {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }
}

.question-content {
  .question-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 24px;
    line-height: 1.6;
  }
}

.answer-section {
  margin-bottom: 24px;
  
  .voice-controls {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .recording-time {
      color: #ff4d4f;
      font-weight: 600;
      font-size: 0.9rem;
    }
  }
}

.follow-up-hints {
  background: #f8f9ff;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #1677ff;
  
  .hints-title {
    font-weight: 600;
    color: #1677ff;
    margin-bottom: 12px;
    font-size: 0.95rem;
  }
  
  .hints-list {
    margin: 0;
    padding-left: 20px;
    
    li {
      color: #666;
      margin-bottom: 8px;
      font-size: 0.9rem;
      line-height: 1.5;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.navigation-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  .nav-left, .nav-right {
    flex: 1;
  }
  
  .nav-right {
    display: flex;
    justify-content: flex-end;
  }
  
  .nav-center {
    flex: 0;
    
    .pause-btn {
      color: #666;
      
      &:hover {
        color: #1677ff;
      }
    }
  }
}

.stage-complete-content {
  text-align: center;
  padding: 20px 0;
  
  .complete-icon {
    font-size: 3rem;
    margin-bottom: 16px;
  }
  
  h3 {
    color: #1a1a1a;
    margin-bottom: 12px;
  }
  
  p {
    color: #666;
    margin-bottom: 8px;
    
    &:last-of-type {
      margin-bottom: 24px;
    }
  }
  
  .modal-actions {
    display: flex;
    justify-content: center;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .interview-container {
    padding: 16px;
  }
  
  .interview-header,
  .question-card,
  .navigation-controls {
    padding: 20px;
  }
  
  .stage-info {
    .stage-icon {
      font-size: 2rem;
    }
    
    .stage-title {
      font-size: 1.25rem;
    }
  }
  
  .question-text {
    font-size: 1.1rem;
  }
  
  .navigation-controls {
    flex-direction: column;
    gap: 16px;
    
    .nav-left, .nav-right, .nav-center {
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
}
</style>