import { db } from '../../db';
import { news } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { BaseAgent } from '../core/BaseAgent';
import type { AgentConfig, AgentResult, ExecutionContext } from '../core/types';

type Finding = {
  code: 'credential' | 'pii' | 'prompt_injection' | 'external_url' | 'confidentiality';
  severity: 'low' | 'medium' | 'high';
  field: string;
  message: string;
};

const CONFIG: AgentConfig = {
  agentType: 'editorial_security_auditor',
  name: 'Editorial Security Auditor',
  description: 'Scans editorial inputs for secrets, personal data and unsafe instructions without changing records.',
  systemPrompt: 'Run deterministic security checks only. Never reproduce sensitive values in output.',
  model: 'deterministic',
  temperature: 0,
  maxTokens: 0,
  skills: ['secret_detection', 'pii_detection', 'prompt_injection_detection'],
  enabled: true,
  concurrency: 2,
  retryPolicy: { maxRetries: 1, backoffMs: 500, backoffMultiplier: 2 },
};

const SECRET = /(?:-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:sk|rk)-[a-z0-9_-]{20,}\b|\b(?:bearer|authorization)\s*[:=]\s*[^\s]{20,})/i;
const EMAIL = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i;
const PHONE = /(?:\+?52[\s.-]*)?(?:\(?\d{2,3}\)?[\s.-]*)?\d{3,4}[\s.-]\d{4}/;
const GOVERNMENT_ID = /\b[A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM][A-Z]{5}[A-Z0-9]\d\b/i;
const INJECTION = /(?:ignore\s+(?:(?:all|the)\s+)?(?:previous|above)\s+instructions|reveal\s+your\s+(?:prompt|system)|act\s+as\s+another|omite\s+las\s+instrucciones|ignora\s+las\s+instrucciones)/i;
const CONFIDENTIAL = /(?:secreto profesional|attorney[- ]client privileged|privileged and confidential|estrictamente confidencial|uso interno exclusivo)/i;

function scanText(field: string, value: string): Finding[] {
  const findings: Finding[] = [];
  if (SECRET.test(value)) findings.push({ code: 'credential', severity: 'high', field, message: 'Se detectó material con apariencia de credencial.' });
  if (GOVERNMENT_ID.test(value)) findings.push({ code: 'pii', severity: 'high', field, message: 'Se detectó un identificador gubernamental.' });
  if (EMAIL.test(value) || PHONE.test(value)) findings.push({ code: 'pii', severity: 'medium', field, message: 'Se detectaron datos de contacto que requieren revisión de clasificación.' });
  if (INJECTION.test(value)) findings.push({ code: 'prompt_injection', severity: 'high', field, message: 'Se detectó texto que intenta modificar las instrucciones del agente.' });
  if (CONFIDENTIAL.test(value)) findings.push({ code: 'confidentiality', severity: 'high', field, message: 'Se detectó una marca de confidencialidad o privilegio legal.' });
  return findings;
}

function scanUrls(field: string, value: string): Finding[] {
  const findings: Finding[] = [];
  for (const raw of value.match(/https?:\/\/[^\s)]+/gi) || []) {
    try {
      const url = new URL(raw);
      if (!['santos-saucedo.replit.app', 'santossaucedo.com', 'www.santossaucedo.com'].includes(url.hostname.toLowerCase())) {
        findings.push({ code: 'external_url', severity: 'low', field, message: 'Se detectó una URL externa que requiere verificación.' });
      }
    } catch {
      findings.push({ code: 'external_url', severity: 'medium', field, message: 'Se detectó una URL con formato inválido.' });
    }
  }
  return findings;
}

function collectStrings(value: unknown, path = '', output: Array<{ field: string; value: string }> = []) {
  if (typeof value === 'string') output.push({ field: path || 'content', value });
  else if (Array.isArray(value)) value.forEach((item, index) => collectStrings(item, `${path}[${index}]`, output));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => collectStrings(item, path ? `${path}.${key}` : key, output));
  return output;
}

export class EditorialSecurityAuditorAgent extends BaseAgent {
  constructor() { super(CONFIG); }

  async execute(_context: ExecutionContext, payload: Record<string, unknown>): Promise<AgentResult> {
    try {
      const articleId = typeof payload.articleId === 'string' ? payload.articleId : undefined;
      const cmsSection = typeof payload.cmsSection === 'string' ? payload.cmsSection : undefined;
      let source: Record<string, unknown> = payload;
      if (articleId) {
        const [article] = await db.select({ titleEs: news.titleEs, title: news.title, excerptEs: news.excerptEs, excerpt: news.excerpt, contentEs: news.contentEs, content: news.content, sourceUrl: news.sourceUrl }).from(news).where(eq(news.id, articleId)).limit(1);
        if (!article) return { success: false, error: 'Article not found' };
        source = article as Record<string, unknown>;
      } else if (cmsSection) {
        const { getCmsSectionSource } = await import('../../cms/cmsTranslationAgent');
        const section = await getCmsSectionSource(cmsSection);
        if (!section) return { success: false, error: 'CMS section not found' };
        source = { section: cmsSection, sourceHash: section.sourceHash, content: section.source as unknown };
      }
      const findings = collectStrings(source).flatMap(({ field, value }) => [...scanText(field, value), ...scanUrls(field, value)]);
      const deduped = Array.from(new Map(findings.map((finding) => [`${finding.code}:${finding.field}`, finding])).values());
      const high = deduped.filter((finding) => finding.severity === 'high').length;
      return { success: true, data: { findings: deduped.slice(0, 100), totalFindings: deduped.length, blocked: high > 0, readOnly: true }, metrics: { totalFindings: deduped.length, highFindings: high } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Security audit failed' };
    }
  }
}

export const editorialSecurityAuditorAgent = new EditorialSecurityAuditorAgent();
