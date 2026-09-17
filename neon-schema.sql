-- WoroTani Database Schema for Neon (PostgreSQL)
-- Run this against your Neon database to set up the schema and seed data

-- Create enums
CREATE TYPE user_role AS ENUM ('FARMER', 'OFFICER', 'ADMIN');
CREATE TYPE severity_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE report_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- Create tables
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    region_name VARCHAR(120) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    phone VARCHAR(30),
    role user_role NOT NULL DEFAULT 'FARMER',
    region_id INTEGER REFERENCES regions(id)
);

CREATE TABLE pests (
    id SERIAL PRIMARY KEY,
    pest_name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    treatment_guide TEXT NOT NULL,
    image_guide_url TEXT,
    severity_level severity_level NOT NULL DEFAULT 'MEDIUM'
);

CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    pest_id INTEGER NOT NULL REFERENCES pests(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    photo_url TEXT,
    additional_note TEXT,
    status report_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_pest_id ON reports(pest_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_users_region_id ON users(region_id);
CREATE INDEX idx_users_role ON users(role);

-- Seed data (idempotent: only inserts if tables are empty)
-- Regions
INSERT INTO regions (region_name) VALUES
    ('Kec. Godean, Sleman'),
    ('Kec. Mlati, Sleman'),
    ('Kec. Ngaglik, Sleman'),
    ('Kec. Kalasan, Sleman'),
    ('Kec. Berbah, Sleman'),
    ('Kec. Moyudan, Sleman')
ON CONFLICT DO NOTHING;

-- Users (password is 'demo123' for all demo accounts)
INSERT INTO users (name, email, password, phone, role, region_id) VALUES
    ('Pak Slamet Riyadi', 'slamet@worotani.id', 'demo123', '081234567801', 'FARMER', 1),
    ('Bu Sri Wahyuni', 'sri@worotani.id', 'demo123', '081234567802', 'FARMER', 1),
    ('Pak Joko Santoso', 'joko@worotani.id', 'demo123', '081234567803', 'FARMER', 2),
    ('Bu Endang Lestari', 'endang@worotani.id', 'demo123', '081234567804', 'FARMER', 3),
    ('Pak Wahyu Nugroho', 'wahyu@worotani.id', 'demo123', '081234567805', 'FARMER', 4),
    ('Pak Bambang Sutrisno', 'bambang@worotani.id', 'demo123', '081234567806', 'FARMER', 5),
    ('Ibu Ratna Dewi (PPL)', 'ratna@worotani.id', 'demo123', '081234567807', 'OFFICER', 2),
    ('Admin WoroTani', 'admin@worotani.id', 'demo123', '081234567808', 'ADMIN', 2)
ON CONFLICT (email) DO NOTHING;

-- Pests
INSERT INTO pests (pest_name, description, symptoms, treatment_guide, image_guide_url, severity_level) VALUES
    (
        'Wereng Batang Coklat',
        'Wereng batang coklat (Nilaparvata lugens) adalah hama penghisap cairan tanaman padi yang paling merusak di Indonesia. Serangan berat menyebabkan tanaman mengering seperti terbakar (hopperburn) dan dapat menularkan virus kerdil rumput serta kerdil hampa.',
        'Tanaman menguning lalu mengering seperti terbakar mulai dari petak kecil yang meluas melingkar; banyak wereng kecil berwarna coklat di pangkal batang; embun madu memicu tumbuhnya cendawan jelaga hitam.',
        '1. Amati pangkal rumpun setiap minggu, ambang kendali 10 ekor/rumpun.
2. Gunakan varietas tahan seperti Inpari 33 atau Inpari 13.
3. Jangan menyemprot insektisida berspektrum luas agar musuh alami (laba-laba, kepik mirid) tetap hidup.
4. Bila melewati ambang, gunakan insektisida berbahan aktif buprofezin atau pymetrozine sesuai dosis anjuran.
5. Lakukan pengeringan berselang (intermittent) pada petakan sawah.',
        '/images/pests/wereng.jpg',
        'HIGH'
    ),
    (
        'Penggerek Batang Padi',
        'Penggerek batang padi (Scirpophaga incertulas) merupakan larva ngengat yang menggerek bagian dalam batang padi, memutus aliran hara sehingga anakan mati (sundep) atau malai hampa (beluk).',
        'Fase vegetatif: pucuk anakan layu, menguning, mudah dicabut (sundep). Fase generatif: malai putih berdiri tegak dan hampa (beluk). Terdapat kelompok telur tertutup rambut coklat di ujung daun.',
        '1. Tanam serempak dalam satu hamparan dengan selisih waktu maksimal 2 minggu.
2. Kumpulkan dan musnahkan kelompok telur saat pesemaian.
3. Pasang lampu perangkap untuk memantau ngengat.
4. Lepaskan parasitoid Trichogramma japonicum bila tersedia.
5. Aplikasi insektisida karbofuran/klorantraniliprol hanya jika intensitas sundep > 6% atau beluk > 10%.',
        '/images/pests/penggerek-batang.jpg',
        'HIGH'
    ),
    (
        'Tikus Sawah',
        'Tikus sawah (Rattus argentiventer) menyerang padi pada semua fase pertumbuhan, dari pesemaian hingga penyimpanan. Kerusakan terbesar terjadi saat fase generatif karena tikus memotong batang untuk memakan bulir.',
        'Batang padi terpotong miring seperti disabit terutama di tengah petakan; ada lubang aktif dan jalur jalan tikus di pematang; kerusakan berbentuk lingkaran dari tengah petak.',
        '1. Lakukan gropyokan massal (pembongkaran lubang) bersama kelompok tani sebelum tanam.
2. Pasang TBS (Trap Barrier System) dengan tanaman perangkap 3 minggu lebih awal.
3. Gunakan burung hantu Tyto alba dengan memasang rubuha (rumah burung hantu).
4. Emposan belerang pada lubang aktif.
5. Hindari umpan racun saat padi bunting agar tikus tidak jera umpan.',
        '/images/pests/tikus-sawah.jpg',
        'HIGH'
    ),
    (
        'Walang Sangit',
        'Walang sangit (Leptocorisa oratorius) menghisap bulir padi pada fase masak susu sehingga gabah menjadi hampa atau berkualitas rendah. Serangga ini mengeluarkan bau khas sebagai pertahanan diri.',
        'Bulir padi hampa atau berbintik coklat kehitaman (beras pecah/kapur); banyak serangga ramping coklat kehijauan hinggap di malai pagi dan sore hari; tercium bau sangit di area sawah.',
        '1. Kendalikan gulma di sekitar sawah yang menjadi inang alternatif.
2. Tanam serempak agar fase masak susu tidak bergiliran.
3. Pasang umpan bangkai kepiting/keong busuk di pinggir petak untuk menjebak.
4. Semprot insektisida BPMC atau MIPC saat pagi/sore hanya jika ditemukan > 6 ekor per 9 rumpun.
5. Lakukan penyemprotan mulai dari pinggir petak menuju tengah.',
        '/images/pests/walang-sangit.jpg',
        'MEDIUM'
    ),
    (
        'Ulat Grayak',
        'Ulat grayak (Spodoptera frugiperda / litura) adalah larva ngengat yang sangat rakus, menyerang jagung, padi gogo, dan sayuran. Serangan berat dapat menghabiskan daun dalam semalam karena aktif makan pada malam hari.',
        'Daun berlubang-lubang tidak beraturan hingga tersisa tulang daun; pada jagung ditemukan bekas gerekan di pucuk dengan kotoran seperti serbuk gergaji; larva bergerombol saat masih muda.',
        '1. Pantau lahan sejak tanaman muda, cari kelompok telur di balik daun dan musnahkan.
2. Manfaatkan musuh alami: parasitoid Telenomus dan patogen Metarhizium.
3. Aplikasi insektisida biologis Bacillus thuringiensis saat larva masih kecil.
4. Bila serangan berat, gunakan insektisida emamektin benzoat atau spinetoram pada sore hari langsung ke pucuk tanaman.
5. Rotasi tanaman dengan non-inang untuk memutus siklus hidup.',
        '/images/pests/ulat-grayak.jpg',
        'MEDIUM'
    ),
    (
        'Keong Mas',
        'Keong mas (Pomacea canaliculata) memakan bibit padi muda yang baru ditanam hingga umur ± 30 hari. Telurnya berwarna merah muda mencolok menempel pada batang padi, pematang, atau ajir.',
        'Bibit padi hilang atau terpotong pada bagian pangkal di petak yang tergenang; ditemukan keong berukuran besar dan kelompok telur merah muda; air keruh bekas aktivitas keong.',
        '1. Ambil keong dan telurnya secara manual setiap pagi (bisa dimanfaatkan untuk pakan ternak).
2. Pasang ajir/tongkat sebagai tempat bertelur agar mudah dimusnahkan.
3. Buat caren (parit kecil) untuk memusatkan keong lalu ambil.
4. Keringkan petakan saat tanaman muda, keong tidak aktif tanpa genangan.
5. Tebar daun pepaya/talas sebagai umpan perangkap alami.',
        '/images/pests/keong-mas.jpg',
        'LOW'
    )
ON CONFLICT DO NOTHING;

-- Reports (sample verified reports)
INSERT INTO reports (user_id, pest_id, latitude, longitude, photo_url, additional_note, status, created_at) VALUES
    (1, 1, -7.7689, 110.2919, NULL, 'Rumpun mulai menguning melingkar di tengah petak, wereng banyak di pangkal batang.', 'VERIFIED', NOW() - INTERVAL '2 days'),
    (2, 1, -7.7712, 110.3005, NULL, 'Serangan meluas dari petak sebelah, sudah seperti terbakar.', 'VERIFIED', NOW() - INTERVAL '1 day'),
    (3, 3, -7.7203, 110.3567, NULL, 'Batang terpotong miring, banyak lubang tikus di pematang utara.', 'VERIFIED', NOW() - INTERVAL '3 days'),
    (4, 5, -7.6890, 110.4008, NULL, 'Daun jagung habis berlubang, larva bergerombol.', 'VERIFIED', NOW() - INTERVAL '5 days'),
    (5, 4, -7.7601, 110.4712, NULL, 'Bau sangit menyengat sore hari, malai mulai hampa.', 'VERIFIED', NOW() - INTERVAL '4 days'),
    (6, 6, -7.8102, 110.4405, NULL, 'Telur merah muda banyak di ajir, bibit umur 2 minggu hilang.', 'VERIFIED', NOW() - INTERVAL '6 days'),
    (1, 2, -7.7655, 110.2870, NULL, 'Beberapa anakan sundep, mudah dicabut.', 'VERIFIED', NOW() - INTERVAL '10 days'),
    (3, 1, -7.7250, 110.3620, NULL, 'Baru menemukan puluhan wereng per rumpun.', 'PENDING', NOW() - INTERVAL '3 hours'),
    (4, 3, -7.6920, 110.4100, NULL, 'Jejak tikus baru di pematang, belum ada potongan batang.', 'PENDING', NOW() - INTERVAL '6 hours'),
    (5, 5, -7.7580, 110.4650, NULL, 'Ada bekas gerekan di pucuk jagung muda.', 'PENDING', NOW() - INTERVAL '1 day'),
    (2, 6, -7.7730, 110.2950, NULL, 'Keong ukuran kecil mulai muncul setelah hujan.', 'REJECTED', NOW() - INTERVAL '8 days'),
    (6, 4, -7.8055, 110.4380, NULL, 'Walang sangit terlihat di rumput pematang.', 'VERIFIED', NOW() - INTERVAL '35 days'),
    (1, 1, -7.7700, 110.2900, NULL, 'Serangan musim lalu, arsip.', 'VERIFIED', NOW() - INTERVAL '65 days'),
    (3, 2, -7.7215, 110.3540, NULL, 'Beluk mulai terlihat di petak timur.', 'VERIFIED', NOW() - INTERVAL '95 days'),
    (5, 3, -7.7590, 110.4700, NULL, 'Gropyokan menemukan 40 ekor tikus.', 'VERIFIED', NOW() - INTERVAL '70 days')
ON CONFLICT DO NOTHING;

-- Notifications (sample notifications)
INSERT INTO notifications (user_id, message, is_read, created_at) VALUES
    (1, '⚠️ WASPADA: Serangan Wereng Batang Coklat (tingkat Berbahaya) terkonfirmasi di Kec. Godean, Sleman. Segera cek lahan & baca panduan penanganan di Wiki Hama.', FALSE, NOW() - INTERVAL '1 day'),
    (2, '⚠️ WASPADA: Serangan Wereng Batang Coklat (tingkat Berbahaya) terkonfirmasi di Kec. Godean, Sleman. Segera cek lahan & baca panduan penanganan di Wiki Hama.', FALSE, NOW() - INTERVAL '1 day'),
    (1, 'Laporan Anda #1 (Wereng Batang Coklat) telah DIVERIFIKASI. Terima kasih sudah saling menjaga!', TRUE, NOW() - INTERVAL '2 days'),
    (3, 'Laporan Anda #3 (Tikus Sawah) telah DIVERIFIKASI. Terima kasih sudah saling menjaga!', TRUE, NOW() - INTERVAL '3 days'),
    (7, 'Laporan baru #8 (Wereng Batang Coklat) menunggu verifikasi.', FALSE, NOW() - INTERVAL '3 hours'),
    (8, 'Laporan baru #8 (Wereng Batang Coklat) menunggu verifikasi.', FALSE, NOW() - INTERVAL '3 hours'),
    (4, '📢 SIARAN PETUGAS [Kec. Kalasan, Sleman]: Musim hujan tiba, tingkatkan pengamatan ulat grayak pada jagung muda minggu ini.', FALSE, NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;