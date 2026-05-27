import '@testing-library/jest-dom';

// Mock canvas 2D context (jsdom does not implement it; guard for Node env)
if (typeof HTMLCanvasElement !== 'undefined') HTMLCanvasElement.prototype.getContext = function () {
    return {
        fillStyle: '',
        fillRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
    };
};
