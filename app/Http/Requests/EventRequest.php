<?php

namespace App\Http\Requests;

use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
            'force_save' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Tolak jadwal yang bentrok kecuali user mencentang "tetap simpan".
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty() || $this->boolean('force_save')) {
                return;
            }

            $timezone = (string) config('app.timezone');
            $start = Carbon::parse($this->input('start_time'), $timezone);
            $end = Carbon::parse($this->input('end_time'), $timezone);

            $routeEvent = $this->route('event');
            $exceptId = $routeEvent instanceof Event ? $routeEvent->getKey() : null;

            $count = Event::overlapping($start, $end, $exceptId)->count();

            if ($count > 0) {
                $validator->errors()->add(
                    'start_time',
                    "Jadwal bentrok dengan {$count} agenda lain pada waktu tersebut. Centang “Tetap simpan” bila ingin melanjutkan."
                );
            }
        });
    }
}
