import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Playlist } from "../../stores/playlistStore";
import { colors } from "../../theme/colors";

interface PlaylistActionSheetProps {
    visible: boolean;
    playlist: Playlist | null;
    onClose: () => void;
    onRename: () => void;
    onDelete: () => void;
}

export function PlaylistActionSheet({
    visible,
    playlist,
    onClose,
    onRename,
    onDelete,
}: PlaylistActionSheetProps) {
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
                    {playlist && (
                        <View style={styles.header}>
                            <Text style={styles.headerTitle} numberOfLines={1}>
                                {playlist.name}
                            </Text>
                        </View>
                    )}
                    <Pressable
                        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                        onPress={onRename}
                    >
                        <Text style={styles.itemText}>重新命名</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                        onPress={onDelete}
                    >
                        <Text style={[styles.itemText, styles.dangerText]}>刪除播放清單</Text>
                    </Pressable>
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
