import * as React from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, FileAudio, Loader2, Music, Pause, Play, Trash, Upload } from "lucide-react";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { getSongUrl, songLibrary } from "@/lib/song-library";

interface AudioUploadProps {
    value: string;
    onChange: (url: string, publicId?: string) => void;
    onRemove: () => void;
    disabled?: boolean;
    folder?: string;
}

export default function AudioUploadWidget({
    value,
    onChange,
    onRemove,
    disabled,
    folder
}: AudioUploadProps) {
    const [isMounted, setIsMounted] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState<"library" | "upload">(() =>
        value && !songLibrary.some((song) => getSongUrl(song.fileName) === value) ? "upload" : "library"
    );
    const [selectedSongId, setSelectedSongId] = React.useState(() =>
        songLibrary.find((song) => getSongUrl(song.fileName) === value)?.id || songLibrary[0]?.id || ""
    );
    const previewAudioRef = React.useRef<HTMLAudioElement>(null);
    const [previewPlaying, setPreviewPlaying] = React.useState(false);
    const [previewTime, setPreviewTime] = React.useState(0);
    const [previewDuration, setPreviewDuration] = React.useState(0);
    const [previewError, setPreviewError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const { uploading, progress, error, uploadFile } = useCloudinaryUpload({
        onSuccess: (url, publicId) => onChange?.(url, publicId),
        resourceType: "video",
        folder
    });

    const [isDragging, setIsDragging] = React.useState(false);
    const selectedSong = songLibrary.find((song) => song.id === selectedSongId) || songLibrary[0];
    const selectedSongUrl = selectedSong ? getSongUrl(selectedSong.fileName) : "";
    const selectedSongIsActive = selectedSongUrl === value;

    React.useEffect(() => {
        previewAudioRef.current?.pause();
        setPreviewPlaying(false);
        setPreviewTime(0);
        setPreviewDuration(0);
        setPreviewError(null);
    }, [selectedSongUrl]);

    React.useEffect(() => {
        const currentSong = songLibrary.find((song) => getSongUrl(song.fileName) === value);
        if (currentSong) {
            setSelectedSongId(currentSong.id);
            setActiveTab("library");
        } else if (value) {
            setActiveTab("upload");
        }
    }, [value]);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (disabled || uploading) return;
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled || uploading) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (!file.type.startsWith("audio/")) {
                alert("សូមជ្រើសរើសឯកសារសំឡេង (audio)។");
                return;
            }
            uploadFile(file);
        }
    };

    const togglePreview = async () => {
        const audio = previewAudioRef.current;
        if (!audio) return;

        if (!audio.paused) {
            audio.pause();
            return;
        }

        setPreviewError(null);
        try {
            await audio.play();
        } catch (playError) {
            console.error("Could not play song preview:", playError);
            setPreviewError("មិនអាចចាក់បទនេះបានទេ។ សូមសាកល្បងម្ដងទៀត។");
        }
    };

    const formatTime = (time: number) => {
        if (!Number.isFinite(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    if (!isMounted) return null;

    return (
        <div className="w-full space-y-3 font-kantumruy">
            <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-slate-200 bg-slate-100 p-1.5 dark:border-white/10 dark:bg-slate-900" role="tablist" aria-label="ជ្រើសប្រភពបទភ្លេង">
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "library"}
                    disabled={disabled || uploading}
                    onClick={() => setActiveTab("library")}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-bold transition-all ${
                        activeTab === "library"
                            ? "border-teal-200 bg-white text-teal-800 shadow-sm dark:border-teal-400/20 dark:bg-slate-800 dark:text-teal-300"
                            : "border-transparent bg-transparent text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                >
                    <Music className="h-4 w-4 shrink-0" />
                    បទក្នុងបណ្ណាល័យ
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "upload"}
                    disabled={disabled || uploading}
                    onClick={() => setActiveTab("upload")}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-bold transition-all ${
                        activeTab === "upload"
                            ? "border-teal-200 bg-white text-teal-800 shadow-sm dark:border-teal-400/20 dark:bg-slate-800 dark:text-teal-300"
                            : "border-transparent bg-transparent text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                >
                    <Upload className="h-4 w-4 shrink-0" />
                    បទផ្ទាល់ខ្លួន
                </button>
            </div>

            {activeTab === "library" ? (
                <div className="space-y-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/90 via-white to-slate-50 p-4 shadow-sm dark:border-teal-900/60 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950">
                    <div className="flex items-center justify-between gap-3">
                        <label htmlFor="background-song-select" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            ជ្រើសបទភ្លេង
                        </label>
                        <span className="shrink-0 rounded-full border border-teal-200 bg-white/80 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-200">
                            {songLibrary.length} បទ
                        </span>
                    </div>
                    <Select
                        value={selectedSongId}
                        onValueChange={setSelectedSongId}
                        disabled={disabled || uploading || !selectedSong}
                    >
                        <SelectTrigger
                            id="background-song-select"
                            className="h-12 w-full rounded-xl border-slate-200 bg-white px-4 text-left text-sm font-semibold text-slate-900 shadow-sm transition hover:border-teal-300 focus:ring-2 focus:ring-teal-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-teal-700"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[min(60vh,24rem)] rounded-xl border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl dark:border-white/10 dark:bg-slate-900 dark:text-slate-100">
                            {songLibrary.map((song) => (
                                <SelectItem key={song.id} value={song.id} className="min-h-11 rounded-lg font-kantumruy text-sm focus:bg-teal-50 focus:text-teal-900 dark:focus:bg-teal-500/15 dark:focus:text-teal-100">
                                    {song.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedSong && (
                        <>
                            <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300">
                                    <Music className="h-5 w-5" />
                                </div>
                                <p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                                    {selectedSong.title}
                                </p>
                                {selectedSongIsActive && (
                                    <span className="shrink-0 rounded-full bg-teal-100 px-2 py-1 text-xs font-bold text-teal-800 dark:bg-teal-400/15 dark:text-teal-200">
                                        កំពុងប្រើ
                                    </span>
                                )}
                            </div>
                            <audio
                                key={selectedSongUrl}
                                ref={previewAudioRef}
                                preload="none"
                                src={selectedSongUrl}
                                className="hidden"
                                onPlay={() => setPreviewPlaying(true)}
                                onPause={() => setPreviewPlaying(false)}
                                onTimeUpdate={(event) => setPreviewTime(event.currentTarget.currentTime)}
                                onLoadedMetadata={(event) => setPreviewDuration(event.currentTarget.duration)}
                                onEnded={() => {
                                    setPreviewPlaying(false);
                                    setPreviewTime(0);
                                }}
                                onError={() => {
                                    setPreviewPlaying(false);
                                    setPreviewError("មិនអាចផ្ទុកបទនេះបានទេ។ សូមពិនិត្យអ៊ីនធឺណិត ហើយសាកល្បងម្ដងទៀត។");
                                }}
                            >
                                កម្មវិធីរុករកនេះមិនអាចចាក់សំឡេងបានទេ។
                            </audio>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-slate-800">
                                <Button
                                    type="button"
                                    aria-label={previewPlaying ? "ផ្អាកការស្តាប់មើល" : "ស្តាប់មើល"}
                                    disabled={disabled}
                                    onClick={() => void togglePreview()}
                                    variant="outline"
                                    className="min-h-11 min-w-11 shrink-0 rounded-full p-0"
                                >
                                    {previewPlaying
                                        ? <Pause className="h-4 w-4" />
                                        : <Play className="ml-0.5 h-4 w-4" />}
                                </Button>
                                <span className="w-10 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
                                    {formatTime(previewTime)}
                                </span>
                                <input
                                    type="range"
                                    min={0}
                                    max={previewDuration || 0}
                                    step={0.1}
                                    value={Math.min(previewTime, previewDuration || 0)}
                                    disabled={!previewDuration}
                                    aria-label="ទីតាំងចាក់បទភ្លេង"
                                    onChange={(event) => {
                                        const time = Number(event.target.value);
                                        if (previewAudioRef.current) previewAudioRef.current.currentTime = time;
                                        setPreviewTime(time);
                                    }}
                                    className="h-2 min-w-0 flex-1 accent-teal-600 disabled:opacity-40"
                                />
                                <span className="w-10 shrink-0 text-center text-xs tabular-nums text-muted-foreground">
                                    {formatTime(previewDuration)}
                                </span>
                            </div>
                            {previewError && (
                                <p role="alert" className="text-xs font-semibold text-destructive">
                                    {previewError}
                                </p>
                            )}
                            <Button
                                type="button"
                                disabled={disabled || uploading || selectedSongIsActive}
                                onClick={() => onChange(selectedSongUrl)}
                                className="min-h-11 w-full rounded-xl bg-teal-600 text-sm font-bold text-white hover:bg-teal-700"
                            >
                                {selectedSongIsActive ? <Check className="mr-2 h-4 w-4" /> : null}
                                {selectedSongIsActive ? "បានជ្រើសបទនេះ" : "ប្រើបទនេះ"}
                            </Button>
                        </>
                    )}
                </div>
            ) : (
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`space-y-3 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                        isDragging
                            ? "border-teal-500 bg-teal-500/5"
                            : "border-slate-300 bg-slate-50/60 dark:border-white/15 dark:bg-white/[0.03]"
                    }`}
                >
                    {value && !songLibrary.some((song) => getSongUrl(song.fileName) === value) && (
                        <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-left dark:border-white/10 dark:bg-slate-900">
                            <p className="flex items-center gap-2 text-xs font-bold text-foreground">
                                <Music className="h-4 w-4 text-teal-600" />
                                បទផ្ទាល់ខ្លួនដែលបានជ្រើស
                            </p>
                            <audio key={value} controls preload="none" src={value} className="h-11 w-full">
                                កម្មវិធីរុករកនេះមិនអាចចាក់សំឡេងបានទេ។
                            </audio>
                            <Button
                                type="button"
                                disabled={disabled || uploading}
                                onClick={onRemove}
                                variant="outline"
                                size="sm"
                                className="min-h-10 w-full rounded-lg text-destructive"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                លុបបទនេះ
                            </Button>
                        </div>
                    )}

                    {uploading ? (
                        <div className="mx-auto w-full max-w-xs space-y-3 py-2">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
                            <div
                                className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-valuenow={progress}
                            >
                                <div
                                    className="h-full bg-teal-600 transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p role="status" className="text-xs font-bold text-teal-700 dark:text-teal-300">
                                កំពុងបង្ហោះ {progress}%
                            </p>
                        </div>
                    ) : (
                        <>
                            <FileAudio className="mx-auto h-8 w-8 text-slate-400" />
                            <p className="text-xs text-muted-foreground">
                                រើសបទពីទូរស័ព្ទ ឬអូសឯកសារមកដាក់ទីនេះ។
                            </p>
                            <input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file && !file.type.startsWith("audio/")) {
                                        alert("សូមជ្រើសរើសឯកសារសំឡេង (audio)។");
                                    } else if (file) {
                                        uploadFile(file);
                                    }
                                    event.currentTarget.value = "";
                                }}
                            />
                            <Button
                                type="button"
                                disabled={disabled || uploading}
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="min-h-11 w-full rounded-xl"
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                ជ្រើសឯកសារភ្លេង
                            </Button>
                        </>
                    )}
                </div>
            )}

            {error && <p role="alert" className="text-xs font-semibold text-destructive">{error}</p>}
        </div>
    );
}
