import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, School, Building2, TrafficCone, X } from 'lucide-react';

interface ZoneAlertProps {
  zone: string;
  alert: string | null;
  onDismiss: () => void;
}

const ZoneAlert: React.FC<ZoneAlertProps> = ({ zone, alert, onDismiss }) => {
  if (!alert) return null;

  const getZoneIcon = () => {
    switch (zone) {
      case 'school':
        return <School className="w-6 h-6" />;
      case 'hospital':
        return <Building2 className="w-6 h-6" />;
      case 'traffic':
        return <TrafficCone className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getZoneColor = () => {
    switch (zone) {
      case 'school':
        return 'warning';
      case 'hospital':
        return 'primary';
      case 'traffic':
        return 'emergency';
      default:
        return 'primary';
    }
  };

  const color = getZoneColor();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative flex items-center gap-3 p-4 rounded-xl border-2 ${
          color === 'warning' 
            ? 'border-warning bg-warning/10 warning-glow'
            : color === 'emergency'
            ? 'border-emergency bg-emergency/10 danger-glow'
            : 'border-primary bg-primary/10 neon-glow'
        }`}
      >
        <div className={`p-2 rounded-lg ${
          color === 'warning' ? 'bg-warning/20 text-warning'
            : color === 'emergency' ? 'bg-emergency/20 text-emergency'
            : 'bg-primary/20 text-primary'
        }`}>
          {getZoneIcon()}
        </div>
        <p className={`flex-1 font-medium ${
          color === 'warning' ? 'text-warning'
            : color === 'emergency' ? 'text-emergency'
            : 'text-primary'
        }`}>
          {alert}
        </p>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ZoneAlert;
