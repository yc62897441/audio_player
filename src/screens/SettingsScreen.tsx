import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.placeholder}>Header (返回 + 設定)</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.sectionTitle}>
                    <Text style={styles.placeholder}>跳轉秒數</Text>
                </View>

                <View style={styles.settingsCard}>
                    <Text style={styles.placeholder}>
                        SettingsCard (4 列 Stepper)
                    </Text>
                </View>

                <View style={styles.resetButton}>
                    <Text style={styles.placeholder}>重設為預設值</Text>
                </View>

                <View style={styles.footerNote}>
                    <Text style={styles.placeholder}>FooterNote (說明文字)</Text>
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
    header: {
        height: 56,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 24,
    },
    sectionTitle: {
        height: 48,
        paddingHorizontal: 20,
        justifyContent: "center",
    },
    settingsCard: {
        marginHorizontal: 20,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        minHeight: 275,
        justifyContent: "center",
        alignItems: "center",
    },
    resetButton: {
        marginTop: 24,
        marginHorizontal: 20,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    footerNote: {
        marginTop: 16,
        paddingHorizontal: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    placeholder: {
        color: "#9CA3AF",
        fontSize: 14,
    },
});
