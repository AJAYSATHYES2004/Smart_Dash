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
  faceDescriptor?: number[]; // Array of 128 floats
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
    validity: Date;
  };
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
  loginWithFace: (faceData: string, faceDescriptor?: Float32Array) => Promise<boolean>;
  signup: (userData: Omit<UserProfile, 'emergencyContact' | 'faceData'> & {
    password: string;
    faceDescriptor?: Float32Array;
    insuranceDetails?: {
      provider: string;
      policyNumber: string;
      validity: string;
    };
  }) => Promise<{ success: boolean, message?: string }>;
  registerFace: (faceData: string, faceDescriptor?: Float32Array) => void;
  logout: () => void; // ... existing properties
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
      console.log('Attempting login with:', { numberPlate, secretCode });
      const response = await carService.login({ numberPlate, secretCode });
      console.log('Login response:', response);

      // axios successful response
      if (response && response.data) {
        setIsCarAuthenticated(true);
        // Transform backend response to match CarDetails interface
        const backendData = response.data;
        console.log('Backend data:', backendData);

        const carDetails: CarDetails = {
          carId: backendData.car_id,
          numberPlate: backendData.number_plate,
          ownerName: backendData.owner_details?.name || '',
          ownerContact: backendData.owner_details?.contact || '',
          ownerProofImage: backendData.owner_details?.proof_image,
          engineNumber: backendData.car_details?.engine_number,
          insurance: backendData.car_details?.insurance?._id || '',
          rcBook: backendData.car_details?.rc_book?._id || '',
          policyNumber: backendData.car_details?.insurance?.policyNumber || '',
          insuranceValidity: backendData.car_details?.insurance?.validity || '',
          registrationDate: backendData.car_details?.rc_book?.registrationDate || '',
        };
        console.log('Transformed car details:', carDetails);
        setAuthenticatedCar(carDetails);
        return true;
      }
      console.log('No data in response');
      return false;
    } catch (error: any) {
      console.error('Car login error caught:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
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

  const loginWithFace = async (faceData: string, faceDescriptor?: Float32Array): Promise<boolean> => {
    try {
      // Ensure descriptor is an array for API transmission
      const descriptorArray = faceDescriptor ? Array.from(faceDescriptor) : undefined;

      if (!descriptorArray || descriptorArray.length !== 128) {
        console.error('Invalid face descriptor length:', descriptorArray?.length);
        return false;
      }

      const payload = {
        faceData,
        faceDescriptor: descriptorArray
      };

      console.log('Attempting face login with descriptor length:', descriptorArray.length);

      const response = await authService.loginFace(payload);
      if (response.data && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        console.log('Face login successful for user:', response.data.user.email);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Face login failed", error);
      return false;
    }
  };

  const signup = async (userData: Omit<UserProfile, 'emergencyContact' | 'faceData'> & { password: string, faceDescriptor?: Float32Array }): Promise<{ success: boolean, message?: string }> => {
    try {
      // Convert Float32Array to regular array for transmission
      let descriptorArray = undefined;
      if (userData.faceDescriptor) {
        descriptorArray = Array.from(userData.faceDescriptor);
        if (descriptorArray.length !== 128) {
          console.warn('Face descriptor has unexpected length:', descriptorArray.length);
        }
      }

      // Map frontend user data to backend expected format
      const payload = {
        ...userData,
        faceDescriptor: descriptorArray
      };

      console.log('Registering user with face descriptor:', descriptorArray ? descriptorArray.length : 'none');

      const response = await authService.register(payload);
      if (response.data && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
        console.log('User registered successfully with face:', response.data.faceRegistered);
        return { success: true };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error: any) {
      console.error('Signup failed:', error);
      const msg = error.response?.data?.msg || 'Registration failed. Please try again.';
      return { success: false, message: msg };
    }
  };

  const registerFace = (faceData: string, faceDescriptor?: Float32Array) => {
    if (user) {
      // In a real app we'd call an API to update the user profile
      // setUser({ ...user, faceData });
      // For now, this is just a local state update helper if subsequent logic needs it, 
      // but usually face is registered during signup or a specific profile update flow.
      console.log("Face registered locally for session", faceDescriptor);
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
        setIsCarAuthenticated(true);

        // Transform backend response to match CarDetails interface
        const backendData = response.data;
        const carDetails: CarDetails = {
          carId: backendData.car_id,
          numberPlate: backendData.number_plate,
          ownerName: backendData.owner_details?.name || '',
          ownerContact: backendData.owner_details?.contact || '',
          ownerProofImage: backendData.owner_details?.proof_image,
          engineNumber: backendData.car_details?.engine_number,
          insurance: backendData.car_details?.insurance?._id || '',
          rcBook: backendData.car_details?.rc_book?._id || '',
          policyNumber: backendData.car_details?.insurance?.policyNumber || '',
          insuranceValidity: backendData.car_details?.insurance?.validity || '',
          registrationDate: backendData.car_details?.rc_book?.registrationDate || '',
        };

        setAuthenticatedCar(carDetails);
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
