import { useCmsContent } from "@/hooks/useCmsContent";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";
import { Eyebrow, NumberedCard } from "@/components/editorial";
import { SplitSection, TextLink } from "@/components/home26/primitives";
import { chrome26 } from "@/components/home26/chrome26";
import { keepFirmName } from "@/lib/firmName";
import { useOfficeLabel } from "@/lib/officeLabel";
import type { LanguageCode } from "@shared/schema";
// Fotos de la oficina a todo el ancho de la ventana (PhotoBand): la recepción después de la
// introducción y la sala de espera ante la sala de juntas al final, antes del pie
import { PhotoBand } from "@/components/home26/PhotoBand";

// Cifras de /about (junta del 16-10-2026): "+40" años de experiencia acumulada de los socios
// (la firma es de 2009) y "+72" ciudades, de "presencia en más de 72 ciudades". Fuera el conteo
// de integrantes, el número de prácticas y "1 oficina".

export default function About() {
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
    "historyText1": "Santos & Saucedo is a firm specialized in labor law for companies. Its partners have more than 40 years of combined experience advising national and international companies.",
    "historyText2": "A company’s decisions about its personnel are rarely only a labor matter: they affect the corporation, its contracts with third parties and, increasingly, people who come from other countries. Out of respect for the confidentiality of its clients’ matters, the firm does not publish their names.",
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
        "value": "+40",
        "label": "Years of combined experience"
      },
      {
        "value": "+72",
        "label": "Cities across Mexico"
      }
    ]
  },
  "es": {
    "title": "Nuestra firma",
    "subtitle": "Una firma de socios con alcance nacional.",
    "historyText1": "Santos & Saucedo es una firma especializada en derecho laboral para empresas. Sus socios suman más de 40 años de experiencia asesorando a empresas nacionales e internacionales.",
    "historyText2": "Las decisiones de una empresa sobre su personal rara vez son solo laborales: tocan a la sociedad, a los contratos con terceros y, cada vez más, a personas que llegan de otros países. Por respeto a la confidencialidad de sus asuntos, la firma no publica los nombres de sus clientes.",
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
        "value": "+40",
        "label": "Años de experiencia acumulada"
      },
      {
        "value": "+72",
        "label": "Presencia en ciudades de México"
      }
    ]
  },
  "de": {
    "title": "Über die Kanzlei",
    "subtitle": "Arbeitsrecht für Unternehmen, mit mehr als 40 Jahren gemeinsamer Erfahrung der Partner",
    "historyText1": "Santos & Saucedo ist eine auf Arbeitsrecht für Unternehmen spezialisierte Kanzlei. Ihre Partner verfügen zusammen über mehr als 40 Jahre Erfahrung in der Beratung nationaler und internationaler Unternehmen. Von San Pedro Garza García, Nuevo León aus beraten wir die Geschäftsführung, die Personalabteilung und die internen Rechtsteams unserer Mandanten.",
    "historyText2": "Die Entscheidungen eines Unternehmens über sein Personal sind selten rein arbeitsrechtlich: Sie berühren die Gesellschaft, die Verträge mit Dritten und zunehmend Menschen, die aus anderen Ländern kommen. Aus Rücksicht auf die Vertraulichkeit ihrer Angelegenheiten veröffentlicht die Kanzlei die Namen ihrer Mandanten nicht.",
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
        "value": "+40",
        "label": "Jahre gemeinsame Erfahrung"
      },
      {
        "value": "+72",
        "label": "Städte in Mexiko"
      }
    ]
  },
  "zh": {
    "title": "关于律所",
    "subtitle": "企业劳动法：合伙人累计超过40年的经验",
    "historyText1": "Santos & Saucedo 是一家专注于企业劳动法的律师事务所，其合伙人累计拥有超过40年为国内外企业提供咨询的经验。我们立足于新莱昂州圣佩德罗-加尔萨-加西亚，为客户的管理层、人力资源部门和内部法务团队提供咨询。",
    "historyText2": "企业关于员工的决定很少只是劳动问题：它们涉及公司本身、与第三方的合同，也越来越多地涉及来自其他国家的人员。出于对客户事务保密的尊重，本所不公开客户名称。",
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
        "value": "+40",
        "label": "年累计经验"
      },
      {
        "value": "+72",
        "label": "墨西哥城市"
      }
    ]
  },
  "ko": {
    "title": "회사 소개",
    "subtitle": "기업 노동법, 파트너 합산 40년 이상의 경험",
    "historyText1": "Santos & Saucedo는 기업 노동법을 전문으로 하는 로펌입니다. 파트너들은 국내외 기업 자문 분야에서 합산 40년 이상의 경험을 갖추고 있습니다. 누에보레온주 산페드로 가르사 가르시아에서 고객사의 경영진, 인사부서 및 사내 법무팀을 자문합니다.",
    "historyText2": "인력에 관한 기업의 결정은 노동 문제에 그치는 경우가 드뭅니다. 회사 자체와 제3자와의 계약, 그리고 점점 더 다른 나라에서 오는 사람들과도 관련됩니다. 고객 사안의 기밀을 존중하여 법인은 고객의 이름을 공개하지 않습니다.",
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
        "value": "+40",
        "label": "년 합산 경험"
      },
      {
        "value": "+72",
        "label": "멕시코 내 도시"
      }
    ]
  },
  "ja": {
    "title": "事務所について",
    "subtitle": "企業労働法、パートナーの通算40年以上の経験",
    "historyText1": "Santos & Saucedoは企業の労働法に特化した法律事務所です。パートナーは国内外の企業への助言において通算40年以上の経験を有しています。ヌエボ・レオン州サン・ペドロ・ガルサ・ガルシアを拠点に、クライアントの経営陣、人事部門、社内法務チームに助言を提供しています。",
    "historyText2": "企業の人事に関する決定が労働の問題だけで終わることはまれです。会社そのもの、第三者との契約、そしてますます多くの場合、海外から来る人々にも関わります。クライアントの案件の秘密を尊重し、当事務所はクライアント名を公表していません。",
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
        "value": "+40",
        "label": "年の通算経験"
      },
      {
        "value": "+72",
        "label": "メキシコの都市"
      }
    ]
  },
  "ar": {
    "title": "عن الشركة",
    "subtitle": "قانون العمل للشركات، بخبرة متراكمة لشركائنا تزيد على 40 عامًا",
    "historyText1": "Santos & Saucedo مكتب محاماة متخصص في قانون العمل للشركات، ويجمع شركاؤه خبرة تزيد على 40 عامًا في تقديم المشورة للشركات المحلية والدولية. من سان بيدرو غارزا غارسيا، نويفو ليون، نقدم المشورة لإدارة عملائنا وأقسام الموارد البشرية والفرق القانونية الداخلية.",
    "historyText2": "نادرًا ما تكون قرارات الشركة بشأن موظفيها مسألة عمالية فحسب: فهي تمسّ الشركة ذاتها، والعقود مع الغير، وبشكل متزايد أشخاصًا قادمين من بلدان أخرى. واحترامًا لسرية شؤون عملائه، لا ينشر المكتب أسماءهم.",
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
        "value": "+40",
        "label": "عامًا من الخبرة المتراكمة"
      },
      {
        "value": "+72",
        "label": "مدينة في المكسيك"
      }
    ]
  },
  "ru": {
    "title": "О фирме",
    "subtitle": "Трудовое право для компаний: совокупный опыт партнёров — более 40 лет",
    "historyText1": "Santos & Saucedo — фирма, специализирующаяся на трудовом праве для компаний. Совокупный опыт её партнёров в консультировании национальных и международных компаний превышает 40 лет. Из Сан-Педро-Гарса-Гарсия, Нуэво-Леон, мы консультируем руководство, кадровые службы и внутренние юридические команды наших клиентов.",
    "historyText2": "Решения компании о персонале редко касаются только трудового права: они затрагивают корпоративные вопросы, договоры с третьими лицами и всё чаще — людей, приезжающих из других стран. Из уважения к конфиденциальности дел своих клиентов фирма не публикует их имена.",
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
        "value": "+40",
        "label": "Лет совокупного опыта"
      },
      {
        "value": "+72",
        "label": "Городов Мексики"
      }
    ]
  },
  "fr": {
    "title": "Le cabinet",
    "subtitle": "Droit du travail des entreprises : plus de 40 ans d'expérience cumulée de nos associés",
    "historyText1": "Santos & Saucedo est un cabinet spécialisé en droit du travail pour les entreprises. Ses associés cumulent plus de 40 ans d'expérience au service d'entreprises nationales et internationales. Depuis San Pedro Garza García, Nuevo León, nous conseillons la direction, les ressources humaines et les équipes juridiques internes de nos clients.",
    "historyText2": "Les décisions d’une entreprise concernant son personnel relèvent rarement du seul droit du travail : elles touchent la société, les contrats avec des tiers et, de plus en plus, des personnes venues d’autres pays. Par respect pour la confidentialité de leurs dossiers, le cabinet ne publie pas les noms de ses clients.",
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
        "value": "+40",
        "label": "Ans d'expérience cumulée"
      },
      {
        "value": "+72",
        "label": "Villes au Mexique"
      }
    ]
  },
  "it": {
    "title": "Chi siamo",
    "subtitle": "Diritto del lavoro per le imprese: oltre 40 anni di esperienza complessiva dei soci",
    "historyText1": "Santos & Saucedo è uno studio specializzato in diritto del lavoro per le imprese. I suoi soci riuniscono oltre 40 anni di esperienza nella consulenza a imprese nazionali e internazionali. Da San Pedro Garza García, Nuevo León, assistiamo la direzione, le risorse umane e i team legali interni dei nostri clienti.",
    "historyText2": "Le decisioni di un’impresa sul proprio personale raramente riguardano solo il diritto del lavoro: toccano la società, i contratti con terzi e, sempre più spesso, persone che arrivano da altri paesi. Per rispetto della riservatezza delle loro questioni, lo studio non pubblica i nomi dei propri clienti.",
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
        "value": "+40",
        "label": "Anni di esperienza complessiva"
      },
      {
        "value": "+72",
        "label": "Città in Messico"
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
    <div className="min-h-screen bg-background" data-testid="page-about">
      <SEOHead page="about" language={language} />
      <Header />

      {/* El encabezado (con el h1) va dentro de <main>: el salto al contenido no se lo
          salta. El relleno del cuerpo va en un envoltorio propio para que el encabezado
          siga pegado a la cabecera. ss-container: mismo borde izquierdo que logotipo y pie. */}
      <main id="main-content">
        <section className="pt-36 pb-20 editorial-page-hero" data-testid="section-about-hero">
          <div className="ss-container">
            <div className="max-w-3xl">
              <Eyebrow num="01" tone="navy" className="mb-6" />
              <h1 className="mb-5" data-testid="text-about-title">
                {t.title}
              </h1>
              <p data-testid="text-about-subtitle">
                {t.subtitle}
              </p>
            </div>
          </div>
        </section>

        <div className="py-16 lg:py-24">
          <div className="ss-container">
            {/* Rejilla editorial de la portada (SplitSection): desde lg, las cifras en el aside
                (columnas 1–4, en vertical y alineadas arriba con la entrada) y la introducción en
                el cuerpo (desde la 5). En teléfono y tableta, como antes: introducción y debajo
                las dos cifras en dos columnas (order-last solo bajo lg). */}
            <section data-testid="section-history">
              <SplitSection
                asideClassName="order-last mt-4 lg:order-none lg:mt-0"
                aside={
                  /* Cifras sin h2: estilo de cifra de la portada, filetes de 1 px y sin panel */
                  <dl className="grid max-w-[36rem] grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-1" data-testid="section-stats">
                    {t.stats.map((stat, index) => (
                      <div key={index} className="flex flex-col border-t border-ss-rule pt-6" data-testid={`stat-${index}`}>
                        {/* Etiquetas equilibradas (sin huérfanas en teléfono) y, como red, corte de
                            compuestos largos (alemán) dentro de su media columna */}
                        <dt className="ss-label text-ss-medio order-2 mt-3 text-balance hyphens-auto [overflow-wrap:anywhere]">
                          {stat.label}
                        </dt>
                        <dd className="ss-figure order-1">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                }
              >
                {/* El primer párrafo como entrada (.ss-lead) y el segundo en texto */}
                <div className="max-w-[44rem] space-y-6">
                  <p className="ss-lead" data-testid="text-about-lead">
                    {keepFirmName(t.historyText1)}
                  </p>
                  <p className="ss-prose text-ss-tinta text-[19px] md:text-[20px]">
                    {t.historyText2}
                  </p>
                </div>
              </SplitSection>
            </section>
          </div>
        </div>

        {/* La recepción de borde a borde de la ventana (no "como un cuadro", petición del
            cliente): en escritorio la franja del mostrador (recepcion-banda), en teléfono la
            toma completa, que recorta mejor en vertical. Sin marco ni pie. */}
        <PhotoBand
          photo="recepcion"
          position="object-[50%_60%]"
          testId="figure-about-reception"
        />

        <div className="py-16 lg:py-24">
          <div className="ss-container">
            {/* "Cómo trabajamos": el h2 en el aside y los cuatro principios en el cuerpo */}
            <section className="mb-20 lg:mb-24" aria-labelledby="about-values-title" data-testid="section-values">
              <SplitSection
                aside={
                  <h2 id="about-values-title" className="ss-h2">
                    {t.valuesTitle}
                  </h2>
                }
              >
                {/* Principios sin orden: sin numerales, en rejilla de 2 × 2 con filete superior */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {t.values.map((value, index) => (
                    <NumberedCard
                      key={index}
                      index={index}
                      showIndex={false}
                      title={value.title}
                      body={value.text}
                      dataTestid={`card-value-${index}`}
                    />
                  ))}
                </div>
              </SplitSection>
            </section>

            {/* Navegación como enlaces de texto (sin botones): Socios, Prácticas, Monitor y la
                oficina (su nombre en officeLabel), en la columna del cuerpo desde lg (el aside
                vacío no ocupa sitio bajo lg) */}
            <SplitSection asideClassName="hidden lg:block">
              <div className="flex flex-wrap gap-x-10 gap-y-6">
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
              </div>
            </SplitSection>
          </div>
        </div>

        {/* Al final, contra el pie: la sala de espera frente a la sala de juntas */}
        <PhotoBand photo="vestibulo3" height="medium" position="object-[50%_48%]" testId="band-about-lobby" />
      </main>

      <Footer />
    </div>
  );
}
