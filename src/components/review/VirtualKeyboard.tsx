import { motion } from 'framer-motion';
import { Delete, Lightbulb } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onHint: () => void;
  disabled?: boolean;
  hintCooldown?: boolean;
}

const rows = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function VirtualKeyboard({
  onKeyPress,
  onBackspace,
  onEnter,
  onHint,
  disabled = false,
  hintCooldown = false,
}: VirtualKeyboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="w-full flex flex-col gap-1.5"
    >
      {/* Letter rows */}
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center">
          {row.map((letter) => (
            <motion.button
              key={letter}
              onClick={() => !disabled && onKeyPress(letter)}
              disabled={disabled}
              className="min-w-[32px] h-[40px] md:min-w-[36px] md:h-[44px] rounded-xl font-nunito text-sm md:text-base font-semibold text-space-navy cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'rgba(123,104,238,0.1)',
                border: '1px solid rgba(123, 104, 238, 0.2)',
                touchAction: 'manipulation',
                minHeight: '44px',
              }}
              whileTap={!disabled ? { scale: 0.9, background: 'rgba(123,104,238,0.25)' } : undefined}
              whileHover={!disabled ? { scale: 1.05, background: 'rgba(123,104,238,0.18)' } : undefined}
              transition={{ duration: 0.1 }}
            >
              {letter}
            </motion.button>
          ))}
        </div>
      ))}

      {/* Special keys row */}
      <div className="flex gap-1.5 justify-center mt-1">
        {/* Hint button */}
        <motion.button
          onClick={() => !disabled && !hintCooldown && onHint()}
          disabled={disabled || hintCooldown}
          className="flex items-center gap-1.5 px-3 h-[44px] rounded-xl font-noto-sc text-sm text-white cursor-pointer disabled:opacity-50"
          style={{
            background: hintCooldown ? '#6B7280' : 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
            minHeight: '44px',
          }}
          whileTap={!disabled && !hintCooldown ? { scale: 0.95 } : undefined}
          whileHover={!disabled && !hintCooldown ? { scale: 1.05 } : undefined}
        >
          <Lightbulb size={16} />
          <span>提示</span>
        </motion.button>

        {/* Backspace */}
        <motion.button
          onClick={() => !disabled && onBackspace()}
          disabled={disabled}
          className="flex items-center justify-center w-[60px] h-[44px] rounded-xl cursor-pointer disabled:opacity-50"
          style={{
            background: 'rgba(255,107,107,0.15)',
            border: '1px solid rgba(255,107,107,0.3)',
            minHeight: '44px',
          }}
          whileTap={!disabled ? { scale: 0.9 } : undefined}
          whileHover={!disabled ? { scale: 1.05 } : undefined}
        >
          <Delete size={18} className="text-coral-red" />
        </motion.button>

        {/* Enter */}
        <motion.button
          onClick={() => !disabled && onEnter()}
          disabled={disabled}
          className="flex items-center justify-center px-5 h-[44px] rounded-xl font-noto-sc text-sm font-medium text-white cursor-pointer disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
            minHeight: '44px',
          }}
          whileTap={!disabled ? { scale: 0.95 } : undefined}
          whileHover={!disabled ? { scale: 1.05 } : undefined}
        >
          提交
        </motion.button>
      </div>
    </motion.div>
  );
}
