import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";

interface ToastState {
    message: string | null;
    seq: number;
    show: (message: string) => void;
    clear: (atSeq: number) => void;
}

const useToastStore = create<ToastState>((set) => ({
    message: null,
    seq: 0,
    show: (message) => set((s) => ({ message, seq: s.seq + 1 })),
    clear: (atSeq) => set((s) => (s.seq === atSeq ? { ...s, message: null } : s)),
}));

export const showToast = (message: string) => {
    useToastStore.getState().show(message);
};

export function ToastOverlay() {
    const message = useToastStore((s) => s.message);
    const seq = useToastStore((s) => s.seq);
    const clear = useToastStore((s) => s.clear);
    const opacity = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!message) {
            opacity.setValue(0);
            return;
        }
        opacity.setValue(0);
        const currentSeq = seq;
        const anim = Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.delay(1800),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]);
        anim.start(({ finished }) => {
            if (finished) clear(currentSeq);
        });
        return () => {
            anim.stop();
        };
    }, [message, seq, opacity, clear]);

    if (!message) return null;

    return (
        <View
            pointerEvents="none"
            style={[styles.wrapper, { bottom: Math.max(24, insets.bottom + 16) }]}
        >
            <Animated.View style={[styles.toast, { opacity }]}>
                <Text style={styles.text}>{message}</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
    },
    toast: {
        maxWidth: "80%",
        backgroundColor: "rgba(17, 24, 39, 0.92)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
    },
    text: {
        color: "#FFFFFF",
        fontSize: 14,
    },
});
