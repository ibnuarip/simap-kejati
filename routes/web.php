<?php

use App\Http\Controllers\AvatarController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\Leadership\CalendarController as LeadershipCalendarController;
use App\Http\Controllers\Leadership\DashboardController as LeadershipDashboardController;
use App\Http\Controllers\Leadership\NotificationController as LeadershipNotificationController;
use App\Http\Controllers\Protokol\CalendarController as ProtokolCalendarController;
use App\Http\Controllers\Protokol\DashboardController as ProtokolDashboardController;
use App\Http\Controllers\Protokol\EventController as ProtokolEventController;
use App\Http\Controllers\Protokol\NotificationController as ProtokolNotificationController;
use App\Http\Controllers\PushNotificationController;
use App\Http\Controllers\Superadmin\CalendarController as SuperadminCalendarController;
use App\Http\Controllers\Superadmin\CategoryController as SuperadminCategoryController;
use App\Http\Controllers\Superadmin\DashboardController as SuperadminDashboardController;
use App\Http\Controllers\Superadmin\EventController as SuperadminEventController;
use App\Http\Controllers\Superadmin\LeaderController as SuperadminLeaderController;
use App\Http\Controllers\Superadmin\RoomController as SuperadminRoomController;
use App\Http\Controllers\Superadmin\UserController as SuperadminUserController;
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

// Registrasi publik nonaktif secara default — akun hanya dibuat superadmin
// lewat Kelola Pengguna. Selama fitur mati, route /register Fortify tidak
// terdaftar sehingga semua akses dialihkan ke halaman login. Nyalakan
// sewaktu-waktu via ALLOW_PUBLIC_REGISTRATION=true (lihat config/fortify).
if (! Features::enabled(Features::registration())) {
    Route::match(['get', 'post', 'put', 'patch', 'delete'], '/register', fn () => Redirect::route('login'));
}

// Foto profil: privat, hanya pemilik akun yang sedang login.
Route::get('/avatar/{user}', AvatarController::class)->middleware('auth')->name('avatar.show');

// Penyegar session agar tab yang lama terbuka tidak 419 saat submit.
Route::get('/session/ping', fn () => response()->json(['ok' => true]))->middleware('auth')->name('session.ping');

Route::middleware(['auth', 'verified', 'role:superadmin'])->group(function () {
    Route::get('dashboard', [SuperadminDashboardController::class, 'index'])->name('dashboard');

    // Master Data
    Route::resource('master/leaders', SuperadminLeaderController::class)
        ->names('master.leaders')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('master/rooms', SuperadminRoomController::class)
        ->names('master.rooms')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('master/categories', SuperadminCategoryController::class)
        ->names('master.categories')
        ->only(['index', 'store', 'update', 'destroy']);

    // Superadmin Features
    Route::resource('users', SuperadminUserController::class)
        ->names('users')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('events/conflicts', [SuperadminEventController::class, 'conflicts'])->name('events.conflicts');
    Route::resource('events', SuperadminEventController::class)
        ->names('events')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::post('events/{event}/cancel', [SuperadminEventController::class, 'cancel'])->name('events.cancel');
    Route::get('calendar', [SuperadminCalendarController::class, 'index'])->name('calendar.index');
    Route::get('exports', [ExportController::class, 'index'])->name('exports.index');
    Route::get('exports/print', [ExportController::class, 'print'])->name('exports.print');
    Route::get('exports/download', [ExportController::class, 'download'])->name('exports.download');
});

// Tim Protokol
Route::middleware(['auth', 'verified', 'role:protokol'])->prefix('protokol')->name('protokol.')->group(function () {
    Route::get('/', [ProtokolDashboardController::class, 'index'])->name('dashboard');
    Route::get('/events/conflicts', [ProtokolEventController::class, 'conflicts'])->name('events.conflicts');
    Route::resource('/events', ProtokolEventController::class)
        ->names('events')
        ->only(['index', 'store', 'update', 'destroy']);
    Route::get('/calendar', [ProtokolCalendarController::class, 'index'])->name('calendar.index');
    Route::get('/exports', [ExportController::class, 'index'])->name('exports.index');
    Route::get('/exports/print', [ExportController::class, 'print'])->name('exports.print');
    Route::get('/exports/download', [ExportController::class, 'download'])->name('exports.download');
    Route::post('/events/{event}/cancel', [ProtokolEventController::class, 'cancel'])->name('events.cancel');

    // Pengaturan & langganan push notification tim protokol.
    Route::get('/notifications', [ProtokolNotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications', [ProtokolNotificationController::class, 'update'])->name('notifications.update');
    Route::post('/push/subscribe', [PushNotificationController::class, 'subscribe'])->name('push.subscribe');
    Route::post('/push/unsubscribe', [PushNotificationController::class, 'unsubscribe'])->name('push.unsubscribe');
    Route::get('/push/status', [PushNotificationController::class, 'status'])->name('push.status');
    Route::get('/push/vapid-key', [PushNotificationController::class, 'vapidKey'])->name('push.vapid-key');
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
