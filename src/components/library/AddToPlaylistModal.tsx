import { useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { Playlist } from "../../stores/playlistStore";
import { colors } from "../../theme/colors";
import { Button } from "../common/Button";

interface AddToPlaylistModalProps {
    visible: boolean;
    playlists: Playlist[];
    onClose: () => void;
    onPick: (playlistId: string) => void;
    onCreateNew: () => void;
}

export function AddToPlaylistModal({
    visible,
    playlists,
    onClose,
    onPick,
    onCreateNew,
}: AddToPlaylistModalProps) {
    const sorted = useMemo(
        () => [...playlists].sort((a, b) => a.name.localeCompare(b.name, "zh-Hant")),
        [playlists],
    );

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.card} onStartShouldSetResponder={() => true}>
                    <Text style={styles.title}>加入播放清單</Text>
                    <View style={styles.listWrap}>
                        {sorted.length === 0 ? (
                            <Text style={styles.empty}>還沒有播放清單,建立一個吧</Text>
                        ) : (
                            <ScrollView style={styles.list}>
                                {sorted.map((p) => (
                                    <Pressable
                                        key={p.id}
                                        style={({ pressed }) => [
                                            styles.row,
                                            pressed && styles.rowPressed,
                                        ]}
                                        onPress={() => onPick(p.id)}
                                    >
                                        <Text style={styles.rowName} numberOfLines={1}>
                                            {p.name}
                                        </Text>
                                        <Text style={styles.rowCount}>{p.itemIds.length} 首</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                    <View style={styles.actions}>
                        <Button
                            label="建立新的播放清單"
                            variant="secondary"
                            onPress={onCreateNew}
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
        maxHeight: "80%",
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 20,
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: 4,
    },
    listWrap: {
        maxHeight: 320,
        minHeight: 60,
    },
    list: {
        flexGrow: 0,
    },
    empty: {
        textAlign: "center",
        paddingVertical: 24,
        color: colors.textMuted,
        fontSize: 13,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    rowPressed: {
        backgroundColor: colors.surface,
    },
    rowName: {
        flex: 1,
        fontSize: 15,
        color: colors.textPrimary,
        marginRight: 8,
    },
    rowCount: {
        fontSize: 12,
        color: colors.textMuted,
    },
    actions: {
        marginTop: 4,
        gap: 8,
    },
});
