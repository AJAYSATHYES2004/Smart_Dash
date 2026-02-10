import React from 'react';
import { motion } from 'framer-motion';
import { Navigation as NavIcon, MapPin, Route, AlertTriangle, Compass } from 'lucide-react';

const NavigationPage = () => {
  return (
    <div className="min-h-screen space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">Navigation</h1>
        <p className="text-muted-foreground text-sm mt-1">Route guidance & traffic information</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 dashboard-card p-0 overflow-hidden"
        >
          <div className="relative h-96 lg:h-[500px] bg-secondary flex items-center justify-center">
            {/* Simulated Map Grid */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Center marker */}
            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="p-4 rounded-full bg-primary/20 border-2 border-primary neon-glow"
              >
                <MapPin className="w-8 h-8 text-primary" />
              </motion.div>
              <div className="mt-4 px-4 py-2 rounded-lg bg-card border border-border">
                <p className="text-sm font-display text-foreground">Current Location</p>
                <p className="text-xs text-muted-foreground">123 Main Street, City Center</p>
              </div>
            </div>

            {/* Map overlay text */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="px-3 py-1.5 rounded-lg bg-card/90 border border-border">
                <p className="text-xs text-muted-foreground">Map View</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-card/90 border border-border flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                <p className="text-xs text-foreground">Heading: NE</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Route Info Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Current Route */}
          <div className="dashboard-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <Route className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display font-semibold text-foreground">Current Route</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 mt-1.5 rounded-full bg-success" />
                <div>
                  <p className="text-sm font-medium text-foreground">Home</p>
                  <p className="text-xs text-muted-foreground">123 Main Street</p>
                </div>
              </div>
              
              <div className="ml-1.5 w-0.5 h-8 bg-border" />
              
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 mt-1.5 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Office</p>
                  <p className="text-xs text-muted-foreground">456 Business Ave</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Distance</span>
              <span className="font-medium text-foreground">12.5 km</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">ETA</span>
              <span className="font-medium text-primary">25 min</span>
            </div>
          </div>

          {/* Traffic Alerts */}
          <div className="dashboard-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <h2 className="font-display font-semibold text-foreground">Traffic Alerts</h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                <p className="text-sm font-medium text-warning">Moderate Traffic</p>
                <p className="text-xs text-muted-foreground mt-1">Highway 101 - 5 min delay</p>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <p className="text-sm font-medium text-foreground">Road Work Ahead</p>
                <p className="text-xs text-muted-foreground mt-1">Oak Street - Lane closure</p>
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="dashboard-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/20">
                <NavIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display font-semibold text-foreground">Guidance</h2>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
              <p className="text-lg font-display font-semibold text-primary">Turn Right</p>
              <p className="text-sm text-muted-foreground mt-1">in 500 meters onto Oak Street</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NavigationPage;
