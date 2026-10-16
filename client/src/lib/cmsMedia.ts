import { useCmsContent } from "@/hooks/useCmsContent";
export const mediaDefaults = {
  "brand": {
    "logoLight": "/editorial/logo-blanco-lima.svg",
    "logoDark": "/editorial/logo-marino.svg",
    "favicon": "/favicon.svg",
    "name": "Santos & Saucedo"
  },
  "hero": {
    "videoDesktop": "/video/portada-azul-1920.mp4",
    "videoMobile": "/video/portada-azul-1280.mp4",
    "poster": "/video/portada-azul-poster.jpg",
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
  ]
};
export const useCmsMedia = () => useCmsContent("media", mediaDefaults);
