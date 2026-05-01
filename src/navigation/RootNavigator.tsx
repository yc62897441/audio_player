import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
    Library as LibraryIcon,
    Lock as LockIcon,
    Play as PlayIcon,
    Settings as SettingsIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LibraryScreen from "../screens/LibraryScreen";
import PermissionScreen from "../screens/PermissionScreen";
import PlayerScreen from "../screens/PlayerScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { colors } from "../theme/colors";

import type { RootTabParamList } from "./types";

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_BAR_CONTENT_HEIGHT = 60;
const TAB_BAR_PADDING_BOTTOM = 8;

export function RootNavigator() {
    // 讀裝置 safe area:Android 手勢列、iOS home indicator 高度都從這裡來,
    // 加進 tabBar 的高度與 padding,避免按鈕被系統手勢區覆蓋。
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            initialRouteName="Library"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: { fontSize: 12 },
                tabBarStyle: {
                    height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
                    paddingTop: 6,
                    paddingBottom: TAB_BAR_PADDING_BOTTOM + insets.bottom,
                    borderTopColor: colors.border,
                },
            }}
        >
            <Tab.Screen
                name="Library"
                component={LibraryScreen}
                options={{
                    title: "媒體庫",
                    tabBarIcon: ({ color, size }) => (
                        <LibraryIcon color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Player"
                component={PlayerScreen}
                options={{
                    title: "播放器",
                    tabBarIcon: ({ color, size }) => (
                        <PlayIcon color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: "設定",
                    tabBarIcon: ({ color, size }) => (
                        <SettingsIcon color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Permission"
                component={PermissionScreen}
                options={{
                    title: "權限",
                    tabBarIcon: ({ color, size }) => (
                        <LockIcon color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
