import React from 'react';
import { motion } from 'framer-motion';
import { Power } from 'lucide-react';

interface EngineToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

const EngineToggle: React.FC<EngineToggleProps> = ({ isOn, onToggle }) => {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative w-24 h-24 rounded-full border-4 transition-all duration-500 ${
        isOn
          ? 'border-success bg-success/20 success-glow'
          : 'border-muted-foreground bg-secondary'
      }`}
    >
      <motion.div
        animate={{ rotate: isOn ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center h-full"
      >
        <Power 
          className={`w-10 h-10 transition-colors duration-300 ${
            isOn ? 'text-success' : 'text-muted-foreground'
          }`} 
        />
      </motion.div>
      
      {isOn && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <span className="text-success font-display text-xs font-semibold">ENGINE ON</span>
        </motion.div>
      )}
      
      {!isOn && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-muted-foreground font-display text-xs">ENGINE OFF</span>
        </div>
      )}
    </motion.button>
  );
};

export default EngineToggle;
