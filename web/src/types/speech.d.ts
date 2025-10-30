// 扩展 Window 接口以支持语音识别 API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export {};