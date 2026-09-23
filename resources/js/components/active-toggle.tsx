import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type Props = {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    label?: string;
};

export function ActiveToggle({
    checked,
    onCheckedChange,
    label = 'Aktif',
}: Props) {
    return (
        <div className="flex items-center gap-2">
            <input type="hidden" name="is_active" value={checked ? '1' : '0'} />
            <Checkbox
                id="is_active"
                checked={checked}
                onCheckedChange={(value) => onCheckedChange(Boolean(value))}
            />
            <Label htmlFor="is_active" className="font-normal">
                {label}
            </Label>
        </div>
    );
}
