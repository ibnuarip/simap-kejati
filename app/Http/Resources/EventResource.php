<?php

namespace App\Http\Resources;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @mixin Event
 */
class EventResource extends JsonResource
{
    /**
     * Transform a collection of events into plain arrays for Inertia props.
     *
     * @param  Collection<int, Event>|iterable<Event>  $events
     * @return array<int, array<string, mixed>>
     */
    public static function list(Collection|iterable $events): array
    {
        return collect($events)->map(fn (Event $event) => self::make($event)->resolve())->all();
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'start_time' => $this->start_time->toDateTimeString(),
            'end_time' => $this->end_time->toDateTimeString(),
            'dress_code' => $this->dress_code,
            'participants' => $this->participants,
            'custom_location' => $this->custom_location,
            'status' => $this->status,
            'leader' => $this->whenLoaded('leader', fn () => $this->leader ? [
                'id' => $this->leader->id,
                'name' => $this->leader->name,
                'position' => $this->leader->position,
            ] : null),
            'room' => $this->whenLoaded('room', fn () => $this->room ? [
                'id' => $this->room->id,
                'name' => $this->room->name,
            ] : null),
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ] : null),
        ];
    }
}
