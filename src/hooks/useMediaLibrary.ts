import { useCallback, useEffect } from "react";

import { loadAllMedia } from "../services/mediaService";
import { useLibraryStore } from "../stores/libraryStore";

export function useMediaLibrary() {
    const hasPermission = useLibraryStore((s) => s.hasPermission);
    const setMediaFiles = useLibraryStore((s) => s.setMediaFiles);
    const setLoading = useLibraryStore((s) => s.setLoading);
    const setError = useLibraryStore((s) => s.setError);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const files = await loadAllMedia();
            setMediaFiles(files);
        } catch (err) {
            setError(err instanceof Error ? err.message : "讀取媒體失敗");
        } finally {
            setLoading(false);
        }
    }, [setMediaFiles, setLoading, setError]);

    useEffect(() => {
        if (!hasPermission) {
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        loadAllMedia()
            .then((files) => {
                if (!cancelled) {
                    setMediaFiles(files);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : "讀取媒體失敗",
                    );
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [hasPermission, setMediaFiles, setLoading, setError]);

    return { refresh };
}
