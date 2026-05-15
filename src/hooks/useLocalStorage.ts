import { useState, useCallback, useEffect } from 'react';
import type { LearningProgress, WordProgress } from '@/types';

const STORAGE_KEY = 'starwords-progress';

export const DEFAULT_PROGRESS: LearningProgress = {
  currentWeek: 1,
  words: [],
  streakDays: 0,
  lastLearnedDate: null,
  achievements: [],
  settings: {
    voiceSpeed: 0.8,
    difficulty: 'easy',
  },
};

function loadProgress(): LearningProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as LearningProgress;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      settings: { ...DEFAULT_PROGRESS.settings, ...parsed.settings },
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

function saveProgress(progress: LearningProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // silently fail
  }
}

export function useLocalStorage() {
  const [progress, setProgressState] = useState<LearningProgress>(loadProgress);

  // Persist whenever progress changes
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const setProgress = useCallback((updater: LearningProgress | ((prev: LearningProgress) => LearningProgress)) => {
    setProgressState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return { ...next };
    });
  }, []);

  const markWordLearned = useCallback(
    (wordId: string, score: number) => {
      setProgressState((prev) => {
        const existingIndex = prev.words.findIndex((w) => w.wordId === wordId);
        const now = new Date().toISOString();
        let newWords: WordProgress[];

        if (existingIndex >= 0) {
          newWords = prev.words.map((w, i) =>
            i === existingIndex
              ? { ...w, learned: true, score: Math.max(w.score, score), attempts: w.attempts + 1, lastAttemptAt: now }
              : w
          );
        } else {
          const newEntry: WordProgress = {
            wordId,
            learned: true,
            score,
            attempts: 1,
            lastAttemptAt: now,
          };
          newWords = [...prev.words, newEntry];
        }

        // Update streak
        const today = now.split('T')[0];
        const lastDate = prev.lastLearnedDate;
        let newStreak = prev.streakDays;
        if (!lastDate) {
          newStreak = 1;
        } else {
          const last = new Date(lastDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            newStreak = prev.streakDays + 1;
          } else if (diffDays === 0) {
            newStreak = prev.streakDays;
          } else {
            newStreak = 1;
          }
        }

        return {
          ...prev,
          words: newWords,
          streakDays: newStreak,
          lastLearnedDate: today,
        };
      });
    },
    []
  );

  const resetProgress = useCallback(() => {
    setProgressState({ ...DEFAULT_PROGRESS });
  }, []);

  const updateSettings = useCallback(
    (settings: Partial<LearningProgress['settings']>) => {
      setProgressState((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...settings },
      }));
    },
    []
  );

  const getWordProgress = useCallback(
    (wordId: string): WordProgress | undefined => {
      return progress.words.find((w) => w.wordId === wordId);
    },
    [progress.words]
  );

  return {
    progress,
    setProgress,
    markWordLearned,
    resetProgress,
    updateSettings,
    getWordProgress,
  };
}
