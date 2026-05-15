import { motion } from 'framer-motion';
import { Eye, Mic, Star, Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 1, 2, or 3
}

const steps = [
  { id: 1, label: '聆听', icon: Eye },
  { id: 2, label: '跟读', icon: Mic },
  { id: 3, label: '评分', icon: Star },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isCompleted
                    ? '#34D399'
                    : isCurrent
                    ? '#7B68EE'
                    : 'rgba(107, 114, 128, 0.3)',
                }}
                animate={
                  isCurrent
                    ? {
                        scale: [1, 1.3, 1],
                      }
                    : { scale: 1 }
                }
                transition={
                  isCurrent
                    ? {
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1] as [
                          number,
                          number,
                          number,
                          number,
                        ],
                      }
                    : { duration: 0.2 }
                }
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check size={16} className="text-white" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <Icon
                    size={16}
                    className={isCurrent ? 'text-white' : 'text-dark-gray'}
                  />
                )}
              </motion.div>
              <span
                className="text-[10px] sm:text-xs font-noto-sc font-medium"
                style={{
                  color: isCompleted
                    ? '#34D399'
                    : isCurrent
                    ? '#7B68EE'
                    : 'rgba(107, 114, 128, 0.5)',
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <motion.div
                className="w-8 sm:w-10 h-0.5 rounded-full -mt-4"
                style={{
                  backgroundColor: isCompleted ? '#34D399' : '#6B7280',
                  opacity: isCompleted ? 1 : 0.3,
                }}
                animate={{
                  backgroundColor: isCompleted ? '#34D399' : '#6B7280',
                }}
                transition={{ duration: 0.4 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
