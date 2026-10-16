import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createServer } from "node:http";
process.env.DATABASE_URL ||=
  "postgresql://isolated:isolated@127.0.0.1:1/isolated";
const original = { ...process.env };
const requests: { url: string; body: any; authorized: boolean }[] = [];
const expectedAudio = Buffer.from("ID3-santos-isolated-test");
const server = createServer(async (req, res) => {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = JSON.parse(raw);
  requests.push({
    url: req.url!,
    body,
    authorized: req.headers.authorization === "Bearer isolated-replit-token",
  });
  if (req.url === "/v1/audio/speech") {
    res.writeHead(200, { "Content-Type": "audio/mpeg" });
    res.end(expectedAudio);
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify(
      req.url === "/v1/images/generations"
        ? { created: 1, data: [{ b64_json: "aXNvbGF0ZWQ=" }] }
        : {
            id: "isolated",
            object: "chat.completion",
            created: 1,
            model: "gpt-audio-mini",
            choices: [
              {
                index: 0,
                finish_reason: "stop",
                message: {
                  role: "assistant",
                  content: null,
                  audio: {
                    id: "isolated",
                    data: expectedAudio.toString("base64"),
                    transcript: "Texto público de prueba.",
                    expires_at: 1,
                  },
                },
              },
            ],
          },
    ),
  );
});
await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${(server.address() as any).port}/v1`;
delete process.env.OPENAI_API_KEY;
delete process.env.OPENAI_IMAGE_API_KEY;
process.env.AI_INTEGRATIONS_OPENAI_API_KEY = "isolated-replit-token";
process.env.AI_INTEGRATIONS_OPENAI_BASE_URL = base;
const {
  getOpenAIClient,
  getImageClient,
  hasDedicatedImageClient,
  hasManagedOpenAI,
} = await import("../openai");
const { requestSpeechAudio, speechModel } = await import(
  "../services/speechProvider"
);
after(async () => {
  for (const key of Object.keys(process.env))
    if (!(key in original)) delete process.env[key];
  Object.assign(process.env, original);
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
test("managed image calls stay on the Replit endpoint and use its credential", async () => {
  assert(hasManagedOpenAI());
  assert(hasDedicatedImageClient());
  await getImageClient().images.generate({
    model: "gpt-image-2",
    prompt: "Synthetic QA image",
    size: "1024x1024",
  });
  const request = requests.at(-1)!;
  assert.equal(request.url, "/v1/images/generations");
  assert(request.authorized);
  assert.equal(request.body.model, "gpt-image-2");
});
test("managed audio uses chat audio and decodes its MP3 payload", async () => {
  assert.equal(speechModel(), "gpt-audio-mini");
  const audio = await requestSpeechAudio("Texto público de prueba.", "alloy");
  assert(audio.equals(expectedAudio));
  const request = requests.at(-1)!;
  assert.equal(request.url, "/v1/chat/completions");
  assert(request.authorized);
  assert.equal(request.body.model, "gpt-audio-mini");
  assert.deepEqual(request.body.modalities, ["text", "audio"]);
  assert.equal(request.body.audio.format, "mp3");
  assert.equal(request.body.store, false);
  assert.equal(
    request.body.messages.at(-1).content,
    "Texto público de prueba.",
  );
});
test("direct credential compatibility retains the speech endpoint", async () => {
  delete process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "isolated-direct-token";
  const audio = await requestSpeechAudio(
    "Texto público de prueba.",
    "alloy",
    getOpenAIClient(),
  );
  assert(audio.equals(expectedAudio));
  const request = requests.at(-1)!;
  assert.equal(request.url, "/v1/audio/speech");
  assert.equal(request.body.model, "tts-1");
  assert.equal(request.body.response_format, "mp3");
});
