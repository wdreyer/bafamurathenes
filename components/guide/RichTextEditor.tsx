"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered,
  Quote, Redo2, Table2, Underline, Undo2,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  disabled?: boolean;
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

export function RichTextEditor({ value, onChange, onUploadImage, disabled = false }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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

  return <div className="overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-emerald-700 focus-within:ring-1 focus-within:ring-emerald-700">
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return <button key={tool.label} type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => run(tool.command, tool.value)} title={tool.label} aria-label={tool.label} className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-600 hover:bg-white hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"><Icon size={16} /></button>;
      })}
      <span className="mx-1 h-5 w-px bg-slate-300" />
      <label title="Couleur du texte" className="grid h-8 w-8 cursor-pointer place-items-center rounded hover:bg-white">
        <span className="h-4 w-4 rounded-full border border-slate-300 bg-emerald-700" />
        <input type="color" disabled={disabled} className="sr-only" onChange={(event) => run("foreColor", event.target.value)} />
      </label>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={addLink} title="Ajouter un lien" aria-label="Ajouter un lien" className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-600 hover:bg-white hover:text-emerald-800 disabled:opacity-40"><Link2 size={16} /></button>
      <button type="button" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={addTable} title="Ajouter un tableau" aria-label="Ajouter un tableau" className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-600 hover:bg-white hover:text-emerald-800 disabled:opacity-40"><Table2 size={16} /></button>
      <button type="button" disabled={disabled || uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => imageInputRef.current?.click()} title="Ajouter une image" aria-label="Ajouter une image" className="grid h-8 w-8 cursor-pointer place-items-center rounded text-slate-600 hover:bg-white hover:text-emerald-800 disabled:opacity-40"><ImagePlus size={16} /></button>
      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void uploadImage(event.target.files?.[0])} />
    </div>
    <div
      ref={editorRef}
      contentEditable={!disabled}
      suppressContentEditableWarning
      onInput={(event) => onChange(event.currentTarget.innerHTML)}
      data-placeholder="Rédige le contenu de la ressource..."
      className="guide-rich-content min-h-80 px-5 py-4 text-sm leading-7 text-slate-800 outline-none"
    />
  </div>;
}
