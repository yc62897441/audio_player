import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../components/common/Button";
import { PermissionModal } from "../components/common/PermissionModal";
import { SkipSettingsModal } from "../components/common/SkipSettingsModal";

export default function SettingsScreen() {
    const [skipModalVisible, setSkipModalVisible] = useState(false);
    const [permissionModalVisible, setPermissionModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>設定</Text>
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

                <View style={styles.actionItem}>
                    <Button
                        label="權限"
                        variant="secondary"
                        fullWidth
                        onPress={() => setPermissionModalVisible(true)}
                    />
                </View>
            </ScrollView>

            <SkipSettingsModal
                visible={skipModalVisible}
                onClose={() => setSkipModalVisible(false)}
            />
            <PermissionModal
                visible={permissionModalVisible}
                onClose={() => setPermissionModalVisible(false)}
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
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
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
});
