import * as VideoThumbnails from "expo-video-thumbnails";

import type { MediaFile } from "../stores/libraryStore";

export async function generateVideoThumbnail(
    file: MediaFile,
): Promise<string> {
    const { uri } = await VideoThumbnails.getThumbnailAsync(file.uri, {
        time: 1000,
        quality: 0.5,
    });
    return uri;
}
