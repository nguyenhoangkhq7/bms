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

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const { sendForgotPasswordOtp, confirmForgotPassword, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setFieldErrors({ email: "Email is required" });
      return;
    }
    
    try {
      clearError();
      await sendForgotPasswordOtp({ email: email.trim() });
      setStep(2);
      setFieldErrors({});
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async () => {
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
      await confirmForgotPassword({
        email: email.trim(),
        otpCode: otpCode.trim(),
        newPassword
      });
      Alert.alert("Success", "Password reset successfully!", [
        { text: "OK", onPress: () => router.replace("/auth/login") }
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to reset password");
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
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
            {step === 1 
              ? "Enter your email to receive a reset code." 
              : `Enter the code sent to ${email}`}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {step === 1 ? (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                    color: isDark ? "#fff" : "#000",
                    borderColor: fieldErrors.email ? "#ff4444" : isDark ? "#444" : "#ddd",
                  },
                ]}
                placeholder="name@example.com"
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint, opacity: isLoading ? 0.6 : 1 }]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
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
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => router.push("/auth/login" as any)} style={styles.footerLink}>
          <Text style={{ color: colors.tint, fontWeight: "600" }}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 60 },
  headerContainer: { marginBottom: 40 },
  backButton: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16 },
  formContainer: { flex: 1 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1.5 },
  errorText: { color: "#ff4444", fontSize: 12, marginTop: 6, fontWeight: "500" },
  button: { borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footerLink: { marginTop: 20, alignItems: "center" }
});
