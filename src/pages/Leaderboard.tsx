import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Medal, Star, Crown, Flame, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/hooks/useAuth';

const rankColors = [
  'from-star-gold to-[#FFE55C]',      // 1st
  'from-silver to-[#E8E8E8]',         // 2nd
  'from-bronze to-[#CD7F32]',         // 3rd
  'from-nebula-purple to-[#9B8AF4]',  // 4th+
];

const rankIcons = [Crown, Medal, Star];

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user, getAllUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(getAllUsers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUserId = user?.id;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-space-navy via-[#0a0a2e] to-space-navy text-white overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-star-gold rounded-full animate-pulse" />
        <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-[20%] left-[10%] w-1 h-1 bg-star-gold rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-lg mx-auto px-4 pt-16 pb-8 relative z-10">
        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy size={32} className="text-star-gold" />
            <h1 className="font-nunito font-black text-3xl bg-gradient-to-r from-star-gold to-nebula-purple bg-clip-text text-transparent">
              评分天梯
            </h1>
          </div>
          <p className="text-lavender-mist/60 font-noto-sc text-sm">
            看看谁是学习小达人
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        {users.length >= 3 && (
          <motion.div
            className="flex items-end justify-center gap-3 mb-8 h-40"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* 2nd */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-silver to-[#E8E8E8] flex items-center justify-center shadow-lg mb-2">
                <Medal size={28} className="text-space-navy" />
              </div>
              <div className="w-20 h-20 bg-gradient-to-b from-silver/30 to-silver/10 rounded-t-xl flex flex-col items-center justify-center border-t border-silver/30">
                <span className="font-nunito font-bold text-xs text-white truncate max-w-[72px]">{users[1].displayName}</span>
                <span className="font-nunito font-black text-sm text-star-gold">{users[1].totalScore}</span>
              </div>
            </div>

            {/* 1st */}
            <div className="flex flex-col items-center">
              <Crown size={24} className="text-star-gold mb-1" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-star-gold to-[#FFE55C] flex items-center justify-center shadow-glow-gold mb-2">
                <span className="font-nunito font-black text-2xl text-space-navy">1</span>
              </div>
              <div className="w-24 h-28 bg-gradient-to-b from-star-gold/30 to-star-gold/10 rounded-t-xl flex flex-col items-center justify-center border-t border-star-gold/30">
                <span className="font-nunito font-bold text-sm text-white truncate max-w-[88px]">{users[0].displayName}</span>
                <span className="font-nunito font-black text-lg text-star-gold">{users[0].totalScore}</span>
              </div>
            </div>

            {/* 3rd */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-bronze to-[#CD7F32] flex items-center justify-center shadow-lg mb-2">
                <Star size={28} className="text-space-navy" />
              </div>
              <div className="w-20 h-16 bg-gradient-to-b from-bronze/30 to-bronze/10 rounded-t-xl flex flex-col items-center justify-center border-t border-bronze/30">
                <span className="font-nunito font-bold text-xs text-white truncate max-w-[72px]">{users[2].displayName}</span>
                <span className="font-nunito font-black text-sm text-star-gold">{users[2].totalScore}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* List */}
        <div className="space-y-2">
          {users.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <UserIcon size={48} className="mx-auto text-lavender-mist/30 mb-4" />
              <p className="text-lavender-mist/50 font-noto-sc text-base">
                还没有用户注册
              </p>
              <p className="text-lavender-mist/30 font-noto-sc text-sm mt-2">
                快去注册成为第一个学习小达人吧！
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-nebula-purple text-white font-noto-sc font-bold hover:bg-nebula-purple/80 transition-colors"
              >
                去注册
              </button>
            </motion.div>
          ) : (
            users.map((user, index) => {
              const RankIcon = rankIcons[index] || Star;
              const isCurrentUser = user.id === currentUserId;

              return (
                <motion.div
                  key={user.id}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
                    isCurrentUser
                      ? 'bg-nebula-purple/20 border-nebula-purple/40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Rank */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      index < 3
                        ? `bg-gradient-to-b ${rankColors[index]} shadow-md`
                        : 'bg-white/10'
                    }`}
                  >
                    {index < 3 ? (
                      <RankIcon size={18} className="text-space-navy" />
                    ) : (
                      <span className="font-nunito font-bold text-sm">{index + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nebula-purple to-star-gold flex items-center justify-center flex-shrink-0">
                    <span className="font-nunito font-bold text-sm text-white">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-nunito font-bold text-sm text-white truncate">
                      {user.displayName}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-xs text-nebula-purple">(我)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-lavender-mist/50">
                      <span>{user.wordsLearned} 词</span>
                      {user.streakDays > 0 && (
                        <span className="flex items-center gap-0.5 text-orange-400">
                          <Flame size={12} />
                          {user.streakDays} 天
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <span className="font-nunito font-black text-lg text-star-gold">
                      {user.totalScore}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Your rank hint */}
        {user && users.length > 0 && (
          <motion.div
            className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-nebula-purple/20 to-star-gold/10 border border-nebula-purple/20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="font-noto-sc text-sm text-lavender-mist/70">
              你的当前排名：<span className="text-star-gold font-bold">第 {users.findIndex((u) => u.id === user?.id) + 1 || '-'} 名</span>
            </p>
            <p className="font-noto-sc text-xs text-lavender-mist/40 mt-1">
              总得分：{user.totalScore} | 已学：{user.wordsLearned} 词
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
