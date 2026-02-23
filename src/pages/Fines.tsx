import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Calendar, CreditCard, ArrowLeft } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { carService } from '@/services/api';
import { toast } from 'sonner';

const Fines = () => {
    const { authenticatedCar } = useAuth();
    const { resetFines } = useDashboard(); // We might need a way to refresh fines in context
    const navigate = useNavigate();
    const [fines, setFines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [payingId, setPayingId] = useState<string | null>(null);

    useEffect(() => {
        fetchFines();
    }, [authenticatedCar]);

    const fetchFines = async () => {
        if (!authenticatedCar?.numberPlate) return;
        try {
            setIsLoading(true);
            const res = await carService.getDetails(authenticatedCar.numberPlate);
            if (res.data && res.data.fine_details) {
                setFines(res.data.fine_details);
                // Sync total fines in context if needed, though DashboardContext usually tracks its own session fines.
                // Ideally, DashboardContext should ALSO fetch fines from backend to match.
            }
        } catch (error) {
            console.error("Failed to fetch fines:", error);
            toast.error("Failed to load fines.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePay = async (fineId: string, amount: number) => {
        if (!authenticatedCar) return;
        setPayingId(fineId);
        try {
            await carService.payFine(authenticatedCar.numberPlate, fineId);
            toast.success(`Fine of ₹${amount} paid successfully!`);
            // Refresh list
            await fetchFines();
            // Also reset session fines in dashboard if this clears everything (optional)
            // resetFines(); 
        } catch (error) {
            console.error("Payment failed:", error);
            toast.error("Payment failed. Please try again.");
        } finally {
            setPayingId(null);
        }
    };

    const unpaidFines = fines.filter(f => f.status !== 'paid');
    const totalAmount = unpaidFines.reduce((sum, fine) => sum + (fine.amount || 0), 0);

    return (
        <div className="min-h-screen space-y-6 max-w-3xl mx-auto p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-6"
            >
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-display font-bold text-foreground">Traffic Fines</h1>
                    <p className="text-muted-foreground text-sm">Review and pay outstanding penalties</p>
                </div>
            </motion.div>

            <div className="grid gap-6">
                {/* Summary Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`dashboard-card p-6 border-l-4 ${totalAmount > 0 ? 'border-l-destructive' : 'border-l-success'}`}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Outstanding</p>
                            <h2 className={`text-3xl font-bold font-mono mt-1 ${totalAmount > 0 ? 'text-destructive' : 'text-success'}`}>
                                ₹{totalAmount.toLocaleString()}
                            </h2>
                        </div>
                        <div className={`p-4 rounded-full ${totalAmount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                            {totalAmount > 0 ? <AlertTriangle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                        </div>
                    </div>
                </motion.div>

                {/* Fines List */}
                <div className="space-y-4">
                    <h3 className="font-display font-semibold text-foreground text-lg">Detailed Breakdown</h3>

                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        </div>
                    ) : unpaidFines.length === 0 ? (
                        <div className="text-center py-12 bg-secondary/30 rounded-xl border border-dashed border-border">
                            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3 opacity-50" />
                            <p className="text-muted-foreground font-medium">No outstanding fines</p>
                            <p className="text-xs text-muted-foreground mt-1">Drive safely to keep it this way!</p>
                        </div>
                    ) : (
                        unpaidFines.map((fine, index) => (
                            <motion.div
                                key={fine._id || index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="dashboard-card p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                            >
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-foreground">{fine.description || fine.type || 'Traffic Violation'}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">{fine.status === 'paid' ? 'Paid' : 'Unpaid'}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(fine.date).toLocaleDateString()}
                                        </span>
                                        <span className="text-warning">
                                            Due by: {fine.last_date ? new Date(fine.last_date).toLocaleDateString() : 'N/A'}
                                        </span>
                                        {fine.location && (
                                            <span className="text-muted-foreground">
                                                Location: {fine.location}
                                            </span>
                                        )}
                                        {fine.reference_id && (
                                            <span className="text-muted-foreground font-mono">
                                                ID: {fine.reference_id}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                    <span className="font-mono font-bold text-lg text-foreground">₹{fine.amount}</span>
                                    {fine.status !== 'paid' && (
                                        <Button
                                            onClick={() => handlePay(fine._id, fine.amount)}
                                            disabled={payingId === fine._id}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
                                        >
                                            {payingId === fine._id ? (
                                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4 mr-2" />
                                                    Pay Now
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Fines;
