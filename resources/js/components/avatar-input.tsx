import {
    Camera,
    Crop,
    RotateCcw,
    RotateCw,
    Trash2,
    Upload,
    X,
    ZoomIn,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/user-avatar';

type Props = {
    userId?: number | null;
    userName: string;
    currentAvatar?: string | null;
    error?: string;
};

type PanOffset = {
    x: number;
    y: number;
};

type CropConfig = {
    zoom: number;
    rotation: number;
    pan: PanOffset;
};

type SourceMeta = {
    name: string;
    type: string;
    width: number;
    height: number;
};

const CROP_OUTPUT_SIZE = 512;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.02;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Batas geser yang fleksibel: pengguna bebas menggeser foto ke atas/bawah/kiri/kanan
 * baik saat menampilkan setengah badan (zoom kecil) maupun close-up wajah (zoom besar).
 */
function clampPan(
    pan: PanOffset,
    naturalWidth: number,
    naturalHeight: number,
    zoom: number,
    rotation: number,
): PanOffset {
    const effW = rotation % 180 === 0 ? naturalWidth : naturalHeight;
    const effH = rotation % 180 === 0 ? naturalHeight : naturalWidth;
    const maxDim = Math.max(effW, effH);

    if (maxDim <= 0) {
        return { x: 0, y: 0 };
    }

    const normW = (effW / maxDim) * zoom;
    const normH = (effH / maxDim) * zoom;
    const maxPanX = Math.max(0.4, normW / 2);
    const maxPanY = Math.max(0.4, normH / 2);

    return {
        x: clamp(pan.x, -maxPanX, maxPanX),
        y: clamp(pan.y, -maxPanY, maxPanY),
    };
}

function renderCropToCanvas(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    zoom: number,
    rotation: number,
    pan: PanOffset,
    mimeType: string,
): void {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    const size = CROP_OUTPUT_SIZE;
    ctx.clearRect(0, 0, size, size);

    if (mimeType !== 'image/png') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
    }

    const effW =
        rotation % 180 === 0 ? image.naturalWidth : image.naturalHeight;
    const effH =
        rotation % 180 === 0 ? image.naturalHeight : image.naturalWidth;

    // Gunakan Math.min sebagai skala dasar (1.0) agar seluruh foto (termasuk setengah badan)
    // langsung muat penuh di dalam lingkaran tanpa terpotong paksa.
    const baseScale = Math.min(size / effW, size / effH);
    const scale = baseScale * zoom;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(size / 2 + pan.x * size, size / 2 + pan.y * size);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2,
        image.naturalWidth,
        image.naturalHeight,
    );
    ctx.restore();
}

/**
 * Pilih, potong (crop & zoom fleksibel), pratinjau, atau hapus foto profil.
 * Berjalan responsif di layar sentuh (HP/tablet) maupun desktop.
 */
export function AvatarInput({ userId, userName, currentAvatar, error }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const croppedFileRef = useRef<File | null>(null);
    const savedSourceRef = useRef<{
        image: HTMLImageElement;
        meta: SourceMeta;
        crop: CropConfig;
    } | null>(null);
    const modalImageRef = useRef<HTMLImageElement | null>(null);
    const dragStartRef = useRef<{
        pointerId: number;
        clientX: number;
        clientY: number;
        startPan: PanOffset;
    } | null>(null);

    const [preview, setPreview] = useState<string | null>(null);
    const [removeChecked, setRemoveChecked] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);

    const [modalMeta, setModalMeta] = useState<SourceMeta | null>(null);
    const [cropOpen, setCropOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [pan, setPan] = useState<PanOffset>({ x: 0, y: 0 });

    // Lepaskan object URL pratinjau lama agar tidak menumpuk di memori browser.
    useEffect(() => {
        if (!preview) {
            return;
        }

        return () => URL.revokeObjectURL(preview);
    }, [preview]);

    // Gambar ulang kanvas di dalam modal setiap kali posisi, zoom, atau rotasi berubah.
    useEffect(() => {
        if (!cropOpen || !cropCanvasRef.current || !modalImageRef.current) {
            return;
        }

        renderCropToCanvas(
            cropCanvasRef.current,
            modalImageRef.current,
            zoom,
            rotation,
            pan,
            modalMeta?.type ?? 'image/jpeg',
        );
    }, [cropOpen, zoom, rotation, pan, modalMeta]);

    const syncFileInput = useCallback((file: File | null) => {
        const input = fileInputRef.current;

        if (!input) {
            return;
        }

        if (!file) {
            input.value = '';

            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
    }, []);

    const openFilePicker = () => {
        setClientError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const closeModalAndRestoreFile = () => {
        setCropOpen(false);
        modalImageRef.current = null;
        setModalMeta(null);
        syncFileInput(croppedFileRef.current);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (!file) {
            syncFileInput(croppedFileRef.current);

            return;
        }

        const isAllowedType =
            ACCEPTED_TYPES.includes(file.type) ||
            /\.(jpe?g|png)$/i.test(file.name);

        if (!isAllowedType) {
            setClientError('Format foto harus JPG, JPEG, atau PNG.');
            syncFileInput(croppedFileRef.current);

            return;
        }

        if (file.size > MAX_FILE_BYTES) {
            setClientError('Ukuran foto maksimal 5 MB.');
            syncFileInput(croppedFileRef.current);

            return;
        }

        setClientError(null);
        syncFileInput(croppedFileRef.current);

        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            modalImageRef.current = img;
            setModalMeta({
                name: file.name,
                type: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
            setZoom(1);
            setRotation(0);
            setPan({ x: 0, y: 0 });
            setCropOpen(true);
            URL.revokeObjectURL(objectUrl);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            setClientError('Berkas gambar tidak dapat dibaca.');
        };

        img.src = objectUrl;
    };

    const handleReopenCrop = () => {
        const saved = savedSourceRef.current;

        if (!saved) {
            openFilePicker();

            return;
        }

        modalImageRef.current = saved.image;
        setModalMeta(saved.meta);
        setZoom(saved.crop.zoom);
        setRotation(saved.crop.rotation);
        setPan(saved.crop.pan);
        setCropOpen(true);
    };

    const handleCancelNewPhoto = () => {
        setPreview(null);
        croppedFileRef.current = null;
        savedSourceRef.current = null;
        modalImageRef.current = null;
        setModalMeta(null);
        setClientError(null);
        syncFileInput(null);
    };

    const updateZoom = (nextZoom: number) => {
        const clampedZoom = clamp(
            Math.round(nextZoom * 100) / 100,
            MIN_ZOOM,
            MAX_ZOOM,
        );
        setZoom(clampedZoom);

        if (modalMeta) {
            setPan((currentPan) =>
                clampPan(
                    currentPan,
                    modalMeta.width,
                    modalMeta.height,
                    clampedZoom,
                    rotation,
                ),
            );
        }
    };

    const handleRotate = () => {
        const nextRotation = (rotation + 90) % 360;
        setRotation(nextRotation);

        if (modalMeta) {
            setPan((currentPan) =>
                clampPan(
                    currentPan,
                    modalMeta.width,
                    modalMeta.height,
                    zoom,
                    nextRotation,
                ),
            );
        }
    };

    const handleResetCrop = () => {
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStartRef.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            startPan: pan,
        };
        setIsDragging(true);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragStartRef.current;

        if (!drag || drag.pointerId !== event.pointerId || !modalMeta) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        const deltaX = (event.clientX - drag.clientX) / rect.width;
        const deltaY = (event.clientY - drag.clientY) / rect.height;

        setPan(
            clampPan(
                {
                    x: drag.startPan.x + deltaX,
                    y: drag.startPan.y + deltaY,
                },
                modalMeta.width,
                modalMeta.height,
                zoom,
                rotation,
            ),
        );
    };

    const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
        if (dragStartRef.current?.pointerId === event.pointerId) {
            dragStartRef.current = null;
            setIsDragging(false);
        }
    };

    const handleApplyCrop = () => {
        const img = modalImageRef.current;

        if (!img || !modalMeta) {
            return;
        }

        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = CROP_OUTPUT_SIZE;
        outputCanvas.height = CROP_OUTPUT_SIZE;

        const mimeType = modalMeta.type;
        renderCropToCanvas(outputCanvas, img, zoom, rotation, pan, mimeType);

        outputCanvas.toBlob(
            (blob) => {
                if (!blob) {
                    setClientError('Gagal memproses potongan foto.');

                    return;
                }

                const ext = mimeType === 'image/png' ? 'png' : 'jpg';
                const baseName =
                    modalMeta.name.replace(/\.[^.]+$/, '') || 'avatar';
                const croppedFile = new File([blob], `${baseName}.${ext}`, {
                    type: mimeType,
                    lastModified: Date.now(),
                });

                croppedFileRef.current = croppedFile;
                savedSourceRef.current = {
                    image: img,
                    meta: modalMeta,
                    crop: { zoom, rotation, pan },
                };
                syncFileInput(croppedFile);
                setPreview(URL.createObjectURL(blob));
                setRemoveChecked(false);
                setCropOpen(false);
            },
            mimeType,
            0.92,
        );
    };

    const handleAvatarCircleClick = () => {
        if (preview && savedSourceRef.current) {
            handleReopenCrop();

            return;
        }

        openFilePicker();
    };

    const displayError = clientError ?? error;

    return (
        <div className="grid min-w-0 gap-3">
            <Label htmlFor="avatar">Foto Profil</Label>

            {/* Input file tersembunyi yang tetap dibaca oleh <Form> Inertia */}
            <input
                ref={fileInputRef}
                id="avatar"
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={handleFileSelect}
            />

            <div className="flex min-w-0 flex-col items-center gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:gap-5">
                {/* Lingkaran Pratinjau Interaktif */}
                <button
                    type="button"
                    onClick={handleAvatarCircleClick}
                    title={
                        preview
                            ? 'Klik untuk mengatur ulang potongan foto'
                            : 'Klik untuk memilih foto profil'
                    }
                    className="group focus-visible:ring-ring relative size-28 shrink-0 cursor-pointer overflow-hidden rounded-full border transition-transform focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden active:scale-95 sm:size-32"
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt="Pratinjau foto profil baru"
                            className="aspect-square size-full object-cover object-center"
                        />
                    ) : (
                        <UserAvatar
                            user={{
                                id: userId ?? -1,
                                name: userName || 'Pengguna',
                                avatar: removeChecked
                                    ? null
                                    : (currentAvatar ?? null),
                            }}
                            className="size-full overflow-hidden rounded-full"
                        />
                    )}

                    <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        {preview ? (
                            <>
                                <Crop className="size-5" />
                                <span className="px-2 text-center text-[11px] leading-tight font-medium">
                                    Atur Posisi
                                </span>
                            </>
                        ) : (
                            <>
                                <Camera className="size-5" />
                                <span className="px-2 text-center text-[11px] leading-tight font-medium">
                                    Ganti Foto
                                </span>
                            </>
                        )}
                    </span>
                </button>

                {/* Area Kontrol & Status */}
                <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-2.5 text-center sm:items-start sm:text-left">
                    {preview ? (
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                            <Badge variant="secondary" className="text-xs">
                                Pratinjau foto baru — klik Save untuk menyimpan
                            </Badge>
                        </div>
                    ) : removeChecked ? (
                        <Badge variant="outline" className="text-xs">
                            Foto saat ini akan dihapus saat Anda klik Save
                        </Badge>
                    ) : null}

                    <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openFilePicker}
                            className="w-full sm:w-auto"
                        >
                            <Upload className="size-4" />
                            {preview ? 'Pilih Foto Lain' : 'Pilih Foto'}
                        </Button>

                        {preview ? (
                            <>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleReopenCrop}
                                    className="flex-1 sm:flex-initial"
                                >
                                    <Crop className="size-4" />
                                    Atur Ulang
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelNewPhoto}
                                    className="text-destructive hover:text-destructive flex-1 sm:flex-initial"
                                >
                                    <X className="size-4" />
                                    Batal
                                </Button>
                            </>
                        ) : null}
                    </div>

                    <p className="text-muted-foreground text-xs">
                        Format JPG, JPEG, atau PNG (maks. 5 MB).
                    </p>

                    {currentAvatar && !preview ? (
                        <span
                            role="checkbox"
                            aria-checked={removeChecked}
                            tabIndex={0}
                            onClick={() => setRemoveChecked((value) => !value)}
                            onKeyDown={(event) => {
                                if (
                                    event.key === ' ' ||
                                    event.key === 'Enter'
                                ) {
                                    event.preventDefault();
                                    setRemoveChecked((value) => !value);
                                }
                            }}
                            className="mt-0.5 flex w-fit cursor-pointer items-center gap-2 text-sm"
                        >
                            <Checkbox
                                name="remove_avatar"
                                value="1"
                                checked={removeChecked}
                                onCheckedChange={(value) =>
                                    setRemoveChecked(value === true)
                                }
                                onClick={(event) => event.stopPropagation()}
                                tabIndex={-1}
                            />
                            <span className="inline-flex items-center gap-1.5">
                                <Trash2 className="size-3.5 shrink-0" />
                                Hapus foto saat ini
                            </span>
                        </span>
                    ) : null}
                </div>
            </div>

            <InputError message={displayError} />

            {/* Modal Crop & Zoom yang Clean dan Fleksibel */}
            <Dialog
                open={cropOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeModalAndRestoreFile();
                    }
                }}
            >
                <DialogContent className="max-h-[92dvh] overflow-y-auto overscroll-contain p-5 sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Sesuaikan Foto</DialogTitle>
                        <DialogDescription>
                            Geser dan atur ukuran foto di dalam lingkaran.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-3.5">
                        {/* Area Crop Lingkaran Langsung (Clean) */}
                        <div
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerEnd}
                            onPointerCancel={handlePointerEnd}
                            onWheel={(event) => {
                                event.preventDefault();
                                const delta =
                                    event.deltaY < 0
                                        ? ZOOM_STEP * 3
                                        : -ZOOM_STEP * 3;
                                updateZoom(zoom + delta);
                            }}
                            className={`border-border bg-muted/40 relative aspect-square w-full max-w-60 touch-none overflow-hidden rounded-full border-2 shadow-inner select-none sm:max-w-65 ${
                                isDragging ? 'cursor-grabbing' : 'cursor-grab'
                            }`}
                        >
                            <canvas
                                ref={(node) => {
                                    cropCanvasRef.current = node;
                                    if (
                                        node &&
                                        modalImageRef.current &&
                                        cropOpen
                                    ) {
                                        renderCropToCanvas(
                                            node,
                                            modalImageRef.current,
                                            zoom,
                                            rotation,
                                            pan,
                                            modalMeta?.type ?? 'image/jpeg',
                                        );
                                    }
                                }}
                                width={CROP_OUTPUT_SIZE}
                                height={CROP_OUTPUT_SIZE}
                                className="block size-full"
                            />
                        </div>

                        {/* Baris Kontrol Sederhana: Slider Zoom + Putar + Reset */}
                        <div className="flex w-full items-center gap-2">
                            <ZoomIn className="text-muted-foreground size-4 shrink-0" />
                            <input
                                type="range"
                                aria-label="Ukuran foto"
                                min={MIN_ZOOM}
                                max={MAX_ZOOM}
                                step={ZOOM_STEP}
                                value={zoom}
                                onChange={(event) =>
                                    updateZoom(Number(event.target.value))
                                }
                                className="accent-primary h-1.5 flex-1 cursor-pointer rounded-lg"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0"
                                onClick={handleRotate}
                                title="Putar 90°"
                                aria-label="Putar 90 derajat"
                            >
                                <RotateCw className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0"
                                onClick={handleResetCrop}
                                disabled={
                                    zoom === 1 &&
                                    rotation === 0 &&
                                    pan.x === 0 &&
                                    pan.y === 0
                                }
                                title="Reset posisi"
                                aria-label="Reset posisi"
                            >
                                <RotateCcw className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={closeModalAndRestoreFile}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleApplyCrop}
                        >
                            Terapkan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
