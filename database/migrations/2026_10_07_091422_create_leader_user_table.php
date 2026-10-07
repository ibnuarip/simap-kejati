<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Penugasan pimpinan ke akun protokol (banyak-ke-banyak):
     * satu protokol bisa memegang beberapa pimpinan dan sebaliknya.
     */
    public function up(): void
    {
        Schema::create('leader_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leader_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unique(['leader_id', 'user_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leader_user');
    }
};
