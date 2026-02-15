type AdminContentProps = {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
};

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export function AdminContent({
  children,
  maxWidth = "4xl",
  className = "",
}: AdminContentProps) {
  return (
    <div className={`mx-auto p-6 ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );
}