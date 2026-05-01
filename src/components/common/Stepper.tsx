import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/colors";

interface StepperProps {
    value: number;
    onChange: (next: number) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
}

export function Stepper({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    suffix,
}: StepperProps) {
    const canDecrease = value - step >= min;
    const canIncrease = value + step <= max;

    const handleDecrease = () => {
        if (canDecrease) {
            onChange(value - step);
        }
    };

    const handleIncrease = () => {
        if (canIncrease) {
            onChange(value + step);
        }
    };

    return (
        <View style={styles.container}>
            <Pressable
                onPress={handleDecrease}
                disabled={!canDecrease}
                accessibilityRole="button"
                accessibilityLabel="減少"
                accessibilityState={{ disabled: !canDecrease }}
                hitSlop={4}
                style={({ pressed }) => [
                    styles.button,
                    pressed && canDecrease && styles.buttonPressed,
                ]}
            >
                <Text
                    style={[
                        styles.symbol,
                        !canDecrease && styles.symbolDisabled,
                    ]}
                >
                    −
                </Text>
            </Pressable>

            <View style={styles.valueWrap}>
                <Text style={styles.value}>
                    {value}
                    {suffix ?? ""}
                </Text>
            </View>

            <Pressable
                onPress={handleIncrease}
                disabled={!canIncrease}
                accessibilityRole="button"
                accessibilityLabel="增加"
                accessibilityState={{ disabled: !canIncrease }}
                hitSlop={4}
                style={({ pressed }) => [
                    styles.button,
                    pressed && canIncrease && styles.buttonPressed,
                ]}
            >
                <Text
                    style={[
                        styles.symbol,
                        !canIncrease && styles.symbolDisabled,
                    ]}
                >
                    +
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        height: 36,
        borderRadius: 8,
        backgroundColor: colors.surface,
        overflow: "hidden",
    },
    button: {
        width: 36,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonPressed: {
        backgroundColor: colors.border,
    },
    symbol: {
        fontSize: 20,
        color: colors.textPrimary,
        fontWeight: "500",
        lineHeight: 22,
    },
    symbolDisabled: {
        color: colors.textDisabled,
    },
    valueWrap: {
        minWidth: 56,
        paddingHorizontal: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    value: {
        fontSize: 14,
        color: colors.textPrimary,
        fontWeight: "500",
    },
});
