<?php

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leaders', function (Blueprint $table) {
            $table->text('nip')->nullable()->change();
            $table->text('phone')->nullable()->change();
        });

        DB::table('leaders')
            ->select(['id', 'nip', 'phone'])
            ->orderBy('id')
            ->each(function (object $leader): void {
                $updates = [];

                foreach (['nip', 'phone'] as $column) {
                    $value = $leader->{$column};

                    if (! is_string($value) || $value === '') {
                        continue;
                    }

                    try {
                        Crypt::decryptString($value);
                    } catch (DecryptException) {
                        $updates[$column] = Crypt::encryptString($value);
                    }
                }

                if ($updates !== []) {
                    DB::table('leaders')->where('id', $leader->id)->update($updates);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('leaders')
            ->select(['id', 'nip', 'phone'])
            ->orderBy('id')
            ->each(function (object $leader): void {
                $updates = [];

                foreach (['nip', 'phone'] as $column) {
                    $value = $leader->{$column};

                    if (! is_string($value) || $value === '') {
                        continue;
                    }

                    try {
                        $updates[$column] = Crypt::decryptString($value);
                    } catch (DecryptException) {
                        // Biarkan nilai apa adanya bila sudah tidak terenkripsi.
                    }
                }

                if ($updates !== []) {
                    DB::table('leaders')->where('id', $leader->id)->update($updates);
                }
            });

        Schema::table('leaders', function (Blueprint $table) {
            $table->string('nip')->nullable()->change();
            $table->string('phone')->nullable()->change();
        });
    }
};
