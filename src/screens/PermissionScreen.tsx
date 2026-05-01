import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PermissionScreen() {
    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.topSection}>
                    <View style={styles.hero}>
                        <Text style={styles.placeholder}>
                            Hero (圖示 + 標題 + 說明)
                        </Text>
                    </View>

                    <View style={styles.privacyList}>
                        <Text style={styles.placeholder}>
                            PrivacyList (3 項隱私承諾)
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <Text style={styles.placeholder}>
                        Actions (允許存取 / 稍後再說)
                    </Text>
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
        minHeight: 200,
    },
    privacyList: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        minHeight: 116,
        justifyContent: "center",
        alignItems: "center",
    },
    actions: {
        marginTop: 24,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 116,
    },
    placeholder: {
        color: "#9CA3AF",
        fontSize: 14,
    },
});
