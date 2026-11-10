import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import type { ExecutionContext } from '../agents/core/types';

process.env.DATABASE_URL ||= 'postgresql://isolated:isolated@127.0.0.1:1/isolated';
const [{ PresentationGeneratorAgent }, { presentationGenerator }] = await Promise.all([
  import('../agents/specialized/PresentationGeneratorAgent'),
  import('../services/PresentationGenerator'),
]);
const context: ExecutionContext = {
  agentType: 'presentation_generator', jobId: 'isolated-count', startTime: new Date(), metadata: {},
};
function outline(count: number) {
  return JSON.stringify({
    title: 'Contenido solicitado',
    slides: Array.from({ length: count }, (_, index) => ({
      layout: 'bullets', title: `Tema ${index + 1}`, bullets: [`Detalle ${index + 1}`],
    })),
  });
}

test('eight and twenty content slides retain their exact count plus bookends', async () => {
  for (const slideCount of [8, 20]) {
    for (const includeIntroSlide of [false, true]) {
      const agent = new PresentationGeneratorAgent();
      const llm = mock.method(agent as unknown as { callLLM: (...args: unknown[]) => Promise<string> }, 'callLLM', async () => outline(slideCount));
      const renderer = mock.method(presentationGenerator, 'renderAndSave', async (model, options) => {
        assert.equal(model.slides.length, slideCount + 1);
        assert.equal(model.slides.filter((slide) => slide.layout !== 'closing').length, slideCount);
        assert.equal(model.slides.at(-1)?.layout, 'closing');
        assert.equal(options.includeIntroSlide, includeIntroSlide);
        assert.equal(options.engine, 'openai+native');
        return { success: true, presentation: { slideCount: model.slides.length + Number(includeIntroSlide) } } as never;
      });
      try {
        const result = await agent.execute(context, {
          topic: 'Preparación de documentación empresarial', slideCount, includeIntroSlide, visuals: false,
        });
        assert.equal(result.success, true);
        assert.equal(llm.mock.callCount(), 1);
        assert.equal(renderer.mock.callCount(), 1);
        assert.match(JSON.stringify(llm.mock.calls[0].arguments), new RegExp(`EXACTAMENTE ${slideCount}`));
        assert.equal((result.data as { usedFallback: boolean }).usedFallback, false);
      } finally {
        renderer.mock.restore();
        llm.mock.restore();
      }
    }
  }
});

test('invalid JSON and an incorrect count are repaired by AI before persistence', async () => {
  for (const invalid of ['not-json', outline(2)]) {
    const agent = new PresentationGeneratorAgent();
    let calls = 0;
    const llm = mock.method(agent as unknown as { callLLM: (...args: unknown[]) => Promise<string> }, 'callLLM', async () => ++calls === 1 ? invalid : outline(8));
    const renderer = mock.method(presentationGenerator, 'renderAndSave', async (model) => {
      assert.equal(model.slides.length, 9);
      return { success: true } as never;
    });
    try {
      const result = await agent.execute(context, { topic: 'Documentación empresarial', slideCount: 8, visuals: false });
      assert.equal(result.success, true);
      assert.equal(llm.mock.callCount(), 2);
      assert.equal(renderer.mock.callCount(), 1);
      assert.match(JSON.stringify(llm.mock.calls[1].arguments), /respuesta anterior no cumple/);
    } finally {
      renderer.mock.restore();
      llm.mock.restore();
    }
  }
});

test('a failed repair or timeout cannot publish a successful local outline', async () => {
  for (const providerError of [false, true]) {
    const agent = new PresentationGeneratorAgent();
    const llm = mock.method(agent as unknown as { callLLM: (...args: unknown[]) => Promise<string> }, 'callLLM', async () => {
      if (providerError) throw new Error('simulated provider timeout');
      return outline(2);
    });
    const renderer = mock.method(presentationGenerator, 'renderAndSave', async () => { throw new Error('unexpected render'); });
    try {
      const result = await agent.execute(context, { topic: 'Documentación empresarial', slideCount: 8 });
      assert.equal(result.success, false);
      assert.equal(renderer.mock.callCount(), 0);
      assert.equal(llm.mock.callCount(), providerError ? 1 : 2);
    } finally {
      renderer.mock.restore();
      llm.mock.restore();
    }
  }
});

test('protected source and oversized source fail without creating files', async () => {
  const agent = new PresentationGeneratorAgent();
  const llm = mock.method(agent as unknown as { callLLM: (...args: unknown[]) => Promise<string> }, 'callLLM', async () => { throw new Error('unexpected provider'); });
  const renderer = mock.method(presentationGenerator, 'renderAndSave', async () => { throw new Error('unexpected render'); });
  try {
    const denied = await agent.execute(context, { topic: 'Material empresarial', dataClassification: 'privileged', slideCount: 8 });
    assert.equal(denied.success, false);
    const excessive = await agent.execute(context, { topic: 'Material empresarial', documentsText: 'a'.repeat(2_000_001), slideCount: 8 });
    assert.equal(excessive.success, false);
    assert.equal(llm.mock.callCount(), 0);
    assert.equal(renderer.mock.callCount(), 0);
  } finally {
    renderer.mock.restore();
    llm.mock.restore();
  }
});

test('a long source reaches the AI prompt without dropping its final material', async () => {
  const agent = new PresentationGeneratorAgent();
  const source = `${'Material general de referencia. '.repeat(1800)}Final del documento a considerar.`;
  const llm = mock.method(agent as unknown as { callLLM: (...args: unknown[]) => Promise<string> }, 'callLLM', async (...args) => {
    assert.match(JSON.stringify(args), /Final del documento a considerar/);
    return outline(8);
  });
  const renderer = mock.method(presentationGenerator, 'renderAndSave', async () => ({ success: true }) as never);
  try {
    const result = await agent.execute(context, { topic: 'Referencia empresarial', documentsText: source, slideCount: 8, visuals: false });
    assert.equal(result.success, true);
    assert.equal(renderer.mock.callCount(), 1);
  } finally {
    renderer.mock.restore();
    llm.mock.restore();
  }
});
