@extends('emails.layouts.brand')

@section('subject', 'Autentikasi Dua Faktor Diaktifkan')

@section('content')
    <p style="margin:0 0 16px;">
        Halo <strong>{{ $user->name }}</strong>,<br>
        Autentikasi dua faktor (2FA) pada akun Anda di <strong>{{ $appName }}</strong> berhasil diaktifkan.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="background-color:#f7f9f8;border:1px solid #e2e8e6;border-radius:8px;padding:16px 20px;margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1f2937;">
                Diaktifkan pada {{ $occurredAt }}
            </td>
        </tr>
    </table>

    <p style="margin:0 0 16px;font-size:13px;color:#374151;">
        Mulai sekarang, Anda akan dimasukkan kode keamanan dari aplikasi autentikator setiap kali masuk ke akun Anda. Simpan kode pemulihan (recovery codes) Anda di tempat yang aman.
    </p>

    <p style="margin:0 0 20px;font-size:13px;color:#374151;">
        Jika Anda yang mengaktifkan fitur ini, abaikan email ini. Jika bukan, segera nonaktifkan autentikasi dua faktor melalui halaman Pengaturan &rsaquo; Keamanan dan hubungi Tim SIMAP.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="padding:4px 0 20px;">
                <a
                    href="{{ $loginUrl }}"
                    style="display:inline-block;background-color:#004d25;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;"
                >
                    Masuk ke {{ $appName }}
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 16px;font-size:12px;color:#6b7280;line-height:1.6;">
        Jika tombol di atas tidak berfungsi, salin dan buka tautan ini di peramban Anda:
    </p>
    <p style="margin:0 0 16px;font-size:12px;color:#6b7280;">
        <a href="{{ $loginUrl }}" style="color:#004d25;">{{ $loginUrl }}</a>
    </p>

    <p style="margin:0;font-size:13px;color:#374151;">
        Salam hormat,<br>
        <strong style="color:#004d25;">Tim {{ $appName }}</strong>
    </p>
@endsection
