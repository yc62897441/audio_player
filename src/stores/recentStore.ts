import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { MediaFile } from "./libraryStore";

const RECENT_STORAGE_KEY = "media-player/recent";
const MAX_ENTRIES = 50;

export interface RecentPlayEntry {
    file: MediaFile;
    lastPlayedAt: number;
}

interface RecentState {
    entries: RecentPlayEntry[];
    addPlay: (file: MediaFile) => void;
    remove: (id: string) => void;
    clear: () => void;
}

export const useRecentStore = create<RecentState>()(
    persist(
        (set, get) => ({
            entries: [],
            addPlay: (file) => {
                const now = Date.now();
                const filtered = get().entries.filter(
                    (entry) => entry.file.id !== file.id,
                );
                const next = [
                    { file, lastPlayedAt: now },
                    ...filtered,
                ].slice(0, MAX_ENTRIES);
                set({ entries: next });
            },
            remove: (id) => {
                set({
                    entries: get().entries.filter(
                        (entry) => entry.file.id !== id,
                    ),
                });
            },
            clear: () => set({ entries: [] }),
        }),
        {
            name: RECENT_STORAGE_KEY,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ entries: state.entries }),
            version: 1,
        },
    ),
);
