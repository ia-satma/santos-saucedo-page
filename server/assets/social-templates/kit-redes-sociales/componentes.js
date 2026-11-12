/* Santos Saucedo · Componentes para redes sociales (1080 × 1080)
 * Uso en navegador: <script src="componentes.js"></script> → window.SS
 * Uso en Node:      const SS = require('./componentes.js')
 * Cada función devuelve un string HTML con estilos inline.
 */
(function(root){
const A = { base: '../assets/' };            // ruta a la carpeta assets
const NAVY = 'linear-gradient(180deg,#0c2340 0%,#0d3358 40%,#0f3e69 60%,#145385 100%)';
const MASK = '-webkit-mask-image:linear-gradient(0deg,#000 0%,#000 25%,rgba(0,0,0,0.5) 50%,rgba(0,0,0,0.15) 72%,transparent 90%);mask-image:linear-gradient(0deg,#000 0%,#000 25%,rgba(0,0,0,0.5) 50%,rgba(0,0,0,0.15) 72%,transparent 90%)';
const L = "font-family:'Lora',Georgia,serif;";
const T = { // modos de color: dark (azul), light (blanco), gris (#eef2f6, usa light), lime
  dark:  {bg:NAVY,     bar:'#bbf741',eb:'#bbf741',h:'#ffffff',p:'#c5d2e3',line:'rgba(255,255,255,0.35)',logo:'blanco',n:'#c5d2e3',ic:'-lime'},
  light: {bg:'#ffffff',bar:'#8cc63f',eb:'#5e8f17',h:'#0b2850',p:'#55566a',line:'#d3dbe6',logo:'azul',n:'#4a5f7d',ic:''},
  gris:  {bg:'#eef2f6',bar:'#8cc63f',eb:'#5e8f17',h:'#0b2850',p:'#55566a',line:'#d3dbe6',logo:'azul',n:'#4a5f7d',ic:''},
  lime:  {bg:'#bbf741',bar:'#0b2850',eb:'#0b2850',h:'#0b2850',p:'#0b2850',line:'rgba(11,40,80,0.3)',logo:'azul',n:'#0b2850',ic:''}
};
const SS = {
  A, T, NAVY,
  marca:(m,pos='right:-200px;bottom:-110px;height:960px')=>`<img src="${A.base}ss-simbolo.png" alt="" style="position:absolute;${pos};${m==='dark'?'filter:brightness(0) invert(1);opacity:0.09':'opacity:0.065'};${MASK}">`,
  eyebrow:(t,m)=>`<div style="display:flex;align-items:center;gap:22px"><div style="width:72px;height:4px;background:${T[m].bar}"></div><div style="font-size:26px;font-weight:500;letter-spacing:8px;color:${T[m].eb}">${t}</div></div>`,
  cabecera:(t,m,n)=>`<div style="display:flex;align-items:center;justify-content:space-between">${SS.eyebrow(t,m)}<div style="font-size:26px;color:${T[m].n}">${n}</div></div>`,
  logo:(m,w=300)=>`<img src="${A.base}logo-${T[m].logo}.png" alt="Santos Saucedo" style="width:${w}px;height:auto;display:block;margin-left:-${Math.round(w*0.072)}px">`,
  pie:(m,der='santossaucedo.com')=>`<div style="padding-top:30px;border-top:1px solid ${T[m].line};display:flex;align-items:center;justify-content:space-between">${SS.logo(m)}<div style="font-size:26px;font-weight:500;color:${T[m].h}">${der}</div></div>`,
  pieMini:(m,der='→')=>`<div style="display:flex;align-items:center;justify-content:space-between">${SS.logo(m,250)}<div style="font-size:28px;font-weight:500;color:${T[m].h}">${der}</div></div>`,
  banda:()=>`<div style="position:absolute;left:0;right:0;bottom:176px;height:4px;background:#bbf741"></div><div style="position:absolute;left:0;right:0;bottom:0;height:176px;background:#145385;padding:0 90px;display:flex;align-items:center;justify-content:space-between">${SS.logo('dark',340)}<div style="font-size:26px;color:#ffffff">santossaucedo.com</div></div>`,
  marco:(etq,m,inner)=>`<div data-screen-label="${etq}" style="width:1080px;height:1080px;flex:none;position:relative;overflow:hidden;background:${T[m]?T[m].bg:m}">${inner}</div>`,
  area:(inner)=>`<div style="position:absolute;inset:0;padding:90px 90px 80px;display:flex;flex-direction:column">${inner}</div>`,
  centro:(inner,gap=30)=>`<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:${gap}px">${inner}</div>`,
  titulo:(px,m,t)=>`<div style="${L}font-size:${px}px;line-height:1.08;color:${T[m].h};text-wrap:pretty">${t}</div>`,
  texto:(px,m,t)=>`<div style="font-size:${px}px;line-height:1.45;color:${T[m].p};text-wrap:pretty">${t}</div>`,
  cifra:(px,color,t)=>`<div style="${L}font-size:${px}px;line-height:0.85;color:${color};letter-spacing:-6px">${t}</div>`,
  foto:(src,st='inset:0;width:100%;height:100%',pos='50% 25%')=>`<img src="${src}" alt="" style="position:absolute;${st};object-fit:cover;object-position:${pos};display:block">`,
  // Único tratamiento permitido sobre fotos: degradado parcial inferior
  degradado:(alto='60%')=>`<div style="position:absolute;left:0;right:0;bottom:0;height:${alto};background:linear-gradient(180deg,rgba(12,35,64,0) 0%,rgba(12,35,64,0.8) 55%,#0c2340 100%)"></div>`,
  etiqueta:(t)=>`<div style="position:absolute;left:90px;top:90px;background:#0b2850;padding:14px 22px;display:flex;align-items:center;gap:16px"><div style="width:40px;height:3px;background:#bbf741"></div><div style="font-size:24px;font-weight:500;letter-spacing:7px;color:#ffffff">${t}</div></div>`,
  contacto:(m,px=30)=>`<div style="display:flex;flex-direction:column;gap:22px;font-size:${px}px;color:${m==='dark'?'#ffffff':'#23232b'}">${[['phone','+52 81 8335 2086'],['mail','info@santossaucedo.com'],['web','santossaucedo.com']].map(([i,t])=>`<div style="display:flex;align-items:center;gap:22px"><img src="${A.base}iconos/ic-${i}${T[m].ic}.png" alt="" style="width:42px;height:42px">${t}</div>`).join('')}</div>`,
  separador:(c='#d3dbe6')=>`<div style="height:1px;background:${c}"></div>`,
  acento:(c='#8cc63f',w=120)=>`<div style="width:${w}px;height:4px;background:${c}"></div>`,

  /* ---- Recetas listas ---- */
  postTexto({modo='dark',seccion,titulo,texto,etq='Post'}){
    return SS.marco(etq,modo,(modo==='dark'?SS.marca('dark'):modo==='light'?SS.marca('light'):'')+SS.area(SS.eyebrow(seccion,modo)+SS.centro(SS.titulo(84,modo,titulo)+(texto?SS.texto(32,modo,texto):''),34)+SS.pie(modo)));
  },
  postCifra({modo='dark',seccion,cifra,titulo,texto,etq='Post'}){
    const c = modo==='dark'?'#ffffff':'#0b2850';
    return SS.marco(etq,modo,(modo==='dark'?SS.marca('dark'):'')+SS.area(SS.eyebrow(seccion,modo)+SS.centro(SS.cifra(300,c,cifra)+SS.titulo(60,modo,titulo)+(texto?SS.texto(30,modo,texto):''),26)+SS.pie(modo)));
  },
  postFoto({foto,seccion,titulo,texto,etq='Post'}){
    return SS.marco(etq,'#0c2340',SS.foto(foto)+SS.degradado('64%')+SS.etiqueta(seccion)+SS.area('<div style="flex:1"></div><div style="position:relative;display:flex;flex-direction:column;gap:24px;margin-bottom:50px">'+SS.titulo(80,'dark',titulo)+(texto?`<div style="font-size:30px;line-height:1.45;color:#e3e9f1">${texto}</div>`:'')+'</div><div style="position:relative">'+SS.pie('dark')+'</div>'));
  },
  // slides: [{tipo:'portada'|'lista'|'cierre', modo, ...}]
  carrusel(id,slides){
    const n=slides.length, pg=i=>`${String(i+1).padStart(2,'0')} / ${String(n).padStart(2,'0')}`;
    return '<div style="display:flex;gap:30px">'+slides.map((s,i)=>{
      const m=s.modo||'light', etq=`Carrusel ${id} · ${i+1}`;
      if(s.tipo==='portada') return SS.marco(etq,m,(m!=='lime'?SS.marca(m==='dark'?'dark':'light'):'')+SS.area(SS.eyebrow(s.seccion,m)+SS.centro(SS.titulo(100,m,s.titulo)+(s.texto?SS.texto(34,m,s.texto):''),34)+SS.pieMini(m,'Desliza →')));
      if(s.tipo==='lista') return SS.marco(etq,m,SS.area(SS.cabecera(s.seccion,m,pg(i))+SS.centro(s.items.map((it,k)=>`<div style="display:flex;gap:44px"><div style="${L}font-size:120px;line-height:0.85;color:#8cc63f;width:160px;flex:none">${it.n}</div><div style="display:flex;flex-direction:column;gap:16px">${SS.titulo(52,m,it.t)}${SS.texto(30,m,it.d)}</div></div>`).join(SS.separador()),60)+SS.pieMini(m)));
      return SS.marco(etq,m,(m==='dark'?SS.marca('dark'):'')+SS.area(SS.cabecera(s.seccion||'CONTACTO',m,pg(i))+SS.centro(SS.titulo(84,m,s.titulo)+(s.texto?SS.texto(32,m,s.texto):'')+'<div style="margin-top:20px">'+SS.contacto(m)+'</div>',30)+SS.logo(m,340)));
    }).join('')+'</div>';
  }
};
if (typeof module!=='undefined') module.exports=SS; else root.SS=SS;
})(this);
