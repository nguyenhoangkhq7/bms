import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { bookService } from "@/src/api/bookService";
import { reviewService } from "@/src/api/reviewService";
import { cartService } from "@/src/api/cartService";
import { useWishlist } from "@/src/wishlist/context";
import { useAuth } from "@/src/auth/context";
import type { Book, Review } from "@/src/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];
  const { user, isSignedIn } = useAuth();
  const { toggleItem, isInWishlist } = useWishlist();

  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const wishlisted = book ? isInWishlist(book.id) : false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const bookData = await bookService.getBookById(Number(id));
        setBook(bookData);

        try {
          const fetchedReviews = await reviewService.getReviewsOfBook(
            Number(id),
          );
          setReviews(
            (fetchedReviews || []).sort((a, b) => {
              const dateA = a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
              const dateB = b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
              return dateB - dateA;
            }),
          );
        } catch {
          // reviews fail silently
        }
      } catch (err) {
        console.error("[Detail] Error:", err);
        Alert.alert("Lỗi", "Không thể tải thông tin sách.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const allImages = book
    ? [
        { imageUrl: book.imageUrl, id: "cover" },
        ...(book.secondaryImages || []),
      ].filter((img) => img.imageUrl)
    : [];

  const handleAddToCart = async () => {
    if (!isSignedIn || !user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để thêm vào giỏ hàng.");
      return;
    }
    if (!book) return;

    try {
      setAddingToCart(true);
      await cartService.addToCart({
        userId: user.id,
        bookId: book.id,
        quantity,
      });
      Alert.alert("Thành công", "Đã thêm vào giỏ hàng!");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể thêm vào giỏ hàng.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = () => {
    if (!book) return;
    toggleItem({
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      imageUrl: book.imageUrl,
      addedAt: new Date().toISOString(),
    });
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0";

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.centerWrap,
          { backgroundColor: isDark ? "#1a1a1a" : "#f6f5f3" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text
          style={[styles.loadingText, { color: isDark ? "#8a8580" : "#999" }]}
        >
          Đang tải thông tin sách...
        </Text>
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView
        style={[
          styles.centerWrap,
          { backgroundColor: isDark ? "#1a1a1a" : "#f6f5f3" },
        ]}
      >
        <Ionicons
          name="book-outline"
          size={56}
          color={isDark ? "#4a4340" : "#ddd"}
        />
        <Text
          style={[styles.emptyText, { color: isDark ? "#8a8580" : "#999" }]}
        >
          Không tìm thấy sách
        </Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.tint }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1a1a1a" : "#f6f5f3" },
      ]}
    >
      {/* Top Nav */}
      <View
        style={[
          styles.topNav,
          {
            backgroundColor: isDark ? "#2a2420" : "#f6f5f3",
            borderBottomColor: isDark ? "#3d3430" : "#e8e5e0",
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.navBtn}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={isDark ? "#f5f0e8" : "#1a1a1a"}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.navTitle,
            { color: isDark ? "#f5f0e8" : "#1a1a1a" },
          ]}
          numberOfLines={1}
        >
          Chi tiết sách
        </Text>
        <TouchableOpacity
          onPress={handleToggleWishlist}
          style={styles.navBtn}
        >
          <Ionicons
            name={wishlisted ? "heart" : "heart-outline"}
            size={24}
            color={wishlisted ? "#ef4444" : isDark ? "#8a8580" : "#999"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Gallery */}
        <View
          style={[
            styles.imageSection,
            { backgroundColor: isDark ? "#2a2520" : "#f0eee8" },
          ]}
        >
          {allImages.length > 0 ? (
            <Image
              source={{ uri: allImages[selectedImageIndex]?.imageUrl }}
              style={styles.mainImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons
                name="image-outline"
                size={64}
                color={isDark ? "#4a4340" : "#ccc"}
              />
            </View>
          )}
        </View>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbStrip}
          >
            {allImages.map((img, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.thumbItem,
                  {
                    borderColor:
                      selectedImageIndex === idx
                        ? "#7c3aed"
                        : isDark
                          ? "#3d3430"
                          : "#e0ddd8",
                    borderWidth: selectedImageIndex === idx ? 2 : 1,
                  },
                ]}
                onPress={() => setSelectedImageIndex(idx)}
              >
                <Image
                  source={{ uri: img.imageUrl }}
                  style={styles.thumbImg}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Book Info */}
        <View style={styles.infoSection}>
          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, styles.categoryBadge]}>
              <Ionicons name="book-outline" size={12} color="#6d28d9" />
              <Text style={styles.categoryBadgeText}>
                {book.category?.name || "Không rõ thể loại"}
              </Text>
            </View>
            {book.author && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDark ? "#2a2520" : "#f3f4f6",
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={12}
                  color={isDark ? "#a09890" : "#4b5563"}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: isDark ? "#c0b8b0" : "#4b5563" },
                  ]}
                >
                  {book.author}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text
            style={[
              styles.bookTitle,
              { color: isDark ? "#f5f0e8" : "#1e1b4b" },
            ]}
          >
            {book.title}
          </Text>

          {/* Rating */}
          {reviews.length > 0 && (
            <View style={styles.ratingRow}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={
                      star <= Math.round(Number(avgRating))
                        ? "star"
                        : "star-outline"
                    }
                    size={16}
                    color={
                      star <= Math.round(Number(avgRating))
                        ? "#f59e0b"
                        : isDark
                          ? "#5a5350"
                          : "#e5e7eb"
                    }
                  />
                ))}
              </View>
              <Text
                style={[
                  styles.ratingValue,
                  { color: isDark ? "#f5f0e8" : "#1f2937" },
                ]}
              >
                {avgRating}
              </Text>
              <Text
                style={[
                  styles.ratingCount,
                  { color: isDark ? "#7a7570" : "#9ca3af" },
                ]}
              >
                ({reviews.length} đánh giá)
              </Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceBox}>
            <Text style={styles.priceText}>
              {book.price?.toLocaleString()} đ
            </Text>
          </View>

          {/* Description */}
          {book.description && (
            <View
              style={[
                styles.descBox,
                {
                  backgroundColor: isDark ? "#2a2520" : "#f9fafb",
                  borderColor: isDark ? "#3d3430" : "#e5e7eb",
                },
              ]}
            >
              <Text
                style={[
                  styles.descLabel,
                  { color: isDark ? "#8a8580" : "#374151" },
                ]}
              >
                MÔ TẢ
              </Text>
              <Text
                style={[
                  styles.descText,
                  { color: isDark ? "#c0b8b0" : "#4b5563" },
                ]}
              >
                {book.description}
              </Text>
            </View>
          )}

          {/* Quantity + Actions */}
          <View style={styles.actionsSection}>
            {/* Quantity */}
            <View style={styles.qtyRow}>
              <Text
                style={[
                  styles.qtyLabel,
                  { color: isDark ? "#c0b8b0" : "#374151" },
                ]}
              >
                Số lượng:
              </Text>
              <View
                style={[
                  styles.qtySelector,
                  {
                    borderColor: isDark ? "#4a4340" : "#e5e7eb",
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    { backgroundColor: isDark ? "#362f2a" : "#f9fafb" },
                  ]}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Text
                    style={[
                      styles.qtyBtnText,
                      { color: isDark ? "#c0b8b0" : "#374151" },
                    ]}
                  >
                    −
                  </Text>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.qtyValue,
                    { color: isDark ? "#f5f0e8" : "#1f2937" },
                  ]}
                >
                  {quantity}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    { backgroundColor: isDark ? "#362f2a" : "#f9fafb" },
                  ]}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Text
                    style={[
                      styles.qtyBtnText,
                      { color: isDark ? "#c0b8b0" : "#374151" },
                    ]}
                  >
                    +
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.addCartButton,
                  {
                    backgroundColor: book.isDeleted
                      ? "#d1d5db"
                      : "#7c3aed",
                    opacity: addingToCart ? 0.7 : 1,
                  },
                ]}
                onPress={handleAddToCart}
                disabled={addingToCart || book.isDeleted}
              >
                {addingToCart ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cart-outline" size={20} color="#fff" />
                    <Text style={styles.addCartText}>
                      {book.isDeleted
                        ? "Ngừng kinh doanh"
                        : "Thêm vào giỏ hàng"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.wishlistButton,
                  {
                    borderColor: wishlisted ? "#ef4444" : isDark ? "#4a4340" : "#e5e7eb",
                    backgroundColor: wishlisted
                      ? "#fef2f2"
                      : isDark
                        ? "#2a2520"
                        : "#fff",
                  },
                ]}
                onPress={handleToggleWishlist}
              >
                <Ionicons
                  name={wishlisted ? "heart" : "heart-outline"}
                  size={22}
                  color={wishlisted ? "#ef4444" : isDark ? "#8a8580" : "#9ca3af"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? "#3d3430" : "#e5e7eb" },
          ]}
        />

        {/* Reviews */}
        <View style={styles.reviewSection}>
          <View style={styles.reviewHeader}>
            <Ionicons name="star" size={20} color="#f59e0b" />
            <Text
              style={[
                styles.reviewTitle,
                { color: isDark ? "#f5f0e8" : "#1e1b4b" },
              ]}
            >
              Đánh giá & Nhận xét
            </Text>
            {reviews.length > 0 && (
              <View style={styles.reviewCountBadge}>
                <Text style={styles.reviewCountText}>{reviews.length}</Text>
              </View>
            )}
          </View>

          {reviews.length === 0 ? (
            <View
              style={[
                styles.noReviewsBox,
                {
                  backgroundColor: isDark ? "#2a2520" : "#f9fafb",
                  borderColor: isDark ? "#3d3430" : "#e5e7eb",
                },
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={32}
                color={isDark ? "#4a4340" : "#d1d5db"}
              />
              <Text
                style={[
                  styles.noReviewsText,
                  { color: isDark ? "#7a7570" : "#6b7280" },
                ]}
              >
                Chưa có đánh giá nào
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View
                key={review.id}
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: isDark ? "#2a2520" : "#fff",
                    borderColor: isDark ? "#3d3430" : "#f0eeec",
                  },
                ]}
              >
                <View style={styles.reviewCardHeader}>
                  <View
                    style={[
                      styles.reviewAvatar,
                      {
                        backgroundColor: isDark ? "#4a4340" : "#c4b5fd",
                      },
                    ]}
                  >
                    <Ionicons name="person" size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.reviewerName,
                        { color: isDark ? "#f5f0e8" : "#1f2937" },
                      ]}
                    >
                      {review.userName || "Ẩn danh"}
                    </Text>
                    <View style={styles.reviewStarsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? "star" : "star-outline"}
                          size={12}
                          color={
                            star <= review.rating
                              ? "#f59e0b"
                              : isDark
                                ? "#4a4340"
                                : "#e5e7eb"
                          }
                        />
                      ))}
                      <Text
                        style={[
                          styles.reviewStarText,
                          { color: isDark ? "#7a7570" : "#9ca3af" },
                        ]}
                      >
                        {review.rating}/5
                      </Text>
                    </View>
                  </View>
                  {review.createdAt && (
                    <Text
                      style={[
                        styles.reviewDate,
                        { color: isDark ? "#6a6560" : "#9ca3af" },
                      ]}
                    >
                      {new Date(
                        review.createdAt.endsWith("Z")
                          ? review.createdAt
                          : review.createdAt + "Z",
                      ).toLocaleDateString("vi-VN")}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.reviewContent,
                    { color: isDark ? "#c0b8b0" : "#4b5563" },
                  ]}
                >
                  {review.content}
                </Text>

                {/* Review Media */}
                {review.mediaUrls && review.mediaUrls.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.reviewMediaScroll}
                  >
                    {review.mediaUrls.map((url, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: url }}
                        style={styles.reviewMediaImg}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15, fontWeight: "500" },
  backBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navBtn: { padding: 6 },
  navTitle: { fontSize: 16, fontWeight: "700", flex: 1, textAlign: "center" },

  scrollContent: { paddingBottom: 40 },

  imageSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  mainImage: {
    width: SCREEN_WIDTH * 0.6,
    height: "100%",
    borderRadius: 12,
  },
  placeholderImage: {
    width: SCREEN_WIDTH * 0.6,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  thumbStrip: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  thumbItem: { width: 56, height: 56, borderRadius: 8, overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%" },

  infoSection: { paddingHorizontal: 20, paddingTop: 16 },

  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  categoryBadge: { backgroundColor: "#ede9fe" },
  categoryBadgeText: { fontSize: 12, fontWeight: "600", color: "#6d28d9" },
  badgeText: { fontSize: 12, fontWeight: "500" },

  bookTitle: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
    marginBottom: 8,
    letterSpacing: -0.3,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  starsRow: { flexDirection: "row", gap: 2 },
  ratingValue: { fontSize: 15, fontWeight: "700" },
  ratingCount: { fontSize: 13 },

  priceBox: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    marginBottom: 16,
  },
  priceText: {
    fontSize: 26,
    fontWeight: "800",
    color: "#b45309",
    letterSpacing: -0.3,
  },

  descBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  descLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descText: { fontSize: 14, lineHeight: 22 },

  actionsSection: { marginBottom: 24 },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  qtyLabel: { fontSize: 14, fontWeight: "600" },
  qtySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  qtyBtn: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: { fontSize: 18, fontWeight: "600" },
  qtyValue: {
    width: 44,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonRow: { flexDirection: "row", gap: 10 },
  addCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addCartText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  wishlistButton: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
  },

  divider: { height: 1, marginHorizontal: 20, marginVertical: 4 },

  reviewSection: { paddingHorizontal: 20, paddingTop: 20 },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  reviewTitle: { fontSize: 20, fontWeight: "800" },
  reviewCountBadge: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  reviewCountText: { fontSize: 12, fontWeight: "600", color: "#7c3aed" },

  noReviewsBox: {
    padding: 30,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    gap: 8,
  },
  noReviewsText: { fontSize: 14, fontWeight: "500" },

  reviewCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewerName: { fontSize: 14, fontWeight: "600" },
  reviewStarsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  reviewStarText: { fontSize: 11, marginLeft: 4 },
  reviewDate: { fontSize: 11 },
  reviewContent: { fontSize: 14, lineHeight: 20, paddingLeft: 44 },

  reviewMediaScroll: { marginTop: 10, paddingLeft: 44 },
  reviewMediaImg: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
});
