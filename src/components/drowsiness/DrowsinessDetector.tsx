import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { AlertTriangle, Camera, CameraOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DrowsinessDetectorProps {
    onDrowsinessDetected: (event: { timestamp: Date; duration: number; severity: string }) => void;
}

const DrowsinessDetector: React.FC<DrowsinessDetectorProps> = ({ onDrowsinessDetected }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDrowsy, setIsDrowsy] = useState(false);
    const [eyesClosed, setEyesClosed] = useState(0);
    const drowsinessStartRef = useRef<Date | null>(null);

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models'; // Models should be in public/models
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

    // Start camera
    const startCamera = async () => {
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
            setError('Camera access denied. Please grant camera permissions.');
            console.error(err);
        }
    };

    // Stop camera
    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraActive(false);
        }
    };

    // Detect drowsiness
    useEffect(() => {
        if (!isCameraActive || !isModelLoaded) return;

        const detectDrowsiness = async () => {
            if (videoRef.current && canvasRef.current) {
                const detections = await faceapi
                    .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                    .withFaceLandmarks();

                if (detections) {
                    const landmarks = detections.landmarks;
                    const leftEye = landmarks.getLeftEye();
                    const rightEye = landmarks.getRightEye();

                    const leftEAR = calculateEAR(leftEye);
                    const rightEAR = calculateEAR(rightEye);
                    const avgEAR = (leftEAR + rightEAR) / 2;

                    // Threshold for closed eyes
                    const EAR_THRESHOLD = 0.25;

                    if (avgEAR < EAR_THRESHOLD) {
                        setEyesClosed(prev => prev + 1);

                        // Drowsy if eyes closed for 3+ frames (~100ms)
                        if (eyesClosed >= 3) {
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
                        setEyesClosed(0);
                        setIsDrowsy(false);
                        drowsinessStartRef.current = null;
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

        const interval = setInterval(detectDrowsiness, 100);
        return () => clearInterval(interval);
    }, [isCameraActive, isModelLoaded, eyesClosed, isDrowsy, onDrowsinessDetected]);

    const playAlert = () => {
        const audio = new Audio('/alert.mp3'); // Add alert sound to public folder
        audio.play().catch(() => {
            // Fallback to beep if audio file not found
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            oscillator.connect(ctx.destination);
            oscillator.frequency.value = 800;
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.3);
        });
    };

    return (
        <Card className={`${isDrowsy ? 'border-red-500 border-4 animate-pulse' : ''}`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Drowsiness Monitor
                    {isDrowsy && <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {!isModelLoaded && (
                    <div className="text-sm text-muted-foreground">Loading detection models...</div>
                )}

                <div className="relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        width="640"
                        height="480"
                        className="rounded-lg bg-black"
                        style={{ display: isCameraActive ? 'block' : 'none' }}
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0"
                        style={{ display: isCameraActive ? 'block' : 'none' }}
                    />

                    {!isCameraActive && (
                        <div className="flex items-center justify-center h-64 bg-secondary rounded-lg">
                            <CameraOff className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}
                </div>

                {isDrowsy && (
                    <div className="p-4 bg-red-500/20 border-2 border-red-500 rounded-lg">
                        <p className="text-red-500 font-bold text-center text-lg">
                            ⚠️ DROWSINESS DETECTED! STAY ALERT! ⚠️
                        </p>
                    </div>
                )}

                <div className="flex gap-2">
                    {!isCameraActive ? (
                        <Button onClick={startCamera} disabled={!isModelLoaded} className="w-full">
                            <Camera className="w-4 h-4 mr-2" />
                            Start Monitoring
                        </Button>
                    ) : (
                        <Button onClick={stopCamera} variant="destructive" className="w-full">
                            <CameraOff className="w-4 h-4 mr-2" />
                            Stop Monitoring
                        </Button>
                    )}
                </div>

                <div className="text-xs text-muted-foreground text-center">
                    Eye Closure Frames: {eyesClosed} / 3
                </div>
            </CardContent>
        </Card>
    );
};

export default DrowsinessDetector;
