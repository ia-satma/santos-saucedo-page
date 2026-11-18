import { dbPersistence } from '../storage/DatabasePersistence';
import { BaseAgent } from '../core/BaseAgent';
import type { AgentConfig, AgentResult, ExecutionContext } from '../core/types';

const CONFIG: AgentConfig = {
  agentType: 'legal_knowledge_assistant',
  name: 'Legal Knowledge Assistant',
  description: 'Searches only approved internal knowledge documents and returns traceable excerpts.',
  systemPrompt: 'Answer only from approved documents and cite every excerpt. Do not provide uncited legal advice.',
  model: 'deterministic',
  temperature: 0,
  maxTokens: 0,
  skills: ['approved_knowledge_search', 'citations', 'prompt_injection_resistance'],
  enabled: true,
  concurrency: 2,
  retryPolicy: { maxRetries: 1, backoffMs: 500, backoffMultiplier: 2 },
};

function terms(query: string) { return query.toLocaleLowerCase('es-MX').split(/[^a-záéíóúüñ0-9]+/i).filter((term) => term.length >= 3); }

export class LegalKnowledgeAssistantAgent extends BaseAgent {
  constructor() { super(CONFIG); }

  async execute(_context: ExecutionContext, payload: Record<string, unknown>): Promise<AgentResult> {
    const query = typeof payload.query === 'string' ? payload.query.trim() : '';
    if (query.length < 3 || query.length > 4_000) return { success: false, error: 'query must contain between 3 and 4000 characters' };
    const queryTerms = terms(query);
    const documents = await dbPersistence.getAllKnowledge();
    const approved = documents.filter((document) => ['public', 'internal'].includes(document.dataClassification) && Boolean(document.approvedForAiAt));
    const matches = approved.map((document) => {
      const haystack = `${document.title}\n${document.content}`.toLocaleLowerCase('es-MX');
      const score = queryTerms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      return { document, score };
    }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 8);
    const citations = matches.map(({ document, score }) => ({ id: document.id, title: document.title, category: document.category, version: document.updatedAt ? new Date(document.updatedAt).toISOString() : null, score, excerpt: document.content.slice(0, 1_200), citation: `knowledge://${document.id}` }));
    return { success: true, data: { query, responseLanguage: typeof payload.language === 'string' ? payload.language : 'es', citations, answer: citations.length ? 'Consulta los fragmentos aprobados y sus fuentes internas.' : 'No encontré un documento aprobado que responda la consulta.', approvedDocumentsOnly: true, externalSourcesUsed: false }, metrics: { documentsScanned: approved.length, citations: citations.length } };
  }
}

export const legalKnowledgeAssistantAgent = new LegalKnowledgeAssistantAgent();
