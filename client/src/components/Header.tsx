import Header26 from "./home26/Header26";

// Cabecera única del sitio (marca 2026). Las páginas públicas siguen importando
// Header; el Header anterior (fijo, con su buscador y selector) queda en el historial de git.

// Props del Header anterior: se aceptan y se ignoran para que ninguna página deje de compilar
export type HeaderProps = Record<string, unknown>;

export default function Header(_props: HeaderProps) {
  return <Header26 />;
}
