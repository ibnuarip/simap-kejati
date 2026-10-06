<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tanpa doctrine/dbal, ubah enum via statement khusus MySQL.
        // SQLite tidak menegakkan enum sehingga tidak perlu diubah
        // (validasi in: di LeaderRequest yang menjaga di semua driver).
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE leaders MODIFY position ENUM('Kajati', 'Wakajati') NOT NULL DEFAULT 'Kajati'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE leaders MODIFY position ENUM('Kajati', 'Wakajati', 'Other') NOT NULL DEFAULT 'Kajati'");
        }
    }
};
