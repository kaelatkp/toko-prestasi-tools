/* ════════════════════════════════════
   APP-FOTO.JS — Modul Editing Foto
   Requires: app-core.js dimuat lebih dulu
════════════════════════════════════ */
const APP_VERSION = '2.0';

// Mapping modul → grup sidebar (untuk auto-expand & header accent)
const MOD_GROUPS = {
  event_foto:  null,          // HOT — Foto Event/Momen
  pasfoto:     null,          // HOT #1
  background:  null,          // HOT #2
  headwear:    'penampilan',
  outfit:      'penampilan',
  rambut:      'penampilan',
  aksesori:    'penampilan',
  tato:        'penampilan',
  enhance:     'kualitas',
  restore:     'kualitas',
  colorize:    'kualitas',
  retouch:     'kualitas',
  hapus_bg:    'seleksi',
  hapus_objek: 'seleksi',
  ganti_pose:  'seleksi',
  foto_profil:    'orang',
  foto_couple:    'orang',
  foto_keluarga:  'orang',
  foto_wisuda:    'orang',
  foto_produk:    'produk',
  listing_produk: 'produk',
  desain_banner:  'produk',
  label_stiker:   'produk',
  anime_kartun:   'kreatif',
  ilustrasi:      'kreatif',
  cosplay:        'kreatif',
  cyberpunk_portrait: 'dev',
  cyber_scene:        'dev',
};

/* ════════════════════════════════════
   EVENT CALENDAR ENGINE
════════════════════════════════════ */
const EVENT_CALENDAR = [
  // — Hijri —
  { id:'ramadan',    name:'Ramadan',            emoji:'🌙', type:'hijri',     hijri:{month:9,  day:1},  rangeBefore:0,  rangeAfter:29, accent:'#3b82f6' },
  { id:'lebaran',    name:'Idul Fitri',          emoji:'🕌', type:'hijri',     hijri:{month:10, day:1},  rangeBefore:7,  rangeAfter:3,  accent:'#10b981' },
  { id:'idul_adha',  name:'Idul Adha',           emoji:'🐄', type:'hijri',     hijri:{month:12, day:10}, rangeBefore:5,  rangeAfter:2,  accent:'#8b5cf6' },
  { id:'maulid',     name:'Maulid Nabi',         emoji:'✨', type:'hijri',     hijri:{month:3,  day:12}, rangeBefore:3,  rangeAfter:1,  accent:'#22c55e' },
  { id:'isra_miraj', name:'Isra Mi\'raj',        emoji:'🌠', type:'hijri',     hijri:{month:7,  day:27}, rangeBefore:2,  rangeAfter:1,  accent:'#818cf8' },
  // — Gregorian —
  { id:'tahun_baru', name:'Tahun Baru',          emoji:'🎆', type:'gregorian', date:{month:1,  day:1},  rangeBefore:1,  rangeAfter:1,  accent:'#f59e0b' },
  { id:'valentine',  name:'Valentine',           emoji:'❤️', type:'gregorian', date:{month:2,  day:14}, rangeBefore:3,  rangeAfter:1,  accent:'#f43f5e' },
  { id:'kartini',    name:'Hari Kartini',        emoji:'🌺', type:'gregorian', date:{month:4,  day:21}, rangeBefore:2,  rangeAfter:1,  accent:'#ec4899' },
  { id:'pendidikan', name:'Hardiknas',           emoji:'📚', type:'gregorian', date:{month:5,  day:2},  rangeBefore:1,  rangeAfter:1,  accent:'#0ea5e9' },
  { id:'anak',       name:'Hari Anak',           emoji:'🎈', type:'gregorian', date:{month:7,  day:23}, rangeBefore:1,  rangeAfter:1,  accent:'#f59e0b' },
  { id:'hut_ri',     name:'HUT RI',              emoji:'🇮🇩', type:'gregorian', date:{month:8,  day:17}, rangeBefore:5,  rangeAfter:2,  accent:'#ef4444' },
  { id:'batik',      name:'Hari Batik Nasional', emoji:'🎨', type:'gregorian', date:{month:10, day:2},  rangeBefore:2,  rangeAfter:1,  accent:'#92400e' },
  { id:'sumpah',     name:'Sumpah Pemuda',       emoji:'🤝', type:'gregorian', date:{month:10, day:28}, rangeBefore:1,  rangeAfter:1,  accent:'#f59e0b' },
  { id:'halloween',  name:'Halloween',           emoji:'🎃', type:'gregorian', date:{month:10, day:31}, rangeBefore:5,  rangeAfter:1,  accent:'#f97316' },
  { id:'pahlawan',   name:'Hari Pahlawan',       emoji:'⚔️', type:'gregorian', date:{month:11, day:10}, rangeBefore:2,  rangeAfter:1,  accent:'#d97706' },
  { id:'guru',       name:'Hari Guru',           emoji:'🏫', type:'gregorian', date:{month:11, day:25}, rangeBefore:1,  rangeAfter:1,  accent:'#60a5fa' },
  { id:'ibu',        name:'Hari Ibu',            emoji:'💐', type:'gregorian', date:{month:12, day:22}, rangeBefore:2,  rangeAfter:1,  accent:'#fb7185' },
  { id:'natal',      name:'Natal',               emoji:'🎄', type:'gregorian', date:{month:12, day:25}, rangeBefore:5,  rangeAfter:2,  accent:'#4ade80' },
  // — Lookup (kalender kompleks) —
  { id:'imlek',      name:'Imlek',               emoji:'🧧', type:'lookup', lookup:{'2025':'01-29','2026':'02-17','2027':'02-06','2028':'01-26','2029':'02-13','2030':'02-03'}, rangeBefore:5, rangeAfter:3, accent:'#ef4444' },
  { id:'nyepi',      name:'Nyepi',               emoji:'🕯️', type:'lookup', lookup:{'2025':'03-29','2026':'03-19','2027':'03-08','2028':'03-26','2029':'03-16','2030':'03-05'}, rangeBefore:1, rangeAfter:1, accent:'#78716c' },
  { id:'waisak',     name:'Waisak',              emoji:'🪷', type:'lookup', lookup:{'2025':'05-12','2026':'05-01','2027':'05-21','2028':'05-09','2029':'05-28','2030':'05-17'}, rangeBefore:2, rangeAfter:1, accent:'#f0abfc' },
];

function toHijri(date) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  const jd = Math.floor((1461*(y+4800+Math.floor((m-14)/12)))/4)
    + Math.floor((367*(m-2-12*Math.floor((m-14)/12)))/12)
    - Math.floor((3*Math.floor((y+4900+Math.floor((m-14)/12))/100))/4)
    + d - 32075;
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l-1)/10631);
  l = l - 10631*n + 354;
  const j = Math.floor((10985-l)/5316)*Math.floor((50*l)/17719)
    + Math.floor(l/5670)*Math.floor((43*l)/15238);
  l = l - Math.floor((30-j)/15)*Math.floor((17719*j)/50)
    - Math.floor(j/16)*Math.floor((15238*j)/43) + 29;
  const hm = Math.floor((24*l)/709);
  return { year:30*n+j-30, month:hm, day:l-Math.floor((709*hm)/24) };
}

function isEventActive(ev, today) {
  if (ev.type === 'gregorian') {
    const y = today.getFullYear();
    return today >= new Date(y, ev.date.month-1, ev.date.day - ev.rangeBefore)
        && today <= new Date(y, ev.date.month-1, ev.date.day + ev.rangeAfter);
  }
  if (ev.type === 'lookup') {
    const key = String(today.getFullYear());
    if (!ev.lookup[key]) return false;
    const [mo, da] = ev.lookup[key].split('-').map(Number);
    const base = new Date(today.getFullYear(), mo-1, da);
    return today >= new Date(base.getTime() - ev.rangeBefore*86400000)
        && today <= new Date(base.getTime() + ev.rangeAfter*86400000);
  }
  if (ev.type === 'hijri') {
    const h = toHijri(today);
    if (ev.id === 'ramadan') return h.month === 9;
    const evDay  = (ev.hijri.month-1)*30 + ev.hijri.day;
    const todDay = (h.month-1)*30 + h.day;
    let diff = todDay - evDay;
    if (diff < -177) diff += 354;
    if (diff >  177) diff -= 354;
    return diff >= -ev.rangeBefore && diff <= ev.rangeAfter;
  }
  return false;
}

function getNextEventDate(ev) {
  const today = new Date(); today.setHours(0,0,0,0);
  const y = today.getFullYear();
  if (ev.type === 'gregorian') {
    let d = new Date(y, ev.date.month-1, ev.date.day);
    if (today > new Date(y, ev.date.month-1, ev.date.day + ev.rangeAfter)) d = new Date(y+1, ev.date.month-1, ev.date.day);
    return d;
  }
  if (ev.type === 'lookup') {
    for (let yr = y; yr <= y+2; yr++) {
      const key = String(yr);
      if (!ev.lookup[key]) continue;
      const [mo, da] = ev.lookup[key].split('-').map(Number);
      const d = new Date(yr, mo-1, da);
      if (d >= today) return d;
    }
    return null;
  }
  if (ev.type === 'hijri') {
    const targetDay = ev.id === 'ramadan' ? { month:9, day:1 } : ev.hijri;
    for (let i = 0; i <= 400; i++) {
      const d = new Date(today.getTime() + i*86400000);
      const h = toHijri(d);
      if (h.month === targetDay.month && h.day === targetDay.day) return d;
    }
  }
  return null;
}

function getAllTickerItems() {
  const today = new Date(); today.setHours(0,0,0,0);
  const active = [], upcoming = [];
  for (const ev of EVENT_CALENDAR) {
    if (isEventActive(ev, today)) {
      active.push({ ev, active: true });
    } else {
      const next = getNextEventDate(ev);
      if (next) upcoming.push({ ev, active: false, next, days: Math.round((next-today)/86400000) });
    }
  }
  upcoming.sort((a, b) => a.days - b.days);
  return [...active, ...upcoming.slice(0, 3)];
}

/* ════════════════════════════════════
   STATE
════════════════════════════════════ */
let currentMod = null;
let selectedColor = '#FF0000';
// generatedPrompt — didefinisikan di app-core.js

const BG_COLORS = [
  { hex: '#FF0000', name: 'Merah' },
  { hex: '#0000FF', name: 'Biru' },
  { hex: '#FFD700', name: 'Kuning' },
  { hex: '#FFFFFF', name: 'Putih' },
  { hex: '#808080', name: 'Abu-abu' },
  { hex: '#000080', name: 'Biru Navy' },
  { hex: '#2d5a27', name: 'Hijau Tua' },
];

const BG_PRESETS = {
  studio: {
    label: '🎞️ Studio',
    items: [
      { label: 'Studio Putih Bersih',    value: 'clean white studio background with soft even portrait lighting' },
      { label: 'Studio Abu-abu Lembut',  value: 'soft light gray studio backdrop, professional portrait lighting' },
      { label: 'Studio Hitam Elegan',    value: 'dark charcoal black studio background with dramatic lighting' },
      { label: 'Gradien Biru Bokeh',     value: 'soft bokeh blue gradient studio background, professional' },
      { label: 'Gradien Hangat Keemasan',value: 'warm golden hour gradient background, soft and elegant' },
    ],
  },
  alam: {
    label: '🌿 Alam',
    items: [
      { label: 'Pantai Tropis',          value: 'tropical beach with clear turquoise sea and blue sky, sunny day' },
      { label: 'Taman Kota',             value: 'city park with lush green trees and blooming flower garden' },
      { label: 'Hutan Pinus',            value: 'green pine forest with soft sunlight filtering through trees' },
      { label: 'Sawah Hijau',            value: 'lush green Indonesian rice field (sawah) landscape, sunny day' },
      { label: 'Pegunungan & Sunrise',   value: 'misty mountain landscape at golden hour sunrise' },
      { label: 'Air Terjun Tropis',      value: 'tropical waterfall surrounded by lush green jungle' },
      { label: 'Bunga Sakura',           value: 'cherry blossom trees in full bloom, soft pink petals' },
    ],
  },
  landmark_id: {
    label: '🏛️ Landmark Indonesia',
    items: [
      { label: 'Monas, Jakarta',             value: 'National Monument (Monas) Jakarta Indonesia, clear blue sky' },
      { label: 'Prambanan, Yogyakarta',      value: 'Prambanan Hindu temple complex, Yogyakarta, Indonesia, golden hour' },
      { label: 'Tanah Lot, Bali',            value: 'Tanah Lot sea temple at sunset, Bali, Indonesia' },
      { label: 'Raja Ampat, Papua',          value: 'Raja Ampat islands, crystal turquoise sea, West Papua, Indonesia' },
      { label: 'Jembatan Ampera, Palembang', value: 'Ampera Bridge over Musi River at dusk, Palembang, South Sumatra' },
      { label: 'Danau Toba, Sumatra Utara',  value: 'Lake Toba (Danau Toba) panorama, North Sumatra, Indonesia' },
      { label: 'Borobudur, Jawa Tengah',     value: 'Borobudur Buddhist temple, Magelang, Central Java, Indonesia' },
      { label: 'Pantai Losari, Makassar',    value: 'Losari Beach promenade, Makassar, South Sulawesi, Indonesia' },
    ],
  },
  landmark_dunia: {
    label: '🌍 Landmark Dunia',
    items: [
      { label: 'Menara Eiffel, Paris — Prancis',        value: 'Eiffel Tower, Paris, France, sunny day with blue sky' },
      { label: 'Big Ben, London — Inggris',             value: 'Big Ben and Houses of Parliament, London, England' },
      { label: 'Colosseum, Roma — Italia',              value: 'Colosseum, Rome, Italy, clear blue sky' },
      { label: 'Taj Mahal, Agra — India',               value: 'Taj Mahal, Agra, India, sunrise with reflecting pool' },
      { label: 'Tembok Besar, Beijing — China',         value: 'Great Wall of China, Badaling section, Beijing, China' },
      { label: 'Opera House, Sydney — Australia',       value: 'Sydney Opera House and Harbour Bridge, Sydney, Australia' },
      { label: 'Patung Liberty, New York — AS',         value: 'Statue of Liberty, New York Harbor, USA' },
      { label: 'Burj Khalifa, Dubai — UAE',             value: 'Burj Khalifa and Dubai Marina skyline at night, UAE' },
      { label: 'Santorini — Yunani',                    value: 'Santorini white-washed buildings with iconic blue domes, Greece' },
      { label: 'Gunung Fuji — Jepang',                  value: 'Mount Fuji with cherry blossoms foreground, Japan' },
      { label: 'Machu Picchu — Peru',                   value: 'Machu Picchu ancient Incan ruins, Cusco, Peru' },
      { label: 'Kota Tua Cartagena — Kolombia',         value: 'Colourful old town of Cartagena, Colombia, street view' },
    ],
  },
  ruangan: {
    label: '🏢 Dalam Ruangan',
    items: [
      { label: 'Perpustakaan Modern',  value: 'modern library with tall bookshelves and warm ambient lighting' },
      { label: 'Kantor Modern',        value: 'modern open-plan office with glass walls, clean and minimalist' },
      { label: 'Cafe Cozy',            value: 'cozy cafe interior with wooden furniture and warm yellow lighting' },
      { label: 'Lobi Hotel Mewah',     value: 'elegant luxury hotel lobby with high ceiling and chandeliers' },
      { label: 'Ruang Keluarga Modern',value: 'minimalist modern living room with large windows and natural light' },
      { label: 'Aula Universitas',     value: 'university lecture hall or auditorium, academic atmosphere' },
    ],
  },
};

// Background terbatas untuk Foto Dokumen Umum (KTP, SIM, lamaran, beasiswa, dll)
const BG_DOKUMEN = [
  { hex: '#FF0000', name: 'Merah' },
  { hex: '#0000FF', name: 'Biru' },
  { hex: '#FFD700', name: 'Kuning' },
];

// Background wisuda — bervariasi per kampus, ini yang paling umum dipakai
const BG_WISUDA = [
  { hex: '#FF0000', name: 'Merah' },
  { hex: '#800000', name: 'Merah Tua / Maroon' },
  { hex: '#003366', name: 'Biru Tua' },
  { hex: '#0000FF', name: 'Biru' },
  { hex: '#808080', name: 'Abu-abu' },
  { hex: '#2d5a27', name: 'Hijau Tua' },
  { hex: '#FFFFFF', name: 'Putih' },
];

// PLATFORM_URLS — didefinisikan di app-core.js

const SERAGAM_OPTIONS = {
  sd:      { label: 'SD — Putih Merah',       search: 'seragam SD putih merah',       prompt: 'SD uniform: white shirt with red shorts/skirt, red-white school badge, complete with school attributes' },
  smp:     { label: 'SMP — Putih Biru',        search: 'seragam SMP putih biru',       prompt: 'SMP uniform: white shirt with dark blue pants/skirt, complete with school attributes and tie' },
  sma:     { label: 'SMA / SMK — Putih Abu',   search: 'seragam SMA putih abu',        prompt: 'SMA/SMK uniform: white shirt with gray pants/skirt, complete with school attributes and tie' },
  pramuka: { label: 'Pramuka — Coklat',        search: 'seragam pramuka lengkap',      prompt: 'Pramuka scout uniform: brown khaki shirt and pants/skirt with full scout attributes, neckerchief, and badges' },
  batik:   { label: 'Batik Sekolah',           search: 'batik sekolah formal',         prompt: 'formal school batik uniform (batik sekolah), neat and formal' },
  osis:    { label: 'OSIS',                    search: 'seragam OSIS putih biru',      prompt: 'OSIS uniform: white shirt with dark blue pants/skirt, OSIS badge prominently displayed' },
};

const DINAS_OPTIONS = {
  polri:   { label: 'Polisi — POLRI',              search: 'seragam polisi POLRI dinas harian foto resmi' },
  tni_ad:  { label: 'TNI AD — Angkatan Darat',     search: 'seragam TNI Angkatan Darat dinas harian foto resmi' },
  tni_al:  { label: 'TNI AL — Angkatan Laut',      search: 'seragam TNI Angkatan Laut dinas harian foto resmi' },
  tni_au:  { label: 'TNI AU — Angkatan Udara',     search: 'seragam TNI Angkatan Udara dinas harian foto resmi' },
  brimob:  { label: 'Brimob',                      search: 'seragam Brimob Polri foto resmi' },
  satpam:  { label: 'Satpam / Security',            search: 'seragam satpam security formal foto resmi' },
};

const BAJU_DOKUMEN = {
  existing:          { label: 'Pakai baju yang sudah ada',          prompt_m: 'Keep and tidy the existing clothing — smooth wrinkles, straighten collar. DO NOT change or replace the outfit.',                                                        prompt_f: 'Keep and tidy the existing clothing — smooth wrinkles, straighten collar. DO NOT change or replace the outfit.' },
  kemeja_putih:      { label: 'Kemeja Putih Polos',                 prompt_m: 'plain white dress shirt, neatly buttoned, well-fitted',                                                                                                                      prompt_f: 'plain white blouse or dress shirt, neatly fitted' },
  kemeja_hitam:      { label: 'Kemeja Hitam Polos',                 prompt_m: 'plain black dress shirt, neatly buttoned, well-fitted',                                                                                                                      prompt_f: 'plain black blouse or dress shirt, neatly fitted' },
  kemeja_abu:        { label: 'Kemeja Abu-abu Polos',               prompt_m: 'plain light gray dress shirt, neatly buttoned',                                                                                                                             prompt_f: 'plain light gray blouse or dress shirt, neatly fitted' },
  kemeja_biru:       { label: 'Kemeja Biru Muda Polos',             prompt_m: 'plain light blue dress shirt, neatly buttoned',                                                                                                                             prompt_f: 'plain light blue blouse or dress shirt, neatly fitted' },
  kemeja_navy:       { label: 'Kemeja Navy Polos',                  prompt_m: 'plain navy blue dress shirt, neatly buttoned',                                                                                                                              prompt_f: 'plain navy blue blouse or dress shirt, neatly fitted' },
  kotak_merah:       { label: 'Kemeja Kotak-kotak Merah Putih',     prompt_m: 'red and white plaid checkered dress shirt, neatly buttoned',                                                                                                               prompt_f: 'red and white plaid checkered blouse, neatly fitted' },
  kotak_biru:        { label: 'Kemeja Kotak-kotak Biru Putih',      prompt_m: 'blue and white plaid checkered dress shirt, neatly buttoned',                                                                                                              prompt_f: 'blue and white plaid checkered blouse, neatly fitted' },
  kotak_hitam:       { label: 'Kemeja Kotak-kotak Hitam Putih',     prompt_m: 'black and white plaid checkered dress shirt, neatly buttoned',                                                                                                             prompt_f: 'black and white plaid checkered blouse, neatly fitted' },
  kotak_coklat:      { label: 'Kemeja Kotak-kotak Coklat',          prompt_m: 'brown and beige plaid checkered dress shirt, neatly buttoned',                                                                                                             prompt_f: 'brown and beige plaid checkered blouse, neatly fitted' },
  jas_hitam:         { label: 'Jas Hitam + Kemeja Putih',           prompt_m: 'black formal suit jacket with a white dress shirt underneath, properly worn and buttoned',                                                                                  prompt_f: 'black formal blazer with a white blouse underneath, properly worn' },
  jas_navy:          { label: 'Jas Navy + Kemeja Putih',            prompt_m: 'navy blue formal suit jacket with a white dress shirt underneath, properly worn and buttoned',                                                                              prompt_f: 'navy blue formal blazer with a white blouse underneath, properly worn' },
  jas_abu:           { label: 'Jas Abu-abu + Kemeja Putih',         prompt_m: 'charcoal gray formal suit jacket with a white dress shirt underneath, properly worn and buttoned',                                                                          prompt_f: 'charcoal gray formal blazer with a white blouse underneath, properly worn' },
  blazer_hitam:      { label: 'Blazer Hitam',                       prompt_m: 'black blazer over a neat collared shirt, smart-casual formal',                                                                                                             prompt_f: 'black blazer over a neat blouse, smart-casual formal' },
  batik_formal:      { label: 'Batik Formal',                       prompt_m: 'formal batik dress shirt (kemeja batik), neat and properly worn — traditional Indonesian formal attire',                                                                    prompt_f: 'formal batik blouse or dress (batik formal), neat and properly worn — traditional Indonesian formal attire' },
  seragam_tk:        { label: 'Seragam TK',                  seragam: true, search: 'seragam TK anak Indonesia',         prompt_m: 'Apply the school uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.', prompt_f: 'Apply the school uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.' },
  seragam_sd:        { label: 'Seragam SD — Putih Merah',    seragam: true, search: 'seragam SD putih merah Indonesia',  prompt_m: 'Apply the school uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.', prompt_f: 'Apply the school uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.' },
  seragam_smp:       { label: 'Seragam SMP — Putih Biru',    seragam: true, search: 'seragam SMP putih biru Indonesia',  prompt_m: 'Apply the school uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.', prompt_f: 'Apply the school uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.' },
  seragam_sma:       { label: 'Seragam SMA / SMK — Putih Abu', seragam: true, search: 'seragam SMA SMK putih abu Indonesia', prompt_m: 'Apply the school uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.', prompt_f: 'Apply the school uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.' },
  seragam_pramuka:   { label: 'Seragam Pramuka',              seragam: true, search: 'seragam pramuka lengkap Indonesia', prompt_m: 'Apply the scout uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.',  prompt_f: 'Apply the scout uniform EXACTLY as shown in the reference photo (Photo 2) — replicate uniform design, colors, and attributes precisely. DO NOT guess or invent the uniform.' },
  almamater_putih:   { label: 'Kemeja Putih + Jas Almamater',  prompt_m: 'white dress shirt with university almamater jacket neatly worn over it, collar visible',                                                                                         prompt_f: 'white blouse with university almamater jacket neatly worn over it, collar visible' },
  blus_almamater:    { label: 'Blus + Jas Almamater',          prompt_m: 'formal collared shirt with university almamater jacket neatly worn over it',                                                                                                         prompt_f: 'formal blouse with university almamater jacket neatly worn over it' },
  jas_dasi_pt:       { label: 'Jas Formal + Dasi',             prompt_m: 'formal suit jacket with a white dress shirt and tie underneath, properly worn and buttoned',                                                                                          prompt_f: 'formal blazer with a neat blouse underneath, properly worn' },
  kebaya_pt:         { label: 'Kebaya Formal',                  prompt_m: 'formal batik kemeja berkerah — neat formal attire',                                                                                                                                   prompt_f: 'formal kebaya, neatly worn, elegant appearance' },
  gamis_formal_pt:   { label: 'Busana Muslimah Formal',         prompt_m: 'neat formal collared attire',                                                                                                                                                         prompt_f: 'formal muslimah dress (busana muslimah formal), neat and professional appearance' },
};

const BAJU_DOKUMEN_CATS = {
  existing: { label: 'Pakai Baju yang Sudah Ada', single: true, value: 'existing' },
  kemeja:   { label: 'Kemeja Polos',       items: ['kemeja_putih','kemeja_hitam','kemeja_abu','kemeja_biru','kemeja_navy'] },
  kotak:    { label: 'Kemeja Kotak-kotak', items: ['kotak_merah','kotak_biru','kotak_hitam','kotak_coklat'] },
  formal:   { label: 'Formal',             items: ['jas_hitam','jas_navy','jas_abu','blazer_hitam','batik_formal'] },
  seragam:  { label: 'Seragam Sekolah',   items: ['seragam_tk','seragam_sd','seragam_smp','seragam_sma','seragam_pramuka'] },
};

const MOD_INFO = {
  ganti_pose:   { photos: '1 foto — orang yang akan diubah posenya', desc: 'Ubah pose dan komposisi foto — berdiri formal, half-body, close-up portrait. Wajah dijamin tidak berubah sedikitpun.' },
  anime_kartun: { photos: '1 foto — orang yang akan dikonversi ke gaya seni', desc: 'Konversi foto ke gaya anime, kartun, atau ilustrasi digital. Wajah tetap dikenali tapi sepenuhnya distilisasi.' },
  pasfoto:    { photos: '1 foto (umum) · 2 foto untuk Dinas TNI/Polri & Seragam Raport', desc: '12 tujuan foto dokumen resmi tersedia. Output: <strong>portrait 2:3</strong> (cocok untuk cetak 2×3, 3×4, 4×6) dengan frame putih 20% untuk crop watermark.<br><br>🟥 <strong>Merah</strong> — KTP (tahun lahir ganjil) · SKCK (wajib Polri) · CPNS · Raport SD–SMA (ganjil)<br>🟦 <strong>Biru</strong> — KTP (tahun lahir genap) · SIM · CPNS · Beasiswa · Raport SD–SMA (genap)<br>⬜ <strong>Putih</strong> — Paspor RI (wajib ICAO) · Visa Internasional<br>🟨 <strong>Kuning/Bebas</strong> — Dinas TNI · Polri · Satpam (sesuai instansi)<br>🎨 <strong>Bebas pilih</strong> — Lamaran Kerja · Wisuda · Beasiswa · LinkedIn · Raport PT<br><br>⚠️ Selalu cek ketentuan instansi tujuan — bisa berbeda.' },
  kua:        { photos: '1 foto (rapikan 1 foto berdua) atau 2 foto terpisah (gabung jadi 1)', desc: 'Foto nikah KUA/Kemenag — background biru standar (UU No. 22/1946). Pakaian formal berkerah, warna kontras dengan biru.<br><br>👨 <strong>Pria:</strong> kemeja formal berkerah, peci opsional<br>👩 <strong>Wanita:</strong> kebaya / blus formal — hindari warna biru agar tidak menyatu dengan background<br>🧕 <strong>Hijab:</strong> rapi & sederhana, wajah terlihat utuh dari dahi hingga dagu<br><br>📐 Ukuran: 8 lbr 2×3 cm + 2 lbr 4×6 cm' },
  enhance:    { photos: '1 foto — foto yang mau diperjelas',    desc: 'Naikin kualitas foto — lebih tajam, jernih, dan detail. Cocok untuk foto blur, gelap, atau resolusi rendah.' },
  restore:    { photos: '1 foto — foto lama yang rusak/pudar',  desc: 'Pulihkan foto lama — rusak, sobek, buram, atau memudar. ⚠️ Kerusakan sangat parah mungkin tidak 100% pulih. 💡 Scan foto fisik dengan resolusi setinggi mungkin sebelum upload.' },
  colorize:   { photos: '1 foto — foto hitam putih atau sepia', desc: 'Beri warna pada foto hitam putih atau sepia. ⚠️ Foto dengan kontras jelas hasilnya jauh lebih baik. 💡 Scan foto fisik dulu dengan resolusi tinggi sebelum upload.' },
  background: { photos: '1 foto — orang atau subjek utama',     desc: 'Ganti background — warna solid, tempat umum, atau deskripsi bebas apa saja. Subjek utama tidak tersentuh.' },
  outfit:     { photos: '1–2 foto — 1 foto untuk kebanyakan jenis, 2 foto untuk seragam atau referensi bebas', desc: 'Ganti pakaian — formal, kasual, streetwear, adat tradisional, seragam sekolah, dinas, medis, umroh/haji, atau dari foto referensi. Wajah sama sekali tidak diubah.' },
  skck:       { photos: '1 foto — orang yang difoto', desc: 'Foto SKCK resmi Polri — background merah polos, pakaian formal berkerah, wajah penuh & jelas terlihat. Disarankan tanpa kacamata. Hijab diperbolehkan selama wajah terlihat utuh dari dahi hingga dagu.<br><br>📐 Ukuran standar: <strong>4×6 cm, 6 lembar</strong> (+ 2 lembar foto profil kanan & kiri bila diminta)' },
  wisuda:     { photos: '1 foto — orang yang difoto', desc: 'Foto wisuda — toga lengkap: jubah hitam + <strong>samir</strong> (selempang warna fakultas/strata) + <strong>biretta</strong> (topi). Pakaian formal di bawah toga.<br><br>👨 <strong>Pria:</strong> kemeja putih lengan panjang + dasi + celana bahan gelap<br>👩 <strong>Wanita:</strong> kebaya / blus formal / gamis formal<br><br>Background berbeda tiap kampus — konfirmasi ke panitia wisuda.' },
  headwear:    { photos: '1 foto — orang yang difoto', desc: 'Tambah atau ganti penutup kepala — hijab, peci, toga, baseball cap, snapback, beanie, fedora, sorban, topi dinas. Wajah dijamin tidak berubah sedikitpun.' },
  rambut:      { photos: '1 foto — orang yang ingin diganti rambut/warnanya', desc: 'Ganti warna atau gaya rambut — dari natural (coklat, pirang) sampai bold (merah, silver, biru, pink) atau ombre. Ubah gaya: undercut, pompadour, bob, pixie, curly. Wajah tidak berubah.' },
  aksesori:    { photos: '1 foto — orang yang ingin ditambah aksesori', desc: 'Tambah aksesori — kacamata hitam (aviator, wayfarer), kacamata minus, anting pria/wanita, kalung rantai emas/perak, jam tangan, atau kombinasi. Cocok untuk portrait stylish.' },
  tato:        { photos: '1 foto (deskripsi bebas) atau 2 foto (referensi motif)', desc: 'Tambah tato digital — realistik, minimalis fine line, geometric, old school, Japanese, tribal, watercolor. Pilih lokasi di tubuh, gaya, dan motif. Wajah tidak diubah.' },
  retouch:     { photos: '1 foto — portrait atau foto wajah yang mau dihaluskan', desc: 'Retouch ringan — haluskan kulit, hilangkan noda & jerawat, kurangi eye bags, mattify kilap, putihkan gigi sedikit. Struktur & identitas wajah 100% dipertahankan.' },
  foto_profil: { photos: '1 foto — foto yang akan dioptimasi untuk sosmed', desc: 'Optimasi foto profil untuk LinkedIn, Instagram, Facebook, X/Twitter, WhatsApp — crop ideal, background clean, lighting merata, kesan profesional atau kasual sesuai platform.' },
  ilustrasi:   { photos: '1 foto — orang yang akan diconvert ke gaya seni', desc: 'Konversi foto ke gaya ilustrasi artistik — cat minyak, cat air, pensil sketch, digital illustration, pop art, geometric, single line art. Identitas subjek tetap terasa.' },
  cosplay:     { photos: '1 foto — orang yang akan dicosplay-kan', desc: 'Ubah penampilan jadi karakter cosplay favorit — anime, superhero Marvel/DC, game populer, atau tokoh fantasi/historis. Kostum diganti detail sesuai karakter, background mengikuti dunia karakter. Wajah asli 100% tidak berubah.' },
  hapus_objek:  { photos: '1 foto — foto yang ada objek/orang yang ingin dihapus', desc: 'Hapus orang, benda, kendaraan, teks, atau watermark dari foto secara seamless. Area yang dihapus terisi background natural yang menyatu sempurna.' },
  foto_produk:  { photos: '1 foto — foto produk dari angle manapun', desc: 'Bersihkan dan poles foto produk untuk jualan online. Background putih/studio, lighting merata, produk tajam — siap upload ke Shopee, Tokopedia, atau Instagram.' },
  foto_couple:  { photos: '1–2 foto — bisa 1 foto berdua atau 2 foto terpisah yang digabung', desc: 'Buat atau poles foto couple & pasangan — gabung 2 foto jadi 1, rapikan pose, sesuaikan background. Cocok untuk foto prewedding casual, anniversary, kenangan keluarga.' },
  foto_wisuda:  { photos: '1 foto — orang yang difoto', desc: 'Edit foto jadi foto wisuda lengkap — toga + samir + biretta, background pilihan, pakaian formal di bawah toga. Wajah tidak berubah sedikitpun.' },
  hapus_bg:     { photos: '1 foto — foto dengan background yang ingin dihapus', desc: 'Hapus background foto — jadi transparan (PNG), warna solid, atau ganti suasana baru. Presisi tinggi untuk rambut, produk, dan portrait.' },
  foto_keluarga:{ photos: '1–4 foto — bisa 1 foto bersama atau beberapa foto terpisah yang digabung', desc: 'Buat atau poles foto keluarga — gabung beberapa foto jadi satu frame, poles latar, sesuaikan pencahayaan. Cocok untuk foto lebaran, ulang tahun, kenangan bersama.' },
  desain_banner:  { photos: '1 foto (opsional) — foto produk atau orang sebagai elemen banner', desc: 'Buat desain banner / poster promosi — toko, diskon, event, atau branding. Tambahkan teks, warna tema, dan layout profesional siap cetak atau upload sosmed.' },
  listing_produk: { photos: '1 foto — foto produk dari angle manapun', desc: 'Buat foto listing produk untuk marketplace — brand besar di pojok, nama & kode produk, spesifikasi kunci dengan tipografi jumbo, watermark toko. Siap upload ke Shopee, Tokopedia, atau Instagram langsung tanpa edit tambahan.' },
  label_stiker:   { photos: 'Tidak perlu upload foto — isi form data produk, AI generate desainnya', desc: 'Buat desain label produk atau stiker siap cetak — makanan, minuman, kosmetik, herbal, UMKM. Isi nama produk, brand, tagline, dan varian → AI generate desain label profesional.' },
  event_foto:     { photos: '1 foto — foto orang yang akan diberi tema event', desc: 'Tema foto otomatis untuk 18 momen Indonesia & internasional — Lebaran, HUT RI, Natal, Valentine, Halloween, Imlek, Kartini, dan lainnya.<br><br>🎨 <strong>2 mode:</strong><br>● <strong>Tema saja</strong> — background & efek bertema event<br>● <strong>+ Teks ucapan</strong> — tambah greeting sesuai momen<br><br>⚡ Aktif hari ini otomatis di-highlight. Bisa juga pilih event manual.' },
  cyberpunk_portrait: { photos: '1 foto — portrait atau foto orang', desc: 'Transform foto portrait menjadi karakter dunia futuristik cyberpunk — Blade Runner 2049, Ghost in the Shell, Cyberpunk 2077. Pilih gaya visual, augmentasi AI, tema neon, dan setting latar.<br><br>🔒 <strong>Wajah 100% tidak berubah</strong> — hanya environment, pakaian, dan augmentasi yang diubah.' },
  cyber_scene:        { photos: '1 foto — kendaraan, bangunan, kota, orang, atau objek apapun', desc: 'Transform foto apapun ke versi futuristik total — kendaraan hover, mega-city, bangunan AI, manusia cyborg. Pilih era masa depan dan gaya visual.<br><br>🚀 Cocok untuk semua jenis foto — tidak terbatas portrait.' },
};

/* ════════════════════════════════════
   FACE LOCK RULE
════════════════════════════════════ */
const WAJAH_RULE = `
⚠️ FACE LOCK — ABSOLUTE & NON-NEGOTIABLE ⚠️
This application's core identity is ULTRA-STRICT FACE PRESERVATION. These rules override everything else:

🔒 FORBIDDEN — NO EXCEPTIONS:
- ANY alteration to the face, facial features, identity, or expression — zero tolerance
- Changing the shape of eyes, nose, mouth, lips, eyebrows, ears, or facial contour
- Modifying skin tone, complexion, texture, or any facial marking
- Smoothing, reconstructing, or replacing any part of the face
- AI "beautification" or "enhancement" of facial features
- Changing age appearance, adding or removing facial hair

✅ THE FACE MUST BE:
- 100% pixel-identical to the original in shape, proportion, and identity
- The subject must be instantly recognizable as the same person
- If unsure whether a change touches the face — DO NOT make that change

All edits are ONLY permitted on: background, clothing, lighting, crop/framing, and photo quality.`;

/* ════════════════════════════════════
   MODULE DEFINITIONS
════════════════════════════════════ */
const MODS = {
  event_foto: {
    label: 'HOT',
    title: 'Foto Event / Momen',
    desc: 'Tema foto untuk Lebaran, HUT RI, Natal, Valentine, Halloween, Imlek & 12 momen lainnya — background, kostum, dan teks ucapan.',
    options: () => renderOpsiEventFoto(),
    prompt: buildPromptEventFoto,
  },
  pasfoto: {
    label: 'HOT',
    title: 'Foto Dokumen Resmi',
    desc: 'KTP · SIM · Paspor · SKCK · KUA/Nikah · Wisuda · Lamaran · CPNS · LinkedIn · Raport/Ijazah — pilih tujuan foto, background & aturan tampil otomatis.',
    options: () => renderOpsiTujuanDokumen() + `<div id="bg-dokumen-wrap" style="display:none">` + renderOpsiBackgroundDokumen() + `</div>`,
    prompt: buildPromptPasFoto,
  },
  enhance: {
    label: 'Peningkatan Kualitas',
    title: 'Perjelas & Perindah Foto',
    desc: 'Naikin kualitas foto — ketajaman, pencahayaan, detail, dan kejernihan gambar.',
    options: () => renderOpsiEnhanceLevel() + renderOpsiExtra('Fokus perbaikan (opsional)', 'Contoh: perbaiki pencahayaan, hilangkan noise'),
    prompt: buildPromptEnhance,
  },
  restore: {
    label: 'Peningkatan Kualitas',
    title: 'Restorasi Foto Lama',
    desc: 'Pulihkan foto lama — rusak, pudar, buram, sobek, atau tergores dikembalikan seperti semula.',
    options: () => renderOpsiRestoreMode() + renderOpsiExtra('Catatan kerusakan (opsional)', 'Contoh: ada sobekan di pojok kanan, warna kekuningan'),
    prompt: buildPromptRestore,
  },
  colorize: {
    label: 'Peningkatan Kualitas',
    title: 'Kolorisasi Foto Hitam Putih',
    desc: 'Beri warna pada foto hitam putih atau sepia — natural, vivid, atau vintage.',
    options: () => renderOpsiColorizeStyle() + renderOpsiExtra('Keterangan era/konteks (opsional)', 'Contoh: foto tahun 1970an, suasana pedesaan'),
    prompt: buildPromptColorize,
  },
  background: {
    label: 'HOT',
    title: 'Ganti Background',
    desc: 'Ganti background — warna solid, tempat umum, atau deskripsi bebas. Subjek utama tidak tersentuh.',
    options: () => renderOpsiBackground() + renderOpsiBackgroundCustom(),
    prompt: buildPromptBackground,
  },
  outfit: {
    label: 'Penampilan',
    title: 'Ganti Pakaian',
    desc: 'Ganti pakaian — formal, seragam sekolah, dinas, medis, umroh/haji, atau dari foto referensi. Wajah tidak diubah.',
    options: () => renderOpsiJenisOutfit(),
    prompt: buildPromptOutfit,
  },
  headwear: {
    label: 'Penampilan',
    title: 'Tambah / Ganti Headwear',
    desc: 'Tambah atau ganti penutup kepala — hijab, peci, toga, baseball cap, beanie, fedora, sorban, topi dinas. Wajah tidak diubah.',
    options: () => renderOpsiHeadwear() + renderOpsiAksiHeadwear() + renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: hijab warna putih polos, snapback hitam, beanie abu-abu'),
    prompt: buildPromptHeadwear,
  },
  rambut: {
    label: 'Penampilan',
    title: 'Ganti Warna & Gaya Rambut',
    desc: 'Ubah warna atau gaya rambut — pirang, merah, silver, ombre, bold color, atau ganti potongan: undercut, bob, curly. Wajah tidak berubah.',
    options: () => renderOpsiRambut(),
    prompt: buildPromptRambut,
  },
  aksesori: {
    label: 'Penampilan',
    title: 'Tambah Aksesori & Perhiasan',
    desc: 'Tambah kacamata hitam/minus, anting pria/wanita, kalung, jam tangan — atau kombinasi stylish sesuka hati. Wajah tidak berubah.',
    options: () => renderOpsiAksesori(),
    prompt: buildPromptAksesori,
  },
  tato: {
    label: 'Penampilan',
    title: 'Tambah Tato Digital',
    desc: 'Tambah tato di foto — pilih gaya (realistik, minimalis, tribal, Japanese...), lokasi di tubuh, dan motif bebas atau dari referensi.',
    options: () => renderOpsiTato(),
    prompt: buildPromptTato,
  },
  hapus_objek: {
    label: 'Seleksi & Editing',
    title: 'Hapus Objek / Orang',
    desc: 'Hapus orang, benda, kendaraan, teks, atau watermark dari foto — area yang dihapus terisi background natural.',
    options: () => renderOpsiHapusObjek(),
    prompt: buildPromptHapusObjek,
  },
  foto_produk: {
    label: 'Produk & Bisnis',
    title: 'Foto Produk Jualan',
    desc: 'Poles foto produk untuk jualan online — background putih/studio, lighting merata, produk tajam siap upload.',
    options: () => renderOpsiFotoProduk(),
    prompt: buildPromptFotoProduk,
  },
  foto_couple: {
    label: 'Foto Orang',
    title: 'Foto Couple / Pasangan',
    desc: 'Gabung atau poles foto couple & pasangan — 2 foto jadi 1, rapikan pose, background pilihan.',
    options: () => renderOpsiFotoCouple(),
    prompt: buildPromptFotoCouple,
  },
  ganti_pose: {
    label: 'Seleksi & Editing',
    title: 'Ganti Pose',
    desc: 'Ubah pose dan komposisi foto — formal, half-body, full-body, atau natural. Wajah tidak berubah sedikitpun.',
    options: () => renderOpsiGantiPose(),
    prompt: buildPromptGantiPose,
  },
  anime_kartun: {
    label: 'Kreatif',
    title: 'Anime / Kartun',
    desc: 'Konversi foto ke gaya anime, Disney-Pixar, chibi, atau ilustrasi digital. Karakter tetap terasa seperti orangnya.',
    options: () => renderOpsiAnimeKartun(),
    prompt: buildPromptAnimeKartun,
  },
  retouch: {
    label: 'Peningkatan Kualitas',
    title: 'Retouch Ringan',
    desc: 'Haluskan kulit, hilangkan noda & jerawat, kurangi kilap dan eye bags — hasil natural. Identitas wajah 100% tidak berubah.',
    options: () => renderOpsiRetouch(),
    prompt: buildPromptRetouch,
  },
  foto_profil: {
    label: 'Foto Orang',
    title: 'Foto Profil Sosial Media',
    desc: 'Optimasi foto profil untuk LinkedIn, Instagram, Facebook, X/Twitter, WhatsApp — background, crop, dan cahaya disesuaikan platform.',
    options: () => renderOpsiFotoProfil(),
    prompt: buildPromptFotoProfil,
  },
  ilustrasi: {
    label: 'Kreatif',
    title: 'Gaya Ilustrasi Artistik',
    desc: 'Konversi foto ke cat minyak, cat air, pensil sketch, digital illustration, atau pop art. Karakter tetap terasa seperti orangnya.',
    options: () => renderOpsiIlustrasi(),
    prompt: buildPromptIlustrasi,
  },
  cosplay: {
    label: 'Kreatif',
    title: 'Cosplay Digital',
    desc: 'Ubah penampilan jadi karakter cosplay — anime, superhero, game, atau fantasi. Kostum detail, background sesuai dunia karakter. Wajah tidak berubah.',
    options: () => renderOpsiCosplay(),
    prompt: buildPromptCosplay,
  },
  foto_wisuda: {
    label: 'Foto Orang',
    title: 'Foto Wisuda',
    desc: 'Edit foto jadi foto wisuda lengkap — toga + samir + biretta, background pilihan, pakaian formal. Wajah tidak berubah.',
    options: () => renderOpsiFotoWisuda(),
    prompt: buildPromptFotoWisuda,
  },
  hapus_bg: {
    label: 'Seleksi & Editing',
    title: 'Hapus Background',
    desc: 'Hapus background jadi transparan (PNG), warna solid, atau suasana baru. Presisi tinggi untuk rambut, produk, dan portrait.',
    options: () => renderOpsiHapusBg(),
    prompt: buildPromptHapusBg,
  },
  foto_keluarga: {
    label: 'Foto Orang',
    title: 'Foto Keluarga',
    desc: 'Buat atau poles foto keluarga — gabung beberapa foto, poles background, sesuaikan pencahayaan. Cocok untuk lebaran, ulang tahun, kenangan bersama.',
    options: () => renderOpsiFotoKeluarga(),
    prompt: buildPromptFotoKeluarga,
  },
  desain_banner: {
    label: 'Produk & Bisnis',
    title: 'Desain Banner / Poster',
    desc: 'Buat banner atau poster promosi toko — promo diskon, grand opening, event, pengumuman. Siap upload sosmed atau cetak.',
    options: () => renderOpsiDesainBanner(),
    prompt: buildPromptDesainBanner,
  },
  listing_produk: {
    label: 'Produk & Bisnis',
    title: 'Listing Foto Produk',
    desc: 'Buat foto listing marketplace — brand besar, nama produk, spek kunci jumbo, watermark toko. Siap upload Shopee/Tokped/Instagram.',
    options: () => renderOpsiListingProduk(),
    prompt: buildPromptListingProduk,
  },
  label_stiker: {
    label: 'Produk & Bisnis',
    title: 'Label & Stiker Produk',
    desc: 'Desain label produk atau stiker siap cetak — makanan, minuman, kosmetik, herbal, UMKM. Isi data produk, pilih bentuk & gaya, prompt siap pakai.',
    options: () => renderOpsiLabelStiker(),
    prompt: buildPromptLabelStiker,
  },
  cyberpunk_portrait: {
    label: '⚡ Dev Choice',
    title: 'Cyberpunk Portrait',
    desc: 'Transform foto menjadi karakter Blade Runner 2049 — neon glow, cybernetic augments, rain-soaked future cityscape. Wajah dijaga 100%.',
    options: () => renderOpsiCyberpunkPortrait(),
    prompt: buildPromptCyberpunkPortrait,
  },
  cyber_scene: {
    label: '⚡ Dev Choice',
    title: 'Future World Transformer',
    desc: 'Transform foto ke dunia masa depan — kendaraan hover, mega-city, bangunan futuristik, manusia AI agent. Total visual transformation.',
    options: () => renderOpsiCyberScene(),
    prompt: buildPromptCyberScene,
  },
};

/* ════════════════════════════════════
   INIT
════════════════════════════════════ */
function initFoto() {
  document.querySelectorAll('.app-version').forEach(el => { el.textContent = APP_VERSION; });
  document.addEventListener('click', () => {
    document.getElementById('mod-tooltip')?.classList.remove('show');
  });
  initGroups();
  initTooltips();
  initEventTicker();
}

let _pendingEventId = null;

function quickStartEvent(evId) {
  _pendingEventId = evId;
  setMod('event_foto');
}

function initEventTicker() {
  const slot = document.getElementById('event-ticker-slot');
  if (!slot) return;
  const items = getAllTickerItems();
  if (!items.length) { slot.style.display = 'none'; return; }

  const MO = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  function renderItem(item) {
    if (item.active) {
      return `<span class="ticker-item ticker-item--active" style="--tk:${item.ev.accent}">`
        + `${item.ev.emoji} <strong>${item.ev.name}</strong>`
        + `<span class="ticker-live">● Aktif</span>`
        + `<button class="ticker-cta" onclick="quickStartEvent('${item.ev.id}')">Buat Foto →</button>`
        + `</span>`;
    }
    const da = item.next.getDate(), mo = item.next.getMonth();
    const label = item.days <= 0 ? 'Hari ini'
      : item.days === 1 ? 'Besok'
      : item.days < 30  ? `${item.days} hari lagi`
      : `${da} ${MO[mo]}`;
    return `<span class="ticker-item ticker-item--upcoming">`
      + `${item.ev.emoji} ${item.ev.name}`
      + `<span class="ticker-date soon-badge">🔜 ${label}</span>`
      + `<button class="ticker-cta ticker-cta--soon" onclick="quickStartEvent('${item.ev.id}')">Siapkan →</button>`
      + `</span>`;
  }

  const sep = `<span class="ticker-sep">·</span>`;
  const html = items.map(renderItem).join(sep);
  const dur  = Math.max(20, items.length * 6);

  slot.innerHTML = `<div class="event-ticker">
    <span class="ticker-label">🗓️</span>
    <div class="ticker-scroll-wrap">
      <div class="ticker-track" style="animation-duration:${dur}s">${html}${sep}${html}${sep}</div>
    </div>
  </div>`;
}

// Dipanggil oleh switchMode() di app-core.js
function initGroupsForMode(mode) {
  if (mode === 'foto') {
    initGroups();
    initTooltips();
  }
}

// C1: filter modul sidebar real-time
function filterMods(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.mod-card').forEach(card => {
    const name = card.querySelector('.mod-name')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('.mod-desc')?.textContent.toLowerCase() || '';
    card.style.display = (!q || name.includes(q) || desc.includes(q)) ? '' : 'none';
  });
  if (q) {
    // Expand semua grup saat ada query supaya hasil kelihatan
    document.querySelectorAll('.mod-group-items').forEach(items => {
      items.style.overflow = 'visible';
      items.style.maxHeight = 'none';
      items.style.opacity = '1';
    });
    document.querySelectorAll('.mod-group-label').forEach(l => l.classList.remove('collapsed'));
  } else {
    // Hapus query → collapse ulang ke default
    initGroups();
  }
}

function initGroups() {
  // Default: semua grup collapsed saat pertama buka
  document.querySelectorAll('.mod-group-items').forEach(el => {
    el.style.maxHeight = '0px';
    el.style.opacity  = '0';
  });
  document.querySelectorAll('.mod-group-label').forEach(label => {
    label.classList.add('collapsed');
  });
}

function initTooltips() {
  document.querySelectorAll('.mod-info-btn').forEach(btn => {
    // Ambil key dari onclick yang sudah ada
    const match = btn.getAttribute('onclick')?.match(/'([^']+)'/);
    if (!match) return;
    const key = match[1];

    // Desktop: hover show / mouse leave hide
    btn.addEventListener('mouseenter', e => showModInfo(e, key));
    btn.addEventListener('mouseleave', () => {
      document.getElementById('mod-tooltip')?.classList.remove('show');
    });
  });
}

function toggleGroup(id) {
  const label = document.querySelector(`.mod-group-label[data-group="${id}"]`);
  const items = document.getElementById('group-' + id);
  if (!label || !items) return;

  const isExpanded = items.style.maxHeight !== '0px' && items.style.maxHeight !== '';
  label.classList.toggle('collapsed', isExpanded);

  if (isExpanded) {
    // Pin ke tinggi saat ini dulu supaya collapse smooth dari posisi 'none'
    items.style.overflow = 'hidden';
    items.style.maxHeight = items.scrollHeight + 'px';
    requestAnimationFrame(() => {
      items.style.maxHeight = '0px';
      items.style.opacity = '0';
    });
  } else {
    items.style.overflow = 'hidden';
    items.style.maxHeight = items.scrollHeight + 'px';
    items.style.opacity = '1';
    // Setelah transisi expand selesai, lepas constraint supaya card terakhir tidak terpotong
    setTimeout(() => {
      if (items.style.maxHeight !== '0px') {
        items.style.maxHeight = 'none';
        items.style.overflow = 'visible';
      }
    }, 350);
  }
}

/* ════════════════════════════════════
   MOD INFO TOOLTIP
════════════════════════════════════ */
function showModInfo(e, key) {
  e.stopPropagation();
  // Di desktop, mouseenter sudah handle — klik cukup untuk mobile
  if (e.type === 'click' && window.innerWidth > 768) return;
  const tip = document.getElementById('mod-tooltip');
  const info = MOD_INFO[key];
  if (!tip || !info) return;

  tip.innerHTML = `<span class="tip-photos">📷 ${info.photos}</span>${info.desc}`;

  const r = e.currentTarget.getBoundingClientRect();
  const mobile = window.innerWidth <= 768;

  if (mobile) {
    tip.style.left = '50%';
    tip.style.transform = 'translateX(-50%)';
    tip.style.top = (r.bottom + 8) + 'px';
  } else {
    tip.style.transform = '';
    tip.style.left = (r.right + 10) + 'px';
    tip.style.top = r.top + 'px';
  }

  tip.classList.add('show');

  // C2: clamp posisi supaya tooltip tidak keluar viewport
  requestAnimationFrame(() => {
    const tr = tip.getBoundingClientRect();
    if (tr.bottom > window.innerHeight - 8) {
      tip.style.top = Math.max(8, window.innerHeight - tr.height - 8) + 'px';
    }
    if (!mobile && tr.right > window.innerWidth - 8) {
      tip.style.left = '';
      tip.style.right = '8px';
    }
  });
}

/* ════════════════════════════════════
   DRAWER (mobile)
════════════════════════════════════ */
// openDrawer / closeDrawer — di app-core.js

/* ════════════════════════════════════
   MODULE SWITCHING
════════════════════════════════════ */
function setMod(key) {
  currentMod = key;
  selectedColor = '#FF0000';
  generatedPrompt = '';

  if (['cyberpunk_portrait', 'cyber_scene'].includes(key)) {
    document.body.classList.add('cyberpunk-mode');
  } else {
    document.body.classList.remove('cyberpunk-mode');
  }

  document.querySelectorAll('.mod-card').forEach(c => c.classList.remove('active'));
  document.getElementById('mod-' + key)?.classList.add('active');

  // A1: auto-expand grup yang berisi modul ini + scroll ke card aktif
  const groupId = MOD_GROUPS[key];
  if (groupId) {
    const items = document.getElementById('group-' + groupId);
    if (items && (items.style.maxHeight === '0px' || items.style.maxHeight === '')) {
      toggleGroup(groupId);
    }
    setTimeout(() => {
      document.getElementById('mod-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 380);
  }

  const mod = MODS[key];
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('workspace').classList.add('show');

  renderWorkspace(mod, groupId);
  closeDrawer();
  document.querySelector('.main')?.scrollTo({ top: 0, behavior: 'smooth' });
}

// A3: kembali ke welcome screen
function goWelcome() {
  document.getElementById('workspace').classList.remove('show');
  document.getElementById('welcome').style.display = '';
  currentMod = null;
  generatedPrompt = '';
  document.body.classList.remove('cyberpunk-mode');
  document.querySelectorAll('.mod-card').forEach(c => c.classList.remove('active'));
}

/* ════════════════════════════════════
   TIPS FOTO PER MODUL
════════════════════════════════════ */
const FOTO_TIPS = {
  event_foto: [
    'Foto yang jelas dan terang menghasilkan tema yang lebih natural',
    'Pilih foto dengan background polos atau tidak terlalu ramai untuk hasil terbaik',
    'Ekspresi yang sesuai momen (senyum cerah untuk lebaran/natal, romantis untuk valentine)',
    'Pakaian yang senada dengan warna tema event akan terlihat lebih harmonis',
  ],
  pasfoto: [
    'Wajah tegak lurus menghadap kamera — tidak miring ke kiri/kanan',
    'Pencahayaan dari depan rata — hindari bayangan di pipi atau dahi',
    'Background polos atau kontras dengan wajah (gelap/terang)',
    'Ekspresi netral, mulut tertutup — standar dokumen resmi',
  ],
  background: [
    'Pose sudah sesuai yang diinginkan — background asal tidak penting',
    'Rambut tertata rapi agar tepi foto bisa diproses lebih bersih',
    'Hindari pakaian warna sama persis dengan background asli',
    'Pencahayaan pada tubuh harus merata agar blend ke background baru terlihat natural',
  ],
  headwear: [
    'Kepala dan bagian atas terlihat jelas — jangan terpotong crop',
    'Rambut sudah tertata — AI akan menyesuaikan dengan topi/headwear',
    'Foto dari depan atau sedikit dari atas — bukan dari bawah dagu',
    'Background kontras dengan warna rambut/kepala',
  ],
  outfit: [
    'Foto minimal dari pinggang ke atas, atau full body jika memungkinkan',
    'Tubuh dalam posisi tegak dan tidak terhalang objek lain',
    'Pencahayaan merata pada seluruh badan — hindari bayangan besar di tubuh',
    'Pakaian sekarang tidak perlu bagus — AI akan menggantinya sepenuhnya',
  ],
  rambut: [
    'Kepala dan wajah terlihat jelas dari depan atau sudut 3/4',
    'Pencahayaan cukup pada rambut asli agar AI pahami tekstur & volume',
    'Kepala tidak terhalang tangan atau benda lain',
    'Resolusi cukup tinggi agar helai rambut terbaca detail',
  ],
  aksesori: [
    'Area pemasangan aksesori (wajah/leher/pergelangan) harus jelas terlihat',
    'Pencahayaan merata agar aksesori yang ditambahkan blend natural',
    'Untuk kacamata — foto wajah frontal, kedua telinga terlihat',
    'Untuk kalung atau jam — pastikan area leher/pergelangan tidak tertutup',
  ],
  tato: [
    'Area tubuh yang akan ditato harus jelas terlihat dan tidak tertutup',
    'Kulit bersih dari aksesori yang menghalangi area tato',
    'Pencahayaan merata pada area kulit yang dituju',
    'Resolusi cukup agar tekstur kulit terlihat natural setelah tato ditempel',
  ],
  enhance: [
    'Upload foto apa adanya — AI yang akan mendeteksi dan memperbaiki masalah',
    'Semakin sesuai preset dengan kondisi foto, semakin bagus hasilnya',
    'Foto sangat buram atau gelap tetap bisa diproses — pilih preset yang tepat',
    'Tidak perlu edit manual dulu — serahkan ke AI untuk analisis langsung',
  ],
  restore: [
    'Scan foto lama dengan scanner flatbed jika tersedia — lebih tajam dari foto ulang',
    'Jika difoto ulang, gunakan pencahayaan flat tanpa kilap atau refleksi kaca',
    'Sertakan sedikit tepi bingkai foto dalam frame — jangan crop ketat',
    'Resolusi setinggi mungkin — perbesar scan/foto sebelum upload',
  ],
  colorize: [
    'Upload foto hitam-putih asli yang belum diedit sebelumnya',
    'Detail dan kontras foto harus jelas — foto hitam-putih keruh hasilnya kurang baik',
    'Scan dengan kualitas tinggi atau foto dalam kondisi pencahayaan merata',
    'Bisa arahkan warna via kolom catatan — contoh: "baju warna merah, latar hijau"',
  ],
  retouch: [
    'Foto portrait jelas menghadap kamera dengan pencahayaan wajah cukup',
    'Resolusi tinggi agar detail kulit terbaca — minimal 1MP',
    'Matikan beauty mode / smooth di aplikasi kamera — foto kulit asli lebih mudah diproses',
    'Pencahayaan dari depan paling ideal untuk retouching merata',
  ],
  hapus_objek: [
    'Jangan crop foto dulu — AI butuh konteks background di sekitar objek yang dihapus',
    'Background di balik objek yang dihapus sebaiknya tidak terlalu kompleks',
    'Pencahayaan dan background konsisten di sekitar area yang akan dihapus',
    'Untuk orang yang dihapus: hindari yang berdiri persis di sudut atau tepi frame',
  ],
  foto_produk: [
    'Bersihkan produk dari debu, fingerprint, dan stiker harga sebelum foto',
    'Foto di permukaan datar dengan cahaya dari jendela — hindari flash langsung',
    'Foto beberapa sudut pandang agar AI memahami bentuk produk secara utuh',
    'Background tidak harus putih bersih — AI yang akan menggantinya sesuai pilihan',
  ],
  foto_couple: [
    'Kedua wajah harus sama terang — hindari salah satu backlit atau gelap',
    'Jarak kamera proporsional agar skala kedua orang seimbang',
    'Mode gabung 2 foto: usahakan angle & pencahayaan serupa di kedua foto',
    'Hindari lensa wide angle yang mendistorsi wajah di tepi frame',
  ],
  foto_profil: [
    'Foto portrait bersih menghadap kamera atau sedikit miring (3/4 angle)',
    'Wajah harus paling terang di frame — hindari backlit dari jendela belakang',
    'Ekspresi natural dan relaks — senyum tipis jauh lebih baik dari ekspresi kaku',
    'Resolusi tinggi agar hasil tetap tajam setelah di-crop ke ukuran thumbnail kecil',
  ],
  foto_wisuda: [
    'Kenakan toga atau pakaian wisuda jika sudah ada — jauh lebih mudah dari nol',
    'Berdiri atau duduk tegak, pandangan langsung ke kamera',
    'Background polos memudahkan AI mengganti ke warna yang diminta',
    'Foto minimal dari pinggang ke atas agar toga dan samir terlihat lengkap',
  ],
  hapus_bg: [
    'Subjek harus jelas berbeda secara visual dari background — kontras warna atau kecerahan',
    'Rambut keriting atau helai halus: resolusi setinggi mungkin untuk hasil edge yang bersih',
    'Hindari pakaian warna sama persis dengan background',
    'Untuk produk: foto di atas permukaan yang kontras dengan warna produk',
  ],
  foto_keluarga: [
    'Pastikan semua wajah terlihat dan cukup terang — tidak ada yang tersembunyi',
    'Pencahayaan outdoor natural (mendung tipis) memberikan hasil paling merata',
    'Mode gabung foto: skala & angle pengambilan sebaiknya serupa di semua foto',
    'Pose alami dan candid sering menghasilkan foto yang lebih indah dari pose kaku',
  ],
  ganti_pose: [
    'Foto full body atau minimal dari lutut ke atas — makin lengkap makin baik',
    'Pakaian harus terlihat jelas agar AI bisa mempertahankannya di pose baru',
    'Foto dari depan atau sudut 3/4 — hindari dari samping penuh',
    'Background kontras agar AI bisa memisahkan subjek dari latar',
  ],
  anime_kartun: [
    'Wajah jelas dan pencahayaan baik — ekspresi ekspresif menghasilkan karakter lebih hidup',
    'Background sederhana membantu AI fokus pada konversi wajah dan tubuh',
    'Foto portrait atau half-body menghasilkan konversi lebih detail dan berkualitas',
    'Hindari foto yang sudah diberi filter berat — mulai dari foto asli yang bersih',
  ],
  ilustrasi: [
    'Pencahayaan dramatis atau terarah menghasilkan ilustrasi dengan karakter lebih kuat',
    'Ekspresi, pose, dan komposisi foto akan dipertahankan dalam karya seni',
    'Resolusi tinggi membantu AI menangkap detail wajah dan tekstur yang khas',
    'Background yang menarik atau bermakna menghasilkan ilustrasi lebih kaya',
  ],
  cosplay: [
    'Foto minimal half-body agar kostum karakter bisa diterapkan secara penuh',
    'Pose menyerupai karakter yang dipilih membuat hasil lebih dramatis dan ikonik',
    'Background kontras membantu AI fokus pada transformasi kostum',
    'Pakaian sekarang tidak penting sama sekali — AI menggantinya sepenuhnya',
  ],
  desain_banner: [
    'Tidak wajib upload foto — banner bisa didesain murni dari teks deskripsi',
    'Jika punya foto produk unggulan, upload untuk dijadikan elemen utama banner',
    'Semakin detail isi teks utama dan nama toko, semakin relevan desainnya',
    'Gunakan kolom catatan tambahan untuk nomor WA, alamat toko, atau produk unggulan',
  ],
  listing_produk: [
    'Foto produk dari sudut terbaik — 3/4 angle atau frontal biasanya paling bagus',
    'Produk bersih dari debu, fingerprint, dan stiker harga sebelum difoto',
    'Pencahayaan dari jendela atau ring light lebih bagus dari flash langsung kamera',
    'Upload foto asli tanpa di-crop dulu — AI yang akan menyesuaikan komposisi listing',
  ],
  cyberpunk_portrait: [
    'Foto portrait jelas dengan wajah penuh — AI akan membangun dunia futuristik di sekitar wajahmu',
    'Foto dengan pencahayaan dramatis atau kontras tinggi hasilnya lebih sinematik',
    'Background asli tidak penting — akan sepenuhnya diganti dengan setting futuristik',
    'Ekspresi tegas atau serius lebih cocok untuk estetika cyberpunk',
  ],
  cyber_scene: [
    'Foto dari angle yang dramatis hasilnya jauh lebih sinematik setelah transformasi',
    'Pastikan subjek utama jelas terlihat dan tidak terpotong dari frame',
    'Foto siang hari paling mudah ditransform — detail lebih terlihat untuk AI',
    'Gunakan preset chip untuk hasil cepat, atau atur manual untuk kontrol penuh',
  ],
};

function renderFotoTips(modKey) {
  const tips = FOTO_TIPS[modKey];
  if (!tips?.length) return '';
  const items = tips.map(t => `<li>${t}</li>`).join('');
  return `<div class="foto-tips-box" id="foto-tips-box">
    <button class="foto-tips-header" type="button" onclick="toggleFotoTips()">
      <span>📷 Tips Foto</span>
      <span class="foto-tips-chevron" id="foto-tips-chevron">▶</span>
    </button>
    <ul class="foto-tips-list" id="foto-tips-list" style="display:none;margin:0;padding:4px 12px 10px 28px;list-style:disc">${items}</ul>
  </div>`;
}

function toggleFotoTips() {
  const list    = document.getElementById('foto-tips-list');
  const chevron = document.getElementById('foto-tips-chevron');
  if (!list) return;
  const isOpen = list.style.display !== 'none';
  list.style.display = isOpen ? 'none' : 'block';
  if (chevron) chevron.textContent = isOpen ? '▶' : '▼';
}

/* ════════════════════════════════════
   WORKSPACE
════════════════════════════════════ */
function renderWorkspace(mod, groupId) {
  const body = document.getElementById('ws-body');
  let html = '';

  html += `<div class="ws-cols">`;

  // KOLOM KIRI — header + steps + settings + tombol
  const accentClass = 'ws-header ws-header--' + (groupId || 'default');
  html += `<div class="ws-col-left">`;
  html += `<div class="${accentClass}" id="ws-header">
    <div class="ws-header-row1">
      <div class="ws-header-label">${mod.label}</div>
    </div>
    <div class="ws-header-title">${mod.title}</div>
    <div class="ws-header-desc">${mod.desc}</div>
  </div>`;
  html += `<div class="ws-steps" id="ws-steps">
    <span class="ws-step ws-step--done">✓ Pilih</span>
    <span class="ws-step-sep">›</span>
    <span class="ws-step ws-step--active" id="wss-atur">Atur Opsi</span>
    <span class="ws-step-sep">›</span>
    <span class="ws-step" id="wss-gen">Generate</span>
    <span class="ws-step-sep">›</span>
    <span class="ws-step" id="wss-launch">Launch</span>
  </div>`;
  const tipsHtml = renderFotoTips(currentMod);
  if (tipsHtml) html += tipsHtml;

  const optsHtml = mod.options ? mod.options() : '';
  if (optsHtml) {
    html += `<div class="section-card">
      <div class="section-head">Pengaturan</div>
      <div class="section-body">${optsHtml}</div>
    </div>`;
  }
  html += `<div id="upload-note-slot"></div>
  <div style="display:flex;align-items:center;gap:10px;">
    <button class="btn-proses" onclick="generatePrompt()" disabled>✨ Generate Prompt</button>
    <button class="btn-reset" onclick="resetWorkspace()">Reset</button>
    <span class="action-hint" id="action-hint"></span>
  </div>`;
  html += `</div>`;

  // KOLOM KANAN — hasil prompt
  html += `<div class="ws-col-right">
    <div class="section-card" id="prompt-output" style="display:none">
      <div class="section-head">✦ Prompt Siap Pakai</div>
      <div class="section-body">
        <div class="note-box" style="margin-bottom:10px;">
          <span class="note-icon">💡</span>
          <span>Klik platform di bawah — prompt otomatis tersalin ke clipboard. Upload foto di platform tersebut, paste prompt, lalu generate.</span>
        </div>
        <pre id="prompt-text" style="white-space:pre-wrap;font-size:11px;line-height:1.8;font-family:'DM Mono',monospace;background:var(--bg);border:1.5px solid var(--border);border-radius:8px;padding:12px 14px;overflow-y:visible;color:var(--text);"></pre>
        <div id="prompt-meta" style="display:none;font-size:10.5px;color:var(--text-3);font-family:'Sora',sans-serif;margin-top:4px;display:flex;gap:8px;align-items:center;">
          <span id="prompt-char-count"></span>
          <span style="opacity:0.4">·</span>
          <span id="prompt-word-count"></span>
        </div>
      </div>
    </div>
    <div class="result-actions-sticky" id="result-actions-wrap" style="display:none">
      <div class="result-actions">
        <button class="btn-download btn-chatgpt-fire" onclick="launchPlatform('chatgpt')">🔥 ChatGPT <span class="btn-rec-badge">⭐ Terbaik</span></button>
        <button class="btn-download btn-gemini-rec" onclick="launchPlatform('gemini')">✨ Gemini</button>
        <button class="btn-retry btn-copy-prompt" onclick="copyPrompt()">📋 Salin</button>
      </div>
    </div>
    <div id="history-panel"></div>
  </div>`;

  html += `</div>`; // ws-cols

  body.innerHTML = html;
  clearUploadNote();
  if (document.getElementById('color-chips')) renderColorChips();
  if (document.getElementById('outfit-sub-options')) renderOutfitSubOptions();
  if (document.getElementById('pasfoto-sub-options')) renderPasFotoSubOptions();
  if (document.getElementById('kua-sub-options')) renderKUASubOptions();
  if (document.getElementById('rambut-sub-options')) renderRambutSubOptions();
  if (document.getElementById('tato-sub-options')) renderTatoSubOptions();
  if (document.getElementById('cosplay-karakter-wrap')) renderCosplayKarakter();
  if (document.getElementById('hapusbg-extra-wrap')) renderHapusBgCustomColor();
  if (document.getElementById('keluarga-mode')) renderKeluargaModeNote();
  const coupleModeEl = document.getElementById('couple-mode');
  if (coupleModeEl) onCoupleModeChange(coupleModeEl);

  // Attach change-event delegation for live validation
  body.addEventListener('change', () => checkReady());
  checkReady();
}

/* ════════════════════════════════════
   PRESET CHIP UTILITIES
════════════════════════════════════ */
function renderPresetChips(chips) {
  return `<div class="preset-chips">
    <div class="preset-chips-label">⚡ Pilih cepat</div>
    <div class="preset-chips-row">
      ${chips.map(c => `<button class="chip" type="button" onclick='applyPreset(${JSON.stringify(c.set)},this)'>${c.label}</button>`).join('')}
    </div>
  </div>`;
}

function applyPreset(data, chipEl) {
  if (chipEl) {
    chipEl.closest('.preset-chips-row')?.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
    chipEl.classList.add('active');
  }
  // Jika preset ini set bg-quick → bersihkan color chip + dropdown agar tidak ada konflik visual
  if ('bg-quick' in data) {
    document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
    const cat = document.getElementById('bg-category');
    if (cat) cat.value = '';
    const presetWrap = document.getElementById('bg-preset-wrap');
    if (presetWrap) presetWrap.style.display = 'none';
    const customWrap = document.getElementById('bg-custom-wrap');
    if (customWrap) customWrap.style.display = 'none';
    const summary = document.getElementById('bg-selection-summary');
    if (summary) summary.style.display = 'none';
    const colorLabel = document.getElementById('color-name-label');
    if (colorLabel) colorLabel.textContent = '';
  }
  Object.entries(data).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  checkReady();
}

/* ════════════════════════════════════
   OPTIONS RENDERERS
════════════════════════════════════ */
function renderOpsiBackground() {
  const chips = [
    { label: '⬜ Studio Putih',   set: { 'bg-quick': 'clean white studio background with soft, even portrait lighting' } },
    { label: '🌿 Taman Hijau',    set: { 'bg-quick': 'city park with lush green trees and soft natural bokeh lighting' } },
    { label: '🌅 Sunset Hangat',  set: { 'bg-quick': 'warm golden hour sunset sky background, romantic soft lighting' } },
    { label: '☕ Cafe Cozy',      set: { 'bg-quick': 'cozy cafe interior with wooden furniture and warm yellow ambient lighting' } },
    { label: '🏖️ Pantai Tropis', set: { 'bg-quick': 'tropical beach with clear turquoise sea and blue sky, sunny day' } },
    { label: '🎨 Pastel Gradien', set: { 'bg-quick': 'soft pastel gradient background, clean and aesthetic minimalist' } },
  ];
  return `${renderPresetChips(chips)}
  <input type="hidden" id="bg-quick" value="">
  <div class="opt-group">
    <div class="opt-label">Atau Pilih Warna Solid</div>
    <div class="color-row" id="color-chips"></div>
    <div id="color-name-label" style="font-size:11px;color:var(--text-2);font-family:'Sora',sans-serif;min-height:16px;margin-top:2px;"></div>
  </div>`;
}

function renderChipsStatic(colors) {
  return colors.map(c =>
    `<div class="color-chip${c.hex === selectedColor ? ' selected' : ''}"
      style="background:${c.hex};" title="${c.name}"
      onclick="selectColor('${c.hex}', this)"></div>`
  ).join('');
}

function renderOpsiBackgroundDokumen() {
  return `<div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <div class="color-row" style="margin-bottom:8px;">${renderChipsStatic(BG_DOKUMEN)}</div>
    <div class="note-box" style="flex-direction:column;gap:4px;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span style="font-size:11px;font-weight:700;color:var(--text-2);">📋 Panduan Umum Warna Pas Foto</span>
        <button class="btn-ref-search" style="flex-shrink:0;" onclick="window.open('https://www.google.com/search?q=aturan+warna+background+pas+foto+indonesia+merah+biru+kuning','_blank')">🔍 Cek Aturan</button>
      </div>
      <div style="font-size:10.5px;color:var(--text-2);line-height:1.7;">
        <span style="color:#c62828;">🟥 Merah</span> — tahun lahir <strong>ganjil</strong><br>
        <span style="color:#1a56db;">🟦 Biru</span> — tahun lahir <strong>genap</strong><br>
        <span style="color:#b45309;">🟨 Kuning</span> — Kepolisian &amp; Militer (TNI)<br>
        <span style="color:var(--text-3);font-size:10px;">⚠️ Selalu cek aturan instansi tujuan — bisa berbeda</span>
      </div>
    </div>
  </div>`;
}

function renderOpsiBackgroundOutfit(mode = 'full') {
  const opts = mode === 'seragam'
    ? `<option value="">Tanpa ganti background</option>
       <option value="solid red (#FF0000)">Merah</option>
       <option value="solid blue (#0000FF)">Biru</option>`
    : `<option value="">Tanpa ganti background</option>
       <option value="solid red (#FF0000)">Merah</option>
       <option value="solid blue (#0000FF)">Biru</option>
       <option value="solid yellow (#FFD700)">Kuning</option>
       <option value="solid white (#FFFFFF)">Putih</option>
       <option value="advanced">Advanced — ketik sendiri</option>`;
  return `<div class="opt-group">
    <div class="opt-label">Ganti Background (opsional)</div>
    <select class="opt-select" id="outfit-bg" onchange="renderOutfitBgAdvanced()">
      ${opts}
    </select>
  </div>
  <div id="outfit-bg-advanced"></div>`;
}

function renderOutfitBgAdvanced() {
  const val = document.getElementById('outfit-bg')?.value;
  const container = document.getElementById('outfit-bg-advanced');
  if (!container) return;
  container.innerHTML = val === 'advanced'
    ? `<div class="opt-group"><div class="opt-label">Deskripsi Background</div><input class="opt-input" id="outfit-bg-custom" type="text" placeholder="Contoh: studio putih, taman kota, kantor modern blur"></div>`
    : '';
}

function getBgOutfit() {
  const val = document.getElementById('outfit-bg')?.value || '';
  if (!val) return '';
  if (val === 'advanced') return document.getElementById('outfit-bg-custom')?.value?.trim() || '';
  return val;
}

function renderOpsiBackgroundWisuda() {
  return `<div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <div class="color-row" style="margin-bottom:8px;">${renderChipsStatic(BG_WISUDA)}</div>
    <div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">
      🟥 Merah / 🟦 Biru — paling umum, menyesuaikan warna RGB kampus<br>
      ⬜ Putih — beberapa kampus menggunakan putih<br>
      <span style="font-size:10px;color:var(--text-3);">⚠️ Hindari pakai baju sewarna background. Cek ketentuan resmi dari panitia wisuda atau TU kampus.</span>
    </span></div>
  </div>`;
}

function renderOpsiBackgroundKUA() {
  return `<div class="opt-group">
    <div class="opt-label">Background</div>
    <div class="color-row-fixed">
      <div class="color-chip-fixed" style="background:#1A56B0;" title="Biru"></div>
      <span class="color-fixed-label">Biru — standar KUA di seluruh Indonesia</span>
    </div>
  </div>`;
}

function renderOpsiBackgroundSKCK() {
  return `<div class="opt-group">
    <div class="opt-label">Background</div>
    <div class="color-row-fixed">
      <div class="color-chip-fixed" style="background:#FF0000;" title="Merah"></div>
      <span class="color-fixed-label">Merah — standar wajib SKCK Polri</span>
    </div>
  </div>`;
}

function renderColorChips() {
  const container = document.getElementById('color-chips');
  if (!container) return;
  let html = BG_COLORS.map(c =>
    `<div class="color-chip${c.hex === selectedColor ? ' selected' : ''}"
      style="background:${c.hex};" title="${c.name}"
      onclick="selectColor('${c.hex}', this)"></div>`
  ).join('');
  html += `<div class="color-chip-custom" title="Warna custom">
    <span>+</span>
    <input type="color" value="${selectedColor}" oninput="selectColorCustom(this.value)">
  </div>`;
  container.innerHTML = html;
  _updateColorNameLabel();
}
function _updateColorNameLabel() {
  const label = document.getElementById('color-name-label');
  if (!label) return;
  const match = BG_COLORS.find(c => c.hex.toLowerCase() === selectedColor.toLowerCase());
  label.textContent = match ? '✓ ' + match.name : '✓ Custom ' + selectedColor.toUpperCase();
}

function selectColor(hex, el) {
  selectedColor = hex;
  document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  _clearBgPreset();
  _updateColorNameLabel();
  const keteranganWrap = document.getElementById('keterangan-wrap');
  if (keteranganWrap) keteranganWrap.style.display = '';
  checkReady();
}
function selectColorCustom(hex) {
  selectedColor = hex;
  document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
  _clearBgPreset();
  _updateColorNameLabel();
  const keteranganWrap = document.getElementById('keterangan-wrap');
  if (keteranganWrap) keteranganWrap.style.display = '';
  checkReady();
}
function _clearBgPreset() {
  const bgQuick = document.getElementById('bg-quick');
  if (bgQuick) bgQuick.value = '';
  document.querySelectorAll('.preset-chips-row .chip').forEach(b => b.classList.remove('active'));
  const cat = document.getElementById('bg-category');
  if (cat) cat.value = '';
  const presetWrap = document.getElementById('bg-preset-wrap');
  if (presetWrap) presetWrap.style.display = 'none';
  const customWrap = document.getElementById('bg-custom-wrap');
  if (customWrap) customWrap.style.display = 'none';
  const summary = document.getElementById('bg-selection-summary');
  if (summary) summary.style.display = 'none';
}
function onBgCategoryChange(sel) {
  const presetWrap = document.getElementById('bg-preset-wrap');
  const customWrap = document.getElementById('bg-custom-wrap');
  const presetSel  = document.getElementById('bg-preset');
  const summary    = document.getElementById('bg-selection-summary');

  if (!sel.value) {
    if (presetWrap) presetWrap.style.display = 'none';
    if (customWrap) customWrap.style.display = 'none';
    if (summary) summary.style.display = 'none';
    return;
  }
  if (sel.value === 'lainnya') {
    if (presetWrap) presetWrap.style.display = 'none';
    if (customWrap) customWrap.style.display = '';
    if (presetSel) presetSel.value = '';
    if (summary) summary.style.display = 'none';
  } else {
    const cat = BG_PRESETS[sel.value];
    if (cat && presetSel) {
      presetSel.innerHTML = '<option value="">— Pilih pilihan —</option>' +
        cat.items.map(i => `<option value="${i.value}">${i.label}</option>`).join('');
      presetSel.value = '';
    }
    if (presetWrap) presetWrap.style.display = '';
    if (customWrap) customWrap.style.display = 'none';
    if (summary) { summary.style.display = 'none'; }
  }
  document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
}
function onBgItemChange(sel) {
  if (!sel.value) return;
  document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('selected'));
  const catSel  = document.getElementById('bg-category');
  const catKey  = catSel?.value;
  const catLabel = catKey && BG_PRESETS[catKey] ? BG_PRESETS[catKey].label : '';
  const itemLabel = sel.options[sel.selectedIndex]?.text || '';
  const summary = document.getElementById('bg-selection-summary');
  if (summary && catLabel && itemLabel) {
    summary.style.display = 'flex';
    summary.innerHTML = `<span style="font-size:14px;">✓</span> <strong>${catLabel}</strong> &rsaquo; ${itemLabel}`;
  }
}

function renderOpsiGender() {
  return `<div class="opt-group">
    <div class="opt-label">Jenis Kelamin</div>
    <select class="opt-select" id="gender" onchange="onPasfotoGenderChange()">
      <option value="">— Pilih jenis kelamin —</option>
      <option value="pria">Pria</option>
      <option value="wanita">Wanita</option>
      <option value="wanita-hijab">Wanita Berhijab</option>
    </select>
  </div>`;
}

function renderBtnCariReferensi(type) {
  return `<div class="ref-search-row">
    <span class="ref-search-hint">Belum punya foto referensi?</span>
    <button class="btn-ref-search" onclick="cariReferensi('${type}')">🔍 Cari Referensi</button>
  </div>`;
}

function injectRefBtnAboveExtra(innerHtml) {
  const extraEl    = document.getElementById('extra');
  if (!extraEl) return;
  const extraGroup = extraEl.closest('.opt-group');
  if (!extraGroup) return;
  clearRefBtnSlot();
  const slot = document.createElement('div');
  slot.id = 'ref-btn-slot-dynamic';
  slot.innerHTML = innerHtml;
  extraGroup.before(slot);
}

function clearRefBtnSlot() {
  document.getElementById('ref-btn-slot-dynamic')?.remove();
}
function setUploadNote(html) {
  const slot = document.getElementById('upload-note-slot');
  if (slot) slot.innerHTML = html || '';
}
function clearUploadNote() {
  const slot = document.getElementById('upload-note-slot');
  if (slot) slot.innerHTML = '';
}

function cariReferensi(type) {
  let query = '';
  if (type === 'seragam') {
    const key    = document.getElementById('seragam-sekolah')?.value || 'sma';
    const gender = document.getElementById('gender')?.value || 'pria';
    const genderStr = { pria: 'laki-laki', wanita: 'perempuan', 'wanita-hijab': 'perempuan berhijab' }[gender] || 'laki-laki';
    const searchBase = SERAGAM_OPTIONS[key]?.search || 'seragam sekolah';
    query = `${searchBase} ${genderStr}`;
  } else if (type === 'refoutfit' || type === 'referensi') {
    const extra = document.getElementById('extra')?.value?.trim();
    query = extra ? `referensi baju ${extra}` : 'referensi baju formal indonesia';
  }
  if (query) window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`, '_blank');
}

function renderOpsiExtra(label, placeholder) {
  return `<div class="opt-group">
    <div class="opt-label">${label}</div>
    <textarea class="opt-textarea" id="extra" placeholder="${placeholder}"></textarea>
  </div>`;
}

function renderOpsiEnhanceLevel() { return renderOpsiEnhance(); }
function renderOpsiEnhance() {
  const chips = [
    { label: '✨ Standard HD',      set: { 'enhance-level': 'high',  'enhance-damage': '' } },
    { label: '🌫️ Foto Blur',       set: { 'enhance-level': 'ultra', 'enhance-damage': 'blur' } },
    { label: '🌑 Foto Gelap',       set: { 'enhance-level': 'high',  'enhance-damage': 'dark' } },
    { label: '📱 HP Lama / Malam',  set: { 'enhance-level': 'ultra', 'enhance-damage': 'noise' } },
    { label: '💥 JPEG Parah',       set: { 'enhance-level': 'ultra', 'enhance-damage': 'jpeg' } },
  ];
  return `${renderPresetChips(chips)}
  <div class="opt-group">
    <div class="opt-label">Level Peningkatan</div>
    <select class="opt-select" id="enhance-level">
      <option value="standard">Standard — perbaikan natural</option>
      <option value="high" selected>High Definition — tajam &amp; jernih</option>
      <option value="ultra">Ultra HD — maksimal, sangat detail</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Jenis Masalah Utama</div>
    <select class="opt-select" id="enhance-damage">
      <option value="">— Umum / tidak spesifik —</option>
      <option value="blur">Foto blur / goyang</option>
      <option value="dark">Terlalu gelap / under-exposed</option>
      <option value="noise">Banyak noise / grain (foto malam / HP lama)</option>
      <option value="jpeg">Artefak JPEG parah / pikselasi</option>
      <option value="faded">Warna pudar / buram</option>
      <option value="low_res">Resolusi rendah / kecil</option>
    </select>
  </div>`;
}

function renderOpsiRestoreMode() {
  return `<div class="opt-group">
    <div class="opt-label">Mode Restorasi</div>
    <select class="opt-select" id="restore-mode">
      <option value="standard">Standard — perbaikan umum</option>
      <option value="heavy">Heavy — kerusakan parah</option>
      <option value="colorize">Restore + Kolorisasi</option>
    </select>
  </div>`;
}

function renderOpsiColorizeStyle() {
  return `<div class="opt-group">
    <div class="opt-label">Gaya Kolorisasi</div>
    <select class="opt-select" id="colorize-style">
      <option value="natural">Natural — warna realistis</option>
      <option value="vivid">Vivid — warna cerah & kuat</option>
      <option value="vintage">Vintage — hangat & klasik</option>
    </select>
  </div>`;
}

function renderOpsiBackgroundCustom() {
  const catOptions = Object.entries(BG_PRESETS)
    .map(([key, cat]) => `<option value="${key}">${cat.label}</option>`)
    .join('');
  return `<div class="opt-group">
    <div class="opt-label">Atau Pilih Latar Tempat</div>
    <select class="opt-select" id="bg-category" onchange="document.getElementById('bg-quick').value='';document.querySelectorAll('.preset-chips-row .chip').forEach(b=>b.classList.remove('active'));onBgCategoryChange(this)">
      <option value="">— Pilih kategori —</option>
      ${catOptions}
      <option value="lainnya">✏️ Lainnya — ketik sendiri...</option>
    </select>
  </div>
  <div class="opt-group" id="bg-preset-wrap" style="display:none">
    <div class="opt-label">Pilih Lokasi / Suasana</div>
    <select class="opt-select" id="bg-preset" onchange="onBgItemChange(this)">
      <option value="">— Pilih pilihan —</option>
    </select>
  </div>
  <div id="bg-selection-summary" style="display:none;align-items:center;gap:6px;padding:7px 10px;background:var(--green-pale,#f0faf4);border:1.5px solid var(--green-mid,#6fcf8e);border-radius:8px;font-size:12px;color:var(--green-dark,#1a5c33);font-family:'Sora',sans-serif;margin-bottom:8px;"></div>
  <div class="opt-group" id="bg-custom-wrap" style="display:none">
    <div class="opt-label">Deskripsi background custom</div>
    <div class="opt-hint">Tulis sespesifik mungkin — nama tempat, suasana, waktu, cahaya, warna dominan</div>
    <textarea class="opt-textarea" id="extra" placeholder="Contoh: rooftop gedung pencakar langit di malam hari dengan lampu kota berkelip, jalanan Tokyo Shibuya yang ramai di malam hari, pantai Maldives dengan air jernih dan bungalow air..."></textarea>
  </div>`;
}

function renderOpsiOutfit() {
  return `<div class="opt-group">
    <div class="opt-label">Jenis Pakaian</div>
    <select class="opt-select" id="outfit-type">
      <option value="jas formal hitam dengan dasi">Jas formal + dasi</option>
      <option value="kemeja putih formal berkerah">Kemeja putih formal</option>
      <option value="kemeja batik formal">Kemeja batik formal</option>
      <option value="seragam CPNS / ASN">Seragam CPNS/ASN</option>
      <option value="kebaya formal wanita">Kebaya formal</option>
      <option value="baju wisuda toga">Toga wisuda</option>
    </select>
  </div>`;
}

function renderOpsiBajuWisuda() {
  return `<div class="opt-group">
    <div class="opt-label">Pakaian di Bawah Toga</div>
    <select class="opt-select" id="baju-wisuda" onchange="onBajuWisudaChange(this)">
      <option value="existing" selected>Pakai baju yang sudah ada</option>
      <optgroup label="Pria — Kemeja">
        <option value="pria_putih">Kemeja putih lengan panjang + dasi</option>
        <option value="pria_biru">Kemeja biru muda lengan panjang + dasi</option>
        <option value="pria_hitam">Kemeja hitam lengan panjang</option>
        <option value="pria_batik">Kemeja batik formal</option>
      </optgroup>
      <optgroup label="Wanita — Formal">
        <option value="wanita_putih">Kemeja putih berkerah + blazer</option>
        <option value="wanita_kebaya">Kebaya formal (warna netral)</option>
        <option value="wanita_blus">Blus formal berkerah</option>
        <option value="wanita_gamis">Gamis / busana muslimah formal</option>
      </optgroup>
    </select>
  </div>`;
}

function renderOpsiBajuDokumen(excludeSeragam = false) {
  const catOptions = Object.entries(BAJU_DOKUMEN_CATS)
    .filter(([key]) => !excludeSeragam || key !== 'seragam')
    .map(([key, cat]) => `<option value="${key}">${cat.label}</option>`)
    .join('');
  return `<div class="opt-group">
    <div class="opt-label">Baju / Pakaian</div>
    <select class="opt-select" id="baju-kategori" onchange="onBajuKategoriChange(this)">
      <option value="">— Pilih jenis pakaian —</option>
      ${catOptions}
    </select>
  </div>
  <div class="opt-group" id="baju-sub-wrap" style="display:none">
    <div class="opt-label">Pilih Pakaian</div>
    <select class="opt-select" id="baju-dokumen" onchange="onBajuDokumenChange(this)">
      <option value="">— Pilih pilihan —</option>
    </select>
  </div>
  <div id="baju-dokumen-extra"></div>`;
}

function onBajuKategoriChange(sel) {
  const subWrap        = document.getElementById('baju-sub-wrap');
  const subSel         = document.getElementById('baju-dokumen');
  const extra          = document.getElementById('baju-dokumen-extra');
  const genderWrap     = document.getElementById('gender-wrap');
  const bgLastWrap     = document.getElementById('bg-last-wrap');
  const keteranganWrap = document.getElementById('keterangan-wrap');

  if (extra) extra.innerHTML = '';
  clearRefBtnSlot();
  if (!sel.value) {
    if (subWrap) subWrap.style.display = 'none';
    if (genderWrap) genderWrap.style.display = 'none';
    if (bgLastWrap) bgLastWrap.style.display = 'none';
    if (keteranganWrap) keteranganWrap.style.display = 'none';
    checkReady();
    return;
  }
  const cat = BAJU_DOKUMEN_CATS[sel.value];
  if (cat?.single) {
    if (subWrap) subWrap.style.display = 'none';
    if (subSel) subSel.value = cat.value;
    if (extra) extra.innerHTML = `<div class="opt-hint" style="margin-top:-2px;">Baju di foto asli tetap dipakai — tidak diganti. AI hanya merapikan kerah, smoothing lipatan, dan memastikan penampilan rapi.</div>`;
    if (genderWrap) genderWrap.style.display = '';
    // Jika gender sudah dipilih sebelumnya, langsung tampilkan bg + keterangan
    const currentGender = document.getElementById('gender')?.value;
    if (bgLastWrap) bgLastWrap.style.display = currentGender ? '' : 'none';
    if (keteranganWrap) keteranganWrap.style.display = currentGender ? '' : 'none';
  } else if (cat?.items && subSel) {
    subSel.innerHTML = '<option value="">— Pilih pilihan —</option>' +
      cat.items.map(key => `<option value="${key}">${BAJU_DOKUMEN[key]?.label || key}</option>`).join('');
    subSel.value = '';
    if (subWrap) subWrap.style.display = '';
    if (genderWrap) genderWrap.style.display = 'none';
    if (bgLastWrap) bgLastWrap.style.display = 'none';
    if (keteranganWrap) keteranganWrap.style.display = 'none';
  }
  checkReady();
}
function onBajuDokumenChange(sel) {
  const extra = document.getElementById('baju-dokumen-extra');
  if (!extra) return;
  const entry = BAJU_DOKUMEN[sel.value];
  if (entry?.seragam) {
    // Simpan ref button tapi hidden — baru tampil setelah gender dipilih
    extra.innerHTML = `<div id="ref-btn-slot-dynamic" style="display:none"><div class="ref-search-row"><span class="ref-search-hint">Belum punya foto referensi seragam?</span><button class="btn-ref-search" onclick="cariReferensiDokumen()">🔍 Cari Referensi</button></div></div>`;
    setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>2 foto</strong> ke platform AI: <strong>(1)</strong> foto orang, <strong>(2)</strong> foto referensi seragam. AI akan menerapkan seragam dari referensi ke orang di foto 1.</span></div>`);
  } else {
    extra.innerHTML = '';
    clearUploadNote();
    clearRefBtnSlot();
  }
  const genderWrap = document.getElementById('gender-wrap');
  if (genderWrap) genderWrap.style.display = '';
  // Auto-lock gender jika pakaian dari optgroup gender tertentu
  const genderLock = _detectGenderFromBajuSel(sel);
  _applyGenderLock(genderLock);
  if (genderLock) onPasfotoGenderChange(); // trigger chain: tampil bg + keterangan
  const bgLastWrap = document.getElementById('bg-last-wrap');
  const keteranganWrap = document.getElementById('keterangan-wrap');
  if (!genderLock) {
    const currentGender = document.getElementById('gender')?.value;
    if (currentGender) {
      // gender sudah terpilih — langsung tampilkan bg & keterangan
      if (bgLastWrap) bgLastWrap.style.display = '';
      if (keteranganWrap) keteranganWrap.style.display = '';
    } else {
      if (bgLastWrap) bgLastWrap.style.display = 'none';
      if (keteranganWrap) keteranganWrap.style.display = 'none';
    }
  }
  checkReady();
}
function _genderSearchStr() {
  const g = document.getElementById('gender')?.value || '';
  return { pria: 'pria', wanita: 'wanita', 'wanita-hijab': 'wanita berhijab' }[g] || '';
}
function cariReferensiDokumen() {
  const key = document.getElementById('baju-dokumen')?.value;
  const entry = BAJU_DOKUMEN[key];
  if (!entry?.search) return;
  const gStr = _genderSearchStr();
  const q = gStr ? `${entry.search} ${gStr}` : entry.search;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=isch`, '_blank');
}
function cariReferensiDinas(baseSearch) {
  const gStr = _genderSearchStr();
  const q = gStr ? `${baseSearch} ${gStr}` : baseSearch;
  window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=isch`, '_blank');
}
function onDinasChange(sel) {
  const extra = document.getElementById('baju-dokumen-extra');
  const genderWrap = document.getElementById('gender-wrap');
  const bgLastWrap = document.getElementById('bg-last-wrap');
  if (!extra) return;
  if (!sel.value) { extra.innerHTML = ''; clearUploadNote(); clearRefBtnSlot(); if (genderWrap) genderWrap.style.display = 'none'; if (bgLastWrap) bgLastWrap.style.display = 'none'; checkReady(); return; }
  const entry = DINAS_OPTIONS[sel.value];
  // Inject ref button langsung ke baju-dokumen-extra (keterangan-wrap masih hidden)
  // Simpan ref button tapi hidden — baru tampil setelah gender dipilih
  const dinasSearchBase = (entry?.search || sel.value).replace(/'/g, "\\'");
  extra.innerHTML = `<div id="ref-btn-slot-dynamic" style="display:none"><div class="ref-search-row"><span class="ref-search-hint">Belum punya foto referensi seragam dinas?</span><button class="btn-ref-search" onclick="cariReferensiDinas('${dinasSearchBase}')">🔍 Cari Referensi</button></div></div>`;
  setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>2 foto</strong> ke platform AI: <strong>(1)</strong> foto orang, <strong>(2)</strong> foto referensi seragam dinas.</span></div>`);
  if (genderWrap) genderWrap.style.display = '';
  if (bgLastWrap) bgLastWrap.style.display = 'none';
  const keteranganWrap2 = document.getElementById('keterangan-wrap');
  if (keteranganWrap2) keteranganWrap2.style.display = 'none';
  checkReady();
}

function _detectGenderFromBajuSel(sel) {
  const opt = sel?.options?.[sel.selectedIndex];
  const grp = opt?.parentElement;
  if (!grp || grp.tagName !== 'OPTGROUP') return null;
  const lbl = grp.label || '';
  if (/pria/i.test(lbl)) return 'pria';
  if (/wanita/i.test(lbl)) {
    return /gamis|muslimah/.test(sel.value) ? 'wanita-hijab' : 'wanita';
  }
  return null;
}
function _applyGenderLock(genderLock) {
  const genderSel = document.getElementById('gender');
  if (!genderSel) return;
  if (genderLock) {
    genderSel.value = genderLock;
    genderSel.disabled = true;
    genderSel.style.opacity = '0.6';
    genderSel.title = 'Gender dikunci otomatis sesuai pilihan pakaian';
  } else {
    genderSel.disabled = false;
    genderSel.style.opacity = '';
    genderSel.title = '';
  }
}

function onBajuWisudaChange(sel) {
  _applyGenderLock(_detectGenderFromBajuSel(sel));
  checkReady();
}

function onPasfotoGenderChange() {
  const gender = document.getElementById('gender')?.value;
  const bgLastWrap = document.getElementById('bg-last-wrap');
  if (bgLastWrap) bgLastWrap.style.display = '';
  const keteranganWrap = document.getElementById('keterangan-wrap');
  if (keteranganWrap) keteranganWrap.style.display = '';
  // ref button hanya muncul jika gender sudah dipilih (bukan empty)
  const refSlot = document.getElementById('ref-btn-slot-dynamic');
  if (refSlot) refSlot.style.display = gender ? '' : 'none';
  checkReady();
}

function renderOpsiModeKUA() {
  return `<div class="opt-group">
    <div class="opt-label">Mode Foto</div>
    <select class="opt-select" id="kua-mode" onchange="renderKUASubOptions()">
      <option value="rapikan">1 Foto — Sudah berdua, perlu dirapikan</option>
      <option value="gabung">2 Foto — Gabungkan 2 foto terpisah jadi 1</option>
    </select>
  </div>
  <div id="kua-sub-options"></div>`;
}

function renderKUASubOptions() {
  const mode = document.getElementById('kua-mode')?.value || 'rapikan';
  const container = document.getElementById('kua-sub-options');
  if (!container) return;
  if (mode === 'gabung') {
    container.innerHTML = '';
    setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>2 foto</strong> ke platform AI: <strong>(1)</strong> foto pria, <strong>(2)</strong> foto wanita. AI akan menggabungkan keduanya menjadi 1 foto berdampingan sesuai standar KUA.</span></div>`);
  } else {
    container.innerHTML = '';
    setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>1 foto</strong> — foto berdua yang sudah ada. AI akan merapikan posisi, baju, dan background sesuai standar KUA.</span></div>`);
  }
}

function renderOpsiTujuanDokumen() {
  return `<div class="opt-group">
    <div class="opt-label">Tujuan Foto</div>
    <select class="opt-select" id="tujuan-dokumen" onchange="renderPasFotoSubOptions()">
      <option value="">— Pilih tujuan foto —</option>
      <optgroup label="🪪 Identitas">
        <option value="ktp">KTP — Kartu Tanda Penduduk</option>
        <option value="sim">SIM — Surat Izin Mengemudi</option>
        <option value="paspor">Paspor RI</option>
        <option value="visa">Visa Internasional</option>
      </optgroup>
      <optgroup label="🎓 Pendidikan & Akademik">
        <option value="raport_sek">Ijazah / Raport SD, SMP, SMA</option>
        <option value="raport_pt">Ijazah Perguruan Tinggi (D3/S1)</option>
        <option value="wisuda">Wisuda</option>
        <option value="beasiswa">Beasiswa (LPDP, SNBT, dll)</option>
      </optgroup>
      <optgroup label="💼 Karir & Profesional">
        <option value="lamaran">Lamaran Kerja</option>
        <option value="cpns">CPNS / Sekolah Kedinasan (BKN)</option>
        <option value="linkedin">LinkedIn / CV Digital</option>
      </optgroup>
      <optgroup label="⚔️ Dinas & Keamanan">
        <option value="dinas">Polisi / TNI / Satpam (Seragam Dinas)</option>
        <option value="skck">SKCK — Surat Keterangan Catatan Kepolisian</option>
      </optgroup>
      <optgroup label="💍 Personal">
        <option value="kua">KUA / Nikah</option>
      </optgroup>
    </select>
  </div>
  <div id="pasfoto-sub-options"></div>`;
}

function renderPasFotoSubOptions() {
  const tujuan = document.getElementById('tujuan-dokumen')?.value || '';
  const container = document.getElementById('pasfoto-sub-options');
  if (!container) return;

  const bgWrap = document.getElementById('bg-dokumen-wrap');
  if (!tujuan) {
    container.innerHTML = '';
    if (bgWrap) bgWrap.style.display = 'none';
    return;
  }

  // KTP / SIM / Paspor / Visa — BG embedded per tujuan, bgWrap tidak dipakai
  if (['ktp', 'sim', 'paspor', 'visa'].includes(tujuan)) {
    if (bgWrap) bgWrap.style.display = 'none';
    const bgHtml = tujuan === 'ktp'    ? renderBGKTP()
                 : tujuan === 'sim'    ? renderBGSIM()
                 : tujuan === 'paspor' ? renderBGPaspor()
                 : renderBGVisa();
    container.innerHTML = renderOpsiBajuDokumen(true)
      + `<div id="gender-wrap" style="display:none">${renderOpsiGender()}</div>`
      + `<div id="bg-last-wrap" style="display:none">${bgHtml}</div>`
      + `<div id="keterangan-wrap" style="display:none">${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: ekspresi serius, tanpa kacamata')}</div>`;
    checkReady();
    return;
  }

  if (bgWrap) bgWrap.style.display = '';

  let html = '';
  let bgLast = '';
  let noteTrail = '';

  if (tujuan === 'raport_sek') {
    const seragamItems = BAJU_DOKUMEN_CATS.seragam.items
      .map(key => `<option value="${key}">${BAJU_DOKUMEN[key]?.label || key}</option>`).join('');
    html += `<div class="opt-group">
      <div class="opt-label">Baju / Pakaian</div>
      <div class="opt-hint" style="margin-bottom:6px;">Foto sekolah pakai seragam yang berlaku — pilih sesuai jenjang.</div>
      <select class="opt-select" id="baju-dokumen" onchange="onBajuDokumenChange(this)">
        <option value="">— Pilih seragam —</option>
        ${seragamItems}
      </select>
    </div>
    <div id="baju-dokumen-extra"></div>`;
    if (bgWrap) bgWrap.style.display = 'none';
    bgLast = `<div id="bg-last-wrap" style="display:none">${renderBGRaportSek()}</div>`;

  } else if (tujuan === 'raport_pt') {
    if (bgWrap) bgWrap.style.display = 'none';
    html += renderOpsiBajuIjazahPT();
    bgLast = `<div id="bg-last-wrap" style="display:none">${renderBGRaportPT()}</div>`;
    noteTrail = `<div class="note-box"><span class="note-icon">👔</span><span style="font-size:11px;"><strong>Pria:</strong> kemeja putih + jas almamater, atau jas formal + dasi. <strong>Wanita:</strong> blus/kebaya formal + jas almamater atau busana muslimah formal.</span></div>`;

  } else if (tujuan === 'skck') {
    if (bgWrap) bgWrap.style.display = 'none';
    container.innerHTML = renderOpsiBajuDokumen(true)
      + `<div id="gender-wrap" style="display:none">${renderOpsiGender()}</div>`
      + `<div id="bg-last-wrap" style="display:none">${renderOpsiBackgroundSKCK()}</div>`
      + `<div id="keterangan-wrap" style="display:none">${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: tanpa kacamata, ekspresi serius')}</div>`
      + `<div class="note-box"><span class="note-icon">📋</span><span>Ketentuan resmi Polri: background <strong>merah polos</strong>, pakaian formal berkerah, wajah penuh & jelas, <strong>disarankan tanpa kacamata</strong>. Hijab: wajah terlihat utuh dari dahi hingga dagu. Ukuran standar: <strong>4×6 cm, 6 lembar</strong>.</span></div>`;
    checkReady(); return;
  } else if (tujuan === 'kua') {
    if (bgWrap) bgWrap.style.display = 'none';
    container.innerHTML = renderOpsiModeKUA()
      + renderOpsiBackgroundKUA()
      + renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: pria pakai peci hitam, wanita kebaya hijau')
      + `<div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">Standar Kemenag (UU No. 22/1946): background <strong>biru</strong> otomatis diterapkan.<br><strong>Pria:</strong> kemeja formal berkerah, peci opsional. <strong>Wanita:</strong> kebaya / blus formal — hindari warna biru. <strong>Hijab:</strong> rapi, wajah terlihat dari dahi–dagu.<br><span style="font-size:10px;color:var(--text-3);">📐 Ukuran: 8 lbr 2×3 cm + 2 lbr 4×6 cm</span></span></div>`;
    checkReady(); return;
  } else if (tujuan === 'wisuda') {
    if (bgWrap) bgWrap.style.display = 'none';
    // toga + baju + gender semua punya default valid → bg langsung tampil
    container.innerHTML = renderOpsiToga() + renderOpsiBajuWisuda()
      + `<div id="gender-wrap">${renderOpsiGender()}</div>`
      + `<div id="bg-last-wrap" style="display:none">${renderOpsiBackgroundWisuda()}</div>`
      + `<div id="keterangan-wrap" style="display:none">${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: toga biru UGM, selempang kuning')}</div>`
      + `<div class="note-box"><span class="note-icon">🎓</span><span>Toga wajib <strong>lengkap</strong>: jubah (sesuai warna kampus) + <strong>samir</strong> (selempang warna fakultas/strata) + <strong>biretta</strong> (topi akademik). Tanpa tulisan atau dekorasi tambahan di toga.</span></div>`
      + `<div class="note-box"><span class="note-icon">👔</span><span>Pakaian di bawah toga wajib formal & rapi. <strong>Pria:</strong> kemeja putih lengan panjang + dasi + celana bahan gelap. <strong>Wanita:</strong> kebaya / blus berkerah / gamis formal. Hindari motif terlalu ramai — warna netral lebih baik.</span></div>`;
    const bgW = container.querySelector('#bg-last-wrap');
    if (bgW) bgW.style.display = '';
    const ktW = container.querySelector('#keterangan-wrap');
    if (ktW) ktW.style.display = '';
    checkReady(); return;

  } else if (tujuan === 'dinas') {
    if (bgWrap) bgWrap.style.display = 'none';
    selectedColor = '#FFD700';
    const dinasItems = Object.entries(DINAS_OPTIONS)
      .map(([key, d]) => `<option value="${key}">${d.label}</option>`).join('');
    html += `<div class="opt-group">
      <div class="opt-label">Jenis Seragam Dinas</div>
      <select class="opt-select" id="baju-dokumen" onchange="onDinasChange(this)">
        <option value="">— Pilih seragam dinas —</option>
        ${dinasItems}
      </select>
    </div>
    <div id="baju-dokumen-extra"></div>`;
    bgLast = `<div id="bg-last-wrap" style="display:none">${renderBGDinas()}</div>`;
    noteTrail = `<div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">Pakai <strong>Pakaian Dinas Harian (PDH)</strong> lengkap — atribut, pangkat, dan tanda pengenal harus tampak jelas.<br><span style="font-size:10px;color:var(--text-3);">⚠️ Pose wajib tegak &amp; netral — TNI/Polri dilarang pose berkampanye atau menunjukkan keberpihakan politik.</span></span></div>`;

  } else if (tujuan === 'lamaran') {
    if (bgWrap) bgWrap.style.display = 'none';
    html += renderOpsiBajuDokumen(true);
    bgLast = `<div id="bg-last-wrap" style="display:none">${renderBGLamaran()}</div>`;
  } else if (tujuan === 'cpns') {
    if (bgWrap) bgWrap.style.display = 'none';
    const cpnsNote = `<div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">
      <strong>Pakaian wajib:</strong> Kemeja putih polos lengan panjang/pendek, tanpa corak.<br>
      👨 Pria: disarankan dasi hitam/gelap.<br>
      👩 Wanita berhijab: kerudung warna gelap (hitam/biru dongker), kecuali instansi mensyaratkan warna lain.<br>
      <span style="font-size:10px;color:var(--text-3);">⚠️ Cek buku petunjuk teknis instansi/sekolah kedinasan untuk ketentuan spesifik.</span>
    </span></div>`;
    const cpnsKemeja = `<div class="opt-group">
      <div class="opt-label">Kemeja</div>
      <select class="opt-select" id="cpns-baju">
        <option value="existing">Sudah pakai kemeja putih — rapikan saja</option>
        <option value="ganti">Ganti ke kemeja putih polos</option>
      </select>
    </div>`;
    // kemeja + gender semua punya default valid → bg langsung tampil
    container.innerHTML = cpnsKemeja
      + `<div id="gender-wrap">${renderOpsiGender()}</div>`
      + `<div id="bg-last-wrap" style="display:none">${renderBGCPNS()}</div>`
      + `<div id="keterangan-wrap" style="display:none">${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: wanita kerudung hitam, pria dasi hitam')}</div>`
      + cpnsNote;
    const bgC = container.querySelector('#bg-last-wrap');
    if (bgC) bgC.style.display = '';
    const ktC = container.querySelector('#keterangan-wrap');
    if (ktC) ktC.style.display = '';
    checkReady();
    return;
  } else if (tujuan === 'linkedin') {
    if (bgWrap) bgWrap.style.display = 'none';
    // gender + extra sudah embedded di renderOpsiLinkedIn — tidak perlu gender-wrap generik
    container.innerHTML = renderOpsiBajuDokumen(true) + renderOpsiLinkedIn()
      + `<div class="note-box"><span class="note-icon">💡</span><span style="font-size:11px;line-height:1.7;">LinkedIn pakai format <strong>lingkaran</strong> — pemusatan wajah sangat penting.<br>Wajah harus memenuhi <strong>~60%</strong> area foto.<br>Hindari background merah/biru (kesan pasfoto formal — tidak ideal untuk LinkedIn).</span></div>`;
    checkReady();
    return;
  } else {
    html += renderOpsiBajuDokumen(true);
  }

  // raport_pt punya default baju valid → gender langsung tampil
  const genderInitHidden = (tujuan !== 'raport_pt') ? ' style="display:none"' : '';
  html += `<div id="gender-wrap"${genderInitHidden}>${renderOpsiGender()}</div>`;
  html += bgLast;
  html += `<div id="keterangan-wrap" style="display:none">${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: ekspresi serius')}</div>`;
  html += noteTrail;

  container.innerHTML = html;

  // raport_pt: baju + gender keduanya punya default → bg langsung tampil
  if (tujuan === 'raport_pt') {
    const bgPt = container.querySelector('#bg-last-wrap');
    if (bgPt) bgPt.style.display = '';
    const ktPt = container.querySelector('#keterangan-wrap');
    if (ktPt) ktPt.style.display = '';
  }
  checkReady();
}

function renderBGKTP() {
  const chips = [{ hex: '#FF0000', name: 'Merah' }, { hex: '#0000FF', name: 'Biru' }];
  return `<div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <div class="color-row" style="margin-bottom:8px;">${renderChipsStatic(chips)}</div>
    <div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">
      <span style="color:#c62828;">🟥 Merah</span> — tahun lahir <strong>ganjil</strong> (2001, 2003, 2005…)<br>
      <span style="color:#1a56db;">🟦 Biru</span> — tahun lahir <strong>genap</strong> (2000, 2002, 2004…)<br>
      <span style="font-size:10px;color:var(--text-3);">⚠️ Hindari pakai baju warna sama dengan background</span>
    </span></div>
  </div>`;
}

function renderBGSIM() {
  selectedColor = '#0000FF';
  return `<div class="opt-group">
    <div class="opt-label">Background</div>
    <div class="color-row-fixed">
      <div class="color-chip-fixed" style="background:#0000FF;" title="Biru"></div>
      <span class="color-fixed-label">Biru — standar wajib SIM</span>
    </div>
    <div class="note-box" style="margin-top:8px;"><span class="note-icon">💡</span><span style="font-size:11px;">Hindari pakai baju berwarna biru agar tidak menyatu dengan background.</span></div>
  </div>`;
}

function renderBGPaspor() {
  selectedColor = '#FFFFFF';
  return `<div class="opt-group">
    <div class="opt-label">Background</div>
    <div class="color-row-fixed">
      <div class="color-chip-fixed" style="background:#FFFFFF;border:0.5px solid var(--border);" title="Putih"></div>
      <span class="color-fixed-label">Putih polos — standar wajib Paspor RI</span>
    </div>
    <div class="note-box" style="margin-top:8px;"><span class="note-icon">💡</span><span style="font-size:11px;">Wajib pakai baju berkerah. <strong>Jangan pakai baju putih</strong> — warna akan menyatu dengan background.</span></div>
  </div>`;
}

function renderBGVisa() {
  selectedColor = '#FFFFFF';
  const chips = [{ hex: '#FFFFFF', name: 'Putih' }, { hex: '#0000FF', name: 'Biru' }, { hex: '#FF0000', name: 'Merah' }];
  return `<div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <div class="color-row" style="margin-bottom:8px;">${renderChipsStatic(chips)}</div>
    <div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">
      ⬜ <strong>Putih</strong> — standar mayoritas negara (Eropa, AS, Australia, China)<br>
      🟦 Biru / 🟥 Merah — sebagian kecil negara, cek aturan kedutaan<br>
      <span style="font-size:10px;color:var(--text-3);">⚠️ Selalu periksa instruksi resmi kedutaan negara tujuan</span>
    </span></div>
  </div>`;
}

function renderBGLamaran() {
  const chips = [{ hex: '#0000FF', name: 'Biru' }, { hex: '#FF0000', name: 'Merah' }, { hex: '#FFFFFF', name: 'Putih' }];
  if (!chips.find(c => c.hex === selectedColor)) selectedColor = '#0000FF';
  return `<div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <div class="color-row" style="margin-bottom:8px;">${renderChipsStatic(chips)}</div>
    <div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">
      🟦 <strong>Biru</strong> — kesan profesional & tepercaya, paling umum dipakai HRD<br>
      🟥 Merah — alternatif, cek kebijakan perusahaan<br>
      ⬜ Putih — bersih dan netral<br>
      <span style="font-size:10px;color:var(--text-3);">⚠️ Hindari pakai baju sewarna background</span>
    </span></div>
  </div>`;
}

function renderOpsiGantiKeKemejaPutih() {
  return `<div class="opt-group">
    <div class="opt-label">Kemeja</div>
    <select class="opt-select" id="cpns-baju">
      <option value="existing">Sudah pakai kemeja putih — rapikan saja</option>
      <option value="ganti">Ganti ke kemeja putih polos</option>
    </select>
  </div>
  ${renderOpsiGender()}
  ${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: wanita kerudung hitam, pria dasi hitam')}`;
}

function renderBGDinas() {
  const chips = [{ hex: '#FFD700', name: 'Kuning' }, { hex: '#FF0000', name: 'Merah' }];
  if (!chips.find(c => c.hex === selectedColor)) selectedColor = '#FFD700';
  return `<div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <div class="color-row" style="margin-bottom:8px;">${renderChipsStatic(chips)}</div>
    <div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">
      🟨 <strong>Kuning</strong> — foto kepegawaian internal ASN, TNI, Polri (kartu anggota, data dinas)<br>
      🟥 Merah — rekrutmen AKPOL, Tamtama / Bintara Polri, pelantikan<br>
      <span style="font-size:10px;color:var(--text-3);">⚠️ Verifikasi ke petunjuk teknis resmi instansi / portal penerimaan</span>
    </span></div>
  </div>`;
}

function renderBGCPNS() {
  const chips = [{ hex: '#FF0000', name: 'Merah' }, { hex: '#0000FF', name: 'Biru' }];
  if (!chips.find(c => c.hex === selectedColor)) selectedColor = '#FF0000';
  return `<div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <div class="color-row" style="margin-bottom:8px;">${renderChipsStatic(chips)}</div>
    <div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">
      🟥 <strong>Merah</strong> — standar umum SSCASN BKN<br>
      🟦 Biru — beberapa instansi/kedinasan (STIN, Poltekim, dll)<br>
      <span style="font-size:10px;color:var(--text-3);">⚠️ Selalu cek buku petunjuk teknis instansi / sekolah kedinasan yang dituju</span>
    </span></div>
  </div>`;
}

function renderBGRaportSek() {
  const chips = [{ hex: '#FF0000', name: 'Merah' }, { hex: '#0000FF', name: 'Biru' }];
  return `<div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <div class="color-row" style="margin-bottom:8px;">${renderChipsStatic(chips)}</div>
    <div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">
      <span style="color:#c62828;">🟥 Merah</span> — tahun lahir <strong>ganjil</strong> (2001, 2003, 2005…)<br>
      <span style="color:#1a56db;">🟦 Biru</span> — tahun lahir <strong>genap</strong> (2000, 2002, 2004…)<br>
      <span style="font-size:10px;color:var(--text-3);">⚠️ Cek aturan sekolah — bisa berbeda. Hindari baju sewarna background.</span>
    </span></div>
  </div>`;
}

function renderBGRaportPT() {
  const chips = [{ hex: '#FF0000', name: 'Merah' }, { hex: '#0000FF', name: 'Biru' }, { hex: '#FFFFFF', name: 'Putih' }];
  return `<div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <div class="color-row" style="margin-bottom:8px;">${renderChipsStatic(chips)}</div>
    <div class="note-box"><span class="note-icon">📋</span><span style="font-size:11px;line-height:1.7;">
      🟥 Merah / 🟦 Biru — paling umum, sesuaikan warna RGB kampus<br>
      ⬜ Putih — beberapa kampus menggunakan putih<br>
      <span style="font-size:10px;color:var(--text-3);">⚠️ Cek buku panduan akademik atau TU kampus untuk memastikan.</span>
    </span></div>
  </div>`;
}

function renderOpsiBajuIjazahPT() {
  return `<div class="opt-group">
    <div class="opt-label">Pakaian</div>
    <select class="opt-select" id="baju-dokumen" onchange="onBajuDokumenChange(this)">
      <option value="existing">Pakai baju yang sudah ada</option>
      <optgroup label="Pria">
        <option value="almamater_putih">Kemeja Putih + Jas Almamater</option>
        <option value="jas_dasi_pt">Jas Formal + Dasi</option>
      </optgroup>
      <optgroup label="Wanita">
        <option value="blus_almamater">Blus + Jas Almamater</option>
        <option value="kebaya_pt">Kebaya Formal</option>
        <option value="gamis_formal_pt">Busana Muslimah Formal</option>
      </optgroup>
    </select>
  </div>`;
}

function renderOpsiJenisOutfit() {
  return `<div class="opt-group">
    <div class="opt-label">Jenis Perubahan</div>
    <select class="opt-select" id="outfit-jenis" onchange="renderOutfitSubOptions()">
      <optgroup label="Formal">
        <option value="formal">Pakaian Formal (jas, kemeja, blazer, batik)</option>
      </optgroup>
      <optgroup label="Kasual & Urban">
        <option value="kasual">Kasual (kaos, hoodie, jaket jeans)</option>
        <option value="streetwear">Streetwear / Urban Style</option>
      </optgroup>
      <optgroup label="Tradisional & Adat">
        <option value="tradisional">Pakaian Adat / Tradisional Indonesia</option>
      </optgroup>
      <optgroup label="Referensi">
        <option value="referensi">Dari Foto Referensi (bebas)</option>
      </optgroup>
      <optgroup label="Seragam">
        <option value="seragam">Seragam Sekolah (SD/SMP/SMA/Pramuka...)</option>
        <option value="tni">Seragam Dinas (TNI/Polri/Satpam)</option>
        <option value="nakes">Seragam Medis (Dokter/Nakes)</option>
      </optgroup>
      <optgroup label="Pakaian Khusus">
        <option value="umroh">Pakaian Umroh / Haji</option>
      </optgroup>
    </select>
  </div>
  <div id="outfit-sub-options"></div>`;
}

function renderOutfitSubOptions() {
  const jenis = document.getElementById('outfit-jenis')?.value || 'formal';
  const container = document.getElementById('outfit-sub-options');
  if (!container) return;
  clearUploadNote();

  if (jenis === 'formal') {
    container.innerHTML = `
      <div class="opt-group">
        <div class="opt-label">Pilihan Pakaian</div>
        <select class="opt-select" id="outfit-formal-type">
          <option value="jas formal hitam dengan dasi">Jas formal + dasi</option>
          <option value="kemeja putih formal berkerah">Kemeja putih formal</option>
          <option value="kemeja batik formal">Kemeja batik formal</option>
          <option value="seragam CPNS / ASN">Seragam CPNS/ASN</option>
          <option value="kebaya formal wanita">Kebaya formal</option>
        </select>
      </div>
      ${renderOpsiGender()}
      ${renderOpsiBackgroundOutfit('full')}
      ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: jas hitam dasi merah, kemeja putih polos')}`;
  } else if (jenis === 'seragam') {
    container.innerHTML = `
      ${renderOpsiSeragamSekolah()}
      ${renderOpsiGender()}
      ${renderOpsiBackgroundOutfit('seragam')}
      ${renderBtnCariReferensi('seragam')}
      ${renderOpsiExtra('Catatan tambahan (opsional)', 'Contoh: lengkap dengan atribut, dasi, badge, nama sekolah')}`;
    setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>2 foto</strong> ke platform AI: <strong>(1)</strong> foto orang, <strong>(2)</strong> foto referensi seragam yang diinginkan.</span></div>`);
  } else if (jenis === 'tni') {
    container.innerHTML = `
      ${renderOpsiSeragamTNI()}
      ${renderOpsiGender()}
      ${renderOpsiBackground()}
      ${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: dengan topi dinas, lencana tertentu')}`;
    renderColorChips();
  } else if (jenis === 'nakes') {
    container.innerHTML = `
      ${renderOpsiSeragamNakes()}
      ${renderOpsiGender()}
      ${renderOpsiBackground()}
      ${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: dengan stetoskop, name tag rumah sakit')}`;
    renderColorChips();
  } else if (jenis === 'umroh') {
    container.innerHTML = `
      ${renderOpsiGender()}
      ${renderOpsiBackgroundOutfit('full')}
      ${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: ekspresi tenang dan khidmat')}`;
  } else if (jenis === 'kasual') {
    container.innerHTML = `
      <div class="opt-group">
        <div class="opt-label">Pilihan Pakaian Kasual</div>
        <select class="opt-select" id="outfit-kasual-type">
          <option value="plain white t-shirt (kaos putih polos), casual and clean">Kaos Putih Polos</option>
          <option value="plain black t-shirt (kaos hitam polos), casual">Kaos Hitam Polos</option>
          <option value="plain gray t-shirt, casual everyday wear">Kaos Abu-abu Polos</option>
          <option value="oversized graphic t-shirt, urban casual style">Kaos Oversize / Graphic Tee</option>
          <option value="hoodie sweatshirt, zip-up or pullover, casual and cozy">Hoodie / Sweatshirt</option>
          <option value="denim jacket over a simple t-shirt, casual layered look">Jaket Jeans (Denim Jacket)</option>
          <option value="casual polo shirt, neat and smart-casual">Polo Shirt Kasual</option>
          <option value="flannel shirt (kemeja flanel), casual checkered pattern">Kemeja Flanel Kotak-kotak</option>
          <option value="casual linen shirt (kemeja linen), relaxed summer look">Kemeja Linen / Santai</option>
        </select>
      </div>
      ${renderOpsiGender()}
      ${renderOpsiBackgroundOutfit('full')}
      ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: kaos warna biru dongker, hoodie abu-abu dengan kantong depan')}`;
  } else if (jenis === 'streetwear') {
    container.innerHTML = `
      <div class="opt-group">
        <div class="opt-label">Pilihan Streetwear</div>
        <select class="opt-select" id="outfit-street-type">
          <option value="streetwear hoodie with bold graphic print, oversized fit, urban style">Hoodie Streetwear Graphic Oversized</option>
          <option value="varsity jacket (jaket varsity), athletic college style with contrasting sleeves">Varsity Jacket / Baseball Jacket</option>
          <option value="bomber jacket in solid color, casual urban style">Bomber Jacket</option>
          <option value="leather jacket, classic rock or biker style, edgy and cool">Leather Jacket (Jaket Kulit)</option>
          <option value="tracksuit / jogger set, modern athletic streetwear">Tracksuit / Joger Set</option>
          <option value="sleeveless tank top with gym-style physique, athletic streetwear look">Tank Top / Singlet Gym</option>
          <option value="techwear outfit — dark tactical-style with multiple pockets and functional aesthetic">Techwear — Dark Tactical Style</option>
        </select>
      </div>
      ${renderOpsiGender()}
      ${renderOpsiBackgroundOutfit('full')}
      ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: warna hitam semua, tambah patch/logo di jaket')}`;
  } else if (jenis === 'tradisional') {
    container.innerHTML = `
      <div class="opt-group">
        <div class="opt-label">Pakaian Adat / Tradisional</div>
        <select class="opt-select" id="outfit-tradisional-type">
          <optgroup label="Nasional">
            <option value="formal batik dress shirt (kemeja batik tulis Jawa), properly worn, neat and cultural">Batik Tulis — Kemeja Formal</option>
            <option value="Javanese traditional blangkon headwrap with formal Javanese attire (beskap / surjan)">Beskap / Surjan Jawa (Lengkap Blangkon)</option>
            <option value="formal Indonesian national dress — white formal shirt with traditional batik sarong for men or formal kebaya for women">Pakaian Nasional Formal</option>
          </optgroup>
          <optgroup label="Wanita">
            <option value="formal kebaya with batik or plain cloth skirt, elegant traditional Javanese attire">Kebaya Formal (Jawa / Nasional)</option>
            <option value="kebaya encim — Peranakan-style kebaya with embroidered flowers, colorful and delicate">Kebaya Encim — Peranakan</option>
            <option value="baju kurung — Malay/Minang traditional long-sleeve modest blouse with matching skirt">Baju Kurung — Melayu / Minang</option>
            <option value="Balinese ceremonial dress — lace blouse (kebaya Bali) with batik sarong and sash (kain and selendang)">Kebaya Bali + Kain Sarong</option>
            <option value="Sundanese kebaya (kebaya Sunda) with colorful batik or plain cloth skirt">Kebaya Sunda</option>
          </optgroup>
          <optgroup label="Pria Daerah">
            <option value="Minangkabau traditional outfit — baju taluak belango with songket sarong and destar headwrap">Baju Adat Minangkabau</option>
            <option value="Batak traditional ulos cloth worn as shoulder wrap over formal shirt">Ulos Batak — Kain Selendang</option>
            <option value="Bugis traditional baju bodo or Sulawesi ceremonial outfit">Baju Adat Sulawesi / Bugis</option>
          </optgroup>
        </select>
      </div>
      ${renderOpsiGender()}
      ${renderOpsiBackgroundOutfit('full')}
      ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: warna kebaya putih, batik motif parang, lengkap dengan aksesori')}`;
  } else {
    container.innerHTML = `
      ${renderOpsiBackgroundOutfit('full')}
      ${renderBtnCariReferensi('referensi')}
      ${renderOpsiExtra('Catatan tambahan (opsional)', 'Contoh: ambil warnanya saja, pakaian formal, warna biru dongker')}`;
    setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>2 foto</strong> ke platform AI: <strong>(1)</strong> foto orang, <strong>(2)</strong> foto referensi baju yang diinginkan.</span></div>`);
  }
}

function renderOpsiJenjang() {
  return `<div class="opt-group">
    <div class="opt-label">Jenjang Pendidikan</div>
    <select class="opt-select" id="jenjang">
      <option value="Sekolah Dasar (SD)">SD — Sekolah Dasar</option>
      <option value="Sekolah Menengah Pertama (SMP)">SMP — Sekolah Menengah Pertama</option>
      <option value="Sekolah Menengah Atas / Kejuruan (SMA/SMK)" selected>SMA / SMK</option>
      <option value="Diploma (D3/D4)">Diploma (D3/D4)</option>
      <option value="Sarjana (S1)">Sarjana S1</option>
      <option value="Pascasarjana (S2/S3)">Pascasarjana S2/S3</option>
    </select>
  </div>`;
}

function renderOpsiToga() {
  return `<div class="opt-group">
    <div class="opt-label">Warna Toga / Jubah</div>
    <div class="opt-hint">Sesuaikan dengan ketentuan kampus kamu</div>
    <select class="opt-select" id="toga-color">
      <option value="black">Hitam (paling umum)</option>
      <option value="dark red / maroon">Merah Tua / Maroon</option>
      <option value="dark blue / navy">Biru Tua / Navy</option>
      <option value="dark green">Hijau Tua</option>
      <option value="purple">Ungu</option>
      <option value="yellow gold">Kuning Gold</option>
    </select>
  </div>`;
}

function renderOpsiLinkedIn() {
  return `<div class="opt-group">
    <div class="opt-label">Background</div>
    <select class="opt-select" id="linkedin-bg">
      <option value="clean white studio background">Putih studio (klasik)</option>
      <option value="soft light gray studio background" selected>Abu-abu lembut (modern, paling umum)</option>
      <option value="soft gradient light blue professional background">Biru muda gradient (fresh)</option>
      <option value="modern office environment with soft natural blur">Kantor modern (blur natural)</option>
      <option value="outdoor professional setting with soft bokeh">Outdoor profesional (bokeh)</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Pose</div>
    <select class="opt-select" id="linkedin-pose">
      <option value="facing directly forward, eyes level at camera, natural friendly smile">Hadap depan — senyum natural</option>
      <option value="slight 45-degree angle toward camera, confident and approachable expression, natural friendly smile">Sedikit menyamping 45° — lebih karismatik</option>
    </select>
  </div>
  ${renderOpsiGender()}
  ${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: blazer navy, background abu-abu terang')}`;
}

function renderOpsiSeragamTNI() {
  return `<div class="opt-group">
    <div class="opt-label">Jenis Seragam</div>
    <select class="opt-select" id="uniform-tni">
      <option value="TNI Angkatan Darat (Indonesian Army) formal dress uniform">TNI Angkatan Darat (AD)</option>
      <option value="TNI Angkatan Laut (Indonesian Navy) formal dress uniform">TNI Angkatan Laut (AL)</option>
      <option value="TNI Angkatan Udara (Indonesian Air Force) formal dress uniform">TNI Angkatan Udara (AU)</option>
      <option value="Indonesian National Police (Polri) formal dress uniform">Polri — Kepolisian RI</option>
      <option value="formal security guard (Satpam) uniform, standard Indonesian style">Satpam / Security</option>
      <option value="Satpol PP (Civil Service Police Unit) formal uniform">Satpol PP</option>
    </select>
  </div>`;
}

function renderOpsiSeragamNakes() {
  return `<div class="opt-group">
    <div class="opt-label">Jenis Seragam Medis</div>
    <select class="opt-select" id="uniform-nakes">
      <option value="white doctor coat (jas dokter) worn over formal clothing with collar shirt">Dokter — Jas Putih</option>
      <option value="nurse uniform (seragam perawat) in standard hospital colors">Perawat</option>
      <option value="midwife uniform (seragam bidan)">Bidan</option>
      <option value="pharmacist coat (jas apoteker)">Apoteker</option>
      <option value="medical technician or general healthcare worker uniform">Tenaga Medis Lainnya</option>
    </select>
  </div>`;
}

function renderOpsiSeragamSekolah() {
  const opts = Object.entries(SERAGAM_OPTIONS)
    .map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  return `<div class="opt-group">
    <div class="opt-label">Jenis Seragam</div>
    <select class="opt-select" id="seragam-sekolah">${opts}</select>
  </div>`;
}

function renderOpsiHeadwear() {
  return `<div class="opt-group">
    <div class="opt-label">Jenis Penutup Kepala</div>
    <select class="opt-select" id="headwear-type">
      <optgroup label="Keagamaan & Budaya">
        <option value="a neat formal hijab with a solid neutral color, properly and neatly pinned">Hijab (formal, rapi)</option>
        <option value="a traditional peci / kopiah (Indonesian black velvet cap)">Peci / Kopiah</option>
        <option value="a white Islamic head wrap / sorban wrapped neatly and properly">Sorban / Turban</option>
        <option value="a clean white Hajj / Umroh skullcap (kupluk haji), neatly fitted">Kupluk Haji / Umroh</option>
      </optgroup>
      <optgroup label="Akademik & Profesional">
        <option value="a black graduation mortarboard (topi toga wisuda) positioned correctly">Toga — Topi Wisuda</option>
        <option value="TNI Angkatan Darat (Indonesian Army) regulation beret">Baret TNI AD</option>
        <option value="Indonesian National Police (Polri) regulation dress cap">Topi Polri</option>
        <option value="nurse cap (kap perawat), clean white, neatly placed">Kap Perawat</option>
      </optgroup>
      <optgroup label="Topi Kasual & Gaya">
        <option value="a classic black baseball cap worn forward, casual everyday style">Baseball Cap (Hitam)</option>
        <option value="a stylish snapback cap worn forward, urban streetwear style">Snapback Streetwear</option>
        <option value="a cozy knitted beanie / wool cap pulled over the head, casual winter style">Beanie / Kupluk Rajut</option>
        <option value="an elegant wide-brim fedora hat, fashionable and bold">Fedora Elegan</option>
        <option value="a stylish French beret (baret seni) tilted naturally to the side">Baret Seni</option>
        <option value="a wide-brim straw sun hat, casual outdoor summer style">Topi Pantai / Sun Hat</option>
        <option value="a bucket hat, casual relaxed streetwear style">Bucket Hat</option>
      </optgroup>
    </select>
  </div>`;
}

function renderOpsiAksiHeadwear() {
  return `<div class="opt-group">
    <div class="opt-label">Aksi yang Diinginkan</div>
    <select class="opt-select" id="headwear-action">
      <option value="tambah">Tambah headwear (saat ini belum pakai)</option>
      <option value="ganti">Ganti headwear (sudah pakai, ingin diganti)</option>
    </select>
  </div>`;
}

/* ════════════════════════════════════
   VALIDASI SEBELUM GENERATE
════════════════════════════════════ */
function isReadyToGenerate() {
  if (!currentMod) return false;

  if (currentMod === 'pasfoto') {
    const tujuan = document.getElementById('tujuan-dokumen')?.value;
    if (!tujuan) return false;

    // Validasi baju
    if (['raport_sek', 'raport_pt', 'dinas'].includes(tujuan)) {
      if (!document.getElementById('baju-dokumen')?.value) return false;
    } else if (tujuan === 'skck') {
      const kat = document.getElementById('baju-kategori')?.value;
      if (!kat) return false;
      if (kat !== 'existing' && !document.getElementById('baju-dokumen')?.value) return false;
    } else if (!['kua', 'wisuda', 'cpns', 'linkedin'].includes(tujuan)) {
      const kat = document.getElementById('baju-kategori')?.value;
      if (!kat) return false;
      if (kat !== 'existing' && !document.getElementById('baju-dokumen')?.value) return false;
    }

    // Validasi jenis kelamin (tidak berlaku untuk kua & linkedin)
    if (!['kua', 'linkedin'].includes(tujuan)) {
      const genderWrap = document.getElementById('gender-wrap');
      if (genderWrap && genderWrap.style.display === 'none') return false;
      if (!document.getElementById('gender')?.value) return false;
    }

    // Validasi warna BG (harus sudah dipilih — bg-last-wrap harus visible)
    const bgLastWrap = document.getElementById('bg-last-wrap');
    if (bgLastWrap && bgLastWrap.style.display === 'none') return false;

    return true;
  }

  if (currentMod === 'listing_produk') {
    return !!document.getElementById('nama-barang')?.value?.trim();
  }
  if (currentMod === 'cyberpunk_portrait') {
    return !!document.getElementById('cyber-style')?.value;
  }
  if (currentMod === 'cyber_scene') {
    return !!document.getElementById('cscene-subject')?.value;
  }

  return true;
}

function getMissingHint() {
  if (currentMod === 'pasfoto') {
    if (!document.getElementById('tujuan-dokumen')?.value) return '⚠️ Pilih tujuan foto dulu';
    const tujuan = document.getElementById('tujuan-dokumen').value;

    if (tujuan === 'raport_sek') {
      if (!document.getElementById('baju-dokumen')?.value) return '⚠️ Pilih seragam sekolah';
    } else if (tujuan === 'raport_pt') {
      if (!document.getElementById('baju-dokumen')?.value) return '⚠️ Pilih jenis pakaian';
    } else if (tujuan === 'dinas') {
      if (!document.getElementById('baju-dokumen')?.value) return '⚠️ Pilih seragam dinas';
    } else if (tujuan === 'skck') {
      if (!document.getElementById('baju-kategori')?.value) return '⚠️ Pilih jenis pakaian';
      if (document.getElementById('baju-kategori')?.value !== 'existing' &&
          !document.getElementById('baju-dokumen')?.value) return '⚠️ Pilih pilihan pakaian';
    } else if (!['kua', 'wisuda', 'cpns', 'linkedin'].includes(tujuan)) {
      if (!document.getElementById('baju-kategori')?.value) return '⚠️ Pilih jenis pakaian';
      if (document.getElementById('baju-kategori').value !== 'existing' &&
          !document.getElementById('baju-dokumen')?.value) return '⚠️ Pilih pilihan pakaian';
    }

    if (!['kua', 'linkedin'].includes(tujuan)) {
      const genderWrap = document.getElementById('gender-wrap');
      if (genderWrap && genderWrap.style.display === 'none') return '⚠️ Pilih jenis kelamin';
      if (!document.getElementById('gender')?.value) return '⚠️ Pilih jenis kelamin';
    }

    const bgLastWrap = document.getElementById('bg-last-wrap');
    if (bgLastWrap && bgLastWrap.style.display === 'none') return '⚠️ Pilih warna background';
  }
  if (currentMod === 'listing_produk') {
    if (!document.getElementById('nama-barang')?.value?.trim()) return '⚠️ Isi nama barang dulu';
  }
  if (currentMod === 'cyberpunk_portrait') {
    if (!document.getElementById('cyber-style')?.value) return '⚡ Pilih gaya visual dulu';
  }
  if (currentMod === 'cyber_scene') {
    if (!document.getElementById('cscene-subject')?.value) return '⚡ Pilih subjek foto dulu';
  }
  return 'Atur opsi lalu klik Generate Prompt';
}

function checkReady() {
  const btn  = document.querySelector('.btn-proses');
  const hint = document.getElementById('action-hint');
  if (!btn) return;
  const ok = isReadyToGenerate();
  btn.disabled = !ok;
  if (hint) {
    hint.textContent = ok ? 'Siap — klik Generate Prompt' : getMissingHint();
    hint.style.color = ok ? '' : 'var(--red)';
    hint.style.fontWeight = ok ? '' : '600';
  }
}

/* ════════════════════════════════════
   GENERATE PROMPT
════════════════════════════════════ */
function generatePrompt() {
  if (!currentMod) { showToast('Pilih modul terlebih dahulu.', 'error'); return; }

  const builtPrompt = MODS[currentMod].prompt();
  if (!builtPrompt) { showToast('Lengkapi semua pilihan terlebih dahulu.', 'error'); return; }

  const btn = document.querySelector('.btn-proses');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Menyusun...'; }

  showLoadingBar(() => {
    // Universal: inject canvas rule if not already present in prompt
    const _hasCropRule = builtPrompt.includes('15% extra blank canvas') || builtPrompt.includes('15% empty')
      || builtPrompt.includes('expand the canvas by exactly') || builtPrompt.includes('White frame expansion');
    generatedPrompt = _hasCropRule
      ? builtPrompt
      : builtPrompt.trimEnd() + '\n\n' + CROP_RULE;
    if (btn) { btn.disabled = false; btn.innerHTML = '✨ Generate Prompt'; }

    const outputPanel = document.getElementById('prompt-output');
    const promptText  = document.getElementById('prompt-text');
    if (outputPanel && promptText) {
      promptText.textContent = generatedPrompt;
      outputPanel.style.display = '';
      const actionsWrap = document.getElementById('result-actions-wrap');
      if (actionsWrap) actionsWrap.style.display = '';
      // Update prompt meta: char + word count
      const metaEl = document.getElementById('prompt-meta');
      const charEl = document.getElementById('prompt-char-count');
      const wordEl = document.getElementById('prompt-word-count');
      if (metaEl && charEl && wordEl) {
        charEl.textContent = generatedPrompt.length.toLocaleString('id') + ' karakter';
        wordEl.textContent = generatedPrompt.split(/\s+/).filter(Boolean).length.toLocaleString('id') + ' kata';
        metaEl.style.display = 'flex';
      }
    }
    // Inject tombol cari Google hasil generate — modul outfit (semua jenis)
    if (currentMod === 'outfit') {
      const resultActions = document.querySelector('#result-actions-wrap .result-actions');
      if (resultActions && !resultActions.querySelector('.btn-result-search')) {
        const jenis = document.getElementById('outfit-jenis')?.value || 'formal';
        let query = '', label = '';
        if (jenis === 'seragam') {
          const key       = document.getElementById('seragam-sekolah')?.value || 'sma';
          const gender    = document.getElementById('gender')?.value || 'pria';
          const genderStr = { pria: 'laki-laki', wanita: 'perempuan', 'wanita-hijab': 'perempuan berhijab' }[gender] || 'laki-laki';
          query = encodeURIComponent(`${SERAGAM_OPTIONS[key]?.search || 'seragam sekolah'} ${genderStr}`);
          label = SERAGAM_OPTIONS[key]?.label || 'Seragam';
        } else if (jenis === 'tni') {
          const uTni = document.getElementById('uniform-tni')?.value || 'seragam dinas';
          query = encodeURIComponent(`${uTni} foto resmi`);
          label = 'Seragam Dinas';
        } else if (jenis === 'nakes') {
          const uNakes = document.getElementById('uniform-nakes')?.value || 'seragam medis';
          query = encodeURIComponent(`${uNakes} foto resmi`);
          label = 'Seragam Medis';
        } else if (jenis === 'umroh') {
          const gUmroh = document.getElementById('gender')?.value || 'pria';
          query = encodeURIComponent(gUmroh === 'pria' ? 'pakaian ihram umroh pria' : 'abaya putih mukena umroh wanita');
          label = 'Pakaian Umroh';
        } else if (jenis === 'referensi') {
          const extra = document.getElementById('extra')?.value?.trim();
          query = encodeURIComponent(extra ? `referensi baju ${extra}` : 'referensi baju formal indonesia');
          label = 'Referensi Baju';
        } else {
          const outfitType = document.getElementById('outfit-formal-type')?.value || '';
          query = encodeURIComponent(`${outfitType} pria wanita formal`);
          label = outfitType || 'Pakaian Formal';
        }
        if (query) {
          const btn = document.createElement('button');
          btn.className = 'btn-result-search';
          btn.innerHTML = `🔍 Lihat referensi ${label}`;
          btn.onclick = () => window.open(`https://www.google.com/search?q=${query}&tbm=isch`, '_blank');
          resultActions.appendChild(btn);
        }
      }
    }
    // B3: advance step indicator ke Generate ✓ → Launch aktif
    document.getElementById('wss-atur')?.classList.remove('ws-step--active');
    document.getElementById('wss-atur')?.classList.add('ws-step--done');
    document.getElementById('wss-gen')?.classList.add('ws-step--done');
    document.getElementById('wss-launch')?.classList.add('ws-step--active');
    showToast('Prompt siap! Pilih platform untuk mulai.', 'success');
    saveToHistory(currentMod, MODS[currentMod].title, generatedPrompt);
    renderHistoryPanel();
  });
}

// showLoadingBar — di app-core.js

function proses() { generatePrompt(); }

/* ════════════════════════════════════
   DEV CHOICE — CYBERPUNK PORTRAIT
════════════════════════════════════ */
function renderOpsiCyberpunkPortrait() {
  const chips = [
    { label: '🏙️ Blade Runner 2049', set: { 'cyber-style': 'blade_runner', 'cyber-augment': 'none', 'cyber-neon': 'amber_blue', 'cyber-bg': 'city_rain' } },
    { label: '🔵 Neon City Night',   set: { 'cyber-style': 'neon_city',    'cyber-augment': 'none', 'cyber-neon': 'blue_purple', 'cyber-bg': 'city_aerial' } },
    { label: '🤖 AI Augmented',      set: { 'cyber-style': 'cyberpunk',    'cyber-augment': 'cyber_eye', 'cyber-neon': 'cyan_green', 'cyber-bg': 'street' } },
    { label: '⚡ Super AI Entity',   set: { 'cyber-style': 'super_ai',     'cyber-augment': 'full_cyber', 'cyber-neon': 'white_gold', 'cyber-bg': 'data_space' } },
    { label: '🎌 Ghost in Shell',    set: { 'cyber-style': 'ghost_in_shell','cyber-augment': 'hologram',  'cyber-neon': 'teal',       'cyber-bg': 'city_rain' } },
    { label: '🌌 Year 3000',         set: { 'cyber-style': 'far_future',   'cyber-augment': 'alien_tech', 'cyber-neon': 'rainbow',    'cyber-bg': 'space' } },
  ];
  return renderPresetChips(chips) + `
  <div class="opt-group">
    <div class="opt-label">Gaya Visual</div>
    <select class="opt-select" id="cyber-style" onchange="checkReady()">
      <option value="">— Pilih Gaya Visual —</option>
      <option value="blade_runner">Blade Runner 2049 — film noir + neon rain + amber haze</option>
      <option value="neon_city">Neon City Night — cyberpunk 2077 neon glow streets</option>
      <option value="cyberpunk">Classic Cyberpunk — dark dystopian neon underground</option>
      <option value="ghost_in_shell">Ghost in the Shell — sleek blue holographic tech</option>
      <option value="super_ai">Super AI Entity — transcendent digital being of light</option>
      <option value="far_future">Year 3000 — post-human advanced civilization</option>
      <option value="tron">Tron Legacy — glowing grid geometric digital world</option>
      <option value="mad_max_future">Wasteland Future — post-apocalyptic tech warrior</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">AI Augmentation</div>
    <select class="opt-select" id="cyber-augment" onchange="checkReady()">
      <option value="none">Tidak ada — hanya environment futuristik</option>
      <option value="cyber_eye">Cyber Eye — satu mata diganti implant cybernetic glowing</option>
      <option value="partial">Partial Cyborg — sebagian wajah/tubuh ter-augmentasi logam & circuit</option>
      <option value="full_cyber">Full Cyborg — seluruh penampilan cybernetic, wajah tetap asli</option>
      <option value="hologram">Hologram Overlay — data stream & partikel digital menyelimuti tubuh</option>
      <option value="alien_tech">Alien Tech — augmentasi bukan dari bumi, bioluminescent</option>
      <option value="ai_threads">AI Threads — benang neural link dan data veins di kulit</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Tema Warna Neon</div>
    <select class="opt-select" id="cyber-neon" onchange="checkReady()">
      <option value="amber_blue">Amber &amp; Blue — warna khas Blade Runner</option>
      <option value="cyan_green">Cyan &amp; Green — klasik cyberpunk terminal</option>
      <option value="blue_purple">Blue &amp; Purple — neon kota malam</option>
      <option value="red_orange">Red &amp; Orange — panas &amp; bahaya</option>
      <option value="teal">Teal — Ghost in the Shell hologram</option>
      <option value="white_gold">White &amp; Gold — super AI transcendent</option>
      <option value="rainbow">Full Spectrum — semua warna neon</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Setting Latar</div>
    <select class="opt-select" id="cyber-bg" onchange="checkReady()">
      <option value="city_rain">Kota neon malam hujan — jalanan basah, refleksi lampu</option>
      <option value="city_aerial">Kota futuristik dari atas — gedung tinggi, hover cars</option>
      <option value="data_space">Ruang data / digital realm — matrix of code and light</option>
      <option value="lab">Laboratorium AI canggih — white futuristic clean tech lab</option>
      <option value="space">Luar angkasa / orbit — star field, space station</option>
      <option value="street">Jalanan bawah tanah — underground neon market</option>
      <option value="abstract">Abstrak digital — light beams, geometric neon grid</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Catatan Tambahan (opsional)</div>
    <input type="text" class="opt-input" id="cyber-extra" placeholder="Contoh: jaket kulit hitam, rambut silver, hujan lebat..." oninput="checkReady()">
  </div>`;
}

function buildPromptCyberpunkPortrait() {
  const style   = document.getElementById('cyber-style')?.value || '';
  const augment = document.getElementById('cyber-augment')?.value || 'none';
  const neon    = document.getElementById('cyber-neon')?.value || 'amber_blue';
  const bg      = document.getElementById('cyber-bg')?.value || 'city_rain';
  const extra   = document.getElementById('cyber-extra')?.value?.trim() || '';

  if (!style) return null;

  const styleDesc = {
    blade_runner:   'Blade Runner 2049 cinematic — perpetual acid rain, warm amber haze mixed with cold blue neon, wet reflective streets, noir detective atmosphere, dramatic God-rays through industrial smog, Villeneuve/Deakins cinematography',
    neon_city:      'Cyberpunk 2077 neon megacity — ultra-saturated neon signs in multiple languages, rain-soaked urban sprawl, holographic advertisements, overcrowded lower-city underglow, gritty yet spectacular',
    cyberpunk:      'Classic cyberpunk dystopia — dark underground aesthetic, electric neon contrasts against absolute darkness, tech-noir grime, chrome and concrete, inequality made visual',
    ghost_in_shell: 'Ghost in the Shell visual style — sleek Japanese-inspired tech aesthetics, translucent blue holographic interfaces, elegant cyber body geometry, cool teal and white palette, Section 9 operative energy',
    super_ai:       'Transcendent Super AI entity — being of pure digital consciousness, swirling streams of golden data code, quantum neural patterns blooming outward, white and gold luminous energy, godlike digital presence',
    far_future:     'Year 3000 post-human civilization — technology so advanced it is indistinguishable from nature, bio-luminescent structures, organic-tech fusion, evolved humanity beyond recognition, transcendent materials',
    tron:           'Tron Legacy digital world — perfect black void background, electric blue and white circuitry lines, geometric glowing grid, identity disc aesthetic, vectorized reality',
    mad_max_future: 'Post-apocalyptic tech warrior — scorched wasteland survivor with salvaged cybernetic gear, diesel-punk meets digital-punk, war-scarred world with scavenged hyper-advanced technology',
  };

  const augDesc = {
    none:       '',
    cyber_eye:  'One eye replaced by a glowing cybernetic optical implant — iris replaced by a luminous targeting lens, micro-circuit etchings visible, the implant eye glows intensely with neon energy.',
    partial:    'Partial cyborg augmentation — portions of the jaw, temple, or shoulder show exposed metallic substructure, micro-circuits embedded under semi-transparent synthetic skin layers, nanowire threads at the edges of organic tissue.',
    full_cyber: 'Full cybernetic transformation — the figure wears form-fitting smart armor with embedded circuitry, neural interface ports on neck, hands show titanium exo-skeleton plating, quantum processor embedded at temple. THE FACE remains 100% unchanged.',
    hologram:   'Semi-transparent holographic data streams orbit the figure, floating UI panels and code fragments surround them, light refracts through the body like a digital ghost, luminous particle data flows emanate outward.',
    alien_tech: 'Alien-origin cybernetic augments of unknown design — bioluminescent non-human technology seamlessly grafted, emanating shifting colors not found in nature, impossible geometry, clearly not from Earth.',
    ai_threads: 'Luminous neural-link data threads visibly course through the skin like glowing veins, multiple hairline cables connect to a small port behind the ear, a quantum chip is embedded at the temple glowing softly.',
  };

  const neonDesc = {
    amber_blue:  'dominant warm amber and deep cobalt blue neon color palette',
    cyan_green:  'electric cyan and toxic green neon tones throughout',
    blue_purple: 'deep electric blue and violet-purple neon fills the scene',
    red_orange:  'hot red and molten orange neon — danger and heat',
    teal:        'cool aquamarine and teal holographic palette',
    white_gold:  'brilliant white light with cascading golden energy accents',
    rainbow:     'full-spectrum neon rainbow blazing across every surface',
  };

  const bgDesc = {
    city_rain:   'rain-slicked mega-city streets at night — neon signs reflect on every wet surface, layered city architecture disappears into smoggy sky, flying vehicles visible in mid-distance, holographic ads cast colored light over the scene',
    city_aerial: 'aerial view of a vast futuristic megacity — impossibly tall arcologies, streams of hover-car traffic at multiple altitude lanes, city lights stretching to horizon, cloud layer below',
    data_space:  'abstract digital data realm — cascading code streams, holographic data matrices, encrypted floating cubes, infinite digital space with no horizon',
    lab:         'advanced AI research facility — pristine white-and-chrome laboratory, transparent computing surfaces, robotic precision arms, server core towers humming with blue energy',
    space:       'deep space orbital setting — Earth curving below, stars blazing in absolute black, a space station visible in the distance, zero-gravity silence',
    street:      'underground neon market street — covered with corrugated metal roof, packed vendor stalls lit entirely by neon signs, rain dripping through gaps, shadows and characters',
    abstract:    'pure geometric neon abstract — glowing grid lines, light beams, fractal neon patterns, no specific location — pure aesthetic cyberpunk graphic energy',
  };

  const augStr = augDesc[augment] ? `\n\n🔩 CYBERNETIC AUGMENTATION:\n${augDesc[augment]}` : '';
  const extraStr = extra ? `\n\n📝 ADDITIONAL DIRECTION: ${extra}` : '';

  return `[CYBERPUNK PORTRAIT — DEV CHOICE]

You are a world-class VFX compositor and digital artist specializing in cinematic science fiction. Transform this portrait into a breathtaking cyberpunk / futuristic artwork.

🎬 VISUAL STYLE:
${styleDesc[style]}

🌈 NEON COLOR PALETTE:
${neonDesc[neon]}

🌆 BACKGROUND / SETTING:
${bgDesc[bg]}
${augStr}

📸 CINEMATIC COMPOSITION:
- Volumetric light from neon sources — rim lighting, colored fill from environment
- Rain-on-lens micro-droplet effect (subtle)
- Atmospheric haze, smoke, and particle effects
- Cinematic film grain and color grade
- Shallow depth of field — sharp on subject, neon bokeh on background${extraStr}

${WAJAH_RULE}

📐 CANVAS & CROP MARGIN — MANDATORY:
Leave exactly 15% empty dark/black margin on ALL FOUR sides of the output canvas. The entire composition (subject + environment) must be contained within the center 70% of the total canvas. The outer 15% border on each edge must be pure dark void — no visual elements, no subject, no glow effects bleeding to the edge. This border is strictly preserved for post-production cropping.

🎯 FINAL QUALITY TARGET:
- 8K cinematic render quality
- Professional VFX compositor level output — not a filter, a complete world
- Every detail must feel like a real frame from a $200M sci-fi blockbuster
- The subject must look like they BELONG in this world, not composited into it`;
}

/* ════════════════════════════════════
   DEV CHOICE — FUTURE WORLD TRANSFORMER
════════════════════════════════════ */
function renderOpsiCyberScene() {
  const chips = [
    { label: '🚗 Mobil Hover',      set: { 'cscene-subject': 'vehicle_car', 'cscene-era': '2077', 'cscene-style': 'cyberpunk' } },
    { label: '🚀 Pesawat Masa Depan', set: { 'cscene-subject': 'vehicle_air', 'cscene-era': '2150', 'cscene-style': 'sleek_tech' } },
    { label: '🏙️ Mega-City',        set: { 'cscene-subject': 'city',         'cscene-era': '2100', 'cscene-style': 'megacity' } },
    { label: '🤖 Manusia AI',        set: { 'cscene-subject': 'human_ai',     'cscene-era': '2077', 'cscene-style': 'cyberpunk' } },
    { label: '🌆 Bangunan AI',       set: { 'cscene-subject': 'building',     'cscene-era': '2150', 'cscene-style': 'megacity' } },
    { label: '⚔️ Dystopia',          set: { 'cscene-subject': 'environment',  'cscene-era': '2077', 'cscene-style': 'dystopia' } },
  ];
  return renderPresetChips(chips) + `
  <div class="opt-group">
    <div class="opt-label">Subjek di Foto</div>
    <select class="opt-select" id="cscene-subject" onchange="checkReady()">
      <option value="">— Apa yang ada di foto? —</option>
      <option value="vehicle_car">Kendaraan darat — mobil, motor, bus, truk</option>
      <option value="vehicle_air">Kendaraan udara/laut — pesawat, kapal, helikopter</option>
      <option value="building">Bangunan / Gedung / Rumah</option>
      <option value="city">Pemandangan kota / jalan / area publik</option>
      <option value="human_ai">Manusia — jadikan AI agent / robot / cyborg</option>
      <option value="environment">Lingkungan alam — hutan, gunung, pantai</option>
      <option value="interior">Interior ruangan — kantor, rumah, toko</option>
      <option value="object">Objek / benda lainnya</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Era Masa Depan</div>
    <select class="opt-select" id="cscene-era" onchange="checkReady()">
      <option value="2077">2077 — dekat, Blade Runner / Cyberpunk 2077 level</option>
      <option value="2150">2150 — pertengahan, hyper-advanced tapi masih dikenali</option>
      <option value="2300">2300 — jauh, alien-tech level, hampir tidak dikenali</option>
      <option value="3000">3000+ — sangat jauh, beyond human comprehension</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Gaya Futuristik</div>
    <select class="opt-select" id="cscene-style" onchange="checkReady()">
      <option value="cyberpunk">Cyberpunk — neon glow, dark dystopia, gritty mega-city</option>
      <option value="megacity">Megacity Utopia — clean, towering, organized perfection</option>
      <option value="sleek_tech">Sleek Tech — minimalist white future, invisible technology</option>
      <option value="dystopia">Dark Dystopia — war-torn, ruined, military industrial</option>
      <option value="biopunk">Biopunk — organic tech, living machines, bio-luminescent</option>
      <option value="solarpunk">Solarpunk — green sustainable high-tech utopia</option>
      <option value="far_future">Far Future — incomprehensibly advanced, transcendent</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Detail Transformasi (opsional)</div>
    <input type="text" class="opt-input" id="cscene-extra" placeholder="Contoh: warna biru neon, tambah hologram, langit merah dramatis..." oninput="checkReady()">
  </div>`;
}

function buildPromptCyberScene() {
  const subject = document.getElementById('cscene-subject')?.value || '';
  const era     = document.getElementById('cscene-era')?.value || '2077';
  const style   = document.getElementById('cscene-style')?.value || 'cyberpunk';
  const extra   = document.getElementById('cscene-extra')?.value?.trim() || '';

  if (!subject) return null;

  const subjectInstr = {
    vehicle_car:  'Transform this ground vehicle into a futuristic version — hover lift systems (repulsor fields visible beneath), streamlined smart-material body panels, integrated LED light strips flowing along the chassis, holographic instrument cluster visible through windscreen, plasma exhaust ports, color-reactive nano-paint body.',
    vehicle_air:  'Transform this aircraft or watercraft into an advanced future vehicle — anti-gravity propulsion arrays, silent-running sleek composite hull, articulated smart-material control surfaces, integrated AI navigation fins, bio-luminescent running lights, energy shield emitter visible at the bow.',
    building:     'Transform this building into a futuristic structure — integrated clean energy (solar skin panels, micro-wind turbines), smart glass facades with embedded dynamic displays, vertical garden tech, elevated drone docking ports, hover-vehicle landing pads, structural elements that glow with embedded bioluminescence.',
    city:         'Transform this cityscape into a futuristic urban environment — elevated roadways for hover vehicles at multiple altitude levels, pedestrian sky-bridges between towers, massive holographic advertisements visible from kilometers away, automated delivery drone swarms overhead, vegetation integrated into every structure.',
    human_ai:     'Transform this person into a futuristic AI agent or advanced human-AI hybrid — visible neural interface ports, sleek cybernetic armor plating on shoulders and forearms, AI assistant entity manifesting beside them, floating data streams orbiting their form, a glowing HUD visible around their eyes.',
    environment:  'Transform this natural or built environment into a stunning futuristic landscape — technology seamlessly integrated or the entire environment replaced by megastructures, climate-control atmospheric domes, energy collection arrays, alien biomes, terraforming in visible progress.',
    interior:     'Transform this interior space into a futuristic environment — holographic displays replacing solid walls, smart furniture reconfiguring in real-time, ambient AI assistants as floating orbs of light, levitating objects, bioluminescent ambient lighting, tech-organic material seamless integration.',
    object:       'Transform this object into an advanced futuristic version — apply technologies of tomorrow: smart materials, embedded energy generation, wireless connectivity aura, nano-fabrication texture, holographic display projections, quantum-component glow.',
  };

  const eraDesc = {
    '2077': 'Year 2077 — near-future grounded, recognizable technology pushed to extreme. Think Blade Runner 2049, Cyberpunk 2077, Deus Ex Human Revolution. Technology is impressive but clearly descended from today.',
    '2150': 'Year 2150 — mid-future with dramatic technological leaps. AI is fully sentient, space travel routine, energy unlimited, nanotechnology ubiquitous. Objects still recognizable in form but alien in function.',
    '2300': 'Year 2300 — far future. Humanity spans multiple star systems, alien contact established, technology approaches what was once called supernatural. Barely recognizable.',
    '3000': 'Year 3000+ — impossibly advanced post-human civilization existing in multiple dimensions simultaneously. Technology and nature are indistinguishable. The concept of objects barely applies.',
  };

  const styleDesc = {
    cyberpunk:   'Cyberpunk aesthetic — neon lights blazing against absolute darkness, corporate dystopia and underground rebellion coexist, rain-slicked surfaces, holographic ads in every language, overcrowded but spectacular.',
    megacity:    'Megacity utopia — ordered, clean, magnificent beyond imagination, Level 1000 civilization, cooperative global society, gleaming arcology spires, organized hover-transit grids, public green spaces at 500m elevation.',
    sleek_tech:  'Sleek minimalist tech — the aesthetic of absolute perfection. Pure white and chrome, invisible technology, no visible seams or ports. Calm, ordered, everything seamlessly integrated.',
    dystopia:    'Dark dystopia — war-scarred future, military-industrial complex dominates everything, surveillance omnipresent, battle damage alongside hyper-advanced tech, refugees alongside chrome soldiers.',
    biopunk:     'Biopunk organic-tech aesthetic — living machines, grown architecture, organic circuits, flesh seamlessly meeting metal, bio-luminescent organisms as components, wetware computing, breathing buildings.',
    solarpunk:   'Solarpunk — lush and green sustainable future. Solar collection everywhere, ocean-cleanup technology, vertical forest cities integrated with joyful technology, community-centered human-scale civilization.',
    far_future:  'Far future transcendent aesthetic — technology so advanced it appears as magic. Structures exist across dimensions, crystalline megastructures, energy beings coexist with physical, incomprehensible scale and beauty.',
  };

  const hasHuman = subject === 'human_ai';
  const faceRule = hasHuman ? `\n\n${WAJAH_RULE}` : '';
  const extraStr = extra ? `\n\n🎨 ADDITIONAL DIRECTION: ${extra}` : '';

  return `[FUTURE WORLD TRANSFORMER — DEV CHOICE]

You are a master concept artist and VFX supervisor for a $300M science fiction blockbuster. Transform this real-world photograph into a breathtaking vision of the future.

🕰️ ERA:
${eraDesc[era]}

🎨 AESTHETIC STYLE:
${styleDesc[style]}

🔧 TRANSFORMATION:
${subjectInstr[subject]}

📐 VISUAL PRODUCTION:
- Cinematic lighting — multiple colored sources, volumetric atmosphere, dramatic depth
- Smart materials: energy-reactive surfaces, photoluminescent coatings, metamaterials
- Environmental storytelling — small background details that sell the world completely
- Atmospheric haze, particle effects, dynamic weather if appropriate
- Dominant color accent matching the chosen style palette
- 8K cinematic render quality — every pixel intentional${extraStr}${faceRule}

📐 CANVAS & CROP MARGIN — MANDATORY:
Leave exactly 15% empty dark/black margin on ALL FOUR sides of the output canvas. The entire transformed scene must be contained within the center 70% of the total canvas. The outer 15% border on each edge must be pure dark void — no visual elements, no scene content bleeding to the edge. This border is strictly preserved for post-production cropping.

⚡ PRIME DIRECTIVE: The result must look like a REAL FRAME from a critically acclaimed science fiction film. Not a filter. Not a color change. A COMPLETE WORLD TRANSFORMATION that makes the viewer believe this is what this object/place actually looks like in the future.`;
}

/* ════════════════════════════════════
   RESET
════════════════════════════════════ */
function resetWorkspace() {
  generatedPrompt = '';
  selectedColor = '#FF0000';
  if (currentMod) setMod(currentMod);
}
/* alias — index.html masih referensikan ini, dihapus di M2 */
function resetUpload() { resetWorkspace(); }

// launchPlatform, copyPrompt, shareToWhatsApp, getColorName — di app-core.js

/* ════════════════════════════════════
   PROMPT BUILDERS
════════════════════════════════════ */
function getExtra() { return document.getElementById('extra')?.value?.trim() || ''; }
function getGender() { return document.getElementById('gender')?.value || 'pria'; }

function getGenderLabel() {
  const g = getGender();
  if (g === 'wanita-hijab') return 'female (berhijab)';
  if (g === 'wanita') return 'female';
  return 'male';
}

const HIJAB_RULE = `
🧕 HIJAB — ABSOLUTE MANDATORY REQUIREMENT:
The subject is a hijab-wearing Muslim woman. The hijab is a non-negotiable part of her appearance and identity.

☑ HIJAB MUST:
- Fully cover ALL hair — every single strand, from the hairline, temples, sides, to the back of the head
- Cover the neck completely and extend to the upper chest
- Look naturally worn, neatly arranged, and properly fitted — not floating, not misshapen
- Maintain the same color and style throughout the entire image

⛔ FORBIDDEN — ZERO TOLERANCE:
- Showing any hair whatsoever — not at the hairline, not at the temples, not peeking from any edge
- Removing, lifting, shifting, or altering the hijab in any way
- Generating the subject without hijab or with partial hijab, even if the clothing change seems to require it
- Any gap between the hijab edge and the clothing collar that exposes hair or neck

If clothing is being changed: select a style fully compatible with hijab — no strapless, no wide necklines. The hijab stays intact; only the outfit underneath changes.`;

function hijabNote(g) {
  return (g === 'wanita-hijab') ? HIJAB_RULE : '';
}

function hijabSubjectNote(g) {
  return (g === 'wanita-hijab')
    ? 'The subject is a hijab-wearing Muslim woman. '
    : '';
}

function getBajuDokumen() {
  const key = document.getElementById('baju-dokumen')?.value || 'existing';
  const gender = getGender();
  const entry = BAJU_DOKUMEN[key];
  if (!entry) return BAJU_DOKUMEN.existing.prompt_m;
  return (gender === 'wanita' || gender === 'wanita-hijab') ? entry.prompt_f : entry.prompt_m;
}

const CROP_RULE = 'Canvas: add exactly 15% extra blank canvas on ALL FOUR sides beyond the standard portrait framing — subject stays perfectly centered. This margin is intentional; reserved for the client to re-crop and remove any platform watermarks after downloading.';

const PASFOTO_CANVAS_RULE = `OUTPUT FORMAT — MANDATORY:
1. Orientation: VERTICAL PORTRAIT only — the final image MUST be taller than wide. Use a strict 2:3 aspect ratio (width:height), for example 800×1200 px or equivalent. NEVER generate a square (1:1) or landscape/horizontal result — this is a hard requirement.
2. White frame expansion: expand the canvas by exactly 20% on ALL FOUR edges using solid pure WHITE (#FFFFFF) — do not blur, fade, or blend the white border into the photo. The subject must remain perfectly centered within the inner area. This white border is intentional: it is reserved for the user to re-crop and remove any platform watermarks after downloading.`;

const KUA_CANVAS_RULE = `OUTPUT FORMAT — MANDATORY:
1. Orientation: HORIZONTAL LANDSCAPE only — the final image MUST be wider than tall. Use a strict 3:2 aspect ratio (width:height), for example 1500×1000 px or equivalent. NEVER generate a square (1:1) or portrait/vertical result — this is a hard requirement.
2. White frame expansion: expand the canvas by exactly 20% on ALL FOUR edges using solid pure WHITE (#FFFFFF) — do not blur, fade, or blend the white border into the photo. Both subjects must remain perfectly centered within the inner area. This white border is intentional: it is reserved for the user to re-crop and remove any platform watermarks after downloading.`;

const POSE_DOC = 'Body: fully upright — shoulders squared and level, zero body rotation, no angling toward any side. Facing: face EXACTLY forward — looking straight into the camera lens, eyes level, chin neutral, NO head tilt in any direction. Expression: NEUTRAL — mouth gently closed, lips relaxed, no smile, no grimace, no forced expression. Symmetry: subject PERFECTLY CENTERED in frame — equal margin on left and right, equal headroom top and bottom.';

const POSE_LAMARAN = 'Body: fully upright — shoulders squared and level, zero body rotation. Facing: looking straight into the camera lens, eyes level, chin neutral, no head tilt. Expression: NATURAL FRIENDLY SMILE — warm, genuine, approachable, shows confidence; not forced or exaggerated. Symmetry: subject PERFECTLY CENTERED in frame — equal margin on left and right.';

function buildPromptPasFoto() {
  const colorName = getColorName(selectedColor);
  const tujuan    = document.getElementById('tujuan-dokumen')?.value || 'umum';
  const bajuKey   = document.getElementById('baju-dokumen')?.value || 'existing';
  const isSeragam = BAJU_DOKUMEN[bajuKey]?.seragam === true;
  const bajuPrompt = getBajuDokumen();
  const extra     = getExtra();
  const g         = getGender();

  const contexts = {
    ktp:      { intro: 'Edit this photo into a high-quality Indonesian KTP (Kartu Tanda Penduduk / National ID Card) photo.',                                        framing: 'VERTICAL PORTRAIT (2:3) — Frame as a standard ID photo: face centered, eyes looking directly forward and level with the camera, shoulders squared, head occupying 70–80% of the frame height.' },
    sim:      { intro: 'Edit this photo into a high-quality Indonesian SIM (Surat Izin Mengemudi / Driver\'s License) photo.',                                       framing: 'VERTICAL PORTRAIT (2:3) — Frame as a standard ID photo: face centered, eyes looking directly forward and level with the camera, shoulders squared, head occupying 70–80% of the frame height.' },
    paspor:   { intro: 'Edit this photo into a high-quality Indonesian Paspor (Passport RI) photo meeting ICAO/biometric standards.',                               framing: 'VERTICAL PORTRAIT (2:3) — Frame as a standard passport photo: face centered, eyes looking directly forward and level with the camera, shoulders squared, head occupying 70–80% of the frame height.' },
    visa:     { intro: 'Edit this photo into a high-quality international visa application photo.',                                                                  framing: 'VERTICAL PORTRAIT (2:3) — Frame as a standard visa photo: face centered, eyes looking directly forward and level with the camera, both ears must be clearly visible, shoulders squared, head occupying 70–80% of the frame height.' },
    umum:     { intro: 'Edit this photo into a high-quality official ID photo (KTP, SIM, passport, or visa).',                                                      framing: 'VERTICAL PORTRAIT (2:3) — Frame as a standard ID photo: face centered, eyes looking directly forward and level with the camera, shoulders squared, head occupying 70–80% of the frame height.' },
    lamaran:  { intro: 'Edit this photo into a professional Indonesian job application photo (foto lamaran kerja) ready for HR or recruitment portals. The subject should project confidence and approachability — ensure a natural, friendly smile and a warm professional expression.', framing: 'VERTICAL PORTRAIT (2:3) — Frame as a half-body professional shot: head to mid-chest, subject centered. Subject faces directly forward: eyes level, both ears clearly visible, shoulders squared and symmetrical.' },
    beasiswa: { intro: 'Edit this photo to meet strict formal photo standards for scholarship registration (e.g., LPDP, SNBT, KIP Kuliah, or university scholarship).',  framing: 'VERTICAL PORTRAIT (2:3) — Frame as a formal bust shot: head to upper chest, face centered. Subject faces directly forward: eyes level, chin neutral, posture fully upright, shoulders squared.' },
    cpns:     { intro: 'Edit this photo to meet the strict official photo requirements for Indonesian civil servant (CPNS/ASN) or government agency selection registration.', framing: 'VERTICAL PORTRAIT (2:3) — Frame as a strict formal bust shot: head to upper chest, face perfectly centered. Subject faces directly forward: eyes level, chin neutral, posture fully upright and rigid, shoulders squared. Framing must meet BKN/government document standards.' },
    raport_sek: { intro: 'Edit this photo into a formal Indonesian school document photo — for report card (raport) or school diploma certificate (ijazah) for SD, SMP, SMA, or SMK level.',         framing: 'VERTICAL PORTRAIT (2:3) — Frame as a standard school portrait: head and shoulders centered, face clearly visible and looking directly forward, eyes level with the camera. Head occupies approximately 60–75% of the frame height — show the school uniform collar and upper chest clearly. Both ears should be visible. Posture upright, shoulders squared.' },
    raport_pt:  { intro: 'Edit this photo into a formal Indonesian higher education document photo — for Diploma (D3) or Bachelor\'s degree (S1) diploma certificate (ijazah universitas/perguruan tinggi).', framing: 'VERTICAL PORTRAIT (2:3) — Frame as a formal academic portrait: head and upper chest centered, face clearly visible and looking directly forward, eyes level with the camera. Head occupies approximately 65–75% of the frame height — show the jacket collar and upper chest clearly. Both ears visible. Posture fully upright and formal, shoulders squared.' },
    raport:   { intro: 'Edit this photo into a formal Indonesian school document photo — for report card (raport) or diploma certificate (ijazah).',               framing: 'VERTICAL PORTRAIT (2:3) — Frame as a standard school portrait: head and shoulders centered, face clearly visible and looking directly forward, eyes level with the camera. Head occupies approximately 60–75% of the frame height — show the school uniform collar and upper chest clearly. Posture upright, shoulders squared.' },
    dinas:    { intro: 'Edit this photo into a formal official duty photo (foto dinas) for Indonesian police (POLRI) or military (TNI) personnel.',                framing: 'VERTICAL PORTRAIT (2:3) — Frame as a strict formal bust shot: head to upper chest, face perfectly centered. Subject faces directly forward: eyes level, chin neutral, posture fully upright and rigid, shoulders squared. The uniform collar, rank insignia, and upper chest must be clearly visible.' },
  };

  const subjectNote = hijabSubjectNote(g);

  if (tujuan === 'skck')   return buildPromptSKCK();
  if (tujuan === 'kua')    return buildPromptKUA();
  if (tujuan === 'wisuda') return buildPromptWisuda();

  if (tujuan === 'dinas') {
    const dinasKey   = document.getElementById('baju-dokumen')?.value || '';
    const dinasLabel = DINAS_OPTIONS[dinasKey]?.label || 'official duty uniform';
    const dinasColor = getColorName(selectedColor);
    return `You are a professional photo editor specializing in official Indonesian government duty photos (foto dinas resmi). You are given 2 photos — Photo 1: the person, Photo 2: reference duty uniform. Apply the uniform from Photo 2 onto the person in Photo 1.

Edit this photo into a formal official duty portrait for: ${dinasLabel}

What to do:
1. Replace the background with a solid, even, and clean ${dinasColor} (${selectedColor}) color — seamless edge around the subject, no shadows or gradients on the background
2. VERTICAL PORTRAIT (2:3) — Frame as a strict formal bust shot: head to upper chest, face perfectly centered, eyes level, looking directly at the camera, chin neutral, shoulders squared and rigid. Head occupies 70–80% of the frame height.
3. Clothing: Apply the ${dinasLabel} uniform from the reference photo — rank insignia, badges, and attributes must be accurately reproduced and neatly positioned on the correct placement
4. Apply even, frontal, shadow-free lighting — no harsh shadows on the face, no reflections on medals or insignia
5. Pose & expression: fully upright and rigid formal posture — no slouching, no tilted head, neutral expression. STRICTLY NO political poses (no thumbs up, no saluting in a political context, no gestures implying political affiliation — maintaining neutrality as required by Indonesian law for TNI/Polri members)
6. Enhance overall photo quality and sharpness for official duty documentation
${PASFOTO_CANVAS_RULE}
${extra ? '\nSpecial request: ' + extra : ''}
${hijabNote(g)}
${WAJAH_RULE}`;
  }

  if (tujuan === 'cpns') {
    const gantiKemeja = document.getElementById('cpns-baju')?.value === 'ganti';
    const clothingM = gantiKemeja
      ? 'plain white formal dress shirt (long or short sleeve, no pattern) with a dark necktie (black or dark navy)'
      : 'tidy the existing white shirt — smooth wrinkles, straighten collar. Add a dark necktie if not already worn.';
    const clothingF = gantiKemeja
      ? 'plain white formal blouse (long or short sleeve, no pattern), neat and properly fitted'
      : 'tidy the existing white blouse — smooth wrinkles, straighten collar.';
    const clothingHijab = gantiKemeja
      ? 'plain white formal blouse (long or short sleeve, no pattern). Hijab must be dark-colored (black or dark navy), neatly arranged, face fully visible from forehead to chin'
      : 'tidy the existing white blouse. Ensure hijab is dark-colored (black or dark navy), neatly arranged, face fully visible from forehead to chin.';
    const clothing = g === 'wanita-hijab' ? clothingHijab : g === 'wanita' ? clothingF : clothingM;
    return `You are a professional photo editor specializing in official Indonesian civil service selection photos (CPNS/SSCASN BKN). ${subjectNote}Edit this photo to meet the strict official photo requirements for CPNS or government school (sekolah kedinasan) registration on the SSCASN BKN portal.

What to do:
1. Replace the background with a solid, even, and clean ${colorName} (${selectedColor}) color — seamless edges, no shadows or gradients on the background
2. VERTICAL PORTRAIT (2:3) — Frame as a strict formal portrait bust shot: head to upper chest, face perfectly centered, eyes level looking directly at the camera, chin neutral, shoulders squared and rigid. Head occupies 70–80% of the frame height.
3. Clothing: ${clothing}
4. Apply even, frontal, shadow-free lighting across the face — no harsh shadows, no reflections, no dark areas
5. ${POSE_DOC}
6. Enhance photo quality and sharpness to meet SSCASN BKN portal upload standards
${PASFOTO_CANVAS_RULE}
${extra ? '\nSpecial request: ' + extra : ''}
${hijabNote(g)}
${WAJAH_RULE}`;
  }

  if (tujuan === 'linkedin') {
    const bgDesc = document.getElementById('linkedin-bg')?.value || 'soft light gray studio background';
    const pose   = document.getElementById('linkedin-pose')?.value || 'facing directly forward, eyes level at camera, natural friendly smile';
    return `You are a professional photo editor specializing in LinkedIn profile headshots and professional CV photos. ${subjectNote}Edit this photo into a polished, professional LinkedIn headshot.

What to do:
1. Replace the background with: ${bgDesc} — clean, neutral, non-distracting. DO NOT use solid red or blue backgrounds (those are for formal ID documents, not LinkedIn)
2. Frame as a head-and-shoulders portrait — face and upper chest visible, subject centered. Face should fill approximately 60% of the total frame area. IMPORTANT: LinkedIn displays photos in a circle — keep the face perfectly centered with margin on all sides so nothing is cropped
3. Pose & expression: ${pose}. Eyes clearly visible and making eye contact with the camera
4. Clothing: ${bajuPrompt} — smart-casual to formal; no need for tie or formal suit unless appropriate for the industry
5. Ensure posture is upright and natural — no slouching. Slight forward lean is acceptable for approachable appearance
6. Apply clean, even, professional lighting — well-lit face, soft fill light on both sides, no harsh shadows
7. Sharpen details, reduce noise, and balance colors naturally — overall impression: confident, approachable, and professional
${PASFOTO_CANVAS_RULE}
${extra ? '\nSpecial request: ' + extra : ''}
${hijabNote(g)}
${WAJAH_RULE}`;
  }

  const ctx = contexts[tujuan] || contexts.umum;
  const photoNote = isSeragam ? `You are given 2 photos — Photo 1: the person, Photo 2: reference school uniform. Apply the uniform from Photo 2 onto the person in Photo 1.\n\n` : '';

  const clothingContrast = tujuan === 'paspor'  ? ' IMPORTANT: clothing MUST NOT be white — it must clearly contrast with the white background.'
    : tujuan === 'sim'    ? ' Avoid blue clothing that would blend with the blue background.'
    : tujuan === 'ktp'    ? ' Avoid clothing color that matches the background color.'
    : tujuan === 'visa'   ? ' Clothing must clearly contrast with the background — avoid white if background is white.'
    : tujuan === 'lamaran'? ' Clothing must clearly contrast with the background color — avoid matching colors.'
    : '';

  return `You are an experienced professional photo editor specializing in official document photos. ${subjectNote}${photoNote}${ctx.intro}

What to do:
1. Replace the background with a solid, even, and clean ${colorName} (${selectedColor}) color — seamless edge between subject and background
2. ${ctx.framing}
3. Clothing: ${bajuPrompt}${clothingContrast}
4. Apply even, frontal, shadow-free lighting across the face — no harsh shadows, no reflections
5. ${tujuan === 'lamaran' || tujuan === 'beasiswa' ? POSE_LAMARAN : POSE_DOC}
6. Enhance photo quality and sharpness to meet official document standards
${PASFOTO_CANVAS_RULE}
${extra ? '\nSpecial request: ' + extra : ''}
${hijabNote(g)}
${WAJAH_RULE}`;
}

function buildPromptKUA() {
  const extra = getExtra();
  const mode = document.getElementById('kua-mode')?.value || 'rapikan';

  const kuaBlue = `medium-dark royal blue — the standard background color used in official Indonesian KUA/Kemenag civil registration photos. This is a calm, muted royal blue (similar to a government ID document blue), NOT electric blue, NOT neon blue, NOT cobalt blue, NOT royal blue that is too saturated. Think of it as a deep-medium blue that is professional and understated`;
  const kuaClothingRule = `formal collared shirt, formal blouse, or formal attire (baju muslim/kebaya is acceptable for women). Clothing color must clearly contrast with the blue background — avoid blue or similar shades that blend with the background. Tidy existing clothing first (smooth wrinkles, straighten collar, neaten hijab); only change clothing if it clearly does not meet this standard`;
  const kuaFacing = `CRITICAL — FACING DIRECTION: Both individuals must face PERFECTLY STRAIGHT FORWARD toward the camera — zero degrees rotation, no angling toward each other, no 3/4 profile. Treat each person as if they are independently taking a passport photo: body squared directly to camera, face looking straight into the lens, shoulders level and perpendicular to the camera axis. This is the most important geometric requirement`;

  if (mode === 'gabung') {
    return `You are a professional photo editor specializing in official Indonesian marriage registration photos (foto KUA). You are given TWO separate photos — one of the groom, one of the bride. Combine them into a single formal side-by-side couple photo meeting KUA civil registration standards.

CRITICAL REQUIREMENTS (must be met exactly):
- OUTPUT: LANDSCAPE — width wider than height, 3:2 ratio (e.g. 1500×1000 px)
- FACING: Both subjects face PERFECTLY STRAIGHT FORWARD — zero rotation, no angling toward each other
- BACKGROUND: ${kuaBlue}

What to do:
1. ${kuaFacing}
2. Merge into a single LANDSCAPE image: man on the LEFT, woman on the RIGHT — both centered vertically, inner shoulders close together (lightly touching or 1–2 cm gap at most). They must appear as if photographed together in one studio session
3. Framing: head-to-upper-chest bust shot for both. Both heads at the same height, both faces equally sized in the frame
4. Replace the background with a solid, flat, even ${kuaBlue} — seamless edges, no visible seam between the two merged photos
5. Normalize scale: both individuals same proportional height — heads level, shoulder width proportional
6. Clothing for both: ${kuaClothingRule}
7. Apply even, frontal, shadow-free lighting uniformly — same exposure across both faces, as if lit together in one studio
8. Enhance photo quality and sharpness for official civil registration documentation
${KUA_CANVAS_RULE}
${extra ? '\nSpecial request: ' + extra : ''}
${WAJAH_RULE}`;
  }

  return `You are a professional photo editor specializing in official Indonesian marriage registration photos (foto KUA). Edit this existing couple photo to meet KUA civil registration standards.

CRITICAL REQUIREMENTS (must be met exactly):
- OUTPUT: LANDSCAPE — width wider than height, 3:2 ratio (e.g. 1500×1000 px)
- FACING: Both subjects face PERFECTLY STRAIGHT FORWARD — zero rotation, no angling toward each other
- BACKGROUND: ${kuaBlue}

What to do:
1. ${kuaFacing}
2. Reframe to LANDSCAPE (3:2). Both subjects visible from head to upper chest, side by side with inner shoulders close together (lightly touching or 1–2 cm gap). Both faces clearly visible, equally sized, at the same height
3. Replace the background with a solid, flat, even ${kuaBlue} — seamless edges
4. Correct posture: both upright — no tilted heads, no slouching, no angled bodies
5. Clothing for both: ${kuaClothingRule}
6. Apply perfectly even, frontal, shadow-free lighting across both faces equally
7. Enhance photo quality and sharpness for official civil registration documentation
${KUA_CANVAS_RULE}
${extra ? '\nSpecial request: ' + extra : ''}
${WAJAH_RULE}`;
}

function buildPromptEnhance() {
  const levelMap = {
    standard: 'natural HD quality',
    high: 'high definition — sharp and crisp',
    ultra: 'ultra HD — maximum quality with full detail'
  };
  const level  = levelMap[document.getElementById('enhance-level')?.value] || 'high definition';
  const damage = document.getElementById('enhance-damage')?.value || '';
  const extra  = getExtra();

  const damageInstructions = {
    blur:    '- Priority: aggressively recover sharpness and motion-blur from a blurry/shaky photo — deconvolve softness, reconstruct fine edges',
    dark:    '- Priority: brighten a severely underexposed photo — recover shadow detail, lift overall exposure, reduce muddy blacks without blowing highlights',
    noise:   '- Priority: eliminate heavy noise and grain typical of low-light or older phone cameras — smooth without losing structural detail',
    jpeg:    '- Priority: remove severe JPEG block artifacts, ringing, and pixelation — reconstruct smooth gradients and recover compressed detail',
    faded:   '- Priority: restore faded, desaturated, or flat colors — bring back vibrancy, contrast, and tonal depth',
    low_res: '- Priority: upscale a low-resolution image — use AI super-resolution techniques to multiply detail and produce a high-res result',
  };
  const damageNote = damageInstructions[damage] || '';

  return `You are a professional photo editor specializing in image quality enhancement. Enhance this photo to ${level}.

What to do:
1. Increase sharpness and clarity of detail
2. Remove noise, grain, and compression artifacts
3. Optimize lighting and contrast naturally
4. Correct colors to look vivid and accurate
5. Preserve the original mood and atmosphere of the photo
${damageNote}
${extra ? '\nEnhancement focus: ' + extra : ''}
${WAJAH_RULE}
- DO NOT alter the composition, subjects, or content of the photo`;
}

function buildPromptRestore() {
  const modeMap = {
    standard: 'general restoration of an old photo',
    heavy: 'intensive restoration for severe damage',
    colorize: 'full restoration with natural colorization'
  };
  const mode = modeMap[document.getElementById('restore-mode')?.value] || 'general restoration';
  const extra = getExtra();
  return `You are a professional photo editor specializing in old photo restoration. Restore this photo using mode: ${mode}.

What to do:
1. Repair physical damage: scratches, stains, tears, folds, spots
2. Fix faded, yellowed, or washed-out colors
3. Recover sharpness and details lost to age
4. Clean up excessive grain and noise
5. Preserve the historical character and atmosphere of the photo
${extra ? '\nDamage notes: ' + extra : ''}
${WAJAH_RULE}
- Retain the historical feel — do not make it look overly modern`;
}

function buildPromptColorize() {
  const styleMap = {
    natural: 'natural and realistic, true to context',
    vivid: 'vivid and vibrant with strong, bold colors',
    vintage: 'warm and classic with a vintage feel'
  };
  const style = styleMap[document.getElementById('colorize-style')?.value] || 'natural';
  const extra = getExtra();
  return `You are a professional photo editor specializing in colorization. Add color to this black-and-white photo in a ${style} style.

What to do:
1. Analyze the photo context (people, location, clothing, era) to determine accurate colors
2. Apply natural skin, hair, and eye tones appropriate to the context
3. Color clothing realistically and consistent with the era
4. Color the background and environment naturally
5. Ensure lighting and shadows remain consistent after colorization
${extra ? '\nContext/era: ' + extra : ''}
${WAJAH_RULE}`;
}

function buildPromptBackground() {
  const quick    = document.getElementById('bg-quick')?.value?.trim();
  const category = document.getElementById('bg-category')?.value;
  const preset   = document.getElementById('bg-preset')?.value;
  const extra    = document.getElementById('extra')?.value?.trim() || '';
  // Prioritas: (1) quick chip → (2) lainnya → textarea → (3) sub-preset → (4) color chip
  let bgDesc;
  if (quick) {
    bgDesc = quick;
  } else if (category === 'lainnya') {
    bgDesc = extra || 'a creative and visually appealing background';
  } else if (preset) {
    bgDesc = preset;
  } else {
    bgDesc = `solid ${getColorName(selectedColor)} (${selectedColor}) color`;
  }
  const bgCanvasRule = `Output format — MANDATORY:
1. Aspect ratio: preserve the ORIGINAL aspect ratio of the input photo exactly — do not crop, stretch, or change the proportions.
2. White frame expansion: after completing the background replacement, expand the canvas by exactly 20% on ALL FOUR edges using solid pure WHITE (#FFFFFF). Do not blur or blend the white border. The subject must remain centered in the inner area. This white border is reserved for the user to re-crop and remove platform watermarks after downloading.`;

  return `You are a professional photo editor. Replace the background of this photo with: ${bgDesc}.

What to do:
1. Remove the original background cleanly and precisely
2. Replace it with the new background: ${bgDesc}
3. Ensure the edge between the subject and the new background looks natural and seamless
4. Adjust the subject's lighting to match the new background
5. Produce a seamless and natural-looking result
${bgCanvasRule}
${WAJAH_RULE}`;
}

function buildPromptOutfit() {
  const jenis = document.getElementById('outfit-jenis')?.value || 'formal';
  const extra = getExtra();

  if (jenis === 'seragam') {
    const key         = document.getElementById('seragam-sekolah')?.value || 'sma';
    const uniformDesc = SERAGAM_OPTIONS[key]?.prompt || '';
    const gender      = getGender();
    const genderLabel = gender === 'wanita-hijab'
      ? 'female (wearing hijab — ensure hijab remains neatly worn and fully intact after the uniform swap)'
      : gender === 'wanita' ? 'female' : 'male';
    const bgOutfit = getBgOutfit();
    return `You are a professional photo editor. Swap the clothing of the subject in the FIRST PHOTO to match the school uniform shown in the SECOND PHOTO (reference).

Photo instructions:
- PHOTO 1 (first image): The person whose uniform will be changed
- PHOTO 2 (second image): The reference school uniform to apply

Target uniform context: ${uniformDesc}

What to do:
1. Carefully analyze the reference uniform in Photo 2 — colors, cut, collar style, badges, tie or neckerchief, and all attributes
2. Apply that exact uniform to the subject in Photo 1 (gender: ${genderLabel})
3. Ensure the uniform is worn correctly and neatly — collar straight, shirt tucked in, all attributes in place
4. Ensure the uniform fits naturally to the subject's posture and body proportions
5. Adjust lighting and shadows on the new uniform to match Photo 1's original lighting
${bgOutfit ? `6. Background: replace the existing background with a ${bgOutfit} — clean, even, and seamless` : '6. Keep the original background unchanged'}
${extra ? '\nAdditional detail: ' + extra : ''}
${hijabNote(gender)}
${WAJAH_RULE}
- REMINDER: Upload BOTH photos to the platform — Photo 1 first, then Photo 2`;
  }

  if (jenis === 'kasual') {
    const outfitType = document.getElementById('outfit-kasual-type')?.value || 'plain white t-shirt, casual';
    const gender = getGender();
    const bgOutfit = getBgOutfit();
    return `You are a professional photo editor. Change the clothing of the subject (${getGenderLabel()}) in this photo to a casual outfit: ${outfitType}.

What to do:
1. Replace the clothing with ${outfitType} — ensure it looks natural and fits the subject's body proportions
2. The outfit should appear relaxed, authentic, and true to the casual style described
3. Adjust fabric folds, shadows, and lighting to match the original photo's light direction
${bgOutfit ? `4. Background: replace the existing background with a ${bgOutfit} — clean, even, and seamless` : '4. Keep the original background unchanged'}
${extra ? '\nDetail: ' + extra : ''}
${hijabNote(gender)}
${WAJAH_RULE}`;
  }

  if (jenis === 'streetwear') {
    const outfitType = document.getElementById('outfit-street-type')?.value || 'streetwear hoodie, urban style';
    const gender = getGender();
    const bgOutfit = getBgOutfit();
    return `You are a professional photo editor. Dress the subject (${getGenderLabel()}) in this photo in an urban streetwear outfit: ${outfitType}.

What to do:
1. Replace the clothing with ${outfitType} — capture the full aesthetic: textures, prints, layering, fit
2. The outfit should look authentically streetwear — bold, intentional, and stylish
3. Adjust fabric, shadows, and lighting naturally to match the photo's existing light direction
${bgOutfit ? `4. Background: replace the existing background with a ${bgOutfit} — clean, even, and seamless` : '4. Keep the original background unchanged'}
${extra ? '\nDetail: ' + extra : ''}
${hijabNote(gender)}
${WAJAH_RULE}`;
  }

  if (jenis === 'tradisional') {
    const outfitType = document.getElementById('outfit-tradisional-type')?.value || 'formal batik dress shirt, traditional Indonesian attire';
    const gender = getGender();
    const bgOutfit = getBgOutfit();
    return `You are a professional photo editor specializing in cultural portrait photography. Dress the subject (${getGenderLabel()}) in this photo in traditional Indonesian attire: ${outfitType}.

What to do:
1. Replace the clothing with ${outfitType} — faithfully reproduce the authentic design, patterns, colors, and draping of the traditional garment
2. Ensure all cultural details are accurate — patterns, embroidery, fabric sheen, sash placement, and accessories that naturally accompany this attire
3. The garment must drape and fit naturally on the subject's posture and body proportions
4. Adjust lighting and fabric shading to match the original photo's light conditions
${bgOutfit ? `5. Background: replace the existing background with a ${bgOutfit} — clean, even, and seamless` : '5. Keep the original background unchanged'}
${extra ? '\nDetail: ' + extra : ''}
${hijabNote(gender)}
${WAJAH_RULE}`;
  }

  if (jenis === 'referensi') {
    const bgOutfit = getBgOutfit();
    const gender = getGender();
    return `You are a professional photo editor. Change the clothing of the subject in the FIRST PHOTO to match the outfit shown in the SECOND PHOTO.

Photo instructions:
- PHOTO 1 (first image): The person whose clothing will be changed
- PHOTO 2 (second image): The reference outfit to apply

What to do:
1. Carefully analyze the reference outfit in Photo 2 — style, color, cut, fabric texture, and details
2. Apply that exact outfit to the subject in Photo 1
3. Ensure the new outfit fits naturally to the subject's posture and body proportions
4. Adjust lighting and shadows on the new clothing to match Photo 1's original lighting
${bgOutfit ? `5. Background: replace the existing background with a ${bgOutfit} — clean, even, and seamless` : '5. Keep the original background unchanged'}
${extra ? '\nAdditional note: ' + extra : ''}
${hijabNote(gender)}
${WAJAH_RULE}
- REMINDER: Upload BOTH photos to the platform — Photo 1 first, then Photo 2`;
  }

  if (jenis === 'tni') {
    const colorName = getColorName(selectedColor);
    const uniformType = document.getElementById('uniform-tni')?.value || 'formal official uniform';
    const gender = getGender();
    return `You are a professional photo editor. Edit this photo into a formal official uniformed portrait.

What to do:
1. Replace the background with a solid, even ${colorName} (${selectedColor}) color
2. Dress the subject in the proper official uniform: ${uniformType} (${getGenderLabel()})
3. Ensure the uniform is worn correctly — collar straight, buttons properly done, insignia and rank markings in the correct position
4. Tidy up general appearance: hair neat and regulation-compliant
5. Improve lighting to be even, frontal, and professional
6. Enhance overall photo quality to meet official documentation standards
${extra ? '\nSpecial request: ' + extra : ''}
${hijabNote(gender)}
${WAJAH_RULE}`;
  }

  if (jenis === 'nakes') {
    const colorName = getColorName(selectedColor);
    const uniformNakes = document.getElementById('uniform-nakes')?.value || 'white doctor coat';
    const gender = getGender();
    return `You are a professional photo editor. Edit this photo into a formal medical professional portrait.

What to do:
1. Replace the background with a solid, even ${colorName} (${selectedColor}) color
2. Dress the subject in the appropriate medical uniform: ${uniformNakes} (${getGenderLabel()})
3. Ensure the uniform is clean, crisp, and properly worn — collar straight, neatly fitted
4. Improve lighting to be clean, bright, and professional
5. Enhance overall photo quality for official medical documentation
${extra ? '\nSpecial request: ' + extra : ''}
${hijabNote(gender)}
${WAJAH_RULE}`;
  }

  if (jenis === 'umroh') {
    const gender = getGender();
    const attireDesc = gender === 'pria'
      ? 'white Ihram cloth (two pieces of plain, clean, seamless white cloth), properly worn as per Hajj/Umroh requirements'
      : 'white mukena or white abaya with hijab (full modest covering — face fully and clearly visible)';
    const bgOutfit = getBgOutfit();
    const bgDesc = bgOutfit || 'clean, neutral white or soft light gray';
    return `You are a professional photo editor. Edit this photo into a formal document photo for Umroh or Hajj pilgrimage.

What to do:
1. Replace the background with a ${bgDesc} background — clean and even
2. Dress the subject in the proper pilgrimage attire (gender: ${gender}): ${attireDesc}
3. Ensure the attire looks clean, tidy, and authentic to the pilgrimage tradition
4. Improve lighting to be even, clean, and respectful in tone
5. Enhance overall photo quality to meet travel document and visa standards
${extra ? '\nSpecial request: ' + extra : ''}
${WAJAH_RULE}
- IMPORTANT: For female subjects — the face MUST remain fully visible. Only hair and neck area are covered`;
  }

  // jenis === 'formal'
  const outfitType = document.getElementById('outfit-formal-type')?.value || 'jas formal hitam dengan dasi';
  const gender = getGender();
  const bgOutfit = getBgOutfit();
  return `You are a professional photo editor. Change the clothing of the subject (${getGenderLabel()}) in this photo to: ${outfitType}.

What to do:
1. Replace the clothing with ${outfitType}, neat and natural-looking
2. Ensure the new outfit fits the subject's posture and body proportions
3. Adjust lighting and shadows on the new clothing accordingly
4. Refine the overall appearance to look professional
${bgOutfit ? `5. Background: replace the existing background with a ${bgOutfit} — clean, even, and seamless` : '5. Keep the original background unchanged'}
${extra ? '\nClothing detail: ' + extra : ''}
${hijabNote(gender)}
${WAJAH_RULE}`;
}

function buildPromptSKCK() {
  const extra = getExtra();
  const bajuPrompt = getBajuDokumen();
  const g = getGender();
  const subjectNote = hijabSubjectNote(g);
  return `You are a professional photo editor specializing in official government document photos. ${subjectNote}Edit this photo into a formal SKCK (Surat Keterangan Catatan Kepolisian / Police Record Certificate) photo that strictly follows Indonesian National Police (Polri) official standards.

Official SKCK photo requirements — apply ALL of these:
1. Background: solid, even, clean RED (#FF0000) — no gradients, no texture, full coverage
2. ${POSE_DOC}
3. Framing: VERTICAL PORTRAIT (2:3) — head centered, head-to-shoulders composition, face occupying 70–80% of frame height, proportioned for a 4×6 cm print. NEVER square or landscape.
4. Clothing: ${bajuPrompt} — must be a formal collared shirt or formal attire (no t-shirts, no casual wear)
5. Face: fully and clearly visible — NO sunglasses, NO tinted glasses. If the subject is currently wearing glasses, REMOVE them
6. Headwear: hats and caps are NOT allowed. Hijab is permitted ONLY if the full face (forehead to chin, ear to ear) is completely visible
7. Lighting: perfectly even, frontal, shadow-free — no dark shadows on the face, no harsh side lighting
8. Enhance overall photo quality and sharpness for official police document submission
${PASFOTO_CANVAS_RULE}
${extra ? '\nSpecial request: ' + extra : ''}
${hijabNote(g)}
${WAJAH_RULE}`;
}

function buildPromptWisuda() {
  const colorName = getColorName(selectedColor);
  const togaColor = document.getElementById('toga-color')?.value || 'black';
  const gender = getGender();
  const extra = getExtra();

  const bajuKey = document.getElementById('baju-wisuda')?.value || 'existing';
  const bajuMap = {
    existing:      (gender === 'wanita' || gender === 'wanita-hijab')
                     ? 'Keep and tidy the existing clothing — smooth wrinkles, straighten collar, neaten any hijab or headpiece'
                     : 'Keep and tidy the existing clothing — smooth wrinkles, straighten collar and tie',
    pria_putih:    'white long-sleeve dress shirt with a neat formal tie, dark formal trousers (celana bahan)',
    pria_biru:     'light blue long-sleeve dress shirt with a neat formal tie, dark formal trousers (celana bahan)',
    pria_hitam:    'black long-sleeve dress shirt, dark formal trousers (celana bahan)',
    pria_batik:    'formal batik dress shirt (kemeja batik), dark formal trousers (celana bahan)',
    wanita_putih:  'white collared dress shirt with a formal blazer or jas almamater, formal skirt or trousers (rok bahan or celana bahan)',
    wanita_kebaya: 'formal kebaya in a neutral color (cream, white, or pastel), paired with formal batik or plain skirt',
    wanita_blus:   'formal collared blouse in a neutral or pastel color, paired with a formal skirt or trousers',
    wanita_gamis:  'formal gamis or muslimah dress in a neat, solid, non-flashy color — modest and elegant',
  };
  const bajuPrompt = bajuMap[bajuKey] || bajuMap.existing;

  const genderNote = gender === 'wanita-hijab'
    ? 'The subject wears hijab — it must fully cover all hair, the neck, and reach the upper chest. Ensure it is neatly arranged and complements the toga and clothing. NO hair visible anywhere.'
    : gender === 'wanita'
      ? 'Ensure hair is neatly arranged and complements the graduation portrait look.'
      : 'Ensure hair is neat and well-groomed.';

  const subjectNote = hijabSubjectNote(gender);
  return `You are a professional photo editor specializing in formal graduation portrait photos. ${subjectNote}Edit this photo into a polished academic graduation portrait.

What to do:
1. Replace the background with a clean, professional ${colorName} (${selectedColor}) color — seamless edge around the subject
2. ${POSE_LAMARAN} Posture: proud and upright — this is a celebratory portrait. Expression must be a natural, warm, genuine smile — projecting pride and joy without being forced or exaggerated.
3. VERTICAL PORTRAIT (2:3) — Frame as a formal graduation portrait: head to mid-chest composition, subject PERFECTLY CENTERED, mortarboard cap fully visible and level on the head. NEVER square or landscape.
4. Toga (outer layer): ensure the ${togaColor} toga is properly draped over the formal clothing, fully visible, and lies neatly — tidy any folds or creases. DO NOT remove or replace the toga
5. Clothing under the toga: ${bajuPrompt}. The clothing underneath should be visible at the collar/neckline area and look neat and formal
6. ${genderNote}
7. Apply bright, even, frontal lighting — well-lit face, no harsh shadows, celebratory formal portrait quality
8. Enhance overall photo quality for graduation documentation and keepsake
${PASFOTO_CANVAS_RULE}
${extra ? '\nSpecial request: ' + extra : ''}
${hijabNote(gender)}
${WAJAH_RULE}`;
}

function buildPromptHeadwear() {
  const headwearType = document.getElementById('headwear-type')?.value || 'a neat formal headwear';
  const action = document.getElementById('headwear-action')?.value || 'tambah';
  const extra = getExtra();
  const isHijab = headwearType.toLowerCase().includes('hijab');

  const actionText = action === 'ganti'
    ? 'Remove the existing headwear completely and replace it with'
    : 'Add the following headwear to the subject:';

  const hairStep = isHijab
    ? '4. ALL hair must be completely hidden — not a single strand visible anywhere. The hijab must cover the entire hairline, temples, sides, and back of the head. It must also cover the neck and extend to the upper chest. ZERO hair peeking out from any edge.'
    : '4. Ensure hair (if visible) is styled naturally under or around the headwear';

  return `You are a professional photo editor. ${action === 'ganti' ? 'Replace' : 'Add'} the headwear on the subject in this photo.

What to do:
1. ${actionText} ${headwearType}
2. Ensure the headwear fits naturally and proportionally to the subject's head shape and size
3. Adjust lighting and shadows on the headwear to match the existing photo's lighting conditions
${hairStep}
5. The result must look authentic and natural — not digitally pasted or artificial
${extra ? '\nAdditional detail: ' + extra : ''}
${isHijab ? HIJAB_RULE : ''}
${WAJAH_RULE}
- CRITICAL: Headwear must fit naturally — match shape and size to the subject's head
- FORBIDDEN to cover or obscure any part of the face`;
}

/* ════════════════════════════════════
   RAMBUT — render + build
════════════════════════════════════ */
function renderOpsiRambut() {
  return `<div class="opt-group">
    <div class="opt-label">Yang Ingin Diubah</div>
    <select class="opt-select" id="rambut-mode" onchange="renderRambutSubOptions()">
      <option value="warna">Ganti Warna Rambut</option>
      <option value="gaya">Ganti Gaya / Potongan Rambut</option>
      <option value="keduanya">Ganti Warna + Gaya Sekaligus</option>
    </select>
  </div>
  <div id="rambut-sub-options"></div>`;
}

function renderRambutSubOptions() {
  const mode = document.getElementById('rambut-mode')?.value || 'warna';
  const container = document.getElementById('rambut-sub-options');
  if (!container) return;

  let html = '';
  if (mode === 'warna' || mode === 'keduanya') {
    html += `<div class="opt-group">
      <div class="opt-label">Warna Rambut Target</div>
      <select class="opt-select" id="rambut-warna">
        <optgroup label="Natural">
          <option value="natural jet black hair, rich and deep tone">Hitam Natural (Jet Black)</option>
          <option value="rich dark brown hair with natural undertones">Coklat Gelap (Dark Brown)</option>
          <option value="warm medium brown hair, natural looking">Coklat Medium</option>
          <option value="warm chestnut brown with subtle reddish undertone">Coklat Chesnut Kemerahan</option>
          <option value="dark auburn hair with warm red undertones">Auburn / Merah Alami</option>
        </optgroup>
        <optgroup label="Pirang & Terang">
          <option value="warm honey blonde hair with golden highlights">Pirang Honey / Blonde Natural</option>
          <option value="bright golden blonde hair, sun-kissed look">Pirang Emas (Golden Blonde)</option>
          <option value="ultra light platinum blonde hair, almost white">Platinum Blonde / Putih Susu</option>
          <option value="cool-toned ash blonde hair">Ash Blonde (Pirang Abu)</option>
        </optgroup>
        <optgroup label="Warna Bold">
          <option value="vibrant red hair, bold and saturated">Merah Menyala (Vivid Red)</option>
          <option value="deep wine / burgundy hair, dark rich red-purple">Burgundy / Wine Red</option>
          <option value="metallic silver-gray hair, sleek and modern">Silver / Abu-abu Metalik</option>
          <option value="cool blue-black hair, deep navy undertone">Hitam Biru (Blue Black)</option>
          <option value="deep midnight navy blue hair">Navy Blue (Biru Gelap)</option>
          <option value="vivid electric blue hair, bold statement color">Biru Cerah (Electric Blue)</option>
          <option value="pastel pink rose hair, soft and dreamy">Pink Pastel / Rose</option>
          <option value="vibrant magenta pink hair">Pink Magenta / Hot Pink</option>
          <option value="soft pastel lavender purple hair">Ungu Lavender</option>
          <option value="rich deep purple hair">Ungu Gelap (Deep Purple)</option>
          <option value="vivid emerald green hair">Hijau Emerald</option>
        </optgroup>
        <optgroup label="Teknik Warna">
          <option value="natural dark brown to warm honey blonde ombre gradient, seamless transition">Ombre — Gelap ke Pirang</option>
          <option value="balayage highlights — natural hand-painted blonde streaks on dark base">Balayage / Highlights Natural</option>
          <option value="two-tone split hair — half black half blonde, sharp clean divide">Two-tone Split Color</option>
        </optgroup>
      </select>
    </div>`;
  }
  if (mode === 'gaya' || mode === 'keduanya') {
    html += `<div class="opt-group">
      <div class="opt-label">Untuk Gender</div>
      <select class="opt-select" id="rambut-gaya-gender" onchange="renderRambutGayaByGender()">
        <option value="pria">Pria</option>
        <option value="wanita">Wanita</option>
      </select>
    </div>
    <div id="rambut-gaya-options"></div>`;
    setTimeout(() => renderRambutGayaByGender(), 0);
  }
  html += renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: highlight di ujung saja, tone cool/warm, permanen atau natural fade');
  container.innerHTML = html;
}

function renderRambutGayaByGender() {
  const gender = document.getElementById('rambut-gaya-gender')?.value || 'pria';
  const container = document.getElementById('rambut-gaya-options');
  if (!container) return;

  if (gender === 'pria') {
    container.innerHTML = `<div class="opt-group">
      <div class="opt-label">Gaya Rambut Pria</div>
      <select class="opt-select" id="rambut-gaya">
        <optgroup label="Pendek & Rapi">
          <option value="clean undercut — short faded sides, longer styled top">Undercut — Sisi Pendek, Atas Panjang</option>
          <option value="classic pompadour — voluminous swept-back top, short sides">Pompadour — Rambut Tinggi ke Belakang</option>
          <option value="slicked back — all hair swept smoothly backward, formal and polished">Slicked Back — Disisir ke Belakang</option>
          <option value="crew cut — very short uniform length all over, clean and masculine">Crew Cut — Pendek Seragam</option>
          <option value="buzz cut — very short military-style all over">Buzz Cut — Cukur Pendek Militer</option>
          <option value="side-part classic — defined side parting, neat and formal">Side Part Classic — Belah Samping</option>
          <option value="modern quiff — styled upward front with side fade">Quiff Modern — Depan ke Atas</option>
          <option value="French crop — short textured fringe, clean sides">French Crop — Poni Pendek Bertekstur</option>
        </optgroup>
        <optgroup label="Panjang & Stylish">
          <option value="medium length natural waves, effortlessly styled">Medium Wavy — Ikal Natural Sedang</option>
          <option value="long straight hair, shoulder length, naturally flowing">Rambut Lurus Panjang (Sebahu)</option>
          <option value="curly natural texture hair, natural volume and shape">Curly / Keriting Natural</option>
          <option value="textured messy hair, casual and intentionally tousled">Messy Textured — Berantakan Terencana</option>
        </optgroup>
        <optgroup label="Bold & Ekstrem">
          <option value="mohawk — shaved sides, tall strip of hair down the center">Mohawk — Strip Tengah Berdiri</option>
          <option value="faux hawk — gentler mohawk, styled upward center strip">Faux Hawk — Mohawk Halus</option>
          <option value="man bun — long hair tied into a neat bun at the back">Man Bun — Sanggul Pria</option>
          <option value="dreadlocks — thick rope-like natural locks">Dreadlocks</option>
        </optgroup>
      </select>
    </div>`;
  } else {
    container.innerHTML = `<div class="opt-group">
      <div class="opt-label">Gaya Rambut Wanita</div>
      <select class="opt-select" id="rambut-gaya">
        <optgroup label="Pendek">
          <option value="pixie cut — very short, elegant and modern">Pixie Cut — Sangat Pendek Modern</option>
          <option value="bob cut — chin-length, sleek and polished">Bob Pendek (Chin Length)</option>
          <option value="lob (long bob) — shoulder-length sleek bob">Long Bob / Lob</option>
        </optgroup>
        <optgroup label="Sedang & Panjang">
          <option value="shoulder-length straight hair, neatly styled">Lurus Rapi Sebahu</option>
          <option value="medium length loose waves, natural and elegant">Gelombang Natural Sebahu</option>
          <option value="long straight silky hair, flowing naturally">Lurus Panjang & Halus</option>
          <option value="long loose romantic waves">Gelombang Romantis Panjang</option>
          <option value="long tight curls, natural voluminous">Curly Panjang & Volume</option>
        </optgroup>
        <optgroup label="Styling">
          <option value="neat high ponytail, sleek and polished">High Ponytail — Ekor Kuda Tinggi</option>
          <option value="elegant bun, neatly pinned at the back">Sanggul Rapi (Bun)</option>
          <option value="half-up half-down with soft waves">Half-up Half-down</option>
          <option value="straight cut bangs / fringe across forehead">Poni Lurus ke Dahi</option>
          <option value="side swept bangs with medium length hair">Poni Menyamping</option>
        </optgroup>
      </select>
    </div>`;
  }
}

function buildPromptRambut() {
  const mode = document.getElementById('rambut-mode')?.value || 'warna';
  const extra = getExtra();

  const tasks = [];
  if (mode === 'warna' || mode === 'keduanya') {
    const colorDesc = document.getElementById('rambut-warna')?.value || 'natural dark hair color';
    tasks.push(`Change the hair color to: ${colorDesc}. Apply the new color naturally to all hair strands with realistic light reflection and texture — avoid flat or cartoon-like coloring`);
  }
  if (mode === 'gaya' || mode === 'keduanya') {
    const gayaDesc = document.getElementById('rambut-gaya')?.value || 'neat natural style';
    tasks.push(`Restyle the hair to: ${gayaDesc}. The new hairstyle must fit naturally to the subject's head shape and face proportions`);
  }

  const taskList = tasks.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const n = tasks.length;

  return `You are a professional photo editor and hair retouching specialist.

What to do:
${taskList}
${n + 1}. Adjust hair-to-skin transition and hairline edge naturally — no hard cutouts or visible masking artifacts
${n + 2}. Ensure consistent lighting and shadow on the hair, matching the original photo's light direction
${n + 3}. The result must look like a real professional salon color/restyle — not digitally painted
${extra ? '\nAdditional detail: ' + extra : ''}
${WAJAH_RULE}
- CRITICAL: Only modify the hair. Do NOT change eyebrows, eyelashes, beard/mustache, or any facial feature`;
}

/* ════════════════════════════════════
   AKSESORI — render + build
════════════════════════════════════ */
function renderOpsiAksesori() {
  return `<div class="opt-group">
    <div class="opt-label">Jenis Aksesori</div>
    <select class="opt-select" id="aksesori-utama">
      <optgroup label="Kacamata Hitam (Sunglasses)">
        <option value="aviator">Aviator — Frame Tipis Pilot (Klasik)</option>
        <option value="wayfarer">Wayfarer — Frame Kotak Hitam Tebal</option>
        <option value="round_sunglasses">Round / Bulat — Lennon Style</option>
        <option value="cat_eye">Cat Eye — Ujung Lancip / Retro</option>
      </optgroup>
      <optgroup label="Kacamata Minus / Bening">
        <option value="clear_glasses">Kacamata Bening / Minus — Frame Formal</option>
        <option value="thin_frame">Kacamata Minus Frame Tipis Elegan</option>
        <option value="stylish_glasses">Kacamata Frame Tebal — Fashion Statement</option>
      </optgroup>
      <optgroup label="Anting Pria">
        <option value="anting_pria_stud">Anting Pria — Stud (Titik Perak/Emas)</option>
        <option value="anting_pria_hoop">Anting Pria — Hoop / Cincin</option>
        <option value="anting_pria_dangle">Anting Pria — Dangle / Gantungan</option>
      </optgroup>
      <optgroup label="Anting Wanita">
        <option value="anting_wanita_studs">Anting Wanita — Stud Diamond / Permata</option>
        <option value="anting_wanita_hoop">Anting Wanita — Hoop Emas</option>
        <option value="anting_wanita_chandelier">Anting Wanita — Chandelier / Panjang Mewah</option>
      </optgroup>
      <optgroup label="Kalung">
        <option value="kalung_rantai_emas">Kalung Rantai Emas (Gold Chain)</option>
        <option value="kalung_rantai_perak">Kalung Rantai Perak (Silver Chain)</option>
        <option value="kalung_dogtag">Dog Tag / Military Tag</option>
        <option value="kalung_liontin">Kalung Liontin / Pendant</option>
        <option value="kalung_formal_wanita">Kalung Mutiara / Wanita Formal</option>
      </optgroup>
      <optgroup label="Jam Tangan">
        <option value="jam_formal">Jam Tangan Formal (Leather Strap)</option>
        <option value="jam_metal">Jam Tangan Metal / Stainless Steel</option>
        <option value="jam_smartwatch">Smart Watch / Sport Watch</option>
        <option value="jam_casual">Jam Tangan Kasual (Rubber Strap)</option>
      </optgroup>
      <optgroup label="Combo Stylish">
        <option value="combo_bad_boy">Combo — Kacamata Hitam + Anting + Kalung Chain</option>
        <option value="combo_elegant_pria">Combo — Kacamata Formal + Jam Tangan Metal</option>
        <option value="combo_street">Combo — Kacamata Hitam + Kalung Chain (Urban)</option>
      </optgroup>
    </select>
  </div>
  ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: kacamata frame hitam tebal, anting kiri saja, kalung emas berlapis')}`;
}

function buildPromptAksesori() {
  const aksesori = document.getElementById('aksesori-utama')?.value || '';
  const extra = getExtra();

  const AKSESORI_MAP = {
    aviator:              { desc: 'classic aviator sunglasses — teardrop-shaped lenses, thin gold or silver metal frame, dark mirrored or tinted lenses', place: 'resting on the nose bridge and ears, centered symmetrically on the face', glasses: true },
    wayfarer:             { desc: 'classic wayfarer sunglasses — rectangular thick black plastic frame, dark tinted lenses', place: 'resting on the nose bridge and ears, centered symmetrically on the face', glasses: true },
    round_sunglasses:     { desc: 'round John Lennon-style sunglasses — small perfectly round thin metal frame, dark or mirrored tinted lenses', place: 'centered on the nose bridge', glasses: true },
    cat_eye:              { desc: 'cat-eye sunglasses — pointed upswept outer corners, retro-glam style, dark or colored lenses', place: 'centered on the nose bridge', glasses: true },
    clear_glasses:        { desc: 'clear prescription glasses — slim classic frame, transparent or very lightly tinted lenses, professional and formal', place: 'resting naturally on the nose bridge, temples hooked over both ears', glasses: true },
    thin_frame:           { desc: 'ultra-thin wire frame prescription glasses — minimal elegant style, clear lenses, sophisticated', place: 'resting on the nose bridge', glasses: true },
    stylish_glasses:      { desc: 'bold thick-frame fashion glasses — large rectangular or round frames, clear or lightly tinted lenses, strong style statement', place: 'centered on the nose bridge', glasses: true },
    anting_pria_stud:     { desc: 'a small silver or gold stud earring — simple round or ball-shaped', place: 'on the left earlobe', glasses: false },
    anting_pria_hoop:     { desc: 'a small to medium silver or gold hoop earring', place: 'on the left earlobe', glasses: false },
    anting_pria_dangle:   { desc: 'a dangle/drop earring — small cross, feather, or chain drop, masculine design', place: 'on the left ear', glasses: false },
    anting_wanita_studs:  { desc: 'diamond or gemstone stud earrings — sparkling and elegant', place: 'on both earlobes', glasses: false },
    anting_wanita_hoop:   { desc: 'gold hoop earrings — medium sized, elegant and feminine', place: 'on both ears', glasses: false },
    anting_wanita_chandelier: { desc: 'chandelier drop earrings — long, layered, ornate and luxurious', place: 'on both ears', glasses: false },
    kalung_rantai_emas:   { desc: 'a gold chain necklace — medium thickness, classic Cuban or rope chain style', place: 'around the neck, visible at the collar area', glasses: false },
    kalung_rantai_perak:  { desc: 'a silver chain necklace — sleek and modern', place: 'around the neck, visible at the collar area', glasses: false },
    kalung_dogtag:        { desc: 'military dog tag / ID tag — rectangular metal plate on a thin chain', place: 'around the neck, hanging at chest level', glasses: false },
    kalung_liontin:       { desc: 'a pendant necklace — meaningful symbol on a thin chain', place: 'around the neck', glasses: false },
    kalung_formal_wanita: { desc: 'pearl or crystal necklace — elegant single or multi-strand, formal and refined', place: 'around the neck at collar area', glasses: false },
    jam_formal:           { desc: 'a classic formal watch — round face, leather strap (black or dark brown), elegant and professional', place: 'on the left wrist', glasses: false },
    jam_metal:            { desc: 'a stainless steel metal bracelet watch — polished silver or gold tone finish', place: 'on the left wrist', glasses: false },
    jam_smartwatch:       { desc: 'a modern smart watch — square face, rubber or silicone sport band', place: 'on the left wrist', glasses: false },
    jam_casual:           { desc: 'a casual watch — round face, rubber or fabric strap, sporty and relaxed style', place: 'on the left wrist', glasses: false },
    combo_bad_boy:        { desc: 'COMBINATION: (1) bold aviator or wayfarer sunglasses, (2) small stud or hoop earring on one ear, (3) thick gold or silver chain necklace', place: 'sunglasses on face, earring on ear, chain around neck', glasses: true },
    combo_elegant_pria:   { desc: 'COMBINATION: (1) ultra-thin wire frame clear glasses, (2) polished stainless steel watch', place: 'glasses on face, watch on left wrist', glasses: true },
    combo_street:         { desc: 'COMBINATION: (1) dark wayfarer sunglasses, (2) thick gold or silver chain necklace — urban streetwear aesthetic', place: 'sunglasses on face, chain around neck', glasses: true },
  };

  const item = AKSESORI_MAP[aksesori] || { desc: aksesori, place: 'appropriately on the subject', glasses: false };

  return `You are a professional photo editor specializing in realistic accessory compositing.

Accessory to add:
${item.desc}

Placement: ${item.place}

What to do:
1. Add the described accessory onto the subject in a photorealistic way — match the scene's lighting direction, add appropriate reflections and shadows
2. Ensure the accessory fits naturally to the subject's face/body proportions and pose
3. The accessory must integrate seamlessly — no floating objects, no hard cutout edges, no compositing artifacts
${item.glasses ? `4. Glasses must sit naturally on the nose bridge — lenses show realistic reflections matching the scene's light
5. Frame temples rest naturally over the ears — not floating or misaligned` : `4. Ensure natural contact and interaction with clothing/skin — realistic drape, shadow, and material reflection`}
${extra ? '\nAdditional detail: ' + extra : ''}
${WAJAH_RULE}
- CRITICAL: The face must remain clearly visible — accessories complement, not obscure the face
- Sunglasses/glasses may naturally cover the eye area as they would in real life — but must NOT completely hide the eyes`;
}

/* ════════════════════════════════════
   TATO — render + build
════════════════════════════════════ */
function renderOpsiTato() {
  return `<div class="opt-group">
    <div class="opt-label">Cara Deskripsi Motif</div>
    <select class="opt-select" id="tato-mode" onchange="renderTatoSubOptions()">
      <option value="preset">Pilih dari Preset Motif</option>
      <option value="deskripsi">Deskripsi Bebas (ketik sendiri)</option>
      <option value="referensi">Dari Foto Referensi (upload 2 foto)</option>
    </select>
  </div>
  <div id="tato-sub-options"></div>`;
}

function renderTatoSubOptions() {
  const mode = document.getElementById('tato-mode')?.value || 'preset';
  const container = document.getElementById('tato-sub-options');
  if (!container) return;

  const lokasiSelect = `<div class="opt-group">
    <div class="opt-label">Lokasi di Tubuh</div>
    <select class="opt-select" id="tato-lokasi">
      <optgroup label="Lengan">
        <option value="right forearm (inner side)">Lengan Bawah Kanan — Sisi Dalam</option>
        <option value="left forearm (inner side)">Lengan Bawah Kiri — Sisi Dalam</option>
        <option value="right upper arm (bicep area)">Lengan Atas Kanan (Bisep)</option>
        <option value="left upper arm (bicep area)">Lengan Atas Kiri (Bisep)</option>
        <option value="full right sleeve (entire right arm from shoulder to wrist)">Full Sleeve Kanan — Seluruh Lengan</option>
        <option value="full left sleeve (entire left arm from shoulder to wrist)">Full Sleeve Kiri — Seluruh Lengan</option>
      </optgroup>
      <optgroup label="Tangan & Jari">
        <option value="back of the right hand">Punggung Tangan Kanan</option>
        <option value="fingers of the right hand">Jari-jari Tangan Kanan</option>
      </optgroup>
      <optgroup label="Dada & Bahu">
        <option value="upper chest / collarbone area">Dada Atas / Tulang Selangka</option>
        <option value="left chest area (over the heart)">Dada Kiri (Di Atas Jantung)</option>
        <option value="right shoulder and upper arm">Bahu Kanan dan Lengan Atas</option>
      </optgroup>
      <optgroup label="Leher & Belakang">
        <option value="back of the neck (nape area)">Belakang Leher / Tengkuk</option>
        <option value="side of the neck (left side)">Samping Leher Kiri</option>
      </optgroup>
    </select>
  </div>`;

  const gayaSelect = `<div class="opt-group">
    <div class="opt-label">Gaya Tato</div>
    <select class="opt-select" id="tato-gaya">
      <option value="realistic black and gray tattoo style — detailed shading and depth">Realistik — Hitam Abu Shading</option>
      <option value="fine line minimalist tattoo — ultra-thin precise black lines, delicate and clean">Minimalis Fine Line — Garis Tipis Presisi</option>
      <option value="geometric tattoo — precise symmetrical shapes and patterns, clean black lines">Geometric — Pola Simetris Presisi</option>
      <option value="traditional old school American tattoo style — bold black outlines, flat bright colors">Old School American — Bold & Warna Terang</option>
      <option value="Japanese irezumi style — detailed artwork with waves, koi, dragons, bold outlines">Japanese Irezumi — Koi, Naga, Ombak</option>
      <option value="tribal tattoo — bold solid black geometric tribal patterns">Tribal — Motif Geometri Hitam Tebal</option>
      <option value="watercolor tattoo style — soft flowing color washes, no hard outlines, painterly">Watercolor — Cat Air, Warna Lembut</option>
      <option value="blackwork tattoo — solid black ink fills, bold graphic impact">Blackwork — Isian Hitam Solid</option>
      <option value="neo-traditional tattoo — bold lines, rich vivid colors, illustrative style">Neo-Traditional — Warna Kaya & Ilustratif</option>
    </select>
  </div>`;

  if (mode === 'referensi') {
    container.innerHTML = `<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>2 foto</strong>: <strong>(1)</strong> foto orang, <strong>(2)</strong> foto referensi motif tato yang diinginkan.</span></div>
    ${lokasiSelect}${gayaSelect}
    ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: ukuran sedang, balik arah / mirror, hitam putih saja')}`;
  } else if (mode === 'preset') {
    container.innerHTML = `<div class="opt-group">
      <div class="opt-label">Pilih Tema Motif</div>
      <select class="opt-select" id="tato-preset">
        <optgroup label="Hewan & Alam">
          <option value="a fierce roaring lion head with detailed mane and realistic shading">Singa Mengaum — Realistik Gagah</option>
          <option value="a majestic eagle with spread wings, detailed feathers">Elang Mengembangkan Sayap</option>
          <option value="a koi fish swimming among waves and lotus flowers, Japanese style">Ikan Koi & Lotus — Japanese Style</option>
          <option value="a howling wolf head with moon and pine trees silhouette">Serigala & Bulan — Howling Wolf</option>
          <option value="a coiling serpent / cobra snake with detailed scales">Ular / Kobra Melingkar</option>
          <option value="a realistic rose with thorns, black and gray shading">Bunga Mawar — Realistik Shading</option>
          <option value="cherry blossom branches with falling petals, fine line Japanese style">Bunga Sakura — Japanese Fine Line</option>
          <option value="a detailed skull with roses, traditional old school style">Tengkorak & Mawar — Old School</option>
        </optgroup>
        <optgroup label="Geometric & Minimalis">
          <option value="a sacred geometry mandala pattern, intricate fine lines, circular symmetry">Mandala Sacred Geometry</option>
          <option value="minimalist mountain range silhouette, fine line, simple and clean">Pegunungan Minimalis — Fine Line</option>
          <option value="geometric wolf head composed of triangles and sharp lines">Serigala Geometric — Segitiga</option>
          <option value="compass rose with geometric details and coordinates">Kompas Geometric</option>
          <option value="minimalist single-line continuous portrait drawing">Single Line Art — Satu Garis Menerus</option>
        </optgroup>
        <optgroup label="Tulisan & Kaligrafi">
          <option value="Arabic calligraphy script — elegant flowing brushstroke lines">Kaligrafi Arab — Khat Indah</option>
          <option value="Latin cursive quote in elegant handwriting script">Tulisan Latin — Kursif Elegan</option>
          <option value="Japanese kanji characters in bold brush stroke style">Kanji Jepang — Brush Stroke</option>
        </optgroup>
        <optgroup label="Budaya Indonesia">
          <option value="Polynesian / Maori tribal pattern — interlocking traditional motifs">Tribal Polinesia / Maori</option>
          <option value="Javanese batik-inspired intricate floral and geometric pattern">Motif Batik Jawa — Floral Geometri</option>
          <option value="Dayak Borneo tribal tattoo — traditional warrior motifs and symbols">Tato Dayak Borneo — Motif Suku</option>
        </optgroup>
      </select>
    </div>
    ${lokasiSelect}${gayaSelect}
    ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: tambah bintang kecil, warna hitam saja, ukuran sedang')}`;
  } else {
    container.innerHTML = `<div class="opt-group">
      <div class="opt-label">Deskripsi Motif Tato</div>
      <div class="opt-hint">Deskripsikan motif yang diinginkan secara bebas</div>
      <textarea class="opt-textarea" id="tato-deskripsi" placeholder="Contoh: singa mengaum realistik, bunga mawar hitam putih, tulisan Arab kaligrafi, pola geometric segitiga, naga melingkar..." rows="3" oninput="checkReady()"></textarea>
    </div>
    ${lokasiSelect}${gayaSelect}
    ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: ukuran kecil saja, tambahkan shading halus, warna hitam saja')}`;
  }
}

function buildPromptTato() {
  const mode = document.getElementById('tato-mode')?.value || 'preset';
  const extra = getExtra();
  const lokasi = document.getElementById('tato-lokasi')?.value || 'right forearm (inner side)';
  const gaya = document.getElementById('tato-gaya')?.value || 'realistic black and gray tattoo style';

  if (mode === 'referensi') {
    return `You are a professional photo editor specializing in photorealistic tattoo compositing.

Photo instructions:
- PHOTO 1: The person who will receive the tattoo
- PHOTO 2: The reference tattoo motif / design to apply

What to do:
1. Apply the tattoo design from PHOTO 2 onto the subject's ${lokasi} in PHOTO 1
2. Replicate the design as accurately as possible — shapes, lines, shading, and proportions
3. Style: ${gaya}
4. The tattoo must wrap naturally around the body's curves and muscle contours
5. Match the tattoo's ink tone to look naturally integrated into the skin — realistic ink-under-skin appearance
6. Add skin texture overlay on the tattoo — it must look like actual ink, not a digital sticker
7. Ensure lighting on the tattoo matches PHOTO 1's light direction
${extra ? '\nAdditional note: ' + extra : ''}
${WAJAH_RULE}
- REMINDER: Upload BOTH photos — Photo 1 (person) then Photo 2 (tattoo reference)
- CRITICAL: Apply tattoo ONLY to the specified body area. Do NOT add tattoos to the face`;
  }

  const motif = mode === 'preset'
    ? document.getElementById('tato-preset')?.value || 'abstract geometric design'
    : document.getElementById('tato-deskripsi')?.value?.trim() || 'abstract tattoo design';

  return `You are a professional photo editor specializing in photorealistic tattoo compositing.

Tattoo specifications:
- Motif / design: ${motif}
- Style: ${gaya}
- Placement: ${lokasi}

What to do:
1. Add the tattoo described above onto the subject's ${lokasi} in a photorealistic manner
2. Design the motif faithfully: ${motif}
3. Apply in ${gaya}
4. The tattoo must follow and wrap the natural contours of the body part
5. Apply proper ink tone — realistic ink-under-skin appearance, not a digital overlay
6. Integrate skin texture naturally over the tattoo
7. Match lighting and shadows of the tattoo to the existing photo's light source
8. The tattoo should look naturally healed — not fresh or swollen
${extra ? '\nAdditional note: ' + extra : ''}
${WAJAH_RULE}
- CRITICAL: Apply tattoo ONLY to the specified body area. Do NOT add tattoos to the face unless explicitly requested`;
}

/* ════════════════════════════════════
   HAPUS OBJEK — render + build
════════════════════════════════════ */
function renderOpsiHapusObjek() {
  return `<div class="opt-group">
    <div class="opt-label">Jenis Objek yang Dihapus</div>
    <select class="opt-select" id="hapus-jenis" onchange="checkReady()">
      <option value="">— Pilih jenis objek —</option>
      <option value="a person or people">Orang / manusia</option>
      <option value="a vehicle (car, motorbike, bicycle, etc.)">Kendaraan (mobil, motor, dll)</option>
      <option value="a background object or prop">Benda / properti latar</option>
      <option value="a text overlay, logo, or watermark">Teks, logo, atau watermark</option>
      <option value="an animal">Hewan</option>
      <option value="a shadow or reflection">Bayangan atau pantulan</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Area / Lokasi Objek (opsional)</div>
    <div class="opt-hint">Bantu AI menemukan objek yang tepat — isi jika ada lebih dari satu objek serupa</div>
    <textarea class="opt-textarea" id="hapus-lokasi" placeholder="Contoh: orang di sebelah kiri, motor di pojok belakang, watermark di sudut kanan bawah..." rows="2" oninput="checkReady()"></textarea>
  </div>
  ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: isi background dengan rerumputan natural, sesuaikan warna dengan sekitar')}`;
}

function buildPromptHapusObjek() {
  const jenis  = document.getElementById('hapus-jenis')?.value;
  const lokasi = document.getElementById('hapus-lokasi')?.value?.trim() || '';
  const extra  = getExtra();
  if (!jenis) { showToast('Pilih jenis objek yang dihapus dulu.', 'error'); return null; }
  const locationNote = lokasi ? `\nObject location: ${lokasi}` : '';
  return `You are a professional photo editor specializing in seamless object removal. Remove the unwanted element from this photo and fill the area naturally.

What to remove: ${jenis}${locationNote}

What to do:
1. Precisely identify and remove the specified object from the photo
2. Fill the removed area with natural-looking background content that matches the surrounding area — texture, color, lighting, and perspective must be seamless
3. Ensure there are no visible artifacts, blurring, or smearing at the edges of the removed area
4. The result must look like the object was never in the photo
5. Do not alter any other part of the photo outside the removed area
${extra ? '\nAdditional instructions: ' + extra : ''}
${WAJAH_RULE}
- NEVER remove or alter any person's face unless they are the object being removed
- If removing a person: preserve the background behind them as if they were never there`;
}

/* ════════════════════════════════════
   FOTO PRODUK — render + build
════════════════════════════════════ */
function renderOpsiFotoProduk() {
  const chips = [
    { label: '🛒 Marketplace',  set: { 'produk-jenis': 'general product',                                    'produk-bg': 'pure white (#FFFFFF)',                                  'produk-tampil': 'single product centered, clean and sharp' } },
    { label: '👗 Fashion',      set: { 'produk-jenis': 'clothing or apparel (baju, kaos, celana, jaket, dll)', 'produk-bg': 'clean light gray',                                      'produk-tampil': 'single product centered, clean and sharp' } },
    { label: '🍱 Makanan',      set: { 'produk-jenis': 'food or beverage product',                           'produk-bg': 'pastel lifestyle backdrop matching the product color',   'produk-tampil': 'flat lay top-down view' } },
    { label: '📎 ATK / Toko',   set: { 'produk-jenis': 'stationery or office supply (ATK)',                  'produk-bg': 'pure white (#FFFFFF)',                                  'produk-tampil': 'single product centered, clean and sharp' } },
    { label: '💄 Kosmetik',     set: { 'produk-jenis': 'cosmetics or skincare product',                      'produk-bg': 'pastel lifestyle backdrop matching the product color',   'produk-tampil': 'slight angle view (3/4 perspective) to show depth' } },
  ];
  return `${renderPresetChips(chips)}
  <div class="opt-group">
    <div class="opt-label">Jenis Produk</div>
    <select class="opt-select" id="produk-jenis" onchange="checkReady()">
      <option value="general product">— Produk umum (default) —</option>
      <option value="clothing or apparel (baju, kaos, celana, jaket, dll)">Pakaian (baju, kaos, jaket, dll)</option>
      <option value="shoes or footwear">Sepatu / alas kaki</option>
      <option value="bag or accessories (tas, dompet, ikat pinggang)">Tas &amp; aksesori</option>
      <option value="food or beverage product">Makanan / minuman</option>
      <option value="electronics or gadget">Elektronik / gadget</option>
      <option value="cosmetics or skincare product">Kosmetik / skincare</option>
      <option value="stationery or office supply (ATK)">ATK / alat tulis kantor</option>
      <option value="household item or home decor">Peralatan rumah / dekorasi</option>
      <option value="general product">Lainnya — produk umum</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Background</div>
    <select class="opt-select" id="produk-bg" onchange="checkReady()">
      <option value="pure white (#FFFFFF)">Putih bersih — standar marketplace</option>
      <option value="clean light gray">Abu-abu muda — modern &amp; elegan</option>
      <option value="soft gradient white-to-light gray">Gradien putih ke abu (bawah bayangan)</option>
      <option value="transparent (remove background entirely)">Transparan / hapus background</option>
      <option value="pastel lifestyle backdrop matching the product color">Lifestyle pastel — cocok brand aesthetic</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Tampilan Produk</div>
    <select class="opt-select" id="produk-tampil" onchange="checkReady()">
      <option value="single product centered, clean and sharp">Satu produk — center, fokus tajam</option>
      <option value="product with subtle natural shadow beneath it">Dengan bayangan natural di bawah produk</option>
      <option value="flat lay top-down view">Flat lay — top-down view</option>
      <option value="slight angle view (3/4 perspective) to show depth">3/4 angle — memperlihatkan dimensi</option>
    </select>
  </div>
  ${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: tampilkan semua sisi produk, warna harus accurate, hilangkan label harga')}`;
}

function buildPromptFotoProduk() {
  let jenis    = document.getElementById('produk-jenis')?.value;
  const bg     = document.getElementById('produk-bg')?.value   || 'pure white (#FFFFFF)';
  const tampil = document.getElementById('produk-tampil')?.value || 'single product centered, clean and sharp';
  const extra  = getExtra();
  if (!jenis) jenis = 'general product';
  return `You are a professional e-commerce product photographer and photo editor. Edit this product photo to meet professional marketplace standards for Shopee, Tokopedia, Instagram, and similar platforms.

Product type: ${jenis}

What to do:
1. Background: replace with ${bg} — perfectly clean, no visible seams or gradients unless specified
2. Product presentation: ${tampil}
3. Isolate the product cleanly from the original background — precise edges with no fringing or halos
4. Apply bright, even, soft studio lighting — no harsh shadows on the product itself, well-lit from all visible angles
5. Sharpen product details so textures, labels, and features are clearly visible
6. Correct white balance and color accuracy — the product color must look true-to-life
7. Remove any distracting elements: dust, fingerprints, price tags, reflections (unless natural to the product)
8. Final output should look professional and ready to upload directly to an online store
${extra ? '\nSpecial request: ' + extra : ''}
- DO NOT alter the product itself, add fake elements, or change the product design
- Preserve all text, branding, and logos on the product as-is`;
}

/* ════════════════════════════════════
   FOTO COUPLE — render + build
════════════════════════════════════ */
function renderOpsiFotoCouple() {
  const chips = [
    { label: '💍 KUA / Lamaran',   set: { 'couple-mode': 'rapikan', 'couple-style': 'elegant formal portrait, clean and professional', 'couple-bg': 'clean white studio background with soft even lighting' } },
    { label: '💑 Romantis',        set: { 'couple-mode': 'rapikan', 'couple-style': 'casual romantic, warm and natural',               'couple-bg': 'golden hour warm sunset sky background, romantic lighting' } },
    { label: '🎉 Anniversary',     set: { 'couple-mode': 'rapikan', 'couple-style': 'casual romantic, warm and natural',               'couple-bg': 'soft bokeh park with lush greenery, natural outdoor lighting' } },
    { label: '🧑‍🤝‍🧑 Gabung 2 Foto', set: { 'couple-mode': 'gabung', 'couple-style': 'clean modern minimalist, neutral tones',         'couple-bg': 'keep the original background' } },
    { label: '🎞️ Vintage',        set: { 'couple-mode': 'rapikan', 'couple-style': 'vintage film photography style, warm tones',       'couple-bg': 'keep the original background' } },
  ];
  return `${renderPresetChips(chips)}
  <div class="opt-group">
    <div class="opt-label">Mode Foto</div>
    <select class="opt-select" id="couple-mode" onchange="onCoupleModeChange(this)">
      <option value="gabung">2 Foto — Gabungkan 2 foto terpisah jadi 1</option>
      <option value="rapikan">1 Foto — Sudah berdua, perlu dirapikan / di-edit</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Gaya Foto</div>
    <select class="opt-select" id="couple-style" onchange="checkReady()">
      <option value="casual romantic, warm and natural">Casual romantis — natural &amp; hangat</option>
      <option value="elegant formal portrait, clean and professional">Formal elegan — bersih &amp; profesional</option>
      <option value="fun and playful, vibrant colors">Fun &amp; playful — warna-warni ceria</option>
      <option value="vintage film photography style, warm tones">Vintage film — tone hangat nostalgia</option>
      <option value="clean modern minimalist, neutral tones">Modern minimalis — tone netral bersih</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Background</div>
    <select class="opt-select" id="couple-bg" onchange="checkReady()">
      <option value="keep the original background">Pertahankan background asli</option>
      <option value="soft bokeh park with lush greenery, natural outdoor lighting">Taman hijau bokeh — outdoor natural</option>
      <option value="clean white studio background with soft even lighting">Studio putih bersih</option>
      <option value="golden hour warm sunset sky background, romantic lighting">Sunset golden hour — romantis</option>
      <option value="cozy indoor cafe ambiance, warm lights">Cafe cozy — lampu hangat</option>
      <option value="tropical beach with turquoise sea and blue sky">Pantai tropis — laut biru jernih</option>
      <option value="soft gradient pastel background, clean and aesthetic">Pastel gradient — estetik minimalis</option>
    </select>
  </div>
  ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: tambahkan teks anniversary, wajah berdekatan, keduanya senyum natural, tone lebih hangat')}`;
}

function onCoupleModeChange(sel) {
  if (sel.value === 'gabung') {
    setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>2 foto</strong> ke platform AI: <strong>(1)</strong> foto orang pertama, <strong>(2)</strong> foto orang kedua. AI akan menggabungkan keduanya menjadi 1 foto berdampingan.</span></div>`);
  } else {
    setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>1 foto</strong> — foto berdua yang sudah ada. AI akan merapikan dan mempercantik foto tersebut.</span></div>`);
  }
}

function buildPromptFotoCouple() {
  const mode   = document.getElementById('couple-mode')?.value || 'gabung';
  const style  = document.getElementById('couple-style')?.value || 'casual romantic, warm and natural';
  const bg     = document.getElementById('couple-bg')?.value || 'keep the original background';
  const extra  = getExtra();
  const bgNote = bg === 'keep the original background'
    ? 'Keep the original background as-is — do not replace it'
    : `Replace the background with: ${bg} — seamless and natural looking`;

  if (mode === 'gabung') {
    return `You are a professional photo editor specializing in couple and portrait photography. You are given TWO separate photos — one of each person. Combine them into a single natural couple photo.

Photo instructions:
- PHOTO 1 (first image): Person 1
- PHOTO 2 (second image): Person 2

What to do:
1. Merge both photos into a single image — position them naturally side by side or slightly angled toward each other, as if photographed together
2. Normalize scale so both people appear at a proportionally matching height and size
3. Blend the lighting between both photos so it looks consistent — as if taken in the same place at the same time
4. ${bgNote}
5. Style: ${style} — adjust color grading, mood, and lighting atmosphere to match this style
6. Ensure the seam between the two merged photos is completely invisible
7. Final result should look like a genuine couple photo taken together
${extra ? '\nSpecial request: ' + extra : ''}
${WAJAH_RULE}`;
  }

  return `You are a professional photo editor specializing in couple and portrait photography. Edit this couple photo to look polished and beautiful.

What to do:
1. ${bgNote}
2. Style: ${style} — apply appropriate color grading, mood, and lighting atmosphere
3. Ensure both subjects are well-lit, clearly visible, and naturally positioned
4. Smooth out any distracting elements — wrinkled clothing, harsh shadows, uneven skin lighting
5. Enhance overall photo quality: sharpness, color balance, and atmosphere
6. The result should feel authentic and natural — not overly retouched
${extra ? '\nSpecial request: ' + extra : ''}
${WAJAH_RULE}`;
}

/* ════════════════════════════════════
   GANTI POSE — render + build
════════════════════════════════════ */
function renderOpsiGantiPose() {
  const bgOptions = BG_PRESETS.studio.items.map(i => `<option value="${i.value}">${i.label}</option>`).join('');
  return `<div class="opt-group">
    <div class="opt-label">Komposisi / Framing</div>
    <select class="opt-select" id="pose-komposisi">
      <option value="close-up portrait, face and shoulders only">Close-up Portrait — Wajah & Bahu</option>
      <option value="half-body portrait, waist up">Half-body — Pinggang ke Atas</option>
      <option value="full-body portrait, head to toe">Full-body — Kepala ke Kaki</option>
      <option value="three-quarter portrait, knees up">Three-quarter — Lutut ke Atas</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Pose</div>
    <select class="opt-select" id="pose-gaya">
      <option value="standing upright, formal posture, hands at sides or clasped in front">Berdiri Formal</option>
      <option value="standing in a relaxed casual pose, natural and confident">Berdiri Kasual / Natural</option>
      <option value="sitting in a neat upright position, formal">Duduk Formal</option>
      <option value="sitting in a relaxed and comfortable pose">Duduk Santai</option>
      <option value="slight 3/4 angle turn toward camera, one shoulder forward">3/4 Angle — Badan Sedikit Miring</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Background</div>
    <select class="opt-select" id="pose-bg">
      <option value="keep the original background">Pakai background asli</option>
      ${bgOptions}
    </select>
  </div>
  ${renderOpsiExtra('Catatan tambahan (opsional)', 'Contoh: tangan di saku, lihat ke kiri, ekspresi senyum tipis')}`;
}

function buildPromptGantiPose() {
  const komposisi = document.getElementById('pose-komposisi')?.value || 'half-body portrait, waist up';
  const gaya      = document.getElementById('pose-gaya')?.value || 'standing upright, formal posture';
  const bg        = document.getElementById('pose-bg')?.value || 'keep the original background';
  const extra     = getExtra();
  const bgNote    = bg === 'keep the original background'
    ? 'Keep the original background exactly as-is'
    : `Replace the background with: ${bg} — seamless, natural looking`;

  return `You are a professional photo editor and AI image compositor. Your task is to change the pose and composition of the person in this photo.

Changes to make:
1. Reframe and recompose the shot as: ${komposisi}
2. Adjust the body pose to: ${gaya}
3. Background: ${bgNote}
4. Match the lighting direction and quality from the original photo
5. Ensure clothing and overall appearance remain consistent with the original
6. Final result should look like a natural, professionally taken photo
${extra ? '\nAdditional request: ' + extra : ''}

${WAJAH_RULE}`;
}

/* ════════════════════════════════════
   ANIME / KARTUN — render + build
════════════════════════════════════ */
function renderOpsiAnimeKartun() {
  return `<div class="opt-group">
    <div class="opt-label">Gaya Seni</div>
    <select class="opt-select" id="anime-gaya">
      <option value="Japanese anime style, clean line art, vibrant colors, Studio Ghibli-inspired warm atmosphere">Anime Jepang — Studio Ghibli</option>
      <option value="Disney-Pixar 3D animation style, expressive eyes, smooth rendering, cinematic lighting">Disney-Pixar 3D</option>
      <option value="cute chibi style, oversized head, small body, big sparkly eyes, pastel colors">Chibi — Super Cute</option>
      <option value="flat vector illustration style, bold outlines, clean geometric shapes, limited color palette">Flat Vector / Ilustrasi</option>
      <option value="semi-realistic digital art, painterly style, detailed shading, artistic but still recognizable">Semi-realistis Digital Art</option>
      <option value="webtoon manhwa style, Korean comic art, clean lines, expressive characters">Webtoon / Manhwa Korea</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Background</div>
    <select class="opt-select" id="anime-bg">
      <option value="keep the original background but stylize it to match the art style">Background asli (distilisasi)</option>
      <option value="simple clean gradient background matching the art style color palette">Gradien Polos — Minimalis</option>
      <option value="soft dreamy sky with clouds, matching the illustration style">Langit & Awan — Dreamy</option>
      <option value="cozy Japanese town street background, illustrated style">Jalan Kota Jepang — Cozy</option>
      <option value="magic forest with glowing lights, illustrated style">Hutan Magis — Fantasy</option>
      <option value="clean white background, transparent-like, character focus only">Background Putih Bersih</option>
    </select>
  </div>
  ${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: warna rambut jadi hitam, pakai seragam sekolah, ekspresi ceria')}`;
}

function buildPromptAnimeKartun() {
  const gaya  = document.getElementById('anime-gaya')?.value || 'Japanese anime style, vibrant colors';
  const bg    = document.getElementById('anime-bg')?.value || 'keep the original background but stylize it to match the art style';
  const extra = getExtra();

  return `You are a professional AI artist specializing in photo-to-illustration conversion. Convert this photo into the requested art style while preserving the subject's identity and recognizability.

Art style: ${gaya}

Instructions:
1. Fully convert the photo into the specified art style — the entire image should feel like hand-drawn or digitally illustrated art
2. Background: ${bg}
3. Preserve the subject's key identity features: face shape, hair color/style, general clothing, skin tone — stylized but still clearly the same person
4. Apply style-appropriate color grading, shading, and linework consistent with the art style
5. Lighting and atmosphere should match the chosen art style aesthetic
6. The result should feel like a professional, polished illustration — not a filter effect
${extra ? '\nAdditional creative direction: ' + extra : ''}

🎨 ARTISTIC IDENTITY PRESERVATION:
While full artistic stylization of ALL features (including the face) is expected and desired, the subject must remain recognizable as the same person. Preserve the essence of their face shape, distinctive features, hair, and overall appearance. This is an artistic transformation — not a face replacement.`;
}

/* ════════════════════════════════════
   RETOUCH — Options & Prompt
════════════════════════════════════ */
function renderOpsiRetouch() {
  return `
  <div class="opt-group">
    <div class="opt-label">Jenis Kelamin</div>
    <select class="opt-select" id="gender">
      <option value="pria">Pria</option>
      <option value="wanita">Wanita</option>
      <option value="wanita-hijab">Wanita Berhijab</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Area Retouch <span style="font-size:10px;color:var(--text-3)">(pilih satu atau lebih)</span></div>
    <div style="display:flex;flex-direction:column;gap:8px;padding:4px 0">
      <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;font-family:'Sora',sans-serif"><input type="checkbox" id="rt-kulit" onchange="checkReady()"> Kulit &amp; pori — haluskan, ratakan tekstur</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;font-family:'Sora',sans-serif"><input type="checkbox" id="rt-noda" onchange="checkReady()"> Noda, jerawat &amp; bekas luka</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;font-family:'Sora',sans-serif"><input type="checkbox" id="rt-kilap" onchange="checkReady()"> Kilap berminyak (mattify)</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;font-family:'Sora',sans-serif"><input type="checkbox" id="rt-eyebag" onchange="checkReady()"> Eye bags &amp; lingkar hitam</label>
      <label style="display:flex;align-items:center;gap:8px;font-size:12.5px;cursor:pointer;font-family:'Sora',sans-serif"><input type="checkbox" id="rt-gigi" onchange="checkReady()"> Gigi — putihkan sedikit</label>
    </div>
  </div>
  <div class="opt-group">
    <div class="opt-label">Tingkat Retouch</div>
    <select class="opt-select" id="retouch-level">
      <option value="subtle">Ringan — natural, barely noticeable</option>
      <option value="medium" selected>Sedang — jelas lebih bersih</option>
      <option value="strong">Signifikan — perubahan nyata</option>
    </select>
  </div>
  ` + renderOpsiExtra('Permintaan tambahan (opsional)', 'Contoh: pertahankan tahi lalat, fokus area tertentu...') + `
  <div class="note-box">
    <span class="note-icon">🛡️</span>
    <span>Struktur wajah &amp; identitas 100% dipertahankan — hanya surface-level retouching, bukan ubah bentuk wajah.</span>
  </div>`;
}

function buildPromptRetouch() {
  const gender = getGenderLabel();
  const level  = document.getElementById('retouch-level')?.value || 'medium';
  const extra  = getExtra();
  const areas  = [];
  if (document.getElementById('rt-kulit')?.checked)  areas.push('kulit');
  if (document.getElementById('rt-noda')?.checked)   areas.push('noda');
  if (document.getElementById('rt-kilap')?.checked)  areas.push('kilap');
  if (document.getElementById('rt-eyebag')?.checked) areas.push('eyebag');
  if (document.getElementById('rt-gigi')?.checked)   areas.push('gigi');

  const levelMap = {
    subtle: 'subtle and natural — barely noticeable, preserve all skin character',
    medium: 'moderate — clean and polished but still realistic',
    strong: 'significant — clearly enhanced and noticeably cleaner',
  };
  const levelDesc = levelMap[level] || levelMap.medium;

  const instructions = [];
  if (areas.includes('kulit'))  instructions.push('Smooth skin texture and refine pores — reduce roughness while keeping natural skin character');
  if (areas.includes('noda'))   instructions.push('Remove or reduce blemishes, pimples, acne scars, and skin discoloration spots');
  if (areas.includes('kilap'))  instructions.push('Reduce oily shine and skin glare — mattify without losing natural skin tone');
  if (areas.includes('eyebag')) instructions.push('Soften under-eye bags and reduce dark circles');
  if (areas.includes('gigi'))   instructions.push('Subtly whiten teeth — natural white, not overly bleached');
  if (instructions.length === 0) instructions.push('Apply general light retouching — smooth skin texture, reduce minor blemishes, even skin tone');

  const hijabNoteStr = getGender() === 'wanita-hijab'
    ? '\n⚠️ Hijab: do not alter, move, or remove the hijab — keep it exactly as in the original photo.' : '';

  return `You are a professional portrait retouching specialist. Apply ${levelDesc} retouching to this portrait photo of a ${gender} subject.

Retouching tasks:
${instructions.map((t, i) => `${i + 1}. ${t}`).join('\n')}
${extra ? '\nSpecial requests: ' + extra : ''}${hijabNoteStr}

⚠️ ABSOLUTE RESTRICTIONS — NEVER DO THESE:
- NEVER change the shape, structure, or proportions of ANY facial features (eyes, nose, mouth, lips, jawline, face contour)
- NEVER change the person's skin tone or complexion — only surface texture improvement
- NEVER add makeup, contouring, or artificial filters unless explicitly requested
- NEVER alter the background, clothing, hair, or any non-skin area
- NEVER make the result look "plastic" or unnatural — realism is the priority
- Preserve all natural distinctive features (birthmarks, moles) unless explicitly listed as blemishes to remove
- The person must be 100% identifiable as the same individual after retouching

The result should look like a professionally photographed portrait — natural, clean, and authentic.`;
}

/* ════════════════════════════════════
   FOTO PROFIL SOSMED — Options & Prompt
════════════════════════════════════ */
function renderOpsiFotoProfil() {
  const chips = [
    { label: '💼 LinkedIn',   set: { 'profil-platform': 'linkedin',  'profil-gaya': 'profesional', 'profil-bg': 'studio-putih' } },
    { label: '📸 Instagram',  set: { 'profil-platform': 'instagram', 'profil-gaya': 'kreatif',     'profil-bg': 'blur-alam' } },
    { label: '💬 WhatsApp',   set: { 'profil-platform': 'whatsapp',  'profil-gaya': 'kasual',      'profil-bg': 'blur-alam' } },
    { label: '🎵 TikTok',     set: { 'profil-platform': 'tiktok',    'profil-gaya': 'kreatif',     'profil-bg': 'gradient' } },
    { label: '⚡ Semua Platform', set: { 'profil-platform': 'umum', 'profil-gaya': 'kasual',       'profil-bg': 'studio-abu' } },
  ];
  return `${renderPresetChips(chips)}
  <div class="opt-group">
    <div class="opt-label">Platform Tujuan</div>
    <select class="opt-select" id="profil-platform">
      <option value="linkedin">💼 LinkedIn — profesional</option>
      <option value="instagram">📸 Instagram</option>
      <option value="facebook">👥 Facebook</option>
      <option value="x">🐦 X / Twitter</option>
      <option value="whatsapp">💬 WhatsApp</option>
      <option value="tiktok">🎵 TikTok</option>
      <option value="umum">⚡ Umum — cocok semua platform</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Gaya Tampilan</div>
    <select class="opt-select" id="profil-gaya">
      <option value="profesional">Profesional — formal, credible, percaya diri</option>
      <option value="kasual">Kasual — friendly, approachable, hangat</option>
      <option value="kreatif">Kreatif — stylish, ekspresif, unik</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Background</div>
    <select class="opt-select" id="profil-bg" onchange="renderProfilBgAdvanced()">
      <option value="studio-putih">Studio putih bersih</option>
      <option value="studio-abu">Studio abu-abu lembut</option>
      <option value="blur-alam">Outdoor blur natural — taman / hijau</option>
      <option value="blur-kantor">Blur kantor / ruang kerja modern</option>
      <option value="gradient">Gradient lembut — modern minimalis</option>
      <option value="existing">Pertahankan background asli</option>
      <option value="custom">✏️ Custom — ketik sendiri</option>
    </select>
  </div>
  <div id="profil-bg-advanced"></div>
  ` + renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: pastikan terlihat ramah, cahaya dari kiri, cropping lebih dekat...');
}

function renderProfilBgAdvanced() {
  const val = document.getElementById('profil-bg')?.value;
  const container = document.getElementById('profil-bg-advanced');
  if (!container) return;
  container.innerHTML = val === 'custom'
    ? `<div class="opt-group"><div class="opt-label">Deskripsi background</div><input class="opt-input" id="profil-bg-custom" type="text" placeholder="Contoh: dinding bata putih, cafe cozy blur, gradien biru lembut"></div>`
    : '';
}

function buildPromptFotoProfil() {
  const platform = document.getElementById('profil-platform')?.value || 'umum';
  const gaya     = document.getElementById('profil-gaya')?.value || 'profesional';
  const bg       = document.getElementById('profil-bg')?.value || 'studio-putih';
  const extra    = getExtra();

  const platformDesc = {
    linkedin:  'LinkedIn professional network — convey credibility, confidence, and professional competence',
    instagram: 'Instagram — vibrant, visually appealing, authentic and relatable',
    facebook:  'Facebook — friendly, warm, approachable and personable',
    x:         'X/Twitter — sharp, direct, and confident personality',
    whatsapp:  'WhatsApp profile — clear and recognizable at small sizes, warm and personal',
    tiktok:    'TikTok — youthful, energetic, expressive and visually engaging',
    umum:      'general social media — clean, versatile, and universally appealing',
  }[platform];

  const gayaDesc = {
    profesional: 'professional and authoritative — clean, confident, smart-casual or formal presentation',
    kasual:      'friendly and approachable — natural, warm, and relatable energy',
    kreatif:     'creative and expressive — stylish, unique, personality-forward',
  }[gaya];

  const bgMap = {
    'studio-putih': 'clean white studio background with soft, even portrait lighting',
    'studio-abu':   'soft light gray studio backdrop with professional portrait lighting',
    'blur-alam':    'natural outdoor background with soft bokeh — green foliage, garden, or park',
    'blur-kantor':  'blurred modern office or workspace background',
    'gradient':     'smooth subtle gradient background — soft modern feel (e.g. light blue-to-white or warm cream)',
    'existing':     'keep the existing background but clean it up — remove distractions and balance lighting',
    'custom':       document.getElementById('profil-bg-custom')?.value?.trim() || 'clean neutral background',
  };
  const bgDesc = bgMap[bg];

  return `You are a professional portrait photographer and photo editor specializing in social media profile photos. Optimize this photo for use as a ${platformDesc}.

Style direction: ${gayaDesc}

Adjustments to make:
1. Background: replace with ${bgDesc}
2. Crop and frame to ideal profile photo composition — face centered, slight head room, shoulders or upper chest visible
3. Optimize lighting: ensure the face is well-lit, bright, and flattering — minimize harsh shadows, fill in dark areas
4. Enhance overall image sharpness and color balance for screen display
5. The subject should appear ${gaya === 'profesional' ? 'professionally presented and confident' : gaya === 'kasual' ? 'naturally friendly and approachable' : 'stylishly expressive and engaging'}
${extra ? '\n6. Additional notes: ' + extra : ''}

${WAJAH_RULE}`;
}

/* ════════════════════════════════════
   ILUSTRASI ARTISTIK — Options & Prompt
════════════════════════════════════ */
function renderOpsiIlustrasi() {
  return `
  <div class="opt-group">
    <div class="opt-label">Gaya Ilustrasi</div>
    <select class="opt-select" id="ilustrasi-gaya">
      <optgroup label="🖼️ Tradisional & Seni Klasik">
        <option value="detailed oil painting in classical style, rich textures, visible brushstrokes, gallery-quality artwork">🎨 Cat Minyak — Klasik</option>
        <option value="soft watercolor painting, delicate color washes, gentle bleeding edges, paper texture visible, dreamy quality">🌊 Cat Air — Lembut</option>
        <option value="detailed pencil sketch, expressive linework, fine shading and cross-hatching, graphite texture, realistic proportions">✏️ Pensil Sketch — Detail</option>
        <option value="charcoal drawing, bold dramatic strokes, rich deep blacks, expressive smudging, strong contrast">🪨 Charcoal — Dramatis</option>
      </optgroup>
      <optgroup label="💻 Digital & Modern">
        <option value="digital illustration, clean bold lines, flat design with subtle cel-shading, vibrant colors, modern editorial style">💻 Digital Illustration — Modern</option>
        <option value="vector-style flat illustration, bold outlines, clean geometric shapes, minimal gradient shading, graphic-design aesthetic">📐 Vector Flat — Minimalis</option>
        <option value="cinematic concept art style, dramatic moody lighting, painterly detail, high-fantasy or sci-fi aesthetic">🎬 Concept Art — Sinematik</option>
        <option value="bold pop art style, thick black outlines, Ben-Day halftone dots, saturated vivid colors, Roy Lichtenstein inspired">🎪 Pop Art — Warna Berani</option>
      </optgroup>
      <optgroup label="⬡ Minimalis & Abstrak">
        <option value="continuous single line art portrait, one unbroken line, elegant minimalist drawing, black on white">⬡ Single Line Art — Elegan</option>
        <option value="geometric low-poly portrait, abstract polygon facets, clean triangulated mesh, modern abstract aesthetic">🔷 Geometric / Low Poly</option>
        <option value="stippling portrait, made entirely of tiny dots, black and white, rich tonal range through dot density">⚫ Stippling — Titik-titik</option>
      </optgroup>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Palet Warna</div>
    <select class="opt-select" id="ilustrasi-warna">
      <option value="natural and lifelike colors faithful to the original photo">Natural — sesuai foto asli</option>
      <option value="warm golden color palette, amber, earthy tones, soft oranges">Hangat — amber &amp; earth tones</option>
      <option value="cool muted palette, soft blues, grays, and teals">Dingin — biru &amp; abu</option>
      <option value="vibrant highly saturated colors, bold high contrast">Vivid — warna cerah kuat</option>
      <option value="black and white with dramatic tonal contrast">Hitam Putih — dramatis</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Background</div>
    <select class="opt-select" id="ilustrasi-bg">
      <option value="stylize the background to complement and enhance the chosen art style">Sesuaikan dengan gaya seni</option>
      <option value="plain white or off-white paper texture background, clean and simple">Polos putih / kertas bersih</option>
      <option value="abstract or minimal background — subject is the clear focus">Abstrak / minimal — fokus ke subjek</option>
    </select>
  </div>
  ` + renderOpsiExtra('Arahan kreasi tambahan (opsional)', 'Contoh: nuansa vintage, tekstur kanvas kasar, tambah efek basah cat air...');
}

function buildPromptIlustrasi() {
  const gaya  = document.getElementById('ilustrasi-gaya')?.value  || 'detailed oil painting in classical style, rich textures, visible brushstrokes';
  const warna = document.getElementById('ilustrasi-warna')?.value || 'natural and lifelike colors faithful to the original photo';
  const bg    = document.getElementById('ilustrasi-bg')?.value    || 'stylize the background to complement and enhance the chosen art style';
  const extra = getExtra();

  return `You are a master fine-art illustrator and digital artist. Transform this photograph into a beautiful, hand-crafted illustration.

Art style: ${gaya}
Color palette: ${warna}
Background: ${bg}
${extra ? '\nAdditional creative direction: ' + extra : ''}

Execution guidelines:
1. Apply the specified art style throughout the ENTIRE image — every element should feel authentically hand-crafted, not like a photo filter
2. Color: ${warna}
3. Background treatment: ${bg}
4. Faithfully capture all compositional elements, lighting direction, and depth from the original photo
5. Apply medium-appropriate techniques: brushstrokes, linework, shading, or texture as fits the chosen style
6. The final result must feel like a professional, gallery-worthy artwork — polished and intentional

🎨 IDENTITY PRESERVATION — MANDATORY:
While this is a full artistic transformation, the subject's essential identity must remain intact:
- The subject's face shape, distinctive features, hair, and overall appearance must be faithfully captured in the chosen art style
- The subject must be clearly recognizable as the same person even after full stylization
- This is an artistic interpretation — not a character redesign or face replacement`;
}

/* ════════════════════════════════════
   COSPLAY — Data, Options & Prompt
════════════════════════════════════ */
const COSPLAY_DATA = {
  anime: [
    { v: 'Naruto Uzumaki — Naruto Shippuden, iconic orange jumpsuit, forehead protector, whisker marks on cheeks effect via costume', l: 'Naruto Uzumaki (Naruto Shippuden)' },
    { v: 'Monkey D. Luffy — One Piece, red vest, straw hat, Gear 5 white hair and outfit version', l: 'Monkey D. Luffy — Gear 5 (One Piece)' },
    { v: 'Roronoa Zoro — One Piece, three-sword style, green haramaki, white shirt', l: 'Roronoa Zoro (One Piece)' },
    { v: 'Tanjiro Kamado — Demon Slayer, black and green checkered haori, Water Breathing swordsman, Water Hashira candidate', l: 'Tanjiro Kamado (Demon Slayer)' },
    { v: 'Nezuko Kamado — Demon Slayer, pink kimono with hemp leaf pattern, bamboo muzzle, purple gradient eyes', l: 'Nezuko Kamado (Demon Slayer)' },
    { v: 'Satoru Gojo — Jujutsu Kaisen, all-white suit, black blindfold headband, six eyes aura, infinity technique visual', l: 'Satoru Gojo (Jujutsu Kaisen)' },
    { v: 'Yuji Itadori — Jujutsu Kaisen, Jujutsu Tech uniform black jacket, pink hair, Divergent Fist pose', l: 'Yuji Itadori (Jujutsu Kaisen)' },
    { v: 'Levi Ackerman — Attack on Titan, Survey Corps uniform, green cape with wings of freedom emblem, ODM gear', l: 'Levi Ackerman (Attack on Titan)' },
    { v: 'Eren Yeager — Attack on Titan, Survey Corps uniform, titan shifter glowing jaw fragment', l: 'Eren Yeager (Attack on Titan)' },
    { v: 'Son Goku — Dragon Ball Z, orange and blue gi, Super Saiyan gold hair, lightning aura effect around costume', l: 'Son Goku Super Saiyan (Dragon Ball Z)' },
    { v: 'Vegeta — Dragon Ball Z, blue Saiyan armor, Super Saiyan transformation aura, royal Saiyan posture', l: 'Vegeta (Dragon Ball Z)' },
    { v: 'Izuku Midoriya (Deku) — My Hero Academia, green Full Cowl suit, lightning aura, red shoes', l: 'Izuku Midoriya / Deku (MHA)' },
    { v: 'Katsuki Bakugo — My Hero Academia, hero costume with grenade gauntlets, explosion sparks, orange mask', l: 'Katsuki Bakugo (My Hero Academia)' },
    { v: 'Denji — Chainsaw Man, Chainsaw Devil hybrid form, chains and blades emerging, Public Safety suit', l: 'Denji / Chainsaw Man' },
    { v: 'Rem — Re:Zero, blue oni maid dress, silver-blue hair, morning star weapon', l: 'Rem (Re:Zero)' },
    { v: 'Sailor Moon — magical girl transformation outfit, white sailor uniform with red bow, twin odango hairstyle, crescent moon tiara', l: 'Sailor Moon' },
    { v: 'Kirigaya Kazuto (Kirito) — Sword Art Online, black swordsman outfit, dual blades, Aincrad background', l: 'Kirito (Sword Art Online)' },
  ],
  superhero: [
    { v: 'Spider-Man classic suit — red and blue full-body spandex suit with black spider web pattern, web-slinging pose', l: 'Spider-Man — Classic Suit (Marvel)' },
    { v: 'Spider-Man No Way Home integrated suit — red and black advanced nano suit, arc reactor chest piece', l: 'Spider-Man — Integrated Suit (MCU)' },
    { v: 'Iron Man Mark 50 — red and gold nanotech armor, arc reactor glowing chest, repulsor beams on palms', l: 'Iron Man — Mark 50 (Marvel MCU)' },
    { v: 'Thor — Norse god armor, red cape, Mjolnir hammer, golden chest plate, electricity aura around costume', l: 'Thor (Marvel MCU)' },
    { v: 'Captain America — blue star-spangled uniform, vibranium shield, "A" helmet, star on chest', l: 'Captain America (Marvel MCU)' },
    { v: 'Black Panther — sleek black vibranium suit with purple energy claw lines, Wakandan warrior stance', l: 'Black Panther (Marvel MCU)' },
    { v: 'Doctor Strange — blue sorcerer robes, Cloak of Levitation, Eye of Agamotto amulet, magical rune portal circle', l: 'Doctor Strange (Marvel MCU)' },
    { v: "Black Widow — black tactical suit, red hourglass emblem, Widow's Bite wrist devices", l: 'Black Widow (Marvel MCU)' },
    { v: 'Batman — dark gothic armored batsuit, black cape, bat emblem on chest, Gotham City dark rooftop background', l: 'Batman (DC)' },
    { v: 'Superman — iconic red and blue suit, cape, "S" shield emblem on chest, cape billowing behind', l: 'Superman (DC)' },
    { v: 'Wonder Woman — Amazonian warrior armor, golden eagle breastplate, tiara, lasso of truth, sword and shield', l: 'Wonder Woman (DC)' },
    { v: 'The Flash — scarlet speed suit with lightning bolt emblem, yellow lightning aura blurring around costume', l: 'The Flash (DC)' },
    { v: 'Aquaman — golden scale armor of Atlantis, trident weapon, underwater kingdom background', l: 'Aquaman (DC)' },
  ],
  game: [
    { v: 'Hu Tao — Genshin Impact, red funeral parlor dress, plum blossom hat with "RIP" tag, ghost Boo companion, amber eyes', l: 'Hu Tao (Genshin Impact)' },
    { v: 'Raiden Shogun — Genshin Impact, Electro Archon purple kimono armor, Musou Isshin sword, purple lightning aura', l: 'Raiden Shogun (Genshin Impact)' },
    { v: 'Venti — Genshin Impact, Anemo Archon bard outfit, teal and dark blue colors, vine accessories, lyre instrument', l: 'Venti (Genshin Impact)' },
    { v: 'Jinx — League of Legends / Arcane, blue twin braids, pink goggles, punk street outfit, rocket launcher Fishbones prop', l: 'Jinx (League of Legends / Arcane)' },
    { v: 'Jett — Valorant, Korean agent, white and blue windrunner outfit, butterfly knives, wind dash effect', l: 'Jett (Valorant)' },
    { v: 'Sage — Valorant, Chinese agent, teal and white healer outfit, Orb of Resurrection glow', l: 'Sage (Valorant)' },
    { v: 'Layla — Mobile Legends, stellar mage outfit, blue and gold celestial dress, crescent pendulum accessory, starfield background', l: 'Layla (Mobile Legends: Bang Bang)' },
    { v: 'Ling — Mobile Legends, Chinese swordsman outfit, white robe, two short swords, bamboo forest background', l: 'Ling (Mobile Legends: Bang Bang)' },
    { v: 'Pharsa — Mobile Legends, forest spirit outfit with wings and nature accessories', l: 'Pharsa (Mobile Legends: Bang Bang)' },
    { v: 'Free Fire character full tactical military outfit, drop zone parachute background, battle royale island setting', l: 'Karakter Free Fire — Taktis Militer' },
    { v: 'PUBG military survivor — tactical vest, helmet, cargo pants, weapon loadout, Erangel map background', l: 'Survivor PUBG — Militer' },
    { v: 'Kratos — God of War, bare chest with Blades of Chaos tattoo scar on arm, grey skin ash war paint, Leviathan Axe', l: 'Kratos (God of War)' },
    { v: "Link — The Legend of Zelda, green tunic or Champion's Tunic, pointy elf ears (costume), Master Sword shield", l: 'Link (The Legend of Zelda)' },
  ],
  fantasi: [
    { v: 'Dark fantasy warrior — black full-plate medieval armor with glowing red rune engravings, great sword, epic dark castle background', l: 'Ksatria Gelap — Dark Fantasy' },
    { v: 'Light paladin — gleaming silver full-plate armor with golden cross emblem, holy sword, cathedral background with divine light', l: 'Paladin Cahaya — Medieval Fantasy' },
    { v: 'Forest elf archer — flowing emerald green cloak, pointed elven ears (costume), longbow, enchanted forest background with glowing fireflies', l: 'Peri Hutan Elf — Fantasy' },
    { v: 'Viking warrior — fur-trimmed leather and chainmail armor, horned helmet, battle axe, Norse longship fjord background', l: 'Pejuang Viking — Norse' },
    { v: 'Samurai warrior — full traditional Japanese samurai armor (tosei gusoku), lacquered iron mask, katana, misty feudal Japan mountain background', l: 'Samurai — Feudal Jepang' },
    { v: 'Imperial Chinese general — ornate Han dynasty golden armor with dragon engravings, spear weapon, imperial palace background', l: 'Jenderal Dinasti Kekaisaran Tiongkok' },
    { v: 'Egyptian pharaoh — golden nemes headdress crown, white linen kilt, golden pectoral collar, scepter and flail, pyramid background', l: 'Firaun Mesir Kuno' },
    { v: "Pirate captain — weathered tricorn hat, long dark captain's coat, cutlass sword, open sea ship deck background", l: 'Kapten Bajak Laut' },
    { v: 'Steampunk inventor — Victorian coat with brass gears and gadgets, goggles on forehead, mechanical arm brace prop, foggy industrial city background', l: 'Penemu Steampunk' },
    { v: 'Gandalf the White — The Lord of the Rings, white wizard robes and hat, long white staff, flowing white beard (beard via costume), Minas Tirith background', l: 'Gandalf si Putih (LOTR)' },
  ],
};

function renderOpsiCosplay() {
  return `
  <div class="opt-group">
    <div class="opt-label">Kategori Karakter</div>
    <select class="opt-select" id="cosplay-kategori" onchange="renderCosplayKarakter()">
      <option value="anime">🎌 Anime / Manga</option>
      <option value="superhero">🦸 Superhero Marvel / DC</option>
      <option value="game">🎮 Game — Mobile &amp; Console</option>
      <option value="fantasi">⚔️ Fantasi / Historis</option>
      <option value="custom">✏️ Ketik sendiri</option>
    </select>
  </div>
  <div id="cosplay-karakter-wrap"></div>
  <div class="opt-group">
    <div class="opt-label">Background</div>
    <select class="opt-select" id="cosplay-bg">
      <option value="iconic scene from the character's world, cinematic quality">Dunia karakter — ikonik</option>
      <option value="dramatic studio lighting, dark background with atmospheric haze, character-focused">Studio dramatis — dark</option>
      <option value="action battle scene background matching the character's universe">Scene pertarungan / aksi</option>
      <option value="clean gradient background that matches the character's color palette">Gradien warna karakter</option>
      <option value="keep the original background but stylize it to fit the cosplay theme">Background asli (disesuaikan)</option>
    </select>
  </div>
  ${renderOpsiExtra('Detail karakter / catatan tambahan (opsional)', 'Contoh: versi Gear 5 Luffy, Iron Man suit Mark 50, pakai sayap putih')}`;
}

function renderCosplayKarakter() {
  const kat  = document.getElementById('cosplay-kategori')?.value || 'anime';
  const wrap = document.getElementById('cosplay-karakter-wrap');
  if (!wrap) return;
  if (kat === 'custom') {
    wrap.innerHTML = `<div class="opt-group"><div class="opt-label">Nama &amp; Deskripsi Karakter</div><input class="opt-input" id="cosplay-custom" placeholder="Contoh: Naruto mode Sage of Six Paths, jubah oranye dengan mata Rinnegan" style="width:100%;box-sizing:border-box"></div>`;
  } else {
    const list = COSPLAY_DATA[kat] || [];
    const opts = list.map(item => `<option value="${item.v}">${item.l}</option>`).join('');
    wrap.innerHTML = `<div class="opt-group"><div class="opt-label">Pilih Karakter</div><select class="opt-select" id="cosplay-karakter">${opts}</select></div>`;
  }
}

function buildPromptCosplay() {
  const kat   = document.getElementById('cosplay-kategori')?.value;
  const bg    = document.getElementById('cosplay-bg')?.value || 'iconic scene from the character\'s world, cinematic quality';
  const extra = getExtra();

  let karakter;
  if (kat === 'custom') {
    karakter = document.getElementById('cosplay-custom')?.value?.trim();
    if (!karakter) return null;
  } else {
    karakter = document.getElementById('cosplay-karakter')?.value;
    if (!karakter) return null;
  }

  return `You are a professional costume and visual effects artist. Transform this person into the requested cosplay character — costume, props, and setting — while keeping their real face 100% intact.

Character / Costume: ${karakter}
Background / Setting: ${bg}
${extra ? '\nAdditional notes: ' + extra : ''}

Costume transformation instructions:
1. Replace the existing clothing with the character's full signature costume — replicate colors, materials, textures, logos, emblems, and accessories as accurately as possible
2. Add character-specific props (weapons, gadgets, accessories, aura effects) that naturally integrate with the person's pose
3. Background: ${bg}
4. Match the lighting mood and color grading to the character's world — cinematic and high-quality
5. If the character has special effects (energy aura, lightning, fire, glow), apply these as environmental/costume effects only — do NOT alter the face
6. The result must feel like a professional cosplay photoshoot or a high-end digital costume edit

${WAJAH_RULE}`;
}

/* ════════════════════════════════════
   FOTO WISUDA — render + build
════════════════════════════════════ */
function renderOpsiFotoWisuda() {
  const chips = [
    { label: '🟥 BG Merah',     set: { 'wisuda-bg': '#FF0000' } },
    { label: '🟦 BG Biru',      set: { 'wisuda-bg': '#0000FF' } },
    { label: '🟫 BG Maroon',    set: { 'wisuda-bg': '#800000' } },
    { label: '⬜ BG Putih',     set: { 'wisuda-bg': '#FFFFFF' } },
    { label: '⬛ BG Hitam',     set: { 'wisuda-bg': '#222222' } },
  ];
  return `${renderPresetChips(chips)}
  <div class="note-box">
    <span class="note-icon">🎓</span>
    <span>Toga lengkap = <strong>jubah + samir</strong> (selempang warna fakultas) + <strong>biretta</strong> (topi). Konfirmasi warna samir dan background ke panitia wisuda kampus Anda.</span>
  </div>
  <div class="opt-group">
    <div class="opt-label">Warna Background</div>
    <input class="opt-input" id="wisuda-bg" type="text" placeholder="Contoh: #FF0000 atau red, dark blue, white" value="">
  </div>
  <div class="opt-group">
    <div class="opt-label">Warna Samir (Selempang Fakultas)</div>
    <select class="opt-select" id="wisuda-samir">
      <option value="keep original or don't change the sash color">Pertahankan warna yang ada</option>
      <option value="bright yellow gold samir/sash">Kuning emas — Ekonomi/Hukum</option>
      <option value="dark green samir/sash">Hijau tua — MIPA/Sains</option>
      <option value="navy blue samir/sash">Biru navy — Teknik/Informatika</option>
      <option value="red samir/sash">Merah — Kedokteran/Kesehatan</option>
      <option value="purple samir/sash">Ungu — Filsafat/Humaniora</option>
      <option value="orange samir/sash">Oranye — Pertanian/Peternakan</option>
      <option value="white samir/sash">Putih — Farmasi/Keperawatan</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Pakaian di Bawah Toga</div>
    <select class="opt-select" id="wisuda-baju">
      <option value="keep existing clothing as-is">Pakai baju yang sudah ada</option>
      <option value="white long-sleeve dress shirt with dark tie, formal">Kemeja putih + dasi (pria)</option>
      <option value="formal kebaya, neatly worn, elegant">Kebaya formal (wanita)</option>
      <option value="formal muslimah dress (busana muslimah formal), neat and professional">Busana muslimah formal (wanita)</option>
      <option value="navy blue formal suit with white shirt and tie">Jas navy + kemeja putih (pria)</option>
    </select>
  </div>
  ${renderOpsiExtra('Catatan tambahan (opsional)', 'Contoh: warna samir kuning + jubah hitam, background biru tua')}`;
}

function buildPromptFotoWisuda() {
  const bg     = document.getElementById('wisuda-bg')?.value?.trim() || 'clean red (#FF0000)';
  const samir  = document.getElementById('wisuda-samir')?.value || 'keep original or don\'t change the sash color';
  const baju   = document.getElementById('wisuda-baju')?.value || 'keep existing clothing as-is';
  const extra  = getExtra();
  return `You are a professional photo editor specializing in graduation photo editing. Edit this photo to create a formal graduation portrait.

Graduation attire to apply:
1. Toga: black academic gown (jubah wisuda hitam), properly worn — full length, correct drape, no wrinkles
2. Samir (faculty sash/selempang): ${samir} — draped diagonally across the chest over the toga, correct position
3. Biretta (graduation cap): formal black square academic cap, worn flat on top of the head at a slight angle
4. Clothing under toga: ${baju}

Background: replace with a clean, solid ${bg} background — evenly lit, no shadows, no gradient

Photo requirements:
5. Even, frontal portrait lighting across the face — no harsh shadows
6. Subject standing or sitting upright in formal graduation pose
7. Full upper body visible — from top of the biretta down to mid-chest or waist
8. Sharp, high-quality output — suitable for official graduation documentation
${extra ? '\nAdditional notes: ' + extra : ''}
${WAJAH_RULE}`;
}

/* ════════════════════════════════════
   HAPUS BACKGROUND — render + build
════════════════════════════════════ */
function renderOpsiHapusBg() {
  const chips = [
    { label: '⬜ Jadi Transparan', set: { 'hapusbg-hasil': 'transparent',    'hapusbg-warna': '' } },
    { label: '⬛ Putih Bersih',    set: { 'hapusbg-hasil': 'solid-putih',     'hapusbg-warna': '' } },
    { label: '🔘 Abu Lembut',      set: { 'hapusbg-hasil': 'solid-abu',       'hapusbg-warna': '' } },
    { label: '🟦 Warna Custom',    set: { 'hapusbg-hasil': 'solid-custom',    'hapusbg-warna': '' } },
    { label: '🌿 Ganti Suasana',   set: { 'hapusbg-hasil': 'ganti-suasana',   'hapusbg-warna': '' } },
  ];
  return `${renderPresetChips(chips)}
  <div class="opt-group">
    <div class="opt-label">Hasil Background</div>
    <select class="opt-select" id="hapusbg-hasil" onchange="renderHapusBgCustomColor()">
      <option value="transparent">Transparan / PNG tanpa background</option>
      <option value="solid-putih">Warna solid putih bersih</option>
      <option value="solid-abu">Warna solid abu-abu lembut</option>
      <option value="solid-custom">Warna solid — pilih warna sendiri</option>
      <option value="ganti-suasana">Ganti dengan suasana / tempat</option>
    </select>
  </div>
  <div id="hapusbg-extra-wrap"></div>
  ${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: pertahankan bayangan di bawah objek, edge sangat presisi untuk rambut keriting')}`;
}

function renderHapusBgCustomColor() {
  const val = document.getElementById('hapusbg-hasil')?.value;
  const wrap = document.getElementById('hapusbg-extra-wrap');
  if (!wrap) return;
  if (val === 'solid-custom') {
    wrap.innerHTML = `<div class="opt-group"><div class="opt-label">Warna Background (hex atau nama)</div><input class="opt-input" id="hapusbg-warna" type="text" placeholder="Contoh: #FF0000, navy blue, pastel pink"></div>`;
  } else if (val === 'ganti-suasana') {
    wrap.innerHTML = `<div class="opt-group"><div class="opt-label">Deskripsi Suasana / Tempat</div><textarea class="opt-textarea" id="hapusbg-warna" placeholder="Contoh: kafe cozy dengan lampu kuning hangat, studio putih, taman dengan bokeh hijau..."></textarea></div>`;
  } else {
    wrap.innerHTML = '';
  }
}

function buildPromptHapusBg() {
  const hasil = document.getElementById('hapusbg-hasil')?.value || 'transparent';
  const warna = document.getElementById('hapusbg-warna')?.value?.trim() || '';
  const extra = getExtra();

  const bgResultMap = {
    transparent:    'completely transparent (PNG with no background) — suitable for use in design and editing software',
    'solid-putih':  'clean solid white (#FFFFFF) — evenly lit, no shadows',
    'solid-abu':    'clean soft light gray — modern and neutral',
    'solid-custom': warna ? `solid ${warna} color background` : 'clean solid white background',
    'ganti-suasana': warna || 'a natural, visually appealing background that suits the subject',
  };
  const bgDesc = bgResultMap[hasil];

  return `You are a professional photo editor specializing in background removal and replacement. Process this photo as follows:

Background result: ${bgDesc}

What to do:
1. Precisely detect and separate the subject (person/product/object) from the background
2. Remove the background completely — clean, seamless edges with no fringing or halo artifacts
3. Pay special attention to complex edges: hair, fur, transparent objects, and fine details
4. Replace with: ${bgDesc}
5. Ensure the subject's lighting and shadows remain natural and consistent with the new background
6. Final result must look professional — no rough edges, no leftover background pixels
${extra ? '\nSpecial request: ' + extra : ''}
${WAJAH_RULE}
- DO NOT alter the subject itself in any way`;
}

/* ════════════════════════════════════
   FOTO KELUARGA — render + build
════════════════════════════════════ */
function renderOpsiFotoKeluarga() {
  const chips = [
    { label: '🕌 Lebaran',       set: { 'keluarga-mode': 'rapikan', 'keluarga-gaya': 'warm and joyful, festive Eid atmosphere',    'keluarga-bg': 'soft bokeh park with lush greenery, natural outdoor lighting' } },
    { label: '🎂 Ulang Tahun',   set: { 'keluarga-mode': 'rapikan', 'keluarga-gaya': 'fun and celebratory, birthday party energy',  'keluarga-bg': 'cozy indoor home, warm lights, festive decoration' } },
    { label: '🏡 Foto Keluarga', set: { 'keluarga-mode': 'rapikan', 'keluarga-gaya': 'natural and warm, genuine family moment',    'keluarga-bg': 'keep the original background' } },
    { label: '🤝 Gabung Foto',   set: { 'keluarga-mode': 'gabung',  'keluarga-gaya': 'natural and warm, genuine family moment',    'keluarga-bg': 'clean white studio background with soft even lighting' } },
    { label: '🎄 Natal / Event', set: { 'keluarga-mode': 'rapikan', 'keluarga-gaya': 'festive and celebratory, special occasion',  'keluarga-bg': 'elegant indoor hall with warm lighting' } },
  ];
  return `${renderPresetChips(chips)}
  <div class="opt-group">
    <div class="opt-label">Mode</div>
    <select class="opt-select" id="keluarga-mode" onchange="renderKeluargaModeNote()">
      <option value="rapikan">1 Foto — Sudah bersama, perlu dirapikan / di-edit</option>
      <option value="gabung">2–4 Foto — Gabungkan beberapa foto jadi satu</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Gaya / Suasana</div>
    <select class="opt-select" id="keluarga-gaya">
      <option value="natural and warm, genuine family moment">Natural &amp; hangat — momen keluarga autentik</option>
      <option value="warm and joyful, festive Eid atmosphere">Lebaran — hangat &amp; penuh sukacita</option>
      <option value="fun and celebratory, birthday party energy">Ulang tahun — ceria &amp; meriah</option>
      <option value="festive and celebratory, special occasion">Event / Acara Spesial</option>
      <option value="elegant formal portrait, clean and professional">Formal elegan — bersih &amp; profesional</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Background</div>
    <select class="opt-select" id="keluarga-bg">
      <option value="keep the original background">Pertahankan background asli</option>
      <option value="soft bokeh park with lush greenery, natural outdoor lighting">Taman hijau bokeh — outdoor natural</option>
      <option value="clean white studio background with soft even lighting">Studio putih bersih</option>
      <option value="cozy indoor home, warm lights, festive decoration">Dalam rumah — cozy &amp; hangat</option>
      <option value="golden hour warm sunset sky background, soft and romantic">Sunset golden hour</option>
      <option value="elegant indoor hall with warm lighting">Aula / Hall elegan</option>
      <option value="tropical beach with turquoise sea and blue sky">Pantai tropis</option>
    </select>
  </div>
  ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: tambahkan teks ucapan Selamat Lebaran, semua senyum, pencahayaan lebih terang')}`;
}

function renderKeluargaModeNote() {
  const val = document.getElementById('keluarga-mode')?.value;
  if (val === 'gabung') {
    setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>2–4 foto</strong> ke platform AI. AI akan menggabungkan semua orang menjadi satu foto keluarga yang natural dan harmonis.</span></div>`);
  } else {
    setUploadNote(`<div class="note-box"><span class="note-icon">📌</span><span>Upload <strong>1 foto</strong> bersama keluarga. AI akan merapikan, memperindah, dan menyesuaikan background sesuai pilihan.</span></div>`);
  }
}

function buildPromptFotoKeluarga() {
  const mode  = document.getElementById('keluarga-mode')?.value || 'rapikan';
  const gaya  = document.getElementById('keluarga-gaya')?.value || 'natural and warm, genuine family moment';
  const bg    = document.getElementById('keluarga-bg')?.value || 'keep the original background';
  const extra = getExtra();

  const modeNote = mode === 'gabung'
    ? `\n- IMPORTANT: Upload 2–4 separate photos. Combine all individuals into one natural group photo — seamless compositing, matching scale, lighting, and perspective`
    : '';
  const bgNote = bg === 'keep the original background' ? 'keep the original background unchanged' : `replace the background with: ${bg}`;

  return `You are a professional family portrait photographer and photo editor. Edit this family photo in a ${gaya} style.

What to do:
1. Background: ${bgNote} — clean, seamless edges
2. Optimize group lighting: ensure all faces are well-lit, no one is in shadow, balanced exposure across the whole group
3. Enhance overall image sharpness and color — natural, warm, and flattering
4. Minor touch-ups: smooth out distracting background elements, remove unwanted objects at edges
5. The photo should feel genuine, warm, and cherished — like a real family memory worth keeping
${modeNote}
${extra ? '\nAdditional notes: ' + extra : ''}
${WAJAH_RULE}`;
}

/* ════════════════════════════════════
   DESAIN BANNER — render + build
════════════════════════════════════ */
function renderOpsiDesainBanner() {
  const chips = [
    { label: '🏷️ Promo / Diskon',  set: { 'banner-tujuan': 'promosi_diskon', 'banner-format': 'instagram_post' } },
    { label: '🏪 Grand Opening',   set: { 'banner-tujuan': 'grand_opening',  'banner-format': 'instagram_post' } },
    { label: '📢 Pengumuman',      set: { 'banner-tujuan': 'pengumuman',     'banner-format': 'instagram_story' } },
    { label: '📅 Event / Acara',   set: { 'banner-tujuan': 'event',          'banner-format': 'instagram_post' } },
    { label: '🖼️ Spanduk Cetak',  set: { 'banner-tujuan': 'spanduk',        'banner-format': 'landscape_wide' } },
  ];
  return `${renderPresetChips(chips)}
  <div class="opt-group">
    <div class="opt-label">Tujuan Banner</div>
    <select class="opt-select" id="banner-tujuan">
      <option value="promosi_diskon">Promosi / Diskon — promo produk, flash sale</option>
      <option value="grand_opening">Grand Opening / Soft Opening toko</option>
      <option value="pengumuman">Pengumuman — info penting, jam buka, perubahan harga</option>
      <option value="event">Event / Acara — undangan, agenda, gathering</option>
      <option value="spanduk">Spanduk cetak — outdoor, backdrop, MMT</option>
      <option value="brand_awareness">Brand Awareness — perkenalan produk / toko</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Format / Ukuran</div>
    <select class="opt-select" id="banner-format">
      <option value="instagram_post">Instagram Post — 1:1 square (1080×1080px)</option>
      <option value="instagram_story">Instagram Story / WhatsApp Status — 9:16 portrait</option>
      <option value="facebook_post">Facebook / Shopee Post — 1.91:1 landscape</option>
      <option value="landscape_wide">Spanduk / MMT — horizontal landscape lebar</option>
      <option value="a4_portrait">A4 Potrait — flyer cetak</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Toko / Brand</div>
    <input class="opt-input" id="banner-nama-toko" type="text" placeholder="Contoh: Toko Prestasi ATK, Kaela Shop, CV. Maju Jaya">
  </div>
  <div class="opt-group">
    <div class="opt-label">Isi Teks Utama</div>
    <input class="opt-input" id="banner-teks" type="text" placeholder="Contoh: DISKON 50%, GRAND OPENING, Flash Sale 12.12">
  </div>
  <div class="opt-group">
    <div class="opt-label">Warna Tema</div>
    <select class="opt-select" id="banner-warna">
      <option value="merah dan putih, energik dan mencolok">Merah &amp; Putih — mencolok, energik</option>
      <option value="kuning dan hitam, kontras tajam">Kuning &amp; Hitam — kontras, eye-catching</option>
      <option value="hijau dan putih, segar dan terpercaya">Hijau &amp; Putih — segar, terpercaya</option>
      <option value="biru dan putih, bersih dan profesional">Biru &amp; Putih — bersih, profesional</option>
      <option value="ungu dan emas, premium dan elegan">Ungu &amp; Emas — premium, elegan</option>
      <option value="oranye dan putih, hangat dan ramah">Oranye &amp; Putih — hangat, ramah</option>
      <option value="hitam dan emas, mewah dan modern">Hitam &amp; Emas — mewah, modern</option>
      <option value="pastel pink dan putih, lembut dan feminin">Pastel Pink &amp; Putih — lembut, feminin</option>
    </select>
  </div>
  ${renderOpsiExtra('Detail tambahan (opsional)', 'Contoh: nomor WA 0812-xxxx, alamat toko, produk unggulan: pulpen, buku, tinta printer')}`;
}

function buildPromptDesainBanner() {
  const tujuan   = document.getElementById('banner-tujuan')?.value   || 'promosi_diskon';
  const format   = document.getElementById('banner-format')?.value   || 'instagram_post';
  const namaToko = document.getElementById('banner-nama-toko')?.value?.trim() || 'Nama Toko';
  const teks     = document.getElementById('banner-teks')?.value?.trim()      || '';
  const warna    = document.getElementById('banner-warna')?.value    || 'merah dan putih, energik dan mencolok';
  const extra    = getExtra();

  const tujuanDesc = {
    promosi_diskon: 'a promotional sales banner — bold discount/promo announcement, attention-grabbing, drives purchase action',
    grand_opening: 'a grand opening banner — festive, celebratory, welcoming new customers, excitement and freshness',
    pengumuman: 'an announcement banner — clear, informative, easy to read at a glance, trustworthy tone',
    event: 'an event invitation banner — inviting, clear date/info, creates anticipation',
    spanduk: 'a large outdoor banner / MMT / backdrop — high-impact at large scale, bold typography, simple layout readable from a distance',
    brand_awareness: 'a brand awareness banner — introduces the brand, memorable, clean and professional',
  }[tujuan] || tujuan;

  const formatDesc = {
    instagram_post: 'square 1:1 format (1080×1080px) for Instagram feed',
    instagram_story: 'vertical 9:16 format for Instagram Story / WhatsApp Status',
    facebook_post: 'landscape 1.91:1 format for Facebook / Shopee post banner',
    landscape_wide: 'wide landscape horizontal banner for outdoor print (spanduk/MMT/backdrop)',
    a4_portrait: 'A4 portrait format for printed flyer',
  }[format] || format;

  return `You are a professional graphic designer specializing in promotional banner and poster design. Create a high-quality digital banner design for the following brief:

Banner purpose: ${tujuanDesc}
Format: ${formatDesc}
Brand / Store name: ${namaToko}
${teks ? `Main headline text: "${teks}"` : ''}
Color theme: ${warna}

Design instructions:
1. Layout: bold, eye-catching composition appropriate for the purpose — clear visual hierarchy (headline → subtext → brand)
2. Typography: use strong, legible fonts — headline text must be the dominant visual element
3. Color: apply the ${warna} color theme throughout — backgrounds, gradients, text, and graphic elements
4. Graphics / elements: add relevant decorative elements (ribbons, badges, stars, icons, geometric shapes) that reinforce the message
5. Include the store/brand name "${namaToko}" prominently — bottom or top corner with good contrast
6. The design must look professional and print-ready — clean margins, no clipping at edges
7. Output in the correct aspect ratio for ${formatDesc}
${extra ? '\nAdditional details: ' + extra : ''}

Design style: modern, flat, clean — professional Indonesian retail/shop aesthetic. NOT hand-drawn or overly complex.
Make it look ready to post or print immediately without further editing.`;
}

/* ════════════════════════════════════
   LISTING FOTO PRODUK
════════════════════════════════════ */
function renderOpsiListingProduk() {
  const chips = [
    { label: '🛒 Shopee',         set: { 'listing-platform': 'shopee' } },
    { label: '🟢 Tokopedia',      set: { 'listing-platform': 'tokopedia' } },
    { label: '📸 Instagram',      set: { 'listing-platform': 'instagram' } },
    { label: '🌐 Semua Platform', set: { 'listing-platform': 'semua' } },
  ];
  return `${renderPresetChips(chips)}
  <input type="hidden" id="listing-platform" value="semua">
  <div class="opt-group">
    <div class="opt-label">Nama Barang <span style="color:#c62828;font-size:10px;font-weight:600;">wajib diisi</span></div>
    <input class="opt-input" id="nama-barang" type="text" placeholder="Contoh: Pensil Mekanik, Spidol Boardmarker, Buku Tulis A5" oninput="checkReady()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Brand / Merek</div>
    <input class="opt-input" id="listing-brand" type="text" placeholder="Contoh: Kenko, Joyko, Snowman, Stabilo">
  </div>
  <div class="opt-group">
    <div class="opt-label">Kode / Model</div>
    <input class="opt-input" id="listing-kode" type="text" placeholder="Contoh: MP-01, BM-900, SB-20">
  </div>
  <div class="opt-group">
    <div class="opt-label">Spesifikasi Kunci</div>
    <input class="opt-input" id="listing-spek" type="text" placeholder="Contoh: 0.5mm Lead, 12 warna, 60gsm, 100ml">
  </div>
  <div class="opt-group">
    <div class="opt-label">Info Tambahan Produk</div>
    <input class="opt-input" id="listing-info" type="text" placeholder="Contoh: isi 12 pcs/box, original import, harga grosir">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Toko / Watermark</div>
    <input class="opt-input" id="listing-toko" type="text" placeholder="Contoh: Toko Prestasi ATK, Neora Stationery">
  </div>
  <div class="opt-group">
    <div class="opt-label">Susunan Produk</div>
    <select class="opt-select" id="listing-susunan">
      <option value="single">1 Produk — fokus pada satu item</option>
      <option value="multiple">Beberapa Produk Berjajar — tampilkan varian / isi</option>
      <option value="with_box">Produk + Kemasan/Box — tampilkan isi dan dus-nya</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Gaya Visual</div>
    <select class="opt-select" id="listing-gaya">
      <option value="clean_marketplace">Clean Marketplace — putih bersih, teks gelap, profesional</option>
      <option value="bold_eyecatching">Bold Eye-Catching — warna kontras, font besar, mencolok</option>
      <option value="minimal_elegant">Minimal Elegan — netral, tipografi tipis, premium</option>
      <option value="infographic">Infografis Lengkap — ikon, spek tersusun, detail produk</option>
    </select>
  </div>
  ${renderOpsiExtra('Catatan tambahan (opsional)', 'Contoh: tampilkan nomor WA, highlight "READY STOCK", latar abu terang')}`;
}

function buildPromptListingProduk() {
  const platform   = document.getElementById('listing-platform')?.value  || 'semua';
  const namaBarang = document.getElementById('nama-barang')?.value?.trim()    || 'Produk';
  const brand      = document.getElementById('listing-brand')?.value?.trim()  || '';
  const kode       = document.getElementById('listing-kode')?.value?.trim()   || '';
  const spek       = document.getElementById('listing-spek')?.value?.trim()   || '';
  const info       = document.getElementById('listing-info')?.value?.trim()   || '';
  const toko       = document.getElementById('listing-toko')?.value?.trim()   || '';
  const susunan    = document.getElementById('listing-susunan')?.value        || 'single';
  const gaya       = document.getElementById('listing-gaya')?.value           || 'clean_marketplace';
  const extra      = getExtra();

  const platformDesc = {
    shopee:    'Shopee Indonesia — warm orange accent, energetic feel, trust badges, Indonesian shoppers',
    tokopedia: 'Tokopedia Indonesia — clean green accent, professional, trustworthy, clear hierarchy',
    instagram: 'Instagram feed — aesthetic minimalist, lifestyle-forward, strong visual punch, minimal text',
    semua:     'all major Indonesian marketplaces (Shopee, Tokopedia, Lazada, Instagram) — neutral clean style readable on any platform',
  }[platform] || 'marketplace';

  const susunanDesc = {
    single:    'a single product centered prominently — best angle to showcase its main feature',
    multiple:  'multiple units arranged side by side or fanned out — showing color variants or pack quantity, all neatly grouped',
    with_box:  'product alongside its original packaging/box — either open box with contents visible, or box + individual item displayed together',
  }[susunan] || 'a single product';

  const gayaDesc = {
    clean_marketplace: 'clean and professional — pure white or very light background, dark text, product as the hero with no distracting elements',
    bold_eyecatching:  'bold and eye-catching — strong contrasting background color, large impactful typography, high-energy color pops that stop the scroll',
    minimal_elegant:   'minimal and elegant — soft neutral or off-white background, thin modern typography, premium refined look',
    infographic:       'structured infographic — organized layout with spec callout blocks, feature icons, clear visual sections showing product details',
  }[gaya] || 'clean and professional';

  const productLine = [brand, namaBarang, kode].filter(Boolean).join(' ');

  return `You are a professional e-commerce product photographer and graphic designer specializing in Indonesian marketplace listing images (Shopee, Tokopedia, Lazada, Instagram).

Use the provided product photo as the main product image. Create a high-quality, upload-ready product listing image for: ${productLine}
Platform target: ${platformDesc}
Product arrangement: ${susunanDesc}
Visual style: ${gayaDesc}

Layout & design requirements:
1. BACKGROUND: pure white or very light clean background — no busy textures, no outdoor scenes, no gradients darker than 10% gray
2. PRODUCT: ${susunanDesc} — perfectly lit, sharp, no harsh shadows cutting into the product edges
${brand ? `3. BRAND NAME: "${brand}" — display LARGE AND BOLD, top-left corner preferred, high contrast against background, instantly readable` : '3. No brand name required — product is the sole focal point'}
4. PRODUCT NAME: "${namaBarang}"${kode ? ` — model/code: "${kode}"` : ''} — clean typography, clear visual hierarchy below brand
${spek ? `5. KEY SPEC CALLOUT: "${spek}" — make this the SCROLL-STOPPING FOCAL POINT — render this spec in very large, bold, eye-catching typography or inside a prominent badge/callout box` : '5. No specific spec callout required — keep layout clean'}
${info ? `6. SUPPORTING INFO: "${info}" — smaller supporting text, clearly legible but subordinate to product name` : ''}
${toko ? `7. STORE WATERMARK: "${toko}" — place subtly at bottom corner, visibly branded but never competing with the product` : ''}

Typography rules:
- Brand name (if present): dominant or co-dominant text, bold, high contrast
- Product name + model: clear second-level hierarchy
- Spec callout (if present): VERY LARGE — this is the number one reason someone reads the listing
- Supporting info: small and clean
- Every text element must remain legible at marketplace thumbnail size (300×300px)

Output requirements:
- Square 1:1 format (1080×1080px) — optimized for marketplace product thumbnail
- No external frames, drop-shadow borders, or AI generation artifacts
- Looks professionally designed and ready to upload immediately — zero further editing needed
- Style consistent with top-selling Indonesian marketplace listings
${extra ? '\nAdditional notes: ' + extra : ''}`;
}

/* ════════ LABEL & STIKER PRODUK ════════ */
function renderOpsiLabelStiker() {
  const chips = [
    { label: '🍱 Makanan',     set: { 'stiker-kategori': 'makanan' } },
    { label: '🥤 Minuman',     set: { 'stiker-kategori': 'minuman' } },
    { label: '💄 Kosmetik',    set: { 'stiker-kategori': 'kosmetik' } },
    { label: '🌿 Herbal/UMKM', set: { 'stiker-kategori': 'herbal' } },
    { label: '🍬 Snack',       set: { 'stiker-kategori': 'snack' } },
    { label: '📦 Umum',        set: { 'stiker-kategori': 'umum' } },
  ];
  return `${renderPresetChips(chips)}
  <input type="hidden" id="stiker-kategori" value="">
  <div class="opt-group">
    <div class="opt-label">Nama Produk <span style="color:#c62828;font-size:10px;font-weight:600;">wajib diisi</span></div>
    <input class="opt-input" id="stiker-nama-produk" type="text" placeholder="Contoh: Sambal Matah, Kopi Susu, Hand Cream" oninput="checkReady()">
  </div>
  <div class="opt-group">
    <div class="opt-label">Nama Brand / Toko</div>
    <input class="opt-input" id="stiker-brand" type="text" placeholder="Contoh: Dapur Bu Sari, Prestasi Coffee, Natural Glow">
  </div>
  <div class="opt-group">
    <div class="opt-label">Tagline / Slogan (opsional)</div>
    <input class="opt-input" id="stiker-tagline" type="text" placeholder="Contoh: Pedas Nampol!, 100% Natural, Dibuat dengan Cinta">
  </div>
  <div class="opt-group">
    <div class="opt-label">Varian / Keterangan Produk (opsional)</div>
    <input class="opt-input" id="stiker-varian" type="text" placeholder="Contoh: Rasa Coklat · 250ml · Halal · No. 123">
  </div>
  <div class="opt-group">
    <div class="opt-label">Info Tambahan (opsional)</div>
    <input class="opt-input" id="stiker-info" type="text" placeholder="Contoh: No HP, PIRT, tanggal exp, kode produksi">
  </div>
  <div class="opt-group">
    <div class="opt-label">Bentuk Stiker</div>
    <select class="opt-select" id="stiker-bentuk">
      <option value="persegi_panjang">Persegi Panjang — paling umum untuk label produk</option>
      <option value="bulat">Bulat (Circle) — botol, toples, produk bulat</option>
      <option value="oval">Oval — elegan, cocok kosmetik &amp; herbal</option>
      <option value="kotak">Kotak (Square) — produk kemasan kotak</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Ukuran Stiker</div>
    <select class="opt-select" id="stiker-ukuran">
      <option value="5x5">5×5 cm — kecil, toples &amp; botol kecil</option>
      <option value="5x7">5×7 cm — label kecil standar</option>
      <option value="5x10" selected>5×10 cm — label botol/sachet (paling umum)</option>
      <option value="7x10">7×10 cm — label sedang</option>
      <option value="10x10">10×10 cm — label besar / kotak</option>
      <option value="10x15">10×15 cm — kemasan besar</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Gaya Desain</div>
    <select class="opt-select" id="stiker-gaya">
      <option value="minimalis">Minimalis Modern — bersih, ruang putih, tipografi clean</option>
      <option value="premium">Premium / Elegan — dark &amp; gold, kesan mewah</option>
      <option value="playful">Cerah &amp; Playful — warna mencolok, ilustrasi, cocok makanan &amp; anak</option>
      <option value="vintage">Vintage / Retro — badge style, tekstur klasik, serif font</option>
      <option value="natural">Natural / Organik — warna bumi, daun, handmade feel</option>
      <option value="bold">Modern Bold — tipografi besar, kontras tinggi, eye-catching</option>
    </select>
  </div>
  <div class="opt-group">
    <div class="opt-label">Warna Tema (opsional)</div>
    <input class="opt-input" id="stiker-warna" type="text" placeholder="Contoh: hijau &amp; putih, gold &amp; hitam, pastel biru">
  </div>
  ${renderOpsiExtra('Catatan tambahan (opsional)', 'Contoh: tambahkan ikon daun, pakai font Arab, sertakan barcode kotak')}`;
}

function buildPromptLabelStiker() {
  const kategori   = document.getElementById('stiker-kategori')?.value              || '';
  const namaProduk = document.getElementById('stiker-nama-produk')?.value?.trim()   || '';
  const brand      = document.getElementById('stiker-brand')?.value?.trim()         || '';
  const tagline    = document.getElementById('stiker-tagline')?.value?.trim()       || '';
  const varian     = document.getElementById('stiker-varian')?.value?.trim()        || '';
  const info       = document.getElementById('stiker-info')?.value?.trim()          || '';
  const bentuk     = document.getElementById('stiker-bentuk')?.value                || 'persegi_panjang';
  const ukuran     = document.getElementById('stiker-ukuran')?.value                || '5x10';
  const gaya       = document.getElementById('stiker-gaya')?.value                  || 'minimalis';
  const warna      = document.getElementById('stiker-warna')?.value?.trim()         || '';
  const extra      = getExtra();

  if (!namaProduk) return null;

  const kategoriCtx = {
    makanan:  'Indonesian food product — emphasize freshness, homemade quality, appetite appeal',
    minuman:  'Indonesian beverage product — refreshing, clean, inviting feel',
    kosmetik: 'cosmetic/beauty product — clean, hygienic, skin-safe premium feel',
    herbal:   'herbal/traditional/UMKM product — natural, trustworthy, local artisan pride',
    snack:    'snack/jajanan product — fun, tasty, colorful, impulse-buy energy',
    umum:     'general consumer product — clean, professional, versatile',
  }[kategori] || 'consumer product';

  const bentukDesc = {
    persegi_panjang: 'horizontal or vertical rectangle (standard product label)',
    bulat:           'perfect circle/round (bottle or jar)',
    oval:            'oval/ellipse (elegant cosmetic label)',
    kotak:           'square (box packaging label)',
  }[bentuk] || 'rectangle';

  const ukuranDesc = {
    '5x5':   '5×5 cm',
    '5x7':   '5×7 cm',
    '5x10':  '5×10 cm',
    '7x10':  '7×10 cm',
    '10x10': '10×10 cm',
    '10x15': '10×15 cm',
  }[ukuran] || '5×10 cm';

  const gayaDesc = {
    minimalis: 'clean minimalist modern — generous white/light space, simple sans-serif typography, uncluttered layout, product name as hero',
    premium:   'premium elegant — rich dark background (deep black, navy, or forest green) with gold or silver typography and fine decorative lines',
    playful:   'bright and playful — vivid energetic colors, fun hand-drawn style icons or illustrations, bold friendly fonts, cheerful atmosphere',
    vintage:   'vintage/retro — badge or stamp motifs, classic serif fonts, aged paper or worn texture, muted warm palette (cream, rust, brown)',
    natural:   'natural/organic — earthy tones (cream, sage, moss green, warm brown), botanical or leaf motifs, handcrafted artisan feel',
    bold:      'modern bold — high-contrast color blocks, oversized typography, strong graphic punch, immediate visual impact',
  }[gaya] || 'clean minimalist';

  const contentParts = [];
  if (brand)   contentParts.push(`  - Brand name: "${brand}" (prominent header)`);
  contentParts.push(`  - Product name (HERO — largest text): "${namaProduk}"`);
  if (tagline) contentParts.push(`  - Tagline/slogan: "${tagline}"`);
  if (varian)  contentParts.push(`  - Variant/description: "${varian}"`);
  if (info)    contentParts.push(`  - Additional info (smallest): "${info}"`);

  return `[DESAIN LABEL PRODUK / STIKER — GRAPHIC DESIGN]

Design a professional, print-ready product label/sticker with these exact specifications:

PRODUCT CATEGORY: ${kategoriCtx}

SHAPE: ${bentukDesc}
SIZE: ${ukuranDesc}

CONTENT (arrange with strict visual hierarchy, top to bottom):
${contentParts.join('\n')}

DESIGN STYLE: ${gayaDesc}
COLOR PALETTE: ${warna || 'Choose colors that best complement the product category and design style above'}

LAYOUT RULES:
1. Product name must be the largest, most dominant text element
2. Clear hierarchy: brand → product name → tagline → supporting info
3. Every text must be fully legible at actual print size
4. Include decorative elements matching the style (borders, dividers, background patterns, icons)
5. Adequate safe zone on all edges (no critical content within 3mm of edge)
6. Design must feel cohesive — not a random collection of text boxes

PRINT REQUIREMENTS:
- Sharp, clean edges — suitable for die-cut sticker printing
- High contrast between all text and backgrounds
- No gradients or important detail within 3mm of the label edge
- Result must look like a real professional product label — not a mockup or template preview
- Flat label design only — no 3D effects, no drop shadows, no product mock-up

${extra ? `ADDITIONAL NOTES: ${extra}\n` : ''}Output: Single flat label at ${bentukDesc} shape, ${ukuranDesc}, fully designed and print-ready.`;
}

// showToast, stubs — di app-core.js
// initFoto() dipanggil dari index.html setelah semua script dimuat

/* ════════════════════════════════════
   MODUL: FOTO EVENT / MOMEN
════════════════════════════════════ */
const EVENT_OPTIONS = {
  lebaran:    { bg: ['Masjid bokeh & ornamen islami', 'Taman bunga hijau & kuning', 'Gradien hijau-emas', 'Kustom (ketik di keterangan)'], outfit: 'Baju koko + sarung / Kebaya / Gamis / Batik', greet: 'Selamat Idul Fitri 1447 H — Mohon Maaf Lahir & Batin 🕌' },
  ramadan:    { bg: ['Masjid & bulan sabit', 'Lentera Ramadhan (fanoos)', 'Gradien biru tua & emas', 'Kustom'], outfit: 'Busana muslim formal / Gamis / Baju koko', greet: 'Selamat Menunaikan Ibadah Puasa Ramadhan 1447 H 🌙' },
  idul_adha:  { bg: ['Masjid & ornamen Idul Adha', 'Padang rumput & suasana qurban', 'Gradien hijau-coklat', 'Kustom'], outfit: 'Baju koko / Kebaya / Gamis', greet: 'Selamat Hari Raya Idul Adha 1447 H 🐄' },
  maulid:     { bg: ['Masjid dengan ornamen islami', 'Gradien hijau & emas maulid', 'Kustom'], outfit: 'Busana muslim formal', greet: 'Selamat Memperingati Maulid Nabi Muhammad SAW ✨' },
  tahun_baru: { bg: ['Kembang api malam tahun baru', 'Confetti & balon festif', 'Gradien biru-ungu langit malam', 'Kustom'], outfit: 'Pakaian pesta malam elegan', greet: 'Selamat Tahun Baru 2027! 🎆' },
  valentine:  { bg: ['Latar mawar merah & hati', 'Bokeh lampu romantis pink', 'Gradien merah-pink-emas', 'Kustom'], outfit: 'Busana merah atau pink elegan', greet: "Happy Valentine's Day — With Love ❤️" },
  kartini:    { bg: ['Taman bunga tradisional Indonesia', 'Ornamen batik & bunga Jawa', 'Gradien pink-ungu lembut', 'Kustom'], outfit: 'Kebaya tradisional / Batik formal', greet: 'Selamat Hari Kartini — Habis Gelap Terbitlah Terang 🌺' },
  pendidikan: { bg: ['Suasana sekolah & buku-buku', 'Gradien biru-putih cerah', 'Kustom'], outfit: 'Pakaian formal / Seragam guru', greet: 'Selamat Hari Pendidikan Nasional — Bangkit Bergerak Tumbuh 📚' },
  anak:       { bg: ['Taman bermain colorful & balon', 'Gradien pelangi ceria', 'Kustom'], outfit: 'Pakaian kasual cerah / Baju anak', greet: 'Selamat Hari Anak Nasional! 🎈' },
  hut_ri:     { bg: ['Bendera merah putih berkibar', 'Istana Merdeka bokeh merah-putih', 'Gradien merah-putih patriotik', 'Kustom'], outfit: 'Pakaian merah-putih / Batik merah / Pakaian adat', greet: 'Dirgahayu Republik Indonesia ke-80! Merdeka! 🇮🇩' },
  sumpah:     { bg: ['Nuansa merah-putih & pemuda Indonesia', 'Kustom'], outfit: 'Pakaian merah-putih / Batik', greet: 'Selamat Hari Sumpah Pemuda — Satu Nusa, Satu Bangsa, Satu Bahasa 🤝' },
  halloween:  { bg: ['Kuburan & labu jack-o-lantern', 'Haunted house bokeh gelap', 'Gradien oranye-hitam misterius', 'Kustom'], outfit: 'Kostum halloween: vampire / witch / skeleton / cat ears', greet: 'Happy Halloween! — Trick or Treat 🎃' },
  pahlawan:   { bg: ['Nuansa merah-putih & semangat kepahlawanan', 'Kustom'], outfit: 'Pakaian formal merah-putih', greet: 'Selamat Hari Pahlawan — Bangsa yang Besar Menghargai Pahlawannya ⚔️' },
  guru:       { bg: ['Kelas & buku-buku hangat', 'Gradien biru-putih profesional', 'Kustom'], outfit: 'Pakaian formal guru', greet: 'Selamat Hari Guru Nasional — Terima Kasih Guruku 🏫' },
  ibu:        { bg: ['Taman bunga mawar & lavender', 'Bokeh bunga feminin lembut', 'Gradien pink-ungu lembut', 'Kustom'], outfit: 'Busana elegan / Kebaya / Gaun formal', greet: 'Selamat Hari Ibu — Terima Kasih Mama 💐' },
  natal:      { bg: ['Pohon natal berhias lampu', 'Salju musim dingin hangat', 'Gradien hijau-merah festif natal', 'Kustom'], outfit: 'Sweater natal / Pakaian formal merah-hijau / Baju santa', greet: 'Selamat Natal dan Tahun Baru! 🎄' },
  imlek:      { bg: ['Lentera merah & emas imlek', 'Naga & ornamen Chinese New Year', 'Gradien merah-emas kemakmuran', 'Kustom'], outfit: 'Cheongsam / Hanfu / Busana merah & emas tradisional', greet: 'Gong Xi Fa Cai — Selamat Tahun Baru Imlek! 🧧' },
  nyepi:      { bg: ['Suasana hening senja Bali', 'Ornamen Bali & ogoh-ogoh', 'Kustom'], outfit: 'Pakaian adat Bali / Busana putih', greet: 'Selamat Hari Raya Nyepi — Rahajeng Nyanggra Rahina Nyepi 🕯️' },
  isra_miraj: { bg: ['Masjid & langit berbintang', 'Burak & nuansa langit malam islami', 'Gradien biru tua & emas', 'Kustom'], outfit: 'Busana muslim formal', greet: "Selamat Memperingati Isra Mi'raj Nabi Muhammad SAW 🌠" },
  batik:      { bg: ['Motif batik Indonesia sebagai background', 'Studio dengan kain batik bokeh', 'Batik kawung / parang / mega mendung bokeh', 'Kustom'], outfit: 'Baju batik — kemeja batik pria / blus batik wanita / kebaya batik', greet: 'Selamat Hari Batik Nasional — Bangga Pakai Batik Indonesia 🎨' },
  waisak:     { bg: ['Vihara & lampion Waisak', 'Bunga lotus & cahaya lilin', 'Gradien ungu-emas damai', 'Kustom'], outfit: 'Busana formal netral / Pakaian putih', greet: 'Selamat Hari Raya Waisak — Semoga Damai dan Bahagia 🪷' },
};
const EVENT_OPTIONS_DEFAULT = { bg: ['Background bertema event (deskripsi bebas)', 'Gradien warna festif cerah', 'Kustom'], outfit: 'Pakaian sesuai tema event', greet: 'Selamat merayakan momen spesial ini! ✨' };

const EV_THEMES = {
  lebaran:    'Eid al-Fitr (Idul Fitri) — warm Islamic festive atmosphere, golden-green tones, joy and serenity of Lebaran celebration',
  ramadan:    'Ramadan — serene spiritual Islamic atmosphere, lantern amber light, deep blue and gold tones, peaceful and contemplative',
  idul_adha:  'Eid al-Adha — Islamic festival of sacrifice, warm earth tones, solemn yet joyful atmosphere',
  maulid:     "Maulid Nabi — Prophet's Birthday celebration, dignified Islamic festive atmosphere, green and gold",
  tahun_baru: 'New Year (Tahun Baru) — fireworks, confetti, joyful evening celebration, blue-purple night sky',
  valentine:  "Valentine's Day — romantic, elegant, warm pink-red tones, soft bokeh, intimate and tasteful",
  kartini:    'Hari Kartini — Indonesian Women\'s Empowerment Day, traditional Javanese elegance, batik and kebaya, warm dignified tones',
  pendidikan: 'Hardiknas (National Education Day) — educational pride, warmth and inspiration, academic atmosphere',
  anak:       "Hari Anak (Children's Day) — colorful, joyful, playful festive atmosphere, bright and cheerful",
  hut_ri:     'HUT Kemerdekaan RI — Indonesian Independence Day, patriotic red-white (merah-putih) theme, proud and celebratory national spirit',
  sumpah:     'Sumpah Pemuda (Youth Pledge Day) — Indonesian patriotic unity, red-white accents, youth spirit',
  halloween:  'Halloween — dramatic theatrical atmosphere, dark orange-purple, mist and shadows, creative and spooky',
  pahlawan:   "Hari Pahlawan (Heroes' Day) — Indonesian patriotic dignity, solemn and proud, honor and respect",
  guru:       "Hari Guru (Teachers' Day) — warm academic appreciation, dignified and celebratory",
  ibu:        "Hari Ibu (Mother's Day) — tender elegance, warm pink-lavender tones, celebrating maternal love",
  natal:      'Christmas (Natal) — warm holiday joy, green-red festive tones, golden bokeh lights, cozy and celebratory',
  imlek:      'Chinese New Year (Imlek) — festive red-gold prosperity, lanterns, warmth and celebration, auspicious atmosphere',
  nyepi:      'Nyepi (Balinese Day of Silence) — serene Balinese atmosphere, traditional Balinese ornaments, soft candlelight, spiritual peace',
  isra_miraj: "Isra Mi'raj — Islamic spiritual night journey, deep blue starlit sky, mosque silhouette, mystical and sacred Islamic atmosphere",
  batik:      'Hari Batik Nasional — Indonesian cultural heritage celebration, rich batik motif aesthetic, warm earthy Indonesian traditional tones, proud cultural identity',
  waisak:     'Waisak (Vesak) — Buddhist celebration, serene and peaceful atmosphere, lotus flowers, candlelight and lanterns, spiritual tranquility',
};

function renderOpsiEventFoto() {
  const today = new Date(); today.setHours(0,0,0,0);
  const hotEvs = EVENT_CALENDAR.filter(ev => isEventActive(ev, today));
  const soonSorted = EVENT_CALENDAR
    .filter(ev => !isEventActive(ev, today))
    .map(ev => { const next = getNextEventDate(ev); return next ? { ev, next, days: Math.round((next - today) / 86400000) } : null; })
    .filter(Boolean)
    .sort((a, b) => a.days - b.days);
  const hotOpts  = hotEvs.map(ev => `<option value="${ev.id}" ${_pendingEventId === ev.id ? 'selected' : ''}>🔥 ${ev.emoji} ${ev.name} — Aktif Sekarang</option>`).join('');
  const soonOpts = soonSorted.map(({ ev, days }) => `<option value="${ev.id}" ${_pendingEventId === ev.id ? 'selected' : ''}>${ev.emoji} ${ev.name} — ${days} hari lagi</option>`).join('');
  const hotGroup  = hotEvs.length    ? `<optgroup label="🔥 Aktif Sekarang">${hotOpts}</optgroup>` : '';
  const soonGroup = soonSorted.length ? `<optgroup label="🔜 Akan Datang — terdekat dulu">${soonOpts}</optgroup>` : '';

  const pending = _pendingEventId;
  _pendingEventId = null;
  if (pending) setTimeout(() => { const s = document.getElementById('event-select'); if (s && s.value) renderEventSubOptions(); }, 0);

  return `<div class="opt-group">
    <div class="opt-label">Pilih Event / Momen</div>
    <select class="opt-select" id="event-select" onchange="renderEventSubOptions()">
      <option value="">— Pilih event —</option>
      ${hotGroup}${soonGroup}
    </select>
  </div>
  <div id="event-sub-options"></div>`;
}

function renderEventSubOptions() {
  const sel  = document.getElementById('event-select')?.value || '';
  const cont = document.getElementById('event-sub-options');
  if (!cont) return;
  if (!sel) { cont.innerHTML = ''; checkReady(); return; }

  const ev   = EVENT_CALENDAR.find(e => e.id === sel);
  const opts = EVENT_OPTIONS[sel] || EVENT_OPTIONS_DEFAULT;
  const bgHtml = opts.bg.map((b, i) => `<option value="${b}"${i===0?' selected':''}>${b}</option>`).join('');

  cont.innerHTML = `
    <div class="opt-group">
      <div class="opt-label">Mode</div>
      <label class="radio-item"><input type="radio" name="ev-mode" value="tema" checked onchange="renderEventTeksInput()"> Tema foto saja</label>
      <label class="radio-item" style="margin-top:4px"><input type="radio" name="ev-mode" value="teks" onchange="renderEventTeksInput()"> Tema + teks ucapan</label>
    </div>
    <div class="opt-group">
      <div class="opt-label">Background</div>
      <select class="opt-select" id="event-bg">${bgHtml}</select>
    </div>
    <div class="opt-group">
      <div class="opt-label">Pakaian yang disarankan</div>
      <div class="note-box"><span class="note-icon">👗</span><span style="font-size:11px;">${opts.outfit}</span></div>
    </div>
    <div id="event-teks-wrap" style="display:none">
      <div class="opt-group">
        <div class="opt-label">Teks ucapan</div>
        <input type="text" class="opt-select" id="event-teks" placeholder="${opts.greet}" value="${opts.greet}" style="height:auto;padding:8px 10px">
      </div>
    </div>
    ${renderOpsiExtra('Keterangan tambahan (opsional)', 'Contoh: gaya foto outdoor, sertakan anak-anak juga')}`;
  checkReady();
}

function renderEventTeksInput() {
  const mode = document.querySelector('input[name="ev-mode"]:checked')?.value || 'tema';
  const wrap = document.getElementById('event-teks-wrap');
  if (wrap) wrap.style.display = mode === 'teks' ? '' : 'none';
  checkReady();
}

function buildPromptEventFoto() {
  const evId  = document.getElementById('event-select')?.value || '';
  const bg    = document.getElementById('event-bg')?.value || 'festive themed background';
  const mode  = document.querySelector('input[name="ev-mode"]:checked')?.value || 'tema';
  const teks  = document.getElementById('event-teks')?.value?.trim() || '';
  const extra = getExtra();

  const ev      = EVENT_CALENDAR.find(e => e.id === evId);
  const evName  = ev ? ev.name : 'special event';
  const theme   = EV_THEMES[evId] || `${evName} celebration — festive, joyful atmosphere`;
  const textLine = (mode === 'teks' && teks)
    ? `\n9. Add text overlay: "${teks}" — use an elegant, festive font style matching the ${evName} atmosphere. Position the text tastefully without covering the face. Font color must contrast clearly with the background.`
    : '';

  return `You are a professional photo editor specializing in themed event photography and festive transformations. Edit this photo for: ${theme}.

What to do:
1. Apply the themed background: ${bg} — seamlessly integrated, natural edge removal around the subject
2. Adjust color grading and overall lighting to match the ${evName} atmosphere — warm, festive, and coherent
3. The subject remains the clear focal point — background elements enhance but do not dominate
4. Apply even, flattering lighting across the face — consistent with the event theme's mood and palette
5. Subtle atmospheric additions (bokeh, ambient light, light decorative elements in background) are encouraged — keep them natural and non-intrusive
6. Clothing: if the existing clothing clearly does not match the event theme, suggest a fitting adjustment (note: do not force a change if the clothing is neutral and works)
7. Ensure the overall result looks photorealistic and professionally composed — not artificial or over-filtered
8. Enhance photo quality and sharpness throughout${textLine}
${extra ? '\nSpecial request: ' + extra : ''}
${WAJAH_RULE}`;
}
