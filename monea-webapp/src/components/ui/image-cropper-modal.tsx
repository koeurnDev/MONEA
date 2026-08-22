
"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
    onCropComplete: (croppedImage: Blob) => void;
    aspectRatio?: number;
    title?: string;
    showPresets?: boolean;
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    onClose,
    imageSrc,
    onCropComplete,
    aspectRatio: initialAspectRatio = 1,
    title = "សារែររូបភាព (Crop Image)",
    showPresets = true
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [flip, setFlip] = useState({ horizontal: false, vertical: false });
    const [aspect, setAspect] = useState<number | undefined>(initialAspectRatio);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);

    const presets: AspectRatioPreset[] = [
        { label: 'Square', value: 1, icon: <Square className="w-4 h-4" /> },
        { label: 'Portrait', value: 4/5, icon: <Smartphone className="w-4 h-4" /> },
        { label: 'Wide', value: 16/9, icon: <Monitor className="w-4 h-4" /> },
        { label: 'Original', value: undefined, icon: <Crop className="w-4 h-4" /> },
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
            <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden bg-background rounded-2xl border-none shadow-2xl">
                <DialogHeader className="p-4 border-b bg-muted/30">
                    <DialogTitle className="text-sm font-bold flex items-center gap-2 font-kantumruy">
                        <Scissors className="w-4 h-4 text-red-600" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col md:flex-row">
                    <div className="relative h-[40vh] md:h-[60vh] md:flex-1 bg-black/95">
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

                    <div className="w-full md:w-64 p-6 space-y-8 bg-background border-t md:border-t-0 md:border-l">
                        {showPresets && (
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ទំហំរូបភាព (Aspect Ratio)</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {presets.map((preset) => (
                                        <Button
                                            key={preset.label}
                                            variant={aspect === preset.value ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setAspect(preset.value)}
                                            className={cn(
                                                "h-10 gap-2 text-[10px] font-bold",
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

                        <div className="space-y-4">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">សារែរ និងបង្វិល (Tools)</Label>
                            
                            <div className="space-y-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-muted-foreground">Zoom</span>
                                    <span className="text-[10px] font-bold">{Math.round(zoom * 100)}%</span>
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
                                    <span className="text-[10px] text-muted-foreground">Rotation</span>
                                    <span className="text-[10px] font-bold">{rotation}°</span>
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
                                    className="flex-1 h-10 gap-2 text-[10px] font-bold"
                                    onClick={() => setFlip(prev => ({ ...prev, horizontal: !prev.horizontal }))}
                                >
                                    <FlipHorizontal className="w-3 h-3" />
                                    Flip H
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-10 gap-2 text-[10px] font-bold"
                                    onClick={() => setFlip(prev => ({ ...prev, vertical: !prev.vertical }))}
                                >
                                    <FlipVertical className="w-3 h-3" />
                                    Flip V
                                </Button>
                            </div>
                        </div>

                        <div className="pt-4 space-y-2">
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
                                    'រក្សាទុក (Save)'
                                )}
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={onClose}
                                className="w-full font-kantumruy text-[10px] text-muted-foreground"
                            >
                                បោះបង់ (Cancel)
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropperModal;
