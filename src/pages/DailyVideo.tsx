import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Calendar, Sparkles, Star, ChevronRight, ExternalLink } from 'lucide-react';

/* ---- Bilibili Embed Base ---- */
const BILI_EMBED = 'https://player.bilibili.com/player.html';
const BILI_BVID = 'BV1prsnzGEeY';

interface VideoData {
  page: number;
  title: string;
  enTitle: string;
  desc: string;
  category: string;
}

/* ---- 每日7首经典儿歌 ---- */
const DAILY_VIDEOS: VideoData[] = [
  {
    page: 2,
    title: '划呀划小船',
    enTitle: 'Row Row Row Your Boat',
    desc: '坐上小船 gently down the stream，感受水波荡漾的快乐',
    category: '自然',
  },
  {
    page: 4,
    title: '早安大公鸡',
    enTitle: 'Good Morning, Mr. Rooster',
    desc: '跟着大公鸡学习早上好怎么说，开启美好的一天',
    category: '日常',
  },
  {
    page: 7,
    title: '头肩膝脚趾',
    enTitle: 'Head Shoulders Knees & Toes',
    desc: '边唱边指，认识身体的各个部位',
    category: '身体',
  },
  {
    page: 10,
    title: '老麦克唐纳',
    enTitle: 'Old MacDonald Had A Farm',
    desc: '参观农场，认识牛、猪、鸭等动物的叫声',
    category: '动物',
  },
  {
    page: 13,
    title: '如果你感到幸福',
    enTitle: "If You're Happy And You Know It",
    desc: '拍拍手、跺跺脚，用动作表达快乐的心情',
    category: '情绪',
  },
  {
    page: 20,
    title: '公交车的轮子',
    enTitle: 'The Wheels On The Bus',
    desc: '轮子在转呀转，雨刮器在刷呀刷，认识公交车的各个部件',
    category: '交通',
  },
  {
    page: 44,
    title: '雨呀快走吧',
    enTitle: 'Rain Rain Go Away',
    desc: '小雨小雨快走开，好让我出去玩，学习天气相关的词汇',
    category: '天气',
  },
];

/* ---- 更多推荐儿歌 ---- */
const MORE_VIDEOS: VideoData[] = [
  { page: 5, title: '打开合上', enTitle: 'Open Shut Them', desc: '学习打开和合上的动作', category: '动作' },
  { page: 9, title: '甜美梦境', enTitle: 'Sweet Dreams', desc: '温柔的摇篮曲，伴你入睡', category: '睡前' },
  { page: 12, title: '数一数动起来', enTitle: 'Count & Move', desc: '从1数到5，边数边做动作', category: '数字' },
  { page: 15, title: '一根小手指', enTitle: 'One Little Finger', desc: '用手指指向上和向下', category: '身体' },
  { page: 19, title: '我们去动物园', enTitle: "Let's Go To The Zoo", desc: '参观动物园，模仿动物的动作', category: '动物' },
  { page: 22, title: '我有一个宠物', enTitle: 'I Have A Pet', desc: '认识猫、狗、鱼等宠物', category: '动物' },
  { page: 36, title: '小雪人', enTitle: "I'm A Little Snowman", desc: '堆一个小雪人，学习身体部位', category: '身体' },
  { page: 38, title: '我的泰迪熊', enTitle: 'My Teddy Bear', desc: '介绍我的玩具熊，学习颜色', category: '玩具' },
  { page: 42, title: '你好', enTitle: 'Hello!', desc: '学习用英语打招呼', category: '日常' },
  { page: 52, title: '洗澡歌', enTitle: 'The Bath Song', desc: '洗澡时用到的身体部位', category: '日常' },
  { page: 57, title: '围成一个圈', enTitle: 'Make A Circle', desc: '大家一起围成圆，学习大小概念', category: '动作' },
  { page: 63, title: '收拾歌', enTitle: 'Clean Up Song', desc: '玩完玩具记得收拾干净', category: '日常' },
];

function getTodayIndex(): number {
  return new Date().getDay();
}

function buildEmbedUrl(page: number, autoplay: boolean): string {
  return `${BILI_EMBED}?bvid=${BILI_BVID}&page=${page}&high_quality=1&autoplay=${autoplay ? 1 : 0}&danmaku=0`;
}

export default function DailyVideo() {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [todayIdx, setTodayIdx] = useState(getTodayIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  const current = DAILY_VIDEOS[todayIdx];
  const embedUrl = buildEmbedUrl(current.page, isPlaying);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  const handleSelectDay = (idx: number) => {
    setIsPlaying(false);
    setTodayIdx(idx);
  };

  const handleSelectMore = (video: VideoData) => {
    setIsPlaying(false);
    /* Navigate to the selected video page */
    const pageIdx = DAILY_VIDEOS.findIndex((v) => v.page === video.page);
    if (pageIdx >= 0) {
      setTodayIdx(pageIdx);
    }
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
            Super Simple Songs 经典英文儿歌 400+集
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
            <span className="text-xs text-lavender-mist/40 bg-white/10 px-2 py-0.5 rounded-full font-noto-sc">{current.category}</span>
          </div>
          <button
            onClick={() => handleSelectDay((todayIdx + 1) % 7)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors rotate-180"
          >
            <ArrowLeft size={18} />
          </button>
        </motion.div>

        {/* Bilibili Video Player */}
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
              style={{ border: 'none' }}
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </motion.div>

        {/* Video Info & Controls */}
        <motion.div
          className="mt-4 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-nunito font-bold text-lg text-white">{current.enTitle}</h2>
              <p className="font-noto-sc text-sm text-lavender-mist/60">{current.desc}</p>
            </div>
            <a
              href={`https://www.bilibili.com/video/${BILI_BVID}?p=${current.page}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
              title="在 Bilibili 打开"
            >
              <ExternalLink size={18} className="text-nebula-purple" />
            </a>
          </div>

          {/* Play/Pause controls */}
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

        {/* More Videos */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="font-noto-sc text-sm text-lavender-mist/50 mb-3 text-center">更多经典儿歌</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {MORE_VIDEOS.map((video, i) => (
              <motion.button
                key={i}
                onClick={() => handleSelectMore(video)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.03 }}
              >
                <div className="w-10 h-10 rounded-full bg-nebula-purple/30 flex items-center justify-center flex-shrink-0">
                  <Play size={16} className="text-nebula-purple ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-nunito font-bold text-sm text-white truncate">{video.enTitle}</p>
                  <p className="font-noto-sc text-xs text-lavender-mist/50 truncate">{video.title}</p>
                </div>
                <span className="text-xs text-lavender-mist/30 bg-white/10 px-2 py-0.5 rounded-full font-noto-sc flex-shrink-0">
                  {video.category}
                </span>
                <ChevronRight size={16} className="text-lavender-mist/30 flex-shrink-0" />
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
          视频来自 Bilibili Super Simple Songs 合集（400+集）
        </motion.p>
      </div>
    </div>
  );
}
