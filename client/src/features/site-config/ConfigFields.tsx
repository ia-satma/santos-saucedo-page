import { mediaDefaults } from "@/lib/cmsMedia";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { CmsValue } from '@shared/cms';
import { MediaField } from './MediaField';

const names: Record<string, string> = {
  googleReviewsUrl: "Enlace de reseñas de Google", vestibulo3: "Vista interior de la oficina", estancia: "Estancia", mezanine: "Entrepiso",
  story: "Textos del recorrido de oficinas", workTitle: "Título sobre el trabajo diario", workText: "Texto sobre el trabajo diario", cultureTitle: "Título sobre biblioteca y arte", cultureText: "Texto sobre biblioteca y arte", featured: "Destacar vista general", officeGallery: "Galería de Nuestras Oficinas", photo: "Fotografía del catálogo", altEs: "Texto alternativo en español", biblioteca: "Biblioteca jurídica", escalera: "Biblioteca y escalera", detalle: "Detalle de arte contemporáneo", arteMapa: "Arte — mapa", oficinaPrivada: "Interior de oficina", salaPanoramica: "Mesa y jardín", espaciosAbiertos: "Vista general de los espacios", recepcionGeneral: "Panorámica interior", arteColor: "Arte contemporáneo", mesaTrabajo: "Espacio compartido",
  version:'Versión del consentimiento',validityMonths:'Vigencia en meses',acceptAll:'Aceptar todas',rejectOptional:'Rechazar opcionales',configure:'Configurar',save:'Guardar preferencias',essential:'Necesarias',essentialDescription:'Descripción de necesarias',analytics:'Analítica',analyticsDescription:'Descripción de analítica',external:'Contenido externo',externalDescription:'Descripción de contenido externo',leadinfo:'Leadinfo',leadinfoDescription:'Descripción de Leadinfo',policy:'Etiqueta del aviso de privacidad',enabled:'Activo',disabledMessage:'Mensaje al pausar',labels:'Etiquetas por idioma',fullName:'Nombre completo',interest:'Área de interés',cv:'Currículum',consent:'Consentimiento',sending:'Enviando',unsubscribe:'Baja de suscripción',homeOrder:'Orden de secciones de Inicio',links:'Enlaces',practices:'Prácticas',hero:'Encabezado principal', tagline:'Frase principal',place:'Ciudad y año', firma:'La firma',title:'Título',body:'Texto',caption:'Pie de foto',alt:'Texto alternativo',creemos:'Lo que creemos',label:'Etiqueta',quote:'Frase destacada',practicas:'Prácticas',extranjeras:'Empresas extranjeras',monitor:'Monitor Laboral',intro:'Introducción',socios:'Socios',footer:'Pie de página',nav:'Menú principal',visible:'Visible',order:'Orden',header:'Cabecera',search:'Búsqueda',langs:'Selector de idiomas',heroVideo:'Control del video',disclaimer:'Aviso legal',rights:'Derechos',privacy:'Aviso de privacidad',terms:'Términos de uso',cookies:'Preferencias de cookies',office:'Oficina',firm:'Firma',legal:'Legal',brand:'Identidad',logoLight:'Logo sobre fondo oscuro',logoDark:'Logo sobre fondo claro',favicon:'Icono de pestaña',name:'Nombre',videoDesktop:'Video de escritorio',videoMobile:'Video de móvil',videoEnabled:'Mostrar video',poster:'Imagen de respaldo',photos:'Fotografías',url:'Imagen principal',smallUrl:'Imagen para pantallas pequeñas',teamMosaic:'Mosaico anónimo del equipo',fachada:'Fachada',recepcion:'Recepción',recepcionBanda:'Recepción panorámica',vestibulo:'Vestíbulo',vestibulo2:'Sala de espera',salaJuntas:'Sala de juntas de Inicio',salaJuntas2:'Sala de juntas de La oficina',areaTrabajo:'Área de trabajo',areaTrabajo2:'Segunda área de trabajo',privado:'Privado',escultura:'Escultura',obraMazo:'Obra del mazo',address:'Dirección',phone:'Teléfono',email:'Correo general',recruitmentEmail:'Correo de reclutamiento',linkedinUrl:'LinkedIn del despacho',directionsUrl:'Enlace para llegar',home:'Inicio',monitorLimit:'Número de publicaciones en Inicio',subtitle:'Subtítulo',description:'Descripción',historyText1:'Introducción de la firma',historyText2:'Segundo párrafo',valuesTitle:'Título de principios',values:'Principios',text:'Texto',stats:'Cifras',value:'Valor',sections:'Secciones',content:'Contenido',lastUpdated:'Fecha del documento',reception:'Recepción',meetingRooms:'Salas de juntas',workAreas:'Áreas de trabajo',art:'Arte',hours:'Etiqueta del horario',hoursDetails:'Horario',positionsTitle:'Título de vacantes',positionsEmpty:'Mensaje sin vacantes',applyTitle:'Título de postulaciones',applyInstructions:'Instrucciones de postulación',applyNote:'Nota de postulación',sendApplication:'Botón de postulación',ctaTitle:'Título de llamada',ctaIntro:'Introducción',ctaInstructions:'Instrucciones',heroTitle:'Título principal',heroSubtitle:'Subtítulo principal',mosaicNote:'Nota del mosaico',foundingPartners:'Socios fundadores',partnersTitle:'Socios',associatesTitle:'Equipo',education:'Formación',biography:'Biografía',role:'Cargo',contactInfo:'Datos de contacto',noResults:'Sin resultados',loading:'Cargando',empty:'Sin contenido',error:'Mensaje de error',submit:'Botón de enviar',submitting:'Enviando',success:'Mensaje de éxito',privacyPolicy:'Aviso de privacidad',practiceGroups:'Prácticas',news:'Monitor Laboral',about:'Nuestra firma',team:'Socios',careers:'Carreras',interns:'Semillero S&S',offices:'Nuestras Oficinas',contact:'Contacto',newsletter:'Boletín',notFound:'Página 404',close:'Cerrar',open:'Abrir',hint:'Ayuda',placeholder:'Texto de ejemplo',categories:'Categorías',all:'Todas las categorías', filters:'Filtros', companyLabel:'Etiqueta de empresa',messageLabel:'Etiqueta del mensaje', emailLabel:'Etiqueta del correo',fullNameLabel:'Etiqueta del nombre', privacyIntro:'Introducción de privacidad',privacyLink:'Enlace de privacidad',cta:'Botón',subscribe:'Suscripción',titleEs:'Título en español',descriptionEs:'Descripción en español',bodyTitle:'Título del cuerpo',founded:'Fundación',method:'Método', principles:'Principios',contactText:'Texto de contacto', faq:'Preguntas frecuentes', extras:'Textos complementarios',applicationEmail:'Correo para esta vacante',applicationUrl:'Enlace de postulación', published:'Publicada',department:'Área',departmentEs:'Área en español',location:'Ubicación',locationEs:'Ubicación en español',type:'Modalidad',requirements:'Requisitos',requirementsEs:'Requisitos en español',benefits:'Prestaciones',benefitsEs:'Prestaciones en español',salaryRange:'Rango salarial',level:'Nivel',isUrgent:'Urgente',expiresAt:'Vigencia',
};
export const fieldLabel = (key: string) => names[key] || key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]/g,' ');
const locked = new Set(['id','slug','path','href','noindex','attrs','locale']);
function emptyLike(v: CmsValue): CmsValue { if (Array.isArray(v)) return []; if (v && typeof v==='object') return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,emptyLike(x)])); return typeof v==='boolean'?false:typeof v==='number'?0:''; }
export function ConfigFields({ value, onChange, path = [], media = false }: { value: CmsValue; onChange: (v: CmsValue) => void; path?: string[]; media?: boolean }) {
  const key = path.at(-1) || '';
  const label = fieldLabel(key);
  const id = `cms-${path.join('-')}`;
  if (locked.has(key)) return null;
  if (Array.isArray(value)) {
    const fixedSize = key==='homeOrder';
    const fixed = key==='nav' || key==='place' || value.some(v=>v && typeof v==='object' && !Array.isArray(v) && ('id' in v || 'slug' in v));
    return <fieldset className="space-y-4 border-t pt-5"><legend className="font-medium px-1">{label}</legend>
      {value.map((v,i)=><div className="border p-4 space-y-3" key={i}>
        <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{label} {i+1}</p>{!fixed && <div className="flex gap-1">
          <Button type="button" variant="ghost" size="sm" disabled={i===0} aria-label={`Subir ${label} ${i+1}`} onClick={()=>{const list=[...value];[list[i-1],list[i]]=[list[i],list[i-1]];onChange(list);}}>↑</Button>
          <Button type="button" variant="ghost" size="sm" disabled={i===value.length-1} aria-label={`Bajar ${label} ${i+1}`} onClick={()=>{const list=[...value];[list[i+1],list[i]]=[list[i],list[i+1]];onChange(list);}}>↓</Button>
          {!fixedSize&&<Button type="button" variant="ghost" size="sm" onClick={()=>onChange(value.filter((_,j)=>j!==i))}>Quitar</Button>}
        </div>}</div>
        {fixedSize?<p>{fieldLabel(String(v))}</p>:<ConfigFields value={v} onChange={x=>onChange(value.map((old,j)=>j===i?x:old))} path={[...path,String(i)]} media={media} />}
      </div>)}
      {!fixed && !fixedSize && <Button type="button" variant="outline" size="sm" disabled={!value.length && key!=='teamMosaic'} onClick={()=>onChange([...value,value.length?emptyLike(value[0]):''])}>Añadir {label.toLowerCase()}</Button>}
    </fieldset>;
  }
  if (value !== null && typeof value==='object') return <div className="space-y-5">{Object.entries(value).filter(([k])=>!locked.has(k)).map(([k,v])=>{
    const nested = v!==null && typeof v==='object';
    const update = (next: CmsValue) => onChange({ ...value, [k]:next, ...(media && k==='url' && 'smallUrl' in value ? { smallUrl:next } : {}) });
    return nested ? <details key={k} className="border p-4" open={path.length<1}><summary className="cursor-pointer font-medium">{fieldLabel(k)}</summary><div className="mt-5"><ConfigFields value={v} onChange={update} path={[...path,k]} media={media}/></div></details> : <ConfigFields key={k} value={v} onChange={update} path={[...path,k]} media={media}/>;
  })}</div>;
  if (typeof value==='boolean') return <div className="flex items-center justify-between gap-6"><label htmlFor={id} className="text-sm font-medium">{label}</label><Switch id={id} checked={value} onCheckedChange={onChange}/></div>;
  if (typeof value==='number') return <div className="space-y-2"><label htmlFor={id} className="text-sm font-medium">{label}</label><Input id={id} type="number" min={0} value={value} onChange={e=>onChange(Number(e.target.value))}/></div>;
  const str = String(value ?? '');
  if (media && key === 'photo' && path.includes('officeGallery')) return <div className="space-y-3">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <select id={id} value={str} className="w-full rounded-md border bg-background p-3" onChange={e=>onChange(e.target.value)}>
      <option value="">Seleccionar fotografía</option>
      {Object.keys(mediaDefaults.photos).map(photo=><option key={photo} value={photo}>{fieldLabel(photo)}</option>)}
    </select>
    {str in mediaDefaults.photos && <img src={mediaDefaults.photos[str as keyof typeof mediaDefaults.photos].smallUrl} alt="Vista de referencia del catálogo" className="h-32 w-48 rounded-lg object-cover" loading="lazy" />}
  </div>;
  const isMedia = media && (/(url|logoLight|logoDark|favicon|poster|videoDesktop|videoMobile)$/i.test(key) || path.includes('teamMosaic'));
  return <div className="space-y-2"><label htmlFor={id} className="text-sm font-medium">{label}</label>
    {isMedia ? <MediaField id={id} value={str} onChange={onChange} video={/videoDesktop|videoMobile/.test(key)}/> : str.length>100 || /body|text|content|intro|description|instructions|note/i.test(key) ? <Textarea id={id} rows={Math.min(16,Math.max(3,Math.ceil(str.length/100)))} value={str} onChange={e=>onChange(e.target.value)} /> : <Input id={id} value={str} onChange={e=>onChange(e.target.value)} />}
  </div>;
}
