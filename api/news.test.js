import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockJson = vi.fn();
const mockStatus = vi.fn(() => ({ json: mockJson }));
const mockSetHeader = vi.fn();

function createReq(query) {
    return { query: query || {} };
}

function createRes() {
    return {
        setHeader: mockSetHeader,
        status: mockStatus,
    };
}

async function importHandler() {
    const mod = await import('./news.js');
    return mod.default;
}

beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
});

describe('news API handler', () => {
    it('defaults to limit=20 when no limit is provided', async () => {
        const handler = await importHandler();
        const req = createReq({});
        const res = createRes();
        mockJson.mockResolvedValue({ results: [] });

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: mockJson,
        });

        await handler(req, res);

        const calledUrl = global.fetch.mock.calls[0][0];
        expect(calledUrl).toContain('limit=20');
        expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it('forwards the limit parameter', async () => {
        const handler = await importHandler();
        const req = createReq({ limit: '5' });
        const res = createRes();
        mockJson.mockResolvedValue({ results: [] });

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: mockJson,
        });

        await handler(req, res);

        const calledUrl = global.fetch.mock.calls[0][0];
        expect(calledUrl).toContain('limit=5');
    });

    it('includes launch filter when provided', async () => {
        const handler = await importHandler();
        const req = createReq({ launch: '123', limit: '5' });
        const res = createRes();
        mockJson.mockResolvedValue({ results: [] });

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: mockJson,
        });

        await handler(req, res);

        const calledUrl = global.fetch.mock.calls[0][0];
        expect(calledUrl).toContain('launch=123');
        expect(calledUrl).toContain('limit=5');
    });

    it('does not include launch filter when not provided', async () => {
        const handler = await importHandler();
        const req = createReq({ limit: '10' });
        const res = createRes();
        mockJson.mockResolvedValue({ results: [] });

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: mockJson,
        });

        await handler(req, res);

        const calledUrl = global.fetch.mock.calls[0][0];
        expect(calledUrl).not.toContain('launch');
    });

    it('sets Cache-Control header', async () => {
        const handler = await importHandler();
        const req = createReq({});
        const res = createRes();
        mockJson.mockResolvedValue({ results: [] });

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: mockJson,
        });

        await handler(req, res);

        expect(mockSetHeader).toHaveBeenCalledWith('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    });

    it('proxies the upstream status code', async () => {
        const handler = await importHandler();
        const req = createReq({});
        const res = createRes();
        mockJson.mockResolvedValue({ error: 'Not Found' });

        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            json: mockJson,
        });

        await handler(req, res);

        expect(mockStatus).toHaveBeenCalledWith(404);
    });

    it('returns 504 on timeout (AbortError)', async () => {
        const handler = await importHandler();
        const req = createReq({});
        const res = createRes();
        const mockErrorJson = vi.fn();

        global.fetch = vi.fn().mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));

        await handler(req, res);

        expect(mockStatus).toHaveBeenCalledWith(504);
    });

    it('returns 502 on network error', async () => {
        const handler = await importHandler();
        const req = createReq({});
        const res = createRes();

        global.fetch = vi.fn().mockRejectedValue(new Error('network failure'));

        await handler(req, res);

        expect(mockStatus).toHaveBeenCalledWith(502);
    });
});
