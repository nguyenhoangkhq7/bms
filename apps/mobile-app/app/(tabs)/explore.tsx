import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useWishlist } from "@/src/wishlist/context";
import { cartService } from "@/src/api/cartService";
import { useAuth } from "@/src/auth/context";
import type { WishlistItem } from "@/src/types";

export default function WishlistScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];
  const { items, removeItem } = useWishlist();
  const { user, isSignedIn } = useAuth();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [addingBookId, setAddingBookId] = useState<number | null>(null);

  const getQty = (bookId: number) => quantities[bookId] || 1;
  const setQty = (bookId: number, qty: number) => {
    setQuantities((prev) => ({ ...prev, [bookId]: Math.max(1, qty) }));
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!isSignedIn || !user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để thêm vào giỏ hàng.");
      return;
    }
    try {
      setAddingBookId(item.bookId);
      await cartService.addToCart({
        userId: user.id,
        bookId: item.bookId,
        quantity: getQty(item.bookId),
      });
      removeItem(item.bookId);
      setQuantities((prev) => {
        const copy = { ...prev };
        delete copy[item.bookId];
        return copy;
      });
      Alert.alert("Thành công", "Đã thêm vào giỏ hàng!");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể thêm vào giỏ hàng.");
    } finally {
      setAddingBookId(null);
    }
  };

  const handleRemove = (bookId: number) => {
    Alert.alert(
      "Xác nhận",
      "Bạn muốn xóa sách này khỏi danh sách yêu thích?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => removeItem(bookId),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: WishlistItem }) => {
    const qty = getQty(item.bookId);
    const isAdding = addingBookId === item.bookId;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#2a2520" : "#fff",
            borderColor: isDark ? "#3d3430" : "#f0eeec",
          },
        ]}
      >
        {/* Thumbnail */}
        <TouchableOpacity
          onPress={() => router.push(`/book/${item.bookId}` as any)}
          style={[
            styles.thumbWrap,
            { backgroundColor: isDark ? "#362f2a" : "#f5f3f0" },
          ]}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.thumbImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="book-outline"
              size={28}
              color={isDark ? "#5a5350" : "#ccc"}
            />
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoWrap}>
          <TouchableOpacity
            onPress={() => router.push(`/book/${item.bookId}` as any)}
          >
            <Text
              style={[
                styles.bookTitle,
                { color: isDark ? "#f5f0e8" : "#1a1a1a" },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.bookAuthor,
              { color: isDark ? "#8a8580" : "#999" },
            ]}
            numberOfLines={1}
          >
            {item.author}
          </Text>
          <Text style={styles.bookPrice}>
            {item.price?.toLocaleString()}đ
          </Text>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {/* Quantity Selector */}
            <View
              style={[
                styles.qtySelector,
                {
                  borderColor: isDark ? "#4a4340" : "#e0ddd8",
                  backgroundColor: isDark ? "#362f2a" : "#fff",
                },
              ]}
            >
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(item.bookId, qty - 1)}
              >
                <Ionicons
                  name="remove"
                  size={14}
                  color={isDark ? "#c0b8b0" : "#555"}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.qtyText,
                  { color: isDark ? "#f5f0e8" : "#1a1a1a" },
                ]}
              >
                {qty}
              </Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQty(item.bookId, qty + 1)}
              >
                <Ionicons
                  name="add"
                  size={14}
                  color={isDark ? "#c0b8b0" : "#555"}
                />
              </TouchableOpacity>
            </View>

            {/* Add to Cart */}
            <TouchableOpacity
              style={[styles.cartBtn, { opacity: isAdding ? 0.6 : 1 }]}
              onPress={() => handleAddToCart(item)}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="cart-outline" size={14} color="#fff" />
                  <Text style={styles.cartBtnText}>Thêm giỏ</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Remove */}
            <TouchableOpacity
              style={[
                styles.removeBtn,
                { borderColor: isDark ? "#5a3030" : "#fecaca" },
              ]}
              onPress={() => handleRemove(item.bookId)}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#f6f5f3" },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? "#2a2420" : "#f6f5f3",
            borderBottomColor: isDark ? "#3d3430" : "#e8e5e0",
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <Ionicons name="heart" size={22} color="#ef4444" />
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#f5f0e8" : "#1a1a1a" },
            ]}
          >
            Yêu thích
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{items.length}</Text>
          </View>
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons
            name="heart-outline"
            size={64}
            color={isDark ? "#4a4340" : "#ddd"}
          />
          <Text
            style={[styles.emptyTitle, { color: isDark ? "#8a8580" : "#888" }]}
          >
            Chưa có sách yêu thích
          </Text>
          <Text
            style={[styles.emptySubtitle, { color: isDark ? "#6a6560" : "#aaa" }]}
          >
            Nhấn biểu tượng ❤️ ở trang chi tiết sách để thêm vào đây
          </Text>
          <TouchableOpacity
            style={[styles.browseBtn, { backgroundColor: colors.tint }]}
            onPress={() => router.push("/")}
          >
            <Text style={styles.browseBtnText}>Khám phá sách</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.bookId)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  countBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ef4444",
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", marginTop: 8 },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  browseBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  listContent: { padding: 16 },

  card: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    padding: 12,
    gap: 12,
  },
  thumbWrap: {
    width: 72,
    height: 96,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbImage: { width: "100%", height: "100%" },

  infoWrap: { flex: 1 },
  bookTitle: { fontSize: 14, fontWeight: "700", lineHeight: 19, marginBottom: 2 },
  bookAuthor: { fontSize: 12, marginBottom: 4 },
  bookPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#b45309",
    marginBottom: 8,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { fontSize: 13, fontWeight: "700", width: 28, textAlign: "center" },

  cartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  cartBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  removeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
  },
});
