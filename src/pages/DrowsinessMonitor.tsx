import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import DrowsinessDetector from '@/components/drowsiness/DrowsinessDetector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';

const DrowsinessMonitor = () => {
    const { logDrowsinessEvent, drowsinessEvents } = useDashboard();
    const [eventsCount, setEventsCount] = useState(0);
    const [lastEventTime, setLastEventTime] = useState<Date | null>(null);

    const handleDrowsinessDetected = (event: { timestamp: Date; duration: number; severity: string }) => {
        logDrowsinessEvent(event);
        setEventsCount(prev => prev + 1);
        setLastEventTime(event.timestamp);
    };

    return (
        <div className="min-h-screen space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h1 className="text-2xl font-display font-bold text-foreground">Drowsiness Monitor</h1>
                <p className="text-muted-foreground text-sm mt-1">AI-powered driver alertness detection</p>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                Events Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{eventsCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Drowsiness detections</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                Last Event
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {lastEventTime ? lastEventTime.toLocaleTimeString() : '--:--'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Most recent detection</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                Alert Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">Active</div>
                            <p className="text-xs text-muted-foreground mt-1">Monitoring enabled</p>
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
                <DrowsinessDetector onDrowsinessDetected={handleDrowsinessDetected} />
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
                            How It Works
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>• The system monitors your eye movements in real-time using AI</p>
                        <p>• If your eyes remain closed for more than 3 frames (~300ms), an alert is triggered</p>
                        <p>• All drowsiness events are logged and synced to the backend</p>
                        <p>• Make sure you're in a well-lit environment for best results</p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default DrowsinessMonitor;
