/**
 * Tests for State Management Module
 */
import { createState } from "../src/core/state.js";

describe("State Module", () => {
  test("should export createState function", () => {
    expect(typeof createState).toBe("function");
  });

  test("should create initial state object", () => {
    const state = createState();
    expect(state).toBeDefined();
    expect(typeof state).toBe("object");
  });

  test("should initialize pet as null", () => {
    const state = createState();
    expect(state.pet).toBeNull();
  });

  test('should initialize currentStage as "blue"', () => {
    const state = createState();
    expect(state.currentStage).toBe("blue");
  });

  test("should initialize timers as empty object", () => {
    const state = createState();
    expect(state.timers).toEqual({});
    expect(typeof state.timers).toBe("object");
  });

  test("should initialize refs as empty object", () => {
    const state = createState();
    expect(state.refs).toEqual({});
    expect(typeof state.refs).toBe("object");
  });

  test("should initialize flags as empty object", () => {
    const state = createState();
    expect(state.flags).toEqual({});
    expect(typeof state.flags).toBe("object");
  });

  test("should have all required properties", () => {
    const state = createState();
    expect(state).toHaveProperty("pet");
    expect(state).toHaveProperty("currentStage");
    expect(state).toHaveProperty("timers");
    expect(state).toHaveProperty("refs");
    expect(state).toHaveProperty("flags");
  });

  test("should create independent state objects", () => {
    const state1 = createState();
    const state2 = createState();

    state1.currentStage = "red";
    state1.timers.hunger = 100;

    expect(state2.currentStage).toBe("blue");
    expect(state2.timers.hunger).toBeUndefined();
  });

  test("state should be mutable", () => {
    const state = createState();
    state.pet = { name: "TestPet" };
    state.currentStage = "red";
    state.timers.hunger = 50;
    state.refs.canvas = document.createElement("canvas");
    state.flags.paused = true;

    expect(state.pet).toEqual({ name: "TestPet" });
    expect(state.currentStage).toBe("red");
    expect(state.timers.hunger).toBe(50);
    expect(state.refs.canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(state.flags.paused).toBe(true);
  });
});
