import { CAR_IMAGE_TTL_MS, extractImageUrl, getCarImageUrl, parseCarImageQuery, resetCarImageCache } from '../carImage';

const q = { year: '2019', make: 'Honda', model: 'Accord', trim: 'EX-L' };

function mockFetch(impl: (url: string, init?: RequestInit) => Promise<Partial<Response>>) {
  return jest.fn(impl) as unknown as typeof fetch;
}

const okJson = (payload: unknown): Partial<Response> => ({ ok: true, status: 200, json: async () => payload });

describe('getCarImageUrl', () => {
  beforeEach(() => resetCarImageCache());

  it('returns the signed URL on success and sends the key + secret server-side', async () => {
    const fetch = mockFetch(async () => okJson({ data: [{ signed_url: 'https://cdn.carimagesapi.com/honda/accord/2019/side.png' }] }));
    const url = await getCarImageUrl(q, { fetch, now: () => 1000, apiKey: 'ci_test', apiSecret: 'sec_test' });
    expect(url).toBe('https://cdn.carimagesapi.com/honda/accord/2019/side.png');
    expect(fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = (fetch as unknown as jest.Mock).mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://carimagesapi.com/api/v1/signed-urls');
    expect((init.headers as Record<string, string>)['X-Api-Secret']).toBe('sec_test');
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ api_key: 'ci_test', make: 'Honda', model: 'Accord', year: '2019', trim: 'EX-L' });
  });

  it('returns null when the upstream call errors or is not ok', async () => {
    const throwing = mockFetch(async () => {
      throw new Error('network down');
    });
    expect(await getCarImageUrl(q, { fetch: throwing, now: () => 1000, apiKey: 'ci_test' })).toBeNull();

    resetCarImageCache();
    const notOk = mockFetch(async () => ({ ok: false, status: 401, json: async () => ({ error: 'bad key' }) }));
    expect(await getCarImageUrl(q, { fetch: notOk, now: () => 1000, apiKey: 'ci_test' })).toBeNull();
  });

  it('returns null without calling upstream when no key is configured', async () => {
    const fetch = mockFetch(async () => okJson({ url: 'https://x/y.png' }));
    expect(await getCarImageUrl(q, { fetch, now: () => 1000, apiKey: undefined })).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('serves a cache hit for 24h (keyed by year+make+model) and refetches after', async () => {
    let now = 1_000;
    const fetch = mockFetch(async () => okJson({ url: 'https://cdn/a.png' }));
    const deps = { fetch, now: () => now, apiKey: 'ci_test' };
    expect(await getCarImageUrl(q, deps)).toBe('https://cdn/a.png');
    // Same car, different trim / casing → same cache entry.
    expect(await getCarImageUrl({ year: '2019', make: 'honda', model: 'ACCORD' }, deps)).toBe('https://cdn/a.png');
    expect(fetch).toHaveBeenCalledTimes(1);

    now += CAR_IMAGE_TTL_MS + 1;
    expect(await getCarImageUrl(q, deps)).toBe('https://cdn/a.png');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('caches misses too, so a failing upstream is not hammered', async () => {
    const fetch = mockFetch(async () => ({ ok: false, status: 500, json: async () => ({}) }));
    const deps = { fetch, now: () => 5, apiKey: 'ci_test' };
    expect(await getCarImageUrl(q, deps)).toBeNull();
    expect(await getCarImageUrl(q, deps)).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('extractImageUrl', () => {
  it('prefers url-like keys and ignores non-URL strings', () => {
    expect(extractImageUrl({ status: 'ok', result: { image_url: 'https://a/b.png' } })).toBe('https://a/b.png');
    expect(extractImageUrl({ urls: ['https://first.png', 'https://second.png'] })).toBe('https://first.png');
    expect(extractImageUrl({ message: 'not found' })).toBeNull();
  });
});

describe('parseCarImageQuery', () => {
  it('validates the year and required fields', () => {
    expect(parseCarImageQuery({ year: '2019', make: 'Honda', model: 'Accord', trim: 'EX-L' })).toEqual(q);
    expect(parseCarImageQuery({ year: '19', make: 'Honda', model: 'Accord' })).toBeNull();
    expect(parseCarImageQuery({ year: '2019', make: '', model: 'Accord' })).toBeNull();
    expect(parseCarImageQuery({ year: ['2021'], make: 'Toyota', model: 'RAV4' })).toEqual({ year: '2021', make: 'Toyota', model: 'RAV4', trim: undefined });
  });
});
