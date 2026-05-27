import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawStarField } from './drawStarField';

describe('drawStarField', () => {
    let canvas, ctx;

    beforeEach(() => {
        ctx = {
            fillStyle: '',
            fillRect: vi.fn(),
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
        };
        canvas = { getContext: vi.fn(() => ctx), width: 0, height: 0 };
        vi.stubEnv('', '');
        Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 720, configurable: true });
    });

    it('sets canvas dimensions to window size', () => {
        drawStarField(canvas);
        expect(canvas.width).toBe(1280);
        expect(canvas.height).toBe(720);
    });

    it('requests the 2d context', () => {
        drawStarField(canvas);
        expect(canvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('fills the background rect at full canvas size', () => {
        drawStarField(canvas);
        // First fillRect is the background
        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 1280, 720);
    });

    it('creates radial gradients for nebula blobs', () => {
        drawStarField(canvas);
        expect(ctx.createRadialGradient).toHaveBeenCalled();
        expect(ctx.createRadialGradient.mock.calls.length).toBeGreaterThanOrEqual(3);
    });

    it('draws a large number of star arcs', () => {
        drawStarField(canvas);
        // 520 small + 140 medium + 28 large + 22 tinted = 710+ arc calls
        expect(ctx.arc.mock.calls.length).toBeGreaterThan(600);
    });

    it('renders differently for different window sizes', () => {
        drawStarField(canvas);
        const firstArcCount = ctx.arc.mock.calls.length;

        ctx.arc.mockClear();
        Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });
        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
        const canvas2 = { getContext: vi.fn(() => ctx), width: 0, height: 0 };
        drawStarField(canvas2);

        // Both produce the same total arc count regardless of size
        expect(ctx.arc.mock.calls.length).toBe(firstArcCount);
        expect(canvas2.width).toBe(400);
        expect(canvas2.height).toBe(800);
    });

    it('each gradient has colour stops added', () => {
        const addColorStop = vi.fn();
        ctx.createRadialGradient.mockReturnValue({ addColorStop });
        drawStarField(canvas);
        expect(addColorStop).toHaveBeenCalled();
    });
});
