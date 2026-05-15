import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star } from 'lucide-react';

interface ProgressRingProps {
  learned: number;
  total: number;
  streakDays: number;
  averageScore: number;
}

export default function ProgressRing({ learned, total, streakDays, averageScore }: ProgressRingProps) {
  const [animatedLearned, setAnimatedLearned] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? learned / total : 0;
  const dashOffset = circumference * (1 - progress);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 800;
      const start = performance.now();

      function animate(now: number) {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setAnimatedLearned(Math.round(eased * learned));
        setAnimatedStreak(Math.round(eased * streakDays));
        setAnimatedScore(Math.round(eased * averageScore));
        if (t < 1) requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    }, 300);

    return () => clearTimeout(timer);
  }, [learned, streakDays, averageScore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full rounded-[24px] p-6 md:p-8"
      style={{
        background: 'linear-gradient(135deg, rgba(123,104,238,0.15), rgba(56,189,248,0.15))',
        border: '1px solid rgba(123, 104, 238, 0.2)',
        boxShadow: '0 8px 32px rgba(123, 104, 238, 0.25)',
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-around gap-6 md:gap-4">
        {/* Ring Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col items-center gap-2"
        >
          <div className="relative w-[120px] h-[120px]">
            <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="10"
                opacity="0.2"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="url(#ringGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              />
              <defs>
                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7B68EE" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-nunito font-black text-[28px] text-soft-white">
                {animatedLearned}/{total}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-noto-sc text-sm text-soft-white font-medium">本周学习进度</p>
            <p className="font-noto-sc text-xs text-dark-gray mt-0.5">
              {learned} 个单词已学
            </p>
          </div>
        </motion.div>

        {/* Streak Days */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col items-center gap-1"
        >
          <Flame size={24} className="text-coral-red" />
          <span className="font-nunito font-black text-[36px] text-coral-red leading-tight">
            {animatedStreak}
          </span>
          <span className="font-noto-sc text-sm text-dark-gray">连续学习</span>
        </motion.div>

        {/* Average Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col items-center gap-1"
        >
          <Star size={24} className="text-star-gold fill-star-gold" />
          <span className="font-nunito font-black text-[36px] text-star-gold leading-tight">
            {animatedScore}
          </span>
          <span className="font-noto-sc text-sm text-dark-gray">本周均分</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
