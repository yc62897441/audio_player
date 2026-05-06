import { useEffect } from "react";

import type { MediaFile } from "../stores/libraryStore";
import { ensureThumbnail, useThumbnailStore } from "../stores/thumbnailStore";

export function useVideoThumbnail(file: MediaFile): string | null {
    const uri = useThumbnailStore((s) => s.cache[file.id]);

    useEffect(() => {
        ensureThumbnail(file);
    }, [file]);

    return uri ?? null;
}
