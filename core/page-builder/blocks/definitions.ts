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
