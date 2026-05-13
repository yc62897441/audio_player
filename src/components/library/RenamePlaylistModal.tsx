import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import type { Playlist } from "../../stores/playlistStore";
import { colors } from "../../theme/colors";
import { Button } from "../common/Button";

const MAX_NAME = 50;

interface RenamePlaylistModalProps {
    visible: boolean;
    playlist: Playlist | null;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

export function RenamePlaylistModal({
    visible,
    playlist,
    onClose,
    onConfirm,
}: RenamePlaylistModalProps) {
    const [draft, setDraft] = useState("");

    useEffect(() => {
        if (visible && playlist) {
            setDraft(playlist.name);
        }
    }, [visible, playlist]);

    const trimmed = draft.trim();
    const canConfirm = trimmed.length > 0 && (!playlist || trimmed !== playlist.name);

    const handleConfirm = () => {
        if (!canConfirm) return;
        onConfirm(trimmed);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.card} onStartShouldSetResponder={() => true}>
                    <Text style={styles.title}>重新命名播放清單</Text>
                    <TextInput
                        value={draft}
                        onChangeText={setDraft}
                        placeholder="播放清單名稱"
                        placeholderTextColor={colors.textMuted}
                        maxLength={MAX_NAME}
                        autoFocus
                        selectTextOnFocus
                        style={styles.input}
                    />
                    <Text style={styles.hint}>名稱最長 {MAX_NAME} 字</Text>
                    <View style={styles.actions}>
                        <Button label="取消" variant="secondary" onPress={onClose} />
                        <Button
                            label="儲存"
                            onPress={handleConfirm}
                            disabled={!canConfirm}
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
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: colors.textPrimary,
        backgroundColor: colors.surfaceMuted,
    },
    hint: {
        fontSize: 12,
        color: colors.textMuted,
    },
    actions: {
        marginTop: 8,
        gap: 8,
    },
});
