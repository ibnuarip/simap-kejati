@extends('emails.layouts.brand')

@section('subject', 'Atur Ulang Kata Sandi')

@section('content')
    <p style="margin:0 0 16px;">
        Yth. Pengguna,<br>
        Kami menerima permintaan untuk <strong>mengatur ulang kata sandi</strong> akun
        <strong>{{ config('app.name') }}</strong> Anda yang terdaftar dengan email <strong>{{ $email }}</strong>.
    </p>

    <p style="margin:0 0 20px;">
        Silakan klik tombol di bawah ini untuk membuat kata sandi baru:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="padding:4px 0 20px;">
                <a
                    href="{{ $resetUrl }}"
                    style="display:inline-block;background-color:#004d25;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;"
                >
                    Atur Ulang Kata Sandi
                </a>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 12px;font-size:12px;color:#6b7280;line-height:1.6;">
        Tautan ini berlaku selama <strong>{{ $expiresInMinutes }} menit</strong> sejak email ini dikirim. Jika tautan
        telah kedaluwarsa, Anda dapat mengulang permintaan pada halaman &ldquo;Lupa Kata Sandi&rdquo;.
    </p>

    <p style="margin:0 0 16px;font-size:12px;color:#6b7280;line-height:1.6;">
        Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini. Kata sandi Anda tetap aman dan tidak
        akan berubah.
    </p>

    <p style="margin:0;font-size:13px;color:#374151;">
        Salam hormat,<br>
        <strong style="color:#004d25;">Tim {{ config('app.name') }}</strong>
    </p>
@endsection