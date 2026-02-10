import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Hash, User, FileImage, Upload } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { carService } from '@/services/api';
import { toast } from 'sonner';

const CarDetails = () => {
  const { carDetails, updateCarDetails } = useDashboard();
  const { authenticatedCar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(carDetails);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, ownerProofImage: reader.result as string }));
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
          name: formData.ownerName,
          contact: formData.ownerContact,
          proof_image: formData.ownerProofImage
        },
        car_details: {
          engine_number: formData.engineNumber,
        }
      });
      updateCarDetails(formData);
      toast.success('Car details updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update car details:', error);
      toast.error('Failed to update car details');
    } finally {
      setIsSaving(false);
    }
  };

  const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; editable?: boolean; field?: string }> = ({
    icon,
    label,
    value,
    editable,
    field
  }) => (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isEditing && editable && field ? (
          <Input
            value={(formData as any)[field]}
            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
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
            value={carDetails.engineNumber}
            editable
            field="engineNumber"
          />
          <InfoRow
            icon={<Car className="w-5 h-5" />}
            label="Car ID"
            value={carDetails.carId}
            editable
            field="carId"
          />
          <InfoRow
            icon={<User className="w-5 h-5" />}
            label="Owner Name"
            value={carDetails.ownerName}
            editable
            field="ownerName"
          />
        </div>

        {/* Owner Proof */}
        <div className="mt-6">
          <h3 className="text-sm font-display text-muted-foreground mb-4">OWNER PROOF</h3>

          {carDetails.ownerProofImage || formData.ownerProofImage ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img
                src={formData.ownerProofImage || carDetails.ownerProofImage || ''}
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
