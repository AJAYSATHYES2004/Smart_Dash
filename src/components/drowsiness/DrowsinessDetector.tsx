import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { AlertTriangle, Camera, CameraOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DrowsinessDetectorProps {
    onDrowsinessDetected: (event: { timestamp: Date; duration: number; severity: string }) => void;
    onDistractionDetected: (event: { timestamp: Date; duration: number; type: string; severity: string }) => void;
    engineOn?: boolean;
}

const DrowsinessDetector: React.FC<DrowsinessDetectorProps> = ({
    onDrowsinessDetected,
    onDistractionDetected,
    engineOn = false
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Drowsiness State
    const [isDrowsy, setIsDrowsy] = useState(false);
    const [eyesClosedFrames, setEyesClosedFrames] = useState(0);
    const drowsinessStartRef = useRef<Date | null>(null);

    // Distraction State
    const [isDistracted, setIsDistracted] = useState(false);
    const [distractedFrames, setDistractedFrames] = useState(0);
    const distractionStartRef = useRef<Date | null>(null);
    const [distractionType, setDistractionType] = useState<string>('');

    // Auto start/stop monitoring based on engine state
    useEffect(() => {
        if (!isModelLoaded) return;
        if (engineOn) startCamera();
        else stopCamera();
        return () => stopCamera();
    }, [engineOn, isModelLoaded]);

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                setIsModelLoaded(true);
            } catch (err) {
                setError('Failed to load face detection models');
                console.error(err);
            }
        };
        loadModels();
    }, []);

    // Calculate Eye Aspect Ratio (EAR)
    const calculateEAR = (eye: faceapi.Point[]) => {
        const A = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
        const B = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
        const C = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
        return (A + B) / (2.0 * C);
    };

    // Estimate head pose from landmarks
    // Yaw: Nose relative to horizontal center of eyes
    // Pitch: Nose relative to vertical center of eyes
    const estimatePose = (landmarks: faceapi.FaceLandmarks68) => {
        const nose = landmarks.getNose()[0];
        const leftEye = landmarks.getLeftEye()[0];
        const rightEye = landmarks.getRightEye()[3];

        // Horizontal eye distance
        const eyeDist = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);

        // Midpoint between eyes
        const eyeMidX = (leftEye.x + rightEye.x) / 2;
        const eyeMidY = (leftEye.y + rightEye.y) / 2;

        // Relative horizontal displacement (Yaw approximation)
        const yaw = (nose.x - eyeMidX) / eyeDist;

        // Relative vertical displacement (Pitch approximation)
        const pitch = (nose.y - eyeMidY) / eyeDist;

        return { yaw, pitch };
    };

    // Start camera
    const startCamera = async () => {
        if (isCameraActive) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
                setError(null);
            }
        } catch (err) {
            setError('Camera access denied');
            console.error(err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraActive(false);
        }
    };

    // Dual Detection Loop
    useEffect(() => {
        if (!isCameraActive || !isModelLoaded || !engineOn) return;

        const processFrame = async () => {
            if (videoRef.current && canvasRef.current) {
                const detections = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks();

                if (detections) {
                    const landmarks = detections.landmarks;

                    // 1. EAR CHECK (Drowsiness)
                    const leftEAR = calculateEAR(landmarks.getLeftEye());
                    const rightEAR = calculateEAR(landmarks.getRightEye());
                    const avgEAR = (leftEAR + rightEAR) / 2;
                    const EAR_THRESHOLD = 0.25; // Reverted to previous value for better accuracy/preference

                    if (avgEAR < EAR_THRESHOLD) {
                        setEyesClosedFrames(prev => prev + 1);
                        if (eyesClosedFrames >= 3) { // ~300ms
                            if (!isDrowsy) {
                                setIsDrowsy(true);
                                drowsinessStartRef.current = new Date();
                                playAlert();
                            }
                        }
                    } else {
                        if (isDrowsy && drowsinessStartRef.current) {
                            const duration = new Date().getTime() - drowsinessStartRef.current.getTime();
                            onDrowsinessDetected({
                                timestamp: drowsinessStartRef.current,
                                duration,
                                severity: duration > 2000 ? 'high' : 'medium'
                            });
                        }
                        setEyesClosedFrames(0);
                        setIsDrowsy(false);
                        drowsinessStartRef.current = null;
                    }

                    // 2. POSE CHECK (Distraction)
                    const { yaw, pitch } = estimatePose(landmarks);
                    const YAW_THRESHOLD = 0.45; // Looking aside
                    const PITCH_THRESHOLD = 0.4; // Looking down

                    let currentDistraction = '';
                    if (Math.abs(yaw) > YAW_THRESHOLD) currentDistraction = 'Looking Aside';
                    else if (pitch > PITCH_THRESHOLD) currentDistraction = 'Looking Down';

                    if (currentDistraction) {
                        setDistractionType(currentDistraction);
                        setDistractedFrames(prev => prev + 1);
                        if (distractedFrames >= 5) { // ~500ms
                            if (!isDistracted) {
                                setIsDistracted(true);
                                distractionStartRef.current = new Date();
                                if (!isDrowsy) playAlert(); // Only play if not already alerting for drowsiness
                            }
                        }
                    } else {
                        if (isDistracted && distractionStartRef.current) {
                            const duration = new Date().getTime() - distractionStartRef.current.getTime();
                            onDistractionDetected({
                                timestamp: distractionStartRef.current,
                                duration,
                                type: distractionType,
                                severity: duration > 3000 ? 'high' : 'medium'
                            });
                        }
                        setDistractedFrames(0);
                        setIsDistracted(false);
                        setDistractionType('');
                        distractionStartRef.current = null;
                    }

                    // Draw landmarks
                    const canvas = canvasRef.current;
                    const displaySize = { width: videoRef.current.width, height: videoRef.current.height };
                    faceapi.matchDimensions(canvas, displaySize);
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                    }
                }
            }
        };

        const interval = setInterval(processFrame, 100);
        return () => clearInterval(interval);
    }, [isCameraActive, isModelLoaded, engineOn, eyesClosedFrames, isDrowsy, distractedFrames, isDistracted, distractionType, onDrowsinessDetected, onDistractionDetected]);

    const playAlert = () => {
        const audio = new Audio('/alert.mp3');
        audio.play().catch(() => {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            oscillator.connect(ctx.destination);
            oscillator.frequency.value = 800;
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.3);
        });
    };

    return (
        <Card className={`${(isDrowsy || isDistracted) ? 'border-red-500 border-4 animate-pulse' : ''}`}>
            <CardHeader className="py-3">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Safety Monitor
                    </div>
                    {engineOn ? (
                        <span className="text-[10px] flex items-center gap-1 text-green-500 font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Active
                        </span>
                    ) : (
                        <span className="text-[10px] flex items-center gap-1 text-muted-foreground font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            Stopped
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-sm">{error}</div>}
                {!isModelLoaded && <div className="text-sm text-muted-foreground">Loading AI models...</div>}

                <div className="relative aspect-video">
                    <video ref={videoRef} autoPlay muted width="640" height="480" className="w-full h-full rounded-lg bg-black object-cover" style={{ display: isCameraActive ? 'block' : 'none' }} />
                    <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ display: isCameraActive ? 'block' : 'none' }} />

                    {!isCameraActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-lg border border-white/5 backdrop-blur-sm">
                            <CameraOff className="w-12 h-12 text-muted-foreground opacity-50 mb-2" />
                            <p className="text-xs text-muted-foreground font-medium">{!engineOn ? "Start Engine to Begin" : "Initializing..."}</p>
                        </div>
                    )}

                    {(isDrowsy || isDistracted) && (
                        <div className="absolute top-4 left-4 right-4 p-3 bg-red-500/80 border-2 border-red-500 rounded-lg backdrop-blur-md z-10 animate-pulse shadow-2xl">
                            <p className="text-white font-black text-center text-xs tracking-widest uppercase">
                                ⚠️ {isDrowsy ? "DROWSINESS DETECTED" : `DISTRACTION: ${distractionType}`} ⚠️
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className={`p-2 rounded border ${isDrowsy ? 'bg-red-500/20 border-red-500' : 'bg-secondary/30 border-border'}`}>
                        <p className="text-[8px] uppercase tracking-tighter text-muted-foreground">Drowsiness</p>
                        <p className={`text-[10px] font-bold ${isDrowsy ? 'text-red-500' : 'text-success'}`}>{isDrowsy ? 'ALERT' : 'CLEAR'}</p>
                    </div>
                    <div className={`p-2 rounded border ${isDistracted ? 'bg-red-500/20 border-red-500' : 'bg-secondary/30 border-border'}`}>
                        <p className="text-[8px] uppercase tracking-tighter text-muted-foreground">Distraction</p>
                        <p className={`text-[10px] font-bold ${isDistracted ? 'text-red-500' : 'text-success'}`}>{isDistracted ? 'ALERT' : 'CLEAR'}</p>
                    </div>
                </div>

                {!engineOn && (
                    <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                        <p className="text-[10px] text-center text-muted-foreground italic">Automation enabled. Starts with engine.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DrowsinessDetector;
