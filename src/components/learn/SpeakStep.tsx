import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Mic, Check, Circle } from 'lucide-react';
import type { Word } from '@/types';
import Waveform from './Waveform';

interface SpeakStepProps {
  word: Word;
  isRecording: boolean;
  transcript: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onScore: () => void;
}

const prompts = ['跟我一起读!', '大声读出来!', '你来试试!'];

const SpeakStep = memo(function SpeakStep({
  word,
  isRecording,
  transcript,
  onStartRecording,
  onStopRecording,
  onScore,
}: SpeakStepProps) {
  const [prompt] = useState(() =>
    prompts[Math.floor(Math.random() * prompts.length)]
  );
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);

  // Reset hasRecorded when word changes
  useEffect(() => {
    setHasRecorded(false);
    setRecordingTime(0);
  }, [word.id]);

  // Recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 4) {
            // Auto stop at 5 seconds
            onStopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, onStopRecording]);

  // Handle recording completion
  useEffect(() => {
    if (!isRecording && transcript && transcript.length > 0) {
      setHasRecorded(true);
    }
  }, [isRecording, transcript]);

  const handleMicPress = useCallback(() => {
    if (isRecording) {
      onStopRecording();
    } else if (hasRecorded) {
      onScore();
    } else {
      onStartRecording();
    }
  }, [isRecording, hasRecorded, onStartRecording, onStopRecording, onScore]);

  // Highlight target word in phrase
  const renderPhrase = () => {
    const phrase = word.phrase;
    const target = word.word;
    const regex = new RegExp(`(${target})`, 'gi');
    const parts = phrase.split(regex);

    return (
      <span className="font-nunito font-semibold text-xl sm:text-[28px] leading-relaxed text-[#F8F9FC] opacity-60">
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="text-star-gold opacity-100">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4">
      {/* Prompt */}
      <motion.p
        className="font-noto-sc font-bold text-xl sm:text-[22px] text-nebula-purple mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {prompt}
      </motion.p>

      {/* Phrase prompt area */}
      <motion.div
        className="w-full rounded-2xl p-5 sm:p-6 mb-8 text-center"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {renderPhrase()}
      </motion.div>

      {/* Word reminder */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <span className="font-nunito font-black text-3xl sm:text-4xl text-soft-white">
          {word.word}
        </span>
        <span className="text-dark-gray font-noto-sc text-sm ml-2">
          {word.meaning}
        </span>
      </motion.div>

      {/* Mic Button */}
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.2,
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
        }}
      >
        <motion.button
          onClick={handleMicPress}
          className="relative w-20 h-20 rounded-full flex items-center justify-center cursor-pointer"
          style={{
            background: hasRecorded
              ? 'linear-gradient(135deg, #34D399 0%, #10B981 100%)'
              : isRecording
              ? 'linear-gradient(135deg, #FF6B6B 0%, #EF4444 100%)'
              : 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
            boxShadow: isRecording
              ? '0 0 30px rgba(255, 107, 107, 0.4)'
              : '0 4px 16px rgba(52, 211, 153, 0.3)',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={
            isRecording
              ? { scale: [1, 1.05, 1] }
              : { scale: 1 }
          }
          transition={
            isRecording
              ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
        >
          {/* Recording ripple rings */}
          {isRecording && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '2px solid rgba(255, 107, 107, 0.5)',
                  }}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}

          {/* Icon */}
          <div className="relative z-10">
            {hasRecorded && !isRecording ? (
              <Check size={32} className="text-white" strokeWidth={3} />
            ) : isRecording ? (
              <Circle size={28} className="text-white" strokeWidth={3} />
            ) : (
              <Mic size={32} className="text-white" />
            )}
          </div>
        </motion.button>

        {/* Hint text */}
        <motion.p
          className="font-noto-sc text-sm text-dark-gray text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {isRecording
            ? `正在听... ${5 - recordingTime}秒`
            : hasRecorded
            ? '点击按钮查看评分'
            : '点击麦克风按钮，大声读出单词!'}
        </motion.p>

        {/* Waveform during recording */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            <Waveform isRecording={isRecording} />
          </motion.div>
        )}

        {/* Transcript display */}
        {hasRecorded && transcript && !isRecording && (
          <motion.div
            className="mt-2 p-3 rounded-xl text-center"
            style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-emerald-green font-noto-sc text-xs mb-1">识别到的内容:</p>
            <p className="text-soft-white font-nunito text-base">
              {transcript || '（未识别到语音）'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Check Score Button */}
      {hasRecorded && !isRecording && (
        <motion.button
          onClick={onScore}
          className="mt-8 px-8 py-3.5 rounded-full font-noto-sc font-bold text-base text-white cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
            boxShadow: '0 4px 16px rgba(123, 104, 238, 0.3)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          查看我的评分 →
        </motion.button>
      )}
    </div>
  );
});

export default SpeakStep;
