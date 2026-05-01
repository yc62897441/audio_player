import * as MediaLibrary from "expo-media-library";

import type { MediaFile, MediaType } from "../stores/libraryStore";

const PAGE_SIZE = 200;

function getExtension(filename: string): string {
    const idx = filename.lastIndexOf(".");
    if (idx < 0) {
        return "";
    }
    return filename.slice(idx + 1).toUpperCase();
}

function toMediaType(asset: MediaLibrary.Asset): MediaType {
    return asset.mediaType === MediaLibrary.MediaType.video ? "video" : "audio";
}

function toMediaFile(asset: MediaLibrary.Asset): MediaFile {
    return {
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename,
        type: toMediaType(asset),
        format: getExtension(asset.filename),
        duration: asset.duration ?? 0,
        size: 0,
        createdAt: asset.creationTime ?? 0,
    };
}

export async function loadAllMedia(): Promise<MediaFile[]> {
    const all: MediaLibrary.Asset[] = [];
    let cursor: string | undefined;
    let hasNext = true;
    while (hasNext) {
        const result = await MediaLibrary.getAssetsAsync({
            mediaType: [
                MediaLibrary.MediaType.video,
                MediaLibrary.MediaType.audio,
            ],
            first: PAGE_SIZE,
            after: cursor,
            sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        });
        all.push(...result.assets);
        cursor = result.endCursor;
        hasNext = result.hasNextPage;
    }
    return all.map(toMediaFile);
}
