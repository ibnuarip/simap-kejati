<?php

namespace App\Http\Requests;

use App\Models\Leader;
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
                : ['required', 'string', 'digits:18'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => $isUnchangedPhone
                ? ['required', 'string']
                : ['required', 'string', 'regex:/^08\d{8,12}$/'],
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
        ];
    }
}
