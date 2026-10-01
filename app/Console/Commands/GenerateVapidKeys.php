<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeys extends Command
{
    protected $signature = 'webpush:generate-vapid-keys';

    protected $description = 'Generate VAPID keys untuk Web Push Notification';

    public function handle(): int
    {
        $keys = VAPID::createVapidKeys();

        $this->info('VAPID_PUBLIC_KEY='.$keys['publicKey']);
        $this->info('VAPID_PRIVATE_KEY='.$keys['privateKey']);

        return 0;
    }
}
