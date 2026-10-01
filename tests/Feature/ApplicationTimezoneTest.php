<?php

test('the application timezone follows the APP_TIMEZONE environment variable', function () {
    expect(config('app.timezone'))->toBe(env('APP_TIMEZONE', 'Asia/Jakarta'));
});

test('the default PHP timezone is kept in sync with the configured application timezone', function () {
    expect(date_default_timezone_get())->toBe(config('app.timezone'));
});

test('now resolves to the application timezone rather than UTC', function () {
    expect(now()->getTimezone()->getName())->toBe(config('app.timezone'));
});
