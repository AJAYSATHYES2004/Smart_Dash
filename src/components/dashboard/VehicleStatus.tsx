import React from 'react';
import { motion } from 'framer-motion';
import { Fuel, Droplets, Gauge, Thermometer } from 'lucide-react';

interface VehicleStatusProps {
  petrolLevel: number;
  oilLevel: number;
  totalKm: number;
  engineTemp: number;
}

const VehicleStatus: React.FC<VehicleStatusProps> = ({
  petrolLevel,
  oilLevel,
  totalKm,
  engineTemp,
}) => {
  const StatusGauge: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    unit: string;
    maxValue?: number;
    warningThreshold?: number;
    dangerThreshold?: number;
    isTemperature?: boolean;
  }> = ({ 
    icon, 
    label, 
    value, 
    unit, 
    maxValue = 100, 
    warningThreshold, 
    dangerThreshold,
    isTemperature 
  }) => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    
    let status: 'normal' | 'warning' | 'danger' = 'normal';
    if (isTemperature) {
      if (dangerThreshold && value >= dangerThreshold) status = 'danger';
      else if (warningThreshold && value >= warningThreshold) status = 'warning';
    } else {
      if (dangerThreshold && value <= dangerThreshold) status = 'danger';
      else if (warningThreshold && value <= warningThreshold) status = 'warning';
    }

    const colorClasses = {
      normal: {
        bar: 'bg-primary',
        text: 'text-primary',
        glow: 'neon-glow',
      },
      warning: {
        bar: 'bg-warning',
        text: 'text-warning',
        glow: 'warning-glow',
      },
      danger: {
        bar: 'bg-emergency',
        text: 'text-emergency',
        glow: 'danger-glow',
      },
    };

    return (
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-secondary ${colorClasses[status].text}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={`text-sm font-display font-semibold ${colorClasses[status].text}`}>
              {value}{unit}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${colorClasses[status].bar}`}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-card p-4 space-y-4">
      <h3 className="text-sm font-display text-muted-foreground text-center">VEHICLE STATUS</h3>
      
      <StatusGauge
        icon={<Fuel className="w-5 h-5" />}
        label="Fuel Level"
        value={petrolLevel}
        unit="%"
        warningThreshold={25}
        dangerThreshold={10}
      />
      
      <StatusGauge
        icon={<Droplets className="w-5 h-5" />}
        label="Oil Level"
        value={oilLevel}
        unit="%"
        warningThreshold={30}
        dangerThreshold={15}
      />
      
      <StatusGauge
        icon={<Thermometer className="w-5 h-5" />}
        label="Engine Temp"
        value={engineTemp}
        unit="°C"
        maxValue={120}
        warningThreshold={100}
        dangerThreshold={110}
        isTemperature
      />
      
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <div className="p-2 rounded-lg bg-secondary text-primary">
          <Gauge className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <span className="text-xs text-muted-foreground">Odometer</span>
          <div className="font-display font-bold text-lg text-foreground">
            {totalKm.toLocaleString()} <span className="text-xs text-muted-foreground">km</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleStatus;
