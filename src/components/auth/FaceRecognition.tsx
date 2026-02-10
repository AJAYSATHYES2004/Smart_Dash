import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FaceRecognitionProps {
    mode: 'login' | 'register';
    onCapture: (faceData: string) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({
    mode,
    onCapture,
    onCancel,
    isLoading = false
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [error, setError] = useState<string>('');
    const [capturing, setCapturing] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup: stop camera when component unmounts
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            setError('');
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
                setCameraActive(true);
            }
        } catch (err) {
            console.error('Camera access error:', err);
            setError('Unable to access camera. Please check permissions and try again.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraActive(false);
        }
    };

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        setCapturing(true);
        setCountdown(3);

        // Countdown before capture
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(countdownInterval);
                    performCapture();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const performCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg', 0.8);

            // Stop camera after capture
            stopCamera();
            setCapturing(false);

            // Pass captured image to parent
            onCapture(imageData);
        }
    };

    const handleCancel = () => {
        stopCamera();
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="space-y-4">
            {/* Camera Preview */}
            <div className="relative rounded-lg overflow-hidden bg-secondary border-2 border-border">
                {!cameraActive ? (
                    <div className="aspect-video flex flex-col items-center justify-center p-8 text-center">
                        <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {mode === 'login' ? 'Login with Face Recognition' : 'Register Your Face'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {mode === 'login'
                                ? 'Position your face in front of the camera to login'
                                : 'Capture your face for quick login in the future'}
                        </p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive flex items-center gap-2"
                            >
                                <AlertCircle className="w-4 h-4 text-destructive" />
                                <p className="text-sm text-destructive">{error}</p>
                            </motion.div>
                        )}

                        <Button
                            onClick={startCamera}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Start Camera
                        </Button>
                    </div>
                ) : (
                    <div className="relative aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />

                        {/* Face Detection Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 border-4 border-primary rounded-full opacity-50" />
                        </div>

                        {/* Countdown Overlay */}
                        <AnimatePresence>
                            {countdown !== null && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50"
                                >
                                    <div className="text-8xl font-bold text-white">
                                        {countdown}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Capturing Indicator */}
                        {capturing && countdown === null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <Loader2 className="w-12 h-12 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hidden Canvas for Capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Action Buttons */}
            {cameraActive && !capturing && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                >
                    <Button
                        onClick={captureImage}
                        disabled={isLoading}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Capture Face
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="border-border hover:bg-secondary"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                </motion.div>
            )}

            {/* Instructions */}
            {cameraActive && !capturing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-lg bg-secondary/50 border border-border"
                >
                    <h4 className="text-sm font-semibold text-foreground mb-2">Tips for best results:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Ensure good lighting on your face</li>
                        <li>• Look directly at the camera</li>
                        <li>• Remove glasses if possible</li>
                        <li>• Keep your face centered in the circle</li>
                    </ul>
                </motion.div>
            )}
        </div>
    );
};

export default FaceRecognition;
