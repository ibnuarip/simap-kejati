<?php

use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use App\Services\EventAttachmentService;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(EventAttachmentService::DISK);
});

function attachmentDisk(): FilesystemAdapter
{
    /** @var FilesystemAdapter $disk */
    $disk = Storage::disk(EventAttachmentService::DISK);

    return $disk;
}

function pdfFile(string $name = 'Surat-Undangan.pdf', int $kilobytes = 250): UploadedFile
{
    return UploadedFile::fake()->create($name, $kilobytes, 'application/pdf');
}

/**
 * @return array<string, mixed>
 */
function validEventPayload(Leader $leader): array
{
    $start = now()->addDay()->setTime(9, 0);
    $end = $start->copy()->addHours(2);

    return [
        'title' => 'Rapat Koordinasi Pimpinan',
        'description' => 'Pembahasan agenda strategis.',
        'leader_id' => $leader->id,
        'room_id' => Room::factory()->create()->id,
        'category_id' => Category::factory()->create()->id,
        'custom_location' => null,
        'start_time' => $start->toDateTimeString(),
        'end_time' => $end->toDateTimeString(),
        'dress_code' => 'PDH',
        'participants' => 'Para Asisten',
    ];
}

test('superadmin can create an event with an optional pdf attachment', function () {
    $superadmin = User::factory()->superadmin()->create();
    $leader = Leader::factory()->create();

    $this->actingAs($superadmin)
        ->post(route('events.store'), [
            ...validEventPayload($leader),
            'attachment' => pdfFile('Nota-Dinas-Kajati.pdf'),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $event = Event::firstOrFail();

    expect($event->attachment_path)->not->toBeNull()
        ->and($event->attachment_name)->toBe('Nota-Dinas-Kajati.pdf');

    Storage::disk(EventAttachmentService::DISK);
    attachmentDisk()->assertExists($event->attachment_path);
});

test('protokol can create an event with a pdf attachment for an assigned leader', function () {
    $leader = Leader::factory()->create();
    $protokol = User::factory()->protokol()->create();
    $protokol->leaders()->attach($leader->id);

    $this->actingAs($protokol)
        ->post(route('protokol.events.store'), [
            ...validEventPayload($leader),
            'attachment' => pdfFile('Undangan-Rapat.pdf'),
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $event = Event::firstOrFail();

    expect($event->attachment_path)->not->toBeNull()
        ->and($event->attachment_name)->toBe('Undangan-Rapat.pdf');

    attachmentDisk()->assertExists($event->attachment_path);
});

test('updating an event pdf attachment replaces the old file', function () {
    $superadmin = User::factory()->superadmin()->create();
    $leader = Leader::factory()->create();

    $this->actingAs($superadmin)
        ->post(route('events.store'), [
            ...validEventPayload($leader),
            'attachment' => pdfFile('Versi-1.pdf'),
        ]);

    $event = Event::firstOrFail();
    $oldPath = $event->attachment_path;

    $this->patch(route('events.update', $event), [
        'title' => $event->title,
        'leader_id' => $event->leader_id,
        'start_time' => $event->start_time->toDateTimeString(),
        'end_time' => $event->end_time->toDateTimeString(),
        'attachment' => pdfFile('Versi-2.pdf'),
    ])->assertSessionHasNoErrors();

    $event->refresh();

    expect($event->attachment_path)->not->toBe($oldPath)
        ->and($event->attachment_name)->toBe('Versi-2.pdf');

    attachmentDisk()->assertMissing($oldPath);
    attachmentDisk()->assertExists($event->attachment_path);
});

test('removing an event attachment deletes the file and clears columns', function () {
    $superadmin = User::factory()->superadmin()->create();
    $leader = Leader::factory()->create();

    $this->actingAs($superadmin)
        ->post(route('events.store'), [
            ...validEventPayload($leader),
            'attachment' => pdfFile('Untuk-Dihapus.pdf'),
        ]);

    $event = Event::firstOrFail();
    $path = $event->attachment_path;

    $this->patch(route('events.update', $event), [
        'title' => $event->title,
        'leader_id' => $event->leader_id,
        'start_time' => $event->start_time->toDateTimeString(),
        'end_time' => $event->end_time->toDateTimeString(),
        'remove_attachment' => '1',
    ])->assertSessionHasNoErrors();

    $event->refresh();

    expect($event->attachment_path)->toBeNull()
        ->and($event->attachment_name)->toBeNull();

    attachmentDisk()->assertMissing($path);
});

test('deleting an event removes its pdf attachment from storage', function () {
    $superadmin = User::factory()->superadmin()->create();
    $leader = Leader::factory()->create();

    $this->actingAs($superadmin)
        ->post(route('events.store'), [
            ...validEventPayload($leader),
            'attachment' => pdfFile('Hapus-Agenda.pdf'),
        ]);

    $event = Event::firstOrFail();
    $path = $event->attachment_path;

    $this->delete(route('events.destroy', $event))->assertRedirect();

    attachmentDisk()->assertMissing($path);
});

test('event attachment rejects non pdf files and oversized files in indonesian', function () {
    $superadmin = User::factory()->superadmin()->create();
    $leader = Leader::factory()->create();
    $this->actingAs($superadmin);

    $this->post(route('events.store'), [
        ...validEventPayload($leader),
        'attachment' => UploadedFile::fake()->image('bukan-pdf.jpg'),
    ])->assertSessionHasErrors('attachment');

    expect(session('errors')->first('attachment'))
        ->toBe('Lampiran harus berformat PDF.');

    $this->post(route('events.store'), [
        ...validEventPayload($leader),
        'attachment' => pdfFile('Terlalu-Besar.pdf', EventAttachmentService::MAX_KILOBYTES + 100),
    ])->assertSessionHasErrors('attachment');

    expect(session('errors')->first('attachment'))
        ->toBe('Ukuran lampiran PDF maksimal 5 MB.');
});

test('event pdf attachment is accessible only to authorized roles and leader owners', function () {
    $leaderOwner = Leader::factory()->create();
    $otherLeader = Leader::factory()->create();

    $superadmin = User::factory()->superadmin()->create();
    $assignedProtokol = User::factory()->protokol()->create();
    $assignedProtokol->leaders()->attach($leaderOwner->id);
    $unassignedProtokol = User::factory()->protokol()->create();
    $unassignedProtokol->leaders()->attach($otherLeader->id);

    $ownerPimpinan = User::factory()->pimpinan()->create(['leader_id' => $leaderOwner->id]);
    $otherPimpinan = User::factory()->pimpinan()->create(['leader_id' => $otherLeader->id]);

    $event = Event::factory()->create(['leader_id' => $leaderOwner->id]);
    app(EventAttachmentService::class)->store($event, pdfFile('Surat-Resmi.pdf'));

    // Tamu belum login dialihkan ke halaman login.
    $this->get(route('events.attachment', $event))->assertRedirect(route('login'));

    // Superadmin: boleh akses semua.
    $this->actingAs($superadmin)
        ->get(route('events.attachment', $event))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');

    // Protokol yang ditugaskan ke pimpinan tersebut: boleh akses.
    $this->actingAs($assignedProtokol)
        ->get(route('events.attachment', $event))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');

    // Protokol yang tidak ditugaskan: 403.
    $this->actingAs($unassignedProtokol)
        ->get(route('events.attachment', $event))
        ->assertForbidden();

    // Pimpinan pemilik agenda: boleh akses.
    $this->actingAs($ownerPimpinan)
        ->get(route('events.attachment', $event))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');

    // Pimpinan lain: 403.
    $this->actingAs($otherPimpinan)
        ->get(route('events.attachment', $event))
        ->assertForbidden();

    // Agenda tanpa lampiran: 404.
    $emptyEvent = Event::factory()->create(['leader_id' => $leaderOwner->id]);
    $this->actingAs($ownerPimpinan)
        ->get(route('events.attachment', $emptyEvent))
        ->assertNotFound();
});
