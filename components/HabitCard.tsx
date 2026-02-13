import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: (id: string) => void;
  onEdit: (habit: Habit) => void;
  disabled?: boolean;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompleted, onComplete, onEdit, disabled }) => {
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!isCompleted) {
      onEdit(habit);
    }
  }, [habit, isCompleted, onEdit]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={!isCompleted && !disabled ? { scale: 0.98 } : {}}
      className={`
        relative group p-5 rounded-xl border transition-all duration-300
        ${isCompleted 
          ? 'bg-emerald-900/10 border-emerald-900/30 shadow-none' 
          : 'bg-bg-elevated border-neutral-800 shadow-lg hover:border-neutral-700 hover:translate-y-[-2px] hover:shadow-xl cursor-pointer'
        }
      `}
      onClick={() => !isCompleted && !disabled && onComplete(habit.id)}
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300
            ${isCompleted 
              ? 'bg-accent-primary border-accent-primary' 
              : 'border-neutral-600 group-hover:border-accent-primary'
            }
          `}>
            {isCompleted && (
              <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <h4 className={`text-lg font-medium transition-colors ${isCompleted ? 'text-neutral-500 line-through' : 'text-white'}`}>
              {habit.name}
            </h4>
          </div>
        </div>
        
        <div className={`
          px-2.5 py-1 rounded-md text-xs font-medium font-mono transition-colors
          ${isCompleted ? 'text-emerald-500 bg-emerald-500/10' : 'text-neutral-500 bg-neutral-900'}
        `}>
          +{habit.xpValue} XP
        </div>
      </div>
      
      {/* Floating XP Animation Placeholder - would be handled by parent or a portal ideally */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute right-6 top-2 text-emerald-400 font-bold text-sm pointer-events-none"
        >
          +{habit.xpValue} XP
        </motion.div>
      )}
    </motion.div>
  );
};