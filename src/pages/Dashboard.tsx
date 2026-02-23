import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import Speedometer from '@/components/dashboard/Speedometer';
import EngineToggle from '@/components/dashboard/EngineToggle';
import EmergencyBrake from '@/components/dashboard/EmergencyBrake';
import VehicleControls from '@/components/dashboard/VehicleControls';
import VehicleStatus from '@/components/dashboard/VehicleStatus';
import EmergencyAlert from '@/components/dashboard/EmergencyAlert';
import ZoneAlert from '@/components/dashboard/ZoneAlert';
import InsuranceWidget from '@/components/dashboard/InsuranceWidget';
import FineWidget from '@/components/dashboard/FineWidget';
import StatusLights from '@/components/dashboard/StatusLights';
import DrowsinessDetector from '@/components/drowsiness/DrowsinessDetector';

const Dashboard = () => {
  const {
    speed,
    increaseSpeed,
    decreaseSpeed,
    emergencyBrake,
    engineOn,
    toggleEngine,
    leftIndicator,
    rightIndicator,
    headlights,
    wipers,
    toggleLeftIndicator,
    toggleRightIndicator,
    toggleHeadlights,
    toggleWipers,
    honk,
    isHonking,
    currentZone,
    zoneConfig,
    zoneAlert,
    vehicleStatus,
    isEmergency,
    showEmergencyAlert,
    dismissEmergencyAlert,
    totalFines,
    resetFines,
    logDrowsinessEvent,
    logDistractionEvent
  } = useDashboard();

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      increaseSpeed();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      decreaseSpeed();
    } else if (e.key === ' ') {
      e.preventDefault();
      emergencyBrake();
    }
  }, [increaseSpeed, decreaseSpeed, emergencyBrake]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time vehicle control center</p>
      </motion.div>

      {/* Zone Alert */}
      {zoneAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ZoneAlert
            zone={currentZone}
            alert={zoneAlert}
            onDismiss={() => { }}
          />
        </motion.div>
      )}

      {/* Status Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Insurance Status Widget */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <InsuranceWidget />
        </motion.div>

        {/* Status Lights Widget */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatusLights />
        </motion.div>

        {/* Total Fines Widget */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FineWidget />
        </motion.div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Engine & Emergency */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="dashboard-card p-6 flex flex-col items-center justify-center gap-8"
        >
          <EngineToggle isOn={engineOn} onToggle={toggleEngine} />
          <div className="w-full h-px bg-border" />
          <EmergencyBrake onActivate={emergencyBrake} isEmergency={isEmergency} />
        </motion.div>

        {/* Center Column - Speedometer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="dashboard-card p-6 flex flex-col items-center"
        >
          <Speedometer
            speed={speed}
            warningSpeed={zoneConfig.maxSpeed || undefined}
          />

          {/* Speed Controls */}
          <div className="flex items-center gap-4 mt-6">
            <motion.button
              onClick={decreaseSpeed}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={!engineOn || speed === 0}
              className="w-14 h-14 rounded-full bg-secondary border-2 border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
            >
              <ChevronDown className="w-8 h-8 text-foreground" />
            </motion.button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">Use ↑↓ keys</p>
              <p className="text-xs text-muted-foreground">or buttons</p>
            </div>

            <motion.button
              onClick={increaseSpeed}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={!engineOn}
              className="w-14 h-14 rounded-full bg-secondary border-2 border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
            >
              <ChevronUp className="w-8 h-8 text-foreground" />
            </motion.button>
          </div>

          {/* Current Zone Indicator */}
          <div className="mt-4 px-4 py-2 rounded-full bg-secondary border border-border">
            <span className="text-xs font-display text-muted-foreground">
              {zoneConfig.name}
              {zoneConfig.maxSpeed && (
                <span className="text-warning ml-2">
                  Max: {zoneConfig.maxSpeed} km/h
                </span>
              )}
            </span>
          </div>
        </motion.div>

        {/* Right Column - Vehicle Status & Drowsiness Monitor */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <VehicleStatus {...vehicleStatus} />
          <DrowsinessDetector
            onDrowsinessDetected={logDrowsinessEvent}
            onDistractionDetected={logDistractionEvent}
            engineOn={engineOn}
          />
        </motion.div>
      </div>

      {/* Vehicle Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <VehicleControls
          leftIndicator={leftIndicator}
          rightIndicator={rightIndicator}
          headlights={headlights}
          wipers={wipers}
          onLeftIndicator={toggleLeftIndicator}
          onRightIndicator={toggleRightIndicator}
          onHeadlights={toggleHeadlights}
          onWipers={toggleWipers}
          onHonk={honk}
          isHonking={isHonking}
        />
      </motion.div>

      {/* Emergency Alert Modal */}
      <EmergencyAlert isOpen={showEmergencyAlert} onDismiss={dismissEmergencyAlert} />
    </div>
  );
};

export default Dashboard;
