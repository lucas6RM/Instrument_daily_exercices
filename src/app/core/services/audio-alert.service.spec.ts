import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi, afterEach } from 'vitest';

import { AudioAlertService } from './audio-alert.service';

type MockFn = ReturnType<typeof vi.fn>;

interface MockOscillatorNode {
  type: string;
  frequency: { setValueAtTime: MockFn };
  connect: MockFn;
  start: MockFn;
  stop: MockFn;
}

interface MockGainNode {
  gain: { setValueAtTime: MockFn; exponentialRampToValueAtTime: MockFn };
  connect: MockFn;
}

interface MockAudioContext {
  state: string;
  currentTime: number;
  destination: object;
  createOscillator: MockFn;
  createGain: MockFn;
  resume: MockFn;
}

describe('AudioAlertService', () => {
  let service: AudioAlertService;
  let mockOscillator: MockOscillatorNode;
  let mockGainNode: MockGainNode;
  let mockContext: MockAudioContext;

  function createMockOscillator(): MockOscillatorNode {
    return {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }

  function createMockGainNode(): MockGainNode {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }

  function createMockAudioContext(): MockAudioContext {
    return {
      state: 'running',
      currentTime: 0,
      destination: {},
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      resume: vi.fn(),
    };
  }

  function setupMockAudioContext(): void {
    mockOscillator = createMockOscillator();
    mockGainNode = createMockGainNode();
    mockContext = createMockAudioContext();

    (globalThis as Record<string, unknown>)['AudioContext'] = class {
      constructor() {
        return mockContext as unknown as AudioContext;
      }
    };
  }

  beforeEach(() => {
    setupMockAudioContext();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioAlertService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as Record<string, unknown>)['AudioContext'];
  });

  describe('playBeep', () => {
    it('should create an AudioContext on first call', () => {
      service.playBeep();
      expect(mockContext.createOscillator).toHaveBeenCalled();
    });

    it('should create an oscillator and a gain node', () => {
      service.playBeep();
      expect(mockContext.createOscillator).toHaveBeenCalled();
      expect(mockContext.createGain).toHaveBeenCalled();
    });

    it('should configure the oscillator with default frequency (440Hz)', () => {
      service.playBeep();
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
    });

    it('should configure the oscillator with custom frequency', () => {
      service.playBeep(880);
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(880, 0);
    });

    it('should set oscillator type to sine', () => {
      service.playBeep();
      expect(mockOscillator.type).toBe('sine');
    });

    it('should configure gain with default values', () => {
      service.playBeep();
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0);
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 0.5);
    });

    it('should configure gain with custom duration', () => {
      service.playBeep(440, 1000);
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.001, 1);
    });

    it('should connect oscillator -> gain -> destination', () => {
      service.playBeep();
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockContext.destination);
    });

    it('should start and stop the oscillator with default duration', () => {
      service.playBeep();
      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.5);
    });

    it('should start and stop the oscillator with custom duration', () => {
      service.playBeep(440, 1000);
      expect(mockOscillator.start).toHaveBeenCalledWith(0);
      expect(mockOscillator.stop).toHaveBeenCalledWith(1);
    });

    it('should reuse the same AudioContext on subsequent calls', () => {
      service.playBeep();
      service.playBeep();
      expect(mockContext.createOscillator).toHaveBeenCalledTimes(2);
    });

    it('should resume a suspended AudioContext', () => {
      mockContext.state = 'suspended';
      service.playBeep();
      expect(mockContext.resume).toHaveBeenCalled();
    });

    it('should not throw when Web Audio API is unavailable', () => {
      (globalThis as Record<string, unknown>)['AudioContext'] = undefined;
      expect(() => service.playBeep()).not.toThrow();
    });
  });
});
