import { memo } from 'react';
import { motion } from 'framer-motion';

interface WaveformProps {
  isPlaying?: boolean;
  isRecording?: boolean;
  barCount?: number;
}

const Waveform = memo(function Waveform({
  isPlaying = false,
  isRecording = false,
  barCount = 20,
}: WaveformProps) {
  if (!isPlaying && !isRecording) return null;

  return (
    <div className="flex items-center justify-center gap-[2px] h-10">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{
            background: isRecording
              ? `linear-gradient(to top, #34D399, #7B68EE)`
              : `linear-gradient(to top, #7B68EE, #9B8AF4)`,
          }}
          animate={
            isPlaying || isRecording
              ? {
                  height: [8, 16 + Math.random() * 16, 8],
                }
              : { height: 8 }
          }
          transition={
            isPlaying || isRecording
              ? {
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.03,
                  ease: 'easeInOut',
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  );
});

export default Waveform;
