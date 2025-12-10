import * as React from "react";

export function Table({ className = "", ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={["w-full border-collapse text-sm", className].join(" ")}
      {...props}
    />
  );
}

export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TR(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}

export function TH({ className = "", ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={[
        "border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function TD({ className = "", ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={["border-b border-slate-100 px-3 py-2 align-top", className].join(" ")}
      {...props}
    />
  );
}
