/**
 * Page Builder — global tema / stil placeholder.
 * İleride site ayarları veya tema dosyasından okuyacak.
 * Bloklarda "Renk: Primary" gibi referanslar için kullanılabilir.
 */

export interface GlobalColorToken {
    id: string;
    label: string;
    value: string; // hex veya CSS değer
}

export interface GlobalFontToken {
    id: string;
    label: string;
    value: string; // font-family değeri
}

/**
 * Global renk paleti (placeholder).
 * Gerçek entegrasyonda Settings veya tema config'den okunacak.
 */
export function getGlobalColors(): GlobalColorToken[] {
    return [
        { id: "primary", label: "Primary", value: "#2563eb" },
        { id: "secondary", label: "Secondary", value: "#64748b" },
        { id: "accent", label: "Accent", value: "#7c3aed" },
        { id: "text", label: "Metin", value: "#111827" },
        { id: "muted", label: "Soluk metin", value: "#6b7280" },
    ];
}

/**
 * Global font listesi (placeholder).
 * Gerçek entegrasyonda site ayarlarından okunacak.
 */
export function getGlobalFonts(): GlobalFontToken[] {
    return [
        { id: "inherit", label: "Sistem fontu", value: "inherit" },
        { id: "inter", label: "Inter", value: "Inter, sans-serif" },
        { id: "roboto", label: "Roboto", value: "Roboto, sans-serif" },
        { id: "outfit", label: "Outfit", value: "Outfit, sans-serif" },
        { id: "playfair", label: "Playfair Display", value: "Playfair Display, serif" },
    ];
}
