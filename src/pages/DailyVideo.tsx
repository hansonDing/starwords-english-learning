import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Calendar, Sparkles, Music } from 'lucide-react';

/* ---- 每日视频主题 + 旁白音频 ---- */
const DAILY_THEMES = [
  { day: 0, title: '小猫的森林冒险', enTitle: "The Cat's Forest Adventure", desc: '一只小猫在魔法森林中探索，遇到闪闪发光的小精灵', audio: '/audio/song01-cat.mp3' },
  { day: 1, title: '小狗的草地嬉戏', enTitle: 'The Dog Plays in the Meadow', desc: '小狗在阳光明媚的草地上和蝴蝶一起玩耍', audio: '/audio/song02-dog.mp3' },
  { day: 2, title: '小鸟的彩虹之旅', enTitle: "The Bird's Rainbow Journey", desc: '小鸟飞越彩虹河，花瓣在空中飞舞', audio: '/audio/song03-bird.mp3' },
  { day: 3, title: '小金鱼的海洋世界', enTitle: "The Goldfish's Ocean World", desc: '小金鱼在水晶般清澈的水中畅游', audio: '/audio/song04-fish.mp3' },
  { day: 4, title: '小兔子的花田跳跃', enTitle: 'The Rabbit Hops in the Flower Field', desc: '小白兔在五彩花田中欢快地跳跃', audio: '/audio/song05-rabbit.mp3' },
  { day: 5, title: '苹果的小山丘之旅', enTitle: "The Apple's Hill Adventure", desc: '红苹果滚下绿色的小山丘，开出小花', audio: '/audio/song06-apple.mp3' },
  { day: 6, title: '日出时分的村庄', enTitle: 'The Village at Sunrise', desc: '金色的太阳从宁静的村庄升起', audio: '/audio/song07-sun.mp3' },
];

const VIDEOS = [
  '/videos/anim01-cat-forest.mp4',
  '/videos/anim02-dog-meadow.mp4',
  '/videos/anim03-bird-rainbow.mp4',
  '/videos/anim04-fish-ocean.mp4',
  '/videos/anim05-rabbit-field.mp4',
  '/videos/anim06-apple-hill.mp4',
  '/videos/anim07-sunrise.mp4',
  '/videos/anim08-moon-stars.mp4',
  '/videos/anim09-flower-garden.mp4',
  '/videos/anim10-tree-reading.mp4',
];

function getTodayIndex(): number {
  return new Date().getDay();
}

export default function DailyVideo() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [todayIdx, setTodayIdx] = useState(getTodayIndex);

  const theme = DAILY_THEMES[todayIdx];

  const todayVideo = useMemo(() => {
    return VIDEOS[(todayIdx * 2) % VIDEOS.length];
  }, [todayIdx]);

  /* Sync video and audio */
  const syncPlay = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    if (video.paused) {
      video.play().catch(() => {});
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current && audioRef.current && !isNaN(val)) {
      videoRef.current.currentTime = val;
      audioRef.current.currentTime = val;
      setProgress(val);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const handleChangeDay = (offset: number) => {
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setTodayIdx((prev) => (prev + offset + 7) % 7);
  };

  const handleSelectDay = (idx: number) => {
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setProgress(0);
    setTodayIdx(idx);
  };

  const formatTime = (s: number) => {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  /* Load new video/audio when day changes */
  useEffect(() => {
    if (videoRef.current && audioRef.current) {
      videoRef.current.src = todayVideo;
      videoRef.current.load();
      audioRef.current.src = theme.audio;
      audioRef.current.load();
      audioRef.current.muted = isMuted;
    }
  }, [todayIdx, todayVideo, theme.audio, isMuted]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-space-navy via-[#0a0a2e] to-space-navy text-white overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[25%] w-1 h-1 bg-star-gold rounded-full animate-pulse" />
        <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
      </div>

      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-lg mx-auto px-4 pt-16 pb-8 relative z-10">
        {/* Title */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={24} className="text-star-gold" />
            <h1 className="font-nunito font-black text-3xl bg-gradient-to-r from-star-gold to-nebula-purple bg-clip-text text-transparent">
              每日动画
            </h1>
          </div>
          <p className="text-lavender-mist/60 font-noto-sc text-sm">
            每天一段唯美英文动画 + 英文儿歌旁白
          </p>
        </motion.div>

        {/* Day selector */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => handleChangeDay(-1)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Calendar size={16} className="text-nebula-purple" />
            <span className="font-nunito font-bold text-sm">{theme.title}</span>
          </div>
          <button
            onClick={() => handleChangeDay(1)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors rotate-180"
          >
            <ArrowLeft size={18} />
          </button>
        </motion.div>

        {/* Audio narration hint */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-nebula-purple/10 border border-nebula-purple/20 self-center mx-auto w-fit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Music size={14} className="text-nebula-purple" />
          <span className="text-xs text-lavender-mist/60 font-noto-sc">英文儿歌旁白</span>
          <span className="text-xs text-lavender-mist/40 font-nunito italic">{theme.enTitle}</span>
        </motion.div>

        {/* Video Player */}
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Hidden audio element for narration */}
          <audio
            ref={audioRef}
            src={theme.audio}
            preload="metadata"
            loop
          />

          <video
            ref={videoRef}
            className="w-full aspect-video object-cover"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onClick={syncPlay}
            playsInline
            preload="metadata"
            loop
          >
            <source src={todayVideo} type="video/mp4" />
          </video>

          {/* Overlay play button (shown when paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={syncPlay}>
              <motion.button
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Play size={32} className="text-white ml-1" />
              </motion.button>
            </div>
          )}

          {/* Audio toggle button */}
          <button
            onClick={toggleMute}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors z-10"
          >
            {isMuted ? (
              <VolumeX size={18} className="text-coral-red" />
            ) : (
              <Volume2 size={18} className="text-success-green" />
            )}
          </button>

          {/* Narration text overlay */}
          {isPlaying && !isMuted && (
            <motion.div
              className="absolute bottom-3 left-3 right-16 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-xs text-white/80 font-nunito italic">{theme.enTitle}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Controls */}
        <motion.div
          className="mt-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Progress bar */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-star-gold [&::-webkit-slider-thumb]:rounded-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-lavender-mist/40 font-nunito">{formatTime(progress)}</span>
              <span className="text-xs text-lavender-mist/40 font-nunito">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isMuted ? <VolumeX size={18} className="text-coral-red" /> : <Volume2 size={18} className="text-success-green" />}
            </button>

            <button
              onClick={syncPlay}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-star-gold to-[#FFE55C] flex items-center justify-center shadow-glow-gold hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause size={26} className="text-space-navy" />
              ) : (
                <Play size={26} className="text-space-navy ml-0.5" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Theme description */}
        <motion.div
          className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-nebula-purple/20 to-star-gold/10 border border-nebula-purple/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-noto-sc font-bold text-base text-white mb-1">{theme.title}</h3>
          <p className="font-nunito text-sm text-lavender-mist/70 italic">{theme.enTitle}</p>
          <p className="font-noto-sc text-sm text-lavender-mist/50 mt-2">{theme.desc}</p>
        </motion.div>

        {/* Weekly schedule */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="font-noto-sc text-sm text-lavender-mist/50 mb-3 text-center">本周动画日程</p>
          <div className="grid grid-cols-7 gap-1">
            {DAILY_THEMES.map((_theme, i) => {
              const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
              const isToday = i === getTodayIndex();
              const isSelected = i === todayIdx;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectDay(i)}
                  className={`flex flex-col items-center py-2 rounded-xl transition-all ${
                    isToday
                      ? 'bg-nebula-purple/30 border border-nebula-purple/40'
                      : isSelected
                      ? 'bg-white/10 border border-white/20'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  <span className={`text-xs font-nunito ${isToday ? 'text-star-gold' : 'text-lavender-mist/40'}`}>
                    {dayNames[i]}
                  </span>
                  <Music size={10} className={`mt-1 ${isToday ? 'text-star-gold' : 'text-lavender-mist/20'}`} />
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
