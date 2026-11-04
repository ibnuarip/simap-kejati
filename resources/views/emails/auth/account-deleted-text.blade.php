Yth. {{ $name }},

Ini adalah konfirmasi bahwa akun Anda di {{ $appName }} telah dihapus.

Email     : {{ $email }}
Peran     : {{ $roleLabel }}
Dihapus pada: {{ $occurredAt }}
Dihapus oleh: {{ $deletedBy === 'admin' ? 'Superadmin' : 'Anda sendiri' }}

Terima kasih telah menggunakan {{ $appName }} selama ini. Semoga sukses selalu dalam pekerjaan Anda.

Jika penghapusan ini bukan Anda yang lakukan, segera hubungi Tim {{ $appName }}.
Untuk pembuatan akun baru, silakan hubungi Tim {{ $appName }}.

Salam hormat,
Tim {{ $appName }}
