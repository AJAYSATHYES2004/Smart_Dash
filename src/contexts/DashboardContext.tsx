import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { carService } from '@/services/api';
import { useAuth } from './AuthContext';
import { audioEngine } from '@/utils/AudioEngine';

type Zone = 'normal' | 'school' | 'hospital' | 'traffic';

interface ZoneConfig {
  name: string;
  maxSpeed: number | null;
  maxVolume: number | null;
  alert: string;
}

const ZONE_CONFIGS: Record<Zone, ZoneConfig> = {
  normal: { name: 'Normal Zone', maxSpeed: null, maxVolume: null, alert: '' },
  school: { name: 'School Zone', maxSpeed: 30, maxVolume: null, alert: 'School Zone – Speed limited to 30 km/h' },
  hospital: { name: 'Hospital Zone', maxSpeed: 30, maxVolume: 40, alert: 'Hospital Zone – Speed & Volume Restricted' },
  traffic: { name: 'Traffic Zone', maxSpeed: null, maxVolume: null, alert: 'Traffic Ahead – Take diversion to best route' },
};

interface VehicleStatus {
  petrolLevel: number;
  oilLevel: number;
  totalKm: number;
  engineTemp: number;
}

interface CarDetails {
  engineNumber: string;
  carId: string;
  ownerName: string;
  ownerProofImage: string | null;
  policyNumber: string;
  insuranceValidity: string;
  rcBookImage: string | null;
  registrationDate: string;
}

interface DashboardContextType {
  // Speed Control
  speed: number;
  setSpeed: (speed: number) => void;
  increaseSpeed: () => void;
  decreaseSpeed: () => void;
  emergencyBrake: () => void;

  // Engine
  engineOn: boolean;
  toggleEngine: () => void;

  // Controls
  leftIndicator: boolean;
  rightIndicator: boolean;
  headlights: boolean;
  wipers: boolean;
  toggleLeftIndicator: () => void;
  toggleRightIndicator: () => void;
  toggleHeadlights: () => void;
  toggleWipers: () => void;
  honk: () => void;
  isHonking: boolean;

  // Zone
  currentZone: Zone;
  setCurrentZone: (zone: Zone) => void;
  zoneConfig: ZoneConfig;
  zoneAlert: string | null;

  // Volume
  volume: number;
  setVolume: (volume: number) => void;

  // Vehicle Status
  vehicleStatus: VehicleStatus;

  // Car Details
  carDetails: CarDetails;
  updateCarDetails: (data: Partial<CarDetails>) => void;

  // Emergency
  isEmergency: boolean;
  showEmergencyAlert: boolean;
  dismissEmergencyAlert: () => void;

  // Fines
  totalFines: number;
  resetFines: () => void;

  // Drowsiness Detection
  drowsinessEvents: Array<{ timestamp: Date; duration: number; severity: string }>;
  logDrowsinessEvent: (event: { timestamp: Date; duration: number; severity: string }) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authenticatedCar } = useAuth();

  // Speed & Engine
  const [speed, setSpeedState] = useState(0);
  const [engineOn, setEngineOn] = useState(false);

  // Controls
  const [leftIndicator, setLeftIndicator] = useState(false);
  const [rightIndicator, setRightIndicator] = useState(false);
  const [headlights, setHeadlights] = useState(false);
  const [wipers, setWipers] = useState(false);
  const [isHonking, setIsHonking] = useState(false);

  // Zone
  const [currentZone, setCurrentZoneState] = useState<Zone>('normal');
  const [zoneAlert, setZoneAlert] = useState<string | null>(null);

  // Volume
  const [volume, setVolumeState] = useState(70);

  // Emergency
  const [isEmergency, setIsEmergency] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);

  // Fines
  const [totalFines, setTotalFines] = useState(0);

  // Drowsiness Events
  const [drowsinessEvents, setDrowsinessEvents] = useState<Array<{ timestamp: Date; duration: number; severity: string }>>([]);

  // Vehicle Status
  const [vehicleStatus] = useState<VehicleStatus>({
    petrolLevel: 75,
    oilLevel: 85,
    totalKm: 45892,
    engineTemp: 90,
  });

  // Car Details - Initialize from authenticated car or use defaults
  const [carDetails, setCarDetails] = useState<CarDetails>(() => {
    if (authenticatedCar) {
      return {
        engineNumber: authenticatedCar.engineNumber,
        carId: authenticatedCar.carId,
        ownerName: authenticatedCar.ownerName,
        ownerProofImage: null,
        policyNumber: authenticatedCar.policyNumber,
        insuranceValidity: authenticatedCar.insuranceValidity,
        rcBookImage: null,
        registrationDate: authenticatedCar.registrationDate,
      };
    }
    return {
      engineNumber: 'ENG-2024-A7X9K2M',
      carId: 'CAR-78542-XYZ',
      ownerName: 'Alex Johnson',
      ownerProofImage: null,
      policyNumber: 'INS-2024-456789',
      insuranceValidity: '2025-12-31',
      rcBookImage: null,
      registrationDate: '2022-03-15',
    };
  });

  const zoneConfig = ZONE_CONFIGS[currentZone];

  // Update car details when authenticated car changes and fetch latest data
  useEffect(() => {
    if (authenticatedCar) {
      setCarDetails({
        engineNumber: authenticatedCar.engineNumber,
        carId: authenticatedCar.carId,
        ownerName: authenticatedCar.ownerName,
        ownerProofImage: null,
        policyNumber: authenticatedCar.policyNumber,
        insuranceValidity: authenticatedCar.insuranceValidity,
        rcBookImage: null,
        registrationDate: authenticatedCar.registrationDate,
      });

      // Fetch latest driving data from backend
      carService.getDetails(authenticatedCar.numberPlate).then(res => {
        if (res.data && res.data.driving_data) {
          // Update local state with backed data if implemented
          // For now we just log, or we could setVehicleStatus if we added a setter
        }
      }).catch(err => console.error("Failed to sync car data", err));
    }
  }, [authenticatedCar]);

  // Sync Data to Backend (Simple Debounce or on Unmount/Change)
  useEffect(() => {
    if (authenticatedCar && engineOn) {
      const timer = setInterval(() => {
        carService.updateData(authenticatedCar.numberPlate, {
          driving_data: {
            speed,
            petrol: vehicleStatus.petrolLevel,
            oil: vehicleStatus.oilLevel,
            kilometers: vehicleStatus.totalKm
          }
        }).catch(e => console.error("Sync error", e));
      }, 5000); // Sync every 5 seconds
      return () => clearInterval(timer);
    }
  }, [authenticatedCar, engineOn, speed, vehicleStatus]);

  // Apply zone restrictions and calculate fines
  useEffect(() => {
    if (zoneConfig.maxSpeed && speed > zoneConfig.maxSpeed) {
      const overspeed = speed - zoneConfig.maxSpeed;
      // Calculate fine: ₹100 per km/h over the limit
      const fineAmount = overspeed * 100;
      setTotalFines(prev => prev + fineAmount);
      setSpeedState(zoneConfig.maxSpeed);
      setZoneAlert(zoneConfig.alert);
      audioEngine.speak(`Warning! You are in a ${zoneConfig.name}. Speed restricted to ${zoneConfig.maxSpeed} kilometers per hour.`);

      if (authenticatedCar) {
        carService.addFine(authenticatedCar.numberPlate, {
          amount: fineAmount,
          reason: `Overspeeding in ${zoneConfig.name}`,
          date: new Date(),
          time: new Date().toLocaleTimeString(),
          last_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days later
        }).catch(err => console.error("Fine sync error", err));
      }
    }
    if (zoneConfig.maxVolume && volume > zoneConfig.maxVolume) {
      setVolumeState(zoneConfig.maxVolume);
    }
    if (currentZone === 'traffic') {
      setZoneAlert(zoneConfig.alert);
    }
  }, [currentZone, speed, volume, zoneConfig]);

  const setSpeed = useCallback((newSpeed: number) => {
    if (!engineOn) return;
    const maxAllowed = zoneConfig.maxSpeed || 240;
    const clampedSpeed = Math.max(0, Math.min(newSpeed, maxAllowed));
    setSpeedState(clampedSpeed);
    audioEngine.setSpeed(clampedSpeed);
  }, [engineOn, zoneConfig.maxSpeed]);

  const increaseSpeed = useCallback(() => {
    if (!engineOn) return;
    setSpeed(speed + 5);
  }, [engineOn, speed, setSpeed]);

  const decreaseSpeed = useCallback(() => {
    setSpeed(speed - 5);
  }, [speed, setSpeed]);

  const emergencyBrake = useCallback(() => {
    setSpeedState(0);
    audioEngine.setSpeed(0);
    setIsEmergency(true);
    setShowEmergencyAlert(true);
    setTimeout(() => setIsEmergency(false), 500);
  }, []);

  const toggleEngine = useCallback(async () => {
    if (engineOn) {
      setEngineOn(false);
      setSpeedState(0);
      audioEngine.stop();
    } else {
      setEngineOn(true);
      await audioEngine.start();
    }
  }, [engineOn]);

  const toggleLeftIndicator = useCallback(() => {
    setLeftIndicator(prev => !prev);
    if (!leftIndicator) setRightIndicator(false);
  }, [leftIndicator]);

  const toggleRightIndicator = useCallback(() => {
    setRightIndicator(prev => !prev);
    if (!rightIndicator) setLeftIndicator(false);
  }, [rightIndicator]);

  const toggleHeadlights = useCallback(() => setHeadlights(prev => !prev), []);
  const toggleWipers = useCallback(() => setWipers(prev => !prev), []);

  const honk = useCallback(() => {
    setIsHonking(true);
    setTimeout(() => setIsHonking(false), 300);
  }, []);

  const setCurrentZone = useCallback((zone: Zone) => {
    setCurrentZoneState(zone);
    if (zone !== 'normal') {
      const alert = ZONE_CONFIGS[zone].alert;
      setZoneAlert(alert);
      audioEngine.speak(`Entering ${ZONE_CONFIGS[zone].name}. ${alert}`);
    } else {
      setZoneAlert(null);
      audioEngine.speak("Exiting restricted zone. Drive safely.");
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const maxAllowed = zoneConfig.maxVolume || 100;
    setVolumeState(Math.max(0, Math.min(vol, maxAllowed)));
  }, [zoneConfig.maxVolume]);

  const dismissEmergencyAlert = useCallback(() => {
    setShowEmergencyAlert(false);
  }, []);

  const updateCarDetails = useCallback((data: Partial<CarDetails>) => {
    setCarDetails(prev => ({ ...prev, ...data }));
  }, []);

  const resetFines = useCallback(() => {
    setTotalFines(0);
  }, []);

  const logDrowsinessEvent = useCallback((event: { timestamp: Date; duration: number; severity: string }) => {
    setDrowsinessEvents(prev => [...prev, event]);

    if (authenticatedCar) {
      carService.updateData(authenticatedCar.numberPlate, {
        safety_logs: {
          drowsiness_events: [{
            timestamp: event.timestamp,
            duration: event.duration,
            severity: event.severity
          }]
        }
      }).catch(err => console.error("Failed to log drowsiness event", err));
    }
  }, [authenticatedCar]);

  return (
    <DashboardContext.Provider value={{
      speed,
      setSpeed,
      increaseSpeed,
      decreaseSpeed,
      emergencyBrake,
      engineOn,
      toggleEngine,
      leftIndicator,
      rightIndicator,
      headlights,
      wipers,
      toggleLeftIndicator,
      toggleRightIndicator,
      toggleHeadlights,
      toggleWipers,
      honk,
      isHonking,
      currentZone,
      setCurrentZone,
      zoneConfig,
      zoneAlert,
      volume,
      setVolume,
      vehicleStatus,
      carDetails,
      updateCarDetails,
      isEmergency,
      showEmergencyAlert,
      dismissEmergencyAlert,
      totalFines,
      resetFines,
      drowsinessEvents,
      logDrowsinessEvent,
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
