<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>@yield('subject') — {{ config('app.name') }}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef1ef;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef1ef;padding:28px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(0,51,25,0.08);">
                    <tr>
                        <td style="background-color:#004d25;padding:22px 32px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width:52px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="background-color:#ffffff;border-radius:8px;padding:5px;">
                                                    <img
                                                        src="{{ asset('images/logo-kejati.png') }}"
                                                        alt="Logo Kejaksaan Tinggi"
                                                        width="42"
                                                        style="display:block;width:42px;height:auto;border:0;"
                                                    >
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td style="padding-left:14px;">
                                        <div style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.5px;line-height:1.2;">
                                            {{ config('app.name') }}
                                        </div>
                                        <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:600;color:#d4af37;text-transform:uppercase;letter-spacing:1.5px;margin-top:3px;">
                                            Sistem Informasi Manajemen Agenda Pimpinan
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:4px;line-height:4px;font-size:0;background-color:#d4af37;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#1f2937;">
                            @yield('content')
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#f7f9f8;padding:20px 32px;border-top:1px solid #e2e8e6;">
                            <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#6b7280;">
                                Kejaksaan Tinggi Jawa Barat · SIMAP<br>
                                Email ini dikirim secara otomatis oleh sistem. Mohon tidak membalas email ini.
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>