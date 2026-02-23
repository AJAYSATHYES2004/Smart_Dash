import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Lock, Eye, EyeOff, Hash } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CarLogin = () => {
    const navigate = useNavigate();
    const { loginCar } = useAuth();
    const [numberPlate, setNumberPlate] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [showSecretCode, setShowSecretCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const success = await loginCar(numberPlate, secretCode);
        if (success) {
            // Check if insurance details are missing
            const savedCar = localStorage.getItem('authenticatedCar');
            if (savedCar) {
                const carDetails = JSON.parse(savedCar);
                if (!carDetails.policyNumber) {
                    // Redirect to insurance page for onboarding
                    navigate('/insurance?mode=onboarding');
                    return;
                }
            }
            navigate('/login');
        } else {
            setError('Invalid car credentials. Please check your number plate and secret code.');
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
                        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary overflow-hidden border-2 border-primary neon-glow mb-4"
                    >
                        <img src="/logo.png" alt="Smart Dash Logo" className="w-full h-full object-cover" />
                    </motion.div>
                    <h1 className="text-3xl font-display font-bold text-foreground neon-text">
                        Car Authentication
                    </h1>
                    <p className="text-muted-foreground mt-2">Step 1: Verify your vehicle</p>
                    <div className="mt-4 px-4 py-2 rounded-lg bg-secondary/50 border border-border inline-block">
                        <p className="text-xs text-muted-foreground">
                            🔐 Enter your car's number plate and secret code
                        </p>
                    </div>
                </div>

                {/* Car Login Form */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="dashboard-card"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="numberPlate" className="text-foreground">
                                Car Number Plate
                            </Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="numberPlate"
                                    type="text"
                                    placeholder="e.g., KA-01-AB-1234"
                                    value={numberPlate}
                                    onChange={(e) => setNumberPlate(e.target.value.toUpperCase())}
                                    className="pl-10 bg-secondary border-border focus:border-primary focus:ring-primary uppercase"
                                    required
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter your vehicle registration number
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="secretCode" className="text-foreground">
                                Secret Car Code
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    id="secretCode"
                                    type={showSecretCode ? 'text' : 'password'}
                                    placeholder="Enter secret code"
                                    value={secretCode}
                                    onChange={(e) => setSecretCode(e.target.value)}
                                    className="pl-10 pr-10 bg-secondary border-border focus:border-primary focus:ring-primary"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSecretCode(!showSecretCode)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showSecretCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Provided by the car owner
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-destructive/10 border border-destructive"
                            >
                                <p className="text-destructive text-sm">{error}</p>
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold neon-glow"
                        >
                            {isLoading ? 'Verifying Car...' : 'Authenticate Car'}
                        </Button>
                    </form>

                    <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border">
                        <p className="text-xs text-muted-foreground text-center">
                            <strong className="text-foreground">Test Credentials:</strong><br />
                            Number Plate: <code className="text-primary">DL-01-AB-1234</code><br />
                            Secret Code: <code className="text-primary">secret123</code>
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm">
                            Don't have a car registered?{' '}
                            <Link to="/car-signup" className="text-primary hover:underline font-medium">
                                Register New Vehicle
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 text-center"
                >
                    <p className="text-xs text-muted-foreground">
                        🔒 Secure two-step authentication • Car first, then driver
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default CarLogin;
