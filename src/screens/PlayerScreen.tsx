import { useEvent } from "expo";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useVideoPlayer, VideoView } from "expo-video";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SkipSettingsModal } from "../components/common/SkipSettingsModal";
import { useSettingsStore } from "../stores/settingsStore";
import { usePlayerStore } from "../stores/playerStore";
import type { MediaFile } from "../stores/libraryStore";

const ACTIVE_COLOR = "#2663EB";
const SKIP_COLOR = "#F59E0B";
const TEXT_COLOR = "#111827";
const SUBTLE_COLOR = "#9CA3AF";

function formatDuration(totalSeconds: number): string {
    const sec = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

interface ControlsProps {
    isPlaying: boolean;
    canPrev: boolean;
    canNext: boolean;
    onPlayPause: () => void;
    onSkipBy: (seconds: number) => void;
    onPrev: () => void;
    onNext: () => void;
    onOpenSkipSettings: () => void;
}

function Controls({
    isPlaying,
    canPrev,
    canNext,
    onPlayPause,
    onSkipBy,
    onPrev,
    onNext,
    onOpenSkipSettings,
}: ControlsProps) {
    const skipBackLong = useSettingsStore((s) => s.skipBackLong);
    const skipBackShort = useSettingsStore((s) => s.skipBackShort);
    const skipForwardShort = useSettingsStore((s) => s.skipForwardShort);
    const skipForwardLong = useSettingsStore((s) => s.skipForwardLong);

    return (
        <View style={styles.controlsRow}>
            <ControlButton
                label="⏮"
                sublabel="上一首"
                disabled={!canPrev}
                onPress={onPrev}
            />
            <SkipButton
                seconds={skipBackLong}
                direction="back"
                long
                onPress={() => onSkipBy(-skipBackLong)}
                onLongPress={onOpenSkipSettings}
            />
            <SkipButton
                seconds={skipBackShort}
                direction="back"
                long={false}
                onPress={() => onSkipBy(-skipBackShort)}
                onLongPress={onOpenSkipSettings}
            />
            <ControlButton
                label={isPlaying ? "⏸" : "▶"}
                sublabel={isPlaying ? "暫停" : "播放"}
                onPress={onPlayPause}
            />
            <SkipButton
                seconds={skipForwardShort}
                direction="forward"
                long={false}
                onPress={() => onSkipBy(skipForwardShort)}
                onLongPress={onOpenSkipSettings}
            />
            <SkipButton
                seconds={skipForwardLong}
                direction="forward"
                long
                onPress={() => onSkipBy(skipForwardLong)}
                onLongPress={onOpenSkipSettings}
            />
            <ControlButton
                label="⏭"
                sublabel="下一首"
                disabled={!canNext}
                onPress={onNext}
            />
        </View>
    );
}

interface ControlButtonProps {
    label: string;
    sublabel: string;
    disabled?: boolean;
    onPress: () => void;
}

function ControlButton({
    label,
    sublabel,
    disabled,
    onPress,
}: ControlButtonProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.controlButton,
                pressed && !disabled && styles.controlButtonPressed,
                disabled && styles.controlButtonDisabled,
            ]}
            disabled={disabled}
            onPress={onPress}
        >
            <Text style={styles.controlButtonLabel}>{label}</Text>
            <Text style={styles.controlButtonSublabel}>{sublabel}</Text>
        </Pressable>
    );
}

interface SkipButtonProps {
    seconds: number;
    direction: "back" | "forward";
    long: boolean;
    onPress: () => void;
    onLongPress?: () => void;
}

function SkipButton({
    seconds,
    direction,
    long,
    onPress,
    onLongPress,
}: SkipButtonProps) {
    const Icon = long
        ? direction === "back"
            ? ChevronsLeft
            : ChevronsRight
        : direction === "back"
          ? ChevronLeft
          : ChevronRight;
    return (
        <Pressable
            style={({ pressed }) => [
                styles.skipButton,
                pressed && styles.skipButtonPressed,
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Icon color="#FFFFFF" size={20} />
            <Text style={styles.skipButtonNumber}>{seconds}</Text>
        </Pressable>
    );
}

interface ProgressProps {
    position: number;
    duration: number;
    onSeek: (seconds: number) => void;
}

function Progress({ position, duration, onSeek }: ProgressProps) {
    const widthRef = useRef(0);
    const durationRef = useRef(duration);
    const draggingPosRef = useRef<number | null>(null);
    const [draggingPosition, setDraggingPosition] = useState<number | null>(
        null,
    );

    useEffect(() => {
        durationRef.current = duration;
    }, [duration]);

    const panResponder = useMemo(() => {
        const xToTime = (x: number): number => {
            const w = widthRef.current;
            if (w <= 0) return 0;
            const clamped = Math.max(0, Math.min(w, x));
            return (clamped / w) * durationRef.current;
        };
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const t = xToTime(evt.nativeEvent.locationX);
                draggingPosRef.current = t;
                setDraggingPosition(t);
            },
            onPanResponderMove: (evt) => {
                const t = xToTime(evt.nativeEvent.locationX);
                draggingPosRef.current = t;
                setDraggingPosition(t);
            },
            onPanResponderRelease: () => {
                const final = draggingPosRef.current;
                if (final !== null) {
                    onSeek(final);
                }
                draggingPosRef.current = null;
                setDraggingPosition(null);
            },
            onPanResponderTerminate: () => {
                draggingPosRef.current = null;
                setDraggingPosition(null);
            },
        });
    }, [onSeek]);

    const display = draggingPosition ?? position;
    const ratio =
        duration > 0 ? Math.min(1, Math.max(0, display / duration)) : 0;

    return (
        <View style={styles.progressContainer}>
            <View
                style={styles.progressTouchArea}
                {...panResponder.panHandlers}
            >
                <View
                    style={styles.progressBar}
                    onLayout={(e) => {
                        widthRef.current = e.nativeEvent.layout.width;
                    }}
                >
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${ratio * 100}%` },
                        ]}
                    />
                </View>
            </View>
            <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>
                    {formatDuration(display)}
                </Text>
                <Text style={styles.progressLabel}>
                    {formatDuration(duration)}
                </Text>
            </View>
        </View>
    );
}

interface AreaProps {
    file: MediaFile;
    onOpenSkipSettings: () => void;
}

function VideoArea({ file, onOpenSkipSettings }: AreaProps) {
    const player = useVideoPlayer(file.uri, (p) => {
        p.loop = false;
        p.timeUpdateEventInterval = 0.5;
        p.play();
    });

    const playingChange = useEvent(player, "playingChange", {
        isPlaying: player.playing,
    });
    const timeUpdate = useEvent(player, "timeUpdate", {
        currentTime: player.currentTime,
        currentLiveTimestamp: null,
        currentOffsetFromLive: 0,
        bufferedPosition: 0,
    });

    const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
    const setPosition = usePlayerStore((s) => s.setPosition);
    const setDuration = usePlayerStore((s) => s.setDuration);
    const next = usePlayerStore((s) => s.next);
    const previous = usePlayerStore((s) => s.previous);
    const playlist = usePlayerStore((s) => s.playlist);
    const currentIndex = usePlayerStore((s) => s.currentIndex);

    useEffect(() => {
        setIsPlaying(playingChange.isPlaying);
    }, [playingChange.isPlaying, setIsPlaying]);

    useEffect(() => {
        setPosition(timeUpdate.currentTime);
    }, [timeUpdate.currentTime, setPosition]);

    useEffect(() => {
        if (player.duration > 0) {
            setDuration(player.duration);
        }
    }, [player.duration, setDuration]);

    const handleSkipBy = (seconds: number) => {
        player.seekBy(seconds);
    };

    const handleSeek = (seconds: number) => {
        player.currentTime = seconds;
    };

    const handlePlayPause = () => {
        if (playingChange.isPlaying) {
            player.pause();
        } else {
            player.play();
        }
    };

    return (
        <View style={styles.body}>
            <View style={styles.mediaArea}>
                <VideoView
                    player={player}
                    style={styles.videoView}
                    contentFit="contain"
                    nativeControls={false}
                />
            </View>

            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                    {file.filename}
                </Text>
                <Text style={styles.trackMeta}>影片 · {file.format}</Text>
            </View>

            <Progress
                position={timeUpdate.currentTime}
                duration={player.duration}
                onSeek={handleSeek}
            />

            <Controls
                isPlaying={playingChange.isPlaying}
                canPrev={currentIndex > 0}
                canNext={currentIndex < playlist.length - 1}
                onPlayPause={handlePlayPause}
                onSkipBy={handleSkipBy}
                onPrev={previous}
                onNext={next}
                onOpenSkipSettings={onOpenSkipSettings}
            />
        </View>
    );
}

function AudioArea({ file, onOpenSkipSettings }: AreaProps) {
    const player = useAudioPlayer({ uri: file.uri }, { updateInterval: 250 });
    const status = useAudioPlayerStatus(player);

    const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
    const setPosition = usePlayerStore((s) => s.setPosition);
    const setDuration = usePlayerStore((s) => s.setDuration);
    const next = usePlayerStore((s) => s.next);
    const previous = usePlayerStore((s) => s.previous);
    const playlist = usePlayerStore((s) => s.playlist);
    const currentIndex = usePlayerStore((s) => s.currentIndex);

    useEffect(() => {
        player.play();
    }, [player]);

    useEffect(() => {
        setIsPlaying(status.playing);
    }, [status.playing, setIsPlaying]);

    useEffect(() => {
        setPosition(status.currentTime);
    }, [status.currentTime, setPosition]);

    useEffect(() => {
        if (status.duration > 0) {
            setDuration(status.duration);
        }
    }, [status.duration, setDuration]);

    const handleSkipBy = (seconds: number) => {
        const target = Math.max(
            0,
            Math.min(status.duration || 0, status.currentTime + seconds),
        );
        player.seekTo(target);
    };

    const handleSeek = (seconds: number) => {
        player.seekTo(seconds);
    };

    const handlePlayPause = () => {
        if (status.playing) {
            player.pause();
        } else {
            player.play();
        }
    };

    return (
        <View style={styles.body}>
            <View style={styles.mediaArea}>
                <Text style={styles.audioIcon}>♪</Text>
            </View>

            <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                    {file.filename}
                </Text>
                <Text style={styles.trackMeta}>音樂 · {file.format}</Text>
            </View>

            <Progress
                position={status.currentTime}
                duration={status.duration}
                onSeek={handleSeek}
            />

            <Controls
                isPlaying={status.playing}
                canPrev={currentIndex > 0}
                canNext={currentIndex < playlist.length - 1}
                onPlayPause={handlePlayPause}
                onSkipBy={handleSkipBy}
                onPrev={previous}
                onNext={next}
                onOpenSkipSettings={onOpenSkipSettings}
            />
        </View>
    );
}

export default function PlayerScreen() {
    const currentFile = usePlayerStore((s) => s.currentFile);
    const [skipModalVisible, setSkipModalVisible] = useState(false);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>正在播放</Text>
            </View>

            {currentFile ? (
                <VideoOrAudio
                    file={currentFile}
                    onOpenSkipSettings={() => setSkipModalVisible(true)}
                />
            ) : (
                <View style={styles.emptyBody}>
                    <Text style={styles.emptyText}>
                        尚未選擇檔案
                    </Text>
                    <Text style={styles.emptyHint}>
                        請至「媒體庫」分頁挑選一個檔案播放
                    </Text>
                </View>
            )}

            <SkipSettingsModal
                visible={skipModalVisible}
                onClose={() => setSkipModalVisible(false)}
            />
        </SafeAreaView>
    );
}

function VideoOrAudio({ file, onOpenSkipSettings }: AreaProps) {
    if (file.type === "video") {
        return (
            <VideoArea
                key={file.id}
                file={file}
                onOpenSkipSettings={onOpenSkipSettings}
            />
        );
    }
    return (
        <AudioArea
            key={file.id}
            file={file}
            onOpenSkipSettings={onOpenSkipSettings}
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
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: TEXT_COLOR,
    },
    body: {
        flex: 1,
    },
    emptyBody: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    emptyText: {
        color: TEXT_COLOR,
        fontSize: 16,
    },
    emptyHint: {
        color: SUBTLE_COLOR,
        fontSize: 13,
    },
    mediaArea: {
        height: 240,
        backgroundColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
    },
    videoView: {
        width: "100%",
        height: "100%",
    },
    audioIcon: {
        fontSize: 80,
        color: "#FFFFFF",
    },
    trackInfo: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    trackTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: TEXT_COLOR,
    },
    trackMeta: {
        fontSize: 12,
        color: SUBTLE_COLOR,
    },
    progressContainer: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        gap: 6,
    },
    progressTouchArea: {
        paddingVertical: 12,
        justifyContent: "center",
    },
    progressBar: {
        height: 4,
        backgroundColor: "#E5E7EB",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: ACTIVE_COLOR,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    progressLabel: {
        fontSize: 11,
        color: SUBTLE_COLOR,
    },
    controlsRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 16,
        gap: 4,
    },
    controlButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 8,
        gap: 2,
    },
    controlButtonPressed: {
        opacity: 0.7,
    },
    controlButtonDisabled: {
        opacity: 0.3,
    },
    controlButtonLabel: {
        fontSize: 14,
        color: TEXT_COLOR,
        fontWeight: "600",
    },
    controlButtonSublabel: {
        fontSize: 9,
        color: SUBTLE_COLOR,
    },
    skipButton: {
        width: 48,
        aspectRatio: 1,
        borderRadius: 8,
        backgroundColor: SKIP_COLOR,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    skipButtonPressed: {
        opacity: 0.7,
    },
    skipButtonNumber: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
});
