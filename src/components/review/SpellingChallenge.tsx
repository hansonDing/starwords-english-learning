import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Check, X, RotateCcw, ArrowRight, Star } from 'lucide-react';
import VirtualKeyboard from './VirtualKeyboard';
import LetterBlanks from './LetterBlanks';
import type { Word } from '@/types';

interface SpellingChallengeProps {
  words: Word[];
  onComplete: (results: { word: string; correct: boolean; score: number }[]) => void;
  voiceSpeed?: number;
}

type BlankStatus = 'empty' | 'filled' | 'correct' | 'incorrect';

interface Blank {
  letter: string;
  status: BlankStatus;
}

export default function SpellingChallenge({ words, onComplete: _onComplete, voiceSpeed = 0.8 }: SpellingChallengeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blanks, setBlanks] = useState<Blank[]>([]);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintCooldown, setHintCooldown] = useState(false);
  const [results, setResults] = useState<{ word: string; correct: boolean; score: number }[]>([]);
  const [showComplete, setShowComplete] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = words[currentIndex];

  // Initialize blanks for current word
  useEffect(() => {
    if (currentWord) {
      setBlanks(
        currentWord.word.split('').map(() => ({ letter: '', status: 'empty' as BlankStatus }))
      );
      setCurrentSlot(0);
      setIsCorrect(null);
      setHintUsed(false);
      setHintCooldown(false);
      // Auto-play after a short delay
      const timer = setTimeout(() => {
        playWord();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCorrect !== null || !currentWord) return;

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [blanks, currentSlot, isCorrect, currentWord]);

  const playWord = useCallback(() => {
    if (!currentWord || isPlaying) return;
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = 'en-US';
    utterance.rate = voiceSpeed;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [currentWord, isPlaying, voiceSpeed]);

  const handleKeyPress = useCallback((letter: string) => {
    if (isCorrect !== null) return;

    setBlanks((prev) => {
      if (currentSlot >= prev.length) return prev;
      const newBlanks = [...prev];
      newBlanks[currentSlot] = { letter, status: 'filled' };
      return newBlanks;
    });

    setCurrentSlot((prev) => prev + 1);
  }, [currentSlot, isCorrect]);

  const handleBackspace = useCallback(() => {
    if (isCorrect !== null || currentSlot <= 0) return;

    setBlanks((prev) => {
      const newBlanks = [...prev];
      newBlanks[currentSlot - 1] = { letter: '', status: 'empty' };
      return newBlanks;
    });

    setCurrentSlot((prev) => prev - 1);
  }, [currentSlot, isCorrect]);

  const handleHint = useCallback(() => {
    if (isCorrect !== null || hintUsed || hintCooldown || !currentWord) return;

    // Find an empty slot and fill it with the correct letter
    const emptyIndices = blanks
      .map((b, i) => (b.status === 'empty' || b.letter === '' ? i : -1))
      .filter((i) => i !== -1);

    if (emptyIndices.length === 0) return;

    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const correctLetter = currentWord.word[randomIndex];

    setBlanks((prev) => {
      const newBlanks = [...prev];
      newBlanks[randomIndex] = { letter: correctLetter.toUpperCase(), status: 'filled' };
      return newBlanks;
    });

    setHintUsed(true);
    setHintCooldown(true);
    setTimeout(() => setHintCooldown(false), 3000);
  }, [blanks, currentSlot, isCorrect, hintUsed, hintCooldown, currentWord]);

  const handleSubmit = useCallback(() => {
    if (!currentWord || isCorrect !== null) return;

    const userWord = blanks.map((b) => b.letter).join('').toLowerCase();
    const correct = userWord === currentWord.word.toLowerCase();

    setIsCorrect(correct);

    if (correct) {
      setBlanks((prev) =>
        prev.map((b) => ({ ...b, status: 'correct' as BlankStatus }))
      );
    } else {
      setBlanks((prev) =>
        prev.map((b, i) => ({
          ...b,
          letter: currentWord.word[i]?.toUpperCase() ?? b.letter,
          status: b.letter.toLowerCase() === (currentWord.word[i]?.toLowerCase() ?? '')
            ? ('correct' as BlankStatus)
            : ('incorrect' as BlankStatus),
        }))
      );
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }

    const score = correct ? (hintUsed ? 10 : 20) : 0;
    const newResult = { word: currentWord.word, correct, score };
    setResults((prev) => [...prev, newResult]);

    if (currentIndex >= words.length - 1) {
      setTimeout(() => setShowComplete(true), 2000);
    }
  }, [blanks, currentWord, isCorrect, currentIndex, words.length, hintUsed]);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, words.length]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setResults([]);
    setShowComplete(false);
  }, []);

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <img
          src="/empty-state.png"
          alt="No words"
          className="w-24 h-24 object-contain mb-4 opacity-50"
        />
        <p className="font-noto-sc text-base text-dark-gray">没有可听写的单词</p>
        <p className="font-noto-sc text-sm text-dark-gray opacity-60 mt-1">先去学习一些单词吧!</p>
      </div>
    );
  }

  // Completion screen
  if (showComplete) {
    const totalScore = results.reduce((s, r) => s + r.score, 0);
    const correctCount = results.filter((r) => r.correct).length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
        }}
        className="flex flex-col items-center gap-4 py-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
          }}
        >
          <Star size={56} className="text-star-gold fill-star-gold" style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.4))' }} />
        </motion.div>

        <h2 className="font-noto-sc text-xl font-bold text-star-gold">
          听写挑战完成!
        </h2>

        <div className="flex items-center gap-2">
          <motion.span
            className="font-nunito font-black text-5xl text-star-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {totalScore}
          </motion.span>
          <span className="font-noto-sc text-lg text-dark-gray">分</span>
        </div>

        <p className="font-noto-sc text-sm text-dark-gray">
          答对 {correctCount} / {words.length} 题
        </p>

        {/* Results list */}
        <div className="w-full max-w-[320px] flex flex-col gap-2 mt-2">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
              className="flex items-center justify-between py-2 px-4 rounded-xl"
              style={{
                background: result.correct
                  ? 'rgba(52, 211, 153, 0.1)'
                  : 'rgba(255, 107, 107, 0.1)',
                border: `1px solid ${result.correct ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 107, 107, 0.2)'}`,
              }}
            >
              <div className="flex items-center gap-2">
                {result.correct ? (
                  <Check size={18} className="text-emerald-green" />
                ) : (
                  <X size={18} className="text-coral-red" />
                )}
                <span className="font-nunito text-base font-bold text-soft-white">
                  {result.word}
                </span>
              </div>
              <span className={`font-nunito text-sm font-semibold ${
                result.correct ? 'text-emerald-green' : 'text-coral-red'
              }`}>
                +{result.score}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <motion.button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 rounded-full font-noto-sc text-base text-nebula-purple cursor-pointer"
            style={{
              border: '2px solid #7B68EE',
              background: 'transparent',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={16} />
            重新挑战
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Hidden input for physical keyboard on mobile */}
      <input
        ref={inputRef}
        type="text"
        className="sr-only"
        aria-hidden="true"
      />

      {/* Progress */}
      <div className="w-full flex items-center justify-between px-2">
        <span className="font-nunito text-sm font-semibold text-dark-gray">
          单词 {currentIndex + 1} / {words.length}
        </span>
        <div className="flex gap-1.5">
          {words.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentIndex
                  ? 'bg-emerald-green'
                  : i === currentIndex
                  ? 'bg-nebula-purple'
                  : 'bg-[#374151]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dictation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="w-full max-w-[400px] rounded-[24px] p-6 flex flex-col items-center gap-5"
        style={{
          background: '#F8F9FC',
          boxShadow: '0 4px 16px rgba(123, 104, 238, 0.2)',
        }}
      >
        {/* Play Button */}
        <motion.button
          onClick={playWord}
          disabled={isPlaying}
          className="w-16 h-16 rounded-full gradient-button flex items-center justify-center cursor-pointer disabled:opacity-70"
          style={{
            boxShadow: '0 4px 16px rgba(123, 104, 238, 0.3)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? (
            <div className="flex items-end gap-[3px] h-5">
              <motion.div
                className="w-[3px] bg-white rounded-full"
                animate={{ height: [5, 20, 10, 18, 5] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <motion.div
                className="w-[3px] bg-white rounded-full"
                animate={{ height: [14, 6, 20, 8, 14] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <motion.div
                className="w-[3px] bg-white rounded-full"
                animate={{ height: [8, 18, 5, 16, 8] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            </div>
          ) : (
            <Play size={28} className="text-white ml-1" />
          )}
        </motion.button>

        <p className="font-noto-sc text-sm text-[#6B7280]">点击听发音</p>

        {/* Prompt */}
        <h3 className="font-noto-sc text-xl font-semibold text-space-navy text-center">
          请拼写出你听到的单词
        </h3>

        {/* Letter Blanks */}
        <motion.div
          animate={shake ? { x: [-8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <LetterBlanks blanks={blanks} />
        </motion.div>

        {/* Submit or Next button */}
        <AnimatePresence mode="wait">
          {isCorrect === null ? (
            <motion.button
              key="submit"
              onClick={handleSubmit}
              disabled={blanks.some((b) => b.letter === '')}
              className="w-[200px] h-[52px] rounded-full font-nunito text-lg font-bold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: blanks.every((b) => b.letter !== '')
                  ? 'linear-gradient(135deg, #34D399 0%, #10B981 100%)'
                  : '#374151',
                boxShadow: blanks.every((b) => b.letter !== '')
                  ? '0 4px 16px rgba(52, 211, 153, 0.3)'
                  : 'none',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileTap={blanks.every((b) => b.letter !== '') ? { scale: 0.95 } : undefined}
              whileHover={blanks.every((b) => b.letter !== '') ? { scale: 1.05 } : undefined}
              transition={{ duration: 0.3 }}
            >
              提交答案
            </motion.button>
          ) : (
            <motion.div
              key="next"
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {/* Correct/Incorrect feedback */}
              {isCorrect ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                  }}
                  className="flex items-center gap-2 text-emerald-green"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 2, 1] }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                  >
                    <Check size={28} />
                  </motion.div>
                  <span className="font-noto-sc text-lg font-medium">太棒了!</span>
                  {hintUsed && <span className="font-nunito text-sm opacity-60">+10</span>}
                  {!hintUsed && <span className="font-nunito text-sm opacity-60">+20</span>}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 text-coral-red">
                    <X size={24} />
                    <span className="font-noto-sc text-base font-medium">继续加油!</span>
                  </div>
                  <p className="font-nunito text-sm text-emerald-green">
                    正确答案: <span className="font-bold">{currentWord.word}</span>
                  </p>
                </div>
              )}

              <motion.button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-nunito text-base font-bold text-white gradient-button cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentIndex < words.length - 1 ? (
                  <>
                    下一题
                    <ArrowRight size={16} />
                  </>
                ) : (
                  '查看成绩'
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onEnter={handleSubmit}
        onHint={handleHint}
        disabled={isCorrect !== null}
        hintCooldown={hintCooldown}
      />

      {/* Score tracking */}
      <div className="w-full flex items-center justify-center gap-4 text-sm">
        <span className="font-noto-sc text-soft-white/60">
          得分: <span className="text-star-gold font-nunito font-bold">{results.reduce((s, r) => s + r.score, 0)}</span>
        </span>
        <span className="font-noto-sc text-soft-white/60">
          正确: <span className="text-emerald-green font-nunito font-bold">{results.filter((r) => r.correct).length}</span>
          /{results.length}
        </span>
      </div>
    </div>
  );
}
