import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import type { Word } from '@/types';

interface WordProgressInfo {
  wordId: string;
  learned: boolean;
  score: number;
}

interface StarMapProps {
  words: Word[];
  wordProgress: WordProgressInfo[];
  onReviewWord?: (wordId: string) => void;
}

interface StarConfig {
  x: number;
  y: number;
  word: Word;
  progress: WordProgressInfo | undefined;
}

function StarIcon({ learned, score, isCurrent, size = 64 }: {
  learned: boolean;
  score: number;
  isCurrent: boolean;
  size?: number;
}) {
  if (!learned && !isCurrent) {
    // Unlearned - gray outline with twinkle
    return (
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Star
          size={size}
          className="text-dark-gray"
          strokeWidth={1.5}
        />
      </motion.div>
    );
  }

  if (isCurrent) {
    // Current - purple with pulse
    return (
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'drop-shadow(0 0 12px rgba(123, 104, 238, 0.6))' }}
      >
        <Star
          size={size}
          className="text-nebula-purple fill-nebula-purple"
          strokeWidth={1.5}
        />
      </motion.div>
    );
  }

  // Learned - determine color by score
  let colorClass = 'text-star-gold fill-star-gold';
  let glowColor = 'rgba(255, 215, 0, 0.4)';

  if (score < 50) {
    colorClass = 'text-[#9CA3AF] fill-[#9CA3AF]';
    glowColor = 'transparent';
  } else if (score < 80) {
    colorClass = 'text-sky-blue fill-sky-blue';
    glowColor = 'rgba(56, 189, 248, 0.4)';
  }

  return (
    <motion.div
      animate={{ scale: score >= 80 ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: glowColor !== 'transparent' ? `drop-shadow(0 0 10px ${glowColor})` : 'none' }}
    >
      <Star
        size={size}
        className={colorClass}
        strokeWidth={1.5}
      />
    </motion.div>
  );
}

function ScoreStars({ score }: { score: number }) {
  const count = score >= 95 ? 3 : score >= 80 ? 2 : score >= 50 ? 1 : 0;
  return (
    <div className="flex gap-0.5 justify-center mt-1">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= count ? 'text-star-gold fill-star-gold' : 'text-dark-gray opacity-30'}
        />
      ))}
    </div>
  );
}

export default function StarMap({ words, wordProgress }: StarMapProps) {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Generate arc positions for 5 stars
  const starConfigs: StarConfig[] = words.slice(0, 5).map((word, index) => {
    const progress = wordProgress.find((p) => p.wordId === word.id);

    // Arc layout: spread stars in a semi-circle
    const totalStars = Math.min(words.length, 5);
    const angle = Math.PI - (index / (totalStars - 1)) * Math.PI; // 180° to 0°
    const radius = 120; // radius of the arc
    const centerX = 50; // percentage
    const centerY = 75; // percentage (lower = bottom of arc)
    const x = centerX + (Math.cos(angle) * radius / 2.5); // spread horizontally
    const y = centerY - (Math.sin(angle) * radius / 3); // arc height

    return { x, y, word, progress };
  });

  const handleStarClick = (config: StarConfig, event: React.MouseEvent) => {
    if (!config.progress?.learned) {
      // Show tooltip for unlearned
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
      setTimeout(() => setTooltipPos(null), 2000);
      return;
    }
    setSelectedWord(config.word);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full"
    >
      <div className="mb-4">
        <h2 className="font-noto-sc text-xl md:text-2xl font-bold text-soft-white">
          我的星际词汇
        </h2>
        <p className="font-noto-sc text-sm text-dark-gray mt-1">
          点击星星可以复习单词哦
        </p>
      </div>

      {/* Star Map Container */}
      <div
        className="relative w-full rounded-[24px] p-4 md:p-6 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(123, 104, 238, 0.15)',
          minHeight: 260,
        }}
      >
        {/* SVG Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {starConfigs.map((config, index) => {
            if (index === 0) return null;
            const prev = starConfigs[index - 1];
            const isConnected = prev.progress?.learned && config.progress?.learned;
            return (
              <motion.line
                key={`line-${index}`}
                x1={`${prev.x}%`}
                y1={`${prev.y}%`}
                x2={`${config.x}%`}
                y2={`${config.y}%`}
                stroke={isConnected ? '#FFD700' : '#374151'}
                strokeWidth="1"
                strokeDasharray={isConnected ? '4 4' : '4 4'}
                opacity={isConnected ? 0.3 : 0.1}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8 + index * 0.2, duration: 0.4 }}
              />
            );
          })}
        </svg>

        {/* Stars */}
        {starConfigs.map((config, index) => {
          const isLearned = config.progress?.learned ?? false;
          const score = config.progress?.score ?? 0;
          const isCurrent = !isLearned && (index === 0 || starConfigs.slice(0, index).every(
            (_, si) => starConfigs[si].progress?.learned ?? false
          ));

          return (
            <motion.div
              key={config.word.id}
              className="absolute flex flex-col items-center cursor-pointer"
              style={{
                left: `${config.x}%`,
                top: `${config.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
              }}
              initial={{ scale: 0, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{
                delay: 0.5 + index * 0.15,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
              }}
              whileHover={{ scale: 1.15 }}
              onClick={(e) => handleStarClick(config, e)}
            >
              <StarIcon
                learned={isLearned}
                score={score}
                isCurrent={isCurrent}
                size={64}
              />
              <span className="font-nunito text-sm font-bold text-soft-white mt-2 whitespace-nowrap">
                {config.word.word}
              </span>
              {isLearned && (
                <>
                  <span className={`font-nunito text-xs font-semibold ${
                    score >= 80 ? 'text-star-gold' : 'text-dark-gray'
                  }`}>
                    {score}分
                  </span>
                  <ScoreStars score={score} />
                </>
              )}
            </motion.div>
          );
        })}

        {/* Tooltip for unlearned words */}
        <AnimatePresence>
          {tooltipPos && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 px-3 py-2 rounded-xl font-noto-sc text-sm text-soft-white pointer-events-none"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y - 40,
                transform: 'translateX(-50%)',
                background: 'rgba(11, 29, 58, 0.95)',
                border: '1px solid rgba(123, 104, 238, 0.3)',
                boxShadow: '0 4px 16px rgba(123, 104, 238, 0.2)',
              }}
            >
              还没学到这颗星球哦，继续加油!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Word Detail Modal */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-[360px] rounded-[24px] p-6"
              style={{
                background: '#F8F9FC',
                boxShadow: '0 8px 32px rgba(123, 104, 238, 0.25)',
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
              }}
            >
              <button
                onClick={() => setSelectedWord(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X size={18} className="text-[#6B7280]" />
              </button>

              <div className="text-center">
                <Star
                  size={48}
                  className="text-star-gold fill-star-gold mx-auto mb-3"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))' }}
                />
                <h3 className="font-nunito font-black text-[40px] text-space-navy mb-1">
                  {selectedWord.word}
                </h3>
                <p className="font-nunito text-base text-nebula-purple mb-1">
                  {selectedWord.phonetic}
                </p>
                <p className="font-noto-sc text-lg text-[#374151] mb-4">
                  {selectedWord.meaning}
                </p>

                <div
                  className="rounded-xl p-4 mb-4 text-left"
                  style={{ background: 'rgba(123,104,238,0.08)' }}
                >
                  <p className="font-nunito text-lg font-semibold text-space-navy mb-1">
                    <span className="text-nebula-purple font-black">{selectedWord.word}</span>
                    {' '}{selectedWord.phrase.replace(selectedWord.word, '')}
                  </p>
                  <p className="font-noto-sc text-sm text-dark-gray">
                    {selectedWord.phraseMeaning}
                  </p>
                </div>

                {(() => {
                  const wp = wordProgress.find((p) => p.wordId === selectedWord.id);
                  return wp?.learned ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-nunito text-2xl font-bold" style={{
                        color: wp.score >= 90 ? '#34D399' : wp.score >= 70 ? '#FFD700' : '#FF6B6B',
                      }}>
                        {wp.score}分
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i <= Math.ceil(wp.score / 20)
                              ? 'text-star-gold fill-star-gold'
                              : 'text-light-gray'}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
