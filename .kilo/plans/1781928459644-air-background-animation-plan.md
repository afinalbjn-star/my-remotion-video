# River Flow Background Animation Plan

## Spesifikasi
- **Resolusi**: 3840x2160 (4K)
- **FPS**: 60
- **Durasi**: 10 detik (600 frame)
- **Seamless Loop**: Ya, semua elemen animasi akan kembali ke frame awal

## Elemen Animasi
1. **Water Gradient Layer** - Latar belakang air dengan gradasi biru gelap ke cerah
2. **Wave System** - 5 lapisan gelombang dengan amplitudo berbeda
3. **Foam Effects** - 30 gelembung busa di permukaan air
4. **Bubble System** - 150 gelembung udara mengapung
5. **Caustic Light** - Cahaya tembus yang menyinari dasar sungai
6. **Sun Rays** - Sinar matahari menembus air (12 sinar)

## File yang Akan Dibuat
- `src/RiverFlow.tsx` - Komponen utama animasi sungai

## File yang Perlu Diedit
- `src/Root.tsx` - Menambahkan komposisi RiverFlow

## Teknik Seamless Loop
- Menggunakan `progress = frame / durationInFrames` dimodulasi `% 1.0`
- Gelombang menggunakan siklus sinus untuk keloop sempurna
- Busa dan gelembung menggunakan offset acak untuk variasi alami

## Struktur Kode
```tsx
// File: src/RiverFlow.tsx
- VIDEO_CONFIG 4K 60fps 10s
- PRNG untuk posisi deterministik
- Canvas 2D untuk render performa tinggi
- useEffect untuk draw setiap frame
- 6 layer visual terpisah
```