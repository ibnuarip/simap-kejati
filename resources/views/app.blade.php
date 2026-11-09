<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        @php
            $seoTitle = 'SIMAP — Sistem Informasi Manajemen Agenda Pimpinan | Kejaksaan Tinggi Jawa Barat';
            $seoDescription = 'Kelola dan pantau seluruh agenda pimpinan Kejaksaan Tinggi Jawa Barat dalam satu tempat terjadwal, terdokumentasi, dan tepat waktu.';
            $baseUrl = rtrim(request()->getSchemeAndHttpHost() ?: config('app.url', 'http://localhost'), '/');
            $currentUrl = $baseUrl . request()->getRequestUri();
            $ogImageUrl = $baseUrl . '/images/og-image.jpg';
        @endphp

        <meta name="description" content="{{ $seoDescription }}">
        <meta name="application-name" content="SIMAP Kejati Jabar">
        <meta name="theme-color" content="#008752">
        <link rel="canonical" href="{{ $currentUrl }}">

        {{-- Open Graph / WhatsApp / Telegram / Facebook --}}
        <meta property="og:type" content="website">
        <meta property="og:locale" content="id_ID">
        <meta property="og:site_name" content="SIMAP Kejaksaan Tinggi Jawa Barat">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" content="{{ $seoDescription }}">
        <meta property="og:url" content="{{ $currentUrl }}">
        <meta property="og:image" content="{{ $ogImageUrl }}">
        <meta property="og:image:secure_url" content="{{ $ogImageUrl }}">
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="SIMAP — Sistem Informasi Manajemen Agenda Pimpinan Kejaksaan Tinggi Jawa Barat">

        {{-- Twitter / X Card --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        <meta name="twitter:description" content="{{ $seoDescription }}">
        <meta name="twitter:image" content="{{ $ogImageUrl }}">
        <meta name="twitter:image:alt" content="SIMAP — Sistem Informasi Manajemen Agenda Pimpinan Kejaksaan Tinggi Jawa Barat">

        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">

        <link rel="preload" href="{{ Vite::asset('resources/fonts/poppins-400.woff2') }}" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="{{ Vite::asset('resources/fonts/poppins-600.woff2') }}" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="{{ Vite::asset('resources/fonts/poppins-700.woff2') }}" as="font" type="font/woff2" crossorigin>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
