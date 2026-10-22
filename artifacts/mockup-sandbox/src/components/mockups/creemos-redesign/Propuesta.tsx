import "./_group.css";

const paragraphs = [
  "Estamos convencidos de que la mayoría de los conflictos laborales se resuelven antes de llegar a un tribunal: en un contrato bien redactado, en un expediente en orden, en una negociación preparada con tiempo.",
  "Por eso la mayor parte de nuestro trabajo es preventivo. Cuando el litigio es inevitable, lo conduce el mismo equipo que conoce la operación del cliente.",
];

function Eyebrow() {
  return (
    <p className="creemos-eyebrow">
      <span aria-hidden="true" className="creemos-eyebrow__mark">§</span>
      <span aria-hidden="true" className="creemos-eyebrow__rule" />
      <span>Lo que creemos</span>
    </p>
  );
}

export function Propuesta() {
  return (
    <section className="creemos-frame creemos-section creemos-proposed" aria-labelledby="proposed-creemos-title">
      <div className="creemos-container">
        <Eyebrow />
        <div className="creemos-proposed__title-wrap">
          <h2 id="proposed-creemos-title" className="creemos-title creemos-proposed__title">
            La prevención es la primera defensa.
          </h2>
        </div>
        <div className="creemos-proposed__body">
          {paragraphs.map((paragraph) => (
            <p className="creemos-copy creemos-proposed__copy" key={paragraph.slice(0, 24)}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
