import { NavigationContainer } from "@react-navigation/native";
import { setAudioModeAsync } from "expo-audio";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastOverlay } from "./src/components/common/Toast";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: true,
        }).catch((err: unknown) => {
            console.warn("setAudioModeAsync failed:", err);
        });
    }, []);

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <RootNavigator />
                <StatusBar style="auto" />
            </NavigationContainer>
            <ToastOverlay />
        </SafeAreaProvider>
    );
}
