import { useNavigation } from "@react-navigation/native";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMediaLibrary } from "../hooks/useMediaLibrary";
import { useMediaPermissions } from "../hooks/usePermissions";
import { useLibraryStore } from "../stores/libraryStore";
import type { LibraryTab, MediaFile } from "../stores/libraryStore";
import { usePlayerStore } from "../stores/playerStore";

function formatDuration(totalSeconds: number): string {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LibraryScreen() {
    useMediaPermissions();
    useMediaLibrary();

    const navigation = useNavigation();
    const hasPermission = useLibraryStore((s) => s.hasPermission);
    const isLoading = useLibraryStore((s) => s.isLoading);
    const error = useLibraryStore((s) => s.error);
    const videos = useLibraryStore((s) => s.videos);
    const audios = useLibraryStore((s) => s.audios);
    const activeTab = useLibraryStore((s) => s.activeTab);
    const setActiveTab = useLibraryStore((s) => s.setActiveTab);
    const playFile = usePlayerStore((s) => s.playFile);

    const list = activeTab === "video" ? videos : audios;

    const handleTap = (file: MediaFile) => {
        playFile(file, list);
        navigation.navigate("Player" as never);
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>我的媒體庫</Text>
            </View>

            <View style={styles.tabs}>
                <TabButton
                    label={`影片 (${videos.length})`}
                    active={activeTab === "video"}
                    onPress={() => setActiveTab("video")}
                />
                <TabButton
                    label={`音樂 (${audios.length})`}
                    active={activeTab === "audio"}
                    onPress={() => setActiveTab("audio")}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.scroll}>
                <ContentArea
                    hasPermission={hasPermission}
                    isLoading={isLoading}
                    error={error}
                    list={list}
                    activeTab={activeTab}
                    onTap={handleTap}
                />
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

interface ContentAreaProps {
    hasPermission: boolean;
    isLoading: boolean;
    error: string | null;
    list: MediaFile[];
    activeTab: LibraryTab;
    onTap: (file: MediaFile) => void;
}

function ContentArea({
    hasPermission,
    isLoading,
    error,
    list,
    activeTab,
    onTap,
}: ContentAreaProps) {
    if (!hasPermission) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>
                    請先到「權限」分頁授權存取媒體
                </Text>
            </View>
        );
    }
    if (isLoading) {
        return (
            <View style={styles.centeredContent}>
                <ActivityIndicator />
                <Text style={styles.placeholder}>讀取中...</Text>
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
    if (list.length === 0) {
        return (
            <View style={styles.centeredContent}>
                <Text style={styles.placeholder}>
                    沒有任何{activeTab === "video" ? "影片" : "音樂"}檔案
                </Text>
            </View>
        );
    }
    return (
        <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Pressable
                    style={({ pressed }) => [
                        styles.fileItem,
                        pressed && styles.fileItemPressed,
                    ]}
                    onPress={() => onTap(item)}
                >
                    <Text style={styles.fileName} numberOfLines={1}>
                        {item.filename}
                    </Text>
                    <Text style={styles.fileMeta}>
                        {item.format} · {formatDuration(item.duration)}
                    </Text>
                </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
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
    centeredContent: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        gap: 8,
    },
    fileItem: {
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    fileItemPressed: {
        backgroundColor: "#F3F4F6",
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
    errorText: {
        color: "#DC2626",
        fontSize: 13,
        textAlign: "center",
    },
});
