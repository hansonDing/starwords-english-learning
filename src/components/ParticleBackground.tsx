import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  rotateDuration: number;
}

const ParticleBackground = memo(function ParticleBackground() {
  const particles = useMemo<Particle[]>(() => {
    const count = 10;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 12 + Math.random() * 8,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.15,
      rotateDuration: 20 + Math.random() * 10,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            bottom: `-30px`,
          }}
          animate={{
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight + 100 : 900)],
            rotate: [0, 360],
          }}
          transition={{
            y: {
              duration: p.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: p.delay,
            },
            rotate: {
              duration: p.rotateDuration,
              repeat: Infinity,
              ease: 'linear',
              delay: p.delay,
            },
          }}
        >
          <svg
            width={p.size}
            height={p.size}
            viewBox="0 0 24 24"
            fill="#FFD700"
            style={{ opacity: p.opacity }}
          >
            <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
});

export default ParticleBackground;
