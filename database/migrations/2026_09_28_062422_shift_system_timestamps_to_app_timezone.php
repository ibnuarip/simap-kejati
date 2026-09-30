<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom timestamp yang dibuat otomatis oleh sistem, dipetakan per tabel.
     *
     * @var array<string, list<string>>
     */
    private const COLUMNS = [
        'categories' => ['created_at', 'updated_at'],
        'events' => ['created_at', 'updated_at'],
        'failed_jobs' => ['failed_at'],
        'leaders' => ['created_at', 'updated_at'],
        'passkeys' => ['created_at', 'updated_at', 'last_used_at'],
        'password_reset_tokens' => ['created_at'],
        'rooms' => ['created_at', 'updated_at'],
        'users' => ['created_at', 'updated_at', 'email_verified_at', 'two_factor_confirmed_at'],
    ];

    /**
     * Tabel yang tidak memakai primary key "id".
     *
     * @var array<string, string>
     */
    private const KEYS = [
        'password_reset_tokens' => 'email',
    ];

    /**
     * Timezone yang dipakai aplikasi sebelum kolom-kolom ini ditulis.
     */
    private const PREVIOUS_TIMEZONE = 'UTC';

    public function up(): void
    {
        $this->shiftAll($this->offsetSeconds());
    }

    public function down(): void
    {
        $this->shiftAll(-$this->offsetSeconds());
    }

    /**
     * Selisih offset dalam detik antara timezone lama dan timezone aplikasi.
     */
    private function offsetSeconds(): int
    {
        $previous = new DateTimeZone(self::PREVIOUS_TIMEZONE);
        $current = new DateTimeZone((string) config('app.timezone'));

        $now = new DateTimeImmutable('now', $previous);

        return $current->getOffset($now) - $previous->getOffset($now);
    }

    private function shiftAll(int $seconds): void
    {
        if ($seconds === 0) {
            return;
        }

        foreach (self::COLUMNS as $table => $columns) {
            $this->shift($table, $columns, $seconds);
        }
    }

    /**
     * MemGESER nilai jam dinding pada kolom timestamp.
     *
     * Kolom jam dinding yang diisi manual pengguna — events.start_time dan
     * events.end_time — sengaja tidak disentuh karena sudah memakai waktu lokal
     * yang dibaca pengguna apa adanya.
     *
     * @param  list<string>  $columns
     */
    private function shift(string $table, array $columns, int $seconds): void
    {
        if (! Schema::hasTable($table)) {
            return;
        }

        $columns = array_values(array_filter(
            $columns,
            fn (string $column): bool => Schema::hasColumn($table, $column),
        ));

        if ($columns === []) {
            return;
        }

        $key = self::KEYS[$table] ?? 'id';

        DB::table($table)->orderBy($key)->chunk(500, function ($rows) use ($table, $columns, $key, $seconds): void {
            foreach ($rows as $row) {
                $updates = [];

                foreach ($columns as $column) {
                    if ($row->{$column} !== null) {
                        $updates[$column] = Carbon::parse($row->{$column})->addSeconds($seconds);
                    }
                }

                if ($updates !== []) {
                    DB::table($table)->where($key, $row->{$key})->update($updates);
                }
            }
        });
    }
};
