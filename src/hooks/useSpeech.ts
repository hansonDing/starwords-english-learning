import { useState, useRef, useCallback, useEffect } from 'react';
import type { SpeechHook, SpeechState } from '@/types';

/* ------------------------------------------------------------------ */
/*  音频播放：优先使用本地预生成的 MP3 文件                          */
/*  通过 <audio> 元素播放，兼容所有浏览器                              */
/* ------------------------------------------------------------------ */

export function useSpeech(): SpeechHook {
  const [state, setState] = useState<SpeechState>('idle');
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* 浏览器语音识别支持检测 */
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  /* 获取浏览器名称 */
  const browserName = typeof navigator !== 'undefined'
    ? (navigator.userAgent.includes('Edg/') ? 'Edge'
      : navigator.userAgent.includes('Chrome/') ? 'Chrome'
      : navigator.userAgent.includes('Safari/') ? 'Safari'
      : 'unknown')
    : 'unknown';

  /* ---- TTS：播放本地音频文件 ---- */
  const speak = useCallback(
    (audioUrl: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // 停止之前的音频
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }

        setState('playing');
        setError(null);

        const audio = new Audio(audioUrl);
        audio.playbackRate = 0.6; // 较慢语速，方便小朋友听清每个词
        audioRef.current = audio;

        audio.onloadeddata = () => {
          console.log('[Audio] loaded, duration:', audio.duration);
        };

        audio.onplay = () => {
          console.log('[Audio] playing');
          setState('playing');
        };

        audio.onended = () => {
          console.log('[Audio] ended');
          setState('idle');
          resolve();
        };

        audio.onerror = (e) => {
          console.error('[Audio] error:', e, audio.error);
          setState('idle');
          setError('音频播放失败');
          reject(new Error(`Audio error: ${audio.error?.code}`));
        };

        // 加载并播放
        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error('[Audio] play() rejected:', err);
            setState('idle');
            if (err.name === 'NotAllowedError') {
              setError('请点击按钮播放音频（浏览器禁止自动播放）');
            } else {
              setError('音频播放失败: ' + err.message);
            }
            reject(err);
          });
        }
      });
    },
    []
  );

  /* ---- STT：开始录音 ---- */
  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    if (!isSupported) {
      setError(`当前浏览器（${browserName}）不支持语音识别。请用 Chrome 或 Edge 浏览器打开。如果是在预览窗口内，请点击右上角"打开浏览器"用独立窗口访问。`);
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError('浏览器不支持语音识别');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState('recording');
      setTranscript('');
      setConfidence(0);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      if (interimTranscript) setTranscript(interimTranscript);
      if (finalTranscript) setTranscript(finalTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted') return;
      if (event.error === 'no-speech') {
        setError('没有检测到语音，请大声对着麦克风再试一次');
      } else if (event.error === 'audio-capture') {
        setError('无法访问麦克风，请检查麦克风是否连接正常');
      } else if (event.error === 'not-allowed') {
        setError('麦克风权限被拒绝。请在浏览器地址栏点击麦克风图标，选择"允许"');
      } else if (event.error === 'network') {
        setError('网络连接问题，语音识别需要联网才能使用');
      } else if (event.error === 'service-not-allowed') {
        setError('当前环境（如 iframe 预览）不支持麦克风，请点击浏览器地址栏链接，用独立窗口打开');
      } else {
        setError(`语音识别错误: ${event.error}，请刷新页面重试`);
      }
      setState('idle');
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setState('idle');
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setError('启动录音失败');
      setState('idle');
    }
  }, [isSupported]);

  /* ---- STT：停止录音 ---- */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setState('idle');
  }, []);

  /* ---- 重置录音状态（切换单词时调用） ---- */
  const resetTranscript = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setTranscript('');
    setConfidence(0);
    setError(null);
    setState('idle');
  }, []);

  /* 清理 */
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return {
    state,
    speak,
    startListening,
    stopListening,
    resetTranscript,
    transcript,
    confidence,
    isSupported,
    error,
  };
}

/* ------------------------------------------------------------------ */
/*  发音评分                                                           */
/* ------------------------------------------------------------------ */
export function calculatePronunciationScore(
  targetWord: string,
  spokenText: string
): {
  score: number;
  feedback: string;
  details: { accuracy: number; fluency: number; completeness: number };
} {
  if (!spokenText || spokenText.trim().length === 0) {
    return {
      score: 0,
      feedback: '没有听到声音哦，再试一次吧！',
      details: { accuracy: 0, fluency: 0, completeness: 0 },
    };
  }

  const spoken = spokenText.toLowerCase().trim();
  const target = targetWord.toLowerCase().trim();

  const words = spoken.split(/\s+/);
  const hasTargetWord = words.some((w) => w.includes(target) || target.includes(w));

  let accuracy = 0;
  for (const word of words) {
    const similarity = levenshteinSimilarity(word, target);
    accuracy = Math.max(accuracy, similarity);
  }

  if (hasTargetWord || accuracy > 0.7) {
    accuracy = Math.min(1, accuracy + 0.15);
  }

  const fluency = Math.min(1, spoken.length / Math.max(target.length, 1));
  const completeness = hasTargetWord ? 1 : Math.min(1, accuracy * 1.2);

  const score = Math.round(
    (accuracy * 0.5 + fluency * 0.25 + completeness * 0.25) * 100
  );

  let feedback: string;
  if (score >= 95) feedback = '太棒了！发音完美！';
  else if (score >= 80) feedback = '很不错！继续加油！';
  else if (score >= 60) feedback = '有进步！再练习一次会更好！';
  else if (score >= 30) feedback = '继续加油！跟着声音再读一遍！';
  else feedback = '别灰心！多听几遍再跟读！';

  return {
    score: Math.min(100, Math.max(0, score)),
    feedback,
    details: {
      accuracy: Math.round(accuracy * 100),
      fluency: Math.round(fluency * 100),
      completeness: Math.round(completeness * 100),
    },
  };
}

function levenshteinSimilarity(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
}
