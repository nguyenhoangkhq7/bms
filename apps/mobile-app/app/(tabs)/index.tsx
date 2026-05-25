import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { bookService } from "@/src/api/bookService";
import { categoryService } from "@/src/api/categoryService";
import { cartService } from "@/src/api/cartService";
import { useAuth } from "@/src/auth/context";
import type { Book, Category } from "@/src/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

interface TreeCategory extends Category {
  parentId?: number | null;
  subCategories?: Category[];
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];
  const { user, isSignedIn } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState("");
  const [categories, setCategories] = useState<TreeCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [addingBookId, setAddingBookId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Record<number, boolean>>({});

  const getSelectedCategoryName = () => {
    if (!selectedCategory) return "";
    for (const cat of categories) {
      if (cat.id === selectedCategory) return cat.name;
      const sub = cat.subCategories?.find((s) => s.id === selectedCategory);
      if (sub) return `${cat.name} > ${sub.name}`;
    }
    return "Danh mục";
  };

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("[Home] Fetching categories...");
        const rawCats = (await categoryService.getAllCategories()) as (Category & { parentId: number | null })[];
        console.log("[Home] Raw categories count:", rawCats?.length);
        console.log("[Home] Raw categories sample:", rawCats?.slice(0, 3));
        
        const parents = rawCats.filter((c) => c.parentId === null || c.parentId === undefined);
        console.log("[Home] Parents count:", parents?.length);
        
        const tree: TreeCategory[] = parents.map((p) => ({
          ...p,
          subCategories: rawCats.filter((c) => c.parentId === p.id),
        }));
        console.log("[Home] Tree categories built successfully, count:", tree.length);
        setCategories(tree);
      } catch (err) {
        console.error("[Home] Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Load books
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      if (searchSubmitted) {
        const data = await bookService.hybridSearchBooks(
          searchSubmitted,
          20,
          0,
          selectedCategory
            ? { categoryIdsCsv: String(selectedCategory) }
            : undefined,
        );
        setBooks(data);
      } else {
        const data = await bookService.getAllBooks();
        setBooks(data);
      }
    } catch (err) {
      console.error("[Home] Error fetching books:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách sách.");
    } finally {
      setLoading(false);
    }
  }, [searchSubmitted, selectedCategory]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  }, [fetchBooks]);

  const handleSearch = () => {
    setSearchSubmitted(searchQuery.trim());
  };

  const handleAddToCart = async (bookId: number) => {
    if (!isSignedIn || !user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để thêm vào giỏ hàng.");
      return;
    }
    try {
      setAddingBookId(bookId);
      await cartService.addToCart({
        userId: user.id,
        bookId,
        quantity: 1,
      });
      Alert.alert("Thành công", "Đã thêm vào giỏ hàng!");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.message || "Không thể thêm vào giỏ hàng.");
    } finally {
      setAddingBookId(null);
    }
  };

  // Filter books by category (client-side for non-search mode)
  const filteredBooks = books.filter((book) => {
    if (book.isDeleted) return false;
    if (!selectedCategory) return true;
    if (searchSubmitted) return true; // server already filtered

    const catId = book.category?.id || book.categoryId;
    if (catId === selectedCategory) return true;

    // Check if selected is a parent category
    const parentCat = categories.find((c) => c.id === selectedCategory);
    if (parentCat?.subCategories?.some((sub) => sub.id === catId)) return true;

    return false;
  });

  const renderBookCard = ({ item }: { item: Book }) => {
    const totalReviews = item.reviews?.length ?? 0;
    const avgRating =
      totalReviews > 0
        ? Math.round(
            item.reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews,
          )
        : 0;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#2a2520" : "#fff",
            borderColor: isDark ? "#3d3430" : "#f0eeec",
            width: CARD_WIDTH,
          },
        ]}
        activeOpacity={0.7}
        onPress={() => router.push(`/book/${item.id}` as any)}
      >
        {/* Image */}
        <View
          style={[
            styles.cardImageWrap,
            { backgroundColor: isDark ? "#362f2a" : "#f5f3f0" },
          ]}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="book-outline"
              size={40}
              color={isDark ? "#5a5350" : "#ccc"}
            />
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text
            style={[styles.cardTitle, { color: isDark ? "#f5f0e8" : "#1a1a1a" }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.cardAuthor, { color: isDark ? "#a09890" : "#888" }]}
            numberOfLines={1}
          >
            {item.author || "Không rõ tác giả"}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= avgRating ? "star" : "star-outline"}
                size={12}
                color={star <= avgRating ? "#f59e0b" : isDark ? "#5a5350" : "#ddd"}
              />
            ))}
            <Text
              style={[
                styles.ratingCount,
                { color: isDark ? "#7a7570" : "#aaa" },
              ]}
            >
              ({totalReviews})
            </Text>
          </View>

          {/* Price + Stock */}
          <View style={styles.priceRow}>
            <Text style={styles.cardPrice}>
              {item.price?.toLocaleString()}đ
            </Text>
            <Text
              style={[
                styles.stockBadge,
                {
                  color:
                    (item.stockQuantity ?? 0) > 0 ? "#16a34a" : "#ef4444",
                },
              ]}
            >
              {(item.stockQuantity ?? 0) > 0 ? "Còn" : "Hết"}
            </Text>
          </View>
        </View>

        {/* Add to Cart */}
        <TouchableOpacity
          style={[
            styles.addCartBtn,
            {
              opacity:
                addingBookId === item.id || (item.stockQuantity ?? 0) === 0
                  ? 0.5
                  : 1,
            },
          ]}
          onPress={() => handleAddToCart(item.id)}
          disabled={addingBookId === item.id || (item.stockQuantity ?? 0) === 0}
        >
          {addingBookId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cart-outline" size={14} color="#fff" />
              <Text style={styles.addCartText}>Thêm giỏ</Text>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
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
        <View style={styles.headerTop}>
          <View style={styles.logoRow}>
            <Ionicons name="book" size={24} color={colors.tint} />
            <Text
              style={[styles.logoText, { color: isDark ? "#f5f0e8" : "#1a1a1a" }]}
            >
              BookHaven
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? "#362f2a" : "#fff",
                borderColor: isDark ? "#4a4340" : "#e0ddd8",
              },
            ]}
          >
            <Ionicons
              name="search"
              size={18}
              color={isDark ? "#8a8580" : "#999"}
            />
            <TextInput
              style={[
                styles.searchInput,
                { color: isDark ? "#f5f0e8" : "#1a1a1a" },
              ]}
              placeholder="Tìm kiếm sách..."
              placeholderTextColor={isDark ? "#6a6560" : "#aaa"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSearchSubmitted("");
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={isDark ? "#6a6560" : "#bbb"}
                />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              {
                backgroundColor: selectedCategory ? colors.tint : (isDark ? "#362f2a" : "#fff"),
                borderColor: selectedCategory ? colors.tint : (isDark ? "#4a4340" : "#e0ddd8"),
              },
            ]}
            onPress={() => setDrawerOpen(true)}
          >
            <Ionicons
              name="funnel"
              size={18}
              color={selectedCategory ? "#fff" : (isDark ? "#c0b8b0" : "#666")}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filter Indicator */}
      {selectedCategory && (
        <View
          style={[
            styles.activeFilterBar,
            {
              backgroundColor: isDark ? "#2a2420" : "#f0eeec",
              borderBottomColor: isDark ? "#3d3430" : "#e8e5e0",
            },
          ]}
        >
          <Text
            style={[
              styles.activeFilterText,
              { color: isDark ? "#c0b8b0" : "#555" },
            ]}
            numberOfLines={1}
          >
            Đang lọc: {getSelectedCategoryName()}
          </Text>
          <TouchableOpacity
            style={styles.clearFilterBtn}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="close-circle" size={16} color={colors.tint} />
            <Text style={[styles.clearFilterText, { color: colors.tint }]}>Bỏ lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Book List */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text
            style={[styles.loadingText, { color: isDark ? "#8a8580" : "#999" }]}
          >
            Đang tải sách...
          </Text>
        </View>
      ) : filteredBooks.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons
            name="book-outline"
            size={56}
            color={isDark ? "#4a4340" : "#ddd"}
          />
          <Text
            style={[styles.emptyText, { color: isDark ? "#7a7570" : "#999" }]}
          >
            {searchSubmitted
              ? "Không tìm thấy sách phù hợp"
              : "Không có sách nào"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookCard}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
            />
          }
        />
      )}

      {/* Sidebar Drawer Modal */}
      <Modal
        visible={drawerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          {/* Backdrop overlay */}
          <TouchableWithoutFeedback onPress={() => setDrawerOpen(false)}>
            <View style={styles.drawerBackdrop} />
          </TouchableWithoutFeedback>

          {/* Drawer content */}
          <View
            style={[
              styles.drawerContent,
              { backgroundColor: isDark ? "#241f1c" : "#fff" },
            ]}
          >
            {/* Drawer Header */}
            <View
              style={[
                styles.drawerHeader,
                { borderBottomColor: isDark ? "#3d3430" : "#eee" },
              ]}
            >
              <Text
                style={[
                  styles.drawerTitle,
                  { color: isDark ? "#f5f0e8" : "#1a1a1a" },
                ]}
              >
                Danh mục sách
              </Text>
              <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#a09890" : "#666"}
                />
              </TouchableOpacity>
            </View>

            {/* Scrollable List */}
            <ScrollView contentContainerStyle={styles.drawerScroll} showsVerticalScrollIndicator={false}>
              {/* Tất cả sách */}
              <TouchableOpacity
                style={[
                  styles.drawerItem,
                  !selectedCategory && styles.drawerItemActive,
                  { backgroundColor: !selectedCategory ? (isDark ? "#362f2a" : "#f5f3f0") : "transparent" },
                ]}
                onPress={() => {
                  setSelectedCategory(null);
                  setDrawerOpen(false);
                }}
              >
                <Ionicons
                  name="grid-outline"
                  size={18}
                  color={!selectedCategory ? colors.tint : (isDark ? "#a09890" : "#666")}
                />
                <Text
                  style={[
                    styles.drawerItemText,
                    {
                      color: !selectedCategory ? colors.tint : (isDark ? "#f5f0e8" : "#333"),
                      fontWeight: !selectedCategory ? "700" : "500",
                    },
                  ]}
                >
                  Tất cả sách
                </Text>
              </TouchableOpacity>

              {/* Parents + Subs Tree */}
              {categories.map((cat) => {
                const isExpanded = !!expandedParents[cat.id];
                const isParentSelected = selectedCategory === cat.id;
                const hasSubs = cat.subCategories && cat.subCategories.length > 0;

                return (
                  <View key={cat.id} style={styles.parentContainer}>
                    <View style={styles.parentRow}>
                      <TouchableOpacity
                        style={[
                          styles.parentClickable,
                          isParentSelected && styles.drawerItemActive,
                          {
                            backgroundColor: isParentSelected
                              ? isDark
                                ? "#362f2a"
                                : "#f5f3f0"
                              : "transparent",
                          },
                        ]}
                        onPress={() => {
                          setSelectedCategory(isParentSelected ? null : cat.id);
                          setDrawerOpen(false);
                        }}
                      >
                        <Ionicons
                          name="folder-outline"
                          size={18}
                          color={isParentSelected ? colors.tint : (isDark ? "#a09890" : "#666")}
                        />
                        <Text
                          style={[
                            styles.drawerItemText,
                            {
                              color: isParentSelected ? colors.tint : (isDark ? "#f5f0e8" : "#333"),
                              fontWeight: isParentSelected ? "700" : "500",
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>

                      {hasSubs && (
                        <TouchableOpacity
                          style={styles.expandBtn}
                          onPress={() => {
                            setExpandedParents((prev) => ({
                              ...prev,
                              [cat.id]: !prev[cat.id],
                            }));
                          }}
                        >
                          <Ionicons
                            name={isExpanded ? "chevron-down" : "chevron-forward"}
                            size={18}
                            color={isDark ? "#a09890" : "#888"}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Subcategories */}
                    {isExpanded &&
                      hasSubs &&
                      cat.subCategories!.map((sub) => {
                        const isSubSelected = selectedCategory === sub.id;
                        return (
                          <TouchableOpacity
                            key={sub.id}
                            style={[
                              styles.subItem,
                              isSubSelected && styles.drawerItemActive,
                              {
                                backgroundColor: isSubSelected
                                  ? isDark
                                    ? "#362f2a"
                                    : "#f5f3f0"
                                  : "transparent",
                              },
                            ]}
                            onPress={() => {
                              setSelectedCategory(isSubSelected ? null : sub.id);
                              setDrawerOpen(false);
                            }}
                          >
                            <View
                              style={[
                                styles.subItemDot,
                                { backgroundColor: isSubSelected ? colors.tint : (isDark ? "#5a5350" : "#ccc") },
                              ]}
                            />
                            <Text
                              style={[
                                styles.subItemText,
                                {
                                  color: isSubSelected ? colors.tint : (isDark ? "#c0b8b0" : "#555"),
                                  fontWeight: isSubSelected ? "700" : "400",
                                },
                              ]}
                              numberOfLines={1}
                            >
                              {sub.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingTop: 4,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    flex: 1,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  activeFilterBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  clearFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clearFilterText: {
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 4,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  drawerBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  drawerContent: {
    width: "75%",
    height: "100%",
    elevation: 16,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  drawerScroll: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  drawerItemText: {
    fontSize: 15,
    marginLeft: 8,
  },
  parentContainer: {
    marginBottom: 4,
  },
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  parentClickable: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  expandBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingLeft: 36,
    paddingRight: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  subItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  subItemText: {
    fontSize: 14,
  },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14 },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  emptyText: { fontSize: 15, fontWeight: "500" },

  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 4,
    paddingBottom: 20,
  },
  row: { justifyContent: "space-between", marginBottom: CARD_GAP },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardImageWrap: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: { width: "100%", height: "100%" },
  cardInfo: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 4 },
  cardTitle: { fontSize: 13, fontWeight: "700", lineHeight: 18, marginBottom: 2 },
  cardAuthor: { fontSize: 11, marginBottom: 6 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 6 },
  ratingCount: { fontSize: 10, marginLeft: 4 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardPrice: { fontSize: 15, fontWeight: "800", color: "#b45309" },
  stockBadge: { fontSize: 10, fontWeight: "700" },

  addCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
  },
  addCartText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
