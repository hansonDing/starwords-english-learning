import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  startX: number;
  rotation: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
  shape: 'rect' | 'star';
}

const COLORS = ['#FFD700', '#7B68EE', '#34D399', '#38BDF8', '#F472B6', '#FF6B6B'];

const ConfettiEffect = memo(function ConfettiEffect() {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      startX: (Math.random() - 0.5) * 200,
      rotation: Math.random() * 720 - 360,
      duration: 3 + Math.random() * 3,
      delay: Math.random() * 0.8,
      size: 6 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? 'rect' : 'star' as const,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: -20,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 1.5 : p.size,
          }}
          initial={{
            y: 0,
            x: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: typeof window !== 'undefined' ? window.innerHeight + 40 : 900,
            x: p.startX,
            rotate: p.rotation,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
          }}
        >
          {p.shape === 'star' ? (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill={p.color}
            >
              <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
            </svg>
          ) : (
            <div
              style={{
                width: p.size,
                height: p.size * 1.5,
                backgroundColor: p.color,
                borderRadius: 2,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
});

export default ConfettiEffect;
