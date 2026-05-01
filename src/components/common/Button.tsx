import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { colors } from "../../theme/colors";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
    label: string;
    onPress?: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
}

export function Button({
    label,
    onPress,
    variant = "primary",
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
}: ButtonProps) {
    const interactive = !disabled && !loading;

    return (
        <Pressable
            onPress={interactive ? onPress : undefined}
            disabled={!interactive}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: !interactive, busy: loading }}
            style={({ pressed }) => [
                styles.base,
                variantStyles[variant].container,
                fullWidth && styles.fullWidth,
                pressed && interactive && variantStyles[variant].pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    size="small"
                    color={
                        variant === "primary"
                            ? colors.textInverse
                            : colors.primary
                    }
                />
            ) : (
                <Text style={[styles.label, variantStyles[variant].label]}>
                    {label}
                </Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        height: 48,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    fullWidth: {
        alignSelf: "stretch",
    },
    disabled: {
        opacity: 0.5,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
    },
});

const variantStyles = {
    primary: StyleSheet.create({
        container: { backgroundColor: colors.primary },
        pressed: { backgroundColor: colors.primaryPressed },
        label: { color: colors.textInverse },
    }),
    secondary: StyleSheet.create({
        container: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.primary,
        },
        pressed: { backgroundColor: colors.primarySoft },
        label: { color: colors.primary },
    }),
    ghost: StyleSheet.create({
        container: { backgroundColor: "transparent" },
        pressed: { backgroundColor: colors.surface },
        label: { color: colors.textSecondary },
    }),
};
