import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
  Platform,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import {
  userApi,
  UserProfileDetail,
  UpdateAddressRequest,
  UpdateProfileRequest,
} from "@/src/api/user";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  const [profile, setProfile] = useState<UserProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [address, setAddress] = useState<UpdateAddressRequest>({
    phoneNumber: "",
    streetAddress: "",
    ward: "",
    district: "",
    cityProvince: "",
  });

  const dobLabel = useMemo(() => {
    if (!dateOfBirth) return "Not set";
    return dateOfBirth.toISOString().split("T")[0];
  }, [dateOfBirth]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userApi.getProfile();
      setProfile(response);
      setFullName(response.fullName || "");
      setDateOfBirth(
        response.dateOfBirth ? new Date(response.dateOfBirth) : null,
      );
      setAddress({
        phoneNumber: response.phoneNumber || "",
        streetAddress: response.streetAddress || "",
        ward: response.ward || "",
        district: response.district || "",
        cityProvince: response.cityProvince || "",
      });
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to load profile");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert("Validation", "Full name is required");
      return;
    }

    const payload: UpdateProfileRequest = {
      fullName: fullName.trim(),
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split("T")[0] : null,
    };

    try {
      setIsSavingProfile(true);
      const updated = await userApi.updateProfile(payload);
      setProfile(updated);
      Alert.alert("Success", "Basic profile updated");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveAddress = async () => {
    if (
      !address.phoneNumber.trim() ||
      !address.streetAddress.trim() ||
      !address.ward.trim() ||
      !address.district.trim() ||
      !address.cityProvince.trim()
    ) {
      Alert.alert("Validation", "Please complete all address fields");
      return;
    }

    try {
      setIsSavingAddress(true);
      const updated = await userApi.updateAddress({
        phoneNumber: address.phoneNumber.trim(),
        streetAddress: address.streetAddress.trim(),
        ward: address.ward.trim(),
        district: address.district.trim(),
        cityProvince: address.cityProvince.trim(),
      });
      setProfile(updated);
      Alert.alert("Success", "Address updated");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePickAvatar = async () => {
    let permission = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (!permission.granted && permission.canAskAgain) {
      permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (!permission.granted) {
      Alert.alert(
        "Photo Access Required",
        "Please allow photo library access to change your avatar.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const updated = await userApi.updateAvatar(result.assets[0].uri);
      setProfile(updated);
      Alert.alert("Success", "Avatar updated");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsUploadingAvatar(true);
      const updated = await userApi.removeAvatar();
      setProfile(updated);
      Alert.alert("Success", "Avatar removed");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to remove avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#fff" },
      ]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            Edit Profile
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5" },
          ]}
        >
          <View style={styles.avatarWrap}>
            {profile?.avatarUrl ? (
              <Image
                source={{ uri: profile.avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons
                name="person-circle"
                size={88}
                color={isDark ? "#fff" : "#1F4788"}
              />
            )}
          </View>

          <View style={styles.avatarActions}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.tint }]}
              onPress={handlePickAvatar}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <ActivityIndicator color={colors.tint} />
              ) : (
                <Text
                  style={[styles.secondaryButtonText, { color: colors.tint }]}
                >
                  Change Avatar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: "#ff4444" }]}
              onPress={handleRemoveAvatar}
              disabled={isUploadingAvatar}
            >
              <Text style={[styles.secondaryButtonText, { color: "#ff4444" }]}>
                Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#aaa" : "#666" }]}
          >
            BASIC INFO
          </Text>

          <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
            Full Name
          </Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={[
              styles.input,
              {
                backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                color: isDark ? "#fff" : "#000",
                borderColor: isDark ? "#444" : "#ddd",
              },
            ]}
            placeholder="Your full name"
            placeholderTextColor={isDark ? "#888" : "#999"}
          />

          <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
            Date of Birth
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.pickerInput,
              {
                backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                borderColor: isDark ? "#444" : "#ddd",
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: isDark ? "#fff" : "#000" }}>{dobLabel}</Text>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date(2000, 0, 1)}
              mode="date"
              maximumDate={new Date()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setDateOfBirth(selectedDate);
                }
              }}
            />
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.tint,
                opacity: isSavingProfile ? 0.6 : 1,
              },
            ]}
            onPress={handleSaveProfile}
            disabled={isSavingProfile}
          >
            {isSavingProfile ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Basic Info</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.sectionBlock}>
          <Text
            style={[styles.sectionTitle, { color: isDark ? "#aaa" : "#666" }]}
          >
            ADDRESS
          </Text>

          {[
            {
              key: "phoneNumber",
              label: "Phone Number",
              placeholder: "0912345678",
              keyboardType: "phone-pad",
            },
            {
              key: "streetAddress",
              label: "Street Address",
              placeholder: "123 Nguyen Trai",
            },
            { key: "ward", label: "Ward", placeholder: "Ward 1" },
            { key: "district", label: "District", placeholder: "District 1" },
            {
              key: "cityProvince",
              label: "City/Province",
              placeholder: "Ho Chi Minh City",
            },
          ].map((field) => (
            <View key={field.key}>
              <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
                {field.label}
              </Text>
              <TextInput
                value={address[field.key as keyof UpdateAddressRequest]}
                onChangeText={(value) =>
                  setAddress((prev) => ({ ...prev, [field.key]: value }))
                }
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                    color: isDark ? "#fff" : "#000",
                    borderColor: isDark ? "#444" : "#ddd",
                  },
                ]}
                placeholder={field.placeholder}
                placeholderTextColor={isDark ? "#888" : "#999"}
                keyboardType={(field as any).keyboardType || "default"}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.tint,
                opacity: isSavingAddress ? 0.6 : 1,
              },
            ]}
            onPress={handleSaveAddress}
            disabled={isSavingAddress}
          >
            {isSavingAddress ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Save Address</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "700" },
  card: { borderRadius: 14, padding: 16, marginBottom: 24 },
  avatarWrap: { alignItems: "center", marginBottom: 12 },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarActions: { flexDirection: "row", justifyContent: "center", gap: 10 },
  sectionBlock: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: "700", marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    fontSize: 16,
    marginBottom: 14,
  },
  pickerInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 120,
    alignItems: "center",
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "600" },
});
