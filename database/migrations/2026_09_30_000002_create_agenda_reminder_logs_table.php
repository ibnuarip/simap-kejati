<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agenda_reminder_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agenda_id')->constrained('events')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('remind_at');
            $table->timestamp('sent_at')->nullable();

            $table->unique(['agenda_id', 'user_id', 'remind_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agenda_reminder_logs');
    }
};
