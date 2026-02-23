import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';

const StatusLights = () => {
    const { carDetails, unpaidFines, isStolen } = useDashboard();

    // 1. Insurance/Document Logic
    const validityDate = carDetails?.insuranceValidity ? new Date(carDetails.insuranceValidity) : null;
    const isInsuranceExpired = validityDate ? validityDate < new Date() : true;
    const hasValidDocs = !isInsuranceExpired;

    // 2. Fine Logic
    const hasPendingFines = unpaidFines.length > 0;

    // Combined Status Logic (Based on Image)
    // RED: Stolen vehicle
    const isRed = isStolen;

    // YELLOW: Invalid documents
    const isYellow = isInsuranceExpired && !isStolen;

    // ORANGE: Pending Traffic Fine
    const isOrange = hasPendingFines && !isStolen && !isInsuranceExpired;

    // WHITE: Valid Vehicle Document
    const isWhite = hasValidDocs && !hasPendingFines && !isStolen;

    // GREEN: Both vehicle & drive documents are valid
    const isGreen = hasValidDocs && !hasPendingFines && !isStolen;
    // Note: Green and White share similar positive logic, but White is "Valid Document" 
    // while Green is "All documents valid". We'll show Green as the highest positive state.

    const getStatusInfo = () => {
        if (isRed) return { text: "STOLEN VEHICLE", color: "text-red-500" };
        if (isYellow) return { text: "INVALID DOCUMENTS", color: "text-yellow-500" };
        if (isOrange) return { text: "PENDING TRAFFIC FINE", color: "text-orange-500" };
        if (isGreen) return { text: "ALL DOCUMENTS VALID", color: "text-green-500" };
        if (isWhite) return { text: "VALID VEHICLE DOCUMENT", color: "text-slate-100" };
        return { text: "CHECKING SYSTEM...", color: "text-muted-foreground" };
    };

    const statusInfo = getStatusInfo();

    const StatusCircle = ({ color, active, label }: { color: string; active: boolean; label: string }) => {
        const colorClasses: Record<string, string> = {
            red: active ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse' : 'bg-red-950/20',
            yellow: active ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.7)] animate-pulse' : 'bg-yellow-950/20',
            orange: active ? 'bg-[#ff7e00] shadow-[0_0_15px_rgba(255,126,0,0.7)] animate-pulse' : 'bg-orange-950/10',
            white: active ? 'bg-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.7)]' : 'bg-slate-800/20',
            green: active ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.7)]' : 'bg-green-950/20'
        };

        const borderClasses: Record<string, string> = {
            red: active ? 'border-red-500/50' : 'border-red-950/30',
            yellow: active ? 'border-yellow-400/50' : 'border-yellow-950/30',
            orange: active ? 'border-[#ff7e00]/50' : 'border-orange-950/20',
            white: active ? 'border-slate-100/50' : 'border-slate-800/30',
            green: active ? 'border-green-500/50' : 'border-green-950/30'
        };

        return (
            <div className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`relative w-8 h-8 rounded-full border-2 ${borderClasses[color]} transition-all duration-500 ${colorClasses[color]} flex items-center justify-center`}>
                    {active && (
                        <div className={`absolute inset-0 rounded-full blur-md opacity-40 ${color === 'red' ? 'bg-red-400' :
                                color === 'yellow' ? 'bg-yellow-300' :
                                    color === 'orange' ? 'bg-orange-400' :
                                        color === 'white' ? 'bg-slate-200' :
                                            'bg-green-400'
                            }`}></div>
                    )}
                </div>
                <span className={`text-[7px] font-black tracking-tighter uppercase text-center w-full transition-opacity duration-300 ${active ? 'opacity-100 text-foreground' : 'opacity-20 text-muted-foreground'}`}>
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div className="dashboard-card p-3 flex flex-col items-center justify-center gap-3 h-full">
            <div className="text-center w-full">
                <h3 className="font-display font-medium text-muted-foreground text-[9px] uppercase tracking-[0.2em] mb-1">Vehicle Status Light</h3>
                <div className={`text-[10px] font-black tracking-widest uppercase py-0.5 px-3 rounded-full bg-black/40 border border-white/5 inline-block ${statusInfo.color}`}>
                    {statusInfo.text}
                </div>
            </div>

            <div className="flex items-center justify-between gap-1 w-full p-2 bg-black/40 rounded-xl border border-white/5 shadow-inner backdrop-blur-sm">
                <StatusCircle color="red" active={isRed} label="Red Light" />
                <StatusCircle color="yellow" active={isYellow} label="Yellow Light" />
                <StatusCircle color="orange" active={isOrange} label="Orange Light" />
                <StatusCircle color="white" active={isWhite} label="White Light" />
                <StatusCircle color="green" active={isGreen} label="Green Light" />
            </div>
        </div>
    );
};

export default StatusLights;
