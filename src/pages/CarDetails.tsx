import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, Hash, User, FileImage, Upload, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { carService } from '@/services/api';
import { toast } from 'sonner';

const CarDetails = () => {
  const { carDetails, updateCarDetails, vehicleStatus } = useDashboard();
  const { authenticatedCar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    car_details: {
      engine_number: '',
      insurance: {
        policyNumber: '',
        validity: ''
      },
      rc_book: {
        registrationDate: ''
      }
    },
    owner_details: {
      name: '',
      contact: '',
      proof_image: ''
    },
    driving_data: {},
    fine_details: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [carData, setCarData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCarData();
  }, [authenticatedCar]);

  const fetchCarData = async () => {
    try {
      if (!authenticatedCar?.numberPlate) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const response = await carService.getDetails(authenticatedCar.numberPlate);
      setCarData(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Failed to fetch car data:', error);
      toast.error('Failed to load car details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({
          ...prev,
          owner_details: {
            ...prev.owner_details,
            proof_image: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!authenticatedCar) return;

    setIsSaving(true);
    try {
      await carService.updateDetails(authenticatedCar.numberPlate, {
        owner_details: {
          name: formData.owner_details?.name || '',
          contact: formData.owner_details?.contact || '',
          proof_image: formData.owner_details?.proof_image || ''
        },
        car_details: {
          engine_number: formData.car_details?.engine_number || ''
        }
      });
      // Refresh data to ensure sync
      await fetchCarData();
      toast.success('Car details updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update car details:', error);
      toast.error('Failed to update car details');
    } finally {
      setIsSaving(false);
    }
  };

  const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; editable?: boolean; section?: string; field?: string }> = ({
    icon,
    label,
    value,
    editable,
    section,
    field
  }) => (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isEditing && editable && section && field ? (
          <Input
            value={(formData as any)?.[section]?.[field] || ''}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              [section]: {
                ...prev[section],
                [field]: e.target.value
              }
            }))}
            className="mt-1 bg-secondary border-border h-8"
          />
        ) : (
          <p className="text-sm font-medium text-foreground">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">Car Details</h1>
        <p className="text-muted-foreground text-sm mt-1">Vehicle information & documentation</p>
      </motion.div>

      {/* Car Details Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="dashboard-card p-6"
      >
        {/* Car Icon Header */}
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 rounded-full bg-primary/20 border-2 border-primary neon-glow">
            <Car className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Vehicle Info */}
        <div>
          <h3 className="text-sm font-display text-muted-foreground mb-4">VEHICLE INFORMATION</h3>

          <InfoRow
            icon={<Hash className="w-5 h-5" />}
            label="Engine Number"
            value={carData?.car_details?.engine_number || carDetails.engineNumber || 'N/A'}
            editable
            section="car_details"
            field="engine_number"
          />
          <InfoRow
            icon={<Car className="w-5 h-5" />}
            label="Number Plate"
            value={carData?.number_plate || carDetails.carId || 'N/A'}
          />
          <InfoRow
            icon={<User className="w-5 h-5" />}
            label="Owner Name"
            value={carData?.owner_details?.name || carDetails.ownerName || 'N/A'}
            editable
            section="owner_details"
            field="name"
          />
          <InfoRow
            icon={<User className="w-5 h-5" />}
            label="Owner Contact"
            value={carData?.owner_details?.contact || carDetails.ownerContact || 'N/A'}
            editable
            section="owner_details"
            field="contact"
          />
        </div>

        {/* Vehicle Status */}
        {carData?.driving_data && (
          <div className="mt-6">
            <h3 className="text-sm font-display text-muted-foreground mb-4">VEHICLE STATUS</h3>
            <InfoRow
              icon={<Car className="w-5 h-5" />}
              label="Fuel Level"
              value={`${carData.driving_data.petrol || 0}%`}
            />
            <InfoRow
              icon={<Car className="w-5 h-5" />}
              label="Oil Level"
              value={`${carData.driving_data.oil || 0}%`}
            />
            <InfoRow
              icon={<Car className="w-5 h-5" />}
              label="Engine Temp"
              value={`${carData.driving_data.engineTemp || 90}°C`}
            />
            <InfoRow
              icon={<Car className="w-5 h-5" />}
              label="Odometer"
              value={`${(carData.driving_data.kilometers || 0).toLocaleString()} km`}
            />
          </div>
        )}

        {/* Owner Proof */}
        <div className="mt-6">
          <h3 className="text-sm font-display text-muted-foreground mb-4">OWNER PROOF</h3>

          {carData?.owner_details?.proof_image || formData.owner_details?.proof_image ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img
                src={formData.owner_details?.proof_image || carData?.owner_details?.proof_image || ''}
                alt="Owner Proof"
                className="w-full h-48 object-cover"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer hover:bg-black/60 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                    <span className="text-white text-sm">Change Image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-primary transition-colors">
              <FileImage className="w-10 h-10 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Upload Owner Proof</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => {
                  setFormData(carDetails);
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
              Edit Details
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CarDetails;
