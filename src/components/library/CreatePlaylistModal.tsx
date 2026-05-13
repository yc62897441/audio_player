import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../../theme/colors";
import { Button } from "../common/Button";

const MAX_NAME = 50;

interface CreatePlaylistModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (name: string) => void;
}

export function CreatePlaylistModal({ visible, onClose, onConfirm }: CreatePlaylistModalProps) {
    const [draft, setDraft] = useState("");

    useEffect(() => {
        if (visible) setDraft("");
    }, [visible]);

    const trimmed = draft.trim();
    const canConfirm = trimmed.length > 0;

    const handleConfirm = () => {
        if (!canConfirm) return;
        onConfirm(trimmed);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.backdrop} onPress={onClose}>
                <View style={styles.card} onStartShouldSetResponder={() => true}>
                    <Text style={styles.title}>建立新的播放清單</Text>
                    <TextInput
                        value={draft}
                        onChangeText={setDraft}
                        placeholder="播放清單名稱"
                        placeholderTextColor={colors.textMuted}
                        maxLength={MAX_NAME}
                        autoFocus
                        style={styles.input}
                    />
                    <Text style={styles.hint}>名稱最長 {MAX_NAME} 字</Text>
                    <View style={styles.actions}>
                        <Button label="取消" variant="secondary" onPress={onClose} />
                        <Button
                            label="建立"
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
