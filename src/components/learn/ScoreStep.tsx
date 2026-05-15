import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ArrowRight, Star, Home, Check } from 'lucide-react';
import type { Word, ScoreResult } from '@/types';
import ScoreRing from './ScoreRing';

interface ScoreStepProps {
  word: Word;
  wordIndex: number;
  scoreResult: ScoreResult;
  isLastWord: boolean;
  completedWords: boolean[];
  onTryAgain: () => void;
  onNextWord: () => void;
  onGoHome: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#34D399';
  if (score >= 70) return '#FFD700';
  if (score >= 50) return '#38BDF8';
  return '#FF6B6B';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return '太棒了!';
  if (score >= 70) return '很不错!';
  if (score >= 50) return '有进步!';
  return '继续加油!';
}

function getEncouragement(score: number, word: Word): string {
  if (score >= 90) {
    return `发音非常标准! "${word.word}" 读得太棒了!`;
  }
  if (score >= 70) {
    return `读得不错! "${word.word}" 再多练习几次就更棒了!`;
  }
  if (score >= 50) {
    return `有进步! 再听一遍"${word.word}"的发音，然后跟读!`;
  }
  return '别灰心! 每一个大师都曾是初学者，再试一次!';
}

const ScoreStep = memo(function ScoreStep({
  word,
  wordIndex,
  scoreResult,
  isLastWord,
  completedWords,
  onTryAgain,
  onNextWord,
  onGoHome,
}: ScoreStepProps) {
  const [showStars, setShowStars] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [animatedStars, setAnimatedStars] = useState<boolean[]>(completedWords);

  const color = getScoreColor(scoreResult.score);
  const label = getScoreLabel(scoreResult.score);
  const encouragement = getEncouragement(scoreResult.score, word);
  const passed = scoreResult.score >= 50;

  // Sequenced animation
  useEffect(() => {
    const t1 = setTimeout(() => setShowStars(true), 800);
    const t2 = setTimeout(() => setShowFeedback(true), 1200);
    const t3 = setTimeout(() => setShowButtons(true), 1500);

    // Animate current star lighting up
    if (passed) {
      const t4 = setTimeout(() => {
        setAnimatedStars((prev) => {
          const next = [...prev];
          next[wordIndex] = true;
          return next;
        });
      }, 900);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [wordIndex, passed]);

  const { accuracy, fluency, completeness } = scoreResult.details;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 pb-8">
      {/* Top prompt */}
      <motion.p
        className="font-noto-sc font-bold text-xl text-nebula-purple mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        来看看你的表现!
      </motion.p>

      {/* Word Image */}
      <motion.div
        className="flex justify-center mb-3"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src={word.imageUrl}
          alt={word.word}
          className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-md"
        />
      </motion.div>

      {/* Score Ring */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
        }}
      >
        <ScoreRing score={scoreResult.score} size={180} delay={0.2} />
      </motion.div>

      {/* Score label */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p
              className="font-noto-sc font-bold text-xl sm:text-[22px] mb-1"
              style={{ color }}
            >
              {label}
            </p>
            <p className="font-noto-sc text-sm text-dark-gray">
              {encouragement}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback details card */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="w-full rounded-3xl p-5 sm:p-6 mb-6"
            style={{
              backgroundColor: '#F8F9FC',
              boxShadow: '0 4px 16px rgba(123, 104, 238, 0.2)',
            }}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
          >
            {/* Three metric bars */}
            <div className="space-y-4">
              <MetricBar label="准确度" value={accuracy} color="#34D399" delay={0} />
              <MetricBar label="流利度" value={fluency} color="#7B68EE" delay={0.15} />
              <MetricBar
                label="完整度"
                value={completeness}
                color="#38BDF8"
                delay={0.3}
              />
            </div>

            {/* Feedback text */}
            <motion.div
              className="mt-4 pt-4 border-t border-light-gray"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <p className="text-space-navy font-noto-sc text-sm text-center">
                {scoreResult.feedback}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Stars */}
      <AnimatePresence>
        {showStars && (
          <motion.div
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {animatedStars.map((isLit, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={i === wordIndex ? { scale: 0 } : false}
                animate={
                  i === wordIndex && isLit
                    ? { scale: [0, 1.5, 1] }
                    : { scale: 1 }
                }
                transition={
                  i === wordIndex && isLit
                    ? {
                        duration: 0.5,
                        ease: [0.34, 1.56, 0.64, 1] as [
                          number,
                          number,
                          number,
                          number,
                        ],
                      }
                    : undefined
                }
              >
                {/* Glow effect for newly lit star */}
                {i === wordIndex && isLit && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)',
                      transform: 'scale(2)',
                    }}
                    initial={{ opacity: 1, scale: 0 }}
                    animate={{ opacity: 0, scale: 2.5 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                )}
                <Star
                  size={28}
                  className={
                    isLit
                      ? 'text-star-gold fill-star-gold drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]'
                      : 'text-dark-gray opacity-30'
                  }
                  strokeWidth={isLit ? 1.5 : 2}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <AnimatePresence>
        {showButtons && (
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Try Again button */}
            {!passed && (
              <motion.button
                onClick={onTryAgain}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-noto-sc font-semibold text-sm cursor-pointer border"
                style={{
                  borderColor: '#7B68EE',
                  color: '#7B68EE',
                  backgroundColor: 'transparent',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={16} />
                再读一次
              </motion.button>
            )}

            {/* Next Word / Complete button */}
            {passed && (
              <motion.button
                onClick={isLastWord ? onGoHome : onNextWord}
                className="flex items-center gap-2 px-7 py-3 rounded-full font-noto-sc font-bold text-base text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
                  boxShadow: '0 4px 16px rgba(123, 104, 238, 0.3)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLastWord ? (
                  <>
                    <Check size={18} />
                    完成学习
                  </>
                ) : (
                  <>
                    下一个单词
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            )}

            {/* Go home button for low scores */}
            {!passed && (
              <motion.button
                onClick={onGoHome}
                className="flex items-center gap-2 px-5 py-3 rounded-full font-noto-sc font-semibold text-sm text-white cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
                  boxShadow: '0 4px 16px rgba(123, 104, 238, 0.2)',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home size={16} />
                返回首页
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* MetricBar sub-component */
function MetricBar({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
}) {
  const [width, setWidth] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setWidth(value);
      // Animate number counting
      const duration = 400;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-space-navy font-noto-sc text-sm font-medium">
          {label}
        </span>
        <span className="font-nunito font-bold text-sm" style={{ color }}>
          {displayValue}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-light-gray overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.4, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default ScoreStep;
