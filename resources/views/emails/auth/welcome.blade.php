@extends('emails.layouts.brand')

@section('subject', 'Selamat Datang')

@section('content')
    <p style="margin:0 0 16px;">
        Halo <strong>{{ $user->name }}</strong>,<br>
        Selamat datang di <strong>{{ config('app.name') }}</strong> — Sistem Informasi Manajemen Agenda Pimpinan Kejaksaan Tinggi.
    </p>

    <p style="margin:0 0 16px;">
        Akun Anda telah berhasil dibuat. Kredensial untuk masuk dikirimkan kepada Anda melalui email terpisah
        berjudul <em>&ldquo;Kredensial Akun Anda&rdquo;</em>.
    </p>

    <p style="margin:0 0 4px;">
        Silakan masuk ke sistem menggunakan kredensial tersebut. Demi keamanan, kami menyarankan Anda untuk segera
        mengganti kata sandi setelah berhasil masuk pertama kali.
    </p>

    <p style="margin:0;font-size:13px;color:#374151;">
        Salam hormat,<br>
        <strong style="color:#004d25;">Tim {{ config('app.name') }}</strong>
    </p>
@endsection