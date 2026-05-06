import { useEffect, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    DEFAULT_SKIP_SETTINGS,
    SKIP_SECONDS_RANGE,
    useSettingsStore,
} from "../../stores/settingsStore";
import { colors } from "../../theme/colors";

import { Button } from "./Button";

interface SkipSettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

type SkipKey =
    | "skipBackLong"
    | "skipBackShort"
    | "skipForwardShort"
    | "skipForwardLong";

type Draft = Record<SkipKey, string>;

const draftFromStore = (): Draft => {
    const s = useSettingsStore.getState();
    return {
        skipBackLong: String(s.skipBackLong),
        skipBackShort: String(s.skipBackShort),
        skipForwardShort: String(s.skipForwardShort),
        skipForwardLong: String(s.skipForwardLong),
    };
};

const draftFromDefaults = (): Draft => ({
    skipBackLong: String(DEFAULT_SKIP_SETTINGS.skipBackLong),
    skipBackShort: String(DEFAULT_SKIP_SETTINGS.skipBackShort),
    skipForwardShort: String(DEFAULT_SKIP_SETTINGS.skipForwardShort),
    skipForwardLong: String(DEFAULT_SKIP_SETTINGS.skipForwardLong),
});

const finalize = (raw: string, fallback: number): number => {
    if (raw === "") return fallback;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(
        SKIP_SECONDS_RANGE.max,
        Math.max(SKIP_SECONDS_RANGE.min, n),
    );
};

export function SkipSettingsModal({
    visible,
    onClose,
}: SkipSettingsModalProps) {
    const setSkipSeconds = useSettingsStore((s) => s.setSkipSeconds);
    const [draft, setDraft] = useState<Draft>(draftFromStore);

    useEffect(() => {
        if (visible) {
            setDraft(draftFromStore());
        }
    }, [visible]);

    const updateDraft = (key: SkipKey, value: string) => {
        setDraft((prev) => ({ ...prev, [key]: value }));
    };

    const handleResetDraft = () => {
        setDraft(draftFromDefaults());
    };

    const handleConfirm = () => {
        const store = useSettingsStore.getState();
        setSkipSeconds(
            "skipBackLong",
            finalize(draft.skipBackLong, store.skipBackLong),
        );
        setSkipSeconds(
            "skipBackShort",
            finalize(draft.skipBackShort, store.skipBackShort),
        );
        setSkipSeconds(
            "skipForwardShort",
            finalize(draft.skipForwardShort, store.skipForwardShort),
        );
        setSkipSeconds(
            "skipForwardLong",
            finalize(draft.skipForwardLong, store.skipForwardLong),
        );
        onClose();
    };

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
                    <Text style={styles.title}>跳轉秒數設定</Text>

                    <Row
                        label="倒轉(多)"
                        value={draft.skipBackLong}
                        onChange={(v) => updateDraft("skipBackLong", v)}
                    />
                    <Row
                        label="倒轉(少)"
                        value={draft.skipBackShort}
                        onChange={(v) => updateDraft("skipBackShort", v)}
                    />
                    <Row
                        label="快進(少)"
                        value={draft.skipForwardShort}
                        onChange={(v) => updateDraft("skipForwardShort", v)}
                    />
                    <Row
                        label="快進(多)"
                        value={draft.skipForwardLong}
                        onChange={(v) => updateDraft("skipForwardLong", v)}
                    />

                    <Text style={styles.hint}>
                        範圍 {SKIP_SECONDS_RANGE.min}–{SKIP_SECONDS_RANGE.max}{" "}
                        秒整數,超出會自動修正。點擊【完成】才會儲存。
                    </Text>

                    <View style={styles.actions}>
                        <Button
                            label="重設為預設"
                            variant="secondary"
                            onPress={handleResetDraft}
                        />
                        <Button
                            label="完成"
                            onPress={handleConfirm}
                            fullWidth
                        />
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

interface RowProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
}

function Row({ label, value, onChange }: RowProps) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <View style={styles.inputWrap}>
                <TextInput
                    value={value}
                    onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
                    keyboardType="number-pad"
                    maxLength={3}
                    selectTextOnFocus
                    style={styles.input}
                />
                <Text style={styles.inputSuffix}>秒</Text>
            </View>
        </View>
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
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 44,
    },
    rowLabel: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    inputWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: colors.surfaceMuted,
    },
    input: {
        minWidth: 36,
        paddingVertical: 0,
        fontSize: 14,
        color: colors.textPrimary,
        textAlign: "right",
    },
    inputSuffix: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    hint: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 4,
    },
    actions: {
        marginTop: 8,
        gap: 8,
    },
});
