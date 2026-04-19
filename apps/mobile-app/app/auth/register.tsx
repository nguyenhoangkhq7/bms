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
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useAuth } from "@/src/auth/context";
import { useRegisterForm } from "@/src/auth/hooks";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const { register, isLoading, error, clearError } = useAuth();
  const { formData, errors, updateField, validate, getSubmitData } =
    useRegisterForm();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      const isoDate = date.toISOString().split("T")[0];
      updateField("dateOfBirth", isoDate);
    }
  };

  const handleRegister = async () => {
    if (!validate()) return;

    try {
      clearError();
      const data = getSubmitData();
      await register(data);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert(
        "Registration Failed",
        err?.error?.message || "Please try again",
      );
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
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#666" }]}>
            Join us today
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Error Message */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Username Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Username *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: errors.username
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
              placeholder="Choose username"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={formData.username}
              onChangeText={(value) => updateField("username", value)}
              editable={!isLoading}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          {/* Full Name Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Full Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: errors.name
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
              placeholder="Your full name"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={formData.name}
              onChangeText={(value) => updateField("name", value)}
              editable={!isLoading}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Email Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Email *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: errors.email
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
              placeholder="your@email.com"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={formData.email}
              onChangeText={(value) => updateField("email", value)}
              editable={!isLoading}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Phone Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Phone Number *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: errors.phoneNumber
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
              placeholder="0912345678"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={formData.phoneNumber}
              onChangeText={(value) => updateField("phoneNumber", value)}
              editable={!isLoading}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>

          {/* Date of Birth Field */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Date of Birth (Optional)
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  borderColor: isDark ? "#444" : "#ddd",
                  justifyContent: "center",
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={{
                  color: formData.dateOfBirth
                    ? isDark
                      ? "#fff"
                      : "#000"
                    : "#999",
                  fontSize: 16,
                }}
              >
                {formData.dateOfBirth || "Select date"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {Platform.OS === "ios" && showDatePicker && (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.tint,
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 8,
                }}
                onPress={() => setShowDatePicker(false)}
              >
                <Text
                  style={{
                    color: "#fff",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  Done
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Address Fields */}
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#fff" : "#000", marginTop: 20 },
            ]}
          >
            Address Information *
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Street Address
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: errors.streetAddress
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
              placeholder="123 Main Street"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={formData.streetAddress}
              onChangeText={(value) => updateField("streetAddress", value)}
              editable={!isLoading}
            />
            {errors.streetAddress && (
              <Text style={styles.errorText}>{errors.streetAddress}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Ward
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: errors.ward
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
              placeholder="Ward name"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={formData.ward}
              onChangeText={(value) => updateField("ward", value)}
              editable={!isLoading}
            />
            {errors.ward && <Text style={styles.errorText}>{errors.ward}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              District
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: errors.district
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
              placeholder="District name"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={formData.district}
              onChangeText={(value) => updateField("district", value)}
              editable={!isLoading}
            />
            {errors.district && (
              <Text style={styles.errorText}>{errors.district}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              City/Province
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: errors.cityProvince
                    ? "#ff4444"
                    : isDark
                      ? "#444"
                      : "#ddd",
                },
              ]}
              placeholder="City or province name"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={formData.cityProvince}
              onChangeText={(value) => updateField("cityProvince", value)}
              editable={!isLoading}
            />
            {errors.cityProvince && (
              <Text style={styles.errorText}>{errors.cityProvince}</Text>
            )}
          </View>

          {/* Password Section */}
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#fff" : "#000", marginTop: 20 },
            ]}
          >
            Security *
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Password
            </Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  borderColor: errors.password
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
                placeholder="Create password"
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={formData.password}
                onChangeText={(value) => updateField("password", value)}
                editable={!isLoading}
                secureTextEntry={!passwordVisible}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                disabled={isLoading}
              >
                <Text
                  style={{
                    color: colors.tint,
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {passwordVisible ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
              Confirm Password
            </Text>
            <View
              style={[
                styles.passwordContainer,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  borderColor: errors.confirmPassword
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
                placeholder="Confirm password"
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={formData.confirmPassword}
                onChangeText={(value) => updateField("confirmPassword", value)}
                editable={!isLoading}
                secureTextEntry={!confirmPasswordVisible}
              />
              <TouchableOpacity
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
                disabled={isLoading}
              >
                <Text
                  style={{
                    color: colors.tint,
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {confirmPasswordVisible ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: colors.tint,
                opacity: isLoading ? 0.6 : 1,
                marginTop: 24,
              },
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginLink}>
            <Text style={{ color: isDark ? "#aaa" : "#666" }}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/auth/login")}>
              <Text style={{ color: colors.tint, fontWeight: "700" }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
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
  },
  headerContainer: {
    marginBottom: 30,
    marginTop: 10,
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
  },
  fieldGroup: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
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
    marginBottom: 16,
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
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
});


