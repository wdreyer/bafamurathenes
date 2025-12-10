import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className = "", ...props }: LabelProps) {
  return (
    <label
      className={["block text-sm font-medium text-slate-700 mb-1", className].join(" ")}
      {...props}
    />
  );
}
