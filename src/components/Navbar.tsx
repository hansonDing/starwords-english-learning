import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Settings, RotateCcw, Volume2, LogIn, LogOut, Trophy, Video, User } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/hooks/useAuth';
import { VOCABULARY_DATA } from '@/data/wordData';

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { progress, updateSettings, resetProgress } = useLocalStorage();
  const auth = useAuth();

  const currentWeekWords = VOCABULARY_DATA.filter(
    (w) => w.week === progress.currentWeek
  );

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    if (auth.isLoggedIn) {
      // Show confirmation before logout
      if (window.confirm('确定要退出登录吗？')) {
        auth.logout();
        setMenuOpen(false);
      }
    } else {
      navigate('/login');
      setMenuOpen(false);
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-50"
      style={{
        backgroundColor: 'rgba(11, 29, 58, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(123, 104, 238, 0.2)',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 2L16.5 10.5L25 14L16.5 17.5L14 26L11.5 17.5L3 14L11.5 10.5L14 2Z"
            fill="#FFD700"
            stroke="#FFD700"
            strokeWidth="1"
          />
          <path
            d="M14 6L15.5 11.5L21 14L15.5 16.5L14 22L12.5 16.5L7 14L12.5 11.5L14 6Z"
            fill="#0B1D3A"
          />
        </svg>
        <span
          className="text-star-gold font-nunito font-extrabold text-lg hidden sm:inline"
        >
          StarWords
        </span>
      </Link>

      {/* Progress Stars */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {currentWeekWords.slice(0, 5).map((word, index) => {
          const wordProgress = progress.words.find(
            (w) => w.wordId === word.id
          );
          const isLearned = wordProgress?.learned ?? false;
          const isCurrent =
            !isLearned &&
            (index === 0 ||
              currentWeekWords
                .slice(0, index)
                .every(
                  (w) =>
                    progress.words.find((pw) => pw.wordId === w.id)?.learned
                ));

          return (
            <motion.div
              key={word.id}
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{
                delay: index * 0.15,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
              }}
            >
              <Star
                size={20}
                className={
                  isLearned
                    ? 'text-star-gold fill-star-gold drop-shadow-[0_0_6px_rgba(255,215,0,0.4)]'
                    : isCurrent
                    ? 'text-nebula-purple animate-pulseGlow'
                    : 'text-dark-gray opacity-40'
                }
              />
            </motion.div>
          );
        })}
      </div>

      {/* Right: Settings + User */}
      <div className="flex items-center gap-2">
        {/* Settings Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-nebula-purple/30 to-nebula-purple/10 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border border-nebula-purple/20"
          >
            <Settings size={16} className="text-soft-white" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-10 w-56 rounded-xl p-2 z-50"
                style={{
                  backgroundColor: 'rgba(11, 29, 58, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(123, 104, 238, 0.2)',
                  boxShadow: '0 8px 32px rgba(123, 104, 238, 0.25)',
                }}
              >
                {/* User info */}
                {auth.isLoggedIn && auth.user ? (
                  <div className="px-3 py-2 mb-1 border-b border-nebula-purple/20">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nebula-purple to-star-gold flex items-center justify-center">
                        <span className="font-nunito font-bold text-xs text-white">
                          {auth.user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-nunito font-bold text-sm">{auth.user.displayName}</p>
                        <p className="text-lavender-mist/40 text-xs font-nunito">{auth.user.totalScore} 分</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Nav Links */}
                <Link
                  to="/leaderboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-soft-white/80 hover:bg-nebula-purple/20 transition-colors text-sm cursor-pointer no-underline"
                >
                  <Trophy size={14} className="text-star-gold" />
                  <span className="font-noto-sc">评分天梯</span>
                </Link>

                <Link
                  to="/video"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-soft-white/80 hover:bg-nebula-purple/20 transition-colors text-sm cursor-pointer no-underline"
                >
                  <Video size={14} className="text-nebula-purple" />
                  <span className="font-noto-sc">每日动画</span>
                </Link>

                <div className="my-1 border-t border-nebula-purple/20" />

                {/* Voice speed */}
                <div className="px-3 py-1.5 text-soft-white/60 text-xs font-noto-sc">
                  语音速度: {Math.round(progress.settings.voiceSpeed * 100)}%
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.5"
                  step="0.1"
                  value={progress.settings.voiceSpeed}
                  onChange={(e) =>
                    updateSettings({ voiceSpeed: parseFloat(e.target.value) })
                  }
                  className="w-full mx-3 mb-2 accent-nebula-purple"
                  style={{ width: 'calc(100% - 24px)' }}
                />

                <button
                  onClick={() => {
                    updateSettings({
                      difficulty:
                        progress.settings.difficulty === 'easy'
                          ? 'normal'
                          : progress.settings.difficulty === 'normal'
                          ? 'hard'
                          : 'easy',
                    });
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-soft-white/80 hover:bg-nebula-purple/20 transition-colors text-sm cursor-pointer"
                >
                  <Volume2 size={14} />
                  <span className="font-noto-sc">
                    难度:{' '}
                    {progress.settings.difficulty === 'easy'
                      ? '简单'
                      : progress.settings.difficulty === 'normal'
                      ? '中等'
                      : '困难'}
                  </span>
                </button>

                <div className="my-1 border-t border-nebula-purple/20" />

                {/* Login / Logout */}
                <button
                  onClick={handleLoginClick}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-soft-white/80 hover:bg-nebula-purple/20 transition-colors text-sm cursor-pointer"
                >
                  {auth.isLoggedIn ? (
                    <>
                      <LogOut size={14} className="text-coral-red" />
                      <span className="font-noto-sc text-coral-red">退出登录</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={14} className="text-success-green" />
                      <span className="font-noto-sc">登录 / 注册</span>
                    </>
                  )}
                </button>

                <div className="my-1 border-t border-nebula-purple/20" />

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        '确定要重置所有学习进度吗？此操作不可撤销！'
                      )
                    ) {
                      resetProgress();
                      setMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-coral-red/80 hover:bg-coral-red/10 transition-colors text-sm cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span className="font-noto-sc">重置进度</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar (quick login/logout) */}
        <button
          onClick={() => auth.isLoggedIn ? navigate('/leaderboard') : navigate('/login')}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border border-white/20 overflow-hidden"
          style={{
            background: auth.isLoggedIn
              ? 'linear-gradient(135deg, #7B68EE, #FFD700)'
              : 'rgba(255,255,255,0.1)',
          }}
        >
          {auth.isLoggedIn && auth.user ? (
            <span className="font-nunito font-bold text-xs text-white">
              {auth.user.displayName.charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={16} className="text-lavender-mist/60" />
          )}
        </button>
      </div>
    </nav>
  );
}
