'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: any) => void;
}

export default function QRScanner({ onScanSuccess, onScanFailure }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      },
      (error) => {
        if (onScanFailure) {
          onScanFailure(error);
        }
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id="qr-reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-white text-black" />;
}
