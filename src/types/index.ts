export interface Word {
  id: string;
  word: string;
  phonetic: string;
  meaning: string;
  phrase: string;
  phraseMeaning: string;
  difficulty: number;
  week: number;
  audioUrl: string;
  imageUrl: string;
}

export interface WordProgress {
  wordId: string;
  learned: boolean;
  score: number;
  attempts: number;
  lastAttemptAt: string | null;
}

export interface LearningProgress {
  currentWeek: number;
  words: WordProgress[];
  streakDays: number;
  lastLearnedDate: string | null;
  achievements: string[];
  settings: {
    voiceSpeed: number;
    difficulty: 'easy' | 'normal' | 'hard';
  };
}

export interface ScoreResult {
  score: number;
  feedback: string;
  details: {
    accuracy: number;
    fluency: number;
    completeness: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (progress: LearningProgress) => boolean;
}

export type SpeechState = 'idle' | 'playing' | 'recording' | 'scoring';

export interface SpeechHook {
  state: SpeechState;
  speak: (audioUrl: string) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  transcript: string;
  confidence: number;
  isSupported: boolean;
  error: string | null;
}
