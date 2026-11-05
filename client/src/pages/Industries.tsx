// Página «Industrias» (demo v3). La construye el módulo de industrias; por ahora solo la estructura.
import Header26 from "@/components/home26/Header26";
import Footer26 from "@/components/home26/Footer26";
import { V3Main } from "@/v3/shared";

export default function Industries() {
  return (
    <div className="ss26 min-h-screen" data-testid="page-industries">
      <Header26 />
      <V3Main vista="industrias">
        <div className="sh-wrap" style={{ paddingBlock: 120 }}>Industrias</div>
      </V3Main>
      <Footer26 />
    </div>
  );
}
