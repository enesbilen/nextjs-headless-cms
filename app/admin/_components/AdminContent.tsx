type AdminContentProps = {
  children: React.ReactNode;
  /** Artık tam genişlik kullanılıyor; geriye dönük uyumluluk için prop bırakıldı, kullanılmıyor. */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
};

export function AdminContent({
  children,
  className = "",
}: AdminContentProps) {
  return (
    <div
      className={`w-full px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-12 ${className}`}
    >
      {children}
    </div>
  );
}