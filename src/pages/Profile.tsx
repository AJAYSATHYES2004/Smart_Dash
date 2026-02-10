import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, CreditCard, Phone, AlertCircle, Mail, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authService } from '@/services/api';
import { toast } from 'sonner';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    licenseNumber: user?.licenseNumber || '',
    emergencyContact: user?.emergencyContact || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Assuming user has an _id field from MongoDB
      const userId = (user as any)._id || 'temp-id';
      await authService.updateProfile(userId, formData);
      updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      licenseNumber: user.licenseNumber || '',
      emergencyContact: user.emergencyContact || '',
    });
    setIsEditing(false);
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = user.dateOfBirth ? calculateAge(user.dateOfBirth) : null;

  const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; editable?: boolean; field?: keyof typeof formData }> = ({
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
            value={formData[field]}
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
        <h1 className="text-2xl font-display font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Your driver information</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="dashboard-card p-6"
      >
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-secondary border-4 border-primary overflow-hidden flex items-center justify-center neon-glow">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-display font-bold text-foreground">{user.name}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-success" />
                Verified Driver
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="mt-6">
          <InfoRow
            icon={<User className="w-5 h-5" />}
            label="Full Name"
            value={isEditing ? formData.name : user.name}
            editable
            field="name"
          />
          <InfoRow
            icon={<Mail className="w-5 h-5" />}
            label="Email"
            value={user.email}
          />
          <InfoRow
            icon={<Calendar className="w-5 h-5" />}
            label="Date of Birth"
            value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Not set'}
          />
          {age && (
            <InfoRow
              icon={<Calendar className="w-5 h-5" />}
              label="Age"
              value={`${age} years`}
            />
          )}
          <InfoRow
            icon={<CreditCard className="w-5 h-5" />}
            label="License Number"
            value={isEditing ? formData.licenseNumber : (user.licenseNumber || 'Not set')}
            editable
            field="licenseNumber"
          />
          <InfoRow
            icon={<Phone className="w-5 h-5" />}
            label="Phone Number"
            value={isEditing ? formData.phone : (user.phone || 'Not set')}
            editable
            field="phone"
          />
          <InfoRow
            icon={<AlertCircle className="w-5 h-5" />}
            label="Emergency Contact"
            value={isEditing ? formData.emergencyContact : (user.emergencyContact || 'Not set')}
            editable
            field="emergencyContact"
          />
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
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isSaving}
                variant="outline"
                className="flex-1 border-border"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-secondary text-foreground hover:bg-secondary/80 border border-border"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
