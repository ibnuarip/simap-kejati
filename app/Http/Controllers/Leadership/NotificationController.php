<?php

namespace App\Http\Controllers\Leadership;

use App\Http\Controllers\Controller;
use App\Models\Leader;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $recipients = Leader::query()
            ->where('is_active', true)
            ->orderBy('position')
            ->get(['id', 'name', 'position', 'email']);

        return Inertia::render('leadership/notifications', [
            'recipients' => $recipients,
        ]);
    }
}
