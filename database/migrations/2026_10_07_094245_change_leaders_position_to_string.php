<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ubah kolom leaders.position dari ENUM terbatas menjadi string
     * bebas karena jabatan pimpinan bersifat dinamis (12 jabatan dan
     * dapat bertambah tanpa perubahan kode).
     *
     * MySQL memakai ALTER TABLE ... MODIFY; SQLite membangun ulang
     * tabel karena CHECK constraint enum tidak dapat diubah langsung.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE leaders MODIFY position VARCHAR(255) NOT NULL');

            return;
        }

        $this->rebuildLeadersTable(false);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::table('leaders')->whereNotIn('position', ['Kajati', 'Wakajati', 'Other'])->update(['position' => 'Other']);
            DB::statement("ALTER TABLE leaders MODIFY position ENUM('Kajati', 'Wakajati', 'Other') NOT NULL DEFAULT 'Kajati'");

            return;
        }

        $this->rebuildLeadersTable(true);
    }

    /**
     * Bangun ulang tabel leaders dengan tipe kolom position yang baru.
     */
    protected function rebuildLeadersTable(bool $asEnum): void
    {
        $columns = [
            'id', 'name', 'position', 'nip', 'email', 'phone',
            'is_active', 'sort_order', 'created_at', 'updated_at',
        ];

        DB::statement('PRAGMA foreign_keys=OFF');

        Schema::create('leaders_new', function (Blueprint $table) use ($asEnum) {
            $table->id();
            $table->string('name');

            if ($asEnum) {
                $table->enum('position', ['Kajati', 'Wakajati', 'Other'])->default('Kajati');
            } else {
                $table->string('position');
            }

            $table->string('nip')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        DB::table('leaders_new')->insertUsing($columns, DB::table('leaders')->select($columns));

        if ($asEnum) {
            DB::table('leaders_new')->whereNotIn('position', ['Kajati', 'Wakajati', 'Other'])->update(['position' => 'Other']);
        }

        Schema::drop('leaders');
        Schema::rename('leaders_new', 'leaders');

        DB::statement('PRAGMA foreign_keys=ON');
    }
};
