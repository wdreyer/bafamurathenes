import * as React from "react";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "outline" | "success" | "danger";
};

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-slate-900 text-white",
    outline: "border border-slate-200 text-slate-700",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      ].join(" ")}
      {...props}
    />
  );
}
