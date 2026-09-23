<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EventRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'leader_id' => ['required', 'integer', Rule::exists('leaders', 'id')],
            'room_id' => ['nullable', 'integer', Rule::exists('rooms', 'id')],
            'custom_location' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
            'dress_code' => ['nullable', 'string', 'max:255'],
            'participants' => ['nullable', 'string'],
            'status' => ['required', 'in:scheduled,ongoing,completed,cancelled'],
        ];
    }
}
