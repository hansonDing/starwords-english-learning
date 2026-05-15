import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { VOCABULARY_DATA } from '@/data/wordData';
import { useSpeech, calculatePronunciationScore } from '@/hooks/useSpeech';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ScoreResult } from '@/types';
import StepIndicator from '@/components/learn/StepIndicator';
import ListenStep from '@/components/learn/ListenStep';
import SpeakStep from '@/components/learn/SpeakStep';
import ScoreStep from '@/components/learn/ScoreStep';
import ConfettiEffect from '@/components/learn/ConfettiEffect';
import type { Word } from '@/types';

/* ------------------------------------------------------------------ */
/*  Page-level types                                                    */
/* ------------------------------------------------------------------ */
type Step = 1 | 2 | 3;

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function getWeekWords(week: number): Word[] {
  return VOCABULARY_DATA.filter((w) => w.week === week).slice(0, 5);
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
export default function Learn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const { progress, markWordLearned } = useLocalStorage();
  const speech = useSpeech();

  // Current week's 5 words
  const weekWords = getWeekWords(progress.currentWeek);

  // If no words available, fallback to week 1
  const currentWords =
    weekWords.length >= 5 ? weekWords : getWeekWords(1);

  // State
  const [currentWordIndex, setCurrentWordIndex] = useState(() => {
    // Check URL param first for direct word selection from Home page
    const urlIndex = searchParams.get('wordIndex');
    if (urlIndex !== null) {
      const idx = parseInt(urlIndex, 10);
      if (!isNaN(idx) && idx >= 0 && idx < currentWords.length) {
        return idx;
      }
    }
    // Resume from first unlearned word
    for (let i = 0; i < currentWords.length; i++) {
      const wordProgress = progress.words.find(
        (w) => w.wordId === currentWords[i].id
      );
      if (!wordProgress?.learned) return i;
    }
    return 0;
  });

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [stepDirection, setStepDirection] = useState<number>(1);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [browserWarning, setBrowserWarning] = useState<string | null>(null);

  // Track which words have been completed in this session
  const [sessionCompleted, setSessionCompleted] = useState<boolean[]>(() => {
    return currentWords.map(
      (w) => !!progress.words.find((pw) => pw.wordId === w.id)?.learned
    );
  });

  const currentWord = currentWords[currentWordIndex];

  // Refs to avoid stale closures in callbacks
  const scoreResultRef = useRef<ScoreResult | null>(null);
  scoreResultRef.current = scoreResult;

  /* 切换单词时重置状态 */
  useEffect(() => {
    setScoreResult(null);
    setIsTransitioning(false);
    setBrowserWarning(null);
    // 注意：不要在这里调用 speech.resetTranscript()
    // 因为 speech 引用不稳定，会导致每次 render 都触发
    // 改在 handleNextWord 和 handleTryAgain 中手动调用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex]);

  /* ---- Handlers ---- */
  const handlePlayAudio = useCallback(async () => {
    if (!currentWord) return;
    setBrowserWarning(null);
    try {
      await speech.speak(currentWord.audioUrl);
    } catch (err) {
      console.error('Audio play error:', err);
      setBrowserWarning('音频播放失败，请检查网络');
    }
  }, [currentWord, speech]);

  const handleNextStep = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setStepDirection(1);
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, 3) as Step;
      return next;
    });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const handleStartRecording = useCallback(() => {
    setBrowserWarning(null);
    if (!speech.isSupported) {
      setBrowserWarning('您的浏览器不支持语音识别（推荐 Chrome、Edge、Safari）');
      return;
    }
    speech.startListening();
  }, [speech]);

  const handleStopRecording = useCallback(() => {
    speech.stopListening();
  }, [speech]);

  const handleCheckScore = useCallback(() => {
    if (!currentWord) return;

    // Calculate score from transcript
    const transcript = speech.transcript;
    const result = calculatePronunciationScore(
      currentWord.word,
      transcript || ''
    );

    setScoreResult(result);
    handleNextStep();

    // Update user score if logged in
    if (auth.isLoggedIn && result.score > 0) {
      auth.updateUserScore(result.score);
    }
  }, [currentWord, speech.transcript, handleNextStep, auth]);

  const handleTryAgain = useCallback(() => {
    setStepDirection(-1);
    setCurrentStep(2);
    setScoreResult(null);
    setBrowserWarning(null);
    speech.resetTranscript(); // 清除之前的录音，重新录制
  }, [speech]);

  const handleNextWord = useCallback(() => {
    if (!currentWord || !scoreResult) return;

    // Save progress
    markWordLearned(currentWord.id, scoreResult.score);

    // Update session completed
    setSessionCompleted((prev) => {
      const next = [...prev];
      next[currentWordIndex] = true;
      return next;
    });

    if (currentWordIndex >= currentWords.length - 1) {
      // All done! Show celebration
      setShowConfetti(true);
    } else {
      // Go to next word
      speech.resetTranscript(); // 清除上一个单词的录音
      setStepDirection(1);
      setCurrentWordIndex((prev) => prev + 1);
      setCurrentStep(1);
      setScoreResult(null);
      setBrowserWarning(null);
    }
  }, [currentWord, scoreResult, markWordLearned, currentWordIndex, currentWords.length]);

  const handleGoHome = useCallback(() => {
    // Save progress if there's a score
    if (currentWord && scoreResult) {
      markWordLearned(currentWord.id, scoreResult.score);
    }
    navigate('/');
  }, [navigate, currentWord, scoreResult, markWordLearned]);

  /* ---- Guard against missing data ---- */
  if (!currentWord) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-soft-white font-noto-sc text-lg mb-4">
            暂无单词数据
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-full gradient-button text-white font-noto-sc font-bold cursor-pointer"
          >
            返回首页
          </button>
        </motion.div>
      </div>
    );
  }

  /* ---- Completion Celebration ---- */
  if (showConfetti || (currentWordIndex >= currentWords.length - 1 && scoreResult && sessionCompleted.every(Boolean))) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 pb-8">
        {showConfetti && <ConfettiEffect />}

        <motion.div
          className="flex flex-col items-center text-center max-w-md w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
          }}
        >
          {/* Title */}
          <motion.h1
            className="font-noto-sc font-bold text-2xl sm:text-[32px] text-star-gold mb-6 text-shadow-glow"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
            }}
          >
            本周星球全部点亮!
          </motion.h1>

          {/* 5 Gold Stars */}
          <motion.div
            className="flex items-center gap-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {currentWords.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{
                  delay: 0.5 + i * 0.2,
                  duration: 0.4,
                  ease: [0.34, 1.56, 0.64, 1] as [
                    number,
                    number,
                    number,
                    number,
                  ],
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="#FFD700"
                  className="drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]"
                >
                  <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                </svg>
              </motion.div>
            ))}
          </motion.div>

          {/* Report card */}
          <motion.div
            className="w-full rounded-3xl p-6 sm:p-8 mb-6"
            style={{
              backgroundColor: '#F8F9FC',
              boxShadow: '0 8px 32px rgba(123, 104, 238, 0.25)',
            }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <h2 className="font-noto-sc font-bold text-lg text-space-navy mb-4 text-center">
              本周成绩单
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-noto-sc text-sm text-dark-gray">
                  本周平均分
                </span>
                <span className="font-nunito font-black text-3xl text-nebula-purple">
                  {Math.round(
                    currentWords.reduce((sum, w) => {
                      const wp = progress.words.find(
                        (pw) => pw.wordId === w.id
                      );
                      return sum + (wp?.score ?? 0);
                    }, 0) / currentWords.length
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-noto-sc text-sm text-dark-gray">
                  最高得分
                </span>
                <span className="font-nunito font-bold text-xl text-star-gold">
                  {Math.max(
                    ...currentWords.map((w) => {
                      const wp = progress.words.find(
                        (pw) => pw.wordId === w.id
                      );
                      return wp?.score ?? 0;
                    })
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-noto-sc text-sm text-dark-gray">
                  学习单词
                </span>
                <span className="font-nunito font-bold text-xl text-emerald-green">
                  5/5
                </span>
              </div>
            </div>
          </motion.div>

          {/* Streak info */}
          <motion.p
            className="font-noto-sc text-sm text-dark-gray mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
          >
            连续学习 <span className="text-star-gold font-bold">{progress.streakDays}</span> 天
          </motion.p>

          {/* Back to home button */}
          <motion.button
            onClick={handleGoHome}
            className="flex items-center gap-2 px-10 py-4 rounded-full font-nunito font-bold text-lg text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
              boxShadow: '0 4px 16px rgba(123, 104, 238, 0.3)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            回到首页
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ---- Normal learning flow ---- */
  return (
    <div className="min-h-[100dvh] flex flex-col px-4 pt-16 pb-8">
      {/* Word Navigation Header */}
      <motion.div
        className="flex items-center justify-between mb-4 max-w-md mx-auto w-full"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={handleGoHome}
          className="flex items-center gap-1 text-dark-gray hover:text-soft-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span className="font-noto-sc text-xs">退出</span>
        </button>

        <span className="font-noto-sc text-sm text-dark-gray">
          单词{' '}
          <span className="text-nebula-purple font-bold">
            {currentWordIndex + 1}
          </span>{' '}
          / 5
        </span>

        <div className="w-10" /> {/* Spacer for alignment */}
      </motion.div>

      {/* Browser Warning */}
      <AnimatePresence>
        {(browserWarning || speech.error) && (
          <motion.div
            className="max-w-md mx-auto w-full mb-4 px-4 py-3 rounded-xl flex items-start gap-2"
            style={{
              backgroundColor: 'rgba(255, 107, 107, 0.15)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle size={18} className="text-coral-red shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-coral-red font-noto-sc text-sm">
                {browserWarning || speech.error}
              </p>
              {!speech.isSupported && (
                <p className="text-dark-gray font-noto-sc text-xs mt-1">
                  语音识别支持 Chrome、Edge、Safari（iOS 17.4+）浏览器
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Indicator */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <StepIndicator currentStep={currentStep} />
      </motion.div>

      {/* Step Content with transitions */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={stepDirection}>
          {currentStep === 1 && (
            <motion.div
              key={`word-${currentWordIndex}-step-1`}
              className="w-full"
              initial={{ x: stepDirection * 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              <ListenStep
                word={currentWord}
                wordIndex={currentWordIndex}
                isPlaying={speech.state === 'playing'}
                onPlay={handlePlayAudio}
                onNext={handleNextStep}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key={`word-${currentWordIndex}-step-2`}
              className="w-full"
              initial={{ x: stepDirection * 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              <SpeakStep
                word={currentWord}
                isRecording={speech.state === 'recording'}
                transcript={speech.transcript}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
                onScore={handleCheckScore}
              />
            </motion.div>
          )}

          {currentStep === 3 && scoreResult && (
            <motion.div
              key={`word-${currentWordIndex}-step-3`}
              className="w-full"
              initial={{ x: stepDirection * 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              <ScoreStep
                word={currentWord}
                wordIndex={currentWordIndex}
                scoreResult={scoreResult}
                isLastWord={currentWordIndex >= currentWords.length - 1}
                completedWords={sessionCompleted}
                onTryAgain={handleTryAgain}
                onNextWord={handleNextWord}
                onGoHome={handleGoHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom word progress dots */}
      <motion.div
        className="flex items-center justify-center gap-2 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {currentWords.map((w, i) => (
          <motion.div
            key={w.id}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                i === currentWordIndex
                  ? '#7B68EE'
                  : sessionCompleted[i]
                  ? '#34D399'
                  : 'rgba(107, 114, 128, 0.3)',
            }}
            animate={
              i === currentWordIndex
                ? { scale: [1, 1.3, 1] }
                : { scale: 1 }
            }
            transition={
              i === currentWordIndex
                ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                : undefined
            }
          />
        ))}
      </motion.div>
    </div>
  );
}
