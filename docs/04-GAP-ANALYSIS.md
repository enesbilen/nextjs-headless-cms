# Gap Analizi (Mevcut Durum vs Hedef)

Bu belge, projenin şu anki hali ile hedeflenen "WordPress Alternatifi + Sürükle Bırak CMS" vizyonu arasındaki farkları analiz eder.

| Özellik | Mevcut Durum (Current State) | Hedeflenen Durum (Goal) | Eksiklik/Gap |
| :--- | :--- | :--- | :--- |
| **İçerik Yapısı** | Tek bir HTML string (`body` alanı). | Blok tabanlı yapı (Başlık, Görsel, Kolonlar, Video vb.). | `Page` modelinin JSON veya Blok ilişkisine çevrilmesi gerekiyor. |
| **Editör Deneyimi** | Muhtemelen basit Textarea veya temel bir WYSIWYG. | Sürükle & Bırak (Drag & Drop) Page Builder. | Frontend'de `@dnd-kit` entegrasyonu ve Backend'de blok yapısının desteklenmesi. |
| **Tema Sistemi** | `core/renderer.ts` içinde hardcoded HTML şablonu. | Değiştirilebilir, dinamik tema desteği. | Render motorunun React Component tabanlı dinamik bir yapıya evrilmesi. |
| **Routing** | `route.ts` üzerinden saf HTML döndürüyor. | Hibrit yapı (SEO için HTML, Etkileşim için React Hydration). | `route.ts` yerine `page.tsx` kullanılarak Server Component + Client Component yapısına geçiş. |
| **Eklenti (Plugin)** | Yok. | Hook sistemi veya modüler yapı. | Core event'lerine (save, render vb.) kanca (hook) atılabilecek bir yapı. |
| **Medya Yönetimi** | `Media` modeli var. | Medya kütüphanesi arayüzü ve sürükle-bırak yükleme. | Admin panelinde görsel galeri ve upload komponenti. |
| **Menü Yönetimi** | Hardcoded olabilir. | Dinamik menü oluşturucu. | `Menu` ve `MenuItem` modelleri ve admin arayüzü. |

## Kritik Tespitler

1.  **Mevcut Render Mantığı Engel Teşkil Ediyor:** `app/[...path]/route.ts` kullanımı şu an çok hızlı olsa da, interaktif bir "Frontend Editing" veya modern React komponentlerini (Slider, Interactive Maps vb.) render etmek için kısıtlayıcıdır. Next.js'in standart `page.tsx` yapısına dönüp, veritabanından gelen JSON bloklarını React Component'lerine map eden bir yapıya geçilmelidir.
2.  **Veri Modeli Blokları Desteklemiyor:** `body` alanının düz metin olması, sürükle-bırak yapısını imkansız kılar.
