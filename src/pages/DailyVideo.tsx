import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Calendar, Sparkles, Star, ChevronRight } from 'lucide-react';

/* ---- Super Simple Songs 经典视频 ---- */
/* 使用 YouTube 嵌入播放器合法播放 */
const YOUTUBE_EMBED = 'https://www.youtube.com/embed';

interface VideoData {
  day: number;
  title: string;
  enTitle: string;
  desc: string;
  youtubeId: string;
  duration: string;
}

const DAILY_VIDEOS: VideoData[] = [
  {
    day: 0,
    title: '一闪一闪小星星',
    enTitle: 'Twinkle Twinkle Little Star',
    desc: '最经典的英文摇篮曲，旋律优美，画面温馨',
    youtubeId: 'xUDh55pS1oU',
    duration: '2:48',
  },
  {
    day: 1,
    title: '老麦克唐纳有个农场',
    enTitle: 'Old MacDonald Had A Farm',
    desc: '认识农场动物，学习动物叫声',
    youtubeId: 'LSsCsmKBwAHM',
    duration: '3:10',
  },
  {
    day: 2,
    title: '公交车的轮子转呀转',
    enTitle: 'The Wheels On The Bus',
    desc: '经典巴士儿歌，认识上下、开关等动作',
    youtubeId: 'RJ-5q6ErxDI',
    duration: '2:49',
  },
  {
    day: 3,
    title: '五只小鸭子',
    enTitle: 'Five Little Ducks',
    desc: '学习数字1-5，温馨亲子儿歌',
    youtubeId: 'pZw9veQ76fo',
    duration: '2:54',
  },
  {
    day: 4,
    title: '头肩膀膝盖脚趾',
    enTitle: 'Head Shoulders Knees And Toes',
    desc: '边唱边动，认识身体部位',
    youtubeId: 'QE-j7Ea-FNU',
    duration: '1:22',
  },
  {
    day: 5,
    title: '如果你感到幸福',
    enTitle: "If You're Happy And You Know It",
    desc: '学习拍手、跺脚等动作，节奏欢快',
    youtubeId: 'l4WNrvVb2lU',
    duration: '1:58',
  },
  {
    day: 6,
    title: '宾果狗狗歌',
    enTitle: 'BINGO',
    desc: '学习拼写B-I-N-G-O，互动性强的拍手歌',
    youtubeId: '0gv7oXHufVk',
    duration: '2:08',
  },
];

/* Bonus videos (playlist) */
const BONUS_VIDEOS: VideoData[] = [
  { day: -1, title: '一根小手指', enTitle: 'One Little Finger', desc: '学习身体部位英文', youtubeId: '7j6SOZKo3IU', duration: '1:41' },
  { day: -1, title: '划呀划小船', enTitle: 'Row Row Row Your Boat', desc: '经典划船儿歌', youtubeId: '7btG8E1CtKE', duration: '1:34' },
  { day: -1, title: '洗澡歌', enTitle: 'The Bath Song', desc: '洗澡时的快乐儿歌', youtubeId: 'Uv8T7YJxgQc', duration: '2:03' },
  { day: -1, title: '十只小印第安人', enTitle: 'Ten Little Indians', desc: '学习数字1-10', youtubeId: 'J9N7S9q9g3Q', duration: '1:47' },
  { day: -1, title: '苹果圆又圆', enTitle: 'Apple Round Apple Red', desc: '学习水果和形状', youtubeId: '3R_-Va6X8qA', duration: '1:45' },
  { day: -1, title: '下雨歌', enTitle: 'Rain Rain Go Away', desc: '雨天儿歌，学习天气词汇', youtubeId: 'LFrKYjrIDs8', duration: '1:36' },
];

function getTodayIndex(): number {
  return new Date().getDay();
}

export default function DailyVideo() {
  const navigate = useNavigate();
  const [todayIdx, setTodayIdx] = useState(getTodayIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const current = DAILY_VIDEOS[todayIdx];

  /* Build YouTube embed URL with autoplay params */
  const embedUrl = `${YOUTUBE_EMBED}/${current.youtubeId}?rel=0&modestbranding=1&playsinline=1${isPlaying ? '&autoplay=1' : ''}`;

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleSelectDay = (idx: number) => {
    setIsPlaying(false);
    setTodayIdx(idx);
  };

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-space-navy via-[#0a0a2e] to-space-navy text-white overflow-x-hidden relative">
      {/* Background stars */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[25%] w-1 h-1 bg-star-gold rounded-full animate-pulse" />
        <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
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
            Super Simple Songs 经典英文儿歌
          </p>
        </motion.div>

        {/* Day selector */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => handleSelectDay((todayIdx + 6) % 7)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Calendar size={16} className="text-nebula-purple" />
            <span className="font-nunito font-bold text-sm">{current.title}</span>
          </div>
          <button
            onClick={() => handleSelectDay((todayIdx + 1) % 7)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors rotate-180"
          >
            <ArrowLeft size={18} />
          </button>
        </motion.div>

        {/* YouTube Video Player */}
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              ref={iframeRef}
              className="absolute inset-0 w-full h-full"
              src={embedUrl}
              title={current.enTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </motion.div>

        {/* Video Info */}
        <motion.div
          className="mt-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-nunito font-bold text-lg text-white">{current.enTitle}</h2>
            <span className="text-xs text-lavender-mist/40 bg-white/10 px-2 py-1 rounded-full font-nunito">
              {current.duration}
            </span>
          </div>
          <p className="font-noto-sc text-sm text-lavender-mist/60">{current.desc}</p>

          {/* Play/Pause overlay controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            {!isPlaying ? (
              <motion.button
                onClick={handlePlay}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-star-gold to-[#FFE55C] flex items-center justify-center shadow-glow-gold hover:scale-105 transition-transform"
                whileTap={{ scale: 0.95 }}
              >
                <Play size={26} className="text-space-navy ml-0.5" />
              </motion.button>
            ) : (
              <motion.button
                onClick={handlePause}
                className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <Pause size={26} className="text-white" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Weekly schedule */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-noto-sc text-sm text-lavender-mist/50 mb-3 text-center">本周动画日程</p>
          <div className="grid grid-cols-7 gap-1">
            {DAILY_VIDEOS.map((_v, i) => {
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
                  <Star size={10} className={`mt-1 ${isToday ? 'text-star-gold' : isSelected ? 'text-lavender-mist/40' : 'text-lavender-mist/20'}`} />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Bonus Videos */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="font-noto-sc text-sm text-lavender-mist/50 mb-3 text-center">更多推荐儿歌</p>
          <div className="space-y-2">
            {BONUS_VIDEOS.map((video, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  setIsPlaying(false);
                  window.open(`${YOUTUBE_EMBED}/${video.youtubeId}`, '_blank');
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
              >
                <div className="w-10 h-10 rounded-full bg-nebula-purple/30 flex items-center justify-center flex-shrink-0">
                  <Play size={16} className="text-nebula-purple ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito font-bold text-sm text-white truncate">{video.enTitle}</p>
                  <p className="font-noto-sc text-xs text-lavender-mist/50 truncate">{video.title}</p>
                </div>
                <ChevronRight size={16} className="text-lavender-mist/30 flex-shrink-0" />
                <span className="text-xs text-lavender-mist/30 font-nunito">{video.duration}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Credit */}
        <motion.p
          className="text-center text-lavender-mist/30 text-xs font-noto-sc mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          视频来自 Super Simple Songs YouTube 频道
        </motion.p>
      </div>
    </div>
  );
}
