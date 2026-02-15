# Yol Haritası (Roadmap)

Projenin WordPress alternatifi modern bir CMS'e dönüşmesi için önerilen geliştirme adımlarıdır.

## Faz 1: Altyapı Modernizasyonu (Blok Yapısına Geçiş)

Bu fazda, "Tek Metin" yapısından "Blok" yapısına geçilecektir.

1.  **Veritabanı Migrasyonu:**
    -   `Page` modelindeki `body` alanı `content Json` olarak değiştirilecek veya korunup yanına eklenecek.
    -   Örnek JSON yapısı: `[{ type: "hero", props: {...} }, { type: "text", props: {...} }]`
2.  **Render Motoru Güncellemesi:**
    -   `app/[...path]/route.ts` yerine `app/[...path]/page.tsx` yapısına geçiş.
    -   `core/renderer.ts` yerine `components/BlockRenderer.tsx` oluşturulması. Bu komponent, JSON'daki `type` alanına göre ilgili React Component'ini ekrana basacak.

## Faz 2: Admin Paneli ve Page Builder

Bu fazda, içerik oluşturma deneyimi iyileştirilecektir.

1.  **Block Registry:**
    -   Sistemde kullanılabilir blokların (Heading, Paragraph, Image, Columns) tanımlandığı bir kayıt defteri.
2.  **Sürükle & Bırak Editör:**
    -   `@dnd-kit/core` veya `dnd-kit/sortable` kullanılarak admin panelinde blokların sıralanması.
    -   Sağ panelde blok ayarları (Props) editörü (Renk, Boyut, Metin).
3.  **Canlı Önizleme (Live Preview):**
    -   Editörün, sitenin gerçek haliyle birebir aynı görünmesi.

## Faz 3: Tema ve Özelleştirme

1.  **Tema Motoru:**
    -   Farklı dizinlerde (`themes/dark-theme`, `themes/light-theme`) tutulan komponent setleri.
    -   Admin panelinden aktif temanın seçilmesi (`Settings` tablosu üzerinden).
2.  **Menü Yönetimi:**
    -   Dinamik menü oluşturma arayüzü.

## Faz 4: İleri Seviye Özellikler

1.  **Eklenti Sistemi:**
    -   `core` fonksiyonlarına (hook) müdahale edebilme.
2.  **SEO Optimizasyonu:**
    -   Her sayfa/blok için meta tag yönetimi.
3.  **Çoklu Dil (i18n):**
    -   Next.js i18n routing entegrasyonu.

---

## İlk Aksiyon Planı (Hemen Yapılması Gerekenler)

1.  [ ] `docs/` klasöründeki analizleri inceleyip onayla.
2.  [ ] `Page` modeline `content Json` alanını ekle (`prisma migrate`).
3.  [ ] Basit bir "Blok Renderer" prototipi oluştur.
