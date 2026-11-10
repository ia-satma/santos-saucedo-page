import { useEffect, useId, useState } from "react";
import { EditorContent, useEditor, useEditorState, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Link2, List, ListOrdered, Quote, Redo2, Underline, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { documentRichTextSchema, isSafeDocumentLink, type DocumentRichText } from "@shared/documentRichText";

const extensions = [StarterKit.configure({
  heading: { levels: [2, 3] },
  code: false,
  codeBlock: false,
  horizontalRule: false,
  strike: false,
  trailingNode: false,
  link: {
    autolink: false,
    openOnClick: false,
    isAllowedUri: (href, context) => context.defaultValidate(href) && isSafeDocumentLink(href),
  },
})];

function normalizeEditorNode(node: JSONContent): JSONContent {
  const result: JSONContent = { type: node.type };
  if (node.type === "hardBreak") return result;
  if (node.text !== undefined) result.text = node.text;
  if (node.content) result.content = node.content.map(normalizeEditorNode);
  if (node.type === "heading") result.attrs = { level: node.attrs?.level };
  if (node.type === "orderedList") result.attrs = { start: node.attrs?.start ?? 1 };
  if (node.marks?.length) {
    result.marks = node.marks.map(mark => mark.type === "link"
      ? { type: mark.type, attrs: { href: mark.attrs?.href } }
      : { type: mark.type });
  }
  return result;
}

export function DocumentRichTextEditor({
  initialContent,
  label = "Contenido del documento",
  disabled,
  onChange,
  error,
}: {
  initialContent: DocumentRichText;
  label?: string;
  disabled: boolean;
  onChange: (value: DocumentRichText | null, error: string) => void;
  error: string;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const linkId = `${id}-link`;
  const [linkValue, setLinkValue] = useState("");
  const [editingLink, setEditingLink] = useState(false);
  const [linkError, setLinkError] = useState("");
  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-label": label,
        "aria-describedby": helpId,
        "aria-multiline": "true",
        class: "min-h-60 max-w-full break-words px-4 py-3 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#145385] [&_p+p]:mt-2 [&_h2]:mb-1 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_blockquote]:my-3 [&_blockquote]:border-s-2 [&_blockquote]:border-[#8CC63F] [&_blockquote]:ps-3 [&_blockquote]:text-muted-foreground [&_a]:text-[#145385] [&_a]:underline",
      },
    },
    onUpdate: ({ editor }) => {
      const result = documentRichTextSchema.safeParse(normalizeEditorNode(editor.getJSON()));
      if (result.success) onChange(result.data, "");
      else onChange(null, result.error.issues[0]?.message ?? "Revisa el formato del contenido.");
    },
  });
  useEffect(() => { editor?.setEditable(!disabled, false); }, [editor, disabled]);

  const state = useEditorState({
    editor,
    selector: ({ editor }) => editor && ({
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      heading2: editor.isActive("heading", { level: 2 }),
      heading3: editor.isActive("heading", { level: 3 }),
      bullets: editor.isActive("bulletList"),
      ordered: editor.isActive("orderedList"),
      quote: editor.isActive("blockquote"),
      link: editor.isActive("link"),
      canLink: !editor.state.selection.empty || editor.isActive("link"),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  });

  function applyLink() {
    if (!editor) return;
    const href = linkValue.trim();
    if (!isSafeDocumentLink(href)) {
      setLinkError("Introduce un enlace que empiece por https://, http:// o mailto:.");
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setEditingLink(false);
    setLinkError("");
  }

  function showLink() {
    if (!editor) return;
    setLinkValue(editor.getAttributes("link").href ?? "");
    setLinkError("");
    setEditingLink(value => !value);
  }

  const controls = editor ? [
    { label: "Subtítulo", text: "T2", active: state?.heading2 ?? false, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Encabezado secundario", text: "T3", active: state?.heading3 ?? false, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Negrita", icon: Bold, active: state?.bold ?? false, run: () => editor.chain().focus().toggleBold().run() },
    { label: "Cursiva", icon: Italic, active: state?.italic ?? false, run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Subrayado", icon: Underline, active: state?.underline ?? false, run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Lista con viñetas", icon: List, active: state?.bullets ?? false, run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Lista numerada", icon: ListOrdered, active: state?.ordered ?? false, run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Cita", icon: Quote, active: state?.quote ?? false, run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Añadir o editar enlace", icon: Link2, active: Boolean(state?.link || editingLink), unavailable: !state?.canLink && !editingLink, run: showLink },
    { label: "Deshacer", icon: Undo2, unavailable: !state?.canUndo, run: () => editor.chain().focus().undo().run() },
    { label: "Rehacer", icon: Redo2, unavailable: !state?.canRedo, run: () => editor.chain().focus().redo().run() },
  ] : [];

  return <div className="space-y-2">
    <p className="text-sm font-medium">Contenido</p>
    <p id={helpId} className="text-xs text-muted-foreground">
      Escribe o pega el texto con formato. Selecciona texto para añadir un enlace.
    </p>
    <div className="rounded-md border bg-background">
      <div className="flex flex-wrap gap-0.5 border-b bg-muted/40 p-1.5" role="group" aria-label="Formato del documento">
        {controls.map(({ label, text, icon: Icon, active, unavailable, run }) => (
          <Button type="button" key={label} variant="ghost" size="sm" disabled={disabled || unavailable}
            className={`min-h-9 min-w-9 px-2 text-[#0B2850] ${active ? "bg-[#0B2850]/10" : ""}`}
            title={label} aria-label={label} aria-pressed={active} onMouseDown={event => event.preventDefault()} onClick={run}>
            {Icon ? <Icon aria-hidden="true" /> : <span aria-hidden="true" className="font-semibold">{text}</span>}
          </Button>
        ))}
      </div>
      {editingLink && <div className="space-y-2 border-b bg-muted/20 p-3">
        <Label htmlFor={linkId}>Dirección del enlace</Label>
        <Input id={linkId} type="text" inputMode="url" placeholder="https://ejemplo.mx" autoFocus disabled={disabled}
          value={linkValue} onChange={event => { setLinkValue(event.target.value); setLinkError(""); }}
          onKeyDown={event => {
            if (event.key === "Enter") { event.preventDefault(); applyLink(); }
            if (event.key === "Escape") { setEditingLink(false); editor?.commands.focus(); }
          }} />
        {linkError && <p role="alert" className="text-xs text-destructive">{linkError}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={applyLink}>Aplicar enlace</Button>
          {state?.link && <Button type="button" size="sm" variant="ghost" disabled={disabled} onClick={() => {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
            setEditingLink(false);
          }}>Quitar enlace</Button>}
          <Button type="button" size="sm" variant="ghost" onClick={() => { setEditingLink(false); editor?.commands.focus(); }}>Cancelar</Button>
        </div>
      </div>}
      {editor ? <EditorContent editor={editor} /> : <p role="status" className="min-h-60 p-4 text-sm text-muted-foreground">Cargando editor…</p>}
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
