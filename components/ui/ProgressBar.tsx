import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  max: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, max, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className={`w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800 ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 relative"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.6, ease: "circOut" }}
      >
        <div className="absolute inset-0 bg-white/10" />
      </motion.div>
    </div>
  );
};