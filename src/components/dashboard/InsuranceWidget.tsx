import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';

const InsuranceWidget = () => {
    const { carDetails } = useDashboard();

    if (!carDetails) return null;

    const { policyNumber, insuranceValidity } = carDetails;
    // Handle case where insurance might be an object ID or missing
    // In authenticatedCar (AuthContext), insurance is a string (ID) or missing
    // But we also have policyNumber and insuranceValidity mapped in AuthContext

    const validityDate = insuranceValidity ? new Date(insuranceValidity) : null;
    const isValid = validityDate ? validityDate > new Date() : false;

    const daysUntilExpiry = validityDate ? Math.ceil(
        (validityDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    ) : 0;

    const isWarning = isValid && daysUntilExpiry <= 30;

    return (
        <div className={`dashboard-card p-4 border-l-4 ${isValid
            ? isWarning ? 'border-l-warning' : 'border-l-success'
            : 'border-l-destructive'
            }`}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${isValid
                        ? isWarning ? 'text-warning' : 'text-success'
                        : 'text-destructive'
                        }`} />
                    Insurance Status
                </h3>
                {isValid ? (
                    <span className={`text-xs px-2 py-1 rounded-full ${isWarning ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                        }`}>
                        {isWarning ? 'Expiring Soon' : 'Active'}
                    </span>
                ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-destructive/20 text-destructive">
                        Expired
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Policy No:</span>
                    <span className="font-mono text-foreground">{policyNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valid Until:</span>
                    <span className={`font-medium ${!isValid ? 'text-destructive' : isWarning ? 'text-warning' : 'text-foreground'
                        }`}>
                        {validityDate ? validityDate.toLocaleDateString() : 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default InsuranceWidget;
