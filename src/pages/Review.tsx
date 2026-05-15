import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Pen } from 'lucide-react';
import CardCarousel from '@/components/review/CardCarousel';
import SpellingChallenge from '@/components/review/SpellingChallenge';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VOCABULARY_DATA } from '@/data/wordData';

type ReviewMode = 'quick' | 'spelling';

export default function Review() {
  const [mode, setMode] = useState<ReviewMode>('quick');
  const { progress } = useLocalStorage();

  // Get learned words for review
  const learnedWords = useMemo(() => {
    return progress.words
      .filter((w) => w.learned)
      .map((w) => {
        const wordData = VOCABULARY_DATA.find((vd) => vd.id === w.wordId);
        if (!wordData) return null;
        return {
          word: wordData,
          score: w.score,
        };
      })
      .filter(Boolean) as { word: typeof VOCABULARY_DATA[0]; score: number }[];
  }, [progress.words]);

  // Get up to 5 learned words for spelling challenge
  const spellingWords = useMemo(() => {
    return learnedWords.slice(0, 5).map((lw) => lw.word);
  }, [learnedWords]);

  const handleSpellingComplete = (results: { word: string; correct: boolean; score: number }[]) => {
    // Save spelling results to localStorage if needed
    console.log('Spelling results:', results);
  };

  return (
    <motion.div
      className="w-full max-w-[480px] mx-auto px-4 pb-8 flex flex-col gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="pt-4"
      >
        <h1 className="font-nunito font-black text-2xl md:text-3xl text-soft-white">
          复习单词
        </h1>
        <p className="font-noto-sc text-sm text-dark-gray mt-1">
          巩固已学知识，挑战拼写
        </p>
      </motion.div>

      {/* Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="relative flex p-1 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Sliding background */}
        <motion.div
          className="absolute top-1 bottom-1 rounded-full gradient-button"
          style={{
            width: 'calc(50% - 4px)',
            boxShadow: '0 2px 8px rgba(123, 104, 238, 0.3)',
          }}
          animate={{
            left: mode === 'quick' ? '4px' : 'calc(50%)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        <button
          onClick={() => setMode('quick')}
          className="relative z-10 flex-1 flex items-center justify-center gap-2 h-11 rounded-full font-noto-sc text-base font-semibold cursor-pointer transition-colors"
          style={{
            color: mode === 'quick' ? '#fff' : '#9CA3AF',
          }}
        >
          <BookOpen size={16} />
          快速复习
        </button>

        <button
          onClick={() => setMode('spelling')}
          className="relative z-10 flex-1 flex items-center justify-center gap-2 h-11 rounded-full font-noto-sc text-base font-semibold cursor-pointer transition-colors"
          style={{
            color: mode === 'spelling' ? '#fff' : '#9CA3AF',
          }}
        >
          <Pen size={16} />
          听写挑战
        </button>
      </motion.div>

      {/* Content Area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {mode === 'quick' ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <CardCarousel words={learnedWords} />
            </motion.div>
          ) : (
            <motion.div
              key="spelling"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              <SpellingChallenge
                words={spellingWords}
                onComplete={handleSpellingComplete}
                voiceSpeed={progress.settings.voiceSpeed}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
