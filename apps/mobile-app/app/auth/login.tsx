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
import { LoginRequest } from "@/src/api/auth";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const { login, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!username.trim()) {
      errors.username = "Username is required";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      clearError();
      const credentials: LoginRequest = {
        username: username.trim(),
        password,
      };

      await login(credentials);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login Failed", err?.error?.message || "Please try again");
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
            Sign in to your account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Username Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Username
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: fieldErrors.username
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
              placeholder="Enter your username"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {fieldErrors.username && (
              <Text style={styles.errorText}>{fieldErrors.username}</Text>
            )}
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Password
            </Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  borderColor: fieldErrors.password
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
            >
              <TextInput
                style={[
                  styles.passwordInput,
                  { color: isDark ? "#fff" : "#000" },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                disabled={isLoading}
              >
                <Text style={{ color: colors.tint, fontWeight: "600" }}>
                  {passwordVisible ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            {fieldErrors.password && (
              <Text style={styles.errorText}>{fieldErrors.password}</Text>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: colors.tint,
                opacity: isLoading ? 0.6 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => router.push("/auth/forgot-password" as any)}
          >
            <Text style={{ color: colors.tint, fontWeight: "600" }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={{ color: isDark ? "#aaa" : "#666" }}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth/register")}>
            <Text style={{ color: colors.tint, fontWeight: "700" }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "space-between",
  },
  headerContainer: {
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1.5,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
  errorBanner: {
    backgroundColor: "#ffebee",
    borderLeftWidth: 4,
    borderLeftColor: "#ff4444",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorBannerText: {
    color: "#c62828",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  forgotPassword: {
    marginTop: 16,
    alignItems: "center",
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});



