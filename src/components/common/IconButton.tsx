import type { LucideIcon } from "lucide-react-native";
import {
    Pressable,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { colors } from "../../theme/colors";

type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps {
    icon: LucideIcon;
    onPress?: () => void;
    accessibilityLabel: string;
    size?: IconButtonSize;
    color?: string;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
}

const SIZE_MAP: Record<
    IconButtonSize,
    { container: number; icon: number }
> = {
    sm: { container: 32, icon: 18 },
    md: { container: 44, icon: 24 },
    lg: { container: 56, icon: 32 },
};

export function IconButton({
    icon: Icon,
    onPress,
    accessibilityLabel,
    size = "md",
    color = colors.textPrimary,
    disabled = false,
    style,
}: IconButtonProps) {
    const { container, icon: iconSize } = SIZE_MAP[size];

    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityState={{ disabled }}
            hitSlop={8}
            style={({ pressed }) => [
                styles.base,
                { width: container, height: container },
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            <Icon
                size={iconSize}
                color={disabled ? colors.textDisabled : color}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
    },
    pressed: {
        backgroundColor: colors.surface,
    },
    disabled: {
        opacity: 0.6,
    },
});
