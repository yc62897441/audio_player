import { create } from "zustand";

import type { MediaFile } from "./libraryStore";
import { useRecentStore } from "./recentStore";
import { useSettingsStore } from "./settingsStore";

const recordRecent = (file: MediaFile) => {
    useRecentStore.getState().addPlay(file);
};

function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

interface PlayerState {
    currentFile: MediaFile | null;
    playlist: MediaFile[];
    originalPlaylist: MediaFile[];
    currentIndex: number;
    isPlaying: boolean;
    position: number;
    duration: number;
    loadPlaylist: (playlist: MediaFile[], startIndex?: number) => void;
    playFile: (file: MediaFile, playlist?: MediaFile[]) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    next: () => boolean;
    previous: () => boolean;
    goToIndex: (index: number) => boolean;
    seekTo: (seconds: number) => void;
    skipBy: (deltaSeconds: number) => void;
    setPosition: (position: number) => void;
    setDuration: (duration: number) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    applyShuffle: (on: boolean) => void;
    reset: () => void;
}

const INITIAL_STATE = {
    currentFile: null as MediaFile | null,
    playlist: [] as MediaFile[],
    originalPlaylist: [] as MediaFile[],
    currentIndex: -1,
    isPlaying: false,
    position: 0,
    duration: 0,
};

const clampPosition = (value: number, duration: number): number => {
    if (Number.isNaN(value) || value < 0) {
        return 0;
    }
    if (duration > 0 && value > duration) {
        return duration;
    }
    return value;
};

// Build (playlist, originalPlaylist, currentIndex) given a base list, the target file,
// and the current shuffle preference. When shuffle is on, the target file is pinned at
// index 0 and the rest is randomly ordered so the user hears the full playlist.
function buildPlaylistForPlayback(
    baseList: MediaFile[],
    targetFile: MediaFile,
    fallbackIndex: number,
    shuffleMode: boolean,
): { playlist: MediaFile[]; originalPlaylist: MediaFile[]; currentIndex: number } {
    if (shuffleMode) {
        const rest = baseList.filter((f) => f.id !== targetFile.id);
        return {
            playlist: [targetFile, ...shuffleArray(rest)],
            originalPlaylist: baseList,
            currentIndex: 0,
        };
    }
    return {
        playlist: baseList,
        originalPlaylist: [],
        currentIndex: fallbackIndex,
    };
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    ...INITIAL_STATE,
    loadPlaylist: (playlist, startIndex = 0) => {
        if (playlist.length === 0) {
            set({ ...INITIAL_STATE });
            return;
        }
        const safeIndex = Math.min(Math.max(0, startIndex), playlist.length - 1);
        const startFile = playlist[safeIndex];
        const shuffleMode = useSettingsStore.getState().shuffleMode;
        const arranged = buildPlaylistForPlayback(playlist, startFile, safeIndex, shuffleMode);
        set({
            ...arranged,
            currentFile: startFile,
            position: 0,
            duration: startFile.duration,
            isPlaying: true,
        });
        recordRecent(startFile);
    },
    playFile: (file, playlist) => {
        const nextPlaylist = playlist ?? get().playlist;
        const indexInPlaylist = nextPlaylist.findIndex((item) => item.id === file.id);
        const baseList = indexInPlaylist >= 0 ? nextPlaylist : [...nextPlaylist, file];
        const fallbackIndex = indexInPlaylist >= 0 ? indexInPlaylist : baseList.length - 1;
        const shuffleMode = useSettingsStore.getState().shuffleMode;
        const arranged = buildPlaylistForPlayback(baseList, file, fallbackIndex, shuffleMode);
        set({
            ...arranged,
            currentFile: file,
            position: 0,
            duration: file.duration,
            isPlaying: true,
        });
        recordRecent(file);
    },
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set({ isPlaying: !get().isPlaying }),
    next: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return false;
        const loopMode = useSettingsStore.getState().loopMode;
        let nextIndex = currentIndex + 1;
        if (nextIndex >= playlist.length) {
            if (loopMode === "all") {
                nextIndex = 0;
            } else {
                return false;
            }
        }
        const nextFile = playlist[nextIndex];
        set({
            currentIndex: nextIndex,
            currentFile: nextFile,
            position: 0,
            duration: nextFile.duration,
            isPlaying: true,
        });
        recordRecent(nextFile);
        return true;
    },
    previous: () => {
        const { playlist, currentIndex } = get();
        const prevIndex = currentIndex - 1;
        if (prevIndex < 0) {
            return false;
        }
        const prevFile = playlist[prevIndex];
        set({
            currentIndex: prevIndex,
            currentFile: prevFile,
            position: 0,
            duration: prevFile.duration,
            isPlaying: true,
        });
        recordRecent(prevFile);
        return true;
    },
    goToIndex: (index) => {
        const { playlist } = get();
        if (index < 0 || index >= playlist.length) {
            return false;
        }
        const file = playlist[index];
        set({
            currentIndex: index,
            currentFile: file,
            position: 0,
            duration: file.duration,
            isPlaying: true,
        });
        recordRecent(file);
        return true;
    },
    seekTo: (seconds) => {
        const { duration } = get();
        set({ position: clampPosition(seconds, duration) });
    },
    skipBy: (deltaSeconds) => {
        const { position, duration } = get();
        set({ position: clampPosition(position + deltaSeconds, duration) });
    },
    setPosition: (position) => {
        const { duration } = get();
        set({ position: clampPosition(position, duration) });
    },
    setDuration: (duration) => set({ duration: Math.max(0, duration) }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    applyShuffle: (on) => {
        const state = get();
        if (on) {
            const baseline =
                state.originalPlaylist.length > 0 ? state.originalPlaylist : state.playlist;
            if (baseline.length === 0) return;
            const current = state.currentFile;
            if (!current) {
                set({
                    playlist: shuffleArray(baseline),
                    originalPlaylist: baseline,
                    currentIndex: 0,
                });
                return;
            }
            const rest = baseline.filter((f) => f.id !== current.id);
            set({
                playlist: [current, ...shuffleArray(rest)],
                originalPlaylist: baseline,
                currentIndex: 0,
            });
        } else {
            if (state.originalPlaylist.length === 0) return;
            const newIndex = state.currentFile
                ? state.originalPlaylist.findIndex((f) => f.id === state.currentFile?.id)
                : 0;
            set({
                playlist: state.originalPlaylist,
                originalPlaylist: [],
                currentIndex: Math.max(0, newIndex),
            });
        }
    },
    reset: () => set({ ...INITIAL_STATE }),
}));
