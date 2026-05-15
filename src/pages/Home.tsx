import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Rocket, Lock, Star, ChevronRight } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VOCABULARY_DATA, ACHIEVEMENTS } from '@/data/wordData';

// Animation config matching design.md easing curves
const SPRING_EASE = [0.34, 1.56, 0.64, 1] as [number, number, number, number];
const ENTER_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const cardGradients = [
  'linear-gradient(135deg, #7B68EE, #9B8AF4)',
  'linear-gradient(135deg, #38BDF8, #7DD3FC)',
  'linear-gradient(135deg, #34D399, #6EE7B7)',
  'linear-gradient(135deg, #F472B6, #F9A8D4)',
  'linear-gradient(135deg, #FFD700, #FCD34D)',
];

export default function Home() {
  const navigate = useNavigate();
  const { progress } = useLocalStorage();

  const currentWeekWords = VOCABULARY_DATA.filter(
    (w) => w.week === progress.currentWeek
  ).slice(0, 5);

  const learnedCount = currentWeekWords.filter((word) => {
    const wp = progress.words.find((w) => w.wordId === word.id);
    return wp?.learned;
  }).length;

  // Achievement preview - show unlocked + up to 3 total
  const unlockedAchievements = ACHIEVEMENTS.filter((a) =>
    a.condition(progress)
  ).slice(0, 3);
  const totalUnlocked = ACHIEVEMENTS.filter((a) =>
    a.condition(progress)
  ).length;

  // Find the first unlearned word index for "current" indicator
  const currentIndex = currentWeekWords.findIndex((word) => {
    const wp = progress.words.find((w) => w.wordId === word.id);
    return !wp?.learned;
  });
  const effectiveCurrentIndex = currentIndex === -1 ? 4 : currentIndex;

  // Streak display
  const streakText =
    progress.streakDays > 0
      ? `已连续学习 ${progress.streakDays} 天`
      : '今天开始学习吧!';

  // Split title for letter-by-letter animation
  const titleChars = 'StarWords'.split('');

  return (
    <div className="min-h-[100dvh] flex flex-col items-center px-4 pb-8">
      {/* ============ HERO SECTION ============ */}

      {/* Mascot with orbiting stars */}
      <motion.div
        className="relative mt-8 mb-4"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: SPRING_EASE }}
      >
        {/* Orbiting stars */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <Star
            size={14}
            className="absolute text-star-gold fill-star-gold"
            style={{ top: '10%', left: '0%' }}
          />
          <Star
            size={10}
            className="absolute text-nebula-purple fill-nebula-purple opacity-60"
            style={{ top: '5%', right: '15%' }}
          />
          <Star
            size={12}
            className="absolute text-sky-blue fill-sky-blue opacity-70"
            style={{ bottom: '15%', right: '0%' }}
          />
        </motion.div>

        {/* Mascot image */}
        <motion.img
          src="/mascot-astro.png"
          alt="StarWords mascot"
          className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain relative z-10"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Title - StarWords */}
      <div className="flex items-center justify-center mb-2 overflow-hidden">
        {titleChars.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5 + i * 0.05,
              duration: 0.3,
              ease: ENTER_EASE,
            }}
            className="font-nunito font-black text-5xl md:text-6xl text-star-gold inline-block text-shadow-glow"
            style={{ letterSpacing: '-0.02em' }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Subtitle */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.4, ease: ENTER_EASE }}
        className="font-noto-sc font-medium text-xl text-soft-white/80 mb-4"
      >
        星星英语
      </motion.h2>

      {/* Weekly theme text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.4 }}
        className="font-noto-sc font-medium text-lg text-nebula-purple mb-6"
      >
        本周探险 · 5颗新星球等你点亮!
      </motion.p>

      {/* ============ WORD PREVIEW CARDS ============ */}

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5, ease: ENTER_EASE }}
        className="w-full max-w-lg mb-6 relative"
      >
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, #0B1D3A, transparent)',
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to left, #0B1D3A, transparent)',
          }}
        />

        <div className="flex gap-4 overflow-x-auto px-10 py-2 scrollbar-hide snap-x snap-mandatory justify-start">
          {currentWeekWords.map((word, index) => {
            const wp = progress.words.find((w) => w.wordId === word.id);
            const isLearned = wp?.learned ?? false;
            const isCurrent = index === effectiveCurrentIndex;

            return (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 1.6 + index * 0.1,
                  duration: 0.5,
                  ease: ENTER_EASE,
                }}
                className="flex-shrink-0 snap-center"
              >
                <div
                  className="relative w-[120px] h-[160px] rounded-2xl p-4 flex flex-col items-center justify-between shadow-md cursor-pointer transition-transform hover:scale-105"
                  onClick={() => navigate(`/learn?wordIndex=${index}`)}
                  style={{
                    background: cardGradients[index % cardGradients.length],
                    opacity: isLearned ? 1 : 0.85,
                    boxShadow:
                      isLearned
                        ? '0 0 16px rgba(255, 215, 0, 0.4)'
                        : isCurrent
                        ? '0 0 16px rgba(123, 104, 238, 0.5)'
                        : '0 4px 16px rgba(123, 104, 238, 0.2)',
                    border:
                      isCurrent && !isLearned
                        ? '2px solid rgba(123, 104, 238, 0.5)'
                        : isLearned
                        ? '2px solid rgba(255, 215, 0, 0.5)'
                        : '2px solid transparent',
                    animation:
                      isCurrent && !isLearned ? 'pulseGlow 2s ease-in-out infinite' : 'none',
                  }}
                >
                  {/* Learned star badge */}
                  {isLearned && (
                    <div className="absolute -top-2 -left-2">
                      <Star
                        size={20}
                        className="text-star-gold fill-star-gold drop-shadow-glow"
                      />
                    </div>
                  )}

                  {/* Index label */}
                  <span className="text-white/70 text-xs font-nunito font-bold bg-black/20 px-2 py-0.5 rounded-full self-start">
                    #{index + 1}
                  </span>

                  {/* Word Image */}
                  <img
                    src={word.imageUrl}
                    alt={word.word}
                    className="w-12 h-12 object-contain drop-shadow-md"
                  />

                  {/* Word */}
                  <span className="text-white font-nunito font-bold text-lg text-center leading-tight">
                    {word.word}
                  </span>

                  {/* Status icon */}
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    {isLearned ? (
                      <ChevronRight size={14} className="text-white" />
                    ) : isCurrent ? (
                      <Star
                        size={14}
                        className="text-white/80 fill-white/80"
                      />
                    ) : (
                      <Lock size={12} className="text-white/60" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ============ ACHIEVEMENT PREVIEW ============ */}

      {unlockedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.0, duration: 0.3, ease: SPRING_EASE }}
          className="flex items-center gap-3 mb-6"
        >
          {unlockedAchievements.map((achievement, i) => (
            <motion.div
              key={achievement.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 2.1 + i * 0.1,
                duration: 0.3,
                ease: SPRING_EASE,
              }}
              className="relative group"
            >
              <img
                src={achievement.icon}
                alt={achievement.name}
                className="w-10 h-10 object-contain"
              />
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-space-navy border border-nebula-purple/30 text-soft-white text-xs font-noto-sc whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {achievement.name}
              </div>
            </motion.div>
          ))}
          {totalUnlocked > 3 && (
            <Link
              to="/progress"
              className="w-10 h-10 rounded-full bg-nebula-purple/20 flex items-center justify-center text-nebula-purple font-nunito font-bold text-sm hover:bg-nebula-purple/30 transition-colors no-underline"
            >
              +{totalUnlocked - 3}
            </Link>
          )}
        </motion.div>
      )}

      {/* ============ START LEARNING BUTTON ============ */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.5, ease: SPRING_EASE }}
        className="relative mb-4"
      >
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
          }}
          animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
          }}
          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeOut',
            delay: 0.8,
          }}
        />

        <Link
          to="/learn"
          className="relative flex items-center justify-center gap-3 w-[280px] h-[72px] md:w-[320px] md:h-[80px] rounded-full gradient-button text-white font-nunito font-black text-2xl no-underline shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <span>开始学习!</span>
          <motion.span
            animate={{ x: [0, 4], y: [0, -4] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            <Rocket size={24} />
          </motion.span>
        </Link>
      </motion.div>

      {/* ============ STREAK INFO ============ */}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.4 }}
        className="text-dark-gray font-noto-sc text-base text-center"
      >
        {streakText}
      </motion.p>

      {/* Progress summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.7, duration: 0.4 }}
        className="flex items-center gap-2 mt-2"
      >
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < learnedCount
                  ? 'text-star-gold fill-star-gold'
                  : 'text-dark-gray opacity-40'
              }
            />
          ))}
        </div>
        <span className="text-dark-gray text-sm font-noto-sc">
          {learnedCount}/5 已点亮
        </span>
      </motion.div>
    </div>
  );
}
