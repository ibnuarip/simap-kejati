import { ExternalLink, FileText, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Props = {
    currentName?: string | null;
    currentUrl?: string | null;
    error?: string;
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function PdfAttachmentInput({ currentName, currentUrl, error }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [removeChecked, setRemoveChecked] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);

    const openFilePicker = () => {
        setClientError(null);
        fileInputRef.current?.click();
    };

    const clearSelectedFile = () => {
        setSelectedName(null);
        setClientError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (!file) {
            setSelectedName(null);

            return;
        }

        const isPdf =
            file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

        if (!isPdf) {
            setClientError('Lampiran harus berformat PDF.');
            event.target.value = '';
            setSelectedName(null);

            return;
        }

        if (file.size > MAX_FILE_BYTES) {
            setClientError('Ukuran lampiran PDF maksimal 5 MB.');
            event.target.value = '';
            setSelectedName(null);

            return;
        }

        setClientError(null);
        setSelectedName(file.name);
        setRemoveChecked(false);
    };

    const displayError = clientError ?? error;

    return (
        <div className="grid min-w-0 gap-2">
            <Label htmlFor="attachment">Lampiran PDF (Opsional)</Label>

            <input
                ref={fileInputRef}
                id="attachment"
                name="attachment"
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={handleFileSelect}
            />

            <div className="flex min-w-0 flex-col gap-2.5 rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openFilePicker}
                    >
                        <Upload className="size-4" />
                        {selectedName || currentUrl
                            ? 'Pilih PDF Lain'
                            : 'Pilih Berkas PDF'}
                    </Button>

                    {selectedName ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearSelectedFile}
                            className="text-destructive hover:text-destructive"
                        >
                            <X className="size-4" />
                            Batal
                        </Button>
                    ) : null}
                </div>

                {selectedName ? (
                    <div className="flex min-w-0 items-center gap-2">
                        <FileText className="text-primary size-4 shrink-0" />
                        <span className="truncate text-xs font-medium">
                            {selectedName}
                        </span>
                        <Badge
                            variant="secondary"
                            className="shrink-0 text-[10px]"
                        >
                            Siap diunggah
                        </Badge>
                    </div>
                ) : currentUrl && !removeChecked ? (
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <a
                            href={currentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary inline-flex min-w-0 items-center gap-1.5 text-xs font-medium hover:underline"
                        >
                            <FileText className="size-4 shrink-0" />
                            <span className="truncate">
                                {currentName ?? 'Lampiran Agenda.pdf'}
                            </span>
                            <ExternalLink className="size-3 shrink-0" />
                        </a>
                    </div>
                ) : removeChecked ? (
                    <Badge variant="outline" className="w-fit text-xs">
                        Lampiran saat ini akan dihapus saat disimpan
                    </Badge>
                ) : null}

                <p className="text-muted-foreground text-xs">
                    Format PDF (maks. 5 MB), misalnya surat undangan atau nota
                    dinas.
                </p>

                {currentUrl && !selectedName ? (
                    <span
                        role="checkbox"
                        aria-checked={removeChecked}
                        tabIndex={0}
                        onClick={() => setRemoveChecked((value) => !value)}
                        onKeyDown={(event) => {
                            if (event.key === ' ' || event.key === 'Enter') {
                                event.preventDefault();
                                setRemoveChecked((value) => !value);
                            }
                        }}
                        className="flex w-fit cursor-pointer items-center gap-2 text-xs"
                    >
                        <Checkbox
                            name="remove_attachment"
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
                            Hapus lampiran saat ini
                        </span>
                    </span>
                ) : null}
            </div>

            <InputError message={displayError} />
        </div>
    );
}
