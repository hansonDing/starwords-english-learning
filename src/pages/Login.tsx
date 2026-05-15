import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    if (isRegister) {
      if (!displayName.trim()) {
        setError('请输入昵称');
        return;
      }
      const ok = auth.register(username.trim(), displayName.trim(), password.trim());
      if (ok) {
        setSuccess('注册成功！正在登录...');
        setTimeout(() => navigate('/'), 500);
      } else {
        setError('用户名已存在');
      }
    } else {
      const ok = auth.login(username.trim(), password.trim());
      if (ok) {
        setSuccess('登录成功！');
        setTimeout(() => navigate('/'), 300);
      } else {
        setError('用户名或密码错误');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-space-navy via-[#0a0a2e] to-space-navy text-white overflow-x-hidden relative">
      {/* Background stars */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[15%] w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-[25%] left-[70%] w-1.5 h-1.5 bg-star-gold rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[60%] left-[20%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[80%] left-[80%] w-1 h-1 bg-star-gold rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-md mx-auto px-4 pt-16 pb-8 relative z-10">
        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-nunito font-black text-4xl bg-gradient-to-r from-star-gold to-nebula-purple bg-clip-text text-transparent">
            StarWords
          </h1>
          <p className="text-lavender-mist/70 mt-2 font-noto-sc text-base">
            {isRegister ? '注册新账号' : '欢迎回来'}
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Tab switch */}
          <div className="flex mb-6 bg-white/10 rounded-2xl p-1">
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-nunito font-bold text-sm transition-all ${
                !isRegister
                  ? 'bg-nebula-purple text-white shadow-md'
                  : 'text-lavender-mist/60 hover:text-white'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl font-nunito font-bold text-sm transition-all ${
                isRegister
                  ? 'bg-nebula-purple text-white shadow-md'
                  : 'text-lavender-mist/60 hover:text-white'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-noto-sc text-lavender-mist/70 mb-1.5">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="输入用户名"
                className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-white placeholder-white/30 focus:outline-none focus:border-nebula-purple focus:ring-1 focus:ring-nebula-purple transition-all font-noto-sc"
                autoComplete="username"
              />
            </div>

            {/* Display Name (register only) */}
            {isRegister && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-noto-sc text-lavender-mist/70 mb-1.5">
                  昵称
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="输入昵称（显示在排行榜上）"
                  className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-white placeholder-white/30 focus:outline-none focus:border-nebula-purple focus:ring-1 focus:ring-nebula-purple transition-all font-noto-sc"
                />
              </motion.div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-noto-sc text-lavender-mist/70 mb-1.5">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-white placeholder-white/30 focus:outline-none focus:border-nebula-purple focus:ring-1 focus:ring-nebula-purple transition-all"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>

            {/* Error / Success */}
            {error && (
              <motion.p
                className="text-sm text-coral-red font-noto-sc text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                className="text-sm text-success-green font-noto-sc text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {success}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-star-gold to-[#FFE55C] text-space-navy font-nunito font-extrabold text-lg shadow-glow-gold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              whileTap={{ scale: 0.98 }}
            >
              {isRegister ? (
                <>
                  <UserPlus size={22} />
                  注册
                </>
              ) : (
                <>
                  <LogIn size={22} />
                  登录
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Guest hint */}
        <motion.p
          className="text-center text-lavender-mist/40 text-xs font-noto-sc mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          所有用户数据保存在本地浏览器中
        </motion.p>
      </div>
    </div>
  );
}
