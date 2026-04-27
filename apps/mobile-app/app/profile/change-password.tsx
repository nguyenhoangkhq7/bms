import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/src/auth/context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

export default function ChangePasswordScreen() {
  const colorScheme = useColorScheme();
  const { user, sendChangePasswordOtp, confirmChangePassword, isLoading, error, clearError } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Confirm OTP
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  const handleSendOtp = async () => {
    try {
      clearError();
      await sendChangePasswordOtp();
      setStep(2);
      Alert.alert("OTP Sent", `A verification code has been sent to ${user?.email}`);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to send OTP");
    }
  };

  const handleConfirmChange = async () => {
    const errors: { [key: string]: string } = {};
    if (!otpCode.trim()) errors.otpCode = "OTP is required";
    if (newPassword.length < 8) errors.newPassword = "Min 8 characters";
    if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      clearError();
      await confirmChangePassword({
        email: user?.email || "",
        otpCode: otpCode.trim(),
        newPassword,
        confirmPassword
      });
      Alert.alert("Success", "Password changed successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to change password");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(1)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>Change Password</Text>
          <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
            {step === 1 
              ? "Verify your account with a 6-digit code sent to your email." 
              : "Enter the OTP and your new password below."}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {step === 1 ? (
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color={colors.tint} />
                <Text style={[styles.infoText, { color: isDark ? "#fff" : "#333" }]}>{user?.email}</Text>
              </View>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint, opacity: isLoading ? 0.6 : 1, marginTop: 30 }]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Verification Code</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>OTP Code</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                      color: isDark ? "#fff" : "#000",
                      borderColor: fieldErrors.otpCode ? "#ff4444" : isDark ? "#444" : "#ddd",
                      textAlign: 'center',
                      fontSize: 24,
                      letterSpacing: 10,
                      fontWeight: '700'
                    },
                  ]}
                  placeholder="000000"
                  placeholderTextColor={isDark ? "#888" : "#999"}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  maxLength={6}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />
                {fieldErrors.otpCode && <Text style={styles.errorText}>{fieldErrors.otpCode}</Text>}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>New Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                      color: isDark ? "#fff" : "#000",
                      borderColor: fieldErrors.newPassword ? "#ff4444" : isDark ? "#444" : "#ddd",
                    },
                  ]}
                  placeholder="Min 8 characters"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isLoading}
                />
                {fieldErrors.newPassword && <Text style={styles.errorText}>{fieldErrors.newPassword}</Text>}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Confirm Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                      color: isDark ? "#fff" : "#000",
                      borderColor: fieldErrors.confirmPassword ? "#ff4444" : isDark ? "#444" : "#ddd",
                    },
                  ]}
                  placeholder="Repeat new password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                />
                {fieldErrors.confirmPassword && <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint, opacity: isLoading ? 0.6 : 1 }]}
                onPress={handleConfirmChange}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Change</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setStep(1)} style={styles.resendLink}>
                <Text style={{ color: colors.tint, fontWeight: "600" }}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 60 },
  headerContainer: { marginBottom: 40 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  formContainer: { flex: 1 },
  infoBox: { padding: 20, borderRadius: 16, backgroundColor: '#f0f7ff', borderWidth: 1, borderColor: '#e1effe' },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { fontSize: 16, fontWeight: "600" },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1.5 },
  errorText: { color: "#ff4444", fontSize: 12, marginTop: 6, fontWeight: "500" },
  button: { borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resendLink: { marginTop: 20, alignItems: "center" }
});
