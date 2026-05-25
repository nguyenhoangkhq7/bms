import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WishlistItem } from "../types";

const STORAGE_KEY = "bms_wishlist";

interface WishlistContextValue {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (bookId: number) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (bookId: number) => boolean;
  clearAll: () => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

async function loadFromStorage(): Promise<WishlistItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveToStorage(items: WishlistItem[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    loadFromStorage().then((stored) => {
      setItems(stored);
      setHydrated(true);
    });
  }, []);

  // Persist to AsyncStorage whenever items change (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveToStorage(items);
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.bookId === item.bookId)) return prev;
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeItem = useCallback((bookId: number) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  }, []);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.bookId === item.bookId)) {
        return prev.filter((i) => i.bookId !== item.bookId);
      }
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  }, []);

  const isInWishlist = useCallback(
    (bookId: number) => {
      return items.some((i) => i.bookId === bookId);
    },
    [items],
  );

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        clearAll,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
