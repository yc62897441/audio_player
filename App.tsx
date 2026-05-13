import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastOverlay } from "./src/components/common/Toast";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
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
