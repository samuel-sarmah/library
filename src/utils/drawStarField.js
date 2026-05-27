export function drawStarField(canvas) {
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    const ctx = canvas.getContext('2d');
    const rnd = Math.random;

    // Deep space base
    ctx.fillStyle = '#00000e';
    ctx.fillRect(0, 0, w, h);

    // Nebula blobs — subtle colour washes
    const nebulas = [
        { cx: w * 0.15, cy: h * 0.30, r: Math.min(w, h) * 0.55, color: 'rgba(65, 12, 155, 0.09)' },
        { cx: w * 0.82, cy: h * 0.58, r: Math.min(w, h) * 0.48, color: 'rgba(12, 38, 135, 0.07)' },
        { cx: w * 0.50, cy: h * 0.85, r: Math.min(w, h) * 0.42, color: 'rgba(120, 14, 14, 0.08)' },
    ];
    nebulas.forEach(({ cx, cy, r, color }) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    });

    // Layer 1 — small, dim stars
    for (let i = 0; i < 520; i++) {
        ctx.beginPath();
        ctx.arc(rnd() * w, rnd() * h, rnd() * 0.55 + 0.15, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(rnd() * 0.45 + 0.20).toFixed(2)})`;
        ctx.fill();
    }

    // Layer 2 — medium stars
    for (let i = 0; i < 140; i++) {
        ctx.beginPath();
        ctx.arc(rnd() * w, rnd() * h, rnd() * 0.6 + 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${(rnd() * 0.3 + 0.62).toFixed(2)})`;
        ctx.fill();
    }

    // Layer 3 — bright stars with soft glow
    for (let i = 0; i < 28; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        const r = rnd() * 0.7 + 1.1;

        const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 5);
        glow.addColorStop(0, 'rgba(255,255,255,0.28)');
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.96)';
        ctx.fill();
    }

    // Tinted stars — blue, warm, purple
    const tints = ['rgba(175,210,255,', 'rgba(255,232,160,', 'rgba(205,175,255,'];
    for (let i = 0; i < 22; i++) {
        ctx.beginPath();
        ctx.arc(rnd() * w, rnd() * h, rnd() * 0.75 + 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `${tints[i % 3]}${(rnd() * 0.3 + 0.65).toFixed(2)})`;
        ctx.fill();
    }
}
