<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->index(['start_time', 'end_time'], 'events_start_end_time_index');
            $table->index(['status', 'start_time'], 'events_status_start_time_index');
            $table->index('created_at', 'events_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex('events_start_end_time_index');
            $table->dropIndex('events_status_start_time_index');
            $table->dropIndex('events_created_at_index');
        });
    }
};
