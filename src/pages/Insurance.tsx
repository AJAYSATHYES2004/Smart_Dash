import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Calendar, Hash, CheckCircle, AlertTriangle, Download, Car, User, Phone } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { carService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

import { useNavigate, useSearchParams } from 'react-router-dom';

const Insurance = () => {
  const { authenticatedCar, user } = useAuth();
  const { updateCarDetails } = useDashboard();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('mode') === 'onboarding';

  const [isEditing, setIsEditing] = useState(isOnboarding);
  const [isLoading, setIsLoading] = useState(true);
  const [carData, setCarData] = useState<any>(null);
  const [formData, setFormData] = useState({
    policyNumber: '',
    insuranceValidity: '',
    providerName: '',
    premium: 0,
    coverageAmount: 0
  });

  useEffect(() => {
    fetchInsuranceData();
  }, [authenticatedCar]);

  const fetchInsuranceData = async () => {
    try {
      if (!authenticatedCar?.numberPlate) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const response = await carService.getDetails(authenticatedCar.numberPlate);
      setCarData(response.data);
      const insuranceData = response.data?.car_details?.insurance;
      if (insuranceData) {
        setFormData({
          policyNumber: insuranceData.policyNumber || '',
          insuranceValidity: insuranceData.validity ? new Date(insuranceData.validity).toISOString().split('T')[0] : '',
          providerName: insuranceData.providerName || '',
          premium: insuranceData.premium || 0,
          coverageAmount: insuranceData.coverageAmount || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch insurance data:', error);
      toast({
        title: "Error",
        description: "Failed to load insurance details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFromProfile = () => {
    // Requires getting user from useAuth
    // This will be implemented by updating the component to destructure user from useAuth()
    // and then populating formData.
  };

  const handleSave = async () => {
    if (!authenticatedCar) return;

    try {
      await carService.updateDetails(authenticatedCar.numberPlate, {
        car_details: {
          insurance: {
            policyNumber: formData.policyNumber,
            validity: formData.insuranceValidity,
            providerName: formData.providerName || '',
            premium: formData.premium || 0,
            coverageAmount: formData.coverageAmount || 0
          }
        }
      });
      await fetchInsuranceData();
      updateCarDetails({
        policyNumber: formData.policyNumber,
        insuranceValidity: formData.insuranceValidity,
      });
      toast({
        title: "Success",
        description: "Insurance details updated successfully!",
      });
      setIsEditing(false);

      if (isOnboarding) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Failed to update insurance details:', error);
      console.error('Failed to update insurance details:', error);
      toast({
        title: "Error",
        description: "Failed to update insurance details",
        variant: "destructive",
      });
    }
  };

  const insuranceValidity = formData.insuranceValidity || carData?.car_details?.insurance?.validity;
  // Check if insurance is valid
  const isValid = insuranceValidity && new Date(insuranceValidity) > new Date();
  const daysUntilExpiry = insuranceValidity ? Math.ceil(
    (new Date(insuranceValidity).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  ) : 0;

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

      {/* Owner & Car Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Owner Details Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="dashboard-card p-4 border border-border"
        >
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Owner Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Name</span>
              <span className="text-sm font-medium text-foreground">{authenticatedCar?.ownerName || carData?.owner_details?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Contact</span>
              <span className="text-sm font-medium text-foreground">{authenticatedCar?.ownerContact || carData?.owner_details?.contact || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Car ID</span>
              <span className="text-sm font-medium text-foreground">{authenticatedCar?.carId || carData?.car_id || 'N/A'}</span>
            </div>
          </div>
        </motion.div>

        {/* Car Details Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="dashboard-card p-4 border border-border"
        >
          <h3 className="text-sm font-display font-semibold text-foreground mb-3">Car Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Number Plate</span>
              <span className="text-sm font-medium text-primary">{authenticatedCar?.numberPlate || carData?.number_plate || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Engine Number</span>
              <span className="text-sm font-medium text-foreground">{authenticatedCar?.engineNumber || carData?.car_details?.engine_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Registration Date</span>
              <span className="text-sm font-medium text-foreground">
                {authenticatedCar?.registrationDate
                  ? new Date(authenticatedCar.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : carData?.car_details?.rc_book?.registrationDate
                    ? new Date(carData.car_details.rc_book.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'N/A'
                }
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Insurance Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`dashboard-card p-6 border-2 ${isValid
          ? daysUntilExpiry <= 30
            ? 'border-warning warning-glow'
            : 'border-success success-glow'
          : 'border-emergency danger-glow'
          }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${isValid
                  ? daysUntilExpiry <= 30
                    ? 'bg-warning/20'
                    : 'bg-success/20'
                  : 'bg-emergency/20'
                  }`}>
                  <Shield className={`w-8 h-8 ${isValid
                    ? daysUntilExpiry <= 30
                      ? 'text-warning'
                      : 'text-success'
                    : 'text-emergency'
                    }`} />
                </div>
                <div>
                  <h2 className="text-lg font-display font-semibold text-foreground">Insurance Status</h2>
                  <p className={`text-sm ${isValid
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

              <div className={`p-2 rounded-full ${isValid ? 'bg-success/20' : 'bg-emergency/20'
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
                    {formData.policyNumber || carData?.car_details?.insurance?.policyNumber || 'N/A'}
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
                    {insuranceValidity ? new Date(insuranceValidity).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Insurance Provider</span>
                </div>
                {isEditing ? (
                  <Input
                    value={formData.providerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, providerName: e.target.value }))}
                    className="bg-card border-border ml-8"
                    placeholder="Provider Name"
                  />
                ) : (
                  <p className="text-lg font-display font-semibold text-foreground ml-8">
                    {formData.providerName || carData?.car_details?.insurance?.providerName || 'N/A'}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-3 mb-2">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Annual Premium</span>
                </div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.premium}
                    onChange={(e) => setFormData(prev => ({ ...prev, premium: parseFloat(e.target.value) || 0 }))}
                    className="bg-card border-border ml-8"
                    placeholder="Premium Amount"
                  />
                ) : (
                  <p className="text-lg font-display font-semibold text-foreground ml-8">
                    ₹{formData.premium || carData?.car_details?.insurance?.premium || 'N/A'}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-secondary">
                <div className="flex items-center gap-3 mb-2">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Coverage Amount</span>
                </div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.coverageAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverageAmount: parseFloat(e.target.value) || 0 }))}
                    className="bg-card border-border ml-8"
                    placeholder="Coverage Amount"
                  />
                ) : (
                  <p className="text-lg font-display font-semibold text-foreground ml-8">
                    ₹{formData.coverageAmount || carData?.car_details?.insurance?.coverageAmount || 'N/A'}
                  </p>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                {isEditing ? (
                  <div className="flex flex-col w-full gap-3">
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {isOnboarding ? 'Save & Continue' : 'Save Changes'}
                      </Button>
                      {!isOnboarding && (
                        <Button
                          onClick={() => {
                            const insuranceData = carData?.car_details?.insurance;
                            setFormData({
                              policyNumber: insuranceData?.policyNumber || '',
                              insuranceValidity: insuranceData?.validity ? new Date(insuranceData.validity).toISOString().split('T')[0] : '',
                              providerName: insuranceData?.providerName || '',
                              premium: insuranceData?.premium || 0,
                              coverageAmount: insuranceData?.coverageAmount || 0
                            });
                            setIsEditing(false);
                          }}
                          variant="outline"
                          className="flex-1 border-border"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    {user?.insuranceDetails && (
                      <Button
                        onClick={() => {
                          if (user.insuranceDetails) {
                            const validityDate = user.insuranceDetails.validity
                              ? new Date(user.insuranceDetails.validity).toISOString().split('T')[0]
                              : '';

                            setFormData(prev => ({
                              ...prev,
                              policyNumber: user.insuranceDetails?.policyNumber || '',
                              providerName: user.insuranceDetails?.provider || '',
                              insuranceValidity: validityDate
                            }));
                            toast({
                              title: "Synced",
                              description: "Insurance data synced from your profile!",
                            });
                          }
                        }}
                        variant="secondary"
                        className="w-full border border-primary/20 hover:bg-primary/10 text-primary"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Sync from My Profile
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                  >
                    Update Insurance
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
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
