import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useMediaPermissions } from "../../hooks/usePermissions";
import { colors } from "../../theme/colors";

import { Button } from "./Button";

interface PermissionModalProps {
    visible: boolean;
    onClose: () => void;
}

export function PermissionModal({ visible, onClose }: PermissionModalProps) {
    const { hasPermission, canAskAgain, requestPermission } =
        useMediaPermissions();

    const handlePrimary = async () => {
        if (hasPermission) {
            onClose();
            return;
        }
        if (!canAskAgain) {
            Linking.openSettings();
            return;
        }
        const result = await requestPermission();
        if (result.granted) {
            onClose();
        }
    };

    const buttonLabel = hasPermission
        ? "已授權"
        : !canAskAgain
          ? "前往系統設定開啟權限"
          : "允許存取媒體";

    const statusText = hasPermission
        ? "權限已開啟 ✓"
        : !canAskAgain
          ? "已被拒絕,請至系統設定手動開啟"
          : null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View
                    style={styles.card}
                    onStartShouldSetResponder={() => true}
                >
                    <Text style={styles.title}>授權存取媒體</Text>
                    <Text style={styles.desc}>
                        為了讀取你裝置中的影片與音樂檔案,App
                        需要取得媒體庫存取權。
                    </Text>

                    <View style={styles.privacyList}>
                        <Text style={styles.privacyItem}>• 僅讀取本機檔案</Text>
                        <Text style={styles.privacyItem}>
                            • 不上傳任何資料到雲端
                        </Text>
                        <Text style={styles.privacyItem}>
                            • 隨時可在系統設定中撤銷授權
                        </Text>
                    </View>

                    {statusText ? (
                        <Text style={styles.statusText}>{statusText}</Text>
                    ) : null}

                    <View style={styles.actions}>
                        <Button
                            label={buttonLabel}
                            onPress={handlePrimary}
                            fullWidth
                        />
                        <Button
                            label="關閉"
                            variant="ghost"
                            onPress={onClose}
                            fullWidth
                        />
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(17, 24, 39, 0.5)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 20,
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textPrimary,
    },
    desc: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    privacyList: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.surfaceMuted,
        gap: 8,
    },
    privacyItem: {
        color: colors.textPrimary,
        fontSize: 13,
    },
    statusText: {
        color: colors.textSecondary,
        fontSize: 12,
        textAlign: "center",
    },
    actions: {
        marginTop: 8,
        gap: 8,
    },
});
