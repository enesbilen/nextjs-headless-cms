import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hash } from "bcryptjs";

function getAdapter() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const u = new URL(url);
  return new PrismaMariaDb({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1) || undefined,
  });
}

const db = new PrismaClient({ adapter: getAdapter() });

async function main() {
  console.log("🌱 Seed başlatılıyor...\n");

  // ─── 1. ROLES & PERMISSIONS ──────────────────────────────────────────

  const adminRole = await db.role.upsert({
    where: { name: "admin" },
    create: { name: "admin" },
    update: {},
  });

  const editorRole = await db.role.upsert({
    where: { name: "editor" },
    create: { name: "editor" },
    update: {},
  });

  const viewerRole = await db.role.upsert({
    where: { name: "viewer" },
    create: { name: "viewer" },
    update: {},
  });

  const permDefs = [
    { action: "manage", resource: "all" },
    { action: "create", resource: "page" },
    { action: "edit", resource: "page" },
    { action: "delete", resource: "page" },
    { action: "publish", resource: "page" },
    { action: "create", resource: "post" },
    { action: "edit", resource: "post" },
    { action: "delete", resource: "post" },
    { action: "publish", resource: "post" },
    { action: "upload", resource: "media" },
    { action: "delete", resource: "media" },
    { action: "manage", resource: "menu" },
    { action: "manage", resource: "setting" },
    { action: "manage", resource: "user" },
    { action: "view", resource: "page" },
    { action: "view", resource: "post" },
    { action: "view", resource: "media" },
  ];

  const permissions: Record<string, string> = {};
  for (const p of permDefs) {
    const perm = await db.permission.upsert({
      where: { action_resource: { action: p.action, resource: p.resource ?? "" } },
      create: { name: `${p.action}:${p.resource}`, action: p.action, resource: p.resource },
      update: {},
    });
    permissions[`${p.action}:${p.resource}`] = perm.id;
  }

  for (const permId of Object.values(permissions)) {
    await db.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permId } },
      create: { roleId: adminRole.id, permissionId: permId },
      update: {},
    });
  }

  const editorPerms = [
    "create:page", "edit:page", "publish:page",
    "create:post", "edit:post", "publish:post",
    "upload:media", "manage:menu",
    "view:page", "view:post", "view:media",
  ];
  for (const key of editorPerms) {
    const permId = permissions[key];
    if (!permId) continue;
    await db.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: editorRole.id, permissionId: permId } },
      create: { roleId: editorRole.id, permissionId: permId },
      update: {},
    });
  }

  const viewerPerms = ["view:page", "view:post", "view:media"];
  for (const key of viewerPerms) {
    const permId = permissions[key];
    if (!permId) continue;
    await db.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: viewerRole.id, permissionId: permId } },
      create: { roleId: viewerRole.id, permissionId: permId },
      update: {},
    });
  }

  console.log("✅ Roller: admin, editor, viewer");
  console.log(`✅ İzinler: ${Object.keys(permissions).length} adet`);

  // ─── 2. ADMIN USER ───────────────────────────────────────────────────

  const email = process.env.ADMIN_EMAIL || "admin@localhost";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await hash(password, 10);

  await db.user.upsert({
    where: { email },
    create: { email, passwordHash, roleId: adminRole.id },
    update: { passwordHash, roleId: adminRole.id },
  });
  console.log(`✅ Admin kullanıcı: ${email}`);

  // ─── 3. PAGES ────────────────────────────────────────────────────────

  const homePage = await db.page.upsert({
    where: { slug: "home" },
    create: {
      slug: "home",
      title: "Ana Sayfa",
      body: "",
      builderMode: true,
      blocks: {
        version: 1,
        blocks: [
          {
            id: "seed-hero-1",
            type: "hero",
            props: {
              heading: "Modern Web Deneyimi",
              subheading: "Next.js tabanlı güçlü CMS altyapısıyla hızlı, esnek ve ölçeklenebilir web siteleri oluşturun.",
              buttonLabel: "Keşfet",
              buttonHref: "#features",
              backgroundColor: "#0f172a",
              textColor: "#ffffff",
              align: "center",
              height: "520px",
              overlayOpacity: 0.4,
            },
          },
          {
            id: "seed-features-sec",
            type: "section",
            props: {
              backgroundColor: "#ffffff",
              paddingTop: 64,
              paddingBottom: 64,
              paddingLeft: 24,
              paddingRight: 24,
              maxWidth: "1200px",
              gap: 24,
            },
            children: [
              [
                {
                  id: "seed-feat-heading",
                  type: "heading",
                  props: { text: "Neden Bizi Tercih Etmelisiniz?", level: 2, align: "center", color: "#111827", fontWeight: "bold" },
                },
                {
                  id: "seed-feat-cols",
                  type: "columns-3",
                  props: {
                    columns: 3,
                    gap: 32,
                    verticalAlign: "start",
                    columnWidths: ["1fr", "1fr", "1fr"],
                    backgroundColor: "transparent",
                    paddingTop: 24,
                    paddingBottom: 0,
                  },
                  children: [
                    [
                      {
                        id: "seed-f1-icon",
                        type: "icon-box",
                        props: { icon: "⚡", title: "Hızlı Performans", text: "Next.js ve React ile optimize edilmiş sayfa yükleme süreleri.", align: "center", iconColor: "#2563eb", titleColor: "#111827", textColor: "#4b5563" },
                      },
                    ],
                    [
                      {
                        id: "seed-f2-icon",
                        type: "icon-box",
                        props: { icon: "🎨", title: "Görsel Builder", text: "Sürükle & bırak ile sayfalarınızı kolayca tasarlayın.", align: "center", iconColor: "#7c3aed", titleColor: "#111827", textColor: "#4b5563" },
                      },
                    ],
                    [
                      {
                        id: "seed-f3-icon",
                        type: "icon-box",
                        props: { icon: "🔒", title: "Güvenli Altyapı", text: "Rol tabanlı yetkilendirme ve güvenli oturum yönetimi.", align: "center", iconColor: "#059669", titleColor: "#111827", textColor: "#4b5563" },
                      },
                    ],
                  ],
                },
              ],
            ],
          },
          {
            id: "seed-cta-sec",
            type: "section",
            props: {
              backgroundColor: "#eff6ff",
              paddingTop: 56,
              paddingBottom: 56,
              paddingLeft: 24,
              paddingRight: 24,
              maxWidth: "800px",
              gap: 20,
            },
            children: [
              [
                {
                  id: "seed-cta-h",
                  type: "heading",
                  props: { text: "Hemen Başlayın", level: 2, align: "center", color: "#1e40af", fontWeight: "bold" },
                },
                {
                  id: "seed-cta-t",
                  type: "text",
                  props: { text: "Projelerinizi hayata geçirmek için admin panelinden sayfa oluşturun ve builder ile düzenleyin.", align: "center", color: "#374151", fontSize: "1.05rem" },
                },
                {
                  id: "seed-cta-btn",
                  type: "button",
                  props: { label: "İletişime Geçin", href: "/iletisim", variant: "primary", size: "lg", align: "center", openInNewTab: false, backgroundColor: "#2563eb", textColor: "#ffffff", borderRadius: "0.5rem" },
                },
              ],
            ],
          },
        ],
        pageSettings: {
          layoutPreset: "full-width",
          contentWidth: "100%",
          backgroundColor: "#ffffff",
          textColor: "#111827",
          paddingTop: 0,
          paddingBottom: 0,
        },
      } as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
    },
    update: {},
  });

  const notfoundPage = await db.page.upsert({
    where: { slug: "404" },
    create: {
      slug: "404",
      title: "Sayfa Bulunamadı",
      body: "",
      builderMode: true,
      blocks: {
        version: 1,
        blocks: [
          {
            id: "seed-404-sec",
            type: "section",
            props: {
              backgroundColor: "#f9fafb",
              paddingTop: 80,
              paddingBottom: 80,
              paddingLeft: 24,
              paddingRight: 24,
              maxWidth: "600px",
              gap: 16,
            },
            children: [
              [
                { id: "seed-404-h", type: "heading", props: { text: "404", level: 1, align: "center", color: "#2563eb", fontWeight: "extrabold", fontSize: "5rem" } },
                { id: "seed-404-t1", type: "heading", props: { text: "Sayfa Bulunamadı", level: 2, align: "center", color: "#111827", fontWeight: "bold" } },
                { id: "seed-404-t2", type: "text", props: { text: "Aradığınız sayfa taşınmış veya silinmiş olabilir.", align: "center", color: "#6b7280", fontSize: "1rem" } },
                { id: "seed-404-btn", type: "button", props: { label: "Ana Sayfaya Dön", href: "/", variant: "primary", size: "md", align: "center", openInNewTab: false, backgroundColor: "#2563eb", textColor: "#ffffff", borderRadius: "0.5rem" } },
              ],
            ],
          },
        ],
      } as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
    },
    update: {},
  });

  const contactPage = await db.page.upsert({
    where: { slug: "iletisim" },
    create: {
      slug: "iletisim",
      title: "İletişim",
      body: "",
      builderMode: true,
      blocks: {
        version: 1,
        blocks: [
          {
            id: "seed-contact-sec",
            type: "section",
            props: {
              backgroundColor: "#ffffff",
              paddingTop: 64,
              paddingBottom: 64,
              paddingLeft: 24,
              paddingRight: 24,
              maxWidth: "900px",
              gap: 24,
            },
            children: [
              [
                { id: "seed-contact-h", type: "heading", props: { text: "Bize Ulaşın", level: 1, align: "center", color: "#111827", fontWeight: "bold" } },
                { id: "seed-contact-t", type: "text", props: { text: "Sorularınız veya önerileriniz için aşağıdaki formu doldurun, en kısa sürede dönüş yapacağız.", align: "center", color: "#6b7280", fontSize: "1rem" } },
                {
                  id: "seed-contact-form",
                  type: "form",
                  props: {
                    fields: [
                      { label: "Ad Soyad", type: "text", required: true },
                      { label: "E-posta", type: "email", required: true },
                      { label: "Konu", type: "text", required: false },
                      { label: "Mesajınız", type: "textarea", required: true },
                    ],
                    submitLabel: "Gönder",
                    backgroundColor: "#f9fafb",
                    buttonColor: "#2563eb",
                  },
                },
              ],
            ],
          },
          {
            id: "seed-contact-map-sec",
            type: "section",
            props: {
              backgroundColor: "#f9fafb",
              paddingTop: 0,
              paddingBottom: 64,
              paddingLeft: 24,
              paddingRight: 24,
              maxWidth: "900px",
              gap: 16,
            },
            children: [
              [
                { id: "seed-contact-map-h", type: "heading", props: { text: "Konumumuz", level: 3, align: "center", color: "#111827", fontWeight: "semibold" } },
                { id: "seed-contact-map", type: "map", props: { embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.271972527045!2d28.97693!3d41.03623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab9bd6570f4e1%3A0x5b2e1e25c5fd8!2zxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1", height: "350px", borderRadius: "0.75rem" } },
              ],
            ],
          },
        ],
      } as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
    },
    update: {},
  });

  const aboutPage = await db.page.upsert({
    where: { slug: "hakkimizda" },
    create: {
      slug: "hakkimizda",
      title: "Hakkımızda",
      body: "",
      builderMode: true,
      blocks: {
        version: 1,
        blocks: [
          {
            id: "seed-about-hero",
            type: "hero",
            props: {
              heading: "Hakkımızda",
              subheading: "Teknoloji ile geleceği inşa ediyoruz.",
              buttonLabel: "",
              buttonHref: "#",
              backgroundColor: "#1e3a5f",
              textColor: "#ffffff",
              align: "center",
              height: "320px",
              overlayOpacity: 0.3,
            },
          },
          {
            id: "seed-about-sec",
            type: "section",
            props: {
              backgroundColor: "#ffffff",
              paddingTop: 56,
              paddingBottom: 56,
              paddingLeft: 24,
              paddingRight: 24,
              maxWidth: "900px",
              gap: 24,
            },
            children: [
              [
                {
                  id: "seed-about-cols",
                  type: "columns-2",
                  props: {
                    columns: 2,
                    gap: 40,
                    verticalAlign: "start",
                    columnWidths: ["1fr", "1fr"],
                    backgroundColor: "transparent",
                    paddingTop: 0,
                    paddingBottom: 0,
                  },
                  children: [
                    [
                      { id: "seed-about-h1", type: "heading", props: { text: "Misyonumuz", level: 2, align: "left", color: "#111827", fontWeight: "bold" } },
                      { id: "seed-about-t1", type: "text", props: { text: "Modern web teknolojileri kullanarak işletmelerin dijital dönüşümünü hızlandırmak ve kullanıcı deneyimini en üst seviyeye çıkarmak.", align: "left", color: "#4b5563", fontSize: "1rem" } },
                    ],
                    [
                      { id: "seed-about-h2", type: "heading", props: { text: "Vizyonumuz", level: 2, align: "left", color: "#111827", fontWeight: "bold" } },
                      { id: "seed-about-t2", type: "text", props: { text: "Türkiye'nin lider açık kaynak CMS platformu olarak, her ölçekteki web projesine güç vermek.", align: "left", color: "#4b5563", fontSize: "1rem" } },
                    ],
                  ],
                },
              ],
            ],
          },
          {
            id: "seed-about-stats",
            type: "section",
            props: {
              backgroundColor: "#f8fafc",
              paddingTop: 48,
              paddingBottom: 48,
              paddingLeft: 24,
              paddingRight: 24,
              maxWidth: "1000px",
              gap: 16,
            },
            children: [
              [
                {
                  id: "seed-about-stat-cols",
                  type: "columns-3",
                  props: {
                    columns: 3,
                    gap: 24,
                    verticalAlign: "center",
                    columnWidths: ["1fr", "1fr", "1fr"],
                    backgroundColor: "transparent",
                    paddingTop: 0,
                    paddingBottom: 0,
                  },
                  children: [
                    [{ id: "seed-stat1", type: "counter", props: { value: "500", label: "Proje Tamamlandı", prefix: "", suffix: "+", color: "#2563eb" } }],
                    [{ id: "seed-stat2", type: "counter", props: { value: "50", label: "Mutlu Müşteri", prefix: "", suffix: "+", color: "#7c3aed" } }],
                    [{ id: "seed-stat3", type: "counter", props: { value: "99", label: "Memnuniyet Oranı", prefix: "%", suffix: "", color: "#059669" } }],
                  ],
                },
              ],
            ],
          },
        ],
      } as unknown as Prisma.InputJsonValue,
      status: "PUBLISHED",
    },
    update: {},
  });

  const headerPage = await db.page.upsert({
    where: { slug: "__header__" },
    create: {
      slug: "__header__",
      title: "Header",
      body: "",
      builderMode: false,
      status: "PUBLISHED",
    },
    update: {},
  });

  const footerPage = await db.page.upsert({
    where: { slug: "__footer__" },
    create: {
      slug: "__footer__",
      title: "Footer",
      body: "",
      builderMode: false,
      status: "PUBLISHED",
    },
    update: {},
  });

  console.log("✅ Sayfalar: Ana Sayfa, 404, İletişim, Hakkımızda, Header, Footer");

  // ─── 4. BLOG POSTS ───────────────────────────────────────────────────

  const post1 = await db.post.upsert({
    where: { slug: "nextjs-ile-modern-web-gelistirme" },
    create: {
      slug: "nextjs-ile-modern-web-gelistirme",
      title: "Next.js ile Modern Web Geliştirme",
      body: "<p>Next.js, React tabanlı web uygulamaları oluşturmak için en popüler framework'lerden biridir. Server-side rendering, static site generation ve API routes gibi güçlü özellikleri ile modern web projelerinin vazgeçilmezi haline gelmiştir.</p><h2>Neden Next.js?</h2><p>Performans, SEO uyumluluğu ve geliştirici deneyimi açısından Next.js birçok avantaj sunar. Otomatik kod bölme, görsel optimizasyonu ve artımlı statik yeniden oluşturma gibi özellikleri ile hem geliştirici hem de kullanıcı deneyimini üst seviyeye taşır.</p>",
      excerpt: "Next.js ile modern web uygulamalarının temellerini ve avantajlarını keşfedin.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    update: {},
  });

  const post2 = await db.post.upsert({
    where: { slug: "tailwind-css-ile-hizli-tasarim" },
    create: {
      slug: "tailwind-css-ile-hizli-tasarim",
      title: "Tailwind CSS ile Hızlı Tasarım",
      body: "<p>Tailwind CSS, utility-first yaklaşımıyla CSS yazmayı tamamen değiştiren bir framework'tür. Önceden tanımlanmış sınıflarla hızlı bir şekilde arayüz tasarlayabilirsiniz.</p><h2>Avantajları</h2><ul><li>Hızlı prototipleme</li><li>Tutarlı tasarım sistemi</li><li>Küçük bundle boyutu (kullanılmayan CSS otomatik temizlenir)</li><li>Responsive tasarım kolaylığı</li></ul>",
      excerpt: "Tailwind CSS'in utility-first yaklaşımıyla nasıl hızlı ve tutarlı arayüzler oluşturabilirsiniz.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    update: {},
  });

  await db.post.upsert({
    where: { slug: "prisma-orm-veritabani-yonetimi" },
    create: {
      slug: "prisma-orm-veritabani-yonetimi",
      title: "Prisma ORM ile Veritabanı Yönetimi",
      body: "<p>Prisma, TypeScript ve Node.js için geliştirilmiş modern bir ORM'dir. Tip güvenli veritabanı sorguları, otomatik migration'lar ve görsel veritabanı yönetimi araçları sunar.</p><h2>Prisma'nın Temel Bileşenleri</h2><p>Prisma Client (tip güvenli sorgu API), Prisma Migrate (şema migration), ve Prisma Studio (görsel veritabanı editörü) ile tam bir veritabanı yönetim deneyimi sunar.</p>",
      excerpt: "Prisma ORM ile tip güvenli veritabanı yönetiminin temellerini öğrenin.",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    update: {},
  });

  console.log("✅ Blog yazıları: 3 adet");

  // ─── 5. COMMENTS ─────────────────────────────────────────────────────

  await db.comment.upsert({
    where: { id: "seed-comment-1" },
    create: {
      id: "seed-comment-1",
      body: "Harika bir makale, çok faydalı oldu. Teşekkürler!",
      postId: post1.id,
    },
    update: {},
  });

  await db.comment.upsert({
    where: { id: "seed-comment-2" },
    create: {
      id: "seed-comment-2",
      body: "Tailwind CSS gerçekten geliştirme hızını inanılmaz artırıyor.",
      postId: post2.id,
    },
    update: {},
  });

  console.log("✅ Yorumlar: 2 adet");

  // ─── 6. MENUS ────────────────────────────────────────────────────────

  const mainMenu = await db.menu.upsert({
    where: { slug: "main-menu" },
    create: { name: "Ana Menü", slug: "main-menu" },
    update: { name: "Ana Menü" },
  });

  const menuItems = [
    { label: "Ana Sayfa", href: "/", order: 0 },
    { label: "Hakkımızda", href: "/hakkimizda", order: 1 },
    { label: "Blog", href: "/blog", order: 2 },
    { label: "İletişim", href: "/iletisim", order: 3 },
  ];

  for (const item of menuItems) {
    const existing = await db.menuItem.findFirst({
      where: { menuId: mainMenu.id, label: item.label },
    });
    if (!existing) {
      await db.menuItem.create({
        data: {
          menuId: mainMenu.id,
          label: item.label,
          href: item.href,
          order: item.order,
          openInNewTab: false,
        },
      });
    }
  }

  const footerMenu = await db.menu.upsert({
    where: { slug: "footer-menu" },
    create: { name: "Footer Menü", slug: "footer-menu" },
    update: { name: "Footer Menü" },
  });

  const footerMenuItems = [
    { label: "Gizlilik Politikası", href: "/gizlilik", order: 0 },
    { label: "Kullanım Şartları", href: "/kullanim-sartlari", order: 1 },
    { label: "İletişim", href: "/iletisim", order: 2 },
  ];

  for (const item of footerMenuItems) {
    const existing = await db.menuItem.findFirst({
      where: { menuId: footerMenu.id, label: item.label },
    });
    if (!existing) {
      await db.menuItem.create({
        data: {
          menuId: footerMenu.id,
          label: item.label,
          href: item.href,
          order: item.order,
          openInNewTab: false,
        },
      });
    }
  }

  console.log("✅ Menüler: Ana Menü (4 öğe), Footer Menü (3 öğe)");

  // ─── 7. WIDGET PLACEMENTS ────────────────────────────────────────────

  const existingWidgets = await db.widgetPlacement.findMany({
    where: { zoneKey: { in: ["header", "footer"] } },
  });

  if (existingWidgets.length === 0) {
    await db.widgetPlacement.create({
      data: {
        zoneKey: "header",
        widgetType: "menu",
        config: { menuId: mainMenu.id } as unknown as Prisma.InputJsonValue,
        order: 0,
      },
    });
    await db.widgetPlacement.create({
      data: {
        zoneKey: "header",
        widgetType: "logo",
        config: {} as unknown as Prisma.InputJsonValue,
        order: 1,
      },
    });
    await db.widgetPlacement.create({
      data: {
        zoneKey: "footer",
        widgetType: "menu",
        config: { menuId: footerMenu.id } as unknown as Prisma.InputJsonValue,
        order: 0,
      },
    });
    console.log("✅ Widget yerleşimleri: Header (menu + logo), Footer (menu)");
  } else {
    console.log("⏭️  Widget yerleşimleri zaten var, atlanıyor");
  }

  // ─── 8. SETTINGS ─────────────────────────────────────────────────────

  const settings: [string, string][] = [
    ["site_title", "Next CMS"],
    ["site_description", "Next.js tabanlı modern içerik yönetim sistemi"],
    ["site_logo_url", ""],
    ["homepage_id", homePage.id],
    ["notfound_page_id", notfoundPage.id],
    ["header_page_id", headerPage.id],
    ["footer_page_id", footerPage.id],
    ["header_mode", "template"],
    ["header_template_id", "classic"],
    ["footer_mode", "template"],
    ["footer_template_id", "simple-footer"],
  ];

  for (const [key, value] of settings) {
    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  console.log("✅ Ayarlar: 11 adet (site, layout, header/footer mode & template)");

  // ─── DONE ────────────────────────────────────────────────────────────

  console.log("\n🎉 Seed tamamlandı!");
  console.log("────────────────────────────────────────");
  console.log("  Admin: " + email + " / " + password);
  console.log("  Sayfalar: home, 404, iletisim, hakkimizda, __header__, __footer__");
  console.log("  Blog: 3 yazı, 2 yorum");
  console.log("  Menüler: main-menu, footer-menu");
  console.log("  Roller: admin, editor, viewer");
  console.log("  Header: template (classic) | Footer: template (simple)");
  console.log("────────────────────────────────────────");
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
