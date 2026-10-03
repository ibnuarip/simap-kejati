<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Database\Factories\EventFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Seeder data dummy agenda (tabel events) untuk kebutuhan demo/pengujian.
 *
 * - 100 agenda: 50 berstatus completed (tanggal lampau) + 50 berstatus
 *   scheduled (tanggal mendatang).
 * - Maksimal 3 agenda per hari, tanpa agenda pada hari ini.
 * - Jam 08.00-17.00 memakai slot tetap yang tidak saling bentrok.
 * - Waktu disimpan sebagai wall-clock Asia/Jakarta TANPA konversi ke UTC,
 *   mengikuti config app.timezone dan konvensi kolom start_time/end_time.
 * - Penanda dummy: awalan judul "[DUMMY]" sehingga mudah dihapus via:
 *   Event::where('title', 'like', '[DUMMY]%')->delete();
 * - Idempotent: setiap run menghapus data dummy lama terlebih dahulu,
 *   sehingga dijalankan ulang tidak menumpuk data ganda.
 *
 * Jalankan dengan: php artisan db:seed --class=AgendaDummySeeder
 */
class AgendaDummySeeder extends Seeder
{
    private const TOTAL_COMPLETED = 50;

    private const TOTAL_SCHEDULED = 50;

    private const MAX_PER_DAY = 3;

    private const WEEKS_BACK = 8;

    private const WEEKS_FORWARD = 8;

    /**
     * Slot jam (mulai, selesai) yang dijamin tidak bentrok dalam satu hari.
     *
     * @var list<array{int, int, int, int}>
     */
    private const SLOTS = [
        [8, 0, 9, 30],
        [10, 0, 12, 0],
        [13, 0, 15, 0],
        [15, 30, 17, 0],
    ];

    public function run(): void
    {
        $timezone = (string) config('app.timezone', 'Asia/Jakarta');
        $prefix = EventFactory::DUMMY_PREFIX;

        // Hasil deterministik: run ulang menghasilkan set tanggal/jam yang sama.
        mt_srand(20261002);
        fake()->seed(20261002);

        $today = Carbon::now($timezone)->startOfDay();

        $leaderIds = Leader::query()->where('is_active', true)->pluck('id')->all();
        $roomIds = Room::query()->where('is_active', true)->pluck('id')->all();
        $categoryIds = Category::query()->pluck('id')->all();
        // Sesuai aturan sistem, agenda hanya diinput operator/protokol —
        // akun pimpinan (kajati/wakajati) tidak pernah menjadi penginput.
        $inputterIds = User::query()->whereIn('role', ['operator', 'protokol'])->pluck('id')->all();

        if ($leaderIds === [] || $roomIds === [] || $categoryIds === [] || $inputterIds === []) {
            $this->command->error('Seeder dibatalkan: tabel leaders/rooms/categories kosong atau belum ada user operator/protokol. Jalankan DatabaseSeeder terlebih dahulu.');

            return;
        }

        DB::transaction(function () use ($timezone, $prefix, $today, $leaderIds, $roomIds, $categoryIds, $inputterIds): void {
            // Idempotent: hapus data dummy dari run sebelumnya.
            Event::query()->where('title', 'like', $prefix.'%')->delete();

            $pastDays = $this->pickDays($today, self::WEEKS_BACK, true);
            $futureDays = $this->pickDays($today, self::WEEKS_FORWARD, false);

            $plan = array_merge(
                $this->distribute($pastDays, self::TOTAL_COMPLETED, 'completed'),
                $this->distribute($futureDays, self::TOTAL_SCHEDULED, 'scheduled'),
            );

            foreach ($plan as [$date, $slotIndexes, $status]) {
                foreach ($slotIndexes as $slotIndex) {
                    [$startHour, $startMinute, $endHour, $endMinute] = self::SLOTS[$slotIndex];

                    // Carbon wall-clock Asia/Jakarta, disimpan apa adanya (tanpa ->utc()).
                    $start = Carbon::create(
                        $date->year, $date->month, $date->day,
                        $startHour, $startMinute, 0, $timezone
                    );
                    $end = Carbon::create(
                        $date->year, $date->month, $date->day,
                        $endHour, $endMinute, 0, $timezone
                    );

                    $useRoom = mt_rand(1, 100) <= 70;

                    // Waktu input disebar acak dalam 6 bulan terakhir (selalu
                    // sebelum agenda dimulai) agar grafik tren naik-turun
                    // natural, bukan menumpuk di satu bulan.
                    $createdAt = $this->randomInputTime($today, $start, $timezone);

                    Event::factory()->dummy()->create([
                        'leader_id' => $leaderIds[mt_rand(0, count($leaderIds) - 1)],
                        'room_id' => $useRoom ? $roomIds[mt_rand(0, count($roomIds) - 1)] : null,
                        'custom_location' => $useRoom
                            ? null
                            : fake()->randomElement(EventFactory::customLocations()),
                        'category_id' => $categoryIds[mt_rand(0, count($categoryIds) - 1)],
                        'start_time' => $start,
                        'end_time' => $end,
                        'dress_code' => fake()->randomElement(EventFactory::dressCodes()),
                        'participants' => fake()->randomElement(EventFactory::participants()),
                        'description' => fake()->randomElement(EventFactory::descriptions()),
                        'status' => $status,
                        'created_by' => $inputterIds[mt_rand(0, count($inputterIds) - 1)],
                        'created_at' => $createdAt,
                        'updated_at' => $createdAt,
                    ]);
                }
            }
        });

        $this->printVerification($prefix, $today->toDateString());
    }

    /**
     * Kumpulkan hari kerja (Senin-Jumat) pada rentang minggu ke belakang/depan.
     *
     * @return list<Carbon>
     */
    private function pickDays(Carbon $today, int $weeks, bool $past): array
    {
        $timezone = (string) config('app.timezone', 'Asia/Jakarta');
        $days = [];

        for ($i = 1; $i <= $weeks * 7; $i++) {
            $date = $past
                ? $today->copy()->subDays($i)
                : $today->copy()->addDays($i);

            if ($date->isWeekday()) {
                // Bangun ulang sebagai wall-clock agar tidak ada sisa jam/menit.
                $days[] = Carbon::create(
                    $date->year, $date->month, $date->day, 0, 0, 0, $timezone
                );
            }
        }

        shuffle($days);

        return $days;
    }

    /**
     * Bagi total agenda ke hari-hari kandidat (1 per hari dulu, sisanya
     * disebar acak) tanpa melebihi MAX_PER_DAY. Mengembalikan pasangan
     * [tanggal, daftar index slot, status].
     *
     * @param  list<Carbon>  $days
     * @return list<array{Carbon, list<int>, string}>
     */
    private function distribute(array $days, int $total, string $status): array
    {
        $counts = array_fill(0, count($days), 1);
        $remaining = $total - count($days);

        while ($remaining > 0) {
            $index = mt_rand(0, count($days) - 1);

            if ($counts[$index] < self::MAX_PER_DAY) {
                $counts[$index]++;
                $remaining--;
            }
        }

        $plan = [];

        foreach ($days as $i => $date) {
            $slotIndexes = array_keys(self::SLOTS);
            shuffle($slotIndexes);

            $plan[] = [$date, array_slice($slotIndexes, 0, $counts[$i]), $status];
        }

        return $plan;
    }

    /**
     * Waktu input acak: antara 6 bulan lalu dan 1 jam sebelum agenda
     * dimulai (dibatasi hari ini), sebagai wall-clock Asia/Jakarta.
     */
    private function randomInputTime(Carbon $today, Carbon $start, string $timezone): Carbon
    {
        $lower = $today->copy()->subMonths(6)->startOfDay();

        $upper = $start->copy()->subHour();
        $now = Carbon::now($timezone);

        if ($upper->gt($now)) {
            $upper = $now->copy();
        }

        if ($upper->lt($lower)) {
            $upper = $lower->copy();
        }

        return Carbon::createFromTimestamp(mt_rand($lower->getTimestamp(), $upper->getTimestamp()), $timezone);
    }

    private function printVerification(string $prefix, string $today): void
    {
        $like = $prefix.'%';

        $total = Event::query()->where('title', 'like', $like)->count();

        $perStatus = Event::query()->where('title', 'like', $like)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $overloadedDays = Event::query()->where('title', 'like', $like)
            ->select(DB::raw('date(start_time) as tanggal'), DB::raw('count(*) as jumlah'))
            ->groupBy(DB::raw('date(start_time)'))
            ->havingRaw('count(*) > ?', [self::MAX_PER_DAY])
            ->count();

        $todayCount = Event::query()->where('title', 'like', $like)
            ->whereDate('start_time', $today)
            ->count();

        $range = Event::query()->where('title', 'like', $like)
            ->selectRaw('min(start_time) as paling_lama, max(start_time) as paling_dekat')
            ->first();

        $this->command->info('Verifikasi AgendaDummySeeder:');
        $this->command->table(
            ['Metrik', 'Hasil'],
            [
                ['Total agenda dummy', $total.' (target 100)'],
                ['Berstatus completed', ($perStatus['completed'] ?? 0).' (target 50)'],
                ['Berstatus scheduled', ($perStatus['scheduled'] ?? 0).' (target 50)'],
                ['Tanggal dengan > 3 agenda', $overloadedDays.' (target 0)'],
                ["Agenda tepat hari ini ({$today})", $todayCount.' (target 0)'],
                ['Rentang tanggal', ($range->paling_lama ?? '-').' s/d '.($range->paling_dekat ?? '-')],
            ]
        );
    }
}
