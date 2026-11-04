Yth. {{ $user->name }},

Sebuah passkey berhasil dihapus dari akun Anda di {{ $appName }}:

Nama passkey : {{ $passkeyName }}
Dihapus      : {{ $occurredAt }}

Jika Anda yang menghapus passkey ini, abaikan email ini. Jika tidak, segera periksa daftar passkey di halaman Pengaturan > Keamanan, hapus passkey yang mencurigakan, dan hubungi Tim SIMAP.

Masuk ke {{ $appName }}:
{{ $loginUrl }}

Salam hormat,
Tim {{ $appName }}
