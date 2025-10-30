import type { Answer, InterviewStage, BiographyPreview, BiographyChapter } from '@/types/interview';

// 传记生成引擎
export class BiographyGeneratorEngine {
  private templates: Map<string, BiographyTemplate> = new Map();
  private styleConfigs: Map<string, StyleConfig> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeStyleConfigs();
  }

  // 初始化传记模板
  private initializeTemplates() {
    // 经典传记风格
    this.templates.set('classic', {
      name: '经典传记风格',
      description: '严肃、深刻、具有历史感的传统传记风格',
      chapterTitles: {
        childhood: '第一章：童年时光',
        education: '第二章：求学之路', 
        career: '第三章：事业征程',
        relationship: '第四章：情感家庭',
        reflection: '第五章：人生感悟'
      },
      openingTemplate: '这是一个关于{name}的故事，一个平凡而又不平凡的人生历程。',
      chapterIntros: {
        childhood: '每个人的故事都始于童年，那些最初的记忆如同种子，在心田中悄然发芽...',
        education: '求学的路上，知识的光芒照亮了前行的道路，也塑造着独特的人生观...',
        career: '踏入社会，面对人生的第一次真正考验，每一个选择都在书写着命运...',
        relationship: '人生路上，最珍贵的是那些真挚的情感，它们温暖着我们的心灵...',
        reflection: '回望来路，那些经历过的风雨都化作了人生的智慧和财富...'
      }
    });

    // 温馨家庭风格
    this.templates.set('family', {
      name: '温馨家庭风格',
      description: '温暖、亲切、适合家庭传承的叙述风格',
      chapterTitles: {
        childhood: '童年的美好时光',
        education: '成长路上的点点滴滴',
        career: '为梦想而奋斗的日子',
        relationship: '爱与被爱的幸福',
        reflection: '想对家人说的话'
      },
      openingTemplate: '亲爱的家人们，这是我想要分享给你们的人生故事...',
      chapterIntros: {
        childhood: '还记得小时候的那些快乐时光吗？让我慢慢讲给你们听...',
        education: '在学校的日子里，我学到的不仅仅是知识，更是做人的道理...',
        career: '工作虽然辛苦，但为了给家人更好的生活，一切都是值得的...',
        relationship: '遇见你们，是我这辈子最幸运的事情...',
        reflection: '这些年来的感悟，希望能给你们一些启发和帮助...'
      }
    });

    // 励志成长风格
    this.templates.set('inspirational', {
      name: '励志成长风格',
      description: '积极向上、突出奋斗历程的激励性风格',
      chapterTitles: {
        childhood: '梦想的种子',
        education: '知识改变命运',
        career: '奋斗成就未来',
        relationship: '爱是前进的动力',
        reflection: '永不停歇的成长'
      },
      openingTemplate: '每个人都有属于自己的成长故事，这是我的奋斗历程...',
      chapterIntros: {
        childhood: '梦想从童年开始萌芽，那些看似平凡的日子里蕴含着无限可能...',
        education: '知识是改变命运的钥匙，每一次学习都是对未来的投资...',
        career: '没有什么成功是轻易得来的，每一份成就都浸透着汗水和坚持...',
        relationship: '在人生的路上，有了爱的支撑，再大的困难都能克服...',
        reflection: '成长永远在路上，每一天都是新的开始和机会...'
      }
    });
  }

  // 初始化风格配置
  private initializeStyleConfigs() {
    this.styleConfigs.set('classic', {
      tone: 'formal',
      vocabulary: 'sophisticated',
      sentenceLength: 'long',
      emotionalIntensity: 'moderate',
      literaryDevices: ['metaphor', 'symbolism', 'parallelism']
    });

    this.styleConfigs.set('family', {
      tone: 'warm',
      vocabulary: 'simple',
      sentenceLength: 'medium',
      emotionalIntensity: 'high',
      literaryDevices: ['dialogue', 'anecdote', 'imagery']
    });

    this.styleConfigs.set('inspirational', {
      tone: 'motivational',
      vocabulary: 'dynamic',
      sentenceLength: 'varied',
      emotionalIntensity: 'high',
      literaryDevices: ['repetition', 'climax', 'contrast']
    });
  }

  // 生成传记预览
  async generateBiographyPreview(
    answers: Answer[], 
    style: string = 'classic',
    userName: string = '主人公'
  ): Promise<BiographyPreview> {
    const template = this.templates.get(style);
    const styleConfig = this.styleConfigs.get(style);
    
    if (!template || !styleConfig) {
      throw new Error('未找到指定的传记风格');
    }

    // 按阶段分组答案
    const answersByStage = this.groupAnswersByStage(answers);
    
    // 生成各章节
    const chapters: BiographyChapter[] = [];
    let totalWordCount = 0;

    for (const stage of ['childhood', 'education', 'career', 'relationship', 'reflection'] as InterviewStage[]) {
      const stageAnswers = answersByStage[stage] || [];
      if (stageAnswers.length > 0) {
        const chapter = await this.generateChapter(stage, stageAnswers, template, styleConfig);
        chapters.push(chapter);
        totalWordCount += chapter.wordCount;
      }
    }

    // 生成开篇
    const opening = template.openingTemplate.replace('{name}', userName);
    
    // 生成完整内容
    const fullContent = this.assembleFullBiography(opening, chapters, template);
    
    return {
      title: `${userName}的人生传记`,
      content: fullContent,
      wordCount: totalWordCount,
      chapters,
      lastGenerated: Date.now()
    };
  }

  // 生成单个章节
  private async generateChapter(
    stage: InterviewStage,
    answers: Answer[],
    template: BiographyTemplate,
    styleConfig: StyleConfig
  ): Promise<BiographyChapter> {
    const chapterTitle = template.chapterTitles[stage];
    const chapterIntro = template.chapterIntros[stage];
    
    // 提取关键事件
    const keyEvents = this.extractKeyEvents(answers);
    
    // 生成章节内容
    const content = await this.generateChapterContent(answers, chapterIntro, styleConfig);
    
    return {
      id: `chapter_${stage}`,
      title: chapterTitle,
      content,
      stage,
      wordCount: content.length,
      keyEvents
    };
  }

  // 生成章节内容
  private async generateChapterContent(
    answers: Answer[],
    intro: string,
    styleConfig: StyleConfig
  ): Promise<string> {
    // 模拟AI内容生成延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let content = intro + '\n\n';
    
    // 处理每个答案，转换为叙述性文本
    for (const answer of answers) {
      const narrative = this.convertAnswerToNarrative(answer.content, styleConfig);
      content += narrative + '\n\n';
    }
    
    return content.trim();
  }

  // 将问答转换为叙述性文本
  private convertAnswerToNarrative(answerContent: string, styleConfig: StyleConfig): string {
    // 这里是简化的转换逻辑，实际应该使用更复杂的NLP处理
    let narrative = answerContent;
    
    // 根据风格调整语调
    switch (styleConfig.tone) {
      case 'formal':
        narrative = this.formalizeText(narrative);
        break;
      case 'warm':
        narrative = this.warmifyText(narrative);
        break;
      case 'motivational':
        narrative = this.motivateText(narrative);
        break;
    }
    
    // 调整句子长度
    if (styleConfig.sentenceLength === 'long') {
      narrative = this.expandSentences(narrative);
    } else if (styleConfig.sentenceLength === 'short') {
      narrative = this.shortenSentences(narrative);
    }
    
    return narrative;
  }

  // 正式化文本
  private formalizeText(text: string): string {
    return text
      .replace(/我觉得/g, '我认为')
      .replace(/很/g, '非常')
      .replace(/挺/g, '相当')
      .replace(/特别/g, '尤其');
  }

  // 温暖化文本
  private warmifyText(text: string): string {
    return text
      .replace(/我/g, '我')
      .replace(/那时候/g, '那个时候')
      .replace(/现在/g, '如今');
  }

  // 励志化文本
  private motivateText(text: string): string {
    return text
      .replace(/困难/g, '挑战')
      .replace(/失败/g, '挫折')
      .replace(/问题/g, '机遇');
  }

  // 扩展句子
  private expandSentences(text: string): string {
    // 简化实现，实际应该更复杂
    return text.replace(/。/g, '，这让我深深地感受到了人生的丰富多彩。');
  }

  // 缩短句子
  private shortenSentences(text: string): string {
    return text.replace(/，[^，。]*，/g, '。').replace(/。。/g, '。');
  }

  // 按阶段分组答案
  private groupAnswersByStage(answers: Answer[]): Record<InterviewStage, Answer[]> {
    const grouped: Record<InterviewStage, Answer[]> = {
      childhood: [],
      education: [],
      career: [],
      relationship: [],
      reflection: []
    };

    // 这里需要根据questionId来判断属于哪个阶段
    // 简化实现，实际应该查询问题库
    answers.forEach(answer => {
      if (answer.questionId.includes('childhood')) {
        grouped.childhood.push(answer);
      } else if (answer.questionId.includes('education')) {
        grouped.education.push(answer);
      } else if (answer.questionId.includes('career')) {
        grouped.career.push(answer);
      } else if (answer.questionId.includes('relationship')) {
        grouped.relationship.push(answer);
      } else if (answer.questionId.includes('reflection')) {
        grouped.reflection.push(answer);
      }
    });

    return grouped;
  }

  // 提取关键事件
  private extractKeyEvents(answers: Answer[]): string[] {
    const events: string[] = [];
    
    answers.forEach(answer => {
      // 简化的关键事件提取逻辑
      const content = answer.content;
      if (content.includes('第一次')) {
        events.push('重要的第一次经历');
      }
      if (content.includes('最难忘')) {
        events.push('难忘的回忆');
      }
      if (content.includes('转折点')) {
        events.push('人生转折点');
      }
      if (content.includes('成功') || content.includes('成就')) {
        events.push('重要成就');
      }
      if (content.includes('挫折') || content.includes('困难')) {
        events.push('克服困难');
      }
    });
    
    return [...new Set(events)];
  }

  // 组装完整传记
  private assembleFullBiography(
    opening: string,
    chapters: BiographyChapter[],
    template: BiographyTemplate
  ): string {
    let fullContent = opening + '\n\n';
    
    chapters.forEach(chapter => {
      fullContent += `${chapter.title}\n\n${chapter.content}\n\n`;
    });
    
    // 添加结语
    fullContent += '这就是我的人生故事，平凡而又珍贵的人生历程。愿这些文字能够传递给后人，成为家族记忆的一部分。';
    
    return fullContent;
  }

  // 获取可用的传记风格
  getAvailableStyles(): Array<{key: string, name: string, description: string}> {
    return Array.from(this.templates.entries()).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description
    }));
  }
}

// 传记模板接口
interface BiographyTemplate {
  name: string;
  description: string;
  chapterTitles: Record<InterviewStage, string>;
  openingTemplate: string;
  chapterIntros: Record<InterviewStage, string>;
}

// 风格配置接口
interface StyleConfig {
  tone: 'formal' | 'warm' | 'motivational';
  vocabulary: 'simple' | 'sophisticated' | 'dynamic';
  sentenceLength: 'short' | 'medium' | 'long' | 'varied';
  emotionalIntensity: 'low' | 'moderate' | 'high';
  literaryDevices: string[];
}

// 导出生成器实例
export const biographyGenerator = new BiographyGeneratorEngine();