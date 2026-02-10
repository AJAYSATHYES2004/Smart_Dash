import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, School, Building2, TrafficCone, CheckCircle, Volume2 } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import ZoneAlert from '@/components/dashboard/ZoneAlert';

const ZoneControl = () => {
  const { 
    currentZone, 
    setCurrentZone, 
    zoneConfig, 
    zoneAlert, 
    speed,
    volume,
    setVolume
  } = useDashboard();

  const zones = [
    { value: 'normal', label: 'Normal Zone', icon: CheckCircle, description: 'No restrictions' },
    { value: 'school', label: 'School Zone', icon: School, description: 'Max 30 km/h' },
    { value: 'hospital', label: 'Hospital Zone', icon: Building2, description: 'Max 30 km/h, Volume 40%' },
    { value: 'traffic', label: 'Traffic Zone', icon: TrafficCone, description: 'Diversion advisory' },
  ];

  return (
    <div className="min-h-screen space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">Zone Control</h1>
        <p className="text-muted-foreground text-sm mt-1">Automatic speed & volume enforcement</p>
      </motion.div>

      {/* Current Zone Alert */}
      {zoneAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ZoneAlert 
            zone={currentZone} 
            alert={zoneAlert} 
            onDismiss={() => {}} 
          />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="dashboard-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-display font-semibold text-foreground">Select Zone</h2>
          </div>

          <Select value={currentZone} onValueChange={(value: any) => setCurrentZone(value)}>
            <SelectTrigger className="w-full bg-secondary border-border">
              <SelectValue placeholder="Select a zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone.value} value={zone.value}>
                  <div className="flex items-center gap-2">
                    <zone.icon className="w-4 h-4" />
                    <span>{zone.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Zone Cards */}
          <div className="mt-6 space-y-3">
            {zones.map((zone) => {
              const isActive = currentZone === zone.value;
              return (
                <motion.button
                  key={zone.value}
                  onClick={() => setCurrentZone(zone.value as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    isActive 
                      ? 'border-primary bg-primary/10 neon-glow' 
                      : 'border-border bg-secondary hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <zone.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {zone.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">{zone.description}</p>
                    </div>
                    {isActive && (
                      <CheckCircle className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Current Restrictions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Speed Status */}
          <div className="dashboard-card p-6">
            <h3 className="text-sm font-display text-muted-foreground mb-4">CURRENT SPEED STATUS</h3>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-4xl font-display font-bold text-foreground">{speed}</span>
                <span className="text-lg text-muted-foreground ml-1">km/h</span>
              </div>
              <div className="text-right">
                {zoneConfig.maxSpeed ? (
                  <>
                    <p className="text-sm text-muted-foreground">Speed Limit</p>
                    <p className={`text-2xl font-display font-bold ${
                      speed > zoneConfig.maxSpeed ? 'text-emergency' : 'text-warning'
                    }`}>
                      {zoneConfig.maxSpeed} km/h
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-display font-semibold text-success">No Limit</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Volume Control */}
          <div className="dashboard-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-display text-muted-foreground">VOLUME CONTROL</h3>
            </div>
            <div className="space-y-4">
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={zoneConfig.maxVolume || 100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Volume: {volume}%</span>
                {zoneConfig.maxVolume && (
                  <span className="text-warning">Max: {zoneConfig.maxVolume}%</span>
                )}
              </div>
            </div>
          </div>

          {/* Zone Info */}
          <div className="dashboard-card p-6">
            <h3 className="text-sm font-display text-muted-foreground mb-4">ZONE INFORMATION</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Zone</span>
                <span className="font-medium text-foreground">{zoneConfig.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Speed Restriction</span>
                <span className={`font-medium ${zoneConfig.maxSpeed ? 'text-warning' : 'text-success'}`}>
                  {zoneConfig.maxSpeed ? `${zoneConfig.maxSpeed} km/h` : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volume Restriction</span>
                <span className={`font-medium ${zoneConfig.maxVolume ? 'text-warning' : 'text-success'}`}>
                  {zoneConfig.maxVolume ? `${zoneConfig.maxVolume}%` : 'None'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ZoneControl;
