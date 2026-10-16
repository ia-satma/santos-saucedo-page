import test, { mock } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import type { AgentType, ExecutionContext } from '../agents/core/types';

// Deliberately unreachable. Database, model and file writes are replaced with
// in-memory adapters; these tests never contact a real model or client database.
process.env.DATABASE_URL = 'postgresql://isolated:isolated@127.0.0.1:1/isolated';
const [
  { db }, tables, { storage }, { knowledgeStore },
  { formatterAgent }, { metadataLinkerAgent }, { polyglotTranslatorAgent },
  { seoOptimizerAgent }, { contentAnalyzerAgent }, { categoryAgent },
  { socialMediaAgent }, { legalAlertsAgent }, { newsletterAgent },
] = await Promise.all([
  import('../db'), import('../../shared/schema'), import('../storage'),
  import('../agents/core/AgentKnowledge'),
  import('../agents/specialized/FormatterAgent'),
  import('../agents/specialized/MetadataLinkerAgent'),
  import('../agents/specialized/PolyglotTranslatorAgent'),
  import('../agents/specialized/SEOOptimizerAgent'),
  import('../agents/specialized/ContentAnalyzerAgent'),
  import('../agents/specialized/CategoryAgent'),
  import('../agents/specialized/SocialMediaAgent'),
  import('../agents/specialized/LegalAlertsAgent'),
  import('../agents/specialized/NewsletterAgent'),
]);

const article = {
  id: '11111111-1111-4111-8111-111111111111', slug: 'laboral',
  title: 'Labor update', titleEs: 'Actualización laboral',
  content: 'Employment regulation and implementation for companies. '.repeat(24),
  contentEs: 'Análisis de obligaciones laborales para las empresas. '.repeat(24),
  excerpt: 'Employment update.', excerptEs: 'Actualización de obligaciones.',
  imageUrl: '/media/public/media/editorial.png', published: false,
};
const practices = [{ id: 'practice-labor', slug: 'labor-employment', name: 'Labor', nameEs: 'Laboral' }];
const industries = [{ id: 'industry-manufacturing', slug: 'manufacturing', name: 'Manufacturing', nameEs: 'Manufactura' }];
const members = [{ id: 'lawyer-proof', slug: 'editorial-proof', name: 'Profesional de prueba editorial', isPublic: true }];
type Write = { kind: string; table: unknown; value: any };

function context(agentType: AgentType): ExecutionContext {
  return { jobId: `positive-${agentType}`, agentType, startTime: new Date(), metadata: { testMode: 'isolated' } };
}
function adapters(overrides: { article?: any; cache?: any[]; analysis?: any[] } = {}) {
  const writes: Write[] = [];
  const rows = new Map<unknown, any[]>([
    [tables.news, [overrides.article || article]], [tables.practiceGroups, practices],
    [tables.industryGroups, industries], [tables.teamMembers, members],
    [tables.translationCache, overrides.cache || []], [tables.contentAnalysis, overrides.analysis || []],
  ]);
  const read = mock.method(db, 'select', (() => ({ from: (table: unknown) => {
    assert.ok(rows.has(table), 'Unexpected database read must be explicitly adapted');
    const value = rows.get(table)!;
    return Object.assign(Promise.resolve(value), { where: async () => value });
  } })) as never);
  const update = mock.method(db, 'update', ((table: unknown) => ({ set: (value: unknown) => ({ where: async () => {
    writes.push({ kind: 'update', table, value }); return [];
  } }) })) as never);
  const insert = mock.method(db, 'insert', ((table: unknown) => ({ values: async (value: unknown) => {
    writes.push({ kind: 'insert', table, value }); return [];
  } })) as never);
  return { writes, restore() { read.mock.restore(); update.mock.restore(); insert.mock.restore(); } };
}
function model(agent: unknown, response: unknown) {
  return mock.method(agent as { callLLM: (...args: any[]) => Promise<string> }, 'callLLM',
    async () => typeof response === 'string' ? response : JSON.stringify(response));
}

test('formatter previews ES, preserves EN and only applies to an explicitly authorized draft', async () => {
  const output = { title: 'Obligaciones laborales para empresas', content: '<p>Contenido revisado.</p><script>bad()</script>', excerpt: 'Resumen revisado.' };
  for (const [published, apply, expectedWrites] of [[false, false, 0], [false, true, 1], [true, true, 0]] as const) {
    const data = adapters({ article: { ...article, published } }); const llm = model(formatterAgent, output);
    try {
      const result = await formatterAgent.execute(context('formatter'), { articleId: article.id, applyChanges: apply, language: 'es' });
      assert.equal(result.success, true); assert.equal((result.data as any).changesApplied, expectedWrites === 1);
      assert.equal(data.writes.length, expectedWrites); assert.equal(llm.mock.callCount(), 1);
      if (expectedWrites) {
        assert.ok(data.writes[0].value.contentEs.includes('Contenido revisado'));
        assert.ok(!data.writes[0].value.contentEs.includes('<script'));
        assert.ok(!('content' in data.writes[0].value), 'English content must remain untouched');
      }
    } finally { llm.mock.restore(); data.restore(); }
  }
});

test('metadata linker returns exact known authors and taxonomy, never creates public authorship', async () => {
  const data = adapters(); const llm = model(metadataLinkerAgent, {
    authorPatterns: [members[0].name, 'Profesional', 'Inventado'],
    practiceAreas: ['labor-employment', 'nonexistent'], industries: ['manufacturing', 'nonexistent'],
  });
  try {
    const result = await metadataLinkerAgent.execute(context('metadata_linker'), { articleId: article.id, applyChanges: true });
    assert.equal(result.success, true);
    assert.deepEqual((result.data as any).authorCandidates, [{ id: members[0].id, name: members[0].name }]);
    assert.deepEqual((result.data as any).linkedPracticeGroups, ['Laboral']);
    assert.deepEqual((result.data as any).linkedIndustries, ['Manufactura']);
    assert.equal(data.writes.length, 0);
  } finally { llm.mock.restore(); data.restore(); }
});

test('category matches real taxonomy and applies only a high-confidence draft category in its source language', async () => {
  for (const [confidence, published, apply, expectedWrites] of [[.92,false,false,0],[.92,false,true,1],[.92,true,true,0],[.4,false,true,0]] as const) {
    const data = adapters({ article: { ...article, published } });
    const llm = model(categoryAgent, { primaryCategory: 'Laboral', categorySlug: 'laboral', practiceAreas: ['laboral', 'Inventada'], industrySectors: ['manufacturing'], tags: ['empleo'], confidence, reasoning: 'Clasificación de prueba' });
    try {
      const result = await categoryAgent.execute(context('category_agent'), { articleId: article.id, applyChanges: apply });
      assert.equal(result.success, true); assert.deepEqual((result.data as any).practiceAreas, ['practice-labor']);
      assert.deepEqual((result.data as any).industrySectors, ['industry-manufacturing']);
      assert.equal(data.writes.length, expectedWrites);
      if (expectedWrites) assert.deepEqual(data.writes[0].value, { categoryEs: 'Laboral' });
    } finally { llm.mock.restore(); data.restore(); }
  }
});

test('SEO recomputes score, offers a preview and protects published articles', async () => {
  const output = { optimizedTitle: 'Employment obligations for Mexican companies', optimizedTitleEs: 'Obligaciones laborales para empresas mexicanas', metaDescription: 'An overview of employment obligations and implementation for Mexican companies, with practical considerations for compliance teams.', metaDescriptionEs: 'Análisis de obligaciones laborales para empresas mexicanas y consideraciones de implementación para los equipos de cumplimiento.', seoScore: 99, keywords: ['employment'] };
  for (const [published, apply, expectedWrites] of [[false,false,0],[false,true,1],[true,true,0]] as const) {
    const data = adapters({ article: { ...article, published } }); const llm = model(seoOptimizerAgent, output);
    try {
      const result = await seoOptimizerAgent.execute(context('seo_optimizer'), { articleId: article.id, applyChanges: apply });
      assert.equal(result.success, true); assert.ok((result.data as any).optimizedScore > (result.data as any).currentScore);
      assert.equal(data.writes.length, expectedWrites);
    } finally { llm.mock.restore(); data.restore(); }
  }
});

test('content analyzer persists a validated report and updates an existing report', async () => {
  const output = { seoRecommendations: { keywords: ['laboral'] }, categories: { primary: 'Regulatory Update' }, spellingGrammar: [{ original: 'obligasiones', correction: 'obligaciones', type: 'spelling', explanation: 'Corrección ortográfica.' }], lawyersMentioned: [], legalBranches: { primary: ['Labor & Employment'] }, industries: { primary: 'Manufacturing' }, qualityScore: 84 };
  for (const exists of [false, true]) {
    const data = adapters({ analysis: exists ? [{ id: 'analysis-proof' }] : [] }); const llm = model(contentAnalyzerAgent, output);
    try {
      const result = await contentAnalyzerAgent.execute(context('content_analyzer'), { articleId: article.id });
      assert.equal(result.success, true); assert.equal((result.data as any).qualityScore, 84);
      assert.equal(data.writes.length, 1); assert.equal(data.writes[0].table, tables.contentAnalysis);
      assert.equal(data.writes[0].kind, exists ? 'update' : 'insert');
      assert.equal(data.writes[0].value.issuesCount, 1);
    } finally { llm.mock.restore(); data.restore(); }
  }
});

test('translator handles multi-segment text, valid cache, stale cache and preview without writes', async () => {
  const sourceHash = createHash('sha256').update(JSON.stringify({ title: article.titleEs, excerpt: article.excerptEs, content: article.contentEs })).digest('hex');
  const translated = { title: 'Employment obligations', excerpt: 'Compliance overview.', content: 'Translated legal content.' };
  const scenarios = [
    { source: article, cache: [], calls: 1 },
    { source: article, cache: [{ sourceText: `sha256:${sourceHash}`, translations: translated }], calls: 0 },
    { source: article, cache: [{ sourceText: 'sha256:stale', translations: translated }], calls: 1 },
    { source: { ...article, contentEs: 'Texto laboral completo. '.repeat(500) }, cache: [], calls: 3 },
  ];
  for (const scenario of scenarios) {
    const data = adapters({ article: scenario.source, cache: scenario.cache });
    const glossary = mock.method(knowledgeStore, 'searchDocuments', async () => []);
    const llm = model(polyglotTranslatorAgent, '[[TITLE]]\nEmployment obligations\n[[EXCERPT]]\nCompliance overview.\n[[CONTENT]]\nTranslated legal content.');
    try {
      const result = await polyglotTranslatorAgent.execute(context('polyglot_translator'), { articleId: article.id, targetLanguages: ['en'], applyChanges: false });
      assert.equal(result.success, true); assert.equal(llm.mock.callCount(), scenario.calls);
      assert.ok((result.data as any).translations.en.content.includes('Translated legal content'));
      assert.equal(data.writes.length, 0); assert.equal((result.data as any).changesApplied, false);
    } finally { llm.mock.restore(); glossary.mock.restore(); data.restore(); }
  }
});

test('social agent returns all four chosen channels, enforces text bounds and reuses the article image', async () => {
  const data = adapters(); const llm = model(socialMediaAgent, { posts: Object.fromEntries(['linkedin','twitter','instagram','facebook'].map(platform => [platform, { text: 'Contenido para la red. '.repeat(80), hashtags: ['#Laboral','#Laboral','#Empresas'] }])) });
  try {
    const result = await socialMediaAgent.execute(context('social_media'), { articleId: article.id, platforms: ['linkedin','twitter','instagram','facebook'], language: 'es' });
    assert.equal(result.success, true); const output = result.data as any;
    assert.deepEqual(Object.keys(output.posts), ['linkedin','twitter','instagram','facebook']);
    assert.equal(output.posts.twitter.text.length, 280); assert.deepEqual(output.posts.twitter.hashtags, ['#Laboral','#Empresas']);
    assert.equal(output.imageUrl, article.imageUrl); assert.equal(output.imageGenerated, false); assert.equal(data.writes.length, 0);
  } finally { llm.mock.restore(); data.restore(); }
});

test('legal alert sanitizes both languages, stores an unpublished draft and retains source provenance', async () => {
  const body = '<p>Esta es una fuente sintética de prueba sobre obligaciones laborales para empresas y su implementación.</p><script>bad()</script>';
  const llm = model(legalAlertsAgent, { titleEs: 'Alerta laboral de prueba', title: 'Employment test alert', excerptEs: 'Resumen sintético para probar el flujo editorial.', excerpt: 'Synthetic summary to verify the editorial flow.', contentEs: body, content: body, slug: 'alerta-laboral-prueba' });
  let saved: any; const create = mock.method(storage, 'createNews', async (input) => { saved = input; return { ...input, id: article.id } as never; });
  try {
    const sourceText = 'Fuente sintética para pruebas de generación de alertas laborales, sin información de clientes.';
    const result = await legalAlertsAgent.execute(context('legal_alerts'), { sourceText, dataClassification: 'public', aiUseConfirmed: true });
    assert.equal(result.success, true); assert.equal(saved.published, false); assert.equal(saved.processingStatus, 'ready_for_approval');
    assert.ok(!saved.contentEs.includes('<script')); assert.ok(!saved.content.includes('<script'));
    assert.equal((result.data as any).source.sha256, createHash('sha256').update(sourceText).digest('hex'));
    assert.equal(create.mock.callCount(), 1);
  } finally { create.mock.restore(); llm.mock.restore(); }
});

test('newsletter compiles published news in ES/EN, removes scripts and includes unsubscribe', async () => {
  for (const language of ['es','en']) {
    const get = mock.method(storage, 'getRecentPublishedNews', async () => [{ ...article, published: true }] as never);
    const llm = model(newsletterAgent, { subject: 'Boletín de prueba', preheader: 'Resumen editorial.', html: '<p>Contenido del boletín.</p><script>bad()</script>' });
    try {
      const result = await newsletterAgent.execute(context('newsletter'), { limit: 8, language });
      assert.equal(result.success, true); assert.equal((result.data as any).articleCount, 1);
      assert.equal((result.data as any).language, language); assert.ok(!(result.data as any).html.includes('<script'));
      assert.ok((result.data as any).html.includes('{{unsubscribe_url}}'));
      const prompt = JSON.stringify(llm.mock.calls[0].arguments);
      assert.ok(prompt.includes(language === 'en' ? article.title : article.titleEs));
    } finally { llm.mock.restore(); get.mock.restore(); }
  }
});

test('invalid model output fails safely without writing article or analysis records', async () => {
  for (const [agentType, agent] of [['formatter',formatterAgent],['seo_optimizer',seoOptimizerAgent],['category_agent',categoryAgent],['content_analyzer',contentAnalyzerAgent]] as const) {
    const data = adapters(); const llm = model(agent, '{invalid json');
    try {
      const result = await agent.execute(context(agentType), { articleId: article.id, applyChanges: true });
      assert.equal(result.success, false); assert.equal(data.writes.length, 0);
    } finally { llm.mock.restore(); data.restore(); }
  }
});
