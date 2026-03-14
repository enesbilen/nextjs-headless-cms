"use client";

type Props = {
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
};

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  className,
}: Props) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (confirm(confirmMessage)) {
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <button type="submit" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
