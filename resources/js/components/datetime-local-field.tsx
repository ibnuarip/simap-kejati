import { useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function toDatetimeLocal(value: string | null | undefined): string {
    return value ? value.replace(' ', 'T').slice(0, 16) : '';
}

type DatetimeLocalFieldProps = {
    id: string;
    name: string;
    label: string;
    defaultValue?: string | null;
    error?: string;
    value?: string;
    onChange?: (value: string) => void;
};

export function DatetimeLocalField({
    id,
    name,
    label,
    defaultValue,
    error,
    value,
    onChange,
}: DatetimeLocalFieldProps) {
    const [internalValue, setInternalValue] = useState(
        defaultValue ? toDatetimeLocal(defaultValue) : '',
    );

    const displayValue = value ?? internalValue;

    return (
        <div className="grid min-w-0 gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={name}
                type="datetime-local"
                required
                step={60}
                value={displayValue}
                onChange={(event) => {
                    setInternalValue(event.target.value);
                    onChange?.(event.target.value);
                }}
            />
            <DatetimePreview value={displayValue} />
            <InputError message={error} />
        </div>
    );
}

function DatetimePreview({ value }: { value: string }) {
    const parsed = useMemo(() => {
        if (!value) {
            return null;
        }

        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }, [value]);

    if (!parsed) {
        return null;
    }

    const formatted = new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short',
    }).format(parsed);

    return (
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CalendarClock className="size-3.5 shrink-0" />
            {formatted}
        </p>
    );
}
