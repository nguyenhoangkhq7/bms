import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "@/src/auth/context";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            await logout();
            router.replace("/auth/login");
          } 
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#1a1a1a" : "#f6f5f3" }]}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color={isDark ? "#fff" : "#1F4788"} />
        </View>
        <Text style={[styles.userName, { color: isDark ? "#fff" : "#000" }]}>
          {user?.fullName || user?.username || ""}
        </Text>
        <Text style={[styles.userEmail, { color: isDark ? "#aaa" : "#666" }]}>
          {user?.email || ""}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? "#888" : "#999" }]}>ACCOUNT SETTINGS</Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: isDark ? "#2a2a2a" : "#fff" }]}
          onPress={() => router.push("/profile/change-password" as any)}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="key-outline" size={22} color={isDark ? "#fff" : "#000"} />
            <Text style={[styles.menuItemText, { color: isDark ? "#fff" : "#000" }]}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: isDark ? "#2a2a2a" : "#fff", marginTop: 1 }]}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={22} color={isDark ? "#fff" : "#000"} />
            <Text style={[styles.menuItemText, { color: isDark ? "#fff" : "#000" }]}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: isDark ? "#2a2a2a" : "#fff" }]}
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
  header: { alignItems: "center", paddingVertical: 40, borderBottomWidth: 0.5, borderBottomColor: "#ddd" },
  avatarContainer: { marginBottom: 16 },
  userName: { fontSize: 22, fontWeight: "700" },
  userEmail: { fontSize: 14, marginTop: 4 },
  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "700", marginBottom: 8, marginLeft: 4 },
  menuItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: 16, 
    borderRadius: 12 
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center" },
  menuItemText: { fontSize: 16, fontWeight: "500", marginLeft: 12 },
  logoutButton: { 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#ffebee" 
  },
  logoutText: { color: "#ff4444", fontSize: 16, fontWeight: "700" }
});
