import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
    Library as LibraryIcon,
    Lock as LockIcon,
    Play as PlayIcon,
    Settings as SettingsIcon,
} from "lucide-react-native";

import LibraryScreen from "../screens/LibraryScreen";
import PermissionScreen from "../screens/PermissionScreen";
import PlayerScreen from "../screens/PlayerScreen";
import SettingsScreen from "../screens/SettingsScreen";

import type { RootTabParamList } from "./types";

const Tab = createBottomTabNavigator<RootTabParamList>();

const PRIMARY_COLOR = "#2663EB";
const INACTIVE_COLOR = "#9CA3AF";

export function RootNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="Library"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: PRIMARY_COLOR,
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarLabelStyle: { fontSize: 12 },
                tabBarStyle: {
                    height: 60,
                    paddingTop: 6,
                    paddingBottom: 8,
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
