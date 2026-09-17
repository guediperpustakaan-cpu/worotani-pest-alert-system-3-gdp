-- WoroTani seed data (idempotent: hanya mengisi jika tabel kosong)
DO $$
BEGIN
  IF (SELECT count(*) FROM regions) = 0 THEN
    INSERT INTO regions (region_name) VALUES
      ('Kec. Godean, Sleman'),
      ('Kec. Mlati, Sleman'),
      ('Kec. Ngaglik, Sleman'),
      ('Kec. Kalasan, Sleman'),
      ('Kec. Berbah, Sleman'),
      ('Kec. Moyudan, Sleman');
  END IF;

  IF (SELECT count(*) FROM users) = 0 THEN
    INSERT INTO users (name, email, password, phone, role, region_id) VALUES
      ('Pak Slamet Riyadi', 'slamet@worotani.id', 'demo123', '081234567801', 'FARMER', 1),
      ('Bu Sri Wahyuni', 'sri@worotani.id', 'demo123', '081234567802', 'FARMER', 1),
      ('Pak Joko Santoso', 'joko@worotani.id', 'demo123', '081234567803', 'FARMER', 2),
      ('Bu Endang Lestari', 'endang@worotani.id', 'demo123', '081234567804', 'FARMER', 3),
      ('Pak Wahyu Nugroho', 'wahyu@worotani.id', 'demo123', '081234567805', 'FARMER', 4),
      ('Pak Bambang Sutrisno', 'bambang@worotani.id', 'demo123', '081234567806', 'FARMER', 5),
      ('Ibu Ratna Dewi (PPL)', 'ratna@worotani.id', 'demo123', '081234567807', 'OFFICER', 2),
      ('Admin WoroTani', 'admin@worotani.id', 'demo123', '081234567808', 'ADMIN', 2);
  END IF;

  IF (SELECT count(*) FROM pests) = 0 THEN
    INSERT INTO pests (pest_name, description, symptoms, treatment_guide, image_guide_url, severity_level) VALUES
      (
        'Wereng Batang Coklat',
        'Wereng batang coklat (Nilaparvata lugens) adalah hama penghisap cairan tanaman padi yang paling merusak di Indonesia. Serangan berat menyebabkan tanaman mengering seperti terbakar (hopperburn) dan dapat menularkan virus kerdil rumput serta kerdil hampa.',
        'Tanaman menguning lalu mengering seperti terbakar mulai dari petak kecil yang meluas melingkar; banyak wereng kecil berwarna coklat di pangkal batang; embun madu memicu tumbuhnya cendawan jelaga hitam.',
        '1. Amati pangkal rumpun setiap minggu, ambang kendali 10 ekor/rumpun.\n2. Gunakan varietas tahan seperti Inpari 33 atau Inpari 13.\n3. Jangan menyemprot insektisida berspektrum luas agar musuh alami (laba-laba, kepik mirid) tetap hidup.\n4. Bila melewati ambang, gunakan insektisida berbahan aktif buprofezin atau pymetrozine sesuai dosis anjuran.\n5. Lakukan pengeringan berselang (intermittent) pada petakan sawah.',
        '/images/pests/wereng.jpg',
        'HIGH'
      ),
      (
        'Penggerek Batang Padi',
        'Penggerek batang padi (Scirpophaga incertulas) merupakan larva ngengat yang menggerek bagian dalam batang padi, memutus aliran hara sehingga anakan mati (sundep) atau malai hampa (beluk).',
        'Fase vegetatif: pucuk anakan layu, menguning, mudah dicabut (sundep). Fase generatif: malai putih berdiri tegak dan hampa (beluk). Terdapat kelompok telur tertutup rambut coklat di ujung daun.',
        '1. Tanam serempak dalam satu hamparan dengan selisih waktu maksimal 2 minggu.\n2. Kumpulkan dan musnahkan kelompok telur saat pesemaian.\n3. Pasang lampu perangkap untuk memantau ngengat.\n4. Lepaskan parasitoid Trichogramma japonicum bila tersedia.\n5. Aplikasi insektisida karbofuran/klorantraniliprol hanya jika intensitas sundep > 6% atau beluk > 10%.',
        '/images/pests/penggerek-batang.jpg',
        'HIGH'
      ),
      (
        'Tikus Sawah',
        'Tikus sawah (Rattus argentiventer) menyerang padi pada semua fase pertumbuhan, dari pesemaian hingga penyimpanan. Kerusakan terbesar terjadi saat fase generatif karena tikus memotong batang untuk memakan bulir.',
        'Batang padi terpotong miring seperti disabit terutama di tengah petakan; ada lubang aktif dan jalur jalan tikus di pematang; kerusakan berbentuk lingkaran dari tengah petak.',
        '1. Lakukan gropyokan massal (pembongkaran lubang) bersama kelompok tani sebelum tanam.\n2. Pasang TBS (Trap Barrier System) dengan tanaman perangkap 3 minggu lebih awal.\n3. Gunakan burung hantu Tyto alba dengan memasang rubuha (rumah burung hantu).\n4. Emposan belerang pada lubang aktif.\n5. Hindari umpan racun saat padi bunting agar tikus tidak jera umpan.',
        '/images/pests/tikus-sawah.jpg',
        'HIGH'
      ),
      (
        'Walang Sangit',
        'Walang sangit (Leptocorisa oratorius) menghisap bulir padi pada fase masak susu sehingga gabah menjadi hampa atau berkualitas rendah. Serangga ini mengeluarkan bau khas sebagai pertahanan diri.',
        'Bulir padi hampa atau berbintik coklat kehitaman (beras pecah/kapur); banyak serangga ramping coklat kehijauan hinggap di malai pagi dan sore hari; tercium bau sangit di area sawah.',
        '1. Kendalikan gulma di sekitar sawah yang menjadi inang alternatif.\n2. Tanam serempak agar fase masak susu tidak bergiliran.\n3. Pasang umpan bangkai kepiting/keong busuk di pinggir petak untuk menjebak.\n4. Semprot insektisida BPMC atau MIPC saat pagi/sore hanya jika ditemukan > 6 ekor per 9 rumpun.\n5. Lakukan penyemprotan mulai dari pinggir petak menuju tengah.',
        '/images/pests/walang-sangit.jpg',
        'MEDIUM'
      ),
      (
        'Ulat Grayak',
        'Ulat grayak (Spodoptera frugiperda / litura) adalah larva ngengat yang sangat rakus, menyerang jagung, padi gogo, dan sayuran. Serangan berat dapat menghabiskan daun dalam semalam karena aktif makan pada malam hari.',
        'Daun berlubang-lubang tidak beraturan hingga tersisa tulang daun; pada jagung ditemukan bekas gerekan di pucuk dengan kotoran seperti serbuk gergaji; larva bergerombol saat masih muda.',
        '1. Pantau lahan sejak tanaman muda, cari kelompok telur di balik daun dan musnahkan.\n2. Manfaatkan musuh alami: parasitoid Telenomus dan patogen Metarhizium.\n3. Aplikasi insektisida biologis Bacillus thuringiensis saat larva masih kecil.\n4. Bila serangan berat, gunakan insektisida emamektin benzoat atau spinetoram pada sore hari langsung ke pucuk tanaman.\n5. Rotasi tanaman dengan non-inang untuk memutus siklus hidup.',
        '/images/pests/ulat-grayak.jpg',
        'MEDIUM'
      ),
      (
        'Keong Mas',
        'Keong mas (Pomacea canaliculata) memakan bibit padi muda yang baru ditanam hingga umur ± 30 hari. Telurnya berwarna merah muda mencolok menempel pada batang padi, pematang, atau ajir.',
        'Bibit padi hilang atau terpotong pada bagian pangkal di petak yang tergenang; ditemukan keong berukuran besar dan kelompok telur merah muda; air keruh bekas aktivitas keong.',
        '1. Ambil keong dan telurnya secara manual setiap pagi (bisa dimanfaatkan untuk pakan ternak).\n2. Pasang ajir/tongkat sebagai tempat bertelur agar mudah dimusnahkan.\n3. Buat caren (parit kecil) untuk memusatkan keong lalu ambil.\n4. Keringkan petakan saat tanaman muda, keong tidak aktif tanpa genangan.\n5. Tebar daun pepaya/talas sebagai umpan perangkap alami.',
        '/images/pests/keong-mas.jpg',
        'LOW'
      );
  END IF;

  IF (SELECT count(*) FROM reports) = 0 THEN
    INSERT INTO reports (user_id, pest_id, latitude, longitude, photo_url, additional_note, status, created_at) VALUES
      (1, 1, -7.7689, 110.2919, NULL, 'Rumpun mulai menguning melingkar di tengah petak, wereng banyak di pangkal batang.', 'VERIFIED', now() - interval '2 days'),
      (2, 1, -7.7712, 110.3005, NULL, 'Serangan meluas dari petak sebelah, sudah seperti terbakar.', 'VERIFIED', now() - interval '1 day'),
      (3, 3, -7.7203, 110.3567, NULL, 'Batang terpotong miring, banyak lubang tikus di pematang utara.', 'VERIFIED', now() - interval '3 days'),
      (4, 5, -7.6890, 110.4008, NULL, 'Daun jagung habis berlubang, larva bergerombol.', 'VERIFIED', now() - interval '5 days'),
      (5, 4, -7.7601, 110.4712, NULL, 'Bau sangit menyengat sore hari, malai mulai hampa.', 'VERIFIED', now() - interval '4 days'),
      (6, 6, -7.8102, 110.4405, NULL, 'Telur merah muda banyak di ajir, bibit umur 2 minggu hilang.', 'VERIFIED', now() - interval '6 days'),
      (1, 2, -7.7655, 110.2870, NULL, 'Beberapa anakan sundep, mudah dicabut.', 'VERIFIED', now() - interval '10 days'),
      (3, 1, -7.7250, 110.3620, NULL, 'Baru menemukan puluhan wereng per rumpun.', 'PENDING', now() - interval '3 hours'),
      (4, 3, -7.6920, 110.4100, NULL, 'Jejak tikus baru di pematang, belum ada potongan batang.', 'PENDING', now() - interval '6 hours'),
      (5, 5, -7.7580, 110.4650, NULL, 'Ada bekas gerekan di pucuk jagung muda.', 'PENDING', now() - interval '1 day'),
      (2, 6, -7.7730, 110.2950, NULL, 'Keong ukuran kecil mulai muncul setelah hujan.', 'REJECTED', now() - interval '8 days'),
      (6, 4, -7.8055, 110.4380, NULL, 'Walang sangit terlihat di rumput pematang.', 'VERIFIED', now() - interval '35 days'),
      (1, 1, -7.7700, 110.2900, NULL, 'Serangan musim lalu, arsip.', 'VERIFIED', now() - interval '65 days'),
      (3, 2, -7.7215, 110.3540, NULL, 'Beluk mulai terlihat di petak timur.', 'VERIFIED', now() - interval '95 days'),
      (5, 3, -7.7590, 110.4700, NULL, 'Gropyokan menemukan 40 ekor tikus.', 'VERIFIED', now() - interval '70 days');
  END IF;

  IF (SELECT count(*) FROM notifications) = 0 THEN
    INSERT INTO notifications (user_id, message, is_read, created_at) VALUES
      (1, '⚠️ WASPADA: Serangan Wereng Batang Coklat (tingkat Berbahaya) terkonfirmasi di Kec. Godean, Sleman. Segera cek lahan & baca panduan penanganan di Wiki Hama.', false, now() - interval '1 day'),
      (2, '⚠️ WASPADA: Serangan Wereng Batang Coklat (tingkat Berbahaya) terkonfirmasi di Kec. Godean, Sleman. Segera cek lahan & baca panduan penanganan di Wiki Hama.', false, now() - interval '1 day'),
      (1, 'Laporan Anda #1 (Wereng Batang Coklat) telah DIVERIFIKASI. Terima kasih sudah saling menjaga!', true, now() - interval '2 days'),
      (3, 'Laporan Anda #3 (Tikus Sawah) telah DIVERIFIKASI. Terima kasih sudah saling menjaga!', true, now() - interval '3 days'),
      (7, 'Laporan baru #8 (Wereng Batang Coklat) menunggu verifikasi.', false, now() - interval '3 hours'),
      (8, 'Laporan baru #8 (Wereng Batang Coklat) menunggu verifikasi.', false, now() - interval '3 hours'),
      (4, '📢 SIARAN PETUGAS [Kec. Kalasan, Sleman]: Musim hujan tiba, tingkatkan pengamatan ulat grayak pada jagung muda minggu ini.', false, now() - interval '12 hours');
  END IF;
END $$;
