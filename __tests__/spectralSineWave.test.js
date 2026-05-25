/**
 * Tests for Spectral Sine Wave Module
 */
import { drawSpectralSineWave } from "../src/effects/spectralSineWave.js";
import { jest } from "@jest/globals";

describe("Spectral Sine Wave", () => {
  let canvas;
  let ctx;
  let mockClearRect;
  let mockSave;
  let mockRestore;
  let mockCreateLinearGradient;
  let mockBeginPath;
  let mockMoveTo;
  let mockLineTo;
  let mockStroke;
  let mockGetContext;
  let mockRequestAnimationFrame;

  beforeEach(() => {
    // Create mock functions
    mockClearRect = jest.fn();
    mockSave = jest.fn();
    mockRestore = jest.fn();
    mockCreateLinearGradient = jest.fn(() => ({
      addColorStop: jest.fn(),
    }));
    mockBeginPath = jest.fn();
    mockMoveTo = jest.fn();
    mockLineTo = jest.fn();
    mockStroke = jest.fn();
    mockGetContext = jest.fn();
    mockRequestAnimationFrame = jest.fn();

    // Create mock canvas element
    canvas = document.createElement("canvas");
    canvas.id = "spectralSineWaveBg";
    canvas.width = 800;
    canvas.height = 600;

    // Mock canvas context
    ctx = {
      clearRect: mockClearRect,
      save: mockSave,
      restore: mockRestore,
      createLinearGradient: mockCreateLinearGradient,
      beginPath: mockBeginPath,
      moveTo: mockMoveTo,
      lineTo: mockLineTo,
      stroke: mockStroke,
      globalAlpha: 1,
      lineWidth: 1,
      strokeStyle: "",
      shadowColor: "",
      shadowBlur: 0,
    };

    mockGetContext.mockReturnValue(ctx);
    canvas.getContext = mockGetContext;
    document.body.appendChild(canvas);

    // Mock requestAnimationFrame
    global.requestAnimationFrame = mockRequestAnimationFrame;
  });

  afterEach(() => {
    if (canvas.parentNode) {
      document.body.removeChild(canvas);
    }
  });

  test("should export drawSpectralSineWave function", () => {
    expect(typeof drawSpectralSineWave).toBe("function");
  });

  test("should return early if canvas does not exist", () => {
    if (canvas.parentNode) {
      document.body.removeChild(canvas);
    }
    drawSpectralSineWave();
    expect(mockClearRect).not.toHaveBeenCalled();
  });

  test("should initialize canvas context when canvas exists", () => {
    drawSpectralSineWave();
    expect(mockGetContext).toHaveBeenCalledWith("2d");
  });

  test("should set canvas dimensions to window size", () => {
    global.innerWidth = 1920;
    global.innerHeight = 1080;
    drawSpectralSineWave();
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
  });

  test("should clear canvas before drawing", () => {
    drawSpectralSineWave();
    expect(mockClearRect).toHaveBeenCalled();
  });

  test("should create linear gradients for spectral lines", () => {
    drawSpectralSineWave();
    expect(mockCreateLinearGradient).toHaveBeenCalled();
  });

  test("should draw three spectral lines", () => {
    drawSpectralSineWave();
    // beginPath should be called multiple times (for each line segment)
    expect(mockBeginPath).toHaveBeenCalled();
    expect(mockStroke).toHaveBeenCalled();
  });

  test("should request next animation frame", () => {
    drawSpectralSineWave();
    expect(mockRequestAnimationFrame).toHaveBeenCalledWith(
      drawSpectralSineWave
    );
  });

  test("should set canvas context properties", () => {
    drawSpectralSineWave();
    expect(mockSave).toHaveBeenCalled();
    expect(mockRestore).toHaveBeenCalled();
  });
});
