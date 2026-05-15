import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WeeklyChartProps {
  dailyActivity: number[];
  totalWords: number;
  totalDays: number;
  bestScore: number;
}

interface DayData {
  date: string;
  words: number;
  isToday: boolean;
}

function generateLast7Days(activity: number[]): DayData[] {
  const days: DayData[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dateStr = `${month}/${day}`;
    const isToday = i === 0;

    // Use provided activity data or cycle through it
    const words = activity.length > 0 ? activity[(activity.length - 1 - i + activity.length) % activity.length] : 0;

    days.push({ date: dateStr, words: words || 0, isToday });
  }

  return days;
}

function AnimatedNumber({ value, color }: { value: number; color: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) requestAnimationFrame(animate);
    }

    const timer = setTimeout(() => requestAnimationFrame(animate), 600);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>
      {display}
    </span>
  );
}

export default function WeeklyChart({ dailyActivity, totalWords, totalDays, bestScore }: WeeklyChartProps) {
  const days = generateLast7Days(dailyActivity);
  const maxWords = Math.max(...days.map((d) => d.words), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full"
    >
      <h2 className="font-noto-sc text-xl md:text-2xl font-bold text-soft-white mb-4">
        学习统计
      </h2>

      <div
        className="w-full rounded-[24px] p-5 md:p-6"
        style={{
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Bar Chart */}
        <div className="flex items-end justify-between gap-2 md:gap-3 h-[150px] mb-4">
          {days.map((day, index) => {
            const heightPercent = day.words > 0 ? (day.words / maxWords) * 100 : 8;

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center justify-end gap-1"
                style={{ height: `${heightPercent}%` }}
              >
                {/* Word count label */}
                {day.words > 0 && (
                  <motion.span
                    className="font-nunito text-xs font-semibold text-soft-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 + index * 0.08, duration: 0.2 }}
                  >
                    {day.words}
                  </motion.span>
                )}

                {/* Bar */}
                <div className="w-full flex justify-center" style={{ height: '120px', alignItems: 'flex-end' }}>
                  <motion.div
                    className="w-full max-w-[40px] rounded-t-md"
                    style={{
                      background: day.isToday
                        ? 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)'
                        : day.words > 0
                        ? 'linear-gradient(180deg, #7B68EE 0%, #6B5CD6 100%)'
                        : '#374151',
                      opacity: day.words > 0 ? 1 : 0.4,
                      transformOrigin: 'bottom',
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{
                      delay: 0.8 + index * 0.08,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    }}
                  />
                </div>

                {/* Date label */}
                <span className={`font-nunito text-[10px] md:text-xs ${
                  day.isToday ? 'text-star-gold font-bold' : 'text-dark-gray'
                }`}>
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stat Numbers */}
        <div className="flex justify-around pt-4 border-t border-[rgba(123,104,238,0.15)]">
          <div className="text-center">
            <span className="font-nunito font-black text-2xl md:text-[32px] block">
              <AnimatedNumber value={totalWords} color="#7B68EE" />
            </span>
            <span className="font-noto-sc text-xs text-dark-gray mt-1 block">累计学习单词</span>
          </div>
          <div className="text-center">
            <span className="font-nunito font-black text-2xl md:text-[32px] block">
              <AnimatedNumber value={totalDays} color="#34D399" />
            </span>
            <span className="font-noto-sc text-xs text-dark-gray mt-1 block">累计学习天数</span>
          </div>
          <div className="text-center">
            <span className="font-nunito font-black text-2xl md:text-[32px] block">
              <AnimatedNumber value={bestScore} color="#FFD700" />
            </span>
            <span className="font-noto-sc text-xs text-dark-gray mt-1 block">历史最高分</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
