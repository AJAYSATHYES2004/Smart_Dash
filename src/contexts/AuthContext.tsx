import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService, carService } from '@/services/api';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  licenseNumber: string;
  profilePhoto: string | null;
  emergencyContact: string;
  faceData: string | null; // Base64 encoded face image
}

export interface CarDetails {
  carId: string;
  numberPlate: string;
  ownerName: string;
  ownerContact: string;
  ownerProofImage?: string;
  engineNumber?: string;
  insurance?: string;
  rcBook?: string;
  policyNumber: string;
  insuranceValidity: string;
  registrationDate: string;
}

interface AuthContextType {
  // Car Authentication
  isCarAuthenticated: boolean;
  authenticatedCar: CarDetails | null;
  loginCar: (numberPlate: string, secretCode: string) => Promise<boolean>;
  logoutCar: () => void;

  // User Authentication
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithFace: (faceData: string) => Promise<boolean>;
  signup: (userData: Omit<UserProfile, 'emergencyContact' | 'faceData'> & { password: string }) => Promise<boolean>;
  registerFace: (faceData: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  registerCar: (carData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Car Authentication State
  const [isCarAuthenticated, setIsCarAuthenticated] = useState(() => {
    return localStorage.getItem('isCarAuthenticated') === 'true';
  });
  const [authenticatedCar, setAuthenticatedCar] = useState<CarDetails | null>(() => {
    const saved = localStorage.getItem('authenticatedCar');
    return saved ? JSON.parse(saved) : null;
  });

  // User Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Effects to persist state
  useEffect(() => {
    localStorage.setItem('isCarAuthenticated', isCarAuthenticated.toString());
  }, [isCarAuthenticated]);

  useEffect(() => {
    if (authenticatedCar) {
      localStorage.setItem('authenticatedCar', JSON.stringify(authenticatedCar));
    } else {
      localStorage.removeItem('authenticatedCar');
    }
  }, [authenticatedCar]);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const loginCar = async (numberPlate: string, secretCode: string): Promise<boolean> => {
    try {
      const response = await carService.login({ numberPlate, secretCode });
      if (response.data) {
        setIsCarAuthenticated(true);
        // Map backend response to context shape if needed, or adjust interface
        // For now, assuming direct mapping or close enough
        setAuthenticatedCar(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Car login failed:', error);
      return false;
    }
  };

  const logoutCar = () => {
    setIsCarAuthenticated(false);
    setAuthenticatedCar(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      if (response.data && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const loginWithFace = async (faceData: string): Promise<boolean> => {
    try {
      // Backend handles sending the face data to verify.
      // For now we assume verify means "find user with this face"
      const response = await authService.loginFace(faceData);
      if (response.data && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Face login failed", error);
      return false;
    }
  };

  const signup = async (userData: Omit<UserProfile, 'emergencyContact' | 'faceData'> & { password: string }): Promise<boolean> => {
    try {
      // Map frontend user data to backend expected format
      // Note: Backend expects 'phone' and 'licenseNumber' etc.
      const response = await authService.register(userData);
      if (response.data && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  };

  const registerFace = (faceData: string) => {
    if (user) {
      // In a real app we'd call an API to update the user profile
      setUser({ ...user, faceData });
      // TODO: Call API to update face data
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setIsCarAuthenticated(false);
    setAuthenticatedCar(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const registerCar = async (carData: any): Promise<boolean> => {
    try {
      const response = await carService.register(carData);
      if (response.data) {
        // Optionally auto-login
        setIsCarAuthenticated(true);
        setAuthenticatedCar(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Car registration failed", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      isCarAuthenticated,
      authenticatedCar,
      loginCar,
      logoutCar,
      isAuthenticated,
      user,
      login,
      loginWithFace,
      signup,
      registerFace,
      logout,
      updateProfile,
      registerCar
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
