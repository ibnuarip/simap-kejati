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
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->string('endpoint', 500)->change();
            $table->string('public_key', 500)->change();
            $table->string('auth_secret', 500)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('push_subscriptions', function (Blueprint $table) {
            $table->string('endpoint', 255)->change();
            $table->string('public_key', 255)->change();
            $table->string('auth_secret', 255)->change();
        });
    }
};
