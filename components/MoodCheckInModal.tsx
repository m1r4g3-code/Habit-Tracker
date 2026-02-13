import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Mood } from '../types';

interface MoodCheckInModalProps {
  isOpen: boolean;
  onSubmit: (mood: Mood) => void;
}

const MOOD_OPTIONS: { id: Mood; label: string; icon: string; colorClass: string }[] = [
  { id: 'focused', label: 'Focused', icon: '🎯', colorClass: 'hover:border-emerald-500 hover:bg-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
  { id: 'good', label: 'Good', icon: '🙂', colorClass: 'hover:border-blue-500 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
  { id: 'neutral', label: 'Neutral', icon: '😐', colorClass: 'hover:border-neutral-400 hover:bg-neutral-500/10' },
  { id: 'frustrated', label: 'Frustrated', icon: '😤', colorClass: 'hover:border-orange-500 hover:bg-orange-500/10 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
  { id: 'low_energy', label: 'Low Energy', icon: '🔋', colorClass: 'hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]' },
];

export const MoodCheckInModal: React.FC<MoodCheckInModalProps> = ({ isOpen, onSubmit }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          <motion.div
            className="relative w-full max-w-sm bg-bg-elevated border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-8"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">Daily Check-In</h2>
              <p className="text-neutral-400 text-sm">How are you feeling right now?</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {MOOD_OPTIONS.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSubmit(option.id)}
                  className={`
                    group flex items-center gap-4 w-full p-4 rounded-xl border border-neutral-800 bg-bg-base/50 
                    transition-all duration-200 text-left relative overflow-hidden
                    ${option.colorClass}
                    active:scale-[0.98]
                  `}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{option.icon}</span>
                  <span className="font-medium text-neutral-200 group-hover:text-white transition-colors">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};