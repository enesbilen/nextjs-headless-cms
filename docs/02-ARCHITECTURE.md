# Mimari Analizi (Architecture)

Proje, **Next.js 16 (App Router)** üzerinde, backend ve frontend'in iç içe geçtiği bir yapıda kurgulanmıştır. Ancak tipik bir React uygulamasından ziyade, geleneksel bir backend gibi davranarak HTML string'leri serve eden hibrit bir yapıdadır.

## 1. Çekirdek Modüller (`core/`)

Projenin kalbi `core` klasörüdür. Buradaki modüller, Next.js'ten bağımsız çalışabilecek şekilde tasarlanmıştır.

### A. URL Çözümleme (`core/resolve.ts`)
Gelen isteğin hangi içeriğe (Sayfa, Homepage, 404 vb.) gideceğini belirler.
-   **Giriş:** URL Path (ör: `/hakkimizda`).
-   **İşlem:**
    1.  Önce veritabanındaki `Settings` tablosundan `homepage_id` ve `notfound_page_id` ayarlarını çeker.
    2.  Ana sayfa (`/`) isteği ise ayardaki ID'ye veya `slug="home"` olan sayfaya bakar.
    3.  Normal bir path ise `slug` eşleşmesi arar.
    4.  Bulunamazsa 404 içeriğini döndürür.
-   **Çıktı:** `ResolveResult` (Bulundu, Bulunamadı, 404 Sayfası).

### B. Render Motoru (`core/renderer.ts` & `PageContent.tsx`)
Şu anki yapıda içerik, basit bir HTML string birleştirme (concatenation) yöntemiyle sunulmaktadır.
-   **`renderHTML`:** Basit bir HTML şablonu içine `title` ve `body` string'lerini gömer.
-   **Eksiklik:** Bu yapı henüz tema desteği veya blok tabanlı render (Components) içermemektedir. `body` alanı veritabanında tek bir string (LongText) olarak tutulmaktadır.

### C. Önbellekleme (`core/cache.ts` & `core/warmup.ts`)
Proje, veritabanı yükünü azaltmak için **In-Memory Cache** kullanır.
-   **Mekanizma:** Basit bir `Map<string, string>` yapısıdır.
-   **Akış:**
    1.  İstek gelir (`route.ts`).
    2.  Cache'te var mı? -> Varsa direkt HTML döndür.
    3.  Yoksa -> `resolve` et -> `render` et -> Cache'e yaz -> Döndür.
-   **Warmup:** Uygulama ayağa kalkarken (`route.ts` ilk isteğinde) `warmupCache` çağrılır (muhtemelen popüler sayfaları belleğe almak için).

## 2. Routing ve Sunum (`app/[...path]/route.ts`)

Next.js'in **Catch-all Route** özelliği kullanılarak tüm istekler tek bir noktadan karşılanır.

-   Bu dosya bir `page.tsx` (React Component) değil, bir `route.ts` (API Handler) olarak çalışır.
-   Bu sayede, tamamen server-side kontrol edilen, istemciye (client) sadece saf HTML gönderen çok hızlı bir yapı kurulmuştur.
-   **Avantajı:** Çok yüksek performans, düşük kaynak tüketimi.
-   **Dezavantajı:** React'in client-side özelliklerini (etkileşimli komponentler) bu rotada kullanmak zordur. Sürükle-bırak editör veya interaktif temalar için bu yapının `page.tsx` e evrilmesi gerekebilir.

## 3. Veri Erişimi (Prisma)

Veri erişimi `prisma/` klasöründeki şemalar üzerinden yönetilir. Çoklu dosya yapısı (multi-file schema) kullanılarak modülerlik sağlanmıştır.

---

**Özet:** Mimari şu an "Statik Site Üreteci" (SSG) mantığına yakın çalışmakta ancak bunu Request anında (SSR/ISR benzeri) yapmaktadır.
