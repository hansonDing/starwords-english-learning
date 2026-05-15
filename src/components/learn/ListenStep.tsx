import { useEffect, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2 } from 'lucide-react';
import type { Word } from '@/types';
import Waveform from './Waveform';

interface ListenStepProps {
  word: Word;
  wordIndex: number;
  isPlaying: boolean;
  onPlay: () => void;
  onNext: () => void;
}

const encouragements = [
  '来认识一个新单词!',
  '新星球探险开始!',
  '发现新单词!',
];

const ListenStep = memo(function ListenStep({
  word,
  wordIndex,
  isPlaying,
  onPlay,
  onNext,
}: ListenStepProps) {
  const [showNext, setShowNext] = useState(false);
  const [encouragement] = useState(() =>
    encouragements[Math.floor(Math.random() * encouragements.length)]
  );

  // Show next button after audio has played
  useEffect(() => {
    if (!isPlaying) {
      const timer = setTimeout(() => setShowNext(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isPlaying]);

  // Highlight target word in phrase
  const renderPhrase = () => {
    const phrase = word.phrase;
    const target = word.word;
    const regex = new RegExp(`(${target})`, 'gi');
    const parts = phrase.split(regex);

    return (
      <span className="font-nunito font-semibold text-2xl sm:text-[32px] leading-relaxed text-[#F8F9FC]">
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span
              key={i}
              className="text-star-gold border-b-2 border-star-gold"
            >
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
      {/* Encouragement text */}
      <motion.p
        className="font-noto-sc font-medium text-lg sm:text-xl text-nebula-purple mb-6 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {encouragement}
      </motion.p>

      {/* Word label */}
      <motion.div
        className="text-xs font-noto-sc text-dark-gray mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        第 {wordIndex + 1} 个单词
      </motion.div>

      {/* Word Card */}
      <motion.div
        className="w-full rounded-3xl p-6 mb-6 relative overflow-hidden"
        style={{
          backgroundColor: '#F8F9FC',
          boxShadow: '0 4px 16px rgba(123, 104, 238, 0.2)',
        }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
      >
        {/* Colored top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(135deg, hsl(${(wordIndex * 72) % 360}, 70%, 60%), hsl(${(wordIndex * 72 + 40) % 360}, 70%, 70%))`,
          }}
        />

        {/* Word Image */}
        <motion.div
          className="flex justify-center mb-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <img
            src={word.imageUrl}
            alt={word.word}
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
          />
        </motion.div>

        {/* Word */}
        <motion.h2
          className="font-nunito font-black text-[40px] sm:text-[56px] text-space-navy text-center leading-tight mb-2"
          style={{ letterSpacing: '-0.01em' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
          }}
        >
          {word.word}
        </motion.h2>

        {/* Phonetic */}
        <p className="text-center text-dark-gray text-sm font-nunito mb-3">
          {word.phonetic}
        </p>

        {/* Chinese meaning */}
        <p className="text-center text-space-navy font-noto-sc text-base font-medium">
          {word.meaning}
        </p>
      </motion.div>

      {/* Phrase display */}
      <motion.div
        className="w-full rounded-2xl p-5 sm:p-6 mb-6 text-center"
        style={{ backgroundColor: 'rgba(11, 29, 58, 0.6)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {renderPhrase()}
        <p className="text-dark-gray font-noto-sc text-sm mt-3">
          {word.phraseMeaning}
        </p>
      </motion.div>

      {/* Audio Button */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <motion.button
          onClick={onPlay}
          disabled={isPlaying}
          className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
            boxShadow: '0 4px 16px rgba(123, 104, 238, 0.3)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Ripple animation when playing */}
          {isPlaying && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
                }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
                }}
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.5,
                }}
              />
            </>
          )}

          {isPlaying ? (
            <Volume2 size={28} className="text-white relative z-10" />
          ) : (
            <Play size={28} className="text-white relative z-10 ml-1" />
          )}
        </motion.button>

        {/* Waveform visualization */}
        <Waveform isPlaying={isPlaying} />

        <span className="text-dark-gray font-noto-sc text-xs">
          {isPlaying ? '正在播放...' : '点击播放发音'}
        </span>
      </motion.div>

      {/* Next button */}
      <AnimatePresence>
        {showNext && !isPlaying && (
          <motion.button
            onClick={onNext}
            className="mt-8 px-8 py-3.5 rounded-full font-noto-sc font-bold text-base text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
              boxShadow: '0 4px 16px rgba(123, 104, 238, 0.3)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            下一步: 跟读练习 →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});

export default ListenStep;
