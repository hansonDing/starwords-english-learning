import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Mic, Star } from 'lucide-react';
import type { Word } from '@/types';

interface ReviewCardProps {
  word: Word;
  score: number;
  isFlipped: boolean;
  onFlip: () => void;
  onPlay: () => void;
}

function StarRating({ score }: { score: number }) {
  const stars = Math.ceil(score / 20);
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={18}
          className={i <= stars ? 'text-star-gold fill-star-gold' : 'text-light-gray'}
        />
      ))}
    </div>
  );
}

export default function ReviewCard({ word, score, isFlipped, onFlip, onPlay }: ReviewCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    onPlay();
    setTimeout(() => setIsPlaying(false), 2000);
  };

  const scoreColor = score >= 90 ? 'text-emerald-green' : score >= 70 ? 'text-star-gold' : 'text-coral-red';

  return (
    <div className="perspective-[1000px] w-full cursor-pointer" onClick={onFlip}>
      <motion.div
        className="relative w-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front side */}
        <div
          className="w-full rounded-[24px] p-6 md:p-8"
          style={{
            background: '#F8F9FC',
            boxShadow: '0 4px 16px rgba(123, 104, 238, 0.2)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Word Image */}
          <div className="flex justify-center mb-3">
            <img
              src={word.imageUrl}
              alt={word.word}
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-md"
            />
          </div>

          {/* Word Display */}
          <div className="text-center mb-6">
            <h2 className="font-nunito font-black text-[40px] text-space-navy leading-tight">
              {word.word}
            </h2>
            <p className="font-nunito text-base text-nebula-purple mt-1">
              {word.phonetic}
            </p>
            <p className="font-noto-sc text-lg text-[#374151] mt-2">
              {word.meaning}
            </p>
          </div>

          {/* Phrase Section */}
          <div
            className="rounded-xl p-4 mb-6 text-center"
            style={{ background: 'rgba(123,104,238,0.08)' }}
          >
            <p className="font-nunito text-lg font-semibold text-space-navy">
              <span className="text-nebula-purple font-black">{word.word}</span>
              {word.phrase.substring(word.word.length)}
            </p>
            <p className="font-noto-sc text-sm text-dark-gray mt-2">
              {word.phraseMeaning}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              className="w-12 h-12 rounded-full gradient-button flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              style={{ boxShadow: '0 4px 16px rgba(123, 104, 238, 0.3)' }}
            >
              {isPlaying ? (
                <div className="flex items-end gap-[3px] h-4">
                  <motion.div
                    className="w-[3px] bg-white rounded-full"
                    animate={{ height: [4, 16, 8, 14, 4] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-[3px] bg-white rounded-full"
                    animate={{ height: [10, 4, 14, 6, 10] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-[3px] bg-white rounded-full"
                    animate={{ height: [6, 14, 4, 12, 6] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                </div>
              ) : (
                <Play size={20} className="text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                boxShadow: '0 4px 16px rgba(52, 211, 153, 0.3)',
              }}
            >
              <Mic size={20} className="text-white" />
            </button>
          </div>

          {/* Score Display */}
          <div className="text-center">
            <span className={`font-nunito text-2xl font-bold ${scoreColor}`}>
              {score}分
            </span>
            <div className="mt-2">
              <StarRating score={score} />
            </div>
          </div>
        </div>

        {/* Back side - flipped */}
        <div
          className="absolute inset-0 w-full h-full rounded-[24px] p-6 flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7B68EE 0%, #6B5CD6 100%)',
            boxShadow: '0 4px 16px rgba(123, 104, 238, 0.3)',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Star size={48} className="text-star-gold fill-star-gold mb-4" />
          <h3 className="font-nunito font-black text-3xl text-white mb-2">
            {word.word}
          </h3>
          <p className="font-noto-sc text-lg text-white/80 mb-6">
            {word.meaning}
          </p>
          <p className="font-noto-sc text-sm text-white/60 text-center">
            点击卡片翻回正面
          </p>
        </div>
      </motion.div>
    </div>
  );
}
