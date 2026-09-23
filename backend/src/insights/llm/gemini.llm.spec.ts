import type { AnonymousProfile } from './anonymous-profile';
import { GeminiLlm } from './gemini.llm';
import { RuleBasedLlm } from './rule-based.llm';

const PROFILE: AnonymousProfile = {
  ageYears: 54,
  sex: 'F',
  bmi: 32,
  measurements: [{ kind: 'glucose', takenAt: '2026-09-10T12:00:00.000Z', value: 140, secondaryValue: null }],
};

function geminiPayload(text: string) {
  return { candidates: [{ content: { parts: [{ text }] } }] };
}

const originalFetch = global.fetch;

describe('GeminiLlm', () => {
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('traduz a resposta do provedor em insight', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(geminiPayload('{"summary":"resumo","recommendations":["a","b"]}')),
    }) as unknown as typeof fetch;

    const result = await new GeminiLlm(new RuleBasedLlm(), 'chave', 'gemini-2.5-flash').generate(PROFILE);

    expect(result).toEqual({ summary: 'resumo', recommendations: ['a', 'b'], source: 'llm' });
  });

  it('manda a chave no header e nunca na URL', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(geminiPayload('{"summary":"ok","recommendations":[]}')),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await new GeminiLlm(new RuleBasedLlm(), 'chave-secreta', 'gemini-2.5-flash').generate(PROFILE);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain('chave-secreta');
    expect(init.headers['x-goog-api-key']).toBe('chave-secreta');
  });

  it('não envia dado identificável do paciente', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(geminiPayload('{"summary":"ok","recommendations":[]}')),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await new GeminiLlm(new RuleBasedLlm(), 'chave', 'gemini-2.5-flash').generate(PROFILE);

    /** O perfil viaja como string JSON dentro do corpo: desembrulha antes de conferir. */
    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    const sent = JSON.parse(body.contents[0].parts[0].text);

    expect(sent).toEqual(PROFILE);
    expect(Object.keys(sent)).not.toContain('name');
    expect(Object.keys(sent)).not.toContain('patientId');
  });

  it('cai no fallback determinístico quando o provedor falha', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 }) as unknown as typeof fetch;

    const result = await new GeminiLlm(new RuleBasedLlm(), 'chave', 'gemini-2.5-flash').generate(PROFILE);

    expect(result.source).toBe('rules');
    expect(result.summary).toContain('obesidade');
  });

  it('cai no fallback quando a resposta não traz JSON utilizável', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(geminiPayload('desculpe, não posso responder')),
    }) as unknown as typeof fetch;

    const result = await new GeminiLlm(new RuleBasedLlm(), 'chave', 'gemini-2.5-flash').generate(PROFILE);

    expect(result.source).toBe('rules');
  });
});
