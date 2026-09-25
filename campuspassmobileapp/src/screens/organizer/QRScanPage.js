import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { ScanLine, CheckCircle2, XCircle, Search, Ticket, ArrowLeft, Camera, RefreshCw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useTheme } from '../../utils/ThemeContext';

const QRScanPage = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [permission, requestPermission] = useCameraPermissions();
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = async (codeToVerify) => {
    const targetCode = (codeToVerify || ticketId || "").trim();
    if (!targetCode) return;

    try {
      setLoading(true);
      setVerificationResult(null);

      const res = await api.get(`/bookings/verify/${targetCode}`);
      setVerificationResult({
        success: true,
        data: res.data.data,
      });
    } catch (error) {
      setVerificationResult({
        success: false,
        message: error.response?.data?.message || "Invalid or unverified ticket code.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = ({ data }) => {
    if (scanned || !data) return;
    setScanned(true);
    setTicketId(data);
    handleVerify(data);
  };

  const handleRescan = () => {
    setScanned(false);
    setTicketId("");
    setVerificationResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={16} color={theme.colors.textMuted} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>

          <PageHeader
            breadcrumb="VENUE ENTRY CHECK-IN"
            title="Live QR Scanner"
            subtitle="Verify student ticket QR passes at the entrance gate and record check-ins."
          />

          <View style={styles.scannerBox}>
            {!permission ? (
              <View style={styles.cameraStateBox}>
                <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
                <Text style={styles.cameraStateText}>Requesting camera permission...</Text>
              </View>
            ) : !permission.granted ? (
              <View style={styles.cameraStateBox}>
                <Camera size={36} color={theme.colors.textMuted} />
                <Text style={styles.cameraStateTitle}>Camera Access Required</Text>
                <Text style={styles.cameraStateText}>Please grant camera permission to scan QR pass codes at entry.</Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                  <Text style={styles.permissionBtnText}>Grant Camera Permission</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                >
                  <View style={styles.cameraOverlay}>
                    <View style={styles.scanTargetFrame}>
                      {!scanned && <View style={styles.scanBeam} />}
                    </View>
                  </View>
                </CameraView>
                <Text style={styles.scannerActiveText}>
                  {scanned ? "QR Code Scanned!" : "Scanner Active • Point at QR Pass"}
                </Text>
                {scanned && (
                  <TouchableOpacity style={styles.rescanBtn} onPress={handleRescan}>
                    <RefreshCw size={14} color={theme.colors.primary} />
                    <Text style={styles.rescanBtnText}>Tap to Scan Next Pass</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={styles.manualInputContainer}>
              <View style={styles.inputWrapper}>
                <Ticket size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={ticketId}
                  onChangeText={(text) => {
                    setTicketId(text);
                    if (scanned) setScanned(false);
                  }}
                  placeholder="Enter Ticket Pass Code..."
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity 
                style={[styles.verifyBtn, loading && styles.disabledBtn]} 
                onPress={() => handleVerify()}
                disabled={loading || !ticketId.trim()}
              >
                {loading ? (
                  <ActivityIndicator animating={true} size="small" color={theme.colors.surface} />
                ) : (
                  <>
                    <Search size={16} color={theme.colors.surface} />
                    <Text style={styles.verifyBtnText}>Verify</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {verificationResult && (
            <View style={[
              styles.resultCard, 
              verificationResult.success ? styles.successCard : styles.errorCard
            ]}>
              {verificationResult.success ? (
                <View style={styles.resultContent}>
                  <View style={styles.resultHeader}>
                    <CheckCircle2 size={32} color="#34d399" />
                    <View style={styles.resultHeaderText}>
                      <Text style={styles.successTitle}>VALID PASS CONFIRMED</Text>
                      <Text style={styles.successSubtitle}>Grant Entry • Student Verified</Text>
                    </View>
                  </View>

                  {verificationResult.data && (
                    <View style={styles.resultDetailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Student Name</Text>
                        <Text style={styles.detailValue}>{verificationResult.data.user?.fullName || "Verified Student"}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Pass Quantity</Text>
                        <Text style={styles.detailValue}>{verificationResult.data.seatsCount || verificationResult.data.quantity || 1} Ticket(s)</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Event Title</Text>
                        <Text style={styles.detailValue}>{verificationResult.data.event?.title || "Campus Event"}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                          <StatusBadge status={verificationResult.data.bookingStatus || verificationResult.data.status || "confirmed"} />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.resultHeader}>
                  <XCircle size={32} color="#fb7185" />
                  <View style={styles.resultHeaderText}>
                    <Text style={styles.errorTitle}>ENTRY DENIED</Text>
                    <Text style={styles.errorSubtitle}>{verificationResult.message}</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 40,
      gap: 20,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 8,
      alignSelf: 'flex-start',
    },
    backBtnText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: 'bold',
    },
    scannerBox: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 24,
      alignItems: 'center',
    },
    cameraContainer: {
      alignItems: 'center',
      marginBottom: 24,
      width: '100%',
    },
    camera: {
      width: 240,
      height: 240,
      borderRadius: 24,
      overflow: 'hidden',
    },
    cameraOverlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    scanTargetFrame: {
      width: 180,
      height: 180,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
    },
    scanBeam: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: theme.colors.primary,
    },
    cameraStateBox: {
      width: 240,
      height: 240,
      borderRadius: 24,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      marginBottom: 24,
      gap: 10,
    },
    cameraStateTitle: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    cameraStateText: {
      color: theme.colors.textMuted,
      fontSize: 11,
      textAlign: 'center',
    },
    permissionBtn: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginTop: 4,
    },
    permissionBtnText: {
      color: theme.colors.surface,
      fontSize: 12,
      fontWeight: 'bold',
    },
    scannerActiveText: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: 'bold',
      marginTop: 14,
    },
    rescanBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    rescanBtnText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: 'bold',
    },
    manualInputContainer: {
      flexDirection: 'row',
      width: '100%',
      gap: 12,
    },
    inputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingHorizontal: 12,
      height: 52,
    },
    inputIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      color: theme.colors.text,
      fontSize: 14,
    },
    verifyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingHorizontal: 20,
      gap: 8,
      height: 52,
    },
    disabledBtn: {
      opacity: 0.5,
    },
    verifyBtnText: {
      color: theme.colors.surface,
      fontSize: 14,
      fontWeight: 'bold',
    },
    resultCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 20,
    },
    successCard: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    errorCard: {
      backgroundColor: 'rgba(244, 63, 94, 0.1)',
      borderColor: 'rgba(244, 63, 94, 0.3)',
    },
    resultContent: {
      gap: 16,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    resultHeaderText: {
      flex: 1,
    },
    successTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '900',
    },
    successSubtitle: {
      color: '#34d399',
      fontSize: 12,
    },
    errorTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '900',
    },
    errorSubtitle: {
      color: '#fb7185',
      fontSize: 12,
    },
    resultDetailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    detailItem: {
      width: '45%',
    },
    detailLabel: {
      color: theme.colors.textMuted,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    detailValue: {
      color: theme.colors.text,
      fontSize: 13,
      fontWeight: 'bold',
    },
  });

export default QRScanPage;
