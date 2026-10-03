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
use App\Http\Controllers\Operator\UserController as OperatorUserController;
use App\Http\Controllers\Protokol\CalendarController as ProtokolCalendarController;
use App\Http\Controllers\Protokol\DashboardController as ProtokolDashboardController;
use App\Http\Controllers\Protokol\EventController as ProtokolEventController;
use App\Http\Controllers\Protokol\ExportController as ProtokolExportController;
use App\Http\Controllers\PushNotificationController;
use App\Http\Responses\LoginResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    $user = $request->user();

    if ($user) {
        return Redirect::to(LoginResponse::homeForRole($user));
    }

    return Inertia::render('home', [
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'canUsePasskey' => Features::enabled(Features::passkeys()),
        'status' => $request->session()->get('status'),
    ]);
})->name('home');

// Registrasi publik nonaktif secara default — akun hanya dibuat operator
// lewat Kelola Pengguna. Selama fitur mati, route /register Fortify tidak
// terdaftar sehingga semua akses dialihkan ke halaman login. Nyalakan
// sewaktu-waktu via ALLOW_PUBLIC_REGISTRATION=true (lihat config/fortify).
if (! Features::enabled(Features::registration())) {
    Route::match(['get', 'post', 'put', 'patch', 'delete'], '/register', fn () => Redirect::route('login'));
}

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
    Route::post('events/{event}/cancel', [OperatorEventController::class, 'cancel'])->name('events.cancel');
    Route::get('calendar', [OperatorCalendarController::class, 'index'])->name('calendar.index');
});

// Tim Protokol
Route::middleware(['auth', 'verified', 'role:protokol'])->prefix('protokol')->name('protokol.')->group(function () {
    Route::get('/', [ProtokolDashboardController::class, 'index'])->name('dashboard');
    Route::resource('/events', ProtokolEventController::class)
        ->names('events')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('/calendar', [ProtokolCalendarController::class, 'index'])->name('calendar.index');
    Route::get('/exports', [ProtokolExportController::class, 'index'])->name('exports.index');
    Route::get('/exports/print', [ProtokolExportController::class, 'print'])->name('exports.print');
    Route::get('/exports/download', [ProtokolExportController::class, 'download'])->name('exports.download');
    Route::post('/events/{event}/cancel', [ProtokolEventController::class, 'cancel'])->name('events.cancel');
});

// Ketua & Wakil Ketua (Leadership)
Route::middleware(['auth', 'verified', 'role:kajati,wakajati'])->prefix('leadership')->name('leadership.')->group(function () {
    Route::get('/', [LeadershipDashboardController::class, 'index'])->name('dashboard');
    Route::get('/calendar', [LeadershipCalendarController::class, 'index'])->name('calendar.index');
    Route::get('/notifications', [LeadershipNotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications', [LeadershipNotificationController::class, 'update'])->name('notifications.update');

    // Push Notification API
    Route::post('/push/subscribe', [PushNotificationController::class, 'subscribe'])->name('push.subscribe');
    Route::post('/push/unsubscribe', [PushNotificationController::class, 'unsubscribe'])->name('push.unsubscribe');
    Route::get('/push/status', [PushNotificationController::class, 'status'])->name('push.status');
    Route::get('/push/vapid-key', [PushNotificationController::class, 'vapidKey'])->name('push.vapid-key');
});

require __DIR__.'/settings.php';
