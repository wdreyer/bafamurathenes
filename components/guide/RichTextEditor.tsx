"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered,
  Quote, Redo2, Table2, Trash2, Underline, Undo2,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  disabled?: boolean;
  /** Extra classes for the editable area, e.g. "time-sheet" to edit with the sheet look. */
  contentClassName?: string;
  placeholder?: string;
};

type Tool = {
  label: string;
  command: string;
  value?: string;
  icon: React.ComponentType<{ size?: number }>;
};

const tools: Tool[] = [
  { label: "Annuler", command: "undo", icon: Undo2 },
  { label: "Rétablir", command: "redo", icon: Redo2 },
  { label: "Titre 2", command: "formatBlock", value: "h2", icon: Heading2 },
  { label: "Titre 3", command: "formatBlock", value: "h3", icon: Heading3 },
  { label: "Gras", command: "bold", icon: Bold },
  { label: "Italique", command: "italic", icon: Italic },
  { label: "Souligné", command: "underline", icon: Underline },
  { label: "Liste à puces", command: "insertUnorderedList", icon: List },
  { label: "Liste numérotée", command: "insertOrderedList", icon: ListOrdered },
  { label: "Citation", command: "formatBlock", value: "blockquote", icon: Quote },
];

export function RichTextEditor({ value, onChange, onUploadImage, disabled = false, contentClassName = "", placeholder = "Rédige le contenu de la ressource..." }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // Table cell holding the caret, to show the table tools.
  const [cell, setCell] = useState<HTMLTableCellElement | null>(null);

  useEffect(() => {
    const track = () => {
      const node = document.getSelection()?.anchorNode;
      const element = node instanceof Element ? node : node?.parentElement;
      const current = element?.closest("td, th") as HTMLTableCellElement | null;
      setCell(current && editorRef.current?.contains(current) ? current : null);
    };
    document.addEventListener("selectionchange", track);
    return () => document.removeEventListener("selectionchange", track);
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && document.activeElement !== editor && editor.innerHTML !== value) editor.innerHTML = value;
  }, [value]);

  const run = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || "");
  };

  const addLink = () => {
    const href = window.prompt("Adresse du lien");
    if (href) run("createLink", href);
  };

  const addTable = () => {
    editorRef.current?.focus();
    document.execCommand("insertHTML", false,
      "<table><thead><tr><th>Colonne 1</th><th>Colonne 2</th></tr></thead><tbody><tr><td>Contenu</td><td>Contenu</td></tr><tr><td>Contenu</td><td>Contenu</td></tr></tbody></table><p><br></p>");
    onChange(editorRef.current?.innerHTML || "");
  };

  const commit = () => onChange(editorRef.current?.innerHTML || "");

  const blankCell = (tag: "td" | "th") => {
    const created = document.createElement(tag);
    created.innerHTML = "<br>";
    return created;
  };

  const placeCaret = (target: Element) => {
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(true);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  /** Row, column and table edits around the cell holding the caret. */
  const editTable = (action: "rowAbove" | "rowBelow" | "colLeft" | "colRight" | "deleteRow" | "deleteCol" | "deleteTable") => {
    const row = cell?.parentElement as HTMLTableRowElement | null;
    const table = cell?.closest("table");
    if (!cell || !row || !table) return;
    const rows = Array.from(table.rows);
    const column = cell.cellIndex;
    if (action === "rowAbove" || action === "rowBelow") {
      const inHead = row.parentElement?.tagName === "THEAD";
      const created = document.createElement("tr");
      const tag = inHead && action === "rowAbove" ? "th" : "td";
      for (let index = 0; index < row.cells.length; index += 1) created.appendChild(blankCell(tag));
      if (inHead && action === "rowBelow") {
        const body = table.tBodies[0] || table.appendChild(document.createElement("tbody"));
        body.insertBefore(created, body.firstChild);
      } else row.parentElement!.insertBefore(created, action === "rowAbove" ? row : row.nextSibling);
      placeCaret(created.cells[Math.min(column, created.cells.length - 1)]);
    } else if (action === "colLeft" || action === "colRight") {
      rows.forEach((entry) => {
        const reference = entry.cells[Math.min(column, entry.cells.length - 1)];
        const created = blankCell(entry.parentElement?.tagName === "THEAD" ? "th" : "td");
        entry.insertBefore(created, action === "colLeft" ? reference : reference?.nextSibling || null);
      });
    } else if (action === "deleteRow") {
      // Keep the caret in the table (row below, else above) so the tools stay at hand.
      const neighbour = rows[row.rowIndex + 1] || rows[row.rowIndex - 1];
      row.remove();
      if (!table.rows.length) table.remove();
      else if (neighbour) placeCaret(neighbour.cells[Math.min(column, neighbour.cells.length - 1)]);
    } else if (action === "deleteCol") {
      const neighbour = row.cells[column + 1] || row.cells[column - 1];
      rows.forEach((entry) => entry.cells[column]?.remove());
      if (!Array.from(table.rows).some((entry) => entry.cells.length)) table.remove();
      else if (neighbour) placeCaret(neighbour);
    } else table.remove();
    if (!table.isConnected) setCell(null);
    commit();
  };

  // Tab moves through table cells, and adds a row after the last one.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab" || !cell) return;
    event.preventDefault();
    const table = cell.closest("table")!;
    const cells = Array.from(table.querySelectorAll("th, td"));
    const index = cells.indexOf(cell);
    const next = cells[index + (event.shiftKey ? -1 : 1)];
    if (next) { placeCaret(next); return; }
    if (!event.shiftKey) editTable("rowBelow");
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUploadImage(file);
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, `<figure><img src="${url}" alt=""><figcaption>Légende de l’image</figcaption></figure><p><br></p>`);
      onChange(editorRef.current?.innerHTML || "");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const tableTools: { label: string; action: Parameters<typeof editTable>[0]; icon: React.ComponentType<{ size?: number }>; danger?: boolean }[] = [
    { label: "Ligne au-dessus", action: "rowAbove", icon: ArrowUpToLine },
    { label: "Ligne en dessous", action: "rowBelow", icon: ArrowDownToLine },
    { label: "Colonne à gauche", action: "colLeft", icon: ArrowLeftToLine },
    { label: "Colonne à droite", action: "colRight", icon: ArrowRightToLine },
    { label: "Supprimer la ligne", action: "deleteRow", icon: Trash2, danger: true },
    { label: "Supprimer la colonne", action: "deleteCol", icon: Trash2, danger: true },
  ];

  return <div className="overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-[#792bb9] focus-within:ring-1 focus-within:ring-[#792bb9]">
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return <button key={tool.label} type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => run(tool.command, tool.value)} title={tool.label} aria-label={tool.label} className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-600 hover:bg-white hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"><Icon size={16} /></button>;
      })}
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <label title="Couleur du texte" className="grid h-8 w-8 cursor-pointer place-items-center rounded hover:bg-white">
        <span className="h-4 w-4 rounded-full border border-slate-300 bg-[#792bb9]" />
        <input type="color" disabled={disabled} className="sr-only" onChange={(event) => run("foreColor", event.target.value)} />
      </label>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={addLink} title="Ajouter un lien" aria-label="Ajouter un lien" className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-600 hover:bg-white hover:text-emerald-800 disabled:opacity-40"><Link2 size={16} /></button>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={addTable} title="Ajouter un tableau" aria-label="Ajouter un tableau" className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-600 hover:bg-white hover:text-emerald-800 disabled:opacity-40"><Table2 size={16} /></button>
      <button type="button" disabled={disabled || uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => imageInputRef.current?.click()} title="Ajouter une image" aria-label="Ajouter une image" className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-600 hover:bg-white hover:text-emerald-800 disabled:opacity-40"><ImagePlus size={16} /></button>
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void uploadImage(event.target.files?.[0])} />
    </div>
    {cell && !disabled && <div className="flex flex-wrap items-center gap-1 border-b border-[#e6d9f0] bg-[#f8f3fb] px-2 py-1.5 text-xs">
      <span className="mr-1 inline-flex items-center gap-1 font-semibold text-[#552080]"><Table2 size={14} />Tableau</span>
      {tableTools.map((tool) => {
        const Icon = tool.icon;
        return <button key={tool.action} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => editTable(tool.action)}
          className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 font-medium hover:bg-white ${tool.danger ? "text-rose-700" : "text-slate-700"}`}><Icon size={13} />{tool.label}</button>;
      })}
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => editTable("deleteTable")} className="ml-auto inline-flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 font-semibold text-rose-700 hover:bg-white"><Trash2 size={13} />Supprimer le tableau</button>
    </div>}
    <div
      ref={editorRef}
      contentEditable={!disabled}
      suppressContentEditableWarning
      onInput={(event) => onChange(event.currentTarget.innerHTML)}
      onKeyDown={onKeyDown}
      data-placeholder={placeholder}
      className={`guide-rich-content min-h-80 px-5 py-4 text-sm leading-7 text-slate-800 outline-none ${contentClassName}`}
    />
  </div>;
}
