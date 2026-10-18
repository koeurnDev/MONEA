
import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Loader2, RotateCw, ZoomIn, Scissors, Square, Monitor, Smartphone, FlipHorizontal, FlipVertical, Crop } from 'lucide-react';
import getCroppedImg from '@/lib/crop-image';

interface AspectRatioPreset {
    label: string;
    value: number | undefined;
    icon: React.ReactNode;
}

interface ImageCropperModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string | null;
    contextLabel?: string;
    onCropComplete: (croppedImage: Blob) => void;
    aspectRatio?: number;
    title?: string;
    showPresets?: boolean;
    showAdvancedControls?: boolean;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    onClose,
    imageSrc,
    contextLabel,
    onCropComplete,
    aspectRatio: initialAspectRatio = 1,
    title = "សារែររូបភាព (Crop Image)",
    showPresets = true,
    showAdvancedControls = true
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flip, setFlip] = useState({ horizontal: false, vertical: false });
    const [aspect, setAspect] = useState<number | undefined>(initialAspectRatio);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        setAspect(initialAspectRatio);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setFlip({ horizontal: false, vertical: false });
        setShowAdvanced(false);
    }, [imageSrc, initialAspectRatio, isOpen]);

    const presets: AspectRatioPreset[] = [
        { label: 'ការ៉េ', value: 1, icon: <Square className="w-4 h-4" /> },
        { label: 'បញ្ឈរ', value: 4/5, icon: <Smartphone className="w-4 h-4" /> },
        { label: 'ទទឹង', value: 16/9, icon: <Monitor className="w-4 h-4" /> },
        { label: 'ដើម', value: undefined, icon: <Crop className="w-4 h-4" /> },
    ];

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onRotationChange = (rotation: number) => {
        setRotation(rotation);
    };

    const onCropAreaComplete = useCallback((_croppedArea: any, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        
        try {
            setIsCropping(true);
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation,
                flip
            );
            if (croppedImage) {
                onCropComplete(croppedImage);
                onClose();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCropping(false);
        }
    };

    if (!imageSrc) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="z-[70] flex h-[94dvh] max-h-[94dvh] w-[95vw] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border-none bg-background p-0 shadow-2xl md:h-[min(90vh,760px)] md:max-h-[90vh]">
                <DialogHeader className="p-4 border-b bg-muted/30">
                    <DialogTitle className="text-sm font-bold flex items-center gap-2 font-kantumruy">
                        <Scissors className="w-4 h-4 text-red-600" />
                        {title}
                    </DialogTitle>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        អូសរូបដើម្បីដាក់ឱ្យសមក្នុងស៊ុម។ អាចរំលងការកែតម្រូវបាន—ចុច «ប្រើរូបនេះ» ដើម្បីបន្ត។
                    </p>
                    {contextLabel && (
                        <p className="rounded-lg bg-teal-500/10 px-3 py-2 text-xs font-bold text-teal-800 dark:text-teal-200">
                            រូបនេះនឹងបង្ហាញ៖ {contextLabel}
                        </p>
                    )}
                </DialogHeader>

                <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                    <div className="relative h-[34dvh] min-h-[180px] max-h-[300px] shrink-0 bg-black/95 md:h-auto md:min-h-0 md:max-h-none md:flex-1">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={aspect}
                            onCropChange={onCropChange}
                            onCropComplete={onCropAreaComplete}
                            onZoomChange={onZoomChange}
                            onRotationChange={onRotationChange}
                        />
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col bg-background md:w-64 md:flex-none">
                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto border-t p-4 md:space-y-6 md:border-l md:border-t-0 md:p-6">
                        {showPresets && (
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">ជ្រើសរើសស៊ុមរូប</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {presets.map((preset) => (
                                        <Button
                                            key={preset.label}
                                            variant={aspect === preset.value ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setAspect(preset.value)}
                                            className={cn(
                                                "h-10 gap-2 text-xs font-bold",
                                                aspect === preset.value && "bg-red-600 hover:bg-red-700 text-white border-none"
                                            )}
                                        >
                                            {preset.icon}
                                            {preset.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showAdvancedControls && <details
                            open={showAdvanced}
                            onToggle={(event) => setShowAdvanced(event.currentTarget.open)}
                            className="rounded-xl border border-slate-200 p-3 dark:border-white/10"
                        >
                            <summary className="cursor-pointer text-xs font-bold text-foreground">
                                កែរូបបន្ថែម (អាចរំលង)
                            </summary>
                            <div className="mt-4 space-y-4">
                            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">កែតម្រូវបន្ថែម (អាចរំលង)</Label>
                            
                            <div className="space-y-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-muted-foreground">ពង្រីករូប</span>
                                    <span className="text-xs font-bold">{Math.round(zoom * 100)}%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ZoomIn className="w-3 h-3 text-muted-foreground" />
                                    <Slider
                                        value={[zoom]}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        onValueChange={(value) => setZoom(value[0])}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-muted-foreground">បង្វិលរូប</span>
                                    <span className="text-xs font-bold">{rotation}°</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <RotateCw className="w-3 h-3 text-muted-foreground" />
                                    <Slider
                                        value={[rotation]}
                                        min={0}
                                        max={360}
                                        step={1}
                                        onValueChange={(value) => setRotation(value[0])}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-10 gap-2 text-xs font-bold"
                                    onClick={() => setFlip(prev => ({ ...prev, horizontal: !prev.horizontal }))}
                                >
                                    <FlipHorizontal className="w-3 h-3" />
                                    ត្រឡប់ឆ្វេង-ស្តាំ
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-10 gap-2 text-xs font-bold"
                                    onClick={() => setFlip(prev => ({ ...prev, vertical: !prev.vertical }))}
                                >
                                    <FlipVertical className="w-3 h-3" />
                                    ត្រឡប់លើ-ក្រោម
                                </Button>
                            </div>
                        </div>
                        </details>}

                        </div>
                        <div className="shrink-0 space-y-2 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-4">
                            <Button 
                                onClick={handleCrop} 
                                disabled={isCropping}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold font-kantumruy shadow-lg shadow-red-100 dark:shadow-none h-11"
                            >
                                {isCropping ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        កំពុងរៀបចំ...
                                    </>
                                ) : (
                                    'ប្រើរូបនេះ'
                                )}
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={onClose}
                                className="w-full font-kantumruy text-xs text-muted-foreground"
                            >
                                ត្រឡប់ក្រោយ
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropperModal;
