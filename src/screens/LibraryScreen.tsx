import { useNavigation } from "@react-navigation/native";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMediaLibrary } from "../hooks/useMediaLibrary";
import { useMediaPermissions } from "../hooks/usePermissions";
import { useVideoThumbnail } from "../hooks/useVideoThumbnail";
import { useLibraryStore } from "../stores/libraryStore";
import type { LibraryTab, MediaAlbum, MediaFile } from "../stores/libraryStore";
import { usePlayerStore } from "../stores/playerStore";
import { useRecentStore } from "../stores/recentStore";
import type { RecentPlayEntry } from "../stores/recentStore";

function formatDuration(totalSeconds: number): string {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatRelativeTime(timestamp: number): string {
    const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diffSec < 60) {
        return "剛剛";
    }
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
        return `${diffMin} 分鐘前`;
    }
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
        return `${diffHour} 小時前`;
    }
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) {
        return `${diffDay} 天前`;
    }
    const date = new Date(timestamp);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function LibraryScreen() {
    useMediaPermissions();
    const { openAlbum } = useMediaLibrary();
    const navigation = useNavigation();

    const hasPermission = useLibraryStore((s) => s.hasPermission);
    const activeTab = useLibraryStore((s) => s.activeTab);
    const setActiveTab = useLibraryStore((s) => s.setActiveTab);
    const albums = useLibraryStore((s) => s.albums);
    const isLoadingAlbums = useLibraryStore((s) => s.isLoadingAlbums);
    const albumsError = useLibraryStore((s) => s.albumsError);
    const selectedAlbum = useLibraryStore((s) => s.selectedAlbum);
    const albumFiles = useLibraryStore((s) => s.albumFiles);
    const isLoadingAlbumFiles = useLibraryStore((s) => s.isLoadingAlbumFiles);
    const albumFilesError = useLibraryStore((s) => s.albumFilesError);
    const selectAlbum = useLibraryStore((s) => s.selectAlbum);

    const recentEntries = useRecentStore((s) => s.entries);
    const playFile = usePlayerStore((s) => s.playFile);

    const handlePlay = (file: MediaFile, playlist: MediaFile[]) => {
        playFile(file, playlist);
        navigation.navigate("Player" as never);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>我的媒體庫</Text>
            </View>

            <View style={styles.tabs}>
                <TabButton
                    label={`最近播放 (${recentEntries.length})`}
                    active={activeTab === "recent"}
                    onPress={() => setActiveTab("recent")}
                />
                <TabButton
                    label={`資料夾 (${albums.length})`}
                    active={activeTab === "albums"}
                    onPress={() => setActiveTab("albums")}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.scroll}>
                {activeTab === "recent" ? (
                    <RecentTab
                        entries={recentEntries}
                        onPlay={handlePlay}
                    />
                ) : (
                    <AlbumsTab
                        hasPermission={hasPermission}
                        albums={albums}
                        isLoadingAlbums={isLoadingAlbums}
                        albumsError={albumsError}
                        selectedAlbum={selectedAlbum}
                        albumFiles={albumFiles}
                        isLoadingAlbumFiles={isLoadingAlbumFiles}
                        albumFilesError={albumFilesError}
                        onOpenAlbum={openAlbum}
                        onBackToAlbums={() => selectAlbum(null)}
                        onPlay={handlePlay}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

interface TabButtonProps {
    label: string;
    active: boolean;
    onPress: () => void;
}

function TabButton({ label, active, onPress }: TabButtonProps) {
    return (
        <Pressable
            style={[styles.tabButton, active && styles.tabButtonActive]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.tabButtonText,
                    active && styles.tabButtonTextActive,
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

interface RecentTabProps {
    entries: RecentPlayEntry[];
    onPlay: (file: MediaFile, playlist: MediaFile[]) => void;
}

function RecentTab({ entries, onPlay }: RecentTabProps) {
    if (entries.length === 0) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>
                    尚無播放紀錄
                </Text>
                <Text style={styles.placeholderSub}>
                    請至「資料夾」分頁挑選檔案播放
                </Text>
            </View>
        );
    }
    const playlist = entries.map((entry) => entry.file);
    return (
        <FlatList
            data={entries}
            keyExtractor={(item) => item.file.id}
            renderItem={({ item }) => (
                <FileRow
                    file={item.file}
                    sub={`${item.file.type === "video" ? "影片" : "音樂"} · ${formatRelativeTime(item.lastPlayedAt)}`}
                    onPress={() => onPlay(item.file, playlist)}
                />
            )}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
    );
}

interface AlbumsTabProps {
    hasPermission: boolean;
    albums: MediaAlbum[];
    isLoadingAlbums: boolean;
    albumsError: string | null;
    selectedAlbum: MediaAlbum | null;
    albumFiles: MediaFile[];
    isLoadingAlbumFiles: boolean;
    albumFilesError: string | null;
    onOpenAlbum: (album: MediaAlbum) => void;
    onBackToAlbums: () => void;
    onPlay: (file: MediaFile, playlist: MediaFile[]) => void;
}

function AlbumsTab({
    hasPermission,
    albums,
    isLoadingAlbums,
    albumsError,
    selectedAlbum,
    albumFiles,
    isLoadingAlbumFiles,
    albumFilesError,
    onOpenAlbum,
    onBackToAlbums,
    onPlay,
}: AlbumsTabProps) {
    if (!hasPermission) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>
                    請先到「權限」分頁授權存取媒體
                </Text>
            </View>
        );
    }

    if (selectedAlbum) {
        return (
            <View style={styles.tabContent}>
                <Pressable
                    style={({ pressed }) => [
                        styles.backRow,
                        pressed && styles.backRowPressed,
                    ]}
                    onPress={onBackToAlbums}
                >
                    <Text style={styles.backArrow}>‹</Text>
                    <Text style={styles.backTitle} numberOfLines={1}>
                        {selectedAlbum.title}
                    </Text>
                </Pressable>
                <View style={styles.divider} />
                <AlbumFilesContent
                    isLoading={isLoadingAlbumFiles}
                    error={albumFilesError}
                    files={albumFiles}
                    onPlay={onPlay}
                />
            </View>
        );
    }

    if (isLoadingAlbums) {
        return (
            <View style={styles.centeredContent}>
                <ActivityIndicator />
                <Text style={styles.placeholder}>讀取資料夾中...</Text>
            </View>
        );
    }
    if (albumsError) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.errorText}>讀取錯誤: {albumsError}</Text>
            </View>
        );
    }
    if (albums.length === 0) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>
                    沒有任何含影片或音樂的資料夾
                </Text>
            </View>
        );
    }
    return (
        <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Pressable
                    style={({ pressed }) => [
                        styles.fileItem,
                        pressed && styles.fileItemPressed,
                    ]}
                    onPress={() => onOpenAlbum(item)}
                >
                    <Text style={styles.fileName} numberOfLines={1}>
                        📁 {item.title}
                    </Text>
                    <Text style={styles.fileMeta}>
                        {item.mediaCount} 個檔案
                    </Text>
                </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
    );
}

interface AlbumFilesContentProps {
    isLoading: boolean;
    error: string | null;
    files: MediaFile[];
    onPlay: (file: MediaFile, playlist: MediaFile[]) => void;
}

function AlbumFilesContent({
    isLoading,
    error,
    files,
    onPlay,
}: AlbumFilesContentProps) {
    if (isLoading) {
        return (
            <View style={styles.centeredContent}>
                <ActivityIndicator />
                <Text style={styles.placeholder}>讀取檔案中...</Text>
            </View>
        );
    }
    if (error) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.errorText}>讀取錯誤: {error}</Text>
            </View>
        );
    }
    if (files.length === 0) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>
                    這個資料夾沒有影片或音樂
                </Text>
            </View>
        );
    }
    return (
        <FlatList
            data={files}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <FileRow
                    file={item}
                    sub={`${item.type === "video" ? "影片" : "音樂"} · ${item.format} · ${formatDuration(item.duration)}`}
                    onPress={() => onPlay(item, files)}
                />
            )}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
    );
}

interface FileRowProps {
    file: MediaFile;
    sub: string;
    onPress: () => void;
}

function FileRow({ file, sub, onPress }: FileRowProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.fileItem,
                pressed && styles.fileItemPressed,
            ]}
            onPress={onPress}
        >
            <FileThumbnail file={file} />
            <View style={styles.fileTextCol}>
                <Text style={styles.fileName} numberOfLines={1}>
                    {file.filename}
                </Text>
                <Text style={styles.fileMeta}>{sub}</Text>
            </View>
        </Pressable>
    );
}

function FileThumbnail({ file }: { file: MediaFile }) {
    const isVideo = file.type === "video";
    const thumbUri = useVideoThumbnail(file);

    if (isVideo && thumbUri) {
        return (
            <Image
                source={{ uri: thumbUri }}
                style={styles.thumbnail}
                resizeMode="cover"
            />
        );
    }
    return (
        <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>{isVideo ? "🎬" : "🎵"}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        height: 56,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    tabs: {
        height: 48,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    tabButtonActive: {
        backgroundColor: "#EFF6FF",
    },
    tabButtonText: {
        fontSize: 14,
        color: "#6B7280",
    },
    tabButtonTextActive: {
        color: "#2663EB",
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
    },
    scroll: {
        flex: 1,
    },
    tabContent: {
        flex: 1,
    },
    backRow: {
        height: 44,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    backRowPressed: {
        backgroundColor: "#F3F4F6",
    },
    backArrow: {
        fontSize: 24,
        color: "#2663EB",
        lineHeight: 24,
    },
    backTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    centeredContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        gap: 8,
    },
    fileItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    fileItemPressed: {
        backgroundColor: "#F3F4F6",
    },
    thumbnail: {
        width: 64,
        height: 40,
        borderRadius: 4,
        backgroundColor: "#000000",
    },
    thumbnailPlaceholder: {
        width: 64,
        height: 40,
        borderRadius: 4,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },
    thumbnailIcon: {
        fontSize: 18,
    },
    fileTextCol: {
        flex: 1,
        minWidth: 0,
    },
    fileName: {
        fontSize: 15,
        color: "#111827",
        marginBottom: 2,
    },
    fileMeta: {
        fontSize: 12,
        color: "#9CA3AF",
    },
    itemSeparator: {
        height: 1,
        backgroundColor: "#F3F4F6",
        marginLeft: 20,
    },
    placeholder: {
        color: "#9CA3AF",
        fontSize: 14,
    },
    placeholderSub: {
        color: "#9CA3AF",
        fontSize: 12,
    },
    errorText: {
        color: "#DC2626",
        fontSize: 13,
        textAlign: "center",
    },
});
