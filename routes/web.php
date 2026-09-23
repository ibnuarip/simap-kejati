<?php

use App\Http\Controllers\Leadership\CalendarController as LeadershipCalendarController;
use App\Http\Controllers\Leadership\DashboardController as LeadershipDashboardController;
use App\Http\Controllers\Leadership\NotificationController as LeadershipNotificationController;
use App\Http\Controllers\Operator\CalendarController as OperatorCalendarController;
use App\Http\Controllers\Operator\CategoryController as OperatorCategoryController;
use App\Http\Controllers\Operator\DashboardController as OperatorDashboardController;
use App\Http\Controllers\Operator\EventController as OperatorEventController;
use App\Http\Controllers\Operator\LeaderController as OperatorLeaderController;
use App\Http\Controllers\Operator\RoomController as OperatorRoomController;
use App\Http\Controllers\Operator\SystemController as OperatorSystemController;
use App\Http\Controllers\Operator\UserController as OperatorUserController;
use App\Http\Controllers\Protokol\CalendarController as ProtokolCalendarController;
use App\Http\Controllers\Protokol\DashboardController as ProtokolDashboardController;
use App\Http\Controllers\Protokol\EventController as ProtokolEventController;
use App\Http\Controllers\Protokol\ExportController as ProtokolExportController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified', 'role:operator'])->group(function () {
    Route::get('dashboard', [OperatorDashboardController::class, 'index'])->name('dashboard');

    // Master Data
    Route::resource('master/leaders', OperatorLeaderController::class)
        ->names('master.leaders')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('master/rooms', OperatorRoomController::class)
        ->names('master.rooms')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('master/categories', OperatorCategoryController::class)
        ->names('master.categories')
        ->only(['index', 'store', 'update', 'destroy']);

    // Operator Features
    Route::resource('users', OperatorUserController::class)
        ->names('users')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('events', OperatorEventController::class)
        ->names('events')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('calendar', [OperatorCalendarController::class, 'index'])->name('calendar.index');
    Route::get('settings/system', [OperatorSystemController::class, 'index'])->name('settings.system');
});

// Tim Protokol
Route::middleware(['auth', 'verified', 'role:protokol'])->prefix('protokol')->name('protokol.')->group(function () {
    Route::get('/', [ProtokolDashboardController::class, 'index'])->name('dashboard');
    Route::get('/events', [ProtokolEventController::class, 'index'])->name('events.index');
    Route::get('/calendar', [ProtokolCalendarController::class, 'index'])->name('calendar.index');
    Route::get('/exports', [ProtokolExportController::class, 'index'])->name('exports.index');
});

// Ketua & Wakil Ketua (Leadership)
Route::middleware(['auth', 'verified', 'role:kajati,wakajati'])->prefix('leadership')->name('leadership.')->group(function () {
    Route::get('/', [LeadershipDashboardController::class, 'index'])->name('dashboard');
    Route::get('/calendar', [LeadershipCalendarController::class, 'index'])->name('calendar.index');
    Route::get('/notifications', [LeadershipNotificationController::class, 'index'])->name('notifications.index');
});

require __DIR__.'/settings.php';
