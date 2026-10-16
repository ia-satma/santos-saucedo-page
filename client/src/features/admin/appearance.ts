import type { AgentId } from "@shared/agentConstants";

// The same functional colors appear in navigation, shortcuts and agent forms.
// Labels and icons always accompany color, including selected and status states.
export const agentTones: Record<AgentId, string> = {
  content_analyzer: "teal",
  category_agent: "green",
  metadata_linker: "cyan",
  legal_alerts: "amber",
  formatter: "blue",
  polyglot_translator: "cyan",
  seo_optimizer: "green",
  image_suggestion: "orange",
  social_media: "rose",
  newsletter: "blue",
  voice_agent: "rose",
  presentation_generator: "amber",
  content_auditor: "teal",
  website_auditor: "slate",
};

export function agentTone(id: string): string {
  return agentTones[id as AgentId] || "teal";
}

export function adminLinkTone(href: string, fallback = "teal"): string {
  if (href.includes("generated-images")) return "orange";
  if (href.includes("generated-audio") || href.endsWith("/voice")) return "rose";
  if (href.includes("presentations")) return "amber";
  if (href.includes("copies-ai")) return "blue";
  return fallback;
}
