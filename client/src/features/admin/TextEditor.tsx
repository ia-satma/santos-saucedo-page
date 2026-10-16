import { useRef, useState } from "react";
import {
  FontBoldIcon,
  FontItalicIcon,
  ListBulletIcon,
  Link1Icon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { Textarea } from "@/components/ui/textarea";
import { FormattedText } from "@/components/editorial/FormattedText";
export function TextEditor({
  value,
  onChange,
  id,
  placeholder,
  rows = 10,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const wrap = (prefix: string, suffix = "") => {
    const start = ref.current?.selectionStart ?? value.length;
    const end = ref.current?.selectionEnd ?? start;
    const selected = value.slice(start, end);
    onChange(
      value.slice(0, start) + prefix + selected + suffix + value.slice(end),
    );
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(
        start + prefix.length,
        end + prefix.length,
      );
    });
  };
  return (
    <div className="border rounded-md bg-white overflow-hidden">
      <div
        className="flex flex-wrap items-center gap-1 border-b p-2 bg-slate-50"
        role="group"
        aria-label="Formato del texto"
      >
        <button
          type="button"
          disabled={preview}
          className="p-2 hover:bg-slate-200"
          onClick={() => wrap("**", "**")}
          aria-label="Negrita"
        >
          <FontBoldIcon />
        </button>
        <button
          type="button"
          disabled={preview}
          className="p-2 hover:bg-slate-200"
          onClick={() => wrap("_", "_")}
          aria-label="Cursiva"
        >
          <FontItalicIcon />
        </button>
        <button
          type="button"
          disabled={preview}
          className="p-2 hover:bg-slate-200"
          onClick={() => wrap("\n\n- ")}
          aria-label="Añadir lista"
        >
          <ListBulletIcon />
        </button>
        <button
          type="button"
          disabled={preview}
          className="px-2 py-1 text-sm hover:bg-slate-200"
          onClick={() => wrap("\n\n## ")}
          aria-label="Añadir subtítulo"
        >
          H2
        </button>
        <button
          type="button"
          disabled={preview}
          className="p-2 hover:bg-slate-200"
          onClick={() => wrap("[", "](https://)")}
          aria-label="Añadir enlace"
        >
          <Link1Icon />
        </button>
        <button
          type="button"
          className="ml-auto text-xs inline-flex items-center gap-2 px-2 py-1"
          aria-pressed={preview}
          onClick={() => setPreview(!preview)}
        >
          <EyeOpenIcon />
          {preview ? "Editar texto" : "Previsualizar texto"}
        </button>
      </div>
      {preview ? (
        <div className="p-5 text-sm min-h-40">
          <FormattedText text={value || "El texto aparecerá aquí."} />
        </div>
      ) : (
        <Textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="border-0 rounded-none focus-visible:ring-inset"
        />
      )}
      <p className="text-xs text-muted-foreground px-3 pb-3">
        Use una línea en blanco entre párrafos. El formato se guarda con el
        texto.
      </p>
    </div>
  );
}
