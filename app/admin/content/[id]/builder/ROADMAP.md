# Page Builder — Elementor Benzeri Geliştirme Yol Haritası

Adım adım, çekirdeği sağlam temellere oturtarak ilerlenir. Her faz tamamlandıkça ilgili madde `[x]` ile işaretlenir.

---

## Faz 0: Çekirdek ve Best Practice Altyapısı

Temel tipler, sabitler ve store yapısı; sonraki tüm özellikler buna göre eklenecek.

- [x] **0.1** `core/page-builder/constants.ts` oluştur: `BREAKPOINTS` (desktop/tablet/mobile px), `HISTORY_MAX_SIZE`, `DEFAULT_DEVICE` gibi sabitler tek yerde.
- [x] **0.2** Tiplerde ortak “responsive override” şeması: `core/page-builder/types.ts` içinde `ResponsiveOverrides<T>` (opsiyonel `tablet`, `mobile`) ve ilk kullanım için bir blok tipine (örn. `HeadingProps`) örnek ekle.
- [x] **0.3** Store’da clipboard: `BuilderState`’e `clipboard: BlockInstance[] | null` ekle; `copySelectedToClipboard`, `pasteFromClipboard` aksiyonları (paste hedefi: root veya seçili container).
- [x] **0.4** Store’da çoklu seçim: `selectedIds: string[]` (veya `Set<string>`) + `selectBlock` / `toggleBlockSelection` / `clearSelection`; mevcut `selectedId` ile uyumlu (tek seçim de çalışsın).

---

## Faz 1: Hızlı Kazanımlar (Klavye + Önizleme + Kopyala/Yapıştır)

- [x] **1.1** Klavye: Delete/Backspace → seçili blok(lar)ı sil; Escape → seçimi temizle. `PageBuilderClient.tsx` keydown handler genişlet.
- [x] **1.2** Klavye: Ctrl+C → seçileni clipboard’a kopyala; Ctrl+V → clipboard’ı root veya seçili container’a yapıştır (Faz 0.3’e dayanır).
- [x] **1.3** Önizleme: Toolbar’a “Önizleme” butonu ekle; yeni sekmede `/admin/content/[id]/preview` veya `/?preview=1` aç (route’a göre). Preview sayfası sadece `PageBlockRenderer` + minimal layout (header/footer isteğe bağlı).
- [x] **1.4** Preview route: `app/admin/content/[id]/preview/page.tsx` (veya ana sayfa `preview` query ile) — taslak içeriği gösterecek şekilde veriyi al (mevcut `blocks` + `pageSettings`).

---

## Faz 2: Responsive (Breakpoint Bazlı)

- [ ] **2.1** Tipler: Tüm blok `*Props` tiplerinde (veya sadece kullanılacak olanlarda) `responsive?: ResponsiveOverrides<Partial<...>>` ekle; `BlockRenderer`’da henüz kullanma, sadece tip ve varsayılanlar.
- [ ] **2.2** CSS çıkışı: `BlockRenderer` (veya yardımcı) breakpoint’e göre inline style veya class üretsin; örn. `getResponsiveStyle(prop, responsive)` → `@media` için ayrı style tag veya Tailwind arbitrary variants. Alternatif: her blok wrapper’da `data-desktop-*`, `data-tablet-*`, `data-mobile-*` + global CSS.
- [ ] **2.3** PropertiesPanel: “Masaüstü / Tablet / Mobil” sekmesi veya cihaz seçicisine göre panel içeriğini değiştir; mevcut `device` state’i “hangi cihaz için düzenliyorum” anlamında kullan. Değer yoksa “Masaüstünden devral” gibi davran.
- [ ] **2.4** Frontend: `PageBlockRenderer` veya `BlockRenderer` içinde responsive stillerin gerçekten uygulandığını doğrula (media query veya data attribute).

---

## Faz 3: Revizyonlar

- [ ] **3.1** Veri modeli: `PageRevision` tablosu (veya mevcut `Page` üzerinde `revisions` JSON array) — `pageId`, `doc: PageBuilderDoc`, `createdAt`, `label?`. Migration + Prisma.
- [ ] **3.2** Kaydetme: Her “Taslak kaydet” / “Yayınla”da revizyon kaydı oluştur; son N revizyonu tut (sabit, örn. 20).
- [ ] **3.3** API: `getPageRevisions(pageId)`, `loadRevision(pageId, revisionId)` (veya index). Server action veya route.
- [ ] **3.4** UI: “Revizyonlar” paneli veya sayfa ayarları altında liste + “Bu sürüme dön” → `loadBlocks(revisionDoc)` + kullanıcıya “Taslak olarak kaydet” veya “Yayınla” seçeneği.

---

## Faz 4: Şablonlar (Section / Blok)

- [ ] **4.1** Sabit şablonlar: `core/page-builder/templates/sectionTemplates.ts` — en az 3–5 hazır section (Hero, Özellikler 3 sütun, CTA, vb.) `BlockInstance[][]` veya `BlockInstance[]` olarak.
- [ ] **4.2** UI: ElementsPanel veya canvas “boş” iken “Şablon ekle” butonu; şablon seçilince ilgili blok ağacı `addBlock`/paste mantığıyla canvas’a eklenir.
- [ ] **4.3** (Opsiyonel) DB şablonları: `Template` modeli (name, doc, type: section | page); admin’de yönetim. Faz 4.2’yi “sabit + DB” şablonları gösterecek şekilde genişlet.

---

## Faz 5: Görünürlük ve Küçük İyileştirmeler

- [ ] **5.1** Blok görünürlüğü: Her blokta `visibility?: { hideOnDesktop?: boolean; hideOnTablet?: boolean; hideOnMobile?: boolean }`. `BlockRenderer`’da ilgili breakpoint’te gizle (class veya style).
- [ ] **5.2** PropertiesPanel’de “Görünürlük” alanı: 3 checkbox (Masaüstünde göster, Tablet’te göster, Mobilde göster) veya “Bu cihazda gizle” seçenekleri.
- [ ] **5.3** Global stiller hazırlığı: `core/page-builder/theme.ts` veya site ayarlarından okuyacak `getGlobalColors()`, `getGlobalFonts()` placeholder; bloklarda “Renk: Primary” gibi kullanım için tip/constant (gerçek tema entegrasyonu ayrı iş).

---

## Faz 6: İsteğe Bağlı Genişletmeler

- [ ] **6.1** Yeni bloklar: Tabs, Accordion, Icon Box (ikon + başlık + metin) — tip, definition, renderer, panel editor.
- [ ] **6.2** Sütun sayısı: columns-2 ↔ columns-3 geçişi veya “Sütun ekle” (children + columnWidths güncellemesi).
- [ ] **6.3** Sayfa şablonu / Theme Builder: Header/footer builder (uzun vadeli).

---

## Tamamlanma Durumu

| Faz | Açıklama              | Durum   |
|-----|------------------------|---------|
| 0   | Çekirdek / altyapı     | ✅ Tamamlandı |
| 1   | Klavye, önizleme, kopyala/yapıştır | ✅ Tamamlandı |
| 2   | Responsive             | Bekliyor |
| 3   | Revizyonlar            | Bekliyor |
| 4   | Şablonlar              | Bekliyor |
| 5   | Görünürlük + global hazırlık | Bekliyor |
| 6   | Opsiyonel genişletmeler | Bekliyor |

---

*Son güncelleme: Faz 1 tamamlandı (Delete/Backspace/Escape, Ctrl+C/V, Önizleme butonu, preview route).*
