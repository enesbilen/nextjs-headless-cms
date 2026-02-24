/**
 * Hazır bölüm şablonları. Her şablon root’a eklenecek BlockInstance[] döner.
 * Eklendiğinde ID’ler store tarafından yeniden atanır.
 */

import type { BlockInstance } from "../types";

// Placeholder ID’ler — insertBlocksAtRoot çağrısında cloneBlocksWithNewIds ile değiştirilir
const id = (s: string) => s;

// ---------------------------------------------------------------------------
// 1. Hero — Tek hero bloğu
// ---------------------------------------------------------------------------
export const TEMPLATE_HERO: BlockInstance[] = [
    {
        id: id("tpl-hero-1"),
        type: "hero",
        props: {
            heading: "Hoş Geldiniz",
            subheading: "Sitenize güçlü bir giriş yapın. Bu alanı kendi metninizle düzenleyebilirsiniz.",
            buttonLabel: "Başlayın",
            buttonHref: "#",
            backgroundColor: "#1e3a5f",
            textColor: "#ffffff",
            align: "center",
            height: "420px",
            overlayOpacity: 0.4,
        },
    },
];

// ---------------------------------------------------------------------------
// 2. Özellikler 3 sütun — Section > columns-3, her sütunda başlık + metin
// ---------------------------------------------------------------------------
export const TEMPLATE_FEATURES_3COL: BlockInstance[] = [
    {
        id: id("tpl-feat-sec"),
        type: "section",
        props: {
            backgroundColor: "#ffffff",
            paddingTop: 48,
            paddingBottom: 48,
            paddingLeft: 24,
            paddingRight: 24,
            maxWidth: "1200px",
            gap: 24,
        },
        children: [
            [
                {
                    id: id("tpl-feat-col"),
                    type: "columns-3",
                    props: {
                        columns: 3,
                        gap: 32,
                        verticalAlign: "start",
                        columnWidths: ["1fr", "1fr", "1fr"],
                        backgroundColor: "transparent",
                        paddingTop: 0,
                        paddingBottom: 0,
                    },
                    children: [
                        [
                            {
                                id: id("tpl-f1-h"),
                                type: "heading",
                                props: {
                                    text: "Özellik 1",
                                    level: 3,
                                    align: "center",
                                    color: "#111827",
                                    fontWeight: "bold",
                                },
                            },
                            {
                                id: id("tpl-f1-t"),
                                type: "text",
                                props: {
                                    text: "Bu alana kısa bir açıklama yazın. Özelliklerinizi veya hizmetlerinizi özetleyin.",
                                    align: "center",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                },
                            },
                        ],
                        [
                            {
                                id: id("tpl-f2-h"),
                                type: "heading",
                                props: {
                                    text: "Özellik 2",
                                    level: 3,
                                    align: "center",
                                    color: "#111827",
                                    fontWeight: "bold",
                                },
                            },
                            {
                                id: id("tpl-f2-t"),
                                type: "text",
                                props: {
                                    text: "İkinci özelliğinizi burada tanıtın. Metni düzenleyerek kendi içeriğinizi ekleyin.",
                                    align: "center",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                },
                            },
                        ],
                        [
                            {
                                id: id("tpl-f3-h"),
                                type: "heading",
                                props: {
                                    text: "Özellik 3",
                                    level: 3,
                                    align: "center",
                                    color: "#111827",
                                    fontWeight: "bold",
                                },
                            },
                            {
                                id: id("tpl-f3-t"),
                                type: "text",
                                props: {
                                    text: "Üçüncü özellik veya çağrı eylemi. Kullanıcıyı bir adım atmaya davet edin.",
                                    align: "center",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                },
                            },
                        ],
                    ],
                },
            ],
        ],
    },
];

// ---------------------------------------------------------------------------
// 3. CTA — Section içinde başlık + metin + buton (ortalanmış)
// ---------------------------------------------------------------------------
export const TEMPLATE_CTA: BlockInstance[] = [
    {
        id: id("tpl-cta-sec"),
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
                    id: id("tpl-cta-h"),
                    type: "heading",
                    props: {
                        text: "Harekete geçin",
                        level: 2,
                        align: "center",
                        color: "#1e40af",
                        fontWeight: "bold",
                    },
                },
                {
                    id: id("tpl-cta-t"),
                    type: "text",
                    props: {
                        text: "Bu alanı kendi mesajınızla değiştirin. Ziyaretçilerinize net bir çağrı sunun.",
                        align: "center",
                        color: "#374151",
                        fontSize: "1.05rem",
                    },
                },
                {
                    id: id("tpl-cta-btn"),
                    type: "button",
                    props: {
                        label: "İletişime geçin",
                        href: "#",
                        variant: "primary",
                        size: "lg",
                        align: "center",
                        openInNewTab: false,
                        backgroundColor: "#2563eb",
                        textColor: "#ffffff",
                        borderRadius: "0.5rem",
                    },
                },
            ],
        ],
    },
];

// ---------------------------------------------------------------------------
// 4. İki sütun metin — Section > columns-2, her sütunda başlık + metin
// ---------------------------------------------------------------------------
export const TEMPLATE_TWO_COL_TEXT: BlockInstance[] = [
    {
        id: id("tpl-2col-sec"),
        type: "section",
        props: {
            backgroundColor: "#f9fafb",
            paddingTop: 40,
            paddingBottom: 40,
            paddingLeft: 24,
            paddingRight: 24,
            maxWidth: "1200px",
            gap: 32,
        },
        children: [
            [
                {
                    id: id("tpl-2col-cols"),
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
                            {
                                id: id("tpl-2c1-h"),
                                type: "heading",
                                props: {
                                    text: "Sol sütun başlığı",
                                    level: 2,
                                    align: "left",
                                    color: "#111827",
                                    fontWeight: "bold",
                                },
                            },
                            {
                                id: id("tpl-2c1-t"),
                                type: "text",
                                props: {
                                    text: "Sol sütun için açıklama veya hikaye metni. İçeriğinizi buraya yazın.",
                                    align: "left",
                                    color: "#4b5563",
                                    fontSize: "1rem",
                                },
                            },
                        ],
                        [
                            {
                                id: id("tpl-2c2-h"),
                                type: "heading",
                                props: {
                                    text: "Sağ sütun başlığı",
                                    level: 2,
                                    align: "left",
                                    color: "#111827",
                                    fontWeight: "bold",
                                },
                            },
                            {
                                id: id("tpl-2c2-t"),
                                type: "text",
                                props: {
                                    text: "Sağ sütun metni. İkinci konu veya detayları burada paylaşın.",
                                    align: "left",
                                    color: "#4b5563",
                                    fontSize: "1rem",
                                },
                            },
                        ],
                    ],
                },
            ],
        ],
    },
];

// ---------------------------------------------------------------------------
// 5. Ayraç + Alt bilgi — Divider, metin (copyright), spacer
// ---------------------------------------------------------------------------
export const TEMPLATE_FOOTER_LIKE: BlockInstance[] = [
    {
        id: id("tpl-ft-sec"),
        type: "section",
        props: {
            backgroundColor: "#f3f4f6",
            paddingTop: 32,
            paddingBottom: 32,
            paddingLeft: 24,
            paddingRight: 24,
            maxWidth: "1200px",
            gap: 16,
        },
        children: [
            [
                {
                    id: id("tpl-ft-div"),
                    type: "divider",
                    props: {
                        color: "#d1d5db",
                        thickness: 1,
                        style: "solid",
                        marginTop: 0,
                        marginBottom: 16,
                    },
                },
                {
                    id: id("tpl-ft-t"),
                    type: "text",
                    props: {
                        text: "© 2025 Şirket Adı. Tüm hakları saklıdır.",
                        align: "center",
                        color: "#6b7280",
                        fontSize: "0.875rem",
                    },
                },
            ],
        ],
    },
];

// ---------------------------------------------------------------------------
// Tüm şablonlar (UI listesi için)
// ---------------------------------------------------------------------------

export interface SectionTemplateMeta {
    id: string;
    label: string;
    description: string;
    icon: string;
    blocks: BlockInstance[];
}

export const SECTION_TEMPLATES: SectionTemplateMeta[] = [
    { id: "hero", label: "Hero", description: "Büyük giriş alanı", icon: "★", blocks: TEMPLATE_HERO },
    { id: "features-3col", label: "Özellikler 3 sütun", description: "Üç sütunlu özellik bölümü", icon: "⊟", blocks: TEMPLATE_FEATURES_3COL },
    { id: "cta", label: "CTA", description: "Çağrı bölümü (başlık + buton)", icon: "⬡", blocks: TEMPLATE_CTA },
    { id: "two-col-text", label: "İki sütun metin", description: "Yan yana iki metin sütunu", icon: "⊞", blocks: TEMPLATE_TWO_COL_TEXT },
    { id: "footer-like", label: "Alt bilgi", description: "Ayraç ve alt bilgi metni", icon: "─", blocks: TEMPLATE_FOOTER_LIKE },
];
