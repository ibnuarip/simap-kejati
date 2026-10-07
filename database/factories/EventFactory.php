<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Event;
use App\Models\Leader;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Awalan judul untuk menandai data dummy agar mudah dihapus.
     */
    public const DUMMY_PREFIX = '[DUMMY]';

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->randomElement(static::titles()),
            'description' => $this->faker->randomElement(static::descriptions()),
            'leader_id' => Leader::factory(),
            'room_id' => Room::factory(),
            'category_id' => Category::factory(),
            'custom_location' => null,
            'start_time' => now(config('app.timezone'))->addDay()->setTime(9, 0),
            'end_time' => now(config('app.timezone'))->addDay()->setTime(11, 0),
            'dress_code' => $this->faker->randomElement(static::dressCodes()),
            'participants' => $this->faker->randomElement(static::participants()),
            'status' => 'scheduled',
            // Aturan sistem: agenda hanya diinput superadmin/protokol,
            // bukan oleh akun pimpinan (kajati/wakajati).
            'created_by' => User::factory()->protokol(),
        ];
    }

    /**
     * Tandai hasil factory sebagai data dummy (awalan judul "[DUMMY]").
     */
    public function dummy(): static
    {
        return $this->state(fn (array $attributes): array => [
            'title' => self::DUMMY_PREFIX.' '.ltrim((string) ($attributes['title'] ?? '')),
        ]);
    }

    /**
     * @return list<string>
     */
    public static function titles(): array
    {
        return [
            'Rapat Koordinasi Pimpinan Kejati',
            'Rapat Evaluasi Kinerja Bulanan',
            'Audiensi dengan Forkopimda Provinsi',
            'Audiensi dengan Kepala Kantor Wilayah ATR/BPN',
            'Kunjungan Kerja ke Kejari Bandung',
            'Kunjungan Kerja ke Kejari Cimahi',
            'Kunjungan Silaturahmi ke Polda Jabar',
            'Ekspose Penanganan Perkara Tindak Pidana Korupsi',
            'Gelar Perkara Tahap Penuntutan',
            'Rapat Pleno Persiapan Upacara Hari Bhakti Adhyaksa',
            'Upacara Peringatan Hari Bhakti Adhyaksa',
            'Pelantikan dan Serah Terima Jabatan Eselon III',
            'Apel Pagi Bersama Seluruh Pegawai',
            'Rapat Paripurna Penyusunan Rencana Kerja Anggaran',
            'Monitoring dan Evaluasi Penyerapan Anggaran',
            'Sosialisasi Zona Integritas Menuju WBK',
            'Penandatanganan Nota Kesepahaman dengan Universitas',
            'Penerangan Hukum di Sekolah Menengah Atas',
            'Penyuluhan Hukum Jaksa Masuk Sekolah',
            'Rapat Koordinasi Pengawasan Aliran Kepercayaan Masyarakat',
            'Rapat Tim Pengawalan Pengamanan Pembangunan Strategis',
            'Coffee Morning Pimpinan dengan Para Asisten',
            'Rapat Pembinaan Pegawai Baru CPNS',
            'Pisah Sambut Pejabat Struktural Kejati',
            'Syukuran Kenaikan Pangkat Periode April',
            'Rapat Persiapan Kunjungan Kerja Jaksa Agung',
            'Penerimaan Kunjungan Studi Tiru Kejati Lain',
            'Rapat Evaluasi Program Jaksa Menyapa',
            'Rapat Koordinasi Penanganan Perkara Anak',
            'Kunjungan Kerja ke Lapas Kelas I Sukamiskin',
            'Inspeksi Mendadak Pelayanan PTSP',
            'Rapat Kerja Teknis Bidang Pidana Umum',
            'Rapat Kerja Teknis Bidang Pidana Khusus',
            'Rapat Kerja Teknis Bidang Perdata dan TUN',
            'Rapat Kerja Teknis Bidang Intelijen',
            'Rapat Koordinasi Pengamanan Pemilu dengan KPU dan Bawaslu',
            'Pelatihan Peningkatan Kapasitas Jaksa Fungsional',
            'Rapat Pembahasan Restorative Justice Perkara Ringan',
            'Peringatan Hari Anti Korupsi Sedunia',
            'Donor Darah dalam Rangka HUT Persaja',
        ];
    }

    /**
     * @return list<string>
     */
    public static function descriptions(): array
    {
        return [
            'Membahas capaian kinerja, kendala lapangan, dan langkah strategis tindak lanjut.',
            'Koordinasi lintas bidang untuk menyelaraskan agenda prioritas pimpinan minggu berjalan.',
            'Silaturahmi kelembagaan sekaligus pemantapan sinergi penegakan hukum di daerah.',
            'Pemaparan perkembangan penanganan perkara beserta kebutuhan dukungan administrasi.',
            'Evaluasi serapan anggaran dan percepatan pelaksanaan program kerja triwulan berjalan.',
            'Pembinaan langsung kepada jajaran Kejari mengenai disiplin, kinerja, dan pelayanan publik.',
            'Forum diskusi terbuka antara pimpinan dan para asisten membahas isu aktual penegakan hukum.',
            'Kegiatan penerangan dan penyuluhan hukum kepada masyarakat sebagai upaya pencegahan.',
            'Penandatanganan kerja sama kelembagaan dilanjutkan dengan ramah tamah dan foto bersama.',
            'Persiapan teknis acara seremonial, susunan petugas, undangan, dan pengamanan kegiatan.',
            'Rapat internal membahas administrasi perkara, kelengkapan berkas, dan strategi persidangan.',
            'Sosialisasi pembangunan zona integritas menuju wilayah birokrasi bersih dan melayani.',
        ];
    }

    /**
     * @return list<string>
     */
    public static function dressCodes(): array
    {
        return [
            'Pakaian Dinas Harian (PDH)',
            'Pakaian Dinas Lapangan (PDL)',
            'Pakaian Sipil Lengkap (PSL)',
            'Batik Korpri',
            'Batik Motif Daerah',
            'Seragam Upacara (PDU)',
        ];
    }

    /**
     * @return list<string>
     */
    public static function participants(): array
    {
        return [
            'Kajati, Wakajati, para Asisten, dan Koordinator',
            'Wakajati beserta jajaran Bidang Intelijen',
            'Para Kajari se-wilayah hukum Kejati Jawa Barat',
            'Seluruh pegawai Kejati Jawa Barat',
            'Tim Protokol, Humas, dan Tata Usaha Pimpinan',
            'Unsur Forkopimda Provinsi Jawa Barat',
            'Perwakilan Kejari, Cabjari, dan tamu undangan',
            'Jajaran Bidang Pidana Umum dan penyidik terkait',
            'Jajaran Bidang Pidana Khusus beserta auditor',
            'Tokoh masyarakat, akademisi, dan awak media',
        ];
    }

    /**
     * @return list<string>
     */
    public static function customLocations(): array
    {
        return [
            'Kantor Kejari Bandung, Jl. Jakarta No. 24 Bandung',
            'Kantor Kejari Cimahi, Jl. Raden Demang Hardjakusumah',
            'Mapolda Jawa Barat, Jl. Soekarno Hatta No. 748 Bandung',
            'Gedung Sate, Jl. Diponegoro No. 22 Bandung',
            'Lapas Kelas I Sukamiskin, Jl. A.H. Nasution Bandung',
            'Kampus Universitas Padjadjaran, Jatinangor',
            'Hotel Grand Mercure Bandung, Jl. Setiabudi',
            'Gedung Pakuan, Jl. Otto Iskandardinata Bandung',
        ];
    }
}
