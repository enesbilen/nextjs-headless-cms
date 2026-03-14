# ROADMAP: Header, Footer, 404 — Sistem Sayfaları (Theme Builder)

WordPress CMS / Elementor Theme Builder benzeri: Header, Footer ve 404 gibi **sistem bileşenlerini** page builder ile tasarlayıp kaydetme ve frontend’de kullanma planı.

---

## Mevcut Durum Özeti

| Bileşen    | Kayıt / Ayar                         | Tasarım (Builder)     | Frontend kullanımı                    |
|-----------|---------------------------------------|------------------------|----------------------------------------|
| Anasayfa  | `Setting`: `homepage_id` → `Page`     | ✅ Builder (blocks)    | ✅ `app/page.tsx` → `PageContent`      |
| İç sayfa  | `Page` (slug)                         | ✅ Builder             | ⚠️ `[...path]/route.ts` sadece `title`+`body` (HTML) |
| 404       | `Setting`: `notfound_page_id` → `Page`| ✅ Aynı sayfa builder  | ⚠️ `renderHTML(title, body)` — blocks yok |
| Header    | Yok                                   | Yok                    | Yok (root layout sadece `children`)   |
| Footer    | Yok                                   | Yok                    | Yok                                    |

**Özet:** 404 ve dinamik sayfalar şu an builder yerine sadece `body` HTML ile render ediliyor. Header/Footer hiç tanımlı değil.

---

## Hedef Mimari

1. **Header** ve **Footer:** Builder ile tasarlanabilir, tek seçim (site genelinde bir header, bir footer).
2. **404:** Zaten bir `Page` ile seçiliyor; bu sayfanın **blocks + builderMode** ile render edilmesi.
3. **Tutarlılık:** Tüm bu parçalar `core/page-builder` (PageBlockRenderer) ile çizilsin; admin tarafında mevcut `content/[id]/builder` akışı kullanılsın.

---

## Faz 1: Veri ve Ayar Yapısı

- [x] **1.1** Setting anahtarları: `core/settings-service.ts` → `CMS_SETTING_KEYS` içine `header_page_id`, `footer_page_id` eklendi.

- [x] **1.2** Page’in rolü

- Header / Footer / 404 için **ayrı tablo yerine mevcut `Page`** kullanılması önerilir:
  - Builder, revizyonlar ve medya kullanımı aynen kalır.
  - Hangi sayfanın “header” veya “footer” olduğu sadece **Setting** ile (id) belirlenir.
- **Opsiyonel:** İleride filtreleme için `Page` modeline `pageType` enum eklenebilir (`CONTENT` | `HEADER` | `FOOTER` | `NOT_FOUND`). Faz 1’de zorunlu değil; sadece id’ler yeterli.

### 1.3 Admin Ayarlar sayfası

- Ayarlar formuna **Header sayfası** ve **Footer sayfası** select’leri ekle (Anasayfa / 404 gibi).
- Liste: `status === "PUBLISHED"` olan sayfalar + isteğe bağlı “Sistem için ayrı taslak sayfalar” (ör. `slug: __header__, __footer__` veya sadece normal sayfalardan seçim).
- Validasyon: Anasayfa / 404 / Header / Footer aynı sayfayı seçemez (isteğe bağlı).

**Çıktı:** `header_page_id`, `footer_page_id` ayarları okunup yazılabiliyor; admin’de sayfa seçimi yapılabiliyor.

---

## Faz 2: Admin Nav ve “Sistem Sayfaları” Erişimi

### 2.1 Nav güncellemesi

- `app/admin/_config/nav.ts`: Yeni madde, örn. **“Sistem sayfaları”** veya **“Tema”**.
- Alt menü veya tek sayfa:
  - **Header** → Header olarak atanmış sayfanın builder’ına git (veya “ata ve düzenle”).
  - **Footer** → Footer sayfası builder.
  - **404** → 404 sayfası builder.

### 2.2 Sistem sayfaları listesi sayfası

- Route önerisi: `app/admin/system-pages/page.tsx` (veya `app/admin/theme/page.tsx`).
- İçerik:
  - Header: “Atanmış sayfa: X” + “Düzenle” (builder’a link) + “Sayfa seç” (ayarlar sayfasına veya inline select).
  - Footer: aynı.
  - 404: aynı (mevcut 404 sayfası seçimi + builder linki).
- “Düzenle” linki: `/admin/content/[id]/builder` — mevcut builder aynen kullanılır.

### 2.3 Sayfa yoksa davranış

- Header/Footer/404 için atanmış sayfa yoksa:
  - “Henüz atanmadı” mesajı + “Ayarlardan seç” veya “Yeni sayfa oluştur ve ata”.
- İsteğe bağlı: “Header için sayfa oluştur” → yeni sayfa (slug `__header__` veya serbest) → kaydet → ayarda `header_page_id` ata.

**Çıktı:** Admin’den tek yerden Header, Footer, 404’e erişip ilgili sayfayı builder’da açabiliyorsun.

---

## Faz 3: Render Pipeline — Blocks Desteği

Şu an `app/[...path]/route.ts` ve 404 cevabı sadece `renderHTML(title, body)` kullanıyor; `blocks` ve `builderMode` kullanılmıyor.

### 3.1 resolve / içerik çıktısı

- `core/resolve.ts` şu an sayfa için `title`, `body`, `slug` döndürüyor.
- **Genişletme:** Resolve’un döndüğü içerik tipine (veya ayrı bir “full page” sorgusuna) `blocks`, `builderMode`, `coverImage` vb. eklenmeli ki render tarafı blocks kullanabilsin.
- Öneri: `resolve`’u minimal tutup, route’ta “content bulundu” denince ilgili sayfa için **tam** `Page` (blocks, builderMode dahil) tekrar sorgulansın; veya resolve’un döndüğü tip genişletilip `blocks` ve `builderMode` eklensin.

### 3.2 404 sayfası render

- 404 durumunda (`not_found_page`) artık sadece `title` + `body` değil:
  - Bu sayfanın `builderMode` ve `blocks` alanı alınsın.
  - `builderMode && blocks` ise: `PageContent` veya doğrudan `PageBlockRenderer` ile render (React’ta); HTML’e çevirmek için `renderToStaticMarkup` veya mevcut render pipeline’a entegre edilmiş bir “blocks → HTML” yolunuz varsa o kullanılsın.
- Eğer tüm site HTML string üretiyorsa (`renderer.ts`): React bileşenlerini sunucuda render edip HTML string’e çeviren bir fonksiyon gerekir (örn. `renderPageContentToHTML(page)`).

### 3.3 Dinamik sayfalar (slug ile)

- Aynı mantık: Slug ile bulunan sayfa için `blocks` + `builderMode` kullanılsın; builder açıksa `PageContent`/blocks, değilse mevcut `body` HTML.

**Çıktı:** Hem 404 hem normal sayfalarda builder ile tasarlanmış içerik gerçekten “bloklu” olarak sunuluyor.

---

## Faz 4: Header ve Footer’ın Layout’a Bağlanması

### 4.1 Layout’ta yer

- Header ve Footer, **içerik sayfasından bağımsız** olduğu için en doğru yer **root layout** veya catch-all route’un sarmaladığı ortak şablondur.
- Next.js’te iki pratik yol:
  - **A) Root layout (`app/layout.tsx`):** `children` öncesi Header, sonrası Footer. Header/Footer içeriği server component’te ayarlardan okunup render edilir. Bu durumda tüm sayfalar (home, [...path], 404) aynı layout’u kullanır.
  - **B) Ortak layout route’u:** Eğer `[...path]/route.ts` saf HTML dönüyorsa ve React layout kullanmıyorsanız, HTML şablonunu üreten yerde (örn. `renderer.ts` veya yeni bir `layoutRenderer`) header/footer HTML’i enjekte edilir.

Mevcut yapıda `app/page.tsx` (home) React, `app/[...path]/route.ts` ise doğrudan HTML Response döndürüyor. Bu yüzden:

- **Kısa vadede:** Header/Footer’ı kullanacak bir **ortak HTML şablonu** hayal edin: “header HTML + main content HTML + footer HTML”. Bu şablonu hem `app/page.tsx` hem de `route.ts` ile uyumlu hale getmek için:
  - Ya tüm sayfa cevaplarını React (layout + page) ile üretirsiniz (RSC); header/footer layout’ta, content layout’un children’ı olur.
  - Ya da `route.ts` tarafında tek bir `renderFullPageHTML(headerDoc, mainDoc, footerDoc)` benzeri bir fonksiyonla üç parçayı birleştirirsiniz.

### 4.2 Header/Footer veri akışı

- Layout (veya HTML birleştirici) çalışırken:
  1. `getManySettings([ 'header_page_id', 'footer_page_id' ])` çağrılır.
  2. Bu id’lerle `Page` kayıtları alınır (`blocks`, `builderMode` dahil).
  3. Her biri için `PageBlockRenderer` (veya `PageContent`) ile HTML üretilir (server component veya `renderToStaticMarkup`).
  4. Bu HTML parçaları layout’ta uygun yerlere konur.

### 4.3 Ata yoksa

- `header_page_id` / `footer_page_id` boşsa: Header/Footer alanı boş bırakılır veya minimal varsayılan (ör. sadece site başlığı) gösterilir.

**Çıktı:** Sitede her sayfada (home, slug, 404) aynı Header ve Footer, builder ile tasarlanmış bloklarla gösteriliyor.

---

## Faz 5: 404 Özel Sayfasının Builder ile Render Edilmesi

- Zaten `notfound_page_id` ile bir sayfa atanıyor; bu sayfanın `blocks` ve `builderMode` alanı var.
- Yapılacak tek şey: 404 cevabı üretilirken bu sayfa için **Faz 3** ile aynı mantık (blocks + builderMode) kullanılsın; yani 404 de “sistem sayfası” olarak builder çıktısıyla render edilsin.
- HTTP status kodu yine 404 kalır; sadece body içeriği builder çıktısı olur.

**Çıktı:** 404 sayfası da Header, Footer, normal sayfalar gibi page builder ile tasarlanıp tutarlı şekilde sunuluyor.

---

## Faz 6: İsteğe Bağlı İyileştirmeler

- **Revizyon:** Header/Footer sayfaları da normal sayfa olduğu için mevcut `PageRevision` ile revizyonlanabilir.
- **Önizleme:** “Sistem sayfaları” ekranında “Header’ı önizle” gibi linkler (mevcut preview route’u kullanılabilir).
- **Varsayılan şablon:** İlk kurulumda `header_page_id` / `footer_page_id` boş; isteğe bağlı seed ile `slug: __header__` / `__footer__` sayfaları oluşturulup ayarlara yazılabilir.
- **pageType:** İleride `Page.pageType` ile “bu sayfa sadece header’da listelensin” gibi filtreler konulabilir.

---

## Uygulama Sırası Özeti

| Sıra | Faz | Kısa açıklama | Durum |
|------|-----|----------------|-------|
| 1 | **Faz 1** | `header_page_id`, `footer_page_id` ayarları + settings sayfası formu | ✅ Tamamlandı |
| 2 | **Faz 2** | Admin nav’a “Sistem sayfaları” + sistem sayfaları listesi/düzenleme sayfası | ✅ Tamamlandı |
| 3 | **Faz 3** | Resolve/render tarafında blocks + builderMode kullanımı (404 ve slug sayfaları) | ✅ Tamamlandı |
| 4 | **Faz 4** | Layout’ta (veya HTML şablonunda) Header/Footer verilerini çekip blokları render etme | ✅ Tamamlandı |
| 5 | **Faz 5** | 404 cevabında builder çıktısı kullanımı (Faz 3 ile birlikte düşünülebilir) | ✅ Tamamlandı |
| 6 | **Faz 6** | Önizleme, seed, pageType vb. iyileştirmeler | ✅ Tamamlandı |

---

## Teknik Notlar

- **DB bağlantısı:** Proje MySQL kullanıyor (`mysql -u root -p`, şifre: 123456). Prisma `datasource` ve `schema` bu yapıya göre; ek model gerekmez, sadece Setting key’leri ve mevcut `Page` kullanımı yeterli.
- **Builder:** `core/page-builder` ve `app/admin/content/[id]/builder` aynen kullanılacak; Header/Footer/404 sadece “hangi sayfa” ile ayarlardan seçiliyor.
- **Nav:** `nav.ts` içine örn. `{ href: "/admin/system-pages", label: "Sistem sayfaları" }` eklenmesi yeterli.

Bu plan ile Header, Footer ve 404 bileşenleri WordPress/Elementor benzeri şekilde builder ile tasarlanıp kaydedilebilir ve tüm sitede tutarlı biçimde kullanılabilir.

---

**Tamamlanan fazlar:** Faz 1–6. Faz 6: Sistem sayfaları sayfasında "Önizle" linkleri; seed'de `__header__` / `__footer__` sayfaları ve ayarlar (header/footer id'leri sadece boşsa set ediliyor).
