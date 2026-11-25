import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MediaField } from '@/features/site-config/MediaField';
import type { CmsValue } from '@shared/cms';
import { Link } from 'wouter';

type RecordValue = Record<string, any>;

type ExplicitPageFieldsProps = {
  value: CmsValue;
  onChange: (value: CmsValue) => void;
  media?: boolean;
  onlyLamina?: boolean;
};

function asRecord(value: CmsValue): RecordValue {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : {};
}

function updateRecord(record: RecordValue, key: string, next: unknown): RecordValue {
  return { ...record, [key]: next };
}

function Block({ title, description, pageId, blockKey, relatedPage, children }: { title: string; description?: string; pageId?: string; blockKey?: string; relatedPage?: { href: string; label: string }; children: React.ReactNode }) {
  return <section className="cms-explicit-block" aria-labelledby={`cms-block-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
    <div className="cms-explicit-block-heading">
      <div>
        <h3 id={`cms-block-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{title}</h3>
        {description && <p>{description}</p>}
        {relatedPage && <Link className="cms-explicit-block-related" href={relatedPage.href}>{relatedPage.label} ↗</Link>}
      </div>
    </div>
    <div className="cms-explicit-block-fields">{children}</div>
  </section>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <div className="cms-explicit-field">
    <div className="cms-explicit-field-label"><span>{label}</span>{hint && <small>{hint}</small>}</div>
    {children}
  </div>;
}

function TextField({ label, value, onChange, multiline = false, hint }: { label: string; value: unknown; onChange: (value: string) => void; multiline?: boolean; hint?: string }) {
  const text = typeof value === 'string' ? value : String(value ?? '');
  return <Field label={label} hint={hint}>
    {multiline || text.length > 120 ? <Textarea value={text} onChange={(event) => onChange(event.target.value)} rows={Math.min(12, Math.max(3, Math.ceil(text.length / 100)))} /> : <Input value={text} onChange={(event) => onChange(event.target.value)} />}
  </Field>;
}

function StringList({ label, values, onChange, addLabel, itemLabel }: { label: string; values: unknown; onChange: (values: string[]) => void; addLabel: string; itemLabel: string }) {
  const list = Array.isArray(values) ? values.map((value) => String(value ?? '')) : [];
  const setItem = (index: number, next: string) => onChange(list.map((value, itemIndex) => itemIndex === index ? next : value));
  return <Field label={label} hint="El orden se refleja directamente en la página pública.">
    <div className="cms-explicit-list">
      {list.map((value, index) => <div className="cms-explicit-list-row" key={`${itemLabel}-${index}`}>
        <Input aria-label={`${itemLabel} ${index + 1}`} value={value} onChange={(event) => setItem(index, event.target.value)} />
        <div className="cms-explicit-list-actions">
          <Button type="button" size="sm" variant="ghost" disabled={index === 0} onClick={() => { const next = [...list]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next); }}>Subir</Button>
          <Button type="button" size="sm" variant="ghost" disabled={index === list.length - 1} onClick={() => { const next = [...list]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; onChange(next); }}>Bajar</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(list.filter((_, itemIndex) => itemIndex !== index))}>Eliminar</Button>
        </div>
      </div>)}
      <Button type="button" size="sm" variant="outline" onClick={() => onChange([...list, ''])}>{addLabel}</Button>
    </div>
  </Field>;
}

function HomeFields({ value, onChange }: ExplicitPageFieldsProps) {
  const current = asRecord(value);
  const set = (key: string, next: unknown) => onChange(updateRecord(current, key, next) as CmsValue);
  const hero = asRecord(current.hero as CmsValue);
  const firma = asRecord(current.firma as CmsValue);
  const creemos = asRecord(current.creemos as CmsValue);
  const practicas = asRecord(current.practicas as CmsValue);
  const extranjeras = asRecord(current.extranjeras as CmsValue);
  const monitor = asRecord(current.monitor as CmsValue);
  const socios = asRecord(current.socios as CmsValue);
  const intro = asRecord(current.intro as CmsValue);
  const industrias = asRecord(current.industrias as CmsValue);
  const media = asRecord(current.media as CmsValue);
  const setNested = (key: string, record: RecordValue, nestedKey: string, next: unknown) => set(key, updateRecord(record, nestedKey, next));
  const place = Array.isArray(hero.place) ? hero.place : ['', ''];
  const figures = Array.isArray(extranjeras.figures) ? extranjeras.figures : [];
  const items = Array.isArray(practicas.items) ? practicas.items : [];
  return <div className="cms-explicit-page-fields">
    <Block title="Hero" pageId="home" blockKey="hero" description="Todo lo que aparece en la primera pantalla de Inicio. El texto cambia por idioma y los medios se seleccionan desde la Biblioteca.">
      <TextField label="Frase principal" value={hero.tagline} onChange={(next) => setNested('hero', hero, 'tagline', next)} hint="La palabra final debe coincidir con la primera palabra animada para mostrar la rotación." />
      <StringList label="Prácticas que cambian (primer renglón)" values={hero.practiceWords} onChange={(next) => setNested('hero', hero, 'practiceWords', next)} addLabel="Añadir práctica" itemLabel="Práctica" />
      <StringList label="Palabras que cambian (después de «para»)" values={hero.words} onChange={(next) => setNested('hero', hero, 'words', next)} addLabel="Añadir palabra" itemLabel="Palabra" />
      <TextField label="Conector de la frase" value={hero.and} onChange={(next) => setNested('hero', hero, 'and', next)} />
      <TextField label="Frase de apoyo" value={hero.firma} onChange={(next) => setNested('hero', hero, 'firma', next)} multiline />
      <div className="cms-explicit-grid">
        <TextField label="Línea bajo la frase" value={place[0]} onChange={(next) => setNested('hero', hero, 'place', [next, place[1]])} />
        <TextField label="Segunda parte (opcional, tras «·»)" value={place[1]} onChange={(next) => setNested('hero', hero, 'place', [place[0], next])} />
      </div>
      <p className="cms-explicit-shared">El video, el póster, el logo y las etiquetas de pausa se editan en los bloques de medios compartidos de esta página.</p>
    </Block>

    <Block title="Nuestra firma" pageId="home" blockKey="firma" description="Frase, párrafos y pie que aparecen en el bloque de la firma dentro de Inicio.">
      <TextField label="Título" value={firma.title} onChange={(next) => set('firma', updateRecord(firma, 'title', next))} />
      <StringList label="Párrafos" values={firma.body} onChange={(next) => set('firma', updateRecord(firma, 'body', next))} addLabel="Añadir párrafo" itemLabel="Párrafo" />
      <TextField label="Pie de foto" value={firma.caption} onChange={(next) => set('firma', updateRecord(firma, 'caption', next))} multiline />
      <TextField label="Texto alternativo" value={firma.alt} onChange={(next) => set('firma', updateRecord(firma, 'alt', next))} multiline />
    </Block>

    <Block title="Filosofía" pageId="home" blockKey="creemos" description="La cita y todos sus párrafos se muestran en la banda de filosofía. La cita conserva su bloque propio dentro de Portada.">
      <TextField label="Etiqueta" value={creemos.label} onChange={(next) => set('creemos', updateRecord(creemos, 'label', next))} />
      <TextField label="Cita destacada" value={creemos.quote} onChange={(next) => set('creemos', updateRecord(creemos, 'quote', next))} multiline />
      <StringList label="Párrafos" values={creemos.body} onChange={(next) => set('creemos', updateRecord(creemos, 'body', next))} addLabel="Añadir párrafo" itemLabel="Párrafo" />
      <TextField label="Imagen de la filosofía" value={media.filosofia} onChange={(next) => set('media', updateRecord(media, 'filosofia', next))} hint="Puede pegar una ruta del sitio o seleccionar el archivo desde Medios." />
    </Block>

    <Block title="Prácticas" pageId="home" blockKey="practicas" description="Textos que acompañan la lista de prácticas de la portada. Las fichas completas se administran en Prácticas.">
      <TextField label="Título" value={practicas.title} onChange={(next) => set('practicas', updateRecord(practicas, 'title', next))} />
      <TextField label="Introducción" value={practicas.entrada} onChange={(next) => set('practicas', updateRecord(practicas, 'entrada', next))} multiline />
      <TextField label="Texto del enlace" value={practicas.ver} onChange={(next) => set('practicas', updateRecord(practicas, 'ver', next))} />
      <div className="cms-explicit-list">
        {items.map((item, index) => { const entry = asRecord(item as CmsValue); return <div className="cms-explicit-entry" key={String(entry.slug || index)}>
          <h4>Práctica {index + 1}</h4>
          <TextField label="Título" value={entry.title} onChange={(next) => { const nextItems = items.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'title', next) : old); set('practicas', updateRecord(practicas, 'items', nextItems)); }} />
          <TextField label="Descripción" value={entry.body} onChange={(next) => { const nextItems = items.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'body', next) : old); set('practicas', updateRecord(practicas, 'items', nextItems)); }} multiline />
        </div>; })}
      </div>
    </Block>

    <Block title="Empresas extranjeras" pageId="home" blockKey="extranjeras" description="Bloque editorial y cifras que aparecen después de las prácticas.">
      <TextField label="Título" value={extranjeras.title} onChange={(next) => set('extranjeras', updateRecord(extranjeras, 'title', next))} />
      <TextField label="Texto" value={extranjeras.body} onChange={(next) => set('extranjeras', updateRecord(extranjeras, 'body', next))} multiline />
      <TextField label="Texto alternativo" value={extranjeras.alt} onChange={(next) => set('extranjeras', updateRecord(extranjeras, 'alt', next))} multiline />
      <div className="cms-explicit-list">
        {figures.map((figure, index) => { const entry = asRecord(figure as CmsValue); return <div className="cms-explicit-entry" key={index}>
          <h4>Cifra {index + 1}</h4>
          <div className="cms-explicit-grid">
            <TextField label="Valor" value={entry.value} onChange={(next) => { const nextFigures = figures.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'value', next) : old); set('extranjeras', updateRecord(extranjeras, 'figures', nextFigures)); }} />
            <TextField label="Sufijo" value={entry.suffix} onChange={(next) => { const nextFigures = figures.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'suffix', next) : old); set('extranjeras', updateRecord(extranjeras, 'figures', nextFigures)); }} />
          </div>
          <TextField label="Etiqueta" value={entry.label} onChange={(next) => { const nextFigures = figures.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'label', next) : old); set('extranjeras', updateRecord(extranjeras, 'figures', nextFigures)); }} />
        </div>; })}
      </div>
    </Block>

    <Block title="Industrias" pageId="home" blockKey="industrias" description="Textos del bloque de industrias. Las industrias y sus imágenes se editan desde su catálogo.">
      <TextField label="Título" value={industrias.titulo} onChange={(next) => set('industrias', updateRecord(industrias, 'titulo', next))} />
      <TextField label="Texto del enlace" value={industrias.boton} onChange={(next) => set('industrias', updateRecord(industrias, 'boton', next))} />
      <TextField label="Texto de cada enlace" value={industrias.ver} onChange={(next) => set('industrias', updateRecord(industrias, 'ver', next))} />
    </Block>

    <Block title="Socios y equipo" pageId="home" blockKey="socios" description="Título y enlace del bloque. Los nombres, fotos y cargos se administran en Socios y equipo.">
      <TextField label="Título" value={socios.title} onChange={(next) => set('socios', updateRecord(socios, 'title', next))} />
      <TextField label="Texto del enlace" value={socios.boton} onChange={(next) => set('socios', updateRecord(socios, 'boton', next))} />
    </Block>

    <Block title="Monitor Laboral" pageId="home" blockKey="monitor" description="Título e introducción del bloque de publicaciones en Inicio.">
      <TextField label="Título" value={monitor.title} onChange={(next) => set('monitor', updateRecord(monitor, 'title', next))} />
      <TextField label="Introducción" value={monitor.intro} onChange={(next) => set('monitor', updateRecord(monitor, 'intro', next))} multiline />
    </Block>

    <Block title="Cifras de la portada" pageId="home" blockKey="cifras" description="Etiquetas de las cifras que aparecen junto a la firma. Los valores se calculan desde las fuentes indicadas.">
      <TextField label="Etiqueta de años" value={asRecord(intro.cifras as CmsValue).anos} onChange={(next) => set('intro', updateRecord(intro, 'cifras', updateRecord(asRecord(intro.cifras as CmsValue), 'anos', next)))} />
      <TextField label="Etiqueta de ciudades" value={asRecord(intro.cifras as CmsValue).ciudades} onChange={(next) => set('intro', updateRecord(intro, 'cifras', updateRecord(asRecord(intro.cifras as CmsValue), 'ciudades', next)))} />
      <TextField label="Etiqueta de entidades" value={asRecord(intro.cifras as CmsValue).entidades} onChange={(next) => set('intro', updateRecord(intro, 'cifras', updateRecord(asRecord(intro.cifras as CmsValue), 'entidades', next)))} />
      <TextField label="Etiqueta de áreas" value={asRecord(intro.cifras as CmsValue).areas} onChange={(next) => set('intro', updateRecord(intro, 'cifras', updateRecord(asRecord(intro.cifras as CmsValue), 'areas', next)))} />
      <p className="cms-explicit-shared">Los años y ciudades provienen de Nuestra firma. Las entidades y áreas provienen de los catálogos activos.</p>
    </Block>
  </div>;
}

function AboutFields({ value, onChange, onlyLamina = false }: ExplicitPageFieldsProps) {
  const current = asRecord(value);
  const set = (key: string, next: unknown) => onChange(updateRecord(current, key, next) as CmsValue);
  const stats = Array.isArray(current.stats) ? current.stats : [];
  const values = Array.isArray(current.values) ? current.values : [];
  const priority = Array.isArray(current.priority) ? current.priority : [];
  const priorityNotes = Array.isArray(current.priorityNotes) ? current.priorityNotes : [];
  const renderLamina = (key: 'bighorn' | 'response', title: string) => {
    const lamina = asRecord(current[key] as CmsValue);
    const paragraphs = Array.isArray(lamina.p) ? lamina.p : [];
    const pieces = Array.isArray(lamina.piezas) ? lamina.piezas : [];
    const pageId = key === 'bighorn' ? 'about' : 'practices';
    const blockKey = key === 'bighorn' ? 'laminaSiempreAdelante' : 'laminaReaccion';
    return <Block title={title} pageId={pageId} blockKey={blockKey} relatedPage={key === 'response' && !onlyLamina ? { href: '/admin/page/practices', label: 'Configurar visibilidad en Prácticas' } : undefined} description={key === 'bighorn' ? "Aparece en Nuestra firma. Cada texto y etapa conserva su orden." : "Aparece al final de Prácticas. Cada texto y etapa conserva su orden."}>
      <TextField label="Título" value={lamina.h} onChange={(next) => set(key, updateRecord(lamina, 'h', next))} />
      <StringList label="Párrafos" values={paragraphs} onChange={(next) => set(key, updateRecord(lamina, 'p', next))} addLabel="Añadir párrafo" itemLabel="Párrafo" />
      <TextField label="Etiqueta de la lista" value={lamina.listaLabel} onChange={(next) => set(key, updateRecord(lamina, 'listaLabel', next))} />
      <TextField label="Texto alternativo de la lámina" value={lamina.svgLabel} onChange={(next) => set(key, updateRecord(lamina, 'svgLabel', next))} multiline />
      <TextField label="Texto del recuadro" value={lamina.cajetin} onChange={(next) => set(key, updateRecord(lamina, 'cajetin', next))} />
      <TextField label="Instrucciones" value={lamina.instr} onChange={(next) => set(key, updateRecord(lamina, 'instr', next))} multiline />
      <TextField label="Nota" value={lamina.nota} onChange={(next) => set(key, updateRecord(lamina, 'nota', next))} multiline />
      <div className="cms-explicit-list">
        {pieces.map((piece, index) => { const entry = asRecord(piece as CmsValue); return <div className="cms-explicit-entry" key={index}>
          <h4>Etapa {index + 1}</h4>
          <TextField label="Nombre" value={entry.nom} onChange={(next) => { const nextPieces = pieces.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'nom', next) : old); set(key, updateRecord(lamina, 'piezas', nextPieces)); }} />
          <TextField label="Parte" value={entry.parte} onChange={(next) => { const nextPieces = pieces.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'parte', next) : old); set(key, updateRecord(lamina, 'piezas', nextPieces)); }} />
          <TextField label="Etiqueta" value={entry.tag} onChange={(next) => { const nextPieces = pieces.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'tag', next) : old); set(key, updateRecord(lamina, 'piezas', nextPieces)); }} />
          <TextField label="Descripción" value={entry.desc} onChange={(next) => { const nextPieces = pieces.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'desc', next) : old); set(key, updateRecord(lamina, 'piezas', nextPieces)); }} multiline />
        </div>; })}
      </div>
    </Block>;
  };
  if (onlyLamina) return <div className="cms-explicit-page-fields">{renderLamina('response', 'Lámina Capacidad de reacción')}</div>;
  return <div className="cms-explicit-page-fields">
    <Block title="Encabezado" pageId="about" blockKey="hero" description="Contenido que aparece al entrar a Nuestra firma.">
      <TextField label="Título" value={current.title} onChange={(next) => set('title', next)} />
      <TextField label="Subtítulo" value={current.subtitle} onChange={(next) => set('subtitle', next)} />
      <TextField label="Introducción" value={current.heroLead} onChange={(next) => set('heroLead', next)} multiline />
      <TextField label="Segundo párrafo" value={current.heroParagraph} onChange={(next) => set('heroParagraph', next)} multiline />
      <TextField label="Texto alternativo de la imagen principal" value={current.heroImageAlt} onChange={(next) => set('heroImageAlt', next)} multiline />
      <TextField label="Texto alternativo del tríptico" value={current.boardImageAlt} onChange={(next) => set('boardImageAlt', next)} multiline />
      <TextField label="Pie del tríptico" value={current.boardCaption} onChange={(next) => set('boardCaption', next)} />
      <TextField label="Descripción del tríptico" value={current.boardText} onChange={(next) => set('boardText', next)} multiline />
    </Block>

    <Block title="Historia" pageId="about" blockKey="historia" description="Texto institucional de la firma.">
      <TextField label="Primer párrafo" value={current.historyText1} onChange={(next) => set('historyText1', next)} multiline />
      <TextField label="Segundo párrafo" value={current.historyText2} onChange={(next) => set('historyText2', next)} multiline />
    </Block>

    <Block title="Cifras" pageId="about" blockKey="cifras" description="Valores mostrados en la página de Nuestra firma.">
      <div className="cms-explicit-list">
        {stats.map((stat, index) => { const entry = asRecord(stat as CmsValue); return <div className="cms-explicit-entry" key={index}>
          <h4>Cifra {index + 1}</h4>
          <TextField label="Valor" value={entry.value} onChange={(next) => { const nextStats = stats.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'value', next) : old); set('stats', nextStats); }} />
          <TextField label="Etiqueta" value={entry.label} onChange={(next) => { const nextStats = stats.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'label', next) : old); set('stats', nextStats); }} />
        </div>; })}
      </div>
    </Block>

    <Block title="Valores y principios" pageId="about" blockKey="valores" description="Título y principios que aparecen en la página.">
      <TextField label="Título" value={current.valuesTitle} onChange={(next) => set('valuesTitle', next)} />
      <div className="cms-explicit-list">
        {values.map((item, index) => { const entry = asRecord(item as CmsValue); return <div className="cms-explicit-entry" key={index}>
          <h4>Principio {index + 1}</h4>
          <TextField label="Nombre" value={entry.title} onChange={(next) => { const nextValues = values.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'title', next) : old); set('values', nextValues); }} />
          <TextField label="Descripción" value={entry.text} onChange={(next) => { const nextValues = values.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'text', next) : old); set('values', nextValues); }} multiline />
        </div>; })}
      </div>
    </Block>

    <Block title="Prioridad y frases" pageId="about" blockKey="prioridad" description="Frases y textos de la sección editorial de prioridad.">
      <div className="cms-explicit-list">
        {priority.map((item, index) => { const entry = asRecord(item as CmsValue); return <div className="cms-explicit-entry" key={index}>
          <h4>Frase {index + 1}</h4>
          <TextField label="Antes" value={entry.antes} onChange={(next) => { const nextItems = priority.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'antes', next) : old); set('priority', nextItems); }} />
          <TextField label="Énfasis" value={entry.em} onChange={(next) => { const nextItems = priority.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'em', next) : old); set('priority', nextItems); }} />
          <TextField label="Final" value={entry.fin} onChange={(next) => { const nextItems = priority.map((old, itemIndex) => itemIndex === index ? updateRecord(asRecord(old as CmsValue), 'fin', next) : old); set('priority', nextItems); }} />
        </div>; })}
      </div>
      <StringList label="Textos de apoyo" values={priorityNotes} onChange={(next) => set('priorityNotes', next)} addLabel="Añadir texto" itemLabel="Texto" />
    </Block>

    {renderLamina('bighorn', 'Lámina Siempre hacia adelante')}
    <p className="cms-explicit-shared">La lámina Capacidad de reacción se edita desde Prácticas porque aparece al final de esa página. El mismo contenido se conserva como fuente compartida.</p>

    <Block title="Navegación y SEO" description="Textos de los enlaces de salida y accesibilidad.">
      <TextField label="Etiqueta de siguiente página" value={current.nextLabel} onChange={(next) => set('nextLabel', next)} />
      <TextField label="Texto accesible de siguiente página" value={current.nextLabelAria} onChange={(next) => set('nextLabelAria', next)} />
    </Block>
  </div>;
}

export function ExplicitHomeFields(props: ExplicitPageFieldsProps) {
  return <HomeFields {...props} />;
}

export function ExplicitAboutFields(props: ExplicitPageFieldsProps) {
  return <AboutFields {...props} />;
}

export function ExplicitPracticeFields(props: ExplicitPageFieldsProps) {
  return <AboutFields {...props} onlyLamina />;
}
