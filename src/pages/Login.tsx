import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Car, Scan } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FaceRecognition from '@/components/auth/FaceRecognition';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithFace, authenticatedCar, logoutCar } = useAuth();
  const [authMethod, setAuthMethod] = useState<'password' | 'face'>('password');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangeCar = () => {
    logoutCar();
    navigate('/car-login');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(emailOrPhone, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
    setIsLoading(false);
  };

  const handleFaceLogin = async (faceData: string) => {
    setIsLoading(true);
    setError('');

    const success = await loginWithFace(faceData);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Face not recognized. Please try again or use password login.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-dashboard flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary border-2 border-primary neon-glow mb-4"
          >
            <Car className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-foreground neon-text">
            AutoDash
          </h1>
          <p className="text-muted-foreground mt-2">Step 2: Driver Login</p>

          {/* Authenticated Car Display */}
          {authenticatedCar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 px-4 py-3 rounded-lg bg-secondary border border-primary inline-flex items-center gap-3"
            >
              <Car className="w-5 h-5 text-primary" />
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

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="dashboard-card"
        >
          {/* Auth Method Toggle */}
          <div className="flex gap-2 p-1 bg-secondary rounded-lg mb-6">
            <button
              onClick={() => setAuthMethod('password')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${authMethod === 'password'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </button>
            <button
              onClick={() => setAuthMethod('face')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${authMethod === 'face'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              <Scan className="w-4 h-4 inline mr-2" />
              Face
            </button>
          </div>

          <AnimatePresence mode="wait">
            {authMethod === 'password' ? (
              <motion.form
                key="password-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePasswordLogin}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="emailOrPhone" className="text-foreground">
                    Email / Phone
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="emailOrPhone"
                      type="text"
                      placeholder="Enter email or phone"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="pl-10 bg-secondary border-border focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-secondary border-border focus:border-primary focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
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
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold neon-glow"
                >
                  {isLoading ? 'Starting Engine...' : 'Login'}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="face-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <FaceRecognition
                  mode="login"
                  onCapture={handleFaceLogin}
                  onCancel={() => setAuthMethod('password')}
                  isLoading={isLoading}
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-destructive text-sm mt-4"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              New driver?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
