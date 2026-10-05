<?php

namespace App\Http\Controllers\Protokol;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leadership\ReminderSettingsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('protokol/notifications', [
            'reminderTimings' => $request->user()->reminder_hours ?? ['24'],
        ]);
    }

    public function update(ReminderSettingsRequest $request): RedirectResponse
    {
        $request->user()->update([
            'reminder_hours' => array_values($request->validated('timings')),
        ]);

        return back();
    }
}
