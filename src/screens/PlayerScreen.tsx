import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlayerScreen() {
    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.placeholder}>Header (返回 + 正在播放 + 更多)</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.mediaArea}>
                    <Text style={styles.placeholder}>MediaArea</Text>
                </View>

                <View style={styles.trackInfo}>
                    <Text style={styles.placeholder}>TrackInfo</Text>
                </View>

                <View style={styles.progress}>
                    <Text style={styles.placeholder}>Progress</Text>
                </View>

                <View style={styles.controls}>
                    <Text style={styles.placeholder}>Controls (七顆控制按鈕)</Text>
                </View>

                <View style={styles.buttonLabels}>
                    <Text style={styles.placeholder}>ButtonLabels</Text>
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
    },
    mediaArea: {
        height: 207,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },
    trackInfo: {
        height: 60,
        alignItems: "center",
        justifyContent: "center",
    },
    progress: {
        height: 40,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    controls: {
        flex: 1,
        minHeight: 130,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonLabels: {
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 8,
    },
    placeholder: {
        color: "#9CA3AF",
        fontSize: 14,
    },
});
