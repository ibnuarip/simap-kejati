Yth. {{ $user->name }},

Passkey baru berhasil ditambahkan ke akun Anda di {{ $appName }}:

Nama passkey : {{ $passkeyName }}
Ditambahkan  : {{ $occurredAt }}

Passkey memungkinkan Anda masuk ke akun tanpa kata sandi menggunakan perangkat Anda.

Jika Anda menambahkan passkey ini, abaikan email ini. Jika tidak, segera hapus passkey yang mencurigakan melalui halaman Pengaturan > Keamanan dan hubungi administrator.

Masuk ke {{ $appName }}:
{{ $loginUrl }}

Salam hormat,
Tim {{ $appName }}
