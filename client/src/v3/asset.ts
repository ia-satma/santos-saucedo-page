/** Ruta de un archivo de client/public con la base del sitio: "/" en Replit y en desarrollo,
    "/santos-saucedo-page/" en la copia estática de GitHub Pages. */
export const v3Asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
