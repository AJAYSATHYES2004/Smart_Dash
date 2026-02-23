import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Calendar, CreditCard, Phone, Lock, Eye, EyeOff, Camera, Car, Shield, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, registerFace, authenticatedCar, logoutCar } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    licenseNumber: '',
    phone: '',
    email: '',
    password: '',
    insuranceProvider: '',
    policyNumber: '',
    policyValidity: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangeCar = () => {
    logoutCar();
    navigate('/car-login');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Submitting Signup Form:', {
      ...formData
    });

    const result = await signup({
      ...formData,
      profilePhoto,
      password: formData.password,
      insuranceDetails: (formData as any).insuranceProvider ? {
        provider: (formData as any).insuranceProvider,
        policyNumber: (formData as any).policyNumber,
        validity: (formData as any).policyValidity
      } : undefined
    });

    if (result.success) {
      // Register face if captured - already handled in signup if passed
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
    }
    setIsLoading(false);
  };



  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-dashboard flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary overflow-hidden border-2 border-primary neon-glow mb-3"
          >
            <img src="/logo.png" alt="Smart Dash Logo" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold text-foreground neon-text">
            Create Account
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Step 2: Driver Registration</p>

          {/* Authenticated Car Display */}
          {authenticatedCar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-3 px-3 py-2 rounded-lg bg-secondary border border-primary inline-flex items-center gap-2"
            >
              <Car className="w-4 h-4 text-primary" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Authenticated Car</p>
                <p className="text-sm font-semibold text-foreground">{authenticatedCar.numberPlate}</p>
              </div>
              <button
                onClick={handleChangeCar}
                className="ml-2 text-xs text-primary hover:underline"
              >
                Change
              </button>
            </motion.div>
          )}
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="dashboard-card"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Photo */}
            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className="w-20 h-20 rounded-full bg-secondary border-2 border-border group-hover:border-primary transition-colors overflow-hidden flex items-center justify-center">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                  Upload Photo
                </span>
              </label>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-foreground text-sm">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={updateField('name')}
                  className="pl-9 bg-secondary border-border focus:border-primary h-9"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <Label htmlFor="dob" className="text-foreground text-sm">Date of Birth</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={updateField('dateOfBirth')}
                  className="pl-9 bg-secondary border-border focus:border-primary h-9"
                />
              </div>
            </div>

            {/* License Number */}
            <div className="space-y-1">
              <Label htmlFor="license" className="text-foreground text-sm">License Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="license"
                  placeholder="DL-XXXX-XXXXX"
                  value={formData.licenseNumber}
                  onChange={updateField('licenseNumber')}
                  className="pl-9 bg-secondary border-border focus:border-primary h-9"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-foreground text-sm">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={updateField('phone')}
                  className="pl-9 bg-secondary border-border focus:border-primary h-9"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={updateField('email')}
                  className="pl-9 bg-secondary border-border focus:border-primary h-9"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-foreground text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password"
                  value={formData.password}
                  onChange={updateField('password')}
                  className="pl-9 pr-9 bg-secondary border-border focus:border-primary h-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Insurance Details */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-medium text-foreground">Insurance Details</h3>

              <div className="space-y-1">
                <Label htmlFor="insuranceProvider" className="text-foreground text-sm">Provider Name</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="insuranceProvider"
                    placeholder="e.g. LIC, Bajaj Allianz"
                    value={(formData as any).insuranceProvider}
                    onChange={updateField('insuranceProvider')}
                    className="pl-9 bg-secondary border-border focus:border-primary h-9"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="policyNumber" className="text-foreground text-sm">Policy Number</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="policyNumber"
                      placeholder="Policy No."
                      value={(formData as any).policyNumber}
                      onChange={updateField('policyNumber')}
                      className="pl-9 bg-secondary border-border focus:border-primary h-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="policyValidity" className="text-foreground text-sm">Validity Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="policyValidity"
                      type="date"
                      value={(formData as any).policyValidity}
                      onChange={updateField('policyValidity')}
                      className="pl-9 bg-secondary border-border focus:border-primary h-9"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>



            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold neon-glow mt-2"
            >
              {isLoading ? 'Registering...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
