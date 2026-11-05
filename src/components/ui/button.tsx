import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";

const styles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm",
  secondary:
    "bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--border)] border border-[var(--border)]",
  ghost: "bg-transparent text-[var(--ink-muted)] hover:bg-[var(--surface-2)]",
  danger: "bg-[var(--danger)] text-white hover:opacity-90",
  outline:
    "border border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--surface-2)]",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition disabled:opacity-50",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
