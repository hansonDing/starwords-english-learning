import { useMemo } from 'react';
import { motion } from 'framer-motion';
import ProgressRing from '@/components/progress/ProgressRing';
import StarMap from '@/components/progress/StarMap';
import AchievementWall from '@/components/progress/AchievementWall';
import WeeklyChart from '@/components/progress/WeeklyChart';
import HistoryAccordion from '@/components/progress/HistoryAccordion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSpeech } from '@/hooks/useSpeech';
import { VOCABULARY_DATA } from '@/data/wordData';
// WordProgress type used implicitly via progress state

export default function Progress() {
  const { progress } = useLocalStorage();
  const { speak } = useSpeech();

  const currentWeekWords = useMemo(
    () => VOCABULARY_DATA.filter((w) => w.week === progress.currentWeek),
    [progress.currentWeek]
  );

  const wordProgressInfo = useMemo(
    () =>
      currentWeekWords.map((w) => {
        const wp = progress.words.find((p) => p.wordId === w.id);
        return {
          wordId: w.id,
          learned: wp?.learned ?? false,
          score: wp?.score ?? 0,
        };
      }),
    [currentWeekWords, progress.words]
  );

  const learnedCount = wordProgressInfo.filter((w) => w.learned).length;
  const averageScore = useMemo(() => {
    const learned = wordProgressInfo.filter((w) => w.learned);
    if (learned.length === 0) return 0;
    return Math.round(learned.reduce((sum, w) => sum + w.score, 0) / learned.length);
  }, [wordProgressInfo]);

  // Build week history from all weeks
  const weekHistory = useMemo(() => {
    const allWeeks = Array.from(new Set(VOCABULARY_DATA.map((w) => w.week))).sort();
    return allWeeks.map((week) => {
      const weekWords = VOCABULARY_DATA.filter((w) => w.week === week);
      const wordEntries = weekWords.map((w) => {
        const wp = progress.words.find((p) => p.wordId === w.id);
        return {
          wordId: w.id,
          word: w.word,
          meaning: w.meaning,
          score: wp?.score ?? 0,
          date: wp?.lastAttemptAt?.split('T')[0] ?? '',
          audioUrl: w.audioUrl,
        };
      });
      const learned = wordEntries.filter((w) => w.score > 0);
      const avgScore = learned.length > 0
        ? learned.reduce((s, w) => s + w.score, 0) / learned.length
        : 0;

      return {
        week,
        words: wordEntries,
        averageScore: avgScore,
      };
    });
  }, [progress.words]);

  // Generate mock daily activity (7 days)
  const dailyActivity = useMemo(() => {
    const days: number[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(Math.floor(Math.random() * 5));
    }
    days[6] = learnedCount; // Today = actual
    return days;
  }, [learnedCount]);

  const totalLearned = progress.words.filter((w) => w.learned).length;
  const totalDays = progress.lastLearnedDate ? 1 : 0; // Simplified
  const bestScore = useMemo(() => {
    const scores = progress.words.filter((w) => w.learned).map((w) => w.score);
    return scores.length > 0 ? Math.max(...scores) : 0;
  }, [progress.words]);

  const handlePlayWord = (audioUrl: string) => {
    speak(audioUrl);
  };

  return (
    <motion.div
      className="w-full max-w-[480px] mx-auto px-4 pb-8 flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="pt-4"
      >
        <h1 className="font-nunito font-black text-2xl md:text-3xl text-soft-white">
          学习进度
        </h1>
        <p className="font-noto-sc text-sm text-dark-gray mt-1">
          追踪你的星际学习之旅
        </p>
      </motion.div>

      {/* Section 1: Overview Card */}
      <ProgressRing
        learned={learnedCount}
        total={5}
        streakDays={progress.streakDays}
        averageScore={averageScore}
      />

      {/* Section 2: Star Vocabulary Map */}
      <StarMap
        words={currentWeekWords}
        wordProgress={wordProgressInfo}
      />

      {/* Section 3: Achievement Badges Wall */}
      <AchievementWall progress={progress} />

      {/* Section 4: Weekly Stats Chart */}
      <WeeklyChart
        dailyActivity={dailyActivity}
        totalWords={totalLearned}
        totalDays={totalDays}
        bestScore={bestScore}
      />

      {/* Section 5: Learning History Accordion */}
      <HistoryAccordion
        weekHistory={weekHistory}
        onPlayWord={handlePlayWord}
      />
    </motion.div>
  );
}
