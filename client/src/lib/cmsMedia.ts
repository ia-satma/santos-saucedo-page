import { useCmsContent } from "@/hooks/useCmsContent";
export const mediaDefaults = {
  "brand": {
    "logoLight": "/editorial/logo-blanco-lima.svg",
    "logoDark": "/editorial/logo-marino.svg",
    "favicon": "/favicon.svg",
    "name": "Santos & Saucedo"
  },
  "hero": {
    "videoDesktop": "/video/portada-color-1920.mp4",
    "videoMobile": "/video/portada-color-1280.mp4",
    "poster": "/video/portada-color-poster.jpg",
    "videoEnabled": true
  },
  "photos": {
    "fachada": {
      "url": "/editorial/fachada-1536.webp",
      "smallUrl": "/editorial/fachada-768.webp"
    },
    "recepcion": {
      "url": "/editorial/recepcion-1536.webp",
      "smallUrl": "/editorial/recepcion-768.webp"
    },
    "vestibulo": {
      "url": "/editorial/vestibulo-1536.webp",
      "smallUrl": "/editorial/vestibulo-768.webp"
    },
    "vestibulo2": {
      "url": "/editorial/vestibulo-2-1536.webp",
      "smallUrl": "/editorial/vestibulo-2-768.webp"
    },
    "salaJuntas": {
      "url": "/editorial/sala-juntas-1536.webp",
      "smallUrl": "/editorial/sala-juntas-768.webp"
    },
    "salaJuntas2": {
      "url": "/editorial/sala-juntas-2-1536.webp",
      "smallUrl": "/editorial/sala-juntas-2-768.webp"
    },
    "areaTrabajo": {
      "url": "/editorial/area-trabajo-1536.webp",
      "smallUrl": "/editorial/area-trabajo-768.webp"
    },
    "areaTrabajo2": {
      "url": "/editorial/area-trabajo-2-1536.webp",
      "smallUrl": "/editorial/area-trabajo-2-768.webp"
    },
    "privado": {
      "url": "/editorial/privado-1536.webp",
      "smallUrl": "/editorial/privado-768.webp"
    },
    "escultura": {
      "url": "/editorial/escultura-1536.webp",
      "smallUrl": "/editorial/escultura-768.webp"
    },
    "obraMazo": {
      "url": "/editorial/obra-mazo-1536.webp",
      "smallUrl": "/editorial/obra-mazo-768.webp"
    },
    "recepcionBanda": {
      "url": "/editorial/recepcion-banda-1536.webp",
      "smallUrl": "/editorial/recepcion-banda-768.webp"
    },
    "biblioteca": {
      "url": "/editorial/oficina-biblioteca-1536.webp",
      "smallUrl": "/editorial/oficina-biblioteca-768.webp"
    },
    "escalera": {
      "url": "/editorial/oficina-escalera-1536.webp",
      "smallUrl": "/editorial/oficina-escalera-768.webp"
    },
    "detalle": {
      "url": "/editorial/oficina-arte-detalle-1536.webp",
      "smallUrl": "/editorial/oficina-arte-detalle-768.webp"
    },
    "arteMapa": {
      "url": "/editorial/oficina-arte-mapa-1536.webp",
      "smallUrl": "/editorial/oficina-arte-mapa-768.webp"
    },
    "oficinaPrivada": {
      "url": "/editorial/oficina-oficina-privada-1536.webp",
      "smallUrl": "/editorial/oficina-oficina-privada-768.webp"
    },
    "salaPanoramica": {
      "url": "/editorial/oficina-sala-panoramica-1536.webp",
      "smallUrl": "/editorial/oficina-sala-panoramica-768.webp"
    },
    "espaciosAbiertos": {
      "url": "/editorial/oficina-espacios-abiertos-1536.webp",
      "smallUrl": "/editorial/oficina-espacios-abiertos-768.webp"
    },
    "recepcionGeneral": {
      "url": "/editorial/oficina-recepcion-general-1536.webp",
      "smallUrl": "/editorial/oficina-recepcion-general-768.webp"
    },
    "arteColor": {
      "url": "/editorial/oficina-arte-color-1536.webp",
      "smallUrl": "/editorial/oficina-arte-color-768.webp"
    },
    "mesaTrabajo": {
      "url": "/editorial/oficina-mesa-trabajo-1536.webp",
      "smallUrl": "/editorial/oficina-mesa-trabajo-768.webp"
    }
  },
  "teamMosaic": [
    "/editorial/team-01.webp",
    "/editorial/team-02.webp",
    "/editorial/team-03.webp",
    "/editorial/team-04.webp",
    "/editorial/team-05.webp",
    "/editorial/team-06.webp",
    "/editorial/team-07.webp",
    "/editorial/team-08.webp",
    "/editorial/team-09.webp",
    "/editorial/team-10.webp",
    "/editorial/team-11.webp",
    "/editorial/team-12.webp",
    "/editorial/team-13.webp",
    "/editorial/team-14.webp",
    "/editorial/team-15.webp",
    "/editorial/team-16.webp",
    "/editorial/team-17.webp",
    "/editorial/team-18.webp",
    "/editorial/team-19.webp",
    "/editorial/team-20.webp",
    "/editorial/team-21.webp",
    "/editorial/team-22.webp",
    "/editorial/team-23.webp",
    "/editorial/team-24.webp",
    "/editorial/team-25.webp",
    "/editorial/team-26.webp",
    "/editorial/team-27.webp",
    "/editorial/team-28.webp",
    "/editorial/team-29.webp",
    "/editorial/team-30.webp",
    "/editorial/team-31.webp",
    "/editorial/team-32.webp",
    "/editorial/team-33.webp",
    "/editorial/team-34.webp",
    "/editorial/team-35.webp",
    "/editorial/team-36.webp",
    "/editorial/team-37.webp"
  ],
  "officeGallery": [
    {
      "photo": "recepcionGeneral",
      "altEs": "Vista general del interior de la firma",
      "alt": "Overview of the firm’s interior",
      "enabled": true,
      "featured": false
    },
    {
      "photo": "salaPanoramica",
      "altEs": "Vista de la mesa de reuniones y el jardín",
      "alt": "View of the meeting table and garden",
      "enabled": true,
      "featured": true
    },
    {
      "photo": "escultura",
      "altEs": "Escultura en el jardín de la oficina",
      "alt": "Sculpture in the office garden",
      "enabled": true,
      "featured": false
    },
    {
      "photo": "biblioteca",
      "altEs": "Biblioteca jurídica de la firma",
      "alt": "The firm’s legal library",
      "enabled": true,
      "featured": false
    },
    {
      "photo": "vestibulo",
      "altEs": "Interior de las oficinas de Santos & Saucedo",
      "alt": "Inside the Santos & Saucedo offices",
      "enabled": true,
      "featured": true
    },
    {
      "photo": "espaciosAbiertos",
      "altEs": "Vista general de los espacios de trabajo",
      "alt": "Overview of the workspaces",
      "enabled": true,
      "featured": true
    },
    {
      "photo": "detalle",
      "altEs": "Obra de arte contemporáneo en la firma",
      "alt": "Contemporary artwork at the firm",
      "enabled": true,
      "featured": false
    },
    {
      "photo": "arteColor",
      "altEs": "Arte contemporáneo en las oficinas",
      "alt": "Contemporary art in the offices",
      "enabled": true,
      "featured": false
    },
    {
      "photo": "vestibulo2",
      "altEs": "Vista de los interiores de la firma",
      "alt": "View of the firm’s interiors",
      "enabled": true,
      "featured": true
    },
    {
      "photo": "areaTrabajo2",
      "altEs": "Otra perspectiva de los espacios de trabajo",
      "alt": "Another view of the workspaces",
      "enabled": true,
      "featured": true
    },
    {
      "photo": "oficinaPrivada",
      "altEs": "Interior de una oficina de Santos & Saucedo",
      "alt": "Interior of a Santos & Saucedo office",
      "enabled": true,
      "featured": false
    },
    {
      "photo": "arteMapa",
      "altEs": "Obra de arte en las oficinas de la firma",
      "alt": "Artwork at the firm’s offices",
      "enabled": true,
      "featured": false
    },
    {
      "photo": "mesaTrabajo",
      "altEs": "Espacio compartido de trabajo en la firma",
      "alt": "Shared workspace at the firm",
      "enabled": true,
      "featured": true
    },
    {
      "photo": "recepcion",
      "altEs": "Vista interior de la oficina",
      "alt": "View inside the office",
      "enabled": true,
      "featured": true
    },
    {
      "photo": "escalera",
      "altEs": "Biblioteca y escalera de la oficina",
      "alt": "Office library and staircase",
      "enabled": true,
      "featured": false
    },
    {
      "photo": "obraMazo",
      "altEs": "Obra de arte de temática jurídica",
      "alt": "Legal-themed artwork",
      "enabled": true,
      "featured": false
    },
    {
      "photo": "areaTrabajo",
      "altEs": "Espacios de trabajo de la firma",
      "alt": "The firm’s workspaces",
      "enabled": true,
      "featured": true
    },
    {
      "photo": "privado",
      "altEs": "Oficina de la firma",
      "alt": "Office at the firm",
      "enabled": true,
      "featured": false
    }
  ]
};
export const useCmsMedia = () => useCmsContent("media", mediaDefaults);
