/* Contacto con el diseño de la demo v3 (aprobada el 5-11-2026): datos y formulario en dos columnas
   (sh-contacto) y, debajo, «Nuestras oficinas» con el mapa. Todos los datos de contacto salen del
   sitio (/api/site-content y el panel); el formulario es el real (POST /api/contact). */
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteContact, useSiteDetails } from "@/components/home26/useSiteContact";
import { anyPartnerHasDirectContact } from "@/lib/partnerContact";
import { V3Main, useV3Lang } from "@/v3/shared";
import FormularioContacto from "@/v3/contacto/Formulario";
import { Oficinas } from "@/v3/contacto/Oficinas";
import { CONTACT_CONTENT, CT } from "@/v3/contacto/textos";
import "@/v3/contacto/contacto.css";

export default function Contact() {
  const { language } = useLanguage();
  const { lang, locale } = useV3Lang();
  const ct = CT[locale];
  const nativo = language === "es" || language === "en";
  // Textos del panel (sección «contact», 10 idiomas)
  const t = useCmsContent("contact", CONTACT_CONTENT)[language] ?? CONTACT_CONTENT.en;
  // Dirección, teléfono y correo: /api/site-content (los mismos del pie y del menú)
  const firm = useSiteContact(lang);
  const details = useSiteDetails();

  // La frase de los socios solo es verdad si alguno tiene correo o teléfono propios (G6, lib/partnerContact)
  const { data: teamMembers } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });
  const showPartnersNote = anyPartnerHasDirectContact(teamMembers, firm);

  // «Cómo llegar»: Google Maps con el enlace del panel; Waze y el mapa, con la dirección del sitio
  const direccion = (details.address || firm.address.join(", ")).trim();
  const q = encodeURIComponent(direccion);
  const wazeUrl = `https://waze.com/ul?q=${q}&navigate=yes`;
  const mapaUrl = `https://www.google.com/maps?q=${q}&output=embed`;
  // Etiquetas de la lista: las de la demo en español e inglés; en los demás idiomas, las del panel
  const telLabel = nativo ? ct.datosTel : t.telLabel;
  const mailLabel = nativo ? ct.datosCorreo : t.emailLabel;

  return (
    <div data-testid="page-contact">
      <SEOHead page="contact" language={language} />
      <Header />
      <V3Main vista="contacto">
        <section className="sh-contacto" id="contacto" aria-labelledby="contacto-h" data-testid="section-contact">
          <div className="sh-wrap sh-contacto__grid">
            <div className="sh-contacto__datos" data-testid="section-contact-office">
              <h1 id="contacto-h" className="sh-h2" data-testid="text-contact-title">{t.title}</h1>
              {/* bdi: en árabe (RTL) el punto final de «N.L.» no salta al principio de la línea */}
              <address className="sh-dir" data-testid="text-office-address">
                {firm.address.map((line, i) => <span key={i}><bdi>{line}</bdi></span>)}
              </address>
              <dl className="sh-datos">
                <div>
                  <dt>{telLabel}</dt>
                  <dd><a href={firm.phoneHref} dir="ltr" data-testid="link-office-phone">{firm.phone}</a></dd>
                </div>
                <div>
                  <dt>{mailLabel}</dt>
                  <dd><a href={`mailto:${firm.email}`} dir="ltr" data-testid="link-office-email">{firm.email}</a></dd>
                </div>
                {details.linkedinUrl ? (
                  <div>
                    <dt>LinkedIn</dt>
                    <dd>
                      <a href={details.linkedinUrl} target="_blank" rel="noopener noreferrer" data-testid="button-linkedin">
                        Santos&nbsp;&amp;&nbsp;Saucedo<span className="sr-only">{` ${t.newTab}`}</span>
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              <p className="sh-llegar">
                <span className="sh-cap">{t.getDirections}</span>
                <a href={details.directionsUrl} target="_blank" rel="noopener noreferrer" data-testid="button-get-directions">
                  Google Maps<span className="sr-only">{` ${t.newTab}`}</span>
                </a>
                <a href={wazeUrl} target="_blank" rel="noopener noreferrer" data-testid="button-waze">
                  Waze<span className="sr-only">{` ${t.newTab}`}</span>
                </a>
              </p>
              {showPartnersNote ? <p className="ct-nota" data-testid="text-contact-subtitle">{t.partnersNote}</p> : null}
            </div>
            <FormularioContacto idPrefix="f" dePagina />
          </div>
        </section>

        <Oficinas direccion={firm.address} mapaUrl={mapaUrl} mapaTitulo={`${t.officesTitle} — ${t.addressLabel}`} />
      </V3Main>
      <Footer />
    </div>
  );
}
