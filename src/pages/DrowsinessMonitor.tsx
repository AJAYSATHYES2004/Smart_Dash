import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import DrowsinessDetector from '@/components/drowsiness/DrowsinessDetector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';

const DrowsinessMonitor = () => {
    const { logDrowsinessEvent, drowsinessEvents, engineOn, logDistractionEvent, distractionEvents } = useDashboard();

    // Calculate statistics from the global drowsinessEvents array
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const drowsinessToday = drowsinessEvents.filter(e => new Date(e.timestamp) >= today);
    const distractionToday = distractionEvents.filter(e => new Date(e.timestamp) >= today);

    const drowsinessCount = drowsinessToday.length;
    const distractionCount = distractionToday.length;

    const lastEventTime = drowsinessEvents.length > 0
        ? new Date(drowsinessEvents[drowsinessEvents.length - 1].timestamp)
        : null;

    const handleDrowsinessDetected = (event: { timestamp: Date; duration: number; severity: string }) => {
        logDrowsinessEvent(event);
    };

    return (
        <div className="min-h-screen space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-2xl font-display font-bold text-foreground">Safety Monitor</h1>
                <p className="text-muted-foreground text-sm mt-1">AI-powered drowsiness & distraction detection</p>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-2 text-muted-foreground">
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                Drowsiness Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{drowsinessCount}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Events logged</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-2 text-muted-foreground">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                Distractions Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{distractionCount}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Head-aside detections</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-3 h-3 text-blue-500" />
                                Last Event
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {lastEventTime ? lastEventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">Most recent activity</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] uppercase tracking-wider font-bold flex items-center gap-2 text-muted-foreground">
                                <TrendingUp className="w-3 h-3 text-green-500" />
                                Monitor Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${engineOn ? 'text-green-500' : 'text-muted-foreground'}`}>
                                {engineOn ? 'Active' : 'Stopped'}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {engineOn ? 'AI is watching' : 'Engine off'}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Main Detector */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <DrowsinessDetector
                    onDrowsinessDetected={handleDrowsinessDetected}
                    onDistractionDetected={logDistractionEvent}
                    engineOn={engineOn}
                />
            </motion.div>

            {/* Instructions */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Safety Detection Logic
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground text-xs uppercase tracking-widest">Drowsiness (EAR)</h4>
                            <p>• Monitors Eye Aspect Ratio (EAR) across 68 landmarks.</p>
                            <p>• Triggers alert if eyes remain closed for 3+ consecutive frames (~300ms).</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground text-xs uppercase tracking-widest">Distraction (Pose)</h4>
                            <p>• Estimates Yaw/Pitch by nose position relative to eye midpoints.</p>
                            <p>• Triggers alert if head turns aside or down for 5+ frames (~500ms).</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default DrowsinessMonitor;
