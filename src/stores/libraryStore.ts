import { create } from "zustand";

export type MediaType = "video" | "audio";

export interface MediaFile {
    id: string;
    uri: string;
    filename: string;
    type: MediaType;
    format: string;
    duration: number;
    size: number;
    createdAt: number;
}

export type LibraryTab = MediaType;

interface LibraryState {
    videos: MediaFile[];
    audios: MediaFile[];
    activeTab: LibraryTab;
    isLoading: boolean;
    error: string | null;
    hasPermission: boolean;
    setVideos: (videos: MediaFile[]) => void;
    setAudios: (audios: MediaFile[]) => void;
    setMediaFiles: (files: MediaFile[]) => void;
    addMediaFile: (file: MediaFile) => void;
    removeMediaFile: (id: string) => void;
    setActiveTab: (tab: LibraryTab) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setHasPermission: (hasPermission: boolean) => void;
    getFileById: (id: string) => MediaFile | undefined;
    getActiveList: () => MediaFile[];
    clear: () => void;
}

const splitByType = (
    files: MediaFile[],
): { videos: MediaFile[]; audios: MediaFile[] } => {
    const videos: MediaFile[] = [];
    const audios: MediaFile[] = [];
    for (const file of files) {
        if (file.type === "video") {
            videos.push(file);
        } else {
            audios.push(file);
        }
    }
    return { videos, audios };
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
    videos: [],
    audios: [],
    activeTab: "video",
    isLoading: false,
    error: null,
    hasPermission: false,
    setVideos: (videos) => set({ videos }),
    setAudios: (audios) => set({ audios }),
    setMediaFiles: (files) => {
        const { videos, audios } = splitByType(files);
        set({ videos, audios });
    },
    addMediaFile: (file) => {
        const { videos, audios } = get();
        if (file.type === "video") {
            if (videos.some((existing) => existing.id === file.id)) {
                return;
            }
            set({ videos: [...videos, file] });
        } else {
            if (audios.some((existing) => existing.id === file.id)) {
                return;
            }
            set({ audios: [...audios, file] });
        }
    },
    removeMediaFile: (id) => {
        const { videos, audios } = get();
        set({
            videos: videos.filter((file) => file.id !== id),
            audios: audios.filter((file) => file.id !== id),
        });
    },
    setActiveTab: (activeTab) => set({ activeTab }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setHasPermission: (hasPermission) => set({ hasPermission }),
    getFileById: (id) => {
        const { videos, audios } = get();
        return (
            videos.find((file) => file.id === id) ??
            audios.find((file) => file.id === id)
        );
    },
    getActiveList: () => {
        const { videos, audios, activeTab } = get();
        return activeTab === "video" ? videos : audios;
    },
    clear: () =>
        set({
            videos: [],
            audios: [],
            error: null,
            isLoading: false,
        }),
}));
