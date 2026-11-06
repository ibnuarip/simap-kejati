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
        return [
            'name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', Rule::in(Leader::POSITIONS)],
            'nip' => ['required', 'string', 'digits:18', $this->uniqueEncryptedValue('nip')],
            'email' => ['required', 'email', 'max:255', Rule::unique('leaders', 'email')->ignore($this->route('leader'))],
            'phone' => ['required', 'string', 'regex:/^08\d{8,12}$/', $this->uniqueEncryptedValue('phone')],
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
     * Validasi unik untuk kolom yang dienkripsi AES sebelum disimpan (nip & phone).
     * Karena AES-256-CBC menghasilkan ciphertext acak setiap enkripsi, nilai
     * dibandingkan setelah didekripsi melalui cast model kecuali milik record sendiri.
     *
     * @param  'nip'|'phone'  $column
     * @return Closure(string, mixed, Closure(string): void): void
     */
    private function uniqueEncryptedValue(string $column): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($column): void {
            if (! is_string($value)) {
                return;
            }

            $query = Leader::query();

            $leader = $this->route('leader');

            if ($leader instanceof Leader) {
                $query->whereKeyNot($leader->getKey());
            }

            /** @var Leader $existing */
            foreach ($query->get(['id', $column]) as $existing) {
                if (($column === 'nip' ? $existing->nip : $existing->phone) === $value) {
                    $fail($column === 'nip'
                        ? 'NIP sudah digunakan oleh pimpinan lain.'
                        : 'No. telepon sudah digunakan oleh pimpinan lain.');

                    return;
                }
            }
        };
    }
}
