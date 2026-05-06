import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/common/Button";
import { SkipSettingsModal } from "../components/common/SkipSettingsModal";

export default function SettingsScreen() {
    const [skipModalVisible, setSkipModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.placeholder}>Header (返回 + 設定)</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.actionItem}>
                    <Button
                        label="跳轉秒數設定"
                        variant="secondary"
                        fullWidth
                        onPress={() => setSkipModalVisible(true)}
                    />
                </View>

                <View style={styles.footerNote}>
                    <Text style={styles.placeholder}>FooterNote (說明文字)</Text>
                </View>
            </ScrollView>

            <SkipSettingsModal
                visible={skipModalVisible}
                onClose={() => setSkipModalVisible(false)}
            />
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
        paddingTop: 16,
        paddingBottom: 24,
    },
    actionItem: {
        marginHorizontal: 20,
        marginBottom: 12,
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
