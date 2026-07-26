import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { COLORS } from '../utils/constants';

/**
 * Real camera view with barcode scanning using expo-camera.
 *
 * Props (passed via the screen descriptor from the factory):
 *   onBarcodeDetected  – (value: string) => void   called when a barcode is scanned
 *   scanning           – boolean                    whether scanning is active
 *   cameraPermission   – 'granted' | 'denied' | 'unknown'
 *   onRequestPermission – () => Promise<'granted' | 'denied'>
 *   instructionText    – string                     overlay text
 *   onCancel           – () => void                 cancel / go back
 */
export const ScanView = ({
  onBarcodeDetected,
  scanning = true,
  cameraPermission: initialPermission = 'unknown',
  onRequestPermission,
  instructionText = 'Align barcode within frame',
  onCancel,
}) => {
  const [permission, setPermission] = useState(initialPermission);
  const [scanned, setScanned] = useState(false);
  const CameraRef = useRef(null);

  // Keep local permission in sync with prop
  useEffect(() => {
    setPermission(initialPermission);
  }, [initialPermission]);

  // Reset scanned state when scanning prop becomes true
  useEffect(() => {
    if (scanning) {
      setScanned(false);
    }
  }, [scanning]);

  const handleBarCodeScanned = useCallback(
    ({ data }) => {
      if (!scanning || scanned) return;
      setScanned(true);
      if (onBarcodeDetected) {
        onBarcodeDetected(data);
      }
    },
    [scanning, scanned, onBarcodeDetected]
  );

  const requestPermission = useCallback(async () => {
    if (onRequestPermission) {
      const result = await onRequestPermission();
      setPermission(result);
      return;
    }

    // Fallback: try expo-camera's own permission API
    const { status } = await Camera.requestCameraPermissionsAsync();
    setPermission(status);
  }, [onRequestPermission]);

  // ── Permission not granted ────────────────────────────────────
  if (permission !== 'granted') {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          ScanWise needs camera access to scan barcodes and identify products.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
        {permission === 'denied' && (
          <Text style={styles.permissionDeniedText}>
            Camera permission was denied. Please enable it in your device
            settings.
          </Text>
        )}
        {onCancel && (
          <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Camera view with barcode overlay ──────────────────────────
  return (
    <View style={styles.container}>
      <Camera
        ref={CameraRef}
        style={styles.camera}
        type={Camera.Constants?.Type?.back ?? 'back'}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barCodeTypes: [
            'ean13', 'ean8', 'upc_a', 'upc_e', 'code128',
            'code39', 'code93', 'itf14', 'qr', 'pdf417',
            'aztec', 'datamatrix',
          ],
        }}
      >
        {/* Scanning overlay frame */}
        <View style={styles.overlayContainer}>
          <View style={styles.overlayFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.instructionText}>{instructionText}</Text>
        </View>

        {/* Cancel button */}
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        {/* Scanning indicator */}
        {scanning && !scanned && (
          <View style={styles.scanningIndicator}>
            <Text style={styles.scanningText}>Scanning...</Text>
          </View>
        )}

        {/* Scanned feedback */}
        {scanned && (
          <View style={styles.scannedBanner}>
            <Text style={styles.scannedText}>Barcode detected!</Text>
          </View>
        )}
      </Camera>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  // Permission screen
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  permissionDeniedText: {
    marginTop: 16,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  cancelLink: {
    marginTop: 20,
    padding: 10,
  },
  cancelLinkText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  // Overlay
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  overlayFrame: {
    width: 260,
    height: 180,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.primary,
  },
  cornerTL: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  // Cancel button
  cancelButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Scanning indicator
  scanningIndicator: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scanningText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  // Scanned banner
  scannedBanner: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(16,185,129,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scannedText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ScanView;
