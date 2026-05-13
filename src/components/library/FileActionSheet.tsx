import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { MediaFile } from "../../stores/libraryStore";
import { colors } from "../../theme/colors";

interface FileActionSheetProps {
    visible: boolean;
    file: MediaFile | null;
    onClose: () => void;
    onAddToPlaylist: () => void;
    onRemoveFromPlaylist?: () => void;
    onRemoveFromRecent?: () => void;
    onClearRecent?: () => void;
}

export function FileActionSheet({
    visible,
    file,
    onClose,
    onAddToPlaylist,
    onRemoveFromPlaylist,
    onRemoveFromRecent,
    onClearRecent,
}: FileActionSheetProps) {
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(16, insets.bottom + 8);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View
                    style={[styles.sheet, { paddingBottom: bottomPadding }]}
                    onStartShouldSetResponder={() => true}
                >
                    <View style={styles.handle} />
                    {file && (
                        <View style={styles.header}>
                            <Text style={styles.headerTitle} numberOfLines={1}>
                                {file.filename}
                            </Text>
                        </View>
                    )}
                    <Pressable
                        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                        onPress={onAddToPlaylist}
                    >
                        <Text style={styles.itemText}>加入播放清單</Text>
                    </Pressable>
                    {onRemoveFromPlaylist && (
                        <Pressable
                            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                            onPress={onRemoveFromPlaylist}
                        >
                            <Text style={[styles.itemText, styles.dangerText]}>自播放清單移除</Text>
                        </Pressable>
                    )}
                    {onRemoveFromRecent && (
                        <Pressable
                            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                            onPress={onRemoveFromRecent}
                        >
                            <Text style={[styles.itemText, styles.dangerText]}>自最近播放移除</Text>
                        </Pressable>
                    )}
                    {onClearRecent && (
                        <Pressable
                            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                            onPress={onClearRecent}
                        >
                            <Text style={[styles.itemText, styles.dangerText]}>
                                清空整個最近播放
                            </Text>
                        </Pressable>
                    )}
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(17, 24, 39, 0.5)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 8,
    },
    handle: {
        alignSelf: "center",
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        marginBottom: 8,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    item: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    itemPressed: {
        backgroundColor: colors.surface,
    },
    itemText: {
        fontSize: 16,
        color: colors.textPrimary,
    },
    dangerText: {
        color: colors.danger,
    },
});
