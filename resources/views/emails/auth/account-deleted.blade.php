@extends('emails.layouts.brand')

@section('subject', 'Konfirmasi Penghapusan Akun')

@section('content')
    <p style="margin:0 0 16px;">
        Halo <strong>{{ $name }}</strong>,<br>
        Ini adalah konfirmasi bahwa akun Anda di <strong>{{ $appName }}</strong> telah dihapus.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="background-color:#f7f9f8;border:1px solid #e2e8e6;border-radius:8px;padding:16px 20px;margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1f2937;">
                <div style="padding:4px 0;">
                    <strong style="color:#004d25;">Email :</strong>
                    {{ $email }}
                </div>
                <div style="padding:4px 0;">
                    <strong style="color:#004d25;">Peran :</strong>
                    {{ $roleLabel }}
                </div>
                <div style="padding:4px 0;">
                    <strong style="color:#004d25;">Dihapus pada :</strong>
                    {{ $occurredAt }}
                </div>
                <div style="padding:4px 0;">
                    <strong style="color:#004d25;">Dihapus oleh :</strong>
                    {{ $deletedBy === 'admin' ? 'Superadmin' : 'Anda sendiri' }}
                </div>
            </td>
        </tr>
    </table>

    <p style="margin:0 0 16px;font-size:13px;color:#374151;">
        Terima kasih telah menggunakan {{ $appName }} selama ini. Semoga sukses selalu dalam pekerjaan Anda.
    </p>

    <p style="margin:0 0 16px;font-size:13px;color:#374151;">
        Jika penghapusan ini bukan Anda yang lakukan, segera hubungi Tim {{ $appName }}.
        Untuk pembuatan akun baru, silakan hubungi Tim {{ $appName }}.
    </p>

    <p style="margin:0;font-size:13px;color:#374151;">
        Salam hormat,<br>
        <strong style="color:#004d25;">Tim {{ $appName }}</strong>
    </p>
@endsection
