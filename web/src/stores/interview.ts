import { defineStore } from 'pinia';
import type { 
  InterviewSession, 
  Answer, 
  InterviewStage, 
  InterviewProgress,
  Question 
} from '@/types/interview';
import { 
  INTERVIEW_STAGES, 
  getQuestionsByStage, 
  getTotalQuestionCount,
  getNextStage 
} from '@/data/questions';

interface InterviewState {
  currentSession: InterviewSession | null;
  isInterviewActive: boolean;
  currentQuestions: Question[];
  progress: InterviewProgress;
}

export const useInterviewStore = defineStore('interview', {
  state: (): InterviewState => ({
    currentSession: null,
    isInterviewActive: false,
    currentQuestions: [],
    progress: {
      totalQuestions: getTotalQuestionCount(),
      answeredQuestions: 0,
      currentStage: 'childhood',
      stageProgress: {
        childhood: 0,
        education: 0,
        career: 0,
        relationship: 0,
        reflection: 0
      },
      estimatedTimeRemaining: 95 // 总预估时间
    }
  }),

  getters: {
    // 获取当前问题
    currentQuestion: (state): Question | null => {
      if (!state.currentSession || !state.currentQuestions.length) return null;
      return state.currentQuestions[state.currentSession.currentQuestionIndex] || null;
    },

    // 获取当前阶段进度百分比
    currentStageProgress: (state): number => {
      if (!state.currentSession) return 0;
      const stageQuestions = state.currentQuestions.length;
      if (stageQuestions === 0) return 0;
      
      const answeredInStage = state.currentSession.answers.filter(
        answer => state.currentQuestions.some(q => q.id === answer.questionId)
      ).length;
      
      return Math.round((answeredInStage / stageQuestions) * 100);
    },

    // 获取总体进度百分比
    overallProgress: (state): number => {
      if (!state.currentSession) return 0;
      return Math.round((state.currentSession.answers.length / state.progress.totalQuestions) * 100);
    },

    // 检查当前阶段是否完成
    isCurrentStageCompleted: (state): boolean => {
      if (!state.currentSession) return false;
      const stageQuestions = state.currentQuestions;
      const requiredQuestions = stageQuestions.filter(q => q.required);
      const answeredRequired = requiredQuestions.filter(q => 
        state.currentSession!.answers.some(a => a.questionId === q.id)
      );
      return answeredRequired.length === requiredQuestions.length;
    },

    // 获取当前阶段信息
    currentStageInfo: (state) => {
      return INTERVIEW_STAGES.find(stage => stage.key === state.progress.currentStage);
    },

    // 检查是否可以进入下一个问题
    canGoToNextQuestion: (state): boolean => {
      if (!state.currentSession || !state.currentQuestions.length) return false;
      const currentQ = state.currentQuestions[state.currentSession.currentQuestionIndex];
      if (!currentQ) return false;
      
      // 如果是必填问题，检查是否已回答
      if (currentQ.required) {
        return state.currentSession.answers.some(a => a.questionId === currentQ.id);
      }
      return true;
    }
  },

  actions: {
    // 开始新的访谈会话
    startInterview(userId: string) {
      const sessionId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.currentSession = {
        id: sessionId,
        userId,
        currentStage: 'childhood',
        currentQuestionIndex: 0,
        answers: [],
        startTime: Date.now(),
        lastUpdateTime: Date.now(),
        isCompleted: false,
        progress: 0
      };

      this.isInterviewActive = true;
      this.progress.currentStage = 'childhood';
      this.currentQuestions = getQuestionsByStage('childhood');
      
      // 保存到本地存储
      this.saveToLocalStorage();
    },

    // 恢复访谈会话
    resumeInterview(session: InterviewSession) {
      this.currentSession = session;
      this.isInterviewActive = true;
      this.progress.currentStage = session.currentStage;
      this.currentQuestions = getQuestionsByStage(session.currentStage);
      this.updateProgress();
    },

    // 保存答案
    saveAnswer(questionId: string, content: string, audioUrl?: string, attachments?: string[]) {
      if (!this.currentSession) return;

      // 检查是否已存在答案，如果存在则更新
      const existingAnswerIndex = this.currentSession.answers.findIndex(a => a.questionId === questionId);
      
      const answer: Answer = {
        questionId,
        content,
        timestamp: Date.now(),
        audioUrl,
        attachments
      };

      if (existingAnswerIndex >= 0) {
        this.currentSession.answers[existingAnswerIndex] = answer;
      } else {
        this.currentSession.answers.push(answer);
      }

      this.currentSession.lastUpdateTime = Date.now();
      this.updateProgress();
      this.saveToLocalStorage();
    },

    // 移动到下一个问题
    nextQuestion() {
      if (!this.currentSession || !this.canGoToNextQuestion) return false;

      if (this.currentSession.currentQuestionIndex < this.currentQuestions.length - 1) {
        this.currentSession.currentQuestionIndex++;
        this.saveToLocalStorage();
        return true;
      }
      return false;
    },

    // 移动到上一个问题
    previousQuestion() {
      if (!this.currentSession) return false;

      if (this.currentSession.currentQuestionIndex > 0) {
        this.currentSession.currentQuestionIndex--;
        this.saveToLocalStorage();
        return true;
      }
      return false;
    },

    // 移动到下一个阶段
    nextStage() {
      if (!this.currentSession || !this.isCurrentStageCompleted) return false;

      const nextStage = getNextStage(this.currentSession.currentStage);
      if (!nextStage) {
        // 访谈完成
        this.completeInterview();
        return false;
      }

      this.currentSession.currentStage = nextStage;
      this.currentSession.currentQuestionIndex = 0;
      this.progress.currentStage = nextStage;
      this.currentQuestions = getQuestionsByStage(nextStage);
      
      this.saveToLocalStorage();
      return true;
    },

    // 跳转到指定阶段
    goToStage(stage: InterviewStage) {
      if (!this.currentSession) return false;

      this.currentSession.currentStage = stage;
      this.currentSession.currentQuestionIndex = 0;
      this.progress.currentStage = stage;
      this.currentQuestions = getQuestionsByStage(stage);
      
      this.saveToLocalStorage();
      return true;
    },

    // 完成访谈
    completeInterview() {
      if (!this.currentSession) return;

      this.currentSession.isCompleted = true;
      this.currentSession.lastUpdateTime = Date.now();
      this.isInterviewActive = false;
      
      this.saveToLocalStorage();
    },

    // 暂停访谈
    pauseInterview() {
      this.isInterviewActive = false;
      this.saveToLocalStorage();
    },

    // 更新进度
    updateProgress() {
      if (!this.currentSession) return;

      // 更新总体进度
      this.progress.answeredQuestions = this.currentSession.answers.length;
      
      // 更新各阶段进度
      INTERVIEW_STAGES.forEach(stage => {
        const stageQuestions = getQuestionsByStage(stage.key);
        const answeredInStage = this.currentSession!.answers.filter(
          answer => stageQuestions.some(q => q.id === answer.questionId)
        ).length;
        this.progress.stageProgress[stage.key] = stageQuestions.length > 0 
          ? Math.round((answeredInStage / stageQuestions.length) * 100)
          : 0;
      });

      // 更新会话进度
      this.currentSession.progress = this.overallProgress;
    },

    // 保存到本地存储
    saveToLocalStorage() {
      if (this.currentSession) {
        localStorage.setItem('interview_session', JSON.stringify(this.currentSession));
        localStorage.setItem('interview_progress', JSON.stringify(this.progress));
      }
    },

    // 从本地存储加载
    loadFromLocalStorage() {
      try {
        const sessionData = localStorage.getItem('interview_session');
        const progressData = localStorage.getItem('interview_progress');
        
        if (sessionData) {
          const session = JSON.parse(sessionData) as InterviewSession;
          this.resumeInterview(session);
        }
        
        if (progressData) {
          this.progress = { ...this.progress, ...JSON.parse(progressData) };
        }
      } catch (error) {
        console.error('Failed to load interview data from localStorage:', error);
      }
    },

    // 清除访谈数据
    clearInterview() {
      this.currentSession = null;
      this.isInterviewActive = false;
      this.currentQuestions = [];
      this.progress = {
        totalQuestions: getTotalQuestionCount(),
        answeredQuestions: 0,
        currentStage: 'childhood',
        stageProgress: {
          childhood: 0,
          education: 0,
          career: 0,
          relationship: 0,
          reflection: 0
        },
        estimatedTimeRemaining: 95
      };
      
      localStorage.removeItem('interview_session');
      localStorage.removeItem('interview_progress');
    },

    // 获取指定问题的答案
    getAnswer(questionId: string): Answer | undefined {
      return this.currentSession?.answers.find(a => a.questionId === questionId);
    },

    // 检查问题是否已回答
    isQuestionAnswered(questionId: string): boolean {
      return this.currentSession?.answers.some(a => a.questionId === questionId) || false;
    }
  }
});