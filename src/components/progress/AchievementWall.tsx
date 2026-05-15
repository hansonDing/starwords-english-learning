import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Star } from 'lucide-react';
import { ACHIEVEMENTS } from '@/data/wordData';
import type { Achievement, LearningProgress } from '@/types';

interface AchievementWallProps {
  progress: LearningProgress;
}

interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
}

function getBadgeGradient(index: number): string {
  const gradients = [
    'from-[#FFD700] to-[#FFA500]',
    'from-[#7B68EE] to-[#9B8AF4]',
    'from-[#34D399] to-[#10B981]',
    'from-[#38BDF8] to-[#7DD3FC]',
    'from-[#F472B6] to-[#F9A8D4]',
    'from-[#FF6B6B] to-[#FFA07A]',
  ];
  return gradients[index % gradients.length];
}

export default function AchievementWall({ progress }: AchievementWallProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithStatus | null>(null);

  const achievementsWithStatus: AchievementWithStatus[] = ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: progress.achievements.includes(a.id) || a.condition(progress),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full"
    >
      <h2 className="font-noto-sc text-xl md:text-2xl font-bold text-soft-white mb-4">
        我的成就
      </h2>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {achievementsWithStatus.map((achievement, index) => (
          <motion.button
            key={achievement.id}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.6 + index * 0.1,
              duration: 0.3,
              ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedAchievement(achievement)}
          >
            {/* Badge Container */}
            <div
              className={`relative w-20 h-20 md:w-24 md:h-24 rounded-[24px] flex items-center justify-center overflow-hidden transition-all duration-200 ${
                achievement.unlocked
                  ? `bg-gradient-to-br ${getBadgeGradient(index)} shadow-glow`
                  : 'bg-[#374151] opacity-60'
              }`}
              style={achievement.unlocked ? {
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)',
              } : {}}
            >
              {achievement.unlocked ? (
                <img
                  src={achievement.icon}
                  alt={achievement.name}
                  className="w-10 h-10 md:w-14 md:h-14 object-contain"
                  onError={(e) => {
                    // Fallback to Star icon if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" stroke-width="1"><path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"/></svg>';
                      parent.appendChild(fallback.firstChild!);
                    }
                  }}
                />
              ) : (
                <Lock size={24} className="text-[#6B7280]" />
              )}
            </div>

            {/* Badge Name */}
            <span className={`font-noto-sc text-xs text-center leading-tight ${
              achievement.unlocked ? 'text-soft-white' : 'text-dark-gray'
            }`}>
              {achievement.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAchievement(null)}
            />

            <motion.div
              className="relative w-full max-w-[320px] rounded-[24px] p-6 text-center"
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
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors cursor-pointer"
              >
                <X size={18} className="text-[#6B7280]" />
              </button>

              <div
                className={`w-24 h-24 rounded-[24px] mx-auto mb-4 flex items-center justify-center ${
                  selectedAchievement.unlocked
                    ? `bg-gradient-to-br ${getBadgeGradient(ACHIEVEMENTS.findIndex(a => a.id === selectedAchievement.id))}`
                    : 'bg-[#374151]'
                }`}
                style={selectedAchievement.unlocked ? {
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
                } : {}}
              >
                {selectedAchievement.unlocked ? (
                  <img
                    src={selectedAchievement.icon}
                    alt={selectedAchievement.name}
                    className="w-14 h-14 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Lock size={32} className="text-[#6B7280]" />
                )}
              </div>

              <h3 className="font-noto-sc text-xl font-bold text-space-navy mb-2">
                {selectedAchievement.name}
              </h3>
              <p className="font-noto-sc text-sm text-[#6B7280] mb-4">
                {selectedAchievement.description}
              </p>

              {!selectedAchievement.unlocked && (
                <div
                  className="rounded-xl p-3 font-noto-sc text-sm text-soft-white"
                  style={{
                    background: 'rgba(123, 104, 238, 0.1)',
                    border: '1px solid rgba(123, 104, 238, 0.2)',
                  }}
                >
                  <span className="text-nebula-purple font-medium">解锁条件：</span>
                  <span className="text-space-navy">{selectedAchievement.description}</span>
                </div>
              )}

              {selectedAchievement.unlocked && (
                <div className="flex items-center justify-center gap-2 text-emerald-green">
                  <Star size={18} className="fill-emerald-green" />
                  <span className="font-noto-sc text-sm font-medium">已获得</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
