import { useNavigation } from "@react-navigation/native";
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMediaPermissions } from "../hooks/usePermissions";

export default function PermissionScreen() {
    const navigation = useNavigation();
    const { hasPermission, canAskAgain, requestPermission } =
        useMediaPermissions();

    const handleRequest = async () => {
        if (hasPermission) {
            navigation.navigate("Library" as never);
            return;
        }
        if (!canAskAgain) {
            Linking.openSettings();
            return;
        }
        const result = await requestPermission();
        if (result.granted) {
            navigation.navigate("Library" as never);
        }
    };

    const buttonLabel = hasPermission
        ? "已授權,前往媒體庫"
        : !canAskAgain
          ? "前往系統設定開啟權限"
          : "允許存取媒體";

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.topSection}>
                    <View style={styles.hero}>
                        <Text style={styles.heroTitle}>授權存取媒體</Text>
                        <Text style={styles.heroDesc}>
                            為了讀取你裝置中的影片與音樂檔案,App 需要取得媒體庫存取權。
                        </Text>
                    </View>

                    <View style={styles.privacyList}>
                        <Text style={styles.privacyItem}>• 僅讀取本機檔案</Text>
                        <Text style={styles.privacyItem}>
                            • 不上傳任何資料到雲端
                        </Text>
                        <Text style={styles.privacyItem}>
                            • 隨時可在系統設定中撤銷授權
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Pressable
                        onPress={handleRequest}
                        style={({ pressed }) => [
                            styles.primaryButton,
                            pressed && styles.primaryButtonPressed,
                        ]}
                    >
                        <Text style={styles.primaryButtonText}>
                            {buttonLabel}
                        </Text>
                    </Pressable>

                    {hasPermission ? (
                        <Text style={styles.statusText}>權限已開啟 ✓</Text>
                    ) : !canAskAgain ? (
                        <Text style={styles.statusText}>
                            已被拒絕,請至系統設定手動開啟
                        </Text>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 32,
        paddingTop: 80,
        paddingBottom: 24,
    },
    topSection: {
        flex: 1,
    },
    hero: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 40,
        minHeight: 160,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 12,
    },
    heroDesc: {
        fontSize: 14,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 20,
    },
    privacyList: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        gap: 8,
    },
    privacyItem: {
        color: "#374151",
        fontSize: 13,
    },
    actions: {
        marginTop: 24,
        alignItems: "stretch",
        justifyContent: "center",
        gap: 12,
    },
    primaryButton: {
        backgroundColor: "#2663EB",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
    },
    primaryButtonPressed: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    statusText: {
        color: "#6B7280",
        fontSize: 12,
        textAlign: "center",
    },
});
