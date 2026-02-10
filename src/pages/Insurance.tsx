import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Calendar, Hash, CheckCircle, AlertTriangle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Insurance = () => {
  const { carDetails, updateCarDetails } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    policyNumber: carDetails.policyNumber,
    insuranceValidity: carDetails.insuranceValidity,
  });

  const handleSave = () => {
    updateCarDetails(formData);
    setIsEditing(false);
  };

  // Check if insurance is valid
  const isValid = new Date(carDetails.insuranceValidity) > new Date();
  const daysUntilExpiry = Math.ceil(
    (new Date(carDetails.insuranceValidity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">Insurance Details</h1>
        <p className="text-muted-foreground text-sm mt-1">Vehicle insurance information</p>
      </motion.div>

      {/* Insurance Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`dashboard-card p-6 border-2 ${
          isValid 
            ? daysUntilExpiry <= 30 
              ? 'border-warning warning-glow' 
              : 'border-success success-glow'
            : 'border-emergency danger-glow'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${
              isValid 
                ? daysUntilExpiry <= 30 
                  ? 'bg-warning/20' 
                  : 'bg-success/20'
                : 'bg-emergency/20'
            }`}>
              <Shield className={`w-8 h-8 ${
                isValid 
                  ? daysUntilExpiry <= 30 
                    ? 'text-warning' 
                    : 'text-success'
                  : 'text-emergency'
              }`} />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">Insurance Status</h2>
              <p className={`text-sm ${
                isValid 
                  ? daysUntilExpiry <= 30 
                    ? 'text-warning' 
                    : 'text-success'
                  : 'text-emergency'
              }`}>
                {isValid 
                  ? daysUntilExpiry <= 30 
                    ? `Expiring in ${daysUntilExpiry} days`
                    : 'Valid & Active'
                  : 'Expired'
                }
              </p>
            </div>
          </div>
          
          <div className={`p-2 rounded-full ${
            isValid ? 'bg-success/20' : 'bg-emergency/20'
          }`}>
            {isValid ? (
              <CheckCircle className="w-6 h-6 text-success" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-emergency" />
            )}
          </div>
        </div>

        {/* Insurance Details */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary">
            <div className="flex items-center gap-3 mb-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Policy Number</span>
            </div>
            {isEditing ? (
              <Input
                value={formData.policyNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
                className="bg-card border-border"
              />
            ) : (
              <p className="text-lg font-display font-semibold text-foreground ml-8">
                {carDetails.policyNumber}
              </p>
            )}
          </div>

          <div className="p-4 rounded-lg bg-secondary">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Validity Date</span>
            </div>
            {isEditing ? (
              <Input
                type="date"
                value={formData.insuranceValidity}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceValidity: e.target.value }))}
                className="bg-card border-border ml-8"
              />
            ) : (
              <p className="text-lg font-display font-semibold text-foreground ml-8">
                {new Date(carDetails.insuranceValidity).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => {
                  setFormData({
                    policyNumber: carDetails.policyNumber,
                    insuranceValidity: carDetails.insuranceValidity,
                  });
                  setIsEditing(false);
                }}
                variant="outline"
                className="flex-1 border-border"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-secondary text-foreground hover:bg-secondary/80 border border-border"
            >
              Update Insurance
            </Button>
          )}
        </div>
      </motion.div>

      {/* Renewal Notice */}
      {isValid && daysUntilExpiry <= 30 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="dashboard-card p-4 border-2 border-warning warning-glow"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-warning">Renewal Reminder</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your insurance policy is expiring soon. Please renew before the expiry date to ensure continuous coverage.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Insurance;
