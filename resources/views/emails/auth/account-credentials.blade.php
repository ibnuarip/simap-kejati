@extends('emails.layouts.brand')

@section('subject', 'Selamat Datang — Kredensial Akun Anda')

@section('content')
    <p style="margin:0 0 16px;">
        Halo <strong>{{ $user->name }}</strong>,<br>
        Selamat datang di <strong>{{ config('app.name') }}</strong> — Sistem Informasi Manajemen Agenda Pimpinan Kejaksaan Tinggi.
    </p>

    <p style="margin:0 0 16px;">
        Akun Anda telah berhasil dibuat. Berikut adalah kredensial untuk masuk ke akun Anda:
    </p>

    <style>
        @media only screen and (max-width: 480px) {
            .cred-card { padding: 16px !important; }
            .cred-label, .cred-value { display: block !important; width: 100% !important; }
            .cred-label { padding: 8px 0 0 !important; }
            .cred-value { padding: 2px 0 8px !important; }
        }
    </style>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td class="cred-card" style="background-color:#f7f9f8;border:1px solid #e2e8e6;border-radius:8px;padding:20px;margin:0 0 20px">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="cred-label" style="width:110px;padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#004d25;">Email :</td>
                        <td class="cred-value" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1f2937;word-break:break-all;">{{ $email }}</td>
                    </tr>
                    <tr>
                        <td class="cred-label" style="width:110px;padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#004d25;">Kata Sandi :</td>
                        <td class="cred-value" style="padding:6px 0;font-family:Consolas,Menlo,monospace;font-size:13px;color:#1f2937;font-weight:700;word-break:break-all;">{{ $password }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 20px;">
        Silakan masuk menggunakan kredensial di atas, lalu segera ganti kata sandi Anda untuk keamanan akun.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="padding:4px 0 20px;">
                <a
                    href="{{ $loginUrl }}"
                    style="display:inline-block;background-color:#004d25;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;"
                >
                    Masuk ke {{ config('app.name') }}
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 8px;font-size:12px;color:#6b7280;line-height:1.6;">
        Jika tombol di atas tidak berfungsi, salin dan buka tautan ini di peramban Anda:
    </p>
    <p style="margin:0 0 16px;font-size:12px;color:#6b7280;">
        <a href="{{ $loginUrl }}" style="color:#004d25;">{{ $loginUrl }}</a>
    </p>

    <p style="margin:0 0 16px;font-size:12px;color:#6b7280;line-height:1.6;">
        Jika Anda tidak pernah mendaftar atau membuat akun ini, mohon hubungi administrator.
    </p>

    <p style="margin:0;font-size:13px;color:#374151;">
        Salam hormat,<br>
        <strong style="color:#004d25;">Tim {{ config('app.name') }}</strong>
    </p>
@endsection