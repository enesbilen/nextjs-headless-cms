import type { BlockType, BlockProps } from "../types";

// ---------------------------------------------------------------------------
// Block definition (metadata displayed in BuilderElementsPanel)
// ---------------------------------------------------------------------------

export interface BlockDefinition {
    type: BlockType;
    label: string;
    icon: string; // emoji or lucide name — we use emoji here for zero-dep
    category: "layout" | "basic" | "media" | "advanced";
    description: string;
    defaultProps: BlockProps;
}

// ---------------------------------------------------------------------------
// Default props per block type
// ---------------------------------------------------------------------------

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
    // ─── LAYOUT ─────────────────────────────────────────────────────────────
    {
        type: "section",
        label: "Bölüm",
        icon: "□",
        category: "layout",
        description: "Diğer blokları barındıran konteyner",
        defaultProps: {
            backgroundColor: "transparent",
            paddingTop: 40,
            paddingBottom: 40,
            paddingLeft: 16,
            paddingRight: 16,
            maxWidth: "1200px",
            gap: 16,
        },
    },
    {
        type: "columns-2",
        label: "2 Sütun",
        icon: "⊞",
        category: "layout",
        description: "İki sütunlu düzen",
        defaultProps: {
            columns: 2,
            gap: 24,
            verticalAlign: "start",
            columnWidths: ["1fr", "1fr"],
            backgroundColor: "transparent",
            paddingTop: 0,
            paddingBottom: 0,
        },
    },
    {
        type: "columns-3",
        label: "3 Sütun",
        icon: "⊟",
        category: "layout",
        description: "Üç sütunlu düzen",
        defaultProps: {
            columns: 3,
            gap: 24,
            verticalAlign: "start",
            columnWidths: ["1fr", "1fr", "1fr"],
            backgroundColor: "transparent",
            paddingTop: 0,
            paddingBottom: 0,
        },
    },

    // ─── BASIC ──────────────────────────────────────────────────────────────
    {
        type: "heading",
        label: "Başlık",
        icon: "H",
        category: "basic",
        description: "H1–H6 başlık etiketi",
        defaultProps: {
            text: "Başlığınızı buraya yazın",
            level: 2,
            align: "left",
            color: "#111827",
            fontWeight: "bold",
        },
    },
    {
        type: "text",
        label: "Metin",
        icon: "¶",
        category: "basic",
        description: "Paragraf / metin bloğu",
        defaultProps: {
            text: "Metninizi buraya yazın. Burası bir örnek paragraftır.",
            align: "left",
            color: "#374151",
            fontSize: "1rem",
        },
    },
    {
        type: "button",
        label: "Buton",
        icon: "⬡",
        category: "basic",
        description: "CTA butonu",
        defaultProps: {
            label: "Tıkla",
            href: "#",
            variant: "primary",
            size: "md",
            align: "left",
            openInNewTab: false,
            backgroundColor: "#2563eb",
            textColor: "#ffffff",
            borderRadius: "0.5rem",
        },
    },
    {
        type: "divider",
        label: "Ayraç",
        icon: "─",
        category: "basic",
        description: "Yatay çizgi",
        defaultProps: {
            color: "#e5e7eb",
            thickness: 1,
            style: "solid",
            marginTop: 16,
            marginBottom: 16,
        },
    },
    {
        type: "spacer",
        label: "Boşluk",
        icon: "↕",
        category: "basic",
        description: "Dikey boşluk",
        defaultProps: {
            height: 40,
        },
    },

    // ─── MEDIA ──────────────────────────────────────────────────────────────
    {
        type: "image",
        label: "Görsel",
        icon: "🖼",
        category: "media",
        description: "Görsel veya medya",
        defaultProps: {
            alt: "",
            objectFit: "cover",
            borderRadius: "0px",
            aspectRatio: "16/9",
        },
    },
    {
        type: "video",
        label: "Video",
        icon: "▶",
        category: "media",
        description: "YouTube / Vimeo embed veya doğrudan video",
        defaultProps: {
            url: "",
            autoplay: false,
            muted: false,
            loop: false,
            controls: true,
            aspectRatio: "16/9",
        },
    },

    // ─── ADVANCED ───────────────────────────────────────────────────────────
    {
        type: "hero",
        label: "Hero",
        icon: "★",
        category: "advanced",
        description: "Büyük banner / hero bölümü",
        defaultProps: {
            heading: "Güçlü bir başlık",
            subheading: "Etkileyici bir alt başlık metni buraya gelecek.",
            buttonLabel: "Başla",
            buttonHref: "#",
            backgroundColor: "#1e1b4b",
            textColor: "#ffffff",
            align: "center",
            height: "500px",
            overlayOpacity: 0.5,
        },
    },
    {
        type: "card",
        label: "Kart",
        icon: "▭",
        category: "advanced",
        description: "İçerik kartı",
        defaultProps: {
            title: "Kart Başlığı",
            description: "Kart açıklaması buraya gelir.",
            backgroundColor: "#ffffff",
            borderRadius: "0.75rem",
            shadow: true,
        },
    },
    {
        type: "html",
        label: "HTML",
        icon: "<>",
        category: "advanced",
        description: "Özel HTML kodu",
        defaultProps: {
            html: "<!-- HTML kodunuzu buraya yazın -->",
        },
    },
    {
        type: "tabs",
        label: "Sekmeler",
        icon: "▤",
        category: "advanced",
        description: "Sekmeli içerik",
        defaultProps: {
            tabs: [
                { label: "Sekme 1", content: "İlk sekme içeriği." },
                { label: "Sekme 2", content: "İkinci sekme içeriği." },
            ],
            defaultTabIndex: 0,
        },
    },
    {
        type: "accordion",
        label: "Akordeon",
        icon: "▾",
        category: "advanced",
        description: "Açılır/kapanır öğeler",
        defaultProps: {
            items: [
                { title: "Başlık 1", content: "İçerik 1.", open: true },
                { title: "Başlık 2", content: "İçerik 2." },
            ],
        },
    },
    {
        type: "icon-box",
        label: "İkon Kutusu",
        icon: "◇",
        category: "advanced",
        description: "İkon + başlık + metin",
        defaultProps: {
            icon: "★",
            title: "Başlık",
            text: "Kısa açıklama metni.",
            align: "left",
            iconColor: "#2563eb",
            titleColor: "#111827",
            textColor: "#4b5563",
        },
    },
    {
        type: "list",
        label: "Liste",
        icon: "☰",
        category: "basic",
        description: "Sıralı veya sırasız liste",
        defaultProps: {
            items: ["Birinci madde", "İkinci madde", "Üçüncü madde"],
            ordered: false,
            color: "#374151",
            fontSize: "1rem",
        },
    },
    {
        type: "quote",
        label: "Alıntı",
        icon: "❝",
        category: "basic",
        description: "Alıntı / blockquote",
        defaultProps: {
            text: "Harika bir alıntı buraya gelecek.",
            author: "Yazar Adı",
            borderColor: "#3b82f6",
            textColor: "#374151",
            fontSize: "1.1rem",
        },
    },
    {
        type: "social-links",
        label: "Sosyal Medya",
        icon: "🔗",
        category: "advanced",
        description: "Sosyal medya linkleri",
        defaultProps: {
            links: [
                { platform: "facebook", url: "#" },
                { platform: "twitter", url: "#" },
                { platform: "instagram", url: "#" },
            ],
            size: "md",
            align: "center",
            color: "#6b7280",
        },
    },
    {
        type: "alert",
        label: "Uyarı Kutusu",
        icon: "⚠",
        category: "advanced",
        description: "Bilgi, başarı, uyarı veya hata kutusu",
        defaultProps: {
            text: "Bu bir bilgi mesajıdır.",
            variant: "info",
            title: "Bilgi",
        },
    },
    {
        type: "testimonial",
        label: "Referans",
        icon: "💬",
        category: "advanced",
        description: "Müşteri referansı / yorum kartı",
        defaultProps: {
            quote: "Bu ürün gerçekten harika! Herkese tavsiye ederim.",
            name: "Ahmet Yılmaz",
            title: "CEO, Şirket",
            rating: 5,
        },
    },
    {
        type: "counter",
        label: "Sayaç",
        icon: "🔢",
        category: "advanced",
        description: "İstatistik sayacı",
        defaultProps: {
            value: "150",
            label: "Mutlu Müşteri",
            prefix: "",
            suffix: "+",
            color: "#2563eb",
        },
    },
    {
        type: "gallery",
        label: "Galeri",
        icon: "🏞",
        category: "media",
        description: "Çoklu görsel galeri",
        defaultProps: {
            images: [],
            columns: 3,
            gap: 8,
            borderRadius: "0.5rem",
        },
    },
    {
        type: "map",
        label: "Harita",
        icon: "📍",
        category: "media",
        description: "Google Maps veya embed harita",
        defaultProps: {
            embedUrl: "",
            height: "400px",
            borderRadius: "0.75rem",
        },
    },
    {
        type: "form",
        label: "Form",
        icon: "📝",
        category: "advanced",
        description: "İletişim / bilgi toplama formu",
        defaultProps: {
            fields: [
                { label: "Ad Soyad", type: "text", required: true },
                { label: "E-posta", type: "email", required: true },
                { label: "Mesaj", type: "textarea", required: false },
            ],
            submitLabel: "Gönder",
            backgroundColor: "#ffffff",
            buttonColor: "#2563eb",
        },
    },
    {
        type: "progress-bar",
        label: "İlerleme Çubuğu",
        icon: "▓",
        category: "advanced",
        description: "Yüzdelik ilerleme çubuğu",
        defaultProps: {
            label: "İlerleme",
            value: 75,
            maxValue: 100,
            color: "#2563eb",
            showLabel: true,
        },
    },
    {
        type: "navigation-menu",
        label: "Navigasyon Menü",
        icon: "☰",
        category: "layout",
        description: "Yatay veya dikey navigasyon menüsü",
        defaultProps: {
            menuId: "",
            layout: "horizontal",
            align: "left",
            textColor: "#374151",
            hoverColor: "#2563eb",
            fontSize: "1rem",
            gap: 24,
        },
    },
    {
        type: "breadcrumb",
        label: "Breadcrumb",
        icon: "›",
        category: "layout",
        description: "Sayfa yolu gösterimi",
        defaultProps: {
            separator: "/",
            textColor: "#6b7280",
            linkColor: "#2563eb",
            fontSize: "0.875rem",
        },
    },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getDefaultProps(type: BlockType): BlockProps {
    const def = BLOCK_DEFINITIONS.find((d) => d.type === type);
    if (!def) throw new Error(`Unknown block type: ${type}`);
    return JSON.parse(JSON.stringify(def.defaultProps));
}

export function getBlockDefinition(type: BlockType): BlockDefinition {
    const def = BLOCK_DEFINITIONS.find((d) => d.type === type);
    if (!def) throw new Error(`Unknown block type: ${type}`);
    return def;
}

export const BLOCK_CATEGORIES = [
    { key: "layout", label: "Düzen" },
    { key: "basic", label: "Temel" },
    { key: "media", label: "Medya" },
    { key: "advanced", label: "Gelişmiş" },
] as const;
