import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  CloudRain, 
  Volume2 
} from 'lucide-react';

interface VehicleControlsProps {
  leftIndicator: boolean;
  rightIndicator: boolean;
  headlights: boolean;
  wipers: boolean;
  onLeftIndicator: () => void;
  onRightIndicator: () => void;
  onHeadlights: () => void;
  onWipers: () => void;
  onHonk: () => void;
  isHonking: boolean;
}

const VehicleControls: React.FC<VehicleControlsProps> = ({
  leftIndicator,
  rightIndicator,
  headlights,
  wipers,
  onLeftIndicator,
  onRightIndicator,
  onHeadlights,
  onWipers,
  onHonk,
  isHonking,
}) => {
  const ControlButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    activeColor?: 'warning' | 'primary' | 'success';
    blink?: boolean;
  }> = ({ active, onClick, icon, label, activeColor = 'primary', blink }) => {
    const colorClasses = {
      warning: 'border-warning bg-warning/20 warning-glow',
      primary: 'border-primary bg-primary/20 neon-glow',
      success: 'border-success bg-success/20 success-glow',
    };

    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`control-btn w-14 h-14 ${
          active 
            ? `${colorClasses[activeColor]} ${blink ? 'indicator-blink' : ''}`
            : 'border-border bg-secondary hover:border-muted-foreground'
        }`}
      >
        <div className={active ? `text-${activeColor}` : 'text-muted-foreground'}>
          {icon}
        </div>
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      </motion.button>
    );
  };

  return (
    <div className="dashboard-card p-4">
      <h3 className="text-sm font-display text-muted-foreground mb-4 text-center">VEHICLE CONTROLS</h3>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <ControlButton
          active={leftIndicator}
          onClick={onLeftIndicator}
          icon={<ChevronLeft className="w-6 h-6" />}
          label="Left"
          activeColor="warning"
          blink={leftIndicator}
        />
        
        <ControlButton
          active={rightIndicator}
          onClick={onRightIndicator}
          icon={<ChevronRight className="w-6 h-6" />}
          label="Right"
          activeColor="warning"
          blink={rightIndicator}
        />
        
        <ControlButton
          active={headlights}
          onClick={onHeadlights}
          icon={<Sun className="w-6 h-6" />}
          label="Lights"
          activeColor="primary"
        />
        
        <ControlButton
          active={wipers}
          onClick={onWipers}
          icon={<CloudRain className="w-6 h-6" />}
          label="Wipers"
          activeColor="primary"
        />
        
        <motion.button
          onMouseDown={onHonk}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          className={`control-btn w-14 h-14 ${
            isHonking 
              ? 'border-warning bg-warning/30 warning-glow'
              : 'border-border bg-secondary hover:border-muted-foreground'
          }`}
        >
          <Volume2 className={`w-6 h-6 ${isHonking ? 'text-warning' : 'text-muted-foreground'}`} />
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
            Horn
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default VehicleControls;
