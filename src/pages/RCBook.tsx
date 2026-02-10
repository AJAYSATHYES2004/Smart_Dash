import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Upload, FileImage, CheckCircle } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const RCBook = () => {
  const { carDetails, updateCarDetails } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    rcBookImage: carDetails.rcBookImage,
    registrationDate: carDetails.registrationDate,
  });

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

  const handleSave = () => {
    updateCarDetails(formData);
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
            <span className="text-sm text-muted-foreground">Registration Date</span>
          </div>
          {isEditing ? (
            <Input
              type="date"
              value={formData.registrationDate}
              onChange={(e) => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
              className="bg-card border-border ml-8"
            />
          ) : (
            <p className="text-lg font-display font-semibold text-foreground ml-8">
              {new Date(carDetails.registrationDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* RC Book Image */}
        <div>
          <h3 className="text-sm font-display text-muted-foreground mb-4">RC BOOK DOCUMENT</h3>
          
          {carDetails.rcBookImage || formData.rcBookImage ? (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img 
                src={formData.rcBookImage || carDetails.rcBookImage || ''} 
                alt="RC Book" 
                className="w-full h-64 object-cover"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer hover:bg-black/60 transition-colors">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                    <span className="text-white text-sm">Change Document</span>
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
            <label className="flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-primary transition-colors">
              <FileImage className="w-12 h-12 text-muted-foreground mb-3" />
              <span className="text-sm text-muted-foreground">Upload RC Book Image</span>
              <span className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Vehicle Details Summary */}
        <div className="mt-6 p-4 rounded-lg bg-secondary">
          <h4 className="text-sm font-display text-muted-foreground mb-3">QUICK INFO</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Car ID</p>
              <p className="text-sm font-medium text-foreground">{carDetails.carId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="text-sm font-medium text-foreground">{carDetails.ownerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Engine No.</p>
              <p className="text-sm font-medium text-foreground">{carDetails.engineNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Insurance</p>
              <p className="text-sm font-medium text-success">Active</p>
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
                    rcBookImage: carDetails.rcBookImage,
                    registrationDate: carDetails.registrationDate,
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
              Update RC Book
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default RCBook;
