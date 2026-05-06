import * as MediaLibrary from "expo-media-library";

import type { MediaAlbum, MediaFile, MediaType } from "../stores/libraryStore";

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

export async function loadAlbums(): Promise<MediaAlbum[]> {
    const rawAlbums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
    });
    const result: MediaAlbum[] = [];
    for (const album of rawAlbums) {
        const probe = await MediaLibrary.getAssetsAsync({
            album: album.id,
            mediaType: [
                MediaLibrary.MediaType.video,
                MediaLibrary.MediaType.audio,
            ],
            first: 1,
        });
        if (probe.totalCount > 0) {
            result.push({
                id: album.id,
                title: album.title,
                mediaCount: probe.totalCount,
            });
        }
    }
    result.sort((a, b) => b.mediaCount - a.mediaCount);
    return result;
}

export async function loadFilesInAlbum(albumId: string): Promise<MediaFile[]> {
    const all: MediaLibrary.Asset[] = [];
    let cursor: string | undefined;
    let hasNext = true;
    while (hasNext) {
        const page = await MediaLibrary.getAssetsAsync({
            album: albumId,
            mediaType: [
                MediaLibrary.MediaType.video,
                MediaLibrary.MediaType.audio,
            ],
            first: PAGE_SIZE,
            after: cursor,
            sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        });
        all.push(...page.assets);
        cursor = page.endCursor;
        hasNext = page.hasNextPage;
    }
    return all.map(toMediaFile);
}
