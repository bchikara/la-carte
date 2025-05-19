// src/components/Admin/Settings/QRCodeGenerator.tsx
import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './QRCodeGenerator.scss'; // We'll create this SCSS file
import { FaDownload } from 'react-icons/fa';
import LaCarteLogoDefault from '../../assets/icons/la_carte.png'; // Default logo if none provided

interface QRCodeGeneratorProps {
  value: string; // The string value to encode in the QR code (e.g., URL)
  size?: number; // Size of the QR code canvas (width & height)
  logoSrc?: string | null; // URL or path to the logo image to embed
  logoWidth?: number; // Width of the embedded logo
  logoHeight?: number; // Height of the embedded logo
  logoOpacity?: number; // Opacity of the embedded logo
  fileName?: string; // Suggested filename for download
  level?: 'L' | 'M' | 'Q' | 'H'; // QR code error correction level
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 160, // Default size
  logoSrc,
  logoWidth = 35, // Default logo width
  logoHeight = 35, // Default logo height
  logoOpacity = 1,
  fileName = 'qr-code.png',
  level = 'H', // High error correction level, good for logos
}) => {
  const qrCanvasRef = useRef<HTMLDivElement>(null); // Ref to the div containing the canvas

  const downloadQRCode = () => {
    if (qrCanvasRef.current) {
  const canvas = qrCanvasRef.current.querySelector('canvas');
  if (canvas) {
    try {
      // Make sure no external/cross-origin images are used in the canvas
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
        } catch (error) {
        console.error("Failed to export canvas:", error);
        alert("Could not download QR Code due to security restrictions. Ensure no external images are used.");
        }
    } else {
        console.error("QR Code canvas element not found for download.");
        alert("Could not download QR Code. Canvas not found.");
    }
    }
  };

  const imageSettings = logoSrc ? {
    src: LaCarteLogoDefault,
    height: logoHeight,
    width: logoWidth,
    excavate: true, // Excavates a hole for the logo for better readability
    opacity: logoOpacity, // Not a standard qrcode.react prop, custom handling if needed
  } : (LaCarteLogoDefault ? { // Use default LaCarte logo if no specific logoSrc
    src: LaCarteLogoDefault,
    height: logoHeight,
    width: logoWidth,
    excavate: true,
  } : undefined);


  return (
    <div className="qr-code-generator-container">
      <div ref={qrCanvasRef} className="qr-code-canvas-wrapper">
        <QRCodeCanvas
          value={value}
          size={size}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={level}
          includeMargin={true}
          imageSettings={imageSettings}
        />
      </div>
      <button onClick={downloadQRCode} className="download-qr-button admin-cta-button tertiary small">
        <FaDownload /> Download QR
      </button>
    </div>
  );
};

export default QRCodeGenerator;
