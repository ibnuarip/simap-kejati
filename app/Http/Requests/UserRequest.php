<?php

namespace App\Http\Requests;

use App\Services\AvatarService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
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
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->route('user'))],
            'role' => ['required', 'in:superadmin,protokol,kajati,wakajati'],
            'leaders' => ['nullable', 'array'],
            'leaders.*' => ['integer', Rule::exists('leaders', 'id')],
            'password' => [$this->isMethod('post') ? 'required' : 'nullable', 'string', 'min:8'],
            'avatar' => AvatarService::rules(),
            'remove_avatar' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'avatar.image' => 'Berkas harus berupa gambar.',
            'avatar.mimes' => 'Foto harus berformat JPG, JPEG, atau PNG.',
            'avatar.max' => 'Ukuran foto maksimal 2 MB.',
        ];
    }
}
