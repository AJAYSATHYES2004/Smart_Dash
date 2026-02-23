import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Upload, FileImage, CheckCircle, AlertCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { carService } from '@/services/api';
import { toast } from 'sonner';

const RCBook = () => {
  const { authenticatedCar } = useAuth();
  const { updateCarDetails } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [carData, setCarData] = useState<any>(null);
  const [formData, setFormData] = useState({
    rcBookImage: '',
    registrationDate: '',
  });

  useEffect(() => {
    fetchRCBookData();
  }, [authenticatedCar]);

  const fetchRCBookData = async () => {
    try {
      if (!authenticatedCar?.numberPlate) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const response = await carService.getDetails(authenticatedCar.numberPlate);
      setCarData(response.data);
      const rcBookData = response.data?.car_details?.rc_book;
      if (rcBookData) {
        setFormData({
          rcBookImage: rcBookData.image || '',
          registrationDate: rcBookData.registrationDate || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch RC book data:', error);
      toast.error('Failed to load RC book details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, rcBookImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    toast.info('RC Book details are immutable and read-only.');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">RC Book</h1>
        <p className="text-muted-foreground text-sm mt-1">Vehicle registration certificate</p>
      </motion.div>

      {/* RC Book Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="dashboard-card p-6"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-primary/20 neon-glow">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">
                  Registration Certificate
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">Verified Document</span>
                </div>
              </div>
            </div>

            {/* Registration Date */}
            <div className="p-4 rounded-lg bg-secondary mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Registration Date (Read-Only)</span>
              </div>
              <p className="text-lg font-display font-semibold text-foreground ml-8">
                {formData.registrationDate ? new Date(formData.registrationDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : carData?.car_details?.rc_book?.registrationDate ? new Date(carData.car_details.rc_book.registrationDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>

            {/* RC Book Image */}
            <div>
              <h3 className="text-sm font-display text-muted-foreground mb-4">RC BOOK DOCUMENT (Read-Only)</h3>

              {carData?.car_details?.rc_book?.image || formData.rcBookImage ? (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img
                    src={formData.rcBookImage || carData?.car_details?.rc_book?.image || ''}
                    alt="RC Book"
                    className="w-full h-64 object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed border-border bg-secondary">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
                  <span className="text-sm text-muted-foreground">No RC Book Document</span>
                </div>
              )}
            </div>

            {/* Vehicle Details Summary */}
            <div className="mt-6 p-4 rounded-lg bg-secondary">
              <h4 className="text-sm font-display text-muted-foreground mb-3">QUICK INFO</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Number Plate</p>
                  <p className="text-sm font-medium text-foreground">{carData?.number_plate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Owner</p>
                  <p className="text-sm font-medium text-foreground">{carData?.owner_details?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Engine No.</p>
                  <p className="text-sm font-medium text-foreground">{carData?.car_details?.engine_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Owner Contact</p>
                  <p className="text-sm font-medium text-foreground">{carData?.owner_details?.contact || 'N/A'}</p>
                </div>
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
                        rcBookImage: carData?.car_details?.rc_book?.image || '',
                        registrationDate: carData?.car_details?.rc_book?.registrationDate || '',
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
                  disabled
                  className="w-full bg-secondary text-foreground hover:bg-secondary/80 border border-border opacity-50 cursor-not-allowed"
                  title="RC Book details are read-only and cannot be edited"
                >
                  Update RC Book (Read-Only)
                </Button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default RCBook;
