import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Volume2, Star } from 'lucide-react';
import { Link } from 'react-router';


interface WeekHistory {
  week: number;
  words: {
    wordId: string;
    word: string;
    meaning: string;
    score: number;
    date: string;
    audioUrl: string;
  }[];
  averageScore: number;
}

interface HistoryAccordionProps {
  weekHistory: WeekHistory[];
  onPlayWord?: (audioUrl: string) => void;
}

function MiniStar({ filled }: { filled: boolean }) {
  return (
    <Star
      size={14}
      className={filled ? 'text-star-gold fill-star-gold' : 'text-dark-gray opacity-30'}
    />
  );
}

function scoreColorClass(score: number): string {
  if (score >= 90) return 'text-emerald-green';
  if (score >= 70) return 'text-star-gold';
  if (score >= 50) return 'text-sky-blue';
  return 'text-coral-red';
}

export default function HistoryAccordion({ weekHistory, onPlayWord }: HistoryAccordionProps) {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  if (weekHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="w-full text-center py-8"
      >
        <img
          src="/empty-state.png"
          alt="No history"
          className="w-24 h-24 object-contain mx-auto mb-4 opacity-50"
        />
        <p className="font-noto-sc text-base text-dark-gray">还没有学习记录哦</p>
        <p className="font-noto-sc text-sm text-dark-gray opacity-60 mt-1">快去学习页面开始吧!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full"
    >
      <h2 className="font-noto-sc text-xl md:text-2xl font-bold text-soft-white mb-4">
        学习记录
      </h2>

      <div className="flex flex-col gap-2">
        {weekHistory.map((week, weekIndex) => {
          const isExpanded = expandedWeek === week.week;
          const learnedCount = week.words.filter((w) => w.score > 0).length;

          return (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.8 + weekIndex * 0.06,
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              {/* Week Header */}
              <button
                className="w-full flex items-center justify-between px-4 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedWeek(isExpanded ? null : week.week)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-nunito font-bold text-base text-soft-white">
                    第 {week.week} 周
                  </span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <MiniStar key={i} filled={i < learnedCount} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-nunito text-sm font-semibold ${
                    week.averageScore >= 80 ? 'text-star-gold' : 'text-sky-blue'
                  }`}>
                    {Math.round(week.averageScore)}分
                  </span>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} className="text-dark-gray" />
                  </motion.div>
                </div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {week.words.map((word, wordIndex) => (
                        <motion.div
                          key={word.wordId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: wordIndex * 0.05, duration: 0.2 }}
                          className="flex items-center justify-between py-2.5 border-b border-[rgba(123,104,238,0.08)] last:border-0"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="font-nunito text-sm font-bold text-soft-white min-w-[60px]">
                              {word.word}
                            </span>
                            <span className="font-noto-sc text-xs text-dark-gray truncate">
                              {word.meaning}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {word.score > 0 && (
                              <>
                                <span className={`font-nunito text-sm font-semibold ${scoreColorClass(word.score)}`}>
                                  {word.score}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPlayWord?.(word.audioUrl);
                                  }}
                                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-nebula-purple/20 transition-colors cursor-pointer"
                                >
                                  <Volume2 size={14} className="text-nebula-purple" />
                                </button>
                              </>
                            )}
                            {word.score === 0 && (
                              <span className="font-noto-sc text-xs text-dark-gray opacity-50">未学习</span>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {/* Review Button */}
                      <div className="mt-3 flex justify-end">
                        <Link
                          to="/review"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-noto-sc text-sm text-white gradient-button hover:scale-105 transition-transform no-underline"
                        >
                          <Volume2 size={14} />
                          复习本周
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
