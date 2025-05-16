import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeResult, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import './Scanner.scss';
import { FaLightbulb, FaRegLightbulb } from 'react-icons/fa';
import { PiCameraRotate } from "react-icons/pi";

interface CameraDevice {
    id: string;
    label: string;
}

const Scanner: React.FC = () => {
    const navigate = useNavigate();
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const readerElementId = "qr-reader-element";

    const [scanStatus, setScanStatus] = useState<string>("Initializing scanner...");
    const [isScannerActive, setIsScannerActive] = useState<boolean>(false);
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
    const [isFlashOn, setIsFlashOn] = useState<boolean>(false);
    const [isFlashAvailable, setIsFlashAvailable] = useState<boolean>(false);
    const currentTrackRef = useRef<MediaStreamTrack | null>(null);

    const stopCurrentScanner = useCallback(async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                console.log("Scanner stopped successfully.");
                setIsScannerActive(false);
                if (currentTrackRef.current) {
                    currentTrackRef.current = null;
                }
            } catch (err) {
                console.error("Error stopping QR scanner:", err);
            }
        }
    }, []);

    const qrCodeSuccessCallback = useCallback((decodedText: string, result: Html5QrcodeResult) => {
        console.log("Scanned data:", decodedText, "Full result:", result);
        stopCurrentScanner().then(() => {
            setScanStatus(`Scan successful! Processing...`);
            if (decodedText.includes('thelacarte.com/')) {
                const route = decodedText.split('thelacarte.com')[1];
                if (route) {
                    navigate(route);
                } else {
                    setScanStatus('Invalid La Carte QR code format.');
                    alert('Invalid La Carte QR code format.');
                }
            } else if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
                setScanStatus('External link scanned. Please use a La Carte QR code.');
                alert('Please use a La Carte QR code only. This QR code points to an external link.');
            } else {
                setScanStatus('Invalid QR Code. Please use a La Carte QR code only.');
                alert('Invalid QR Code. Please use a La Carte QR code only.');
            }
        });
    }, [navigate, stopCurrentScanner]);

    const qrCodeErrorCallback = useCallback((errorMessage: string) => {
        console.warn(`QR Scan Error: ${errorMessage}`);
    }, []);

    const startScanner = useCallback(async (cameraId?: string) => {
        await stopCurrentScanner();

        const readerElement = document.getElementById(readerElementId);
        if (!readerElement) {
            setScanStatus("Scanner container not found.");
            console.error("Scanner container element not found");
            return;
        }

        if (!html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode(readerElementId, { verbose: false });
        }
        
        const selectedCameraId = cameraId || (cameras.length > 0 ? cameras[currentCameraIndex]?.id : undefined);
        if (!selectedCameraId) {
            setScanStatus("No camera selected or available.");
            console.error("No camera ID available to start scanner.");
            Html5Qrcode.getCameras().then(setCameras).catch(err => {
                console.error("Failed to get cameras on retry:", err);
                setScanStatus("Could not access cameras. Please check permissions.");
            });
            return;
        }

        const config: Html5QrcodeCameraScanConfig = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            disableFlip: false
        };

        try {
            setScanStatus("Starting scanner...");
            await html5QrCodeRef.current.start(
                selectedCameraId,
                config,
                qrCodeSuccessCallback,
                qrCodeErrorCallback
            );
            setIsScannerActive(true);
            setScanStatus("Scanning... Align QR code within the frame.");

            const videoElement = document.getElementById(readerElementId)?.querySelector('video');
            if (videoElement && videoElement.srcObject instanceof MediaStream) {
                const stream = videoElement.srcObject;
                const track = stream.getVideoTracks()[0];
                currentTrackRef.current = track;
                if (track && typeof track.getCapabilities === 'function' && 'torch' in track.getCapabilities()) {
                    setIsFlashAvailable(true);
                } else {
                    setIsFlashAvailable(false);
                }
            } else {
                setIsFlashAvailable(false);
            }
            setIsFlashOn(false);

        } catch (err) {
            console.error("Failed to start scanner:", err);
            const errorMessage = (err instanceof Error) ? err.message : String(err);
            setScanStatus(`Error starting scanner: ${errorMessage}.`);
            alert(`Error starting scanner: ${errorMessage}. Please check permissions.`);
            setIsScannerActive(false);
        }
    }, [cameras, currentCameraIndex, qrCodeSuccessCallback, qrCodeErrorCallback, stopCurrentScanner]);

    useEffect(() => {
        const checkPermissionsAndGetCameras = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length) {
                    setCameras(devices.map(d => ({ id: d.id, label: d.label })));
                    setCurrentCameraIndex(0);
                } else {
                    setScanStatus("No cameras found.");
                }
            } catch (err) {
                console.error("Error getting cameras:", err);
                setScanStatus("Could not access cameras. Please check permissions.");
            }
        };

        checkPermissionsAndGetCameras();
    }, []);

    useEffect(() => {
        if (cameras.length > 0 && cameras[currentCameraIndex]?.id) {
            startScanner(cameras[currentCameraIndex].id);
        }

        return () => {
            const cleanup = async () => {
                if (html5QrCodeRef.current?.isScanning) {
                    try {
                        await html5QrCodeRef.current.stop();
                    } catch (err) {
                        console.warn("Error stopping scanner on unmount:", err);
                    }
                }
                html5QrCodeRef.current?.clear();
                html5QrCodeRef.current = null;
                
                if (currentTrackRef.current) {
                    currentTrackRef.current.stop();
                    currentTrackRef.current = null;
                }
            };
            cleanup();
        };
    }, [cameras, currentCameraIndex, startScanner]);

    const handleFlipCamera = async () => {
        if (cameras.length <= 1) {
            alert("Only one camera detected.");
            return;
        }

        try {
            await stopCurrentScanner();
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for smoother transition
            const nextIndex = (currentCameraIndex + 1) % cameras.length;
            setCurrentCameraIndex(nextIndex);
        } catch (err) {
            console.error("Error flipping camera:", err);
            setScanStatus("Error switching cameras. Please try again.");
        }
    };

    const handleToggleFlash = async () => {
        if (!currentTrackRef.current || !isFlashAvailable) {
            alert("Flash is not available on this camera or track is not ready.");
            return;
        }
        try {
            await currentTrackRef.current.applyConstraints({
                advanced: [{ torch: !isFlashOn } as any]
            });
            setIsFlashOn(!isFlashOn);
            setScanStatus(isFlashOn ? "Flash OFF" : "Flash ON");
        } catch (err) {
            console.error("Error toggling flash:", err);
            alert("Could not toggle flash. This feature might not be supported on your device/browser.");
        }
    };

    return (
        <div className="ScannerPage">
            <div className="scanner-content-wrapper section-padding">
                <header className="scanner-header">
                    <h1 className="section-title">Scan QR Code</h1>
                    <p className="section-subtitle">
                        Point your camera at a La Carte QR code to quickly access menus or restaurant information.
                    </p>
                </header>

                <div className="qr-reader-container">
                    <div id={readerElementId} className="qr-reader-frame"></div>
                    {isScannerActive && (
                        <div className="scanner-overlay">
                            <div className="scanner-aiming-box"></div>
                        </div>
                    )}
                </div>
                <p className="scanner-status-message">{scanStatus}</p>

                <div className="scanner-controls">
                    {cameras.length > 1 && (
                        <button onClick={handleFlipCamera} className="scanner-control-button" aria-label="Flip Camera">
                            <PiCameraRotate />
                            <span>Flip</span>
                        </button>
                    )}
                    {isFlashAvailable && (
                        <button onClick={handleToggleFlash} className="scanner-control-button" aria-label={isFlashOn ? "Turn Flash Off" : "Turn Flash On"}>
                            {isFlashOn ? <FaRegLightbulb /> : <FaLightbulb />}
                            <span>{isFlashOn ? 'Flash Off' : 'Flash On'}</span>
                        </button>
                    )}
                </div>

                <div className="scanner-tips">
                    <p><strong>Tips for scanning:</strong></p>
                    <ul>
                        <li>Ensure good lighting.</li>
                        <li>Hold your device steady.</li>
                        <li>Make sure the QR code is clear and not damaged.</li>
                        <li>Allow camera access if prompted by your browser.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Scanner;