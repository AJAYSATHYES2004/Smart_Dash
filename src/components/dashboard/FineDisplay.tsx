import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, IndianRupee, RotateCcw } from 'lucide-react';

interface FineDisplayProps {
    totalFines: number;
    onReset: () => void;
}

const FineDisplay: React.FC<FineDisplayProps> = ({ totalFines, onReset }) => {
    const hasFines = totalFines > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`dashboard-card p-6 ${hasFines ? 'border-2 border-destructive' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${hasFines ? 'bg-destructive/10' : 'bg-secondary'}`}>
                        <AlertCircle className={`w-6 h-6 ${hasFines ? 'text-destructive' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Total Fines</h3>
                        <div className="flex items-center gap-1 mt-1">
                            <IndianRupee className={`w-5 h-5 ${hasFines ? 'text-destructive' : 'text-foreground'}`} />
                            <motion.span
                                key={totalFines}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className={`text-2xl font-bold font-display ${hasFines ? 'text-destructive' : 'text-foreground'
                                    }`}
                            >
                                {totalFines.toLocaleString('en-IN')}
                            </motion.span>
                        </div>
                    </div>
                </div>

                {hasFines && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 border border-border transition-colors"
                        title="Reset Fines"
                    >
                        <RotateCcw className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">Reset</span>
                    </motion.button>
                )}
            </div>

            {hasFines && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-border"
                >
                    <p className="text-xs text-muted-foreground">
                        <span className="text-destructive font-semibold">⚠️ Warning:</span> Fines are calculated at ₹100 per km/h over the speed limit in restricted zones.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default FineDisplay;
