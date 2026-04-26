/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

// Color Palette
const creamLight = "#F5F0E8"; // Nền chính
const beigeDark = "#D4C4B0"; // Menu/Footer
const textDark = "#1a1a1a"; // Text
const royalBlue = "#1F4788"; // Buttons
const royalBlueDark = "#2C5AA0"; // Button hover

export const Colors = {
  light: {
    text: textDark, // #1a1a1a - Đen
    background: creamLight, // #F5F0E8 - Kem nhạt
    tint: royalBlue, // #1F4788 - Xanh hoàng gia
    icon: beigeDark, // #D4C4B0 - Be tối
    tabIconDefault: beigeDark, // #D4C4B0
    tabIconSelected: royalBlue, // #1F4788
    headerBackground: beigeDark, // #D4C4B0 - Be tối cho header
    cardBackground: "#FDFBF7", // Kem rất nhạt cho cards
  },
  dark: {
    text: creamLight, // #F5F0E8
    background: "#2a2420", // Brown-dark
    tint: royalBlueDark, // #2C5AA0
    icon: beigeDark, // #D4C4B0
    tabIconDefault: beigeDark, // #D4C4B0
    tabIconSelected: royalBlueDark, // #2C5AA0
    headerBackground: "#3d3430", // Darker brown
    cardBackground: "#362f2a", // Darker card bg
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
