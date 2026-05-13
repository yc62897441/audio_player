import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddToPlaylistModal } from "../components/library/AddToPlaylistModal";
import { CreatePlaylistModal } from "../components/library/CreatePlaylistModal";
import { FileActionSheet } from "../components/library/FileActionSheet";
import { PlaylistActionSheet } from "../components/library/PlaylistActionSheet";
import { RenamePlaylistModal } from "../components/library/RenamePlaylistModal";
import { Button } from "../components/common/Button";
import { showToast } from "../components/common/Toast";
import { useMediaLibrary } from "../hooks/useMediaLibrary";
import { useMediaPermissions } from "../hooks/usePermissions";
import { usePlaylistFiles } from "../hooks/usePlaylistFiles";
import { useVideoThumbnail } from "../hooks/useVideoThumbnail";
import { useLibraryStore } from "../stores/libraryStore";
import type { MediaAlbum, MediaFile } from "../stores/libraryStore";
import { usePlayerStore } from "../stores/playerStore";
import { usePlaylistStore } from "../stores/playlistStore";
import type { Playlist } from "../stores/playlistStore";
import { useRecentStore } from "../stores/recentStore";
import type { RecentPlayEntry } from "../stores/recentStore";

type OpenModal = "action-sheet" | "picker" | "create" | "playlist-action-sheet" | "rename" | null;

interface PendingFile {
    file: MediaFile;
    sourcePlaylistId: string | null;
}

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
    const selectedPlaylistId = useLibraryStore((s) => s.selectedPlaylistId);
    const setSelectedPlaylistId = useLibraryStore((s) => s.setSelectedPlaylistId);

    const recentEntries = useRecentStore((s) => s.entries);
    const playFile = usePlayerStore((s) => s.playFile);

    const playlists = usePlaylistStore((s) => s.playlists);
    const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
    const addItem = usePlaylistStore((s) => s.addItem);
    const removeItem = usePlaylistStore((s) => s.removeItem);
    const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);
    const renamePlaylist = usePlaylistStore((s) => s.renamePlaylist);

    const [openModal, setOpenModal] = useState<OpenModal>(null);
    const [pending, setPending] = useState<PendingFile | null>(null);
    const [pendingPlaylist, setPendingPlaylist] = useState<Playlist | null>(null);

    const handlePlay = (file: MediaFile, playlist: MediaFile[]) => {
        playFile(file, playlist);
        navigation.navigate("Player" as never);
    };

    const handleLongPressFile = (file: MediaFile, sourcePlaylistId: string | null) => {
        setPending({ file, sourcePlaylistId });
        setOpenModal("action-sheet");
    };

    const handleCloseAll = () => {
        setOpenModal(null);
        setPending(null);
        setPendingPlaylist(null);
    };

    const handleActionSheetAddToPlaylist = () => {
        setOpenModal("picker");
    };

    const handleRemoveFromPlaylist = () => {
        if (!pending || !pending.sourcePlaylistId) {
            handleCloseAll();
            return;
        }
        const playlist = playlists.find((p) => p.id === pending.sourcePlaylistId);
        removeItem(pending.sourcePlaylistId, pending.file.id);
        showToast(`已自「${playlist?.name ?? "播放清單"}」移除`);
        handleCloseAll();
    };

    const handlePickerPick = (playlistId: string) => {
        if (pending) {
            const playlist = playlists.find((p) => p.id === playlistId);
            const result = addItem(playlistId, pending.file.id);
            if (result === "added") {
                showToast(`已加入「${playlist?.name ?? "播放清單"}」`);
            } else if (result === "duplicate") {
                showToast(`已在「${playlist?.name ?? "播放清單"}」中`);
            }
        }
        handleCloseAll();
    };

    const handlePickerCreateNew = () => {
        setOpenModal("create");
    };

    const handleStandaloneCreate = () => {
        setPending(null);
        setOpenModal("create");
    };

    const handleCreateConfirm = (name: string) => {
        const id = createPlaylist(name);
        if (pending) {
            addItem(id, pending.file.id);
            showToast(`已加入「${name}」`);
        } else {
            showToast(`已建立「${name}」`);
        }
        handleCloseAll();
    };

    const handleLongPressPlaylist = (playlist: Playlist) => {
        setPendingPlaylist(playlist);
        setOpenModal("playlist-action-sheet");
    };

    const handleRenameSheetTap = () => {
        setOpenModal("rename");
    };

    const handleDeleteSheetTap = () => {
        if (!pendingPlaylist) return;
        const target = pendingPlaylist;
        Alert.alert("刪除播放清單", `確定要刪除「${target.name}」?清單內的媒體檔案不會被刪除。`, [
            { text: "取消", style: "cancel" },
            {
                text: "刪除",
                style: "destructive",
                onPress: () => {
                    if (selectedPlaylistId === target.id) {
                        setSelectedPlaylistId(null);
                    }
                    deletePlaylist(target.id);
                    showToast(`已刪除「${target.name}」`);
                    handleCloseAll();
                },
            },
        ]);
    };

    const handleRenameConfirm = (name: string) => {
        if (pendingPlaylist) {
            renamePlaylist(pendingPlaylist.id, name);
            showToast(`已更名為「${name}」`);
        }
        handleCloseAll();
    };

    const selectedPlaylist = selectedPlaylistId
        ? (playlists.find((p) => p.id === selectedPlaylistId) ?? null)
        : null;

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
                <TabButton
                    label={`播放清單 (${playlists.length})`}
                    active={activeTab === "playlists"}
                    onPress={() => setActiveTab("playlists")}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.scroll}>
                {activeTab === "recent" && (
                    <RecentTab
                        entries={recentEntries}
                        onPlay={handlePlay}
                        onLongPressFile={handleLongPressFile}
                    />
                )}
                {activeTab === "albums" && (
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
                        onLongPressFile={handleLongPressFile}
                    />
                )}
                {activeTab === "playlists" && (
                    <PlaylistsTab
                        playlists={playlists}
                        selectedPlaylist={selectedPlaylist}
                        onOpenPlaylist={(p) => setSelectedPlaylistId(p.id)}
                        onBack={() => setSelectedPlaylistId(null)}
                        onPlay={handlePlay}
                        onLongPressFile={handleLongPressFile}
                        onLongPressPlaylist={handleLongPressPlaylist}
                        onCreate={handleStandaloneCreate}
                    />
                )}
            </View>

            <FileActionSheet
                visible={openModal === "action-sheet"}
                file={pending?.file ?? null}
                onClose={handleCloseAll}
                onAddToPlaylist={handleActionSheetAddToPlaylist}
                onRemoveFromPlaylist={
                    pending?.sourcePlaylistId ? handleRemoveFromPlaylist : undefined
                }
            />
            <AddToPlaylistModal
                visible={openModal === "picker"}
                playlists={playlists}
                onClose={handleCloseAll}
                onPick={handlePickerPick}
                onCreateNew={handlePickerCreateNew}
            />
            <CreatePlaylistModal
                visible={openModal === "create"}
                onClose={handleCloseAll}
                onConfirm={handleCreateConfirm}
            />
            <PlaylistActionSheet
                visible={openModal === "playlist-action-sheet"}
                playlist={pendingPlaylist}
                onClose={handleCloseAll}
                onRename={handleRenameSheetTap}
                onDelete={handleDeleteSheetTap}
            />
            <RenamePlaylistModal
                visible={openModal === "rename"}
                playlist={pendingPlaylist}
                onClose={handleCloseAll}
                onConfirm={handleRenameConfirm}
            />
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
        <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
            <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
                {label}
            </Text>
        </Pressable>
    );
}

interface RecentTabProps {
    entries: RecentPlayEntry[];
    onPlay: (file: MediaFile, playlist: MediaFile[]) => void;
    onLongPressFile: (file: MediaFile, sourcePlaylistId: string | null) => void;
}

function RecentTab({ entries, onPlay, onLongPressFile }: RecentTabProps) {
    if (entries.length === 0) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>尚無播放紀錄</Text>
                <Text style={styles.placeholderSub}>請至「資料夾」分頁挑選檔案播放</Text>
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
                    onLongPress={() => onLongPressFile(item.file, null)}
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
    onLongPressFile: (file: MediaFile, sourcePlaylistId: string | null) => void;
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
    onLongPressFile,
}: AlbumsTabProps) {
    if (!hasPermission) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>請至「設定」頁授權存取媒體</Text>
            </View>
        );
    }

    if (selectedAlbum) {
        return (
            <View style={styles.tabContent}>
                <BackRow title={selectedAlbum.title} onPress={onBackToAlbums} />
                <View style={styles.divider} />
                <AlbumFilesContent
                    isLoading={isLoadingAlbumFiles}
                    error={albumFilesError}
                    files={albumFiles}
                    onPlay={onPlay}
                    onLongPressFile={onLongPressFile}
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
                <Text style={styles.placeholder}>沒有任何含影片或音樂的資料夾</Text>
            </View>
        );
    }
    return (
        <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Pressable
                    style={({ pressed }) => [styles.fileItem, pressed && styles.fileItemPressed]}
                    onPress={() => onOpenAlbum(item)}
                >
                    <Text style={styles.fileName} numberOfLines={1}>
                        📁 {item.title}
                    </Text>
                    <Text style={styles.fileMeta}>{item.mediaCount} 個檔案</Text>
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
    onLongPressFile: (file: MediaFile, sourcePlaylistId: string | null) => void;
}

function AlbumFilesContent({
    isLoading,
    error,
    files,
    onPlay,
    onLongPressFile,
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
                <Text style={styles.placeholder}>這個資料夾沒有影片或音樂</Text>
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
                    onLongPress={() => onLongPressFile(item, null)}
                />
            )}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
    );
}

interface PlaylistsTabProps {
    playlists: Playlist[];
    selectedPlaylist: Playlist | null;
    onOpenPlaylist: (playlist: Playlist) => void;
    onBack: () => void;
    onPlay: (file: MediaFile, playlist: MediaFile[]) => void;
    onLongPressFile: (file: MediaFile, sourcePlaylistId: string | null) => void;
    onLongPressPlaylist: (playlist: Playlist) => void;
    onCreate: () => void;
}

function PlaylistsTab({
    playlists,
    selectedPlaylist,
    onOpenPlaylist,
    onBack,
    onPlay,
    onLongPressFile,
    onLongPressPlaylist,
    onCreate,
}: PlaylistsTabProps) {
    if (selectedPlaylist) {
        return (
            <View style={styles.tabContent}>
                <BackRow title={selectedPlaylist.name} onPress={onBack} />
                <View style={styles.divider} />
                <PlaylistContents
                    playlist={selectedPlaylist}
                    onPlay={onPlay}
                    onLongPressFile={onLongPressFile}
                />
            </View>
        );
    }

    const sorted = [...playlists].sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));

    if (sorted.length === 0) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>還沒有播放清單</Text>
                <View style={styles.emptyCta}>
                    <Button label="建立新的播放清單" onPress={onCreate} fullWidth />
                </View>
            </View>
        );
    }

    return (
        <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Pressable
                    style={({ pressed }) => [styles.fileItem, pressed && styles.fileItemPressed]}
                    onPress={() => onOpenPlaylist(item)}
                    onLongPress={() => onLongPressPlaylist(item)}
                    delayLongPress={350}
                >
                    <Text style={styles.fileName} numberOfLines={1}>
                        🎵 {item.name}
                    </Text>
                    <Text style={styles.fileMeta}>{item.itemIds.length} 首</Text>
                </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            ListFooterComponent={
                <View style={styles.listFooter}>
                    <Button
                        label="建立新的播放清單"
                        variant="secondary"
                        onPress={onCreate}
                        fullWidth
                    />
                </View>
            }
        />
    );
}

interface PlaylistContentsProps {
    playlist: Playlist;
    onPlay: (file: MediaFile, playlist: MediaFile[]) => void;
    onLongPressFile: (file: MediaFile, sourcePlaylistId: string | null) => void;
}

function PlaylistContents({ playlist, onPlay, onLongPressFile }: PlaylistContentsProps) {
    const { files, missingCount, isLoading, error } = usePlaylistFiles(playlist.itemIds);

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
    if (playlist.itemIds.length === 0) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>這個播放清單還沒有檔案</Text>
                <Text style={styles.placeholderSub}>長按媒體檔案 → 加入播放清單</Text>
            </View>
        );
    }
    if (files.length === 0) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>清單中的檔案都已不存在</Text>
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
                    onLongPress={() => onLongPressFile(item, playlist.id)}
                />
            )}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            ListHeaderComponent={
                missingCount > 0 ? (
                    <View style={styles.missingNote}>
                        <Text style={styles.missingText}>{missingCount} 個檔案已遺失,不會顯示</Text>
                    </View>
                ) : null
            }
        />
    );
}

interface BackRowProps {
    title: string;
    onPress: () => void;
}

function BackRow({ title, onPress }: BackRowProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.backRow, pressed && styles.backRowPressed]}
            onPress={onPress}
        >
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.backTitle} numberOfLines={1}>
                {title}
            </Text>
        </Pressable>
    );
}

interface FileRowProps {
    file: MediaFile;
    sub: string;
    onPress: () => void;
    onLongPress?: () => void;
}

function FileRow({ file, sub, onPress, onLongPress }: FileRowProps) {
    return (
        <Pressable
            style={({ pressed }) => [styles.fileItem, pressed && styles.fileItemPressed]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={350}
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
        return <Image source={{ uri: thumbUri }} style={styles.thumbnail} resizeMode="cover" />;
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
        gap: 12,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    tabButtonActive: {
        backgroundColor: "#EFF6FF",
    },
    tabButtonText: {
        fontSize: 13,
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
        gap: 12,
    },
    emptyCta: {
        marginTop: 8,
        alignSelf: "stretch",
        paddingHorizontal: 40,
    },
    listFooter: {
        padding: 20,
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
    missingNote: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: "#FEF3C7",
    },
    missingText: {
        fontSize: 12,
        color: "#92400E",
    },
});
