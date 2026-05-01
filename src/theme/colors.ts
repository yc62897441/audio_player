/**
 * 設計 token — 集中管理顏色,所有 UI 元件透過此檔取色,
 * 後續若導入 NativeWind,可同步映射到 tailwind.config.js。
 */
export const colors = {
    // 品牌色
    primary: "#2663EB",
    primaryPressed: "#1D4ED8",
    primarySoft: "#DBEAFE",

    // 背景 / 表面
    background: "#FFFFFF",
    surface: "#F3F4F6",
    surfaceMuted: "#F9FAFB",

    // 文字
    textPrimary: "#111827",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    textDisabled: "#D1D5DB",
    textInverse: "#FFFFFF",

    // 線條
    border: "#E5E7EB",
    divider: "#E5E7EB",

    // 狀態
    success: "#10B981",
    danger: "#EF4444",
} as const;

export type ColorToken = keyof typeof colors;
