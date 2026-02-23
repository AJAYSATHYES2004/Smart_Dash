import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

import { useNavigate } from 'react-router-dom';

const FineWidget = () => {
    const { totalFines, unpaidFines } = useDashboard();
    const navigate = useNavigate();

    const hasFines = unpaidFines.length > 0;
    const hasOverdueFines = unpaidFines.some(fine => {
        if (!fine.last_date) return false;
        return new Date(fine.last_date) < new Date();
    });

    const statusColor = hasOverdueFines ? 'destructive' : hasFines ? 'warning' : 'success';
    const statusLabel = hasOverdueFines ? 'Overdue' : hasFines ? 'Pending' : 'Clear';
    const borderColor = hasOverdueFines ? 'border-l-destructive' : hasFines ? 'border-l-warning' : 'border-l-success';
    const textColor = hasOverdueFines ? 'text-destructive' : hasFines ? 'text-warning' : 'text-success';
    const bgColor = hasOverdueFines ? 'bg-destructive/10' : hasFines ? 'bg-warning/10' : 'bg-success/10';

    return (
        <div
            onClick={() => navigate('/fines')}
            className={`dashboard-card p-4 border-l-4 cursor-pointer hover:bg-secondary/50 transition-colors ${borderColor}`}
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${textColor}`} />
                    Total Fines
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${bgColor} ${textColor} border border-current/20`}>
                    {statusLabel}
                </span>
            </div>

            <div className="space-y-1">
                <div className="flex justify-between items-end">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Outstanding Amount:</span>
                    <span className={`text-2xl font-bold font-mono ${textColor} neon-text`}>
                        ₹{totalFines.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FineWidget;
