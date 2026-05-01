import * as MediaLibrary from "expo-media-library";
import { useEffect } from "react";

import { useLibraryStore } from "../stores/libraryStore";

export function useMediaPermissions() {
    const [response, requestPermission] = MediaLibrary.usePermissions();
    const setHasPermission = useLibraryStore((s) => s.setHasPermission);

    useEffect(() => {
        setHasPermission(response?.granted ?? false);
    }, [response?.granted, setHasPermission]);

    return {
        permissionResponse: response,
        hasPermission: response?.granted ?? false,
        canAskAgain: response?.canAskAgain ?? true,
        requestPermission,
    };
}
