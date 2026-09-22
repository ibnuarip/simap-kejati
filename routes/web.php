<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Master Data
    Route::inertia('master/pimpinan', 'dashboard')->name('master.pimpinan');
    Route::inertia('master/ruangan', 'dashboard')->name('master.ruangan');
    Route::inertia('master/kategori', 'dashboard')->name('master.kategori');

    // Operator Features
    Route::inertia('users', 'dashboard')->name('users.index');
    Route::inertia('agenda', 'dashboard')->name('agenda.index');
    Route::inertia('kalender', 'dashboard')->name('kalender.index');
    Route::inertia('settings/system', 'dashboard')->name('settings.system');
});

require __DIR__.'/settings.php';
