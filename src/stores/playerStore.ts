import { create } from "zustand";

import type { MediaFile } from "./libraryStore";

interface PlayerState {
    currentFile: MediaFile | null;
    playlist: MediaFile[];
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
    reset: () => void;
}

const INITIAL_STATE = {
    currentFile: null as MediaFile | null,
    playlist: [] as MediaFile[],
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

export const usePlayerStore = create<PlayerState>((set, get) => ({
    ...INITIAL_STATE,
    loadPlaylist: (playlist, startIndex = 0) => {
        if (playlist.length === 0) {
            set({ ...INITIAL_STATE });
            return;
        }
        const safeIndex = Math.min(
            Math.max(0, startIndex),
            playlist.length - 1,
        );
        set({
            playlist,
            currentIndex: safeIndex,
            currentFile: playlist[safeIndex],
            position: 0,
            duration: playlist[safeIndex].duration,
            isPlaying: true,
        });
    },
    playFile: (file, playlist) => {
        const nextPlaylist = playlist ?? get().playlist;
        const indexInPlaylist = nextPlaylist.findIndex(
            (item) => item.id === file.id,
        );
        if (indexInPlaylist >= 0) {
            set({
                playlist: nextPlaylist,
                currentIndex: indexInPlaylist,
                currentFile: file,
                position: 0,
                duration: file.duration,
                isPlaying: true,
            });
            return;
        }
        const merged = [...nextPlaylist, file];
        set({
            playlist: merged,
            currentIndex: merged.length - 1,
            currentFile: file,
            position: 0,
            duration: file.duration,
            isPlaying: true,
        });
    },
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set({ isPlaying: !get().isPlaying }),
    next: () => {
        const { playlist, currentIndex } = get();
        const nextIndex = currentIndex + 1;
        if (nextIndex >= playlist.length) {
            return false;
        }
        const nextFile = playlist[nextIndex];
        set({
            currentIndex: nextIndex,
            currentFile: nextFile,
            position: 0,
            duration: nextFile.duration,
            isPlaying: true,
        });
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
    reset: () => set({ ...INITIAL_STATE }),
}));
