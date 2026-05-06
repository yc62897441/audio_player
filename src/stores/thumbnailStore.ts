import { create } from "zustand";

import { generateVideoThumbnail } from "../services/thumbnailService";

import type { MediaFile } from "./libraryStore";

interface ThumbnailState {
    cache: Record<string, string>;
    failed: Record<string, true>;
    setCached: (id: string, uri: string) => void;
    setFailed: (id: string) => void;
}

export const useThumbnailStore = create<ThumbnailState>((set) => ({
    cache: {},
    failed: {},
    setCached: (id, uri) =>
        set((state) => ({ cache: { ...state.cache, [id]: uri } })),
    setFailed: (id) =>
        set((state) => ({ failed: { ...state.failed, [id]: true } })),
}));

const inFlight = new Map<string, Promise<void>>();

export function ensureThumbnail(file: MediaFile): void {
    if (file.type !== "video") {
        return;
    }
    const { cache, failed, setCached, setFailed } =
        useThumbnailStore.getState();
    if (cache[file.id] || failed[file.id] || inFlight.has(file.id)) {
        return;
    }
    const promise = generateVideoThumbnail(file)
        .then((uri) => {
            setCached(file.id, uri);
        })
        .catch(() => {
            setFailed(file.id);
        })
        .finally(() => {
            inFlight.delete(file.id);
        });
    inFlight.set(file.id, promise);
}
