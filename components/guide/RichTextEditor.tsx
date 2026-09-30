"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, Bold, ImagePlus, Italic, Link2, List, ListOrdered,
  Maximize2, Minimize2, Quote, Redo2, Table2, Trash2, Underline, Undo2,
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
  { label: "Gras", command: "bold", icon: Bold },
  { label: "Italique", command: "italic", icon: Italic },
  { label: "Souligné", command: "underline", icon: Underline },
  { label: "Liste à puces", command: "insertUnorderedList", icon: List },
  { label: "Liste numérotée", command: "insertOrderedList", icon: ListOrdered },
  { label: "Citation", command: "formatBlock", value: "blockquote", icon: Quote },
];

/** Paragraph styles offered in the toolbar menu. */
const blockStyles = [
  { tag: "p", label: "Texte normal" },
  { tag: "h2", label: "Titre" },
  { tag: "h3", label: "Sous-titre" },
] as const;

export function RichTextEditor({ value, onChange, onUploadImage, disabled = false, contentClassName = "", placeholder = "Rédige le contenu de la ressource..." }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // Table cell holding the caret, to show the table tools.
  const [cell, setCell] = useState<HTMLTableCellElement | null>(null);
  // Paragraph style at the caret, shown in the style menu.
  const [block, setBlock] = useState<string>("p");
  const [fullscreen, setFullscreen] = useState(false);
  // Last selection inside the text: menus and the colour picker take the focus, so it is restored before each command.
  const savedRange = useRef<Range | null>(null);

  useEffect(() => {
    if (!fullscreen) return;
    const exit = (event: KeyboardEvent) => { if (event.key === "Escape") setFullscreen(false); };
    document.addEventListener("keydown", exit);
    return () => document.removeEventListener("keydown", exit);
  }, [fullscreen]);

  useEffect(() => {
    const track = () => {
      const node = document.getSelection()?.anchorNode;
      const element = node instanceof Element ? node : node?.parentElement;
      if (!element || !editorRef.current?.contains(element)) { setCell(null); return; }
      const selection = document.getSelection();
      if (selection?.rangeCount) savedRange.current = selection.getRangeAt(0).cloneRange();
      const current = element.closest("td, th") as HTMLTableCellElement | null;
      setCell(current && editorRef.current.contains(current) ? current : null);
      const heading = element.closest("h1, h2, h3");
      setBlock(heading && editorRef.current.contains(heading) ? heading.tagName.toLowerCase().replace("h1", "h2") : "p");
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
    if (savedRange.current && editorRef.current?.contains(savedRange.current.startContainer)) {
      const selection = document.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRange.current);
    }
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

  const button = "grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-600 hover:bg-white hover:text-[#792bb9] disabled:cursor-not-allowed disabled:opacity-40";

  return <div className={fullscreen
    ? "fixed inset-0 z-[300] flex flex-col bg-white"
    : "rounded-xl border border-slate-300 bg-white focus-within:border-[#792bb9] focus-within:ring-1 focus-within:ring-[#792bb9]"}>
    {/* Toolbars stay visible while scrolling through a long text. */}
    <div className={fullscreen ? "shrink-0 border-b border-slate-200 shadow-sm" : "sticky top-0 z-10 rounded-t-xl"}>
    <div className={`flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5 ${fullscreen ? "justify-center" : "rounded-t-xl"}`}>
      <select value={block} disabled={disabled} onChange={(event) => { run("formatBlock", event.target.value); setBlock(event.target.value); }} aria-label="Style du paragraphe" title="Style du paragraphe"
        className="h-8 cursor-pointer rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 disabled:opacity-40">
        {blockStyles.map((style) => <option key={style.tag} value={style.tag}>{style.label}</option>)}
      </select>
      <span className="mx-1 h-5 w-px bg-slate-300" />
      {tools.map((tool) => {
        const Icon = tool.icon;
        return <button key={tool.label} type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => run(tool.command, tool.value)} title={tool.label} aria-label={tool.label} className={button}><Icon size={16} /></button>;
      })}
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <label title="Couleur du texte" className="grid h-8 w-8 cursor-pointer place-items-center rounded hover:bg-white">
        <span className="h-4 w-4 rounded-full border border-slate-300 bg-[#792bb9]" />
        <input type="color" disabled={disabled} className="sr-only" onChange={(event) => run("foreColor", event.target.value)} />
      </label>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={addLink} title="Ajouter un lien" aria-label="Ajouter un lien" className={button}><Link2 size={16} /></button>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={addTable} title="Ajouter un tableau" aria-label="Ajouter un tableau" className={button}><Table2 size={16} /></button>
      <button type="button" disabled={disabled || uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => imageInputRef.current?.click()} title="Ajouter une image" aria-label="Ajouter une image" className={button}><ImagePlus size={16} /></button>
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void uploadImage(event.target.files?.[0])} />
      <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setFullscreen((value) => !value); editorRef.current?.focus(); }} title={fullscreen ? "Quitter le plein écran (Échap)" : "Plein écran"} aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"} aria-pressed={fullscreen}
        className={`ml-auto inline-flex h-8 cursor-pointer items-center gap-1.5 rounded px-2 text-xs font-semibold ${fullscreen ? "bg-[#792bb9] text-white" : "text-slate-600 hover:bg-white hover:text-[#792bb9]"}`}>{fullscreen ? <><Minimize2 size={15} />Réduire</> : <><Maximize2 size={15} />Plein écran</>}</button>
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
    </div>
    <div className={fullscreen ? "flex-1 overflow-y-auto bg-slate-50 py-8" : ""}>
    <div
      ref={editorRef}
      contentEditable={!disabled}
      suppressContentEditableWarning
      onInput={(event) => onChange(event.currentTarget.innerHTML)}
      onKeyDown={onKeyDown}
      data-placeholder={placeholder}
      className={`guide-rich-content px-5 py-4 text-sm leading-7 text-slate-800 outline-none ${fullscreen ? "mx-auto min-h-full max-w-4xl rounded-xl bg-white px-10 py-8 shadow-sm" : "min-h-80"} ${contentClassName}`}
    />
    </div>
  </div>;
}
