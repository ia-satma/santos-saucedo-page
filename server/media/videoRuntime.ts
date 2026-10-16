import { constants } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";

export type VideoToolName = "ffmpeg" | "ffprobe";
export type VideoToolSource = "override" | "environment" | "path" | "sibling";

export type VideoToolResolution = {
  path: string | null;
  source: VideoToolSource | null;
};

export type VideoRuntimeResolution = Record<VideoToolName, VideoToolResolution>;

export type ResolveVideoRuntimeOptions = {
  environment?: NodeJS.ProcessEnv;
  ffmpegPath?: string;
  ffprobePath?: string;
};

const VIDEO_TOOL_ENVIRONMENT_KEYS: Record<VideoToolName, "FFMPEG_PATH" | "FFPROBE_PATH"> = {
  ffmpeg: "FFMPEG_PATH",
  ffprobe: "FFPROBE_PATH",
};

async function isExecutable(candidate: string): Promise<boolean> {
  try {
    await access(candidate, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function executableNames(command: string, environment: NodeJS.ProcessEnv): string[] {
  if (process.platform !== "win32" || path.extname(command)) return [command];
  const extensions = String(environment.PATHEXT || ".EXE;.CMD;.BAT;.COM")
    .split(";")
    .filter(Boolean);
  return [command, ...extensions.map((extension) => `${command}${extension.toLowerCase()}`)];
}

async function findExecutable(command: string, environment: NodeJS.ProcessEnv): Promise<string | null> {
  const trimmed = command.trim();
  if (!trimmed) return null;
  const hasDirectory = path.isAbsolute(trimmed)
    || trimmed.includes(path.sep)
    || (path.sep !== "/" && trimmed.includes("/"));
  if (hasDirectory) return await isExecutable(trimmed) ? path.resolve(trimmed) : null;

  const directories = String(environment.PATH || "").split(path.delimiter).filter(Boolean);
  for (const directory of directories) {
    for (const name of executableNames(trimmed, environment)) {
      const candidate = path.resolve(directory, name);
      if (await isExecutable(candidate)) return candidate;
    }
  }
  return null;
}

async function resolveDirectTool(
  tool: VideoToolName,
  override: string | undefined,
  environment: NodeJS.ProcessEnv,
): Promise<VideoToolResolution & { locked: boolean }> {
  const normalizedOverride = override?.trim();
  if (normalizedOverride) {
    return { path: await findExecutable(normalizedOverride, environment), source: "override", locked: true };
  }

  const configured = environment[VIDEO_TOOL_ENVIRONMENT_KEYS[tool]]?.trim();
  if (configured) {
    const configuredPath = await findExecutable(configured, environment);
    if (configuredPath) return { path: configuredPath, source: "environment", locked: false };
  }

  return { path: await findExecutable(tool, environment), source: "path", locked: false };
}

/**
 * Resuelve el par FFmpeg/FFprobe de forma consistente para el arranque, las
 * cargas y la generación de derivados. Los overrides de una llamada son
 * autoritativos para conservar pruebas e invocaciones explícitas fail-closed.
 */
export async function resolveVideoRuntime(
  options: ResolveVideoRuntimeOptions = {},
): Promise<VideoRuntimeResolution> {
  const environment = options.environment ?? process.env;
  const ffmpeg = await resolveDirectTool("ffmpeg", options.ffmpegPath, environment);
  const ffprobe = await resolveDirectTool("ffprobe", options.ffprobePath, environment);

  if (!ffmpeg.path && !ffmpeg.locked && ffprobe.path) {
    const sibling = path.join(path.dirname(ffprobe.path), executableNames("ffmpeg", environment)[0]);
    if (await isExecutable(sibling)) Object.assign(ffmpeg, { path: sibling, source: "sibling" as const });
  }
  if (!ffprobe.path && !ffprobe.locked && ffmpeg.path) {
    const sibling = path.join(path.dirname(ffmpeg.path), executableNames("ffprobe", environment)[0]);
    if (await isExecutable(sibling)) Object.assign(ffprobe, { path: sibling, source: "sibling" as const });
  }

  return {
    ffmpeg: { path: ffmpeg.path, source: ffmpeg.path ? ffmpeg.source : null },
    ffprobe: { path: ffprobe.path, source: ffprobe.path ? ffprobe.source : null },
  };
}
