import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyAlertProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ isOpen, onDismiss }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm mx-4 p-6 rounded-2xl bg-card border-2 border-emergency danger-glow"
          >
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emergency/20 border-2 border-emergency mb-4"
              >
                <AlertTriangle className="w-10 h-10 text-emergency" />
              </motion.div>
              
              <h2 className="text-2xl font-display font-bold text-emergency mb-2">
                Emergency Brake Activated
              </h2>
              <p className="text-muted-foreground mb-6">
                Vehicle has been stopped immediately for safety.
              </p>
              
              <Button
                onClick={onDismiss}
                className="w-full bg-emergency text-white hover:bg-emergency/90 font-display font-semibold"
              >
                Acknowledge
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyAlert;
