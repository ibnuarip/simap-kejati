<?php

namespace App\Http\Requests;

use App\Models\Leader;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeaderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $leader = $this->route('leader');

        $isUnchangedNip = $leader instanceof Leader
            && is_string($this->input('nip'))
            && $this->input('nip') === $leader->nip;

        $isUnchangedPhone = $leader instanceof Leader
            && is_string($this->input('phone'))
            && $this->input('phone') === $leader->phone;

        return [
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', Rule::in(Leader::POSITIONS)],
            'nip' => $isUnchangedNip
                ? ['required', 'string']
                : ['required', 'string', 'digits:18', $this->uniqueMaskedValue('nip')],
            'email' => ['required', 'email', 'max:255', Rule::unique('leaders', 'email')->ignore($this->route('leader'))],
            'phone' => $isUnchangedPhone
                ? ['required', 'string']
                : ['required', 'string', 'regex:/^08\d{8,12}$/', $this->uniqueMaskedValue('phone')],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nip.digits' => 'NIP harus terdiri dari 18 digit angka.',
            'phone.regex' => 'Nomor telepon harus diawali 08 dan terdiri dari 10–14 digit angka.',
            'email.required' => 'Email wajib diisi.',
            'nip.required' => 'NIP wajib diisi.',
            'email.unique' => 'Email sudah digunakan oleh pimpinan lain.',
        ];
    }

    /**
     * Validasi unik untuk kolom yang di-mask sebelum disimpan (nip & phone).
     * Nilai input yang di-mask harus cocok dengan data tersimpan, kecuali milik record sendiri.
     *
     * @return Closure(string, mixed, Closure(string): void): void
     */
    private function uniqueMaskedValue(string $column): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($column): void {
            if (! is_string($value)) {
                return;
            }

            $masked = $column === 'nip' ? Leader::maskNip($value) : Leader::maskPhone($value);

            $query = Leader::where($column, $masked);

            $leader = $this->route('leader');

            if ($leader instanceof Leader) {
                $query->whereKeyNot($leader->getKey());
            }

            if ($query->exists()) {
                $fail($column === 'nip'
                    ? 'NIP sudah digunakan oleh pimpinan lain.'
                    : 'No. telepon sudah digunakan oleh pimpinan lain.');
            }
        };
    }
}
