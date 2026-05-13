import { useEffect, useState } from "react";

import { loadFilesByIds } from "../services/mediaService";
import type { MediaFile } from "../stores/libraryStore";

interface UsePlaylistFilesResult {
    files: MediaFile[];
    missingCount: number;
    isLoading: boolean;
    error: string | null;
}

export function usePlaylistFiles(itemIds: string[]): UsePlaylistFilesResult {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [missingCount, setMissingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const idsKey = itemIds.join("|");

    useEffect(() => {
        let cancelled = false;
        if (itemIds.length === 0) {
            setFiles([]);
            setMissingCount(0);
            setIsLoading(false);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        loadFilesByIds(itemIds)
            .then((loaded) => {
                if (cancelled) return;
                setFiles(loaded);
                setMissingCount(itemIds.length - loaded.length);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : "讀取播放清單失敗");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idsKey]);

    return { files, missingCount, isLoading, error };
}
