# Veritabanı Yapısı (Database Schema)

Proje, veritabanı yönetimi için **Prisma ORM** kullanmaktadır. Dikkat çekici özellik, standart tek dosya (`schema.prisma`) yerine, modellerin `prisma/models/` altında ayrı dosyalara bölünmüş olmasıdır. Bu, büyük projelerde yönetilebilirliği artırır.

## Temel Modeller

### 1. Page (`prisma/models/page.prisma`)
Sitenin ana içerik birimidir.
-   `id`: CUID.
-   `slug`: URL yolu (Unique).
-   `title`: Sayfa başlığı.
-   `body`: İçerik (HTML/Text). **Kritik:** Şu an `LongText` olarak tutuluyor. Drag & Drop yapısı için buranın JSON veya ilişkisel bir yapıya (Blocks) dönüşmesi gerekecek.
-   `status`: DRAFT, PUBLISHED (Enum).

### 2. User & Auth (`prisma/models/user.prisma`, `role.prisma`, `permission.prisma`)
Kullanıcı ve yetkilendirme sistemi.
-   **RBAC (Role Based Access Control):** Kullanıcıların Rolleri (`Role`), Rollerin İzinleri (`Permission`) vardır.
-   Bu yapı, WordPress'teki "Administrator", "Editor", "Author" yapısını kurmak için yeterli altyapıyı sağlar.

### 3. Settings (`prisma/models/setting.prisma`)
Sistem genelindeki ayarları tutar.
-   `key`: Ayar adı (örn: `homepage_id`).
-   `value`: Değer.
-   WordPress'teki `wp_options` tablosunun karşılığıdır.

### 4. Media (`prisma/models/media.prisma`)
Dosya ve görsel yönetimi için.
-   Muhtemelen dosya yolu, tipi ve boyutunu tutar.

## İlişkiler

-   Şu an için modeller arası ilişkiler (Relation) `prisma/models/*.prisma` dosyalarında tanımlıdır.
-   `schema.prisma` dosyası muhtemelen bu parçaları birleştiren veya ana konfigürasyonu tutan dosyadır.

## Veri Akışı

1.  **Sorgulama:** `core/resolve.ts` içerisindeki `findPublishedPageBySlug` fonksiyonu, `Page` tablosuna `slug` ve `status=PUBLISHED` filtresiyle sorgu atar.
2.  **Ayarlar:** `core/settings-service.ts`, `Setting` tablosundan verileri çeker.

## İyileştirme Alanları

-   **İçerik Yapısı:** `body String` alanı çok kısıtlıdır. Modern bir CMS için `ContentBlock` adında yeni bir model veya `body` alanının `JSON` tipine çevrilmesi şarttır.
-   **Revizyonlar:** Sayfa geçmişi (Revision History) için bir yapı görünmemektedir.
