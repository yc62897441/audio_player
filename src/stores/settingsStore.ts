import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SkipSettings {
    skipBackLong: number;
    skipBackShort: number;
    skipForwardShort: number;
    skipForwardLong: number;
}

export const DEFAULT_SKIP_SETTINGS: SkipSettings = {
    skipBackLong: 30,
    skipBackShort: 10,
    skipForwardShort: 10,
    skipForwardLong: 30,
};

export const SKIP_SECONDS_RANGE = { min: 5, max: 120 } as const;

const SETTINGS_STORAGE_KEY = "media-player/settings";

type SkipKey = keyof SkipSettings;

interface SettingsState extends SkipSettings {
    setSkipSeconds: (key: SkipKey, value: number) => void;
    incrementSkipSeconds: (key: SkipKey, step?: number) => void;
    decrementSkipSeconds: (key: SkipKey, step?: number) => void;
    resetToDefault: () => void;
}

const clampSkipSeconds = (value: number): number => {
    if (Number.isNaN(value)) {
        return SKIP_SECONDS_RANGE.min;
    }
    const rounded = Math.round(value);
    return Math.min(
        SKIP_SECONDS_RANGE.max,
        Math.max(SKIP_SECONDS_RANGE.min, rounded),
    );
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            ...DEFAULT_SKIP_SETTINGS,
            setSkipSeconds: (key, value) => {
                set({ [key]: clampSkipSeconds(value) } as Pick<
                    SettingsState,
                    SkipKey
                >);
            },
            incrementSkipSeconds: (key, step = 1) => {
                const current = get()[key];
                set({ [key]: clampSkipSeconds(current + step) } as Pick<
                    SettingsState,
                    SkipKey
                >);
            },
            decrementSkipSeconds: (key, step = 1) => {
                const current = get()[key];
                set({ [key]: clampSkipSeconds(current - step) } as Pick<
                    SettingsState,
                    SkipKey
                >);
            },
            resetToDefault: () => {
                set({ ...DEFAULT_SKIP_SETTINGS });
            },
        }),
        {
            name: SETTINGS_STORAGE_KEY,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state): SkipSettings => ({
                skipBackLong: state.skipBackLong,
                skipBackShort: state.skipBackShort,
                skipForwardShort: state.skipForwardShort,
                skipForwardLong: state.skipForwardLong,
            }),
            version: 1,
        },
    ),
);
