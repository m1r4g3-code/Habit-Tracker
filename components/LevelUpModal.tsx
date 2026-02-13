import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Button } from './ui/Button';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ isOpen, level, onClose }) => {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        <motion.div
          className="relative w-full max-w-sm text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
        >
          {/* Glowing background effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-primary/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-accent-warning text-lg font-bold uppercase tracking-widest mb-2"
            >
              Level Up!
            </motion.div>
            
            <motion.h1
              className="text-8xl font-black text-white mb-6 drop-shadow-2xl font-mono"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {level}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-300 mb-8 text-lg"
            >
              You're becoming a legend.
              <br />
              Keep building momentum.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button size="lg" onClick={onClose} className="w-full max-w-[200px] shadow-accent-primary/50 shadow-lg">
                Continue
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};