import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "@/src/auth/context";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { userApi, UserProfileDetail } from "@/src/api/user";
import { Colors } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];
  const [profile, setProfile] = useState<UserProfileDetail | null>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      setIsFetchingProfile(true);
      const response = await userApi.getProfile();
      setProfile(response);
    } catch {
      setProfile(null);
    } finally {
      setIsFetchingProfile(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#f6f5f3" },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile?.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons
              name="person-circle"
              size={100}
              color={isDark ? "#fff" : "#1F4788"}
            />
          )}
        </View>
        <Text style={[styles.userName, { color: isDark ? "#fff" : "#000" }]}>
          {profile?.fullName || user?.fullName || user?.username || ""}
        </Text>
        <Text style={[styles.userEmail, { color: isDark ? "#aaa" : "#666" }]}>
          {profile?.email || user?.email || ""}
        </Text>
      </View>

      {isFetchingProfile && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={colors.tint} />
        </View>
      )}

      {profile && (
        <View style={styles.infoCardWrap}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: isDark ? "#2a2a2a" : "#fff" },
            ]}
          >
            <Text style={[styles.infoRow, { color: isDark ? "#ddd" : "#333" }]}>
              Phone: {profile.phoneNumber || "-"}
            </Text>
            <Text style={[styles.infoRow, { color: isDark ? "#ddd" : "#333" }]}>
              Address: {profile.streetAddress || "-"}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: isDark ? "#888" : "#999" }]}
        >
          ACCOUNT SETTINGS
        </Text>

        <TouchableOpacity
          style={[
            styles.menuItem,
            { backgroundColor: isDark ? "#2a2a2a" : "#fff", marginBottom: 8 },
          ]}
          onPress={() => router.push("/profile/edit" as any)}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons
              name="create-outline"
              size={22}
              color={isDark ? "#fff" : "#000"}
            />
            <Text
              style={[styles.menuItemText, { color: isDark ? "#fff" : "#000" }]}
            >
              Edit Profile
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            { backgroundColor: isDark ? "#2a2a2a" : "#fff" },
          ]}
          onPress={() => router.push("/profile/change-password" as any)}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons
              name="key-outline"
              size={22}
              color={isDark ? "#fff" : "#000"}
            />
            <Text
              style={[styles.menuItemText, { color: isDark ? "#fff" : "#000" }]}
            >
              Change Password
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: isDark ? "#2a2a2a" : "#fff" },
          ]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  avatarContainer: { marginBottom: 16 },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  userName: { fontSize: 22, fontWeight: "700" },
  userEmail: { fontSize: 14, marginTop: 4 },
  loadingWrap: { marginTop: 10 },
  infoCardWrap: { paddingHorizontal: 20, marginTop: 14 },
  infoCard: { borderRadius: 12, padding: 14 },
  infoRow: { fontSize: 14, marginBottom: 6 },
  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuItemText: { fontSize: 16, fontWeight: "500", marginLeft: 12 },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffebee",
  },
  logoutText: { color: "#ff4444", fontSize: 16, fontWeight: "700" },
});
