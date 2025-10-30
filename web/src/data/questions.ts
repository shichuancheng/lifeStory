import type { Question, InterviewStage, StageInfo } from '@/types/interview';

// 访谈阶段配置
export const INTERVIEW_STAGES: StageInfo[] = [
  {
    key: 'childhood',
    title: '童年时光',
    description: '回忆童年的美好时光，那些塑造性格的重要经历',
    ageRange: '0-12岁',
    icon: '🧸',
    color: '#FFB6C1',
    estimatedTime: 15
  },
  {
    key: 'education',
    title: '求学之路',
    description: '学生时代的成长历程，知识的积累与价值观的形成',
    ageRange: '13-22岁',
    icon: '📚',
    color: '#87CEEB',
    estimatedTime: 20
  },
  {
    key: 'career',
    title: '事业发展',
    description: '职业生涯的起伏，工作中的成就与挫折',
    ageRange: '23岁以后',
    icon: '💼',
    color: '#98FB98',
    estimatedTime: 25
  },
  {
    key: 'relationship',
    title: '情感家庭',
    description: '爱情、友情、亲情，人生中最珍贵的情感纽带',
    ageRange: '全年龄段',
    icon: '❤️',
    color: '#DDA0DD',
    estimatedTime: 20
  },
  {
    key: 'reflection',
    title: '人生感悟',
    description: '回望人生路，总结经验与智慧，展望未来',
    ageRange: '当下',
    icon: '🌟',
    color: '#F0E68C',
    estimatedTime: 15
  }
];

// 问题库
export const QUESTION_BANK: Question[] = [
  // 童年阶段问题
  {
    id: 'childhood_001',
    text: '你最早的记忆是什么？当时的感受如何？',
    type: 'textarea',
    category: 'childhood',
    required: true,
    placeholder: '请详细描述你能回忆起的最早的一件事...',
    followUpQuestions: [
      '那时候你大概几岁？',
      '这个记忆对你有什么特殊意义吗？',
      '现在回想起来有什么不同的感受？'
    ],
    keywords: ['记忆', '童年', '感受', '印象']
  },
  {
    id: 'childhood_002',
    text: '童年时最喜欢的游戏或活动是什么？',
    type: 'textarea',
    category: 'childhood',
    required: true,
    placeholder: '描述你童年最喜欢做的事情...',
    followUpQuestions: [
      '为什么特别喜欢这个游戏？',
      '通常和谁一起玩？',
      '这个爱好持续了多长时间？'
    ],
    keywords: ['游戏', '活动', '爱好', '童年']
  },
  {
    id: 'childhood_003',
    text: '对父母的第一印象和最深刻的回忆是什么？',
    type: 'textarea',
    category: 'childhood',
    required: true,
    placeholder: '分享关于父母的珍贵回忆...',
    followUpQuestions: [
      '父母对你的性格形成有什么影响？',
      '有什么话想对年轻时的父母说吗？',
      '你觉得自己像父亲还是母亲多一些？'
    ],
    keywords: ['父母', '家庭', '影响', '回忆']
  },
  {
    id: 'childhood_004',
    text: '童年时的梦想是什么？',
    type: 'textarea',
    category: 'childhood',
    required: false,
    placeholder: '那时候你想成为什么样的人...',
    followUpQuestions: [
      '这个梦想是怎么产生的？',
      '现在实现了吗？',
      '如果没实现，你觉得遗憾吗？'
    ],
    keywords: ['梦想', '理想', '志向', '童年']
  },

  // 求学阶段问题
  {
    id: 'education_001',
    text: '中学时期最重要的转折点是什么？',
    type: 'textarea',
    category: 'education',
    required: true,
    placeholder: '描述中学时期改变你人生轨迹的重要事件...',
    followUpQuestions: [
      '这个转折点是如何发生的？',
      '它对你后来的人生有什么影响？',
      '如果重新选择，你会做出不同的决定吗？'
    ],
    keywords: ['转折点', '中学', '改变']
  },
  {
    id: 'education_002',
    text: '影响最大的老师或同学是谁？',
    type: 'textarea',
    category: 'education',
    required: true,
    placeholder: '分享那个对你影响深远的人...',
    followUpQuestions: [
      '他/她是如何影响你的？',
      '现在还有联系吗？',
      '你想对他/她说什么？'
    ],
    keywords: ['老师', '同学', '影响', '友谊']
  },
  {
    id: 'education_003',
    text: '高考/大学选择的心路历程是怎样的？',
    type: 'textarea',
    category: 'education',
    required: true,
    placeholder: '回忆那个重要的人生选择时刻...',
    followUpQuestions: [
      '当时的压力大吗？',
      '家人对你的选择有什么看法？',
      '现在觉得当时的选择正确吗？'
    ],
    keywords: ['高考', '大学', '选择', '压力']
  },

  // 工作阶段问题
  {
    id: 'career_001',
    text: '第一份工作的选择原因和感受是什么？',
    type: 'textarea',
    category: 'career',
    required: true,
    placeholder: '回忆初入职场的那段经历...',
    followUpQuestions: [
      '第一天上班的感觉如何？',
      '遇到了什么挑战？',
      '学到了什么重要的东西？'
    ],
    keywords: ['第一份工作', '职场', '挑战', '成长']
  },
  {
    id: 'career_002',
    text: '职业发展中最重要的决策是什么？',
    type: 'textarea',
    category: 'career',
    required: true,
    placeholder: '分享职业生涯中的关键决定...',
    followUpQuestions: [
      '做这个决定时考虑了哪些因素？',
      '结果如何？',
      '有什么经验可以分享给年轻人？'
    ],
    keywords: ['职业决策', '事业', '选择', '经验']
  },

  // 感情家庭问题
  {
    id: 'relationship_001',
    text: '对爱情的理解是如何变化的？',
    type: 'textarea',
    category: 'relationship',
    required: true,
    placeholder: '分享你对爱情认知的变化过程...',
    followUpQuestions: [
      '年轻时对爱情的期待是什么？',
      '现在的理解有什么不同？',
      '什么是真正的爱情？'
    ],
    keywords: ['爱情', '理解', '变化', '成熟']
  },
  {
    id: 'relationship_002',
    text: '最重要的人际关系是什么？',
    type: 'textarea',
    category: 'relationship',
    required: true,
    placeholder: '描述对你最重要的一段关系...',
    followUpQuestions: [
      '这段关系是如何建立的？',
      '它给你带来了什么？',
      '你为这段关系付出了什么？'
    ],
    keywords: ['人际关系', '友谊', '重要', '珍贵']
  },

  // 人生感悟问题
  {
    id: 'reflection_001',
    text: '人生中最重要的价值观是什么？',
    type: 'textarea',
    category: 'reflection',
    required: true,
    placeholder: '分享指导你人生的核心价值观...',
    followUpQuestions: [
      '这些价值观是如何形成的？',
      '它们在什么时候帮助过你？',
      '你会把这些价值观传递给下一代吗？'
    ],
    keywords: ['价值观', '人生观', '信念', '原则']
  },
  {
    id: 'reflection_002',
    text: '最后悔和最骄傲的事分别是什么？',
    type: 'textarea',
    category: 'reflection',
    required: true,
    placeholder: '回顾人生的高光时刻和遗憾...',
    followUpQuestions: [
      '为什么会有这样的感受？',
      '如果能重来，你会怎么做？',
      '这些经历教会了你什么？'
    ],
    keywords: ['后悔', '骄傲', '成就', '遗憾']
  },
  {
    id: 'reflection_003',
    text: '对年轻人有什么建议？',
    type: 'textarea',
    category: 'reflection',
    required: false,
    placeholder: '基于你的人生经验，给年轻人一些建议...',
    followUpQuestions: [
      '你希望年轻时就知道什么道理？',
      '什么是最重要的人生智慧？',
      '如何避免你曾经犯过的错误？'
    ],
    keywords: ['建议', '智慧', '经验', '年轻人']
  },
  {
    id: 'reflection_004',
    text: '希望被如何记住？',
    type: 'textarea',
    category: 'reflection',
    required: false,
    placeholder: '你希望在别人心中留下什么样的印象...',
    followUpQuestions: [
      '什么是你最想传承的东西？',
      '你的人生有什么独特的意义？',
      '如果写墓志铭，你会写什么？'
    ],
    keywords: ['传承', '意义', '记忆', '价值']
  }
];

// 获取指定阶段的问题
export function getQuestionsByStage(stage: InterviewStage): Question[] {
  return QUESTION_BANK.filter(q => q.category === stage);
}

// 获取所有问题总数
export function getTotalQuestionCount(): number {
  return QUESTION_BANK.length;
}

// 获取阶段信息
export function getStageInfo(stage: InterviewStage): StageInfo | undefined {
  return INTERVIEW_STAGES.find(s => s.key === stage);
}

// 获取下一个阶段
export function getNextStage(currentStage: InterviewStage): InterviewStage | null {
  const currentIndex = INTERVIEW_STAGES.findIndex(s => s.key === currentStage);
  if (currentIndex === -1 || currentIndex === INTERVIEW_STAGES.length - 1) {
    return null;
  }
  return INTERVIEW_STAGES[currentIndex + 1].key;
}

// 获取上一个阶段
export function getPreviousStage(currentStage: InterviewStage): InterviewStage | null {
  const currentIndex = INTERVIEW_STAGES.findIndex(s => s.key === currentStage);
  if (currentIndex <= 0) {
    return null;
  }
  return INTERVIEW_STAGES[currentIndex - 1].key;
}