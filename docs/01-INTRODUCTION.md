# Proje Tanıtımı (Project Overview)

Bu proje, **WordPress alternatifi** modern, yüksek performanslı ve geliştirici dostu bir **Headless CMS** oluşturmayı hedefler. Next.js App Router mimarisi üzerine kurulu olup, Prisma ORM ve MariaDB veritabanı kullanmaktadır.

## Temel Hedefler

1.  **Yüksek Performans:** Next.js'in statik ve dinamik render yeteneklerini kullanarak hızlı açılan sayfalar.
2.  **Sürükle & Bırak (Drag & Drop):** Kod yazmadan sayfa oluşturabilme yeteneği (Henüz roadmap aşamasında).
3.  **Tema Desteği:** WordPress gibi değiştirilebilir arayüzler (Henüz roadmap aşamasında).
4.  **Güçlü Çekirdek (Core):** Modüler, genişletilebilir ve temiz bir kod tabanı.

## Mevcut Durum (v0.1.0)

Şu anki sürüm, temel bir CMS iskeletine sahiptir:
-   **Routing:** Dinamik sayfa yönlendirmesi (`core/resolve.ts`).
-   **Render:** Basit HTML string render (`core/renderer.ts`).
-   **Veritabanı:** Prisma ile çoklu dosya yapısında modelleme.
-   **Admin Paneli:** Temel sayfa yönetimi (CRUD).
-   **Caching:** Bellek içi (In-memory) önbellekleme mekanizması (`core/cache.ts`).

## Dokümantasyon İçeriği

Bu klasör altında projenin detaylı analizlerini bulabilirsiniz:

1.  [Mimari (Architecture)](./02-ARCHITECTURE.md) - Sistemin nasıl çalıştığı.
2.  [Veritabanı (Database)](./03-DATABASE.md) - Veri modelleri ve ilişkiler.
3.  [Gap Analizi (Eksikler)](./04-GAP-ANALYSIS.md) - Hedeflenen vs Mevcut durum.
4.  [Yol Haritası (Roadmap)](./05-ROADMAP.md) - Geliştirme planı.
