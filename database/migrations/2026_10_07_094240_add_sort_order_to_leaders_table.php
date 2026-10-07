<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Urutan tampil pimpinan di Master Data (menggantikan CASE
     * Kajati/Wakajati yang hardcoded di controller).
     */
    public function up(): void
    {
        Schema::table('leaders', function (Blueprint $table) {
            $table->unsignedInteger('sort_order')->default(0)->after('position');
        });

        DB::table('leaders')->where('position', 'Kajati')->update(['sort_order' => 0]);
        DB::table('leaders')->where('position', 'Wakajati')->update(['sort_order' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leaders', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
