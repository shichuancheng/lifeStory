import type { Question, Answer, InterviewStage } from '@/types/interview';

// 智能追问引擎
export class SmartFollowUpEngine {
  private keywordTriggers: Map<string, string[]> = new Map();
  private emotionKeywords: Map<string, string[]> = new Map();
  private depthQuestions: Map<string, string[]> = new Map();

  constructor() {
    this.initializeKeywordTriggers();
    this.initializeEmotionKeywords();
    this.initializeDepthQuestions();
  }

  // 初始化关键词触发器
  private initializeKeywordTriggers() {
    this.keywordTriggers.set('family', [
      '能详细说说这对你的影响吗？',
      '这个经历改变了你什么？',
      '现在回想起来有什么不同的感受？'
    ]);

    this.keywordTriggers.set('challenge', [
      '当时是如何克服这个困难的？',
      '这个挑战教会了你什么？',
      '如果重新面对，你会怎么做？'
    ]);

    this.keywordTriggers.set('success', [
      '这个成功对你意味着什么？',
      '成功背后有什么不为人知的故事？',
      '你觉得成功的关键因素是什么？'
    ]);

    this.keywordTriggers.set('regret', [
      '如果能重来，你会做出不同的选择吗？',
      '这个经历给你什么启示？',
      '你想对当时的自己说什么？'
    ]);
  }

  // 初始化情感关键词
  private initializeEmotionKeywords() {
    this.emotionKeywords.set('positive', [
      '开心', '快乐', '兴奋', '满足', '骄傲', '感激', '幸福', '温暖'
    ]);

    this.emotionKeywords.set('negative', [
      '难过', '痛苦', '失望', '愤怒', '恐惧', '焦虑', '后悔', '孤独'
    ]);

    this.emotionKeywords.set('growth', [
      '学会', '成长', '改变', '领悟', '明白', '理解', '进步', '突破'
    ]);
  }

  // 初始化深度问题
  private initializeDepthQuestions() {
    this.depthQuestions.set('childhood', [
      '这个经历对你的性格形成有什么影响？',
      '你觉得童年的这段经历如何塑造了现在的你？',
      '如果要对童年的自己说一句话，你会说什么？'
    ]);

    this.depthQuestions.set('education', [
      '这段求学经历最大的收获是什么？',
      '哪个老师或同学对你影响最深？为什么？',
      '你觉得教育的真正意义是什么？'
    ]);

    this.depthQuestions.set('career', [
      '这个职业决定背后的深层原因是什么？',
      '工作中最有成就感的时刻是什么？',
      '你对年轻人的职业建议是什么？'
    ]);

    this.depthQuestions.set('relationship', [
      '这段关系教会了你什么关于爱的道理？',
      '你觉得维持好关系的秘诀是什么？',
      '这个人在你生命中的意义是什么？'
    ]);

    this.depthQuestions.set('reflection', [
      '这个价值观是如何形成的？',
      '你希望这个智慧能传递给下一代吗？',
      '如果总结你的人生哲学，会是什么？'
    ]);
  }

  // 生成智能追问
  generateFollowUp(answer: Answer, question: Question): string[] {
    const followUps: string[] = [];
    const content = answer.content.toLowerCase();

    // 1. 基于关键词触发追问
    for (const [category, questions] of this.keywordTriggers) {
      if (this.containsKeywords(content, this.getCategoryKeywords(category))) {
        followUps.push(...this.getRandomQuestions(questions, 1));
      }
    }

    // 2. 基于情感分析追问
    const emotion = this.analyzeEmotion(content);
    if (emotion) {
      followUps.push(...this.getEmotionBasedQuestions(emotion));
    }

    // 3. 基于回答长度和深度追问
    if (content.length < 50) {
      followUps.push('能再详细说说吗？', '还有其他想补充的吗？');
    } else if (content.length > 200) {
      followUps.push('这段经历中最重要的是什么？', '如果用一句话总结，会是什么？');
    }

    // 4. 基于阶段特性追问
    const stageQuestions = this.depthQuestions.get(question.category);
    if (stageQuestions) {
      followUps.push(...this.getRandomQuestions(stageQuestions, 1));
    }

    // 去重并限制数量
    return [...new Set(followUps)].slice(0, 3);
  }

  // 分析内容情感倾向
  private analyzeEmotion(content: string): string | null {
    for (const [emotion, keywords] of this.emotionKeywords) {
      if (this.containsKeywords(content, keywords)) {
        return emotion;
      }
    }
    return null;
  }

  // 基于情感生成追问
  private getEmotionBasedQuestions(emotion: string): string[] {
    switch (emotion) {
      case 'positive':
        return ['这种快乐的感觉持续了多久？', '是什么让这个时刻如此特别？'];
      case 'negative':
        return ['是什么帮助你度过了这段困难时期？', '现在回想这段经历有什么感受？'];
      case 'growth':
        return ['这个成长过程中最关键的转折点是什么？', '你会把这个经验分享给别人吗？'];
      default:
        return [];
    }
  }

  // 检查内容是否包含关键词
  private containsKeywords(content: string, keywords: string[]): boolean {
    return keywords.some(keyword => content.includes(keyword));
  }

  // 获取分类关键词
  private getCategoryKeywords(category: string): string[] {
    const keywordMap: Record<string, string[]> = {
      family: ['父母', '家人', '家庭', '亲情', '兄弟', '姐妹'],
      challenge: ['困难', '挑战', '挫折', '失败', '问题', '障碍'],
      success: ['成功', '成就', '胜利', '突破', '获得', '实现'],
      regret: ['后悔', '遗憾', '错过', '失去', '可惜', '如果']
    };
    return keywordMap[category] || [];
  }

  // 随机获取问题
  private getRandomQuestions(questions: string[], count: number): string[] {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}

// 内容分析引擎
export class ContentAnalysisEngine {
  // 提取关键信息
  extractKeyInfo(answer: Answer): {
    keywords: string[];
    emotions: string[];
    timeReferences: string[];
    people: string[];
    places: string[];
  } {
    const content = answer.content;
    
    return {
      keywords: this.extractKeywords(content),
      emotions: this.extractEmotions(content),
      timeReferences: this.extractTimeReferences(content),
      people: this.extractPeople(content),
      places: this.extractPlaces(content)
    };
  }

  // 提取关键词
  private extractKeywords(content: string): string[] {
    const keywords: string[] = [];
    const keywordPatterns = [
      /第一次/g, /最重要/g, /最难忘/g, /最喜欢/g, /最讨厌/g,
      /学会/g, /明白/g, /理解/g, /发现/g, /意识到/g
    ];

    keywordPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        keywords.push(...matches);
      }
    });

    return [...new Set(keywords)];
  }

  // 提取情感词汇
  private extractEmotions(content: string): string[] {
    const emotions: string[] = [];
    const emotionPatterns = [
      /开心|快乐|高兴|兴奋|满足|幸福/g,
      /难过|伤心|痛苦|失望|沮丧|悲伤/g,
      /愤怒|生气|恼火|愤慨/g,
      /恐惧|害怕|担心|焦虑|紧张/g,
      /感动|温暖|感激|欣慰/g
    ];

    emotionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        emotions.push(...matches);
      }
    });

    return [...new Set(emotions)];
  }

  // 提取时间引用
  private extractTimeReferences(content: string): string[] {
    const timeRefs: string[] = [];
    const timePatterns = [
      /\d{4}年/g, /\d+岁/g, /小时候/g, /童年/g, /青春期/g,
      /大学时期/g, /工作后/g, /结婚后/g, /现在/g, /当时/g
    ];

    timePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        timeRefs.push(...matches);
      }
    });

    return [...new Set(timeRefs)];
  }

  // 提取人物
  private extractPeople(content: string): string[] {
    const people: string[] = [];
    const peoplePatterns = [
      /父亲|爸爸|母亲|妈妈|父母/g,
      /老师|同学|朋友|同事/g,
      /哥哥|姐姐|弟弟|妹妹/g,
      /爷爷|奶奶|外公|外婆/g,
      /老公|老婆|丈夫|妻子/g
    ];

    peoplePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        people.push(...matches);
      }
    });

    return [...new Set(people)];
  }

  // 提取地点
  private extractPlaces(content: string): string[] {
    const places: string[] = [];
    const placePatterns = [
      /家里|学校|公司|办公室/g,
      /北京|上海|广州|深圳/g,
      /\w+市|\w+县|\w+区/g
    ];

    placePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        places.push(...matches);
      }
    });

    return [...new Set(places)];
  }
}

// 语音转文字模拟引擎
export class SpeechToTextEngine {
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  // 检查浏览器支持
  isWebSpeechSupported(): boolean {
    return this.isSupported;
  }

  // 开始语音识别
  async startRecognition(): Promise<{
    transcript: string;
    confidence: number;
  }> {
    if (!this.isSupported) {
      throw new Error('浏览器不支持语音识别');
    }

    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onresult = (event) => {
        let transcript = '';
        let confidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
            confidence = result[0].confidence;
          }
        }

        if (transcript) {
          resolve({ transcript, confidence });
        }
      };

      recognition.onerror = (event) => {
        reject(new Error(`语音识别错误: ${event.error}`));
      };

      recognition.start();
    });
  }

  // 模拟语音转文字（用于演示）
  async mockSpeechToText(duration: number): Promise<string> {
    // 模拟语音识别延迟
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
    
    const mockTexts = [
      '我记得小时候最喜欢的就是和朋友们一起玩捉迷藏，那种纯真的快乐现在想起来还是很温暖。',
      '大学时期遇到的那位老师真的改变了我的人生轨迹，他教会我的不仅仅是知识，更是做人的道理。',
      '第一份工作虽然很辛苦，但是学到了很多东西，也让我明白了什么叫做责任和担当。',
      '和爱人相遇的那一刻，我就知道她就是我要找的那个人，那种感觉真的很奇妙。',
      '回顾这一生，我觉得最重要的是要保持一颗善良的心，对人对事都要真诚。'
    ];

    return mockTexts[Math.floor(Math.random() * mockTexts.length)];
  }
}

// 导出引擎实例
export const smartFollowUpEngine = new SmartFollowUpEngine();
export const contentAnalysisEngine = new ContentAnalysisEngine();
export const speechToTextEngine = new SpeechToTextEngine();