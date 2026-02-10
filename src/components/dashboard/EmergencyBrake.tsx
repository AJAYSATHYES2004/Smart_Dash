import React from 'react';
import { motion } from 'framer-motion';
import { OctagonX } from 'lucide-react';

interface EmergencyBrakeProps {
  onActivate: () => void;
  isEmergency: boolean;
}

const EmergencyBrake: React.FC<EmergencyBrakeProps> = ({ onActivate, isEmergency }) => {
  return (
    <motion.button
      onClick={onActivate}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      animate={isEmergency ? { x: [-5, 5, -5, 5, 0] } : {}}
      transition={{ duration: 0.3 }}
      className={`relative w-20 h-20 rounded-full bg-emergency border-4 border-emergency/50 danger-glow flex items-center justify-center ${
        isEmergency ? 'emergency-shake' : ''
      }`}
    >
      <OctagonX className="w-10 h-10 text-white" />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-emergency font-display text-xs font-bold">BRAKE</span>
      </div>
    </motion.button>
  );
};

export default EmergencyBrake;
