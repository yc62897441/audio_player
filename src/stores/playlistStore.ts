import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const PLAYLIST_STORAGE_KEY = "media-player/playlists";

export interface Playlist {
    id: string;
    name: string;
    itemIds: string[];
    createdAt: number;
    updatedAt: number;
}

export type AddItemResult = "added" | "duplicate" | "not-found";

interface PlaylistState {
    playlists: Playlist[];
    createPlaylist: (name: string) => string;
    deletePlaylist: (id: string) => void;
    renamePlaylist: (id: string, name: string) => void;
    addItem: (playlistId: string, mediaId: string) => AddItemResult;
    removeItem: (playlistId: string, mediaId: string) => void;
}

const generateId = (): string =>
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const usePlaylistStore = create<PlaylistState>()(
    persist(
        (set, get) => ({
            playlists: [],
            createPlaylist: (name) => {
                const id = generateId();
                const now = Date.now();
                set({
                    playlists: [
                        ...get().playlists,
                        {
                            id,
                            name: name.trim(),
                            itemIds: [],
                            createdAt: now,
                            updatedAt: now,
                        },
                    ],
                });
                return id;
            },
            deletePlaylist: (id) => {
                set({
                    playlists: get().playlists.filter((p) => p.id !== id),
                });
            },
            renamePlaylist: (id, name) => {
                set({
                    playlists: get().playlists.map((p) =>
                        p.id === id ? { ...p, name: name.trim(), updatedAt: Date.now() } : p,
                    ),
                });
            },
            addItem: (playlistId, mediaId) => {
                const playlist = get().playlists.find((p) => p.id === playlistId);
                if (!playlist) return "not-found";
                if (playlist.itemIds.includes(mediaId)) return "duplicate";
                set({
                    playlists: get().playlists.map((p) =>
                        p.id === playlistId
                            ? {
                                  ...p,
                                  itemIds: [...p.itemIds, mediaId],
                                  updatedAt: Date.now(),
                              }
                            : p,
                    ),
                });
                return "added";
            },
            removeItem: (playlistId, mediaId) => {
                set({
                    playlists: get().playlists.map((p) =>
                        p.id === playlistId
                            ? {
                                  ...p,
                                  itemIds: p.itemIds.filter((i) => i !== mediaId),
                                  updatedAt: Date.now(),
                              }
                            : p,
                    ),
                });
            },
        }),
        {
            name: PLAYLIST_STORAGE_KEY,
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ playlists: state.playlists }),
            version: 1,
        },
    ),
);
