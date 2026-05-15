import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  delay?: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#34D399';
  if (score >= 70) return '#FFD700';
  if (score >= 50) return '#38BDF8';
  return '#FF6B6B';
}

export default function ScoreRing({
  score,
  size = 180,
  strokeWidth = 8,
  delay = 0,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;

  const color = getScoreColor(score);

  // Animate score counting
  useEffect(() => {
    const duration = 600;
    const startTime = performance.now();
    const startDelay = delay * 1000;

    const timeout = setTimeout(() => {
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime - startDelay;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayScore(Math.round(eased * score));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [score, delay]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 60px ${color}40`,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.4 }}
      />

      {/* Background ring */}
      <svg
        width={size}
        height={size}
        className="absolute transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(107, 114, 128, 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        />
      </svg>

      {/* Score number */}
      <div className="relative flex flex-col items-center">
        <motion.span
          className="font-nunito font-black leading-none"
          style={{
            fontSize: size * 0.4,
            color,
          }}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: delay + 0.1,
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
          }}
        >
          {displayScore}
        </motion.span>
      </div>
    </div>
  );
}
