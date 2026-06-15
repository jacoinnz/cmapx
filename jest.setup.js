import "@testing-library/jest-dom";

// jsdom lacks ResizeObserver, which Recharts' ResponsiveContainer needs.
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;
