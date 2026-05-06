import { useCallback, useEffect } from "react";

import { loadAlbums, loadFilesInAlbum } from "../services/mediaService";
import type { MediaAlbum } from "../stores/libraryStore";
import { useLibraryStore } from "../stores/libraryStore";

export function useMediaLibrary() {
    const hasPermission = useLibraryStore((s) => s.hasPermission);
    const setAlbums = useLibraryStore((s) => s.setAlbums);
    const setIsLoadingAlbums = useLibraryStore((s) => s.setIsLoadingAlbums);
    const setAlbumsError = useLibraryStore((s) => s.setAlbumsError);
    const setAlbumFiles = useLibraryStore((s) => s.setAlbumFiles);
    const setIsLoadingAlbumFiles = useLibraryStore(
        (s) => s.setIsLoadingAlbumFiles,
    );
    const setAlbumFilesError = useLibraryStore((s) => s.setAlbumFilesError);

    const refreshAlbums = useCallback(async () => {
        setIsLoadingAlbums(true);
        setAlbumsError(null);
        try {
            const albums = await loadAlbums();
            setAlbums(albums);
        } catch (err) {
            setAlbumsError(
                err instanceof Error ? err.message : "讀取資料夾失敗",
            );
        } finally {
            setIsLoadingAlbums(false);
        }
    }, [setAlbums, setIsLoadingAlbums, setAlbumsError]);

    const openAlbum = useCallback(
        async (album: MediaAlbum) => {
            useLibraryStore.getState().selectAlbum(album);
            setIsLoadingAlbumFiles(true);
            setAlbumFilesError(null);
            try {
                const files = await loadFilesInAlbum(album.id);
                setAlbumFiles(files);
            } catch (err) {
                setAlbumFilesError(
                    err instanceof Error
                        ? err.message
                        : "讀取資料夾內檔案失敗",
                );
            } finally {
                setIsLoadingAlbumFiles(false);
            }
        },
        [setAlbumFiles, setIsLoadingAlbumFiles, setAlbumFilesError],
    );

    useEffect(() => {
        if (!hasPermission) {
            return;
        }
        let cancelled = false;
        setIsLoadingAlbums(true);
        setAlbumsError(null);
        loadAlbums()
            .then((albums) => {
                if (!cancelled) {
                    setAlbums(albums);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setAlbumsError(
                        err instanceof Error
                            ? err.message
                            : "讀取資料夾失敗",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoadingAlbums(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [hasPermission, setAlbums, setIsLoadingAlbums, setAlbumsError]);

    return { refreshAlbums, openAlbum };
}
