import "@/styles/folio-pages.css";
import type { CSSProperties } from "react";
import { OfficePhotography } from "@/components/editorial/OfficePhotography";
import { HeroKicker } from "@/components/editorial/HeroKicker";
import { useCmsMedia } from "@/lib/cmsMedia";
import { useCmsContent } from "@/hooks/useCmsContent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lineas, TextLink } from "@/components/home26/primitives";
import { chrome26 } from "@/components/home26/chrome26";
import { keepFirmName } from "@/lib/firmName";
import { useOfficeLabel } from "@/lib/officeLabel";
import type { LanguageCode } from "@shared/schema";
import "@/components/about/about.css";

// Cifras de /about: "40+" (sin tocar) y "72+" ciudades con presencia, la forma en cifras de
// "más de 72" (redacción aprobada de la portada: "Ciudades en nuestra red de alianzas"). Fuera el conteo de
// integrantes, el número de prácticas y "1 oficina".
const citiesLabel: Record<LanguageCode, string> = {
  es: "Ciudades en nuestra red de alianzas",
  en: "Cities in our alliance network",
  de: "Städte mit Präsenz",
  zh: "覆盖城市",
  ko: "진출 도시",
  ja: "展開都市",
  ar: "مدينة نتواجد فيها",
  ru: "Городов присутствия",
  fr: "Villes de présence",
  it: "Città con presenza",
};

// Texto alternativo de la foto de la recepción: el mismo de /offices en cada idioma
const receptionAlt: Record<LanguageCode, string> = {
  es: "Recepción de la oficina de Santos & Saucedo",
  en: "Reception at the Santos & Saucedo office",
  de: "Empfang der Kanzlei Santos & Saucedo",
  zh: "Santos & Saucedo办公室的前台",
  ko: "Santos & Saucedo 사무실의 리셉션",
  ja: "Santos & Saucedoのオフィスの受付",
  ar: "الاستقبال في مكتب Santos & Saucedo",
  ru: "Приёмная офиса Santos & Saucedo",
  fr: "Accueil du bureau de Santos & Saucedo",
  it: "Accoglienza della sede di Santos & Saucedo",
};

export default function About() {
  const { photos } = useCmsMedia();
  const officeNameFor = useOfficeLabel();
  const { language } = useLanguage();

  const content: Record<LanguageCode, {
    title: string;
    subtitle: string;
    historyText1: string;
    historyText2: string;
    valuesTitle: string;
    /** "Cómo trabajamos" de la redacción aprobada (Nuestra firma): cuatro principios */
    values: { title: string; text: string }[];
    stats: { value: string; label: string }[];
  }> = {
  "en": {
    "title": "The firm",
    "subtitle": "A partner-led firm with national reach.",
    "historyText1": "Santos & Saucedo is a law firm specializing in employment law for businesses. Its team brings more than 40 years of experience advising national and international companies.",
    "historyText2": "The firm advises on risk prevention, employment relations and dispute resolution. Its practice also integrates the corporate and immigration aspects of its clients’ operations.",
    "valuesTitle": "How we work",
    "values": [
      {
        "title": "Prevention",
        "text": "We review before the authorities do. A timely audit costs less than a lawsuit and often makes one unnecessary."
      },
      {
        "title": "Accountability",
        "text": "Every matter is handled by a partner who knows the client and answers for the work from start to finish."
      },
      {
        "title": "Candor",
        "text": "We say what we see, even when it is not what is expected. Sometimes the best advice is not to litigate."
      },
      {
        "title": "Consistency",
        "text": "The same judgment across all of a client’s workplaces, in any city in the country."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "Years of Experience"
      },
      {
        "value": "72+",
        "label": "Cities in our alliance network"
      }
    ]
  },
  "es": {
    "title": "Nuestra firma",
    "subtitle": "Una firma de socios con alcance nacional.",
    "historyText1": "Santos & Saucedo es una firma especializada en derecho laboral para empresas. Su equipo reúne más de 40 años de experiencia en la asesoría a compañías nacionales e internacionales.",
    "historyText2": "La firma asesora en prevención de riesgos, relaciones de trabajo y solución de controversias. Su práctica también integra los aspectos corporativos y migratorios que intervienen en la operación de sus clientes.",
    "valuesTitle": "Cómo trabajamos",
    "values": [
      {
        "title": "Prevención",
        "text": "Revisamos antes de que lo haga la autoridad. Una auditoría a tiempo cuesta menos que un juicio y con frecuencia lo hace innecesario."
      },
      {
        "title": "Responsabilidad",
        "text": "Cada asunto lo atiende un socio que conoce al cliente y responde por el trabajo de principio a fin."
      },
      {
        "title": "Franqueza",
        "text": "Decimos lo que vemos, aunque no sea lo que se espera. A veces el mejor consejo es no litigar."
      },
      {
        "title": "Consistencia",
        "text": "El mismo criterio en todos los centros de trabajo de un cliente, en cualquier ciudad del país."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "Años de experiencia"
      },
      {
        "value": "72+",
        "label": "Ciudades en nuestra red de alianzas"
      }
    ]
  },
  "de": {
    "title": "Über die Kanzlei",
    "subtitle": "Eine partnergeführte Kanzlei mit landesweiter Reichweite.",
    "historyText1": "Santos & Saucedo ist eine auf Arbeitsrecht für Unternehmen spezialisierte Kanzlei. Ihr Team vereint mehr als 40 Jahre Erfahrung in der Beratung nationaler und internationaler Unternehmen.",
    "historyText2": "Die Kanzlei berät in den Bereichen Risikoprävention, Arbeitsbeziehungen und Streitbeilegung. Ihre Praxis umfasst zudem die gesellschafts- und migrationsrechtlichen Aspekte der Geschäftstätigkeit ihrer Mandanten.",
    "valuesTitle": "Wie wir arbeiten",
    "values": [
      {
        "title": "Prävention",
        "text": "Wir prüfen, bevor es die Behörde tut. Ein rechtzeitiges Audit kostet weniger als ein Prozess und macht ihn oft überflüssig."
      },
      {
        "title": "Verantwortung",
        "text": "Jedes Mandat betreut ein Partner, der den Mandanten kennt und von Anfang bis Ende für die Arbeit einsteht."
      },
      {
        "title": "Offenheit",
        "text": "Wir sagen, was wir sehen, auch wenn es nicht das ist, was man erwartet. Manchmal ist der beste Rat, keinen Prozess zu führen."
      },
      {
        "title": "Beständigkeit",
        "text": "Derselbe Maßstab an allen Arbeitsstätten eines Mandanten, in jeder Stadt des Landes."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "Jahre Erfahrung"
      },
      {
        "value": "72+",
        "label": "Städte in unserem Allianznetzwerk"
      }
    ]
  },
  "zh": {
    "title": "关于律所",
    "subtitle": "一家由合伙人主导、业务覆盖全国的律所。",
    "historyText1": "Santos & Saucedo 是一家专注于企业劳动法的律师事务所。其团队在为国内外企业提供咨询方面累计拥有超过40年的经验。",
    "historyText2": "本所就风险预防、劳动关系和争议解决提供咨询，并将客户运营中涉及的公司法和移民事务纳入其业务之中。",
    "valuesTitle": "我们的工作方式",
    "values": [
      {
        "title": "预防",
        "text": "我们赶在主管机关之前进行审查。及时的审计比诉讼成本更低，而且往往使诉讼不再必要。"
      },
      {
        "title": "责任",
        "text": "每一项事务都由一位了解客户的合伙人亲自负责，自始至终对工作承担责任。"
      },
      {
        "title": "坦诚",
        "text": "我们直言所见，即使那并非对方所期待的。有时，最好的建议是不打官司。"
      },
      {
        "title": "一致",
        "text": "客户在全国任何城市的每一个工作场所，都适用同一标准。"
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "年经验"
      },
      {
        "value": "72+",
        "label": "合作网络覆盖城市"
      }
    ]
  },
  "ko": {
    "title": "회사 소개",
    "subtitle": "파트너가 이끄는, 전국적 네트워크를 갖춘 로펌",
    "historyText1": "Santos & Saucedo는 기업 노동법을 전문으로 하는 로펌입니다. 소속 팀은 국내외 기업 자문 분야에서 합산 40년 이상의 경험을 보유하고 있습니다.",
    "historyText2": "법인은 위험 예방, 노사 관계 및 분쟁 해결에 관해 자문합니다. 또한 고객의 사업 운영에 관련된 회사법 및 이민 측면도 함께 다룹니다.",
    "valuesTitle": "일하는 방식",
    "values": [
      {
        "title": "예방",
        "text": "당국보다 먼저 검토합니다. 적시에 실시한 감사는 소송보다 비용이 적게 들고, 소송 자체를 불필요하게 만드는 경우가 많습니다."
      },
      {
        "title": "책임",
        "text": "모든 사안은 고객을 잘 아는 파트너가 맡아 처음부터 끝까지 책임집니다."
      },
      {
        "title": "솔직함",
        "text": "기대와 다르더라도 보이는 그대로 말씀드립니다. 때로는 소송하지 않는 것이 최선의 조언입니다."
      },
      {
        "title": "일관성",
        "text": "전국 어느 도시에서든 고객의 모든 사업장에 같은 기준을 적용합니다."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "년의 경험"
      },
      {
        "value": "72+",
        "label": "제휴 네트워크 도시"
      }
    ]
  },
  "ja": {
    "title": "事務所について",
    "subtitle": "パートナーが主導し、全国で業務を展開する法律事務所。",
    "historyText1": "Santos & Saucedoは、企業向け労働法を専門とする法律事務所です。そのチームは、国内外の企業への助言において通算40年以上の経験を有しています。",
    "historyText2": "当事務所は、リスク予防、労使関係、紛争解決について助言を行っています。また、クライアントの事業に関わる会社法および出入国関連の側面もあわせて取り扱っています。",
    "valuesTitle": "私たちの仕事の進め方",
    "values": [
      {
        "title": "予防",
        "text": "当局より先に確認します。適時の監査は訴訟よりも費用がかからず、多くの場合、訴訟そのものを不要にします。"
      },
      {
        "title": "責任",
        "text": "各案件は、クライアントをよく知るパートナーが担当し、最初から最後まで責任を持ちます。"
      },
      {
        "title": "率直さ",
        "text": "期待されている答えでなくても、見えたことをそのままお伝えします。訴訟をしないことが最善の助言である場合もあります。"
      },
      {
        "title": "一貫性",
        "text": "国内のどの都市にあっても、クライアントのすべての事業所で同じ基準を適用します。"
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "年の経験"
      },
      {
        "value": "72+",
        "label": "提携ネットワークの都市"
      }
    ]
  },
  "ar": {
    "title": "عن الشركة",
    "subtitle": "مكتب يقوده الشركاء ويمتد نشاطه على مستوى البلاد.",
    "historyText1": "Santos & Saucedo مكتب محاماة متخصص في قانون العمل للشركات. ويجمع فريقه أكثر من 40 عامًا من الخبرة في تقديم المشورة للشركات المحلية والدولية.",
    "historyText2": "يقدم المكتب المشورة في الوقاية من المخاطر وعلاقات العمل وتسوية النزاعات. كما تشمل ممارسته الجوانب المؤسسية والمتعلقة بالهجرة التي تتصل بعمليات عملائه.",
    "valuesTitle": "كيف نعمل",
    "values": [
      {
        "title": "الوقاية",
        "text": "نراجع قبل أن تفعل السلطات ذلك. فالتدقيق في الوقت المناسب أقل كلفة من الدعوى القضائية، وكثيرًا ما يجعلها غير ضرورية."
      },
      {
        "title": "المسؤولية",
        "text": "يتولى كل قضية شريك يعرف العميل ويتحمل مسؤولية العمل من بدايته إلى نهايته."
      },
      {
        "title": "الصراحة",
        "text": "نقول ما نراه، حتى وإن لم يكن ما يُنتظر. وأحيانًا تكون أفضل نصيحة هي عدم اللجوء إلى التقاضي."
      },
      {
        "title": "الاتساق",
        "text": "المعيار نفسه في جميع مراكز عمل العميل، في أي مدينة من مدن البلاد."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "سنوات من الخبرة"
      },
      {
        "value": "72+",
        "label": "مدينة في شبكة تحالفاتنا"
      }
    ]
  },
  "ru": {
    "title": "О фирме",
    "subtitle": "Партнёрская фирма с общенациональным охватом.",
    "historyText1": "Santos & Saucedo — фирма, специализирующаяся на трудовом праве для бизнеса. Её команда объединяет более 40 лет опыта консультирования национальных и международных компаний.",
    "historyText2": "Фирма консультирует по вопросам предотвращения рисков, трудовых отношений и разрешения споров. Её практика также охватывает корпоративные и миграционные аспекты деятельности клиентов.",
    "valuesTitle": "Как мы работаем",
    "values": [
      {
        "title": "Профилактика",
        "text": "Мы проводим проверку раньше, чем это сделают органы власти. Своевременный аудит обходится дешевле судебного разбирательства и часто делает его ненужным."
      },
      {
        "title": "Ответственность",
        "text": "Каждое дело ведёт партнёр, который знает клиента и отвечает за работу от начала до конца."
      },
      {
        "title": "Прямота",
        "text": "Мы говорим то, что видим, даже если этого не ждут. Иногда лучший совет — не судиться."
      },
      {
        "title": "Последовательность",
        "text": "Единый подход на всех предприятиях клиента, в любом городе страны."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "Лет опыта"
      },
      {
        "value": "72+",
        "label": "Городов в нашей партнёрской сети"
      }
    ]
  },
  "fr": {
    "title": "Le cabinet",
    "subtitle": "Un cabinet dirigé par ses associés, à portée nationale.",
    "historyText1": "Santos & Saucedo est un cabinet spécialisé en droit du travail pour les entreprises. Son équipe réunit plus de 40 ans d’expérience dans le conseil aux entreprises nationales et internationales.",
    "historyText2": "Le cabinet intervient en prévention des risques, relations de travail et règlement des différends. Sa pratique intègre également les aspects sociétaires et migratoires liés à l’activité de ses clients.",
    "valuesTitle": "Notre façon de travailler",
    "values": [
      {
        "title": "Prévention",
        "text": "Nous examinons avant que l’autorité ne le fasse. Un audit réalisé à temps coûte moins cher qu’un procès et le rend souvent inutile."
      },
      {
        "title": "Responsabilité",
        "text": "Chaque dossier est suivi par un associé qui connaît le client et répond du travail du début à la fin."
      },
      {
        "title": "Franchise",
        "text": "Nous disons ce que nous voyons, même si ce n’est pas ce que l’on attend. Parfois, le meilleur conseil est de ne pas aller en justice."
      },
      {
        "title": "Cohérence",
        "text": "Le même critère dans tous les établissements d’un client, dans toutes les villes du pays."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "Années d'expérience"
      },
      {
        "value": "72+",
        "label": "Villes de notre réseau d’alliances"
      }
    ]
  },
  "it": {
    "title": "Chi siamo",
    "subtitle": "Uno studio guidato dai soci, con portata nazionale.",
    "historyText1": "Santos & Saucedo è uno studio specializzato in diritto del lavoro per le imprese. Il suo team riunisce oltre 40 anni di esperienza nella consulenza a società nazionali e internazionali.",
    "historyText2": "Lo studio assiste in materia di prevenzione dei rischi, rapporti di lavoro e risoluzione delle controversie. La sua attività integra inoltre gli aspetti societari e migratori che interessano l’operatività dei clienti.",
    "valuesTitle": "Come lavoriamo",
    "values": [
      {
        "title": "Prevenzione",
        "text": "Verifichiamo prima che lo faccia l’autorità. Un audit tempestivo costa meno di una causa e spesso la rende superflua."
      },
      {
        "title": "Responsabilità",
        "text": "Ogni pratica è seguita da un socio che conosce il cliente e risponde del lavoro dall’inizio alla fine."
      },
      {
        "title": "Franchezza",
        "text": "Diciamo ciò che vediamo, anche quando non è ciò che ci si aspetta. A volte il miglior consiglio è non fare causa."
      },
      {
        "title": "Coerenza",
        "text": "Lo stesso criterio in tutte le sedi di lavoro di un cliente, in qualsiasi città del Paese."
      }
    ],
    "stats": [
      {
        "value": "40+",
        "label": "Anni di esperienza"
      },
      {
        "value": "72+",
        "label": "Città della nostra rete di alleanze"
      }
    ]
  }
};

  const editableContent = useCmsContent("about", content);
  const baseT = editableContent[language] || editableContent.en;
  const cmsChrome = useCmsContent("chrome", chrome26);
  const nav = cmsChrome[language].nav;
  const t = { ...baseT, title: nav[0].label };

  return (
    <div className="ss26 min-h-[100dvh] bg-background" data-testid="page-about">
      <SEOHead page="about" language={language} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
        <section className="editorial-page-hero ss-principal-page-hero" data-testid="section-about-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <HeroKicker page="about" testId="text-about-kicker" />
              <h1 className="ss-display mb-5 text-[clamp(3rem,7vw,6rem)]" data-testid="text-about-title">
                <Lineas text={t.title} />
              </h1>
              <p className="ss-lead max-w-2xl" data-testid="text-about-subtitle">
                {t.subtitle}
              </p>
            </div>
          </div>
        </section>

        <div className="ss-about" data-surface="light">
          <div className="ss-container">
            <section className="ss-about-intro" data-testid="section-history">
              <div className="ss-about-copy">
                <p className="ss-lead" data-testid="text-about-lead">
                  {keepFirmName(t.historyText1)}
                </p>
                <p className="ss-prose text-ss-tinta">
                  {t.historyText2}
                </p>
                <dl className="ss-about-stats" data-testid="section-stats">
                  {t.stats.map((stat, index) => (
                    <div key={index} className="ss-about-stat" data-testid={`stat-${index}`}>
                      <dt className="ss-label text-ss-medio">{stat.label}</dt>
                      <dd className="ss-figure">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <section className="ss-about-values" aria-labelledby="about-values-title" data-testid="section-values">
              <div className="ss-about-values-heading">
                <h2 id="about-values-title" className="ss-h2"><Lineas text={t.valuesTitle} /></h2>
              </div>
              {/* Los cuatro principios como artículos numerados: numeral grande en la romana, filete
                  que se dibuja y texto que sube, escalonados por columna */}
              <ol className="ss-about-values-grid">
                {t.values.map((value, index) => (
                  <li
                    key={index}
                    className="ss-about-article"
                    data-reveal=""
                    style={index % 2 ? ({ "--reveal-delay": "0.12s" } as CSSProperties) : undefined}
                    data-testid={`card-value-${index}`}
                  >
                    <span aria-hidden="true" data-trazo="" className="ss-about-article-rule" />
                    <span aria-hidden="true" className="ss-about-article-num">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="ss-h3">{value.title}</h3>
                    <p>{value.text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <div role="group" className="ss-about-gallery" aria-label={officeNameFor(language)} data-testid="gallery-about-office">
              {/* La pieza grande es el tríptico de la sala de juntas, el cuadro emblemático de la
                  firma (petición del cliente, 24-10-2026: la recepción no debe ser la protagonista).
                  Mismo hueco y proporción que tenía la recepción; la recepción pasa a un hueco chico. */}
              <figure className="ss-about-gallery-reception ss-about-gallery-feature" data-curtain="" data-testid="figure-about-reception">
                <OfficePhotography photo="arteColor" sizes="(min-width: 1464px) 1320px, 100vw" />
              </figure>
              <figure data-curtain="">
                <OfficePhotography photo="oficinaPrivada" sizes="(min-width: 1464px) 648px, (min-width: 421px) 44vw, 90vw" />
              </figure>
              <figure data-curtain="" style={{ "--reveal-delay": "0.12s" } as CSSProperties}>
                <img
                  src={photos.recepcionBanda.url}
                  srcSet={photos.recepcionBanda.smallUrl && photos.recepcionBanda.smallUrl !== photos.recepcionBanda.url ? `${photos.recepcionBanda.smallUrl} 761w, ${photos.recepcionBanda.url} 1522w` : undefined}
                  sizes="(min-width: 1464px) 648px, (min-width: 421px) 44vw, 90vw"
                  alt={keepFirmName(receptionAlt[language] ?? receptionAlt.en)}
                  loading="lazy"
                  decoding="async"
                  width={1522}
                  height={694}
                  className="ss-photo block h-auto w-full"
                  data-testid="img-about-reception"
                />
              </figure>
            </div>

            <nav aria-label={t.title} className="ss-about-related" data-testid="nav-about-related">
                <span data-testid="button-view-team">
                  <TextLink href="/team">{nav[2].label}</TextLink>
                </span>
                <span data-testid="button-view-practices">
                  <TextLink href="/practice-groups">{nav[1].label}</TextLink>
                </span>
                <span data-testid="link-view-news">
                  <TextLink href="/news">{nav[3].label}</TextLink>
                </span>
                <span data-testid="link-about-offices">
                  <TextLink href="/offices">{officeNameFor(language)}</TextLink>
                </span>
              </nav>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
