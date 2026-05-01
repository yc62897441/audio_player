# CLAUDE.md

> 此檔案提供給 Claude Code 在處理本專案時參考。內容涵蓋專案需求、技術選型、架構規劃與開發約定。

---

## 一、專案概述

### 1.1 專案名稱
**本地影音播放器 App**(暫定)

### 1.2 專案目標
開發一款跨平台(iOS / Android)行動應用程式,讓使用者能讀取並播放裝置本地端的影片與音樂檔案,並可自訂跳轉秒數。最終目標為上架 Apple App Store 與 Google Play。

### 1.3 目標平台
- **Android**(主要設計尺寸基準:360 × 800)
- **iOS**

### 1.4 設計檔案
- Figma 連結:`https://www.figma.com/design/OBQS4Cgezu1q2JBLlizh4l`
- 視覺風格:中性現代(跨平台通用)
- 主色調:藍色系(`#2663EB`)
- 不需深色模式(初版)

---

## 二、功能需求

### 2.1 核心功能(MVP)

#### 功能 1:本地影音檔案讀取與播放
讀取使用者裝置本機的影片與音樂檔案並進行播放。

**需支援的影片格式**(以原生格式為主)
| 格式 | 副檔名 | 備註 |
|---|---|---|
| MP4 | `.mp4`, `.m4v` | 最通用 |
| MOV | `.mov` | iPhone 預設錄製格式 |
| WebM | `.webm` | Android 原生支援 |
| 3GP | `.3gp` | 雙平台原生支援 |
| MKV | `.mkv` | Android 原生支援(iOS 不支援) |

**需支援的音樂格式**
| 格式 | 副檔名 | 備註 |
|---|---|---|
| MP3 | `.mp3` | 最通用 |
| AAC / M4A | `.aac`, `.m4a` | 雙平台原生支援 |
| FLAC | `.flac` | 無損音質 |
| WAV | `.wav` | 無損未壓縮 |
| OGG | `.ogg` | Android 原生支援 |

> 註:第一版以原生格式為主。MKV / AVI / FLV / WMV / WMA 等需第三方解碼器(如 FFmpeg / libVLC)的格式,留待後續版本評估。

#### 功能 2:播放控制列
七顆操作按鈕,排列順序如下:

| 順序 | 按鈕 | 行為 |
|---|---|---|
| 1 | 上一首 | 切換到清單中的前一個檔案 |
| 2 | 倒轉(多) | 倒轉 N 秒,N 由設定頁決定(預設 30) |
| 3 | 倒轉(少) | 倒轉 N 秒,N 由設定頁決定(預設 10) |
| 4 | 暫停/播放 | 切換播放狀態 |
| 5 | 快進(少) | 快進 N 秒,N 由設定頁決定(預設 10) |
| 6 | 快進(多) | 快進 N 秒,N 由設定頁決定(預設 30) |
| 7 | 下一首 | 切換到清單中的下一個檔案 |

#### 功能 3:設定頁
可自訂以下四個跳轉秒數:
- 倒轉(多)— 預設 30 秒
- 倒轉(少)— 預設 10 秒
- 快進(少)— 預設 10 秒
- 快進(多)— 預設 30 秒

**規格細節**
- 使用 stepper 介面(− / 數值 / +)避免使用者輸入無效值
- 數值範圍限制:5 ~ 120 秒
- 設定值需持久化儲存於 App 本地端(使用 AsyncStorage)
- 設定變更後即時生效並同步顯示於播放器按鈕上
- 提供「重設為預設值」按鈕

### 2.2 必要 UX 細節

| 項目 | 說明 |
|---|---|
| 權限請求引導 | 首次開啟需引導使用者授權存取本機媒體檔案 |
| 空狀態 | 無檔案時顯示引導畫面與「選擇檔案」CTA 按鈕 |
| 影片/音樂分頁 | 檔案列表頁以 Tabs 切換顯示影片或音樂 |

### 2.3 上架必備項目

#### Apple App Store
- Apple Developer 帳號(USD $99/年)
- 隱私權政策網址
- App 隱私權營養標籤(宣告會讀取使用者媒體檔案)
- 螢幕截圖(6.7 吋與 6.5 吋)
- `Info.plist` 權限說明文字(`NSPhotoLibraryUsageDescription` 等)

#### Google Play
- Google Play Console 帳號(一次性 USD $25)
- 隱私權政策網址
- 資料安全聲明
- 內容分級問卷
- 各尺寸宣傳圖

---

## 三、UI 頁面規劃

依 Figma 設計,共 5 個畫面:

| # | 畫面名稱 | 說明 |
|---|---|---|
| 01 | 檔案列表頁 | 標題列 + 影片/音樂分頁 + 檔案項目列表 |
| 02 | 檔案列表頁(空狀態) | 大圖示引導 + 「選擇檔案」CTA |
| 03 | 播放器頁 | 影片/音樂共用 UI、進度條、七顆控制按鈕 |
| 04 | 設定頁 | 四個 stepper 設定項 + 重設按鈕 |
| 05 | 權限請求引導 | 隱私承諾說明 + 允許存取按鈕 |

---

## 四、技術選型

### 4.1 核心技術棧

| 類別 | 技術 | 版本/備註 |
|---|---|---|
| 開發框架 | **Expo (Managed Workflow)** | SDK 51+ |
| 程式語言 | **TypeScript** | 5.x |
| UI 函式庫 | **React Native** | 跟隨 Expo SDK |
| 路由 | **React Navigation** | v6+,使用 Native Stack + Bottom Tabs |
| 狀態管理 | **Zustand** | 輕量、無樣板程式碼 |
| 樣式 | **NativeWind** | Tailwind CSS for React Native |
| 本地儲存 | **AsyncStorage** | `@react-native-async-storage/async-storage` |
| 圖示 | **lucide-react-native** | 與 web 版一致的圖示集 |

### 4.2 影音播放套件

| 套件 | 用途 |
|---|---|
| `expo-video` | 影片播放(Expo SDK 51+ 推出,取代 expo-av) |
| `expo-audio` | 音樂播放 |
| `expo-document-picker` | 選擇本地檔案 |
| `expo-media-library` | 讀取媒體庫 |
| `expo-file-system` | 檔案系統存取 |

### 4.3 程式碼品質工具

| 工具 | 用途 |
|---|---|
| ESLint | 程式碼靜態檢查(`eslint-config-expo` + `@typescript-eslint`) |
| Prettier | 程式碼格式化 |
| Husky | Git hooks 管理 |
| lint-staged | commit 前僅檢查變更檔案 |
| commitlint(可選) | 強制 conventional commits |

### 4.4 開發環境

| 工具 | 版本 |
|---|---|
| Node.js | 20 LTS |
| 套件管理 | **pnpm**(依個人偏好) |
| Expo CLI | 最新版 |
| EAS CLI | 用於雲端打包與上架 |

---

## 五、專案結構

```
media-player-app/
├── .expo/                          # Expo 自動產生
├── .vscode/
│   └── settings.json               # VSCode 工作區設定
├── assets/                         # 靜態資源
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── src/
│   ├── components/                 # 可重用 UI 元件
│   │   ├── common/                 # 通用元件
│   │   │   ├── Button.tsx
│   │   │   ├── IconButton.tsx
│   │   │   └── Stepper.tsx
│   │   ├── player/                 # 播放器相關元件
│   │   │   ├── PlayerControls.tsx  # 七顆控制按鈕
│   │   │   ├── ProgressBar.tsx     # 進度條
│   │   │   └── MediaArea.tsx       # 影片/封面顯示區
│   │   └── library/                # 檔案列表相關元件
│   │       ├── FileListItem.tsx
│   │       ├── LibraryTabs.tsx
│   │       └── EmptyState.tsx
│   ├── screens/                    # 頁面元件
│   │   ├── LibraryScreen.tsx       # 01 檔案列表頁
│   │   ├── PlayerScreen.tsx        # 03 播放器頁
│   │   ├── SettingsScreen.tsx      # 04 設定頁
│   │   └── PermissionScreen.tsx    # 05 權限請求引導
│   ├── navigation/                 # 路由設定
│   │   ├── RootNavigator.tsx
│   │   └── types.ts                # 路由型別定義
│   ├── stores/                     # Zustand stores
│   │   ├── settingsStore.ts        # 跳轉秒數設定
│   │   ├── playerStore.ts          # 播放器狀態
│   │   └── libraryStore.ts         # 媒體庫資料
│   ├── hooks/                      # 自訂 hooks
│   │   ├── useMediaLibrary.ts      # 讀取本地媒體
│   │   ├── usePermissions.ts       # 權限管理
│   │   └── usePlayer.ts            # 播放器邏輯
│   ├── services/                   # 邏輯服務層
│   │   ├── mediaService.ts         # 媒體檔案處理
│   │   └── storageService.ts       # AsyncStorage 封裝
│   ├── utils/                      # 工具函式
│   │   ├── format.ts               # 時間格式化等
│   │   └── constants.ts            # 常數定義
│   ├── types/                      # 全域 TypeScript 型別
│   │   ├── media.ts
│   │   └── settings.ts
│   └── theme/                      # 設計 token
│       ├── colors.ts
│       └── tailwind.config.ts
├── App.tsx                         # 根元件
├── app.json                        # Expo 設定
├── babel.config.js
├── tsconfig.json
├── tailwind.config.js              # NativeWind 設定
├── nativewind-env.d.ts
├── .eslintrc.js
├── .prettierrc
├── .husky/
│   └── pre-commit
├── package.json
└── CLAUDE.md
```

---

## 六、資料模型

### 6.1 設定 (Settings)

```typescript
interface SkipSettings {
    skipBackLong: number;       // 倒轉(多),預設 30
    skipBackShort: number;      // 倒轉(少),預設 10
    skipForwardShort: number;   // 快進(少),預設 10
    skipForwardLong: number;    // 快進(多),預設 30
}

const DEFAULT_SKIP_SETTINGS: SkipSettings = {
    skipBackLong: 30,
    skipBackShort: 10,
    skipForwardShort: 10,
    skipForwardLong: 30,
};

const SKIP_SECONDS_RANGE = { min: 5, max: 120 };
```

### 6.2 媒體檔案 (MediaFile)

```typescript
type MediaType = "video" | "audio";

interface MediaFile {
    id: string;             // 唯一識別碼
    uri: string;            // 檔案路徑
    filename: string;       // 顯示用檔名
    type: MediaType;        // 影片或音樂
    format: string;         // MP4, MP3 等
    duration: number;       // 秒數
    size: number;           // 檔案大小(bytes)
    createdAt: number;      // 建立時間戳
}
```

### 6.3 播放器狀態 (PlayerState)

```typescript
interface PlayerState {
    currentFile: MediaFile | null;
    playlist: MediaFile[];
    currentIndex: number;
    isPlaying: boolean;
    position: number;       // 目前播放秒數
    duration: number;       // 總長度
}
```

---

## 七、開發約定

### 7.1 命名慣例
- 元件檔案:`PascalCase.tsx`(如 `PlayerControls.tsx`)
- Hook 檔案:`useXxx.ts`(如 `usePlayer.ts`)
- 工具函式檔案:`camelCase.ts`(如 `format.ts`)
- Store 檔案:`xxxStore.ts`(如 `settingsStore.ts`)
- 型別檔案:`camelCase.ts`(如 `media.ts`)
- 常數使用 `SCREAMING_SNAKE_CASE`
- 介面使用 `interface`,聯合型別/工具型別使用 `type`

### 7.2 程式碼風格
- 縮排:**4 個空格**
- 字串:雙引號 `"`
- 結尾分號:必加
- 預設使用 functional component + hooks
- 不使用 default export(除頁面元件與 App.tsx 外)

### 7.3 樣式約定(NativeWind)
- 主色相關 utility 統一定義在 `tailwind.config.js`
- 避免 inline style,優先使用 `className`
- 共用樣式抽出為元件,而非工具函式

### 7.4 Git 提交規範
採用 Conventional Commits:
```
feat: 新增功能
fix: 修正錯誤
refactor: 重構
style: 樣式調整
docs: 文件
chore: 雜項(依賴更新等)
test: 測試相關
```

### 7.5 路徑別名
`tsconfig.json` 設定 `@/*` 對應 `src/*`,避免相對路徑層層回溯:
```typescript
import { Button } from "@/components/common/Button";
```

---

## 八、開發里程碑

### Phase 1:環境建置(Day 1)
- [ ] Expo 專案初始化(TypeScript template)
- [ ] 安裝核心依賴(NativeWind、React Navigation、Zustand)
- [ ] 設定 ESLint / Prettier / Husky / lint-staged
- [ ] 建立資料夾結構與路徑別名
- [ ] 設定 Tailwind 主題色票

### Phase 2:基礎框架(Day 2-3)
- [ ] 設定 RootNavigator 與所有頁面骨架
- [ ] 建立設計系統元件(Button、IconButton、Stepper)
- [ ] 建立 Zustand stores 與 AsyncStorage 持久化邏輯
- [ ] 完成設定頁(可獨立完成,不依賴媒體功能)

### Phase 3:檔案讀取(Day 4-5)
- [ ] 整合 `expo-media-library` 讀取本機媒體
- [ ] 完成權限請求引導頁
- [ ] 完成檔案列表頁(含影片/音樂分頁與空狀態)

### Phase 4:播放器核心(Day 6-8)
- [ ] 整合 `expo-video` 與 `expo-audio`
- [ ] 完成播放器頁 UI
- [ ] 實作七顆控制按鈕邏輯
- [ ] 串接設定值到跳轉行為

### Phase 5:打磨與測試(Day 9-10)
- [ ] iOS / Android 實機測試
- [ ] 各種影音格式相容性測試
- [ ] 邊界情況處理(無檔案、權限被拒、檔案毀損等)
- [ ] 效能調校

### Phase 6:上架準備(Day 11-14)
- [ ] App icon / Splash screen 設計
- [ ] 商店截圖製作
- [ ] 隱私權政策撰寫與託管
- [ ] EAS Build 設定與打包
- [ ] App Store Connect / Play Console 送審

---

## 九、注意事項與已知風險

### 9.1 平台差異
- **MKV 格式**僅 Android 原生支援,iOS 上會無法播放,需在 UI 提示或過濾
- **背景播放**:音樂類 App 必備,需設定 `app.json` 中的 `UIBackgroundModes`
- **Android 13+ 權限變更**:`READ_EXTERNAL_STORAGE` 已被 `READ_MEDIA_VIDEO` / `READ_MEDIA_AUDIO` 取代

### 9.2 Expo Managed Workflow 限制
- 無法加入需要修改原生程式碼的第三方解碼器(如 FFmpeg)
- 若未來需支援 MKV / AVI 等冷門格式,須評估是否轉為 Bare Workflow 或改用 `react-native-vlc-media-player`

### 9.3 上架審核常見地雷
- **iOS**:`Info.plist` 權限說明文字必須具體,不可只寫「需要權限」,要寫明用途
- **Google Play**:資料安全表單需誠實申報,不可遺漏 MediaStore 存取
- **隱私權政策**:必須有公開可訪問的網址,不能只放在 App 內

---

## 十、未來可能擴充

以下功能不在 MVP 範圍,但架構設計時會預留彈性:

- 播放清單管理(自訂播放清單)
- 播放歷史紀錄
- 鎖定畫面控制(MediaSession)
- 耳機線控與藍牙 AVRCP 支援
- 音訊等化器
- 字幕支援(SRT、VTT)
- 深色模式
- 多語系(i18n)
- 雲端同步(iCloud / Google Drive)
- MKV / AVI 等冷門格式支援(透過 FFmpeg / libVLC)

---

## 十一、相關連結

- Expo 文件:https://docs.expo.dev
- React Navigation:https://reactnavigation.org
- Zustand:https://github.com/pmndrs/zustand
- NativeWind:https://www.nativewind.dev
- Expo Video:https://docs.expo.dev/versions/latest/sdk/video
- Expo Audio:https://docs.expo.dev/versions/latest/sdk/audio
- Expo Media Library:https://docs.expo.dev/versions/latest/sdk/media-library

---

**最後更新**:2026-05-01
