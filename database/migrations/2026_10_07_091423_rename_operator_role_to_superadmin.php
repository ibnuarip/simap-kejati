<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rename nilai role 'operator' menjadi 'superadmin'.
     *
     * Kolom users.role bertipe ENUM sehingga daftar nilainya ikut diubah:
     * - MySQL: ALTER TABLE ... MODIFY (nilai baru ditambahkan dulu, data
     *   dimigrasi, lalu nilai lama dihapus agar strict mode tidak memotong
     *   baris yang belum termigrasi).
     * - SQLite (dipakai testing): CHECK constraint tidak bisa diubah
     *   langsung sehingga tabel dibangun ulang dengan definisi baru lalu
     *   datanya disalin dengan pemetaan role.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('operator', 'superadmin', 'protokol', 'kajati', 'wakajati') NOT NULL DEFAULT 'superadmin'");
            DB::table('users')->where('role', 'operator')->update(['role' => 'superadmin']);
            DB::statement("ALTER TABLE users MODIFY role ENUM('superadmin', 'protokol', 'kajati', 'wakajati') NOT NULL DEFAULT 'superadmin'");

            return;
        }

        $this->rebuildUsersTable(
            ['superadmin', 'protokol', 'kajati', 'wakajati'],
            'superadmin',
            'operator',
            'superadmin'
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('operator', 'superadmin', 'protokol', 'kajati', 'wakajati') NOT NULL DEFAULT 'operator'");
            DB::table('users')->where('role', 'superadmin')->update(['role' => 'operator']);
            DB::statement("ALTER TABLE users MODIFY role ENUM('operator', 'protokol', 'kajati', 'wakajati') NOT NULL DEFAULT 'operator'");

            return;
        }

        $this->rebuildUsersTable(
            ['operator', 'protokol', 'kajati', 'wakajati'],
            'operator',
            'superadmin',
            'operator'
        );
    }

    /**
     * Bangun ulang tabel users dengan daftar nilai role yang baru.
     *
     * @param  list<string>  $roles
     */
    protected function rebuildUsersTable(array $roles, string $default, string $from, string $to): void
    {
        $columns = [
            'id', 'name', 'email', 'avatar', 'role', 'email_verified_at', 'password',
            'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at',
            'remember_token', 'reminder_hours', 'created_at', 'updated_at',
        ];

        DB::statement('PRAGMA foreign_keys=OFF');

        Schema::create('users_new', function (Blueprint $table) use ($roles, $default) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('avatar')->nullable();
            $table->enum('role', $roles)->default($default);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->rememberToken();
            $table->json('reminder_hours')->nullable();
            $table->timestamps();
        });

        DB::table('users_new')->insertUsing($columns, DB::table('users')->select($columns));
        DB::table('users_new')->where('role', $from)->update(['role' => $to]);

        Schema::drop('users');
        Schema::rename('users_new', 'users');

        DB::statement('PRAGMA foreign_keys=ON');
    }
};
