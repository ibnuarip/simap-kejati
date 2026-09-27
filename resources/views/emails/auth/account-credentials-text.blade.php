Halo {{ $user->name }},

Berikut adalah kredensial untuk masuk ke akun {{ config('app.name') }} Anda:

Email       : {{ $email }}
Kata Sandi  : {{ $password }}

Silakan masuk menggunakan kredensial di atas, lalu segera ganti kata sandi Anda untuk keamanan akun.

Buka halaman masuk melalui tautan berikut:

{{ $loginUrl }}

Jika Anda tidak pernah mendaftar atau membuat akun ini, mohon hubungi administrator.

Salam hormat,
Tim {{ config('app.name') }}