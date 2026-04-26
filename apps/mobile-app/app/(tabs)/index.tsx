import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/src/auth/context";
import { router } from "expo-router";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { user, logout, isLoading } = useAuth();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#1a1a1a" : "#FDFBF7" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        { backgroundColor: isDark ? "#1a1a1a" : "#F5F0E8" },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? "#2a2a2a" : "#FDFBF7",
            borderBottomColor: isDark ? "#D4C4B0" : "#D4C4B0",
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.greeting, { color: isDark ? "#666" : "#666" }]}>
            Welcome back,
          </Text>
          <Text
            style={[styles.userName, { color: isDark ? "#FDFBF7" : "#1a1a1a" }]}
          >
            {user?.fullName}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: "#d32f2f" }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* User Info Card */}
      <View style={styles.infoCard}>
        <View
          style={[
            styles.cardInner,
            { backgroundColor: isDark ? "#2a2a2a" : "#FDFBF7" },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: isDark ? "#FDFBF7" : "#1a1a1a" },
            ]}
          >
            Your Profile
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: isDark ? "#666" : "#666" }]}>
              Email:
            </Text>
            <Text
              style={[styles.value, { color: isDark ? "#FDFBF7" : "#1a1a1a" }]}
            >
              {user?.email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: isDark ? "#666" : "#666" }]}>
              Username:
            </Text>
            <Text
              style={[styles.value, { color: isDark ? "#FDFBF7" : "#1a1a1a" }]}
            >
              {user?.username}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: isDark ? "#666" : "#666" }]}>
              Role:
            </Text>
            <Text
              style={[
                styles.value,
                styles.roleTag,
                { color: isDark ? "#FDFBF7" : "#1a1a1a" },
              ]}
            >
              {user?.role}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: isDark ? "#666" : "#666" }]}>
              Status:
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    user?.status === "ACTIVE" ? "#4ade80" : "#f87171",
                },
              ]}
            >
              <Text style={styles.statusText}>{user?.status}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text
          style={[
            styles.sectionTitle,
            { color: isDark ? "#FDFBF7" : "#1a1a1a" },
          ]}
        >
          Quick Actions
        </Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? "#2a2a2a" : "#FDFBF7" },
            ]}
          >
            <Text style={[styles.actionIcon, { color: colors.tint }]}>📚</Text>
            <Text
              style={[
                styles.actionLabel,
                { color: isDark ? "#FDFBF7" : "#1a1a1a" },
              ]}
            >
              Books
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? "#2a2a2a" : "#FDFBF7" },
            ]}
          >
            <Text style={[styles.actionIcon, { color: colors.tint }]}>🛒</Text>
            <Text
              style={[
                styles.actionLabel,
                { color: isDark ? "#FDFBF7" : "#1a1a1a" },
              ]}
            >
              Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? "#2a2a2a" : "#FDFBF7" },
            ]}
          >
            <Text style={[styles.actionIcon, { color: colors.tint }]}>⭐</Text>
            <Text
              style={[
                styles.actionLabel,
                { color: isDark ? "#FDFBF7" : "#1a1a1a" },
              ]}
            >
              Wishlist
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: isDark ? "#2a2a2a" : "#FDFBF7" },
            ]}
          >
            <Text style={[styles.actionIcon, { color: colors.tint }]}>👤</Text>
            <Text
              style={[
                styles.actionLabel,
                { color: isDark ? "#FDFBF7" : "#1a1a1a" },
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Message */}
      <View style={styles.footerMessage}>
        <Text style={[styles.footerText, { color: isDark ? "#888" : "#999" }]}>
          You are logged in securely
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FDFBF7",
    fontWeight: "600",
    fontSize: 12,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardInner: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D4C4B0",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  roleTag: {
    backgroundColor: "#F5F0E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: "#FDFBF7",
    fontWeight: "600",
    fontSize: 12,
  },
  actionsContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  footerMessage: {
    marginTop: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
