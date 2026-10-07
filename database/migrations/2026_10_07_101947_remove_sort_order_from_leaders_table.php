<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hapus kolom sort_order: urutan tampil pimpinan mengikuti urutan
     * jabatan struktural yang didefinisikan di Leader::POSITIONS.
     */
    public function up(): void
    {
        Schema::table('leaders', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leaders', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->default(0)->after('position');
        });
    }
};
