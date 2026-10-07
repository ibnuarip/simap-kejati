<?php

use App\Models\Leader;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Gabungkan role 'kajati'/'wakajati' menjadi satu role generik
     * 'pimpinan' yang ditautkan ke data pimpinan via users.leader_id
     * (dicocokkan lewat email seperti aturan sebelumnya).
     *
     * MySQL memakai ALTER TABLE ... MODIFY bertahap seperti migrasi
     * rename sebelumnya; SQLite membangun ulang tabel karena CHECK
     * constraint enum tidak dapat diubah langsung.
     */
    public function up(): void
    {
        $this->linkUsersToLeaders();

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('superadmin', 'protokol', 'pimpinan', 'kajati', 'wakajati') NOT NULL DEFAULT 'superadmin'");
            DB::table('users')->whereIn('role', ['kajati', 'wakajati'])->update(['role' => 'pimpinan']);
            DB::statement("ALTER TABLE users MODIFY role ENUM('superadmin', 'protokol', 'pimpinan') NOT NULL DEFAULT 'superadmin'");

            return;
        }

        $this->rebuildUsersTable(['superadmin', 'protokol', 'pimpinan'], 'superadmin', ['kajati', 'wakajati'], 'pimpinan');
    }

    /**
     * Reverse the migrations.
     *
     * Catatan: rollback tidak dapat mengembalikan perbedaan kajati vs
     * wakajati — keduanya dipetakan ke 'kajati'. Gunakan hanya untuk
     * kebutuhan darurat pengembangan lokal.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('superadmin', 'protokol', 'pimpinan', 'kajati', 'wakajati') NOT NULL DEFAULT 'superadmin'");
            DB::table('users')->where('role', 'pimpinan')->update(['role' => 'kajati']);
            DB::statement("ALTER TABLE users MODIFY role ENUM('superadmin', 'protokol', 'kajati', 'wakajati') NOT NULL DEFAULT 'superadmin'");

            return;
        }

        $this->rebuildUsersTable(['superadmin', 'protokol', 'kajati', 'wakajati'], 'superadmin', ['pimpinan'], 'kajati');
    }

    /**
     * Isi users.leader_id dari data leaders dengan email yang sama.
     */
    protected function linkUsersToLeaders(): void
    {
        foreach (Leader::query()->where('email', '!=', '')->get(['id', 'email']) as $leader) {
            DB::table('users')
                ->whereIn('role', ['kajati', 'wakajati'])
                ->where('email', $leader->email)
                ->update(['leader_id' => $leader->id]);
        }
    }

    /**
     * Bangun ulang tabel users dengan daftar nilai role yang baru.
     *
     * @param  list<string>  $roles
     * @param  list<string>  $fromRoles
     */
    protected function rebuildUsersTable(array $roles, string $default, array $fromRoles, string $to): void
    {
        $columns = [
            'id', 'name', 'email', 'avatar', 'role', 'leader_id', 'email_verified_at', 'password',
            'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at',
            'remember_token', 'reminder_hours', 'created_at', 'updated_at',
        ];

        DB::statement('PRAGMA foreign_keys=OFF');

        Schema::create('users_pimpinan_new', function (Blueprint $table) use ($roles, $default) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('avatar')->nullable();
            $table->enum('role', $roles)->default($default);
            $table->foreignId('leader_id')->nullable()->constrained('leaders')->nullOnDelete();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->rememberToken();
            $table->json('reminder_hours')->nullable();
            $table->timestamps();
        });

        DB::table('users_pimpinan_new')->insertUsing($columns, DB::table('users')->select($columns));
        DB::table('users_pimpinan_new')->whereIn('role', $fromRoles)->update(['role' => $to]);

        Schema::drop('users');
        Schema::rename('users_pimpinan_new', 'users');

        DB::statement('PRAGMA foreign_keys=ON');
    }
};
