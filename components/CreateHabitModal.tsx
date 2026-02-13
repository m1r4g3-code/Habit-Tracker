import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { XP_VALUES } from '../constants';
import { Habit, XPValue } from '../types';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, xp: XPValue, id?: string) => void;
  onDelete?: (id: string) => void;
  editingHabit?: Habit | null;
}

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onDelete,
  editingHabit 
}) => {
  const [name, setName] = useState('');
  const [xp, setXp] = useState<XPValue>(50);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setXp(editingHabit.xpValue);
    } else {
      setName('');
      setXp(50);
    }
  }, [editingHabit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name, xp, editingHabit?.id);
      onClose();
    }
  };

  const handleDelete = () => {
    if (editingHabit && onDelete) {
      if (confirm('Are you sure? This cannot be undone.')) {
        onDelete(editingHabit.id);
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingHabit ? 'Edit Habit' : 'Create New Habit'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-400">Habit Name</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning Meditation"
            maxLength={50}
            className="w-full bg-bg-base border border-neutral-800 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-400">XP Value</label>
          <div className="grid grid-cols-5 gap-2">
            {XP_VALUES.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setXp(val)}
                className={`
                  h-10 rounded-md text-sm font-medium transition-all
                  ${xp === val 
                    ? 'bg-neutral-200 text-black shadow-lg' 
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                  }
                `}
              >
                {val}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 pt-1">
            Higher XP for harder habits. Be honest!
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          {editingHabit && (
            <Button type="button" variant="danger" onClick={handleDelete} className="mr-auto">
              Delete
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {editingHabit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};