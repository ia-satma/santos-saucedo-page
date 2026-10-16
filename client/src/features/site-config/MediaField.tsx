import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApiRequest, getAuthHeaders } from '@/lib/adminAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { MediaItem } from '@shared/schema';

export function MediaField({ value, onChange, video = false, id }: { value: string; onChange: (value: string) => void; video?: boolean; id?: string }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const media = useQuery<MediaItem[]>({
    queryKey: ['/api/admin/media'], enabled: open,
    queryFn: async () => { const res = await adminApiRequest('GET', '/api/admin/media'); if (!res.ok) throw new Error('No se pudo cargar la biblioteca.'); return res.json(); },
  });
  const upload = async (file: File) => {
    setError('');
    if (file.size > 50 * 1024 * 1024) { setError('El archivo supera 50 MB.'); return; }
    setUploading(true);
    try {
      const body = new FormData(); body.append('file', file);
      const res = await fetch('/api/admin/media/upload', { method: 'POST', headers: getAuthHeaders(), body });
      const saved = await res.json();
      if (!res.ok) throw new Error(saved.error || 'No se pudo subir el archivo.');
      onChange(saved.path); void media.refetch();
    } catch (error) { setError((error as Error).message); }
    finally { setUploading(false); if (input.current) input.current.value = ''; }
  };
  return <div className="space-y-3">
    <Input id={id} value={value} onChange={e => onChange(e.target.value)} placeholder="Elija un archivo o escriba una URL HTTPS" />
    {value && !video && <img src={value} alt="Vista previa del archivo seleccionado" className="max-h-36 max-w-full object-contain bg-muted p-2" loading="lazy" />}
    {value && video && <video src={value} controls preload="none" className="max-h-40 max-w-full" />}
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(!open)}>{open ? 'Cerrar biblioteca' : 'Elegir de Galería'}</Button>
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => input.current?.click()}>{uploading ? 'Subiendo…' : 'Subir archivo'}</Button>
      <input ref={input} type="file" hidden accept={video ? 'video/mp4,video/webm' : 'image/png,image/jpeg,image/webp,image/gif'} onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
    </div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {open && <div className="border p-3">
      {media.isLoading && <p role="status">Cargando biblioteca…</p>}
      {media.isError && <p role="alert">{media.error.message}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.data?.filter(m => video ? m.mimeType?.startsWith('video/') : m.mimeType?.startsWith('image/')).map(m => <button type="button" key={m.id} className="min-w-0 border p-2 text-left hover:border-primary focus-visible:outline focus-visible:outline-2" onClick={() => { onChange(m.path); setOpen(false); }}>
          {!video && <img src={m.path} alt={m.altEs || m.originalName} className="h-20 w-full object-contain" loading="lazy" />}
          <span className="block truncate text-xs mt-2">{m.originalName}</span>
        </button>)}
      </div>
      {media.data?.length === 0 && <p className="text-sm text-muted-foreground">La biblioteca está vacía. Suba su primer archivo.</p>}
    </div>}
  </div>;
}
