import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.placeholder}>Header (我的媒體庫 + 設定按鈕)</Text>
            </View>

            <View style={styles.tabs}>
                <Text style={styles.placeholder}>Tabs (影片 / 音樂)</Text>
            </View>

            <View style={styles.divider} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.contentArea}>
                    <Text style={styles.placeholder}>
                        FileList / EmptyState
                    </Text>
                    <Text style={styles.hint}>
                        (依 libraryStore 狀態切換 01 列表 / 02 空狀態)
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
    header: {
        height: 56,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    tabs: {
        height: 48,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentArea: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    placeholder: {
        color: "#9CA3AF",
        fontSize: 14,
    },
    hint: {
        marginTop: 4,
        color: "#D1D5DB",
        fontSize: 12,
    },
});
