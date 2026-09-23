<?php

namespace App\Http\Controllers\Operator;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class SystemController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('operator/system', [
            'info' => [
                'appName' => config('app.name'),
                'environment' => app()->environment(),
                'laravelVersion' => app()->version(),
                'phpVersion' => PHP_VERSION,
                'debug' => config('app.debug'),
                'database' => config('database.default'),
                'sessionDriver' => config('session.driver'),
                'cacheStore' => config('cache.default'),
                'queueConnection' => config('queue.default'),
            ],
            'summary' => [
                'users' => User::count(),
                'events' => Event::count(),
                'leaders' => Leader::count(),
                'rooms' => Room::count(),
                'categories' => Category::count(),
            ],
        ]);
    }
}
