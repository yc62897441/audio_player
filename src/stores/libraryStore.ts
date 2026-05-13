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

export interface MediaAlbum {
    id: string;
    title: string;
    mediaCount: number;
}

export type LibraryTab = "recent" | "albums" | "playlists";

interface LibraryState {
    activeTab: LibraryTab;
    hasPermission: boolean;
    albums: MediaAlbum[];
    isLoadingAlbums: boolean;
    albumsError: string | null;
    selectedAlbum: MediaAlbum | null;
    albumFiles: MediaFile[];
    isLoadingAlbumFiles: boolean;
    albumFilesError: string | null;
    selectedPlaylistId: string | null;
    setActiveTab: (tab: LibraryTab) => void;
    setHasPermission: (hasPermission: boolean) => void;
    setAlbums: (albums: MediaAlbum[]) => void;
    setIsLoadingAlbums: (loading: boolean) => void;
    setAlbumsError: (error: string | null) => void;
    selectAlbum: (album: MediaAlbum | null) => void;
    setAlbumFiles: (files: MediaFile[]) => void;
    setIsLoadingAlbumFiles: (loading: boolean) => void;
    setAlbumFilesError: (error: string | null) => void;
    setSelectedPlaylistId: (id: string | null) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
    activeTab: "recent",
    hasPermission: false,
    albums: [],
    isLoadingAlbums: false,
    albumsError: null,
    selectedAlbum: null,
    albumFiles: [],
    isLoadingAlbumFiles: false,
    albumFilesError: null,
    selectedPlaylistId: null,
    setActiveTab: (activeTab) => set({ activeTab }),
    setHasPermission: (hasPermission) => set({ hasPermission }),
    setAlbums: (albums) => set({ albums }),
    setIsLoadingAlbums: (isLoadingAlbums) => set({ isLoadingAlbums }),
    setAlbumsError: (albumsError) => set({ albumsError }),
    selectAlbum: (selectedAlbum) =>
        set({
            selectedAlbum,
            albumFiles: [],
            albumFilesError: null,
        }),
    setAlbumFiles: (albumFiles) => set({ albumFiles }),
    setIsLoadingAlbumFiles: (isLoadingAlbumFiles) => set({ isLoadingAlbumFiles }),
    setAlbumFilesError: (albumFilesError) => set({ albumFilesError }),
    setSelectedPlaylistId: (selectedPlaylistId) => set({ selectedPlaylistId }),
}));
