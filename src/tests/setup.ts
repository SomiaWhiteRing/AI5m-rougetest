import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// 设置全局变量
declare global {
  interface Window {
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
    WebGLRenderingContext: typeof WebGLRenderingContext;
  }
}

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

// 模拟 canvas
const canvasMock = {
  getContext: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(0)
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn()
  }))
};

// 模拟 WebGL 上下文
const webglMock = {
  createShader: vi.fn(),
  createProgram: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  getAttribLocation: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  useProgram: vi.fn(),
  drawArrays: vi.fn()
};

// 模拟 AudioContext
const audioContextMock = {
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1 }
  })),
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  })),
  createBufferSource: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn()
  })),
  destination: {}
};

// 设置测试环境
beforeAll(() => {
  // 模拟 localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // 模拟 canvas
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    value: canvasMock.getContext
  });

  // 模拟 WebGL
  Object.defineProperty(window, 'WebGLRenderingContext', {
    value: webglMock
  });

  // 模拟 AudioContext
  Object.defineProperty(window, 'AudioContext', {
    value: vi.fn(() => audioContextMock)
  });
  Object.defineProperty(window, 'webkitAudioContext', {
    value: vi.fn(() => audioContextMock)
  });

  // 模拟 requestAnimationFrame
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (callback: FrameRequestCallback): number => {
      return setTimeout(() => callback(Date.now()), 16) as unknown as number;
    }
  );

  // 模拟 performance
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now())
    }
  });

  // 模拟 devicePixelRatio
  Object.defineProperty(window, 'devicePixelRatio', {
    value: 1
  });
});

// 清理测试环境
afterEach(() => {
  // 清理 React 组件
  cleanup();

  // 清理 localStorage
  localStorageMock.clear();

  // 清理所有模拟函数
  vi.clearAllMocks();
});

// 恢复所有模拟
afterAll(() => {
  vi.restoreAllMocks();
}); 