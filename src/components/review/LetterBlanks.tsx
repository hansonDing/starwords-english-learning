import { motion } from 'framer-motion';

interface LetterBlank {
  letter: string;
  status: 'empty' | 'filled' | 'correct' | 'incorrect';
}

interface LetterBlanksProps {
  blanks: LetterBlank[];
}

export default function LetterBlanks({ blanks }: LetterBlanksProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {blanks.map((blank, index) => (
        <motion.div
          key={index}
          className="flex items-center justify-center rounded-xl font-nunito text-2xl font-bold"
          style={{
            width: 44,
            height: 52,
            ...getBlankStyle(blank.status),
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: index * 0.05,
            duration: 0.2,
            ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
          }}
        >
          {blank.letter && (
            <motion.span
              key={`${index}-${blank.letter}`}
              initial={{ scale: 0, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{
                duration: 0.2,
                ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
              }}
            >
              {blank.letter}
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

function getBlankStyle(status: LetterBlank['status']): React.CSSProperties {
  switch (status) {
    case 'empty':
      return {
        background: '#E5E7EB',
        border: '2px solid transparent',
        color: '#0B1D3A',
      };
    case 'filled':
      return {
        background: '#F8F9FC',
        border: '2px solid #7B68EE',
        color: '#0B1D3A',
        boxShadow: '0 0 10px rgba(123, 104, 238, 0.2)',
      };
    case 'correct':
      return {
        background: 'rgba(52, 211, 153, 0.2)',
        border: '2px solid #34D399',
        color: '#34D399',
      };
    case 'incorrect':
      return {
        background: 'rgba(255, 107, 107, 0.2)',
        border: '2px solid #FF6B6B',
        color: '#FF6B6B',
      };
    default:
      return {};
  }
}
