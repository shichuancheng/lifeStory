// 访谈相关类型定义

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'choice' | 'date' | 'number';
  category: InterviewStage;
  required: boolean;
  placeholder?: string;
  options?: string[];
  followUpQuestions?: string[];
  keywords?: string[];
}

export interface Answer {
  questionId: string;
  content: string;
  timestamp: number;
  audioUrl?: string;
  attachments?: string[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  currentStage: InterviewStage;
  currentQuestionIndex: number;
  answers: Answer[];
  startTime: number;
  lastUpdateTime: number;
  isCompleted: boolean;
  progress: number;
}

export type InterviewStage = 
  | 'childhood'    // 童年阶段 (0-12岁)
  | 'education'    // 求学阶段 (13-22岁)
  | 'career'       // 工作阶段 (23岁以后)
  | 'relationship' // 感情家庭
  | 'reflection';  // 人生感悟

export interface StageInfo {
  key: InterviewStage;
  title: string;
  description: string;
  ageRange: string;
  icon: string;
  color: string;
  estimatedTime: number; // 预估完成时间（分钟）
}

export interface InterviewProgress {
  totalQuestions: number;
  answeredQuestions: number;
  currentStage: InterviewStage;
  stageProgress: Record<InterviewStage, number>;
  estimatedTimeRemaining: number;
}

export interface BiographyPreview {
  title: string;
  content: string;
  wordCount: number;
  chapters: BiographyChapter[];
  lastGenerated: number;
}

export interface BiographyChapter {
  id: string;
  title: string;
  content: string;
  stage: InterviewStage;
  wordCount: number;
  keyEvents: string[];
}