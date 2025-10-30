import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useInterviewStore } from '@/stores/interview';
import { 
  smartFollowUpEngine, 
  contentAnalysisEngine, 
  speechToTextEngine 
} from '@/utils/interviewEngines';
import type { Question, Answer } from '@/types/interview';

export function useSmartInterview() {
  const interviewStore = useInterviewStore();
  
  // 响应式状态
  const isAnalyzing = ref(false);
  const followUpQuestions = ref<string[]>([]);
  const keywordSuggestions = ref<string[]>([]);
  const isRecording = ref(false);
  const recordingDuration = ref(0);
  
  // 计算属性
  const currentQuestion = computed(() => interviewStore.currentQuestion);
  const currentAnswer = computed(() => {
    if (!currentQuestion.value) return null;
    return interviewStore.getAnswer(currentQuestion.value.id);
  });
  
  // 生成智能追问
  const generateFollowUp = async (answer: Answer, question: Question) => {
    isAnalyzing.value = true;
    
    try {
      // 模拟AI分析延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const followUps = smartFollowUpEngine.generateFollowUp(answer, question);
      followUpQuestions.value = followUps;
      
      // 分析内容并提取关键信息
      const analysis = contentAnalysisEngine.extractKeyInfo(answer);
      keywordSuggestions.value = analysis.keywords;
      
      return followUps;
    } catch (error) {
      console.error('生成追问失败:', error);
      message.error('智能分析失败，请稍后重试');
      return [];
    } finally {
      isAnalyzing.value = false;
    }
  };
  
  // 语音转文字
  const startSpeechToText = async (): Promise<string> => {
    if (!speechToTextEngine.isWebSpeechSupported()) {
      message.warning('您的浏览器不支持语音识别，将使用模拟功能');
      return await speechToTextEngine.mockSpeechToText(3);
    }
    
    try {
      isRecording.value = true;
      recordingDuration.value = 0;
      
      // 开始计时
      const timer = setInterval(() => {
        recordingDuration.value++;
      }, 1000);
      
      const result = await speechToTextEngine.startRecognition();
      
      clearInterval(timer);
      isRecording.value = false;
      
      if (result.confidence > 0.7) {
        message.success('语音识别成功');
        return result.transcript;
      } else {
        message.warning('语音识别置信度较低，请重新录制');
        return '';
      }
    } catch (error) {
      isRecording.value = false;
      console.error('语音识别失败:', error);
      message.error('语音识别失败，请检查麦克风权限');
      return '';
    }
  };
  
  // 停止语音识别
  const stopSpeechToText = () => {
    isRecording.value = false;
    recordingDuration.value = 0;
  };
  
  // 智能内容建议
  const getContentSuggestions = (partialAnswer: string): string[] => {
    if (!currentQuestion.value || partialAnswer.length < 10) {
      return [];
    }
    
    const suggestions: string[] = [];
    const question = currentQuestion.value;
    
    // 基于问题类型提供建议
    if (question.category === 'childhood') {
      suggestions.push(
        '可以描述当时的具体场景和感受',
        '想想这个经历对你性格的影响',
        '回忆一下当时周围人的反应'
      );
    } else if (question.category === 'education') {
      suggestions.push(
        '可以谈谈这段经历的转折点',
        '想想从中学到的重要道理',
        '回忆对你影响最大的人或事'
      );
    } else if (question.category === 'career') {
      suggestions.push(
        '可以分享决策背后的考虑',
        '想想这个选择的长远影响',
        '回忆当时面临的挑战和机遇'
      );
    }
    
    return suggestions;
  };
  
  // 检查回答完整性
  const checkAnswerCompleteness = (answer: string): {
    isComplete: boolean;
    suggestions: string[];
    score: number;
  } => {
    const wordCount = answer.length;
    const hasEmotion = /开心|难过|兴奋|失望|感动|愤怒|恐惧|满足/.test(answer);
    const hasDetail = /具体|详细|比如|例如|当时|那时/.test(answer);
    const hasReflection = /觉得|认为|明白|理解|学会|意识到/.test(answer);
    
    let score = 0;
    const suggestions: string[] = [];
    
    // 评分标准
    if (wordCount >= 50) score += 25;
    else suggestions.push('可以再详细一些，增加具体描述');
    
    if (hasEmotion) score += 25;
    else suggestions.push('可以加入当时的情感感受');
    
    if (hasDetail) score += 25;
    else suggestions.push('可以添加更多具体的细节');
    
    if (hasReflection) score += 25;
    else suggestions.push('可以分享你的思考和感悟');
    
    return {
      isComplete: score >= 75,
      suggestions,
      score
    };
  };
  
  // 自动保存答案
  const autoSaveAnswer = (questionId: string, content: string) => {
    if (content.trim().length > 0) {
      interviewStore.saveAnswer(questionId, content.trim());
    }
  };
  
  // 获取问题提示
  const getQuestionHints = (question: Question): string[] => {
    const hints: string[] = [];
    
    if (question.followUpQuestions) {
      hints.push(...question.followUpQuestions);
    }
    
    // 基于问题类型添加通用提示
    switch (question.category) {
      case 'childhood':
        hints.push(
          '可以从感官体验开始描述（看到、听到、闻到）',
          '想想当时的年龄和心理状态',
          '回忆周围环境和其他人的反应'
        );
        break;
      case 'education':
        hints.push(
          '可以描述学习环境和氛围',
          '想想老师和同学的影响',
          '回忆重要的学习时刻'
        );
        break;
      case 'career':
        hints.push(
          '可以分析决策的利弊',
          '想想职业发展的关键节点',
          '回忆工作中的成就和挫折'
        );
        break;
      case 'relationship':
        hints.push(
          '可以描述关系的发展过程',
          '想想这段关系的独特之处',
          '回忆重要的共同经历'
        );
        break;
      case 'reflection':
        hints.push(
          '可以从具体事例说起',
          '想想价值观的形成过程',
          '回忆重要的人生感悟时刻'
        );
        break;
    }
    
    return hints.slice(0, 5); // 限制提示数量
  };
  
  return {
    // 状态
    isAnalyzing,
    followUpQuestions,
    keywordSuggestions,
    isRecording,
    recordingDuration,
    
    // 计算属性
    currentQuestion,
    currentAnswer,
    
    // 方法
    generateFollowUp,
    startSpeechToText,
    stopSpeechToText,
    getContentSuggestions,
    checkAnswerCompleteness,
    autoSaveAnswer,
    getQuestionHints
  };
}