import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReviewCard from './ReviewCard';
import { useSpeech } from '@/hooks/useSpeech';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Word } from '@/types';

interface LearnedWord {
  word: Word;
  score: number;
}

interface CardCarouselProps {
  words: LearnedWord[];
}

type FilterType = 'all' | 'week' | 'lastWeek' | 'earlier';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'week', label: '本周' },
  { key: 'lastWeek', label: '上周' },
  { key: 'earlier', label: '更早' },
];

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function CardCarousel({ words }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [direction, setDirection] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { speak } = useSpeech();
  const { progress } = useLocalStorage();

  // Filter words
  const filteredWords = useState(() => {
    if (filter === 'all') return words;
    if (filter === 'week') return words.filter((w) => w.word.week === progress.currentWeek);
    if (filter === 'lastWeek') return words.filter((w) => w.word.week === progress.currentWeek - 1);
    if (filter === 'earlier') return words.filter((w) => w.word.week < progress.currentWeek - 1);
    return words;
  })[0];

  useEffect(() => {
    const timer = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [filter]);

  const paginate = (newDirection: number) => {
    if (filteredWords.length === 0) return;
    const newIndex = currentIndex + newDirection;
    if (newIndex >= 0 && newIndex < filteredWords.length) {
      setDirection(newDirection);
      setCurrentIndex(newIndex);
      setFlippedCard(null);
    }
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipe = swipePower(info.offset.x, info.velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  const handlePlayWord = (word: Word) => {
    speak(word.audioUrl);
  };

  if (filteredWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <img
          src="/empty-state.png"
          alt="No words"
          className="w-24 h-24 object-contain mb-4 opacity-50"
        />
        <p className="font-noto-sc text-base text-dark-gray">还没有已学单词</p>
        <p className="font-noto-sc text-sm text-dark-gray opacity-60 mt-1">先去学习页面学习一些单词吧!</p>
      </div>
    );
  }

  const current = filteredWords[currentIndex];

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Filter Tabs */}
      <div
        className="flex gap-2 p-1 rounded-full overflow-x-auto max-w-full"
        style={{
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`relative px-4 py-2 rounded-full font-noto-sc text-sm whitespace-nowrap transition-colors cursor-pointer ${
              filter === f.key ? 'text-white' : 'text-dark-gray hover:text-soft-white/70'
            }`}
          >
            {filter === f.key && (
              <motion.div
                className="absolute inset-0 rounded-full gradient-button"
                layoutId="reviewFilter"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Card area */}
      <div
        ref={containerRef}
        className="relative w-full flex justify-center items-center"
        style={{ minHeight: '420px', perspective: '1000px' }}
      >
        {/* Navigation arrows */}
        {currentIndex > 0 && (
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 md:left-2 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            style={{
              background: 'rgba(123, 104, 238, 0.2)',
              border: '1px solid rgba(123, 104, 238, 0.3)',
            }}
          >
            <ChevronLeft size={20} className="text-soft-white" />
          </button>
        )}

        {currentIndex < filteredWords.length - 1 && (
          <button
            onClick={() => paginate(1)}
            className="absolute right-0 md:right-2 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            style={{
              background: 'rgba(123, 104, 238, 0.2)',
              border: '1px solid rgba(123, 104, 238, 0.3)',
            }}
          >
            <ChevronRight size={20} className="text-soft-white" />
          </button>
        )}

        {/* Card */}
        <div className="w-full max-w-[340px] relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.word.id + filter}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
            >
              <ReviewCard
                word={current.word}
                score={current.score}
                isFlipped={flippedCard === current.word.id}
                onFlip={() =>
                  setFlippedCard(flippedCard === current.word.id ? null : current.word.id)
                }
                onPlay={() => handlePlayWord(current.word)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex gap-2">
        {filteredWords.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
              setFlippedCard(null);
            }}
            className={`w-2 h-2 rounded-full cursor-pointer ${
              index === currentIndex ? 'bg-nebula-purple' : 'bg-dark-gray opacity-40'
            }`}
            animate={{
              scale: index === currentIndex ? 1.3 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <AnimatePresence>
        {showSwipeHint && filteredWords.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-dark-gray"
          >
            <ChevronLeft size={16} />
            <span className="font-noto-sc text-sm">左右滑动查看更多</span>
            <ChevronRight size={16} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count */}
      <p className="font-nunito text-sm text-dark-gray">
        {currentIndex + 1} / {filteredWords.length}
      </p>
    </div>
  );
}
